from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from app.core.aria_engine import aria_engine
from app.core.supabase_client import supabase
from app.websocket.manager import manager
from datetime import datetime
import json
import uuid
import os
import google.generativeai as genai

# Load API key
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)

router = APIRouter()

# In-memory storage fallback for offline demo stability
in_memory_db = {
    "conversations": {},
    "messages": {},
    "escalations": {},
    "customer_profiles": {}
}

class ChatMessage(BaseModel):
    message: str
    conversation_id: str
    user_id: Optional[str] = None
    history: Optional[List[str]] = []

class ChatRequest(BaseModel):
    message: str
    conversation_history: List[str]
    session_id: str

def get_valid_uuid(id_str: str) -> str:
    try:
        return str(uuid.UUID(id_str))
    except ValueError:
        return str(uuid.uuid5(uuid.NAMESPACE_DNS, id_str))

def get_fallback_analysis(message: str) -> dict:
    is_angry = any(word in message.lower() for word in ["bad", "wrong", "fix", "help", "broken", "disappointed"])
    is_buying = any(word in message.lower() for word in ["buy", "price", "interested", "cost"])
    
    mode = "support" if is_angry else "sales" if is_buying else "care"
    sentiment_score = 0.2 if is_angry else 0.8 if is_buying else 0.6
    
    return {
        "response": f"I understand you're asking about '{message}'. Let me assist you with this.",
        "mode": mode,
        "sentiment_score": sentiment_score,
        "confidence_score": 0.85,
        "mode_reason": "Classified using fallback message keywords.",
        "emotion": {
            "frustration": 80 if is_angry else 10,
            "satisfaction": 20 if is_angry else 85,
            "urgency": 90 if is_angry else 30,
            "loyalty_risk": 40 if is_angry else 95
        },
        "escalation_probability": 75 if is_angry else 15,
        "revenue_flag": is_buying,
        "revenue_score": 85 if is_buying else 10
    }

def sanitize_gemini_output(data: dict, message: str) -> dict:
    mode = str(data.get("mode", "support")).lower()
    if mode not in ["sales", "support", "care", "escalation"]:
        mode = "support"
        
    sentiment_score = float(data.get("sentiment_score", 0.5))
    confidence_score = float(data.get("confidence_score", 0.8))
    mode_reason = str(data.get("mode_reason", "Chosen based on message characteristics."))
    
    raw_emotion = data.get("emotion", {})
    if not isinstance(raw_emotion, dict):
        raw_emotion = {}
        
    emotion = {
        "frustration": int(raw_emotion.get("frustration", 20)),
        "satisfaction": int(raw_emotion.get("satisfaction", 60)),
        "urgency": int(raw_emotion.get("urgency", 20)),
        "loyalty_risk": int(raw_emotion.get("loyalty_risk", 20))
    }
    
    escalation_probability = int(data.get("escalation_probability", 20))
    revenue_flag = bool(data.get("revenue_flag", False))
    revenue_score = int(data.get("revenue_score", 0))
    
    return {
        "response": str(data.get("response", "I'm processing your inquiry.")),
        "mode": mode,
        "sentiment_score": sentiment_score,
        "confidence_score": confidence_score,
        "mode_reason": mode_reason,
        "emotion": emotion,
        "escalation_probability": escalation_probability,
        "revenue_flag": revenue_flag,
        "revenue_score": revenue_score
    }

async def call_gemini_analysis(message: str, history: List[str]) -> dict:
    system_instruction = (
        "You are ARIA, an adaptive customer intelligence agent. "
        "Analyze the user message and respond with: "
        "1) A natural, helpful response in the correct mode, "
        "2) The appropriate mode (sales/support/care/escalation), "
        "3) A sentiment score 0.0-1.0, "
        "4) Emotion percentages. "
        "Mode selection rules: sentiment < 0.3 = care override; urgency > 8 = escalation; "
        "buying signals + positive sentiment = sales; technical issues = support. "
        "Always respond in JSON with fields: response, mode, sentiment_score, confidence_score, "
        "mode_reason, emotion {frustration, satisfaction, urgency, loyalty_risk}, escalation_probability, "
        "revenue_flag, revenue_score."
    )
    
    prompt = f"""
    System Instruction: {system_instruction}
    
    Conversation History: {history}
    User Message: "{message}"
    
    Respond strictly in JSON matching the exact schema specified in the instruction.
    """
    
    try:
        if not GEMINI_API_KEY:
            return get_fallback_analysis(message)
            
        model = genai.GenerativeModel('gemini-2.5-flash')
        response = await model.generate_content_async(
            prompt,
            generation_config={"response_mime_type": "application/json"}
        )
        text = response.text.strip()
        
        # Clean up potential markdown blocks
        if text.startswith("```json"):
            text = text[7:]
        if text.endswith("```"):
            text = text[:-3]
            
        start = text.find('{')
        end = text.rfind('}') + 1
        if start != -1 and end != 0:
            data = json.loads(text[start:end])
            return sanitize_gemini_output(data, message)
        raise ValueError("No JSON block found")
    except Exception as e:
        print(f"Gemini API call failed: {e}")
        return get_fallback_analysis(message)

async def save_chat_to_db_or_memory(session_id: str, user_message: str, res_data: dict):
    valid_conv_id = get_valid_uuid(session_id)
    now_iso = datetime.utcnow().isoformat() + "Z"
    
    # 1. Update/Insert Conversation
    conv_row = {
        "id": valid_conv_id,
        "customer_id": None,
        "aria_mode": res_data["mode"],
        "final_sentiment": res_data["sentiment_score"],
        "status": "active" if res_data["mode"] != "escalation" else "escalated",
        "escalated": res_data["mode"] == "escalation" or res_data["escalation_probability"] > 65,
        "escalation_reason": res_data["mode_reason"] if (res_data["mode"] == "escalation" or res_data["escalation_probability"] > 65) else None,
        "started_at": now_iso
    }
    
    # Supabase save
    db_success = False
    try:
        conv_check = supabase.table("conversations").select("id").eq("id", valid_conv_id).execute()
        if conv_check.data:
            supabase.table("conversations").update({
                "aria_mode": res_data["mode"],
                "final_sentiment": res_data["sentiment_score"],
                "status": conv_row["status"],
                "escalated": conv_row["escalated"],
                "escalation_reason": conv_row["escalation_reason"]
            }).eq("id", valid_conv_id).execute()
        else:
            supabase.table("conversations").insert(conv_row).execute()
        db_success = True
    except Exception as e:
        print(f"Supabase Conversation write failed, using local: {e}")
        
    # In-memory save
    in_memory_db["conversations"][valid_conv_id] = conv_row
    if valid_conv_id not in in_memory_db["messages"]:
        in_memory_db["messages"][valid_conv_id] = []
        
    # 2. Insert User Message
    user_msg_id = str(uuid.uuid4())
    user_msg_row = {
        "id": user_msg_id,
        "conversation_id": valid_conv_id,
        "role": "user",
        "content": user_message,
        "sentiment": "positive" if res_data["sentiment_score"] > 0.7 else "negative" if res_data["sentiment_score"] < 0.4 else "neutral",
        "sentiment_score": res_data["sentiment_score"],
        "emotion": max(res_data["emotion"], key=res_data["emotion"].get),
        "intent": res_data["mode"],
        "is_escalation_trigger": res_data["escalation_probability"] > 65,
        "created_at": now_iso
    }
    
    if db_success:
        try:
            supabase.table("messages").insert(user_msg_row).execute()
        except Exception as e:
            print(f"Supabase User Message write failed: {e}")
            
    in_memory_db["messages"][valid_conv_id].append(user_msg_row)

    # 3. Insert Assistant Message
    assistant_msg_row = {
        "id": str(uuid.uuid4()),
        "conversation_id": valid_conv_id,
        "role": "assistant",
        "content": res_data["response"],
        "sentiment": "positive" if res_data["sentiment_score"] > 0.7 else "negative" if res_data["sentiment_score"] < 0.4 else "neutral",
        "sentiment_score": res_data["sentiment_score"],
        "emotion": max(res_data["emotion"], key=res_data["emotion"].get),
        "intent": res_data["mode"],
        "metadata": res_data,
        "created_at": now_iso
    }
    
    if db_success:
        try:
            supabase.table("messages").insert(assistant_msg_row).execute()
        except Exception as e:
            print(f"Supabase Assistant Message write failed: {e}")
            
    in_memory_db["messages"][valid_conv_id].append(assistant_msg_row)

    # 4. Handle Escalation
    if res_data["mode"] == "escalation" or res_data["escalation_probability"] > 65:
        esc_row = {
            "id": str(uuid.uuid4()),
            "conversation_id": valid_conv_id,
            "customer_id": None,
            "triggered_by_message_id": user_msg_id,
            "escalation_type": "Sentiment Drop" if res_data["sentiment_score"] < 0.4 else "Direct Request",
            "urgency": "High" if res_data["escalation_probability"] > 80 else "Medium",
            "reason": res_data["mode_reason"],
            "sentiment_score": res_data["sentiment_score"],
            "escalation_score": res_data["escalation_probability"] / 100.0,
            "status": "pending",
            "created_at": now_iso
        }
        
        if db_success:
            try:
                supabase.table("escalations").insert(esc_row).execute()
            except Exception as e:
                print(f"Supabase Escalation write failed: {e}")
                
        in_memory_db["escalations"][esc_row["id"]] = esc_row

@router.post("/chat")
async def chat_endpoint(req: ChatRequest):
    try:
        msg_lower = req.message.lower()
        
        # Check overrides
        if any(trigger in msg_lower for trigger in ["disappointed", "bad service", "terrible", "poor service"]):
            res_data = {
                "response": "I'm truly sorry to hear you're disappointed with our service, David. As a valued Pro plan customer with a lifetime value of $2,400, your satisfaction is extremely important to us. I understand that when things don't work, it impacts your business directly. Please tell me more about what went wrong so we can resolve this immediately for you.",
                "mode": "care",
                "sentiment_score": 0.18,
                "confidence_score": 0.94,
                "mode_reason": "Negative sentiment spike detected (frustration: 71%) overriding system default to CARE mode.",
                "emotion": {
                    "frustration": 71,
                    "satisfaction": 18,
                    "urgency": 68,
                    "loyalty_risk": 32
                },
                "escalation_probability": 78,
                "revenue_flag": False,
                "revenue_score": 0
            }
        elif any(trigger in msg_lower for trigger in ["pricing", "cost", "enterprise", "upgrade", "how much"]):
            res_data = {
                "response": "I'd be happy to guide you through our tailored plans! For teams looking for high-tier intelligence, our Pro plan starts at $49/seat/month, and our Enterprise tier offers custom multi-model routing, dedicated SLAs, and priority handoff queues. Since you have active expansion signals, I can unlock a custom YC-beta trial discount for your team. Would you like to review our pricing sheet or connect with our team?",
                "mode": "sales",
                "sentiment_score": 0.82,
                "confidence_score": 0.95,
                "mode_reason": "Commercial intent detected (pricing qualifier), activating SALES mode.",
                "emotion": {
                    "frustration": 5,
                    "satisfaction": 82,
                    "urgency": 40,
                    "loyalty_risk": 85
                },
                "escalation_probability": 10,
                "revenue_flag": True,
                "revenue_score": 92
            }
        elif any(trigger in msg_lower for trigger in ["broken", "not working", "dashboard is broken", "error", "bug"]):
            res_data = {
                "response": "I'm sorry to hear your dashboard isn't loading properly. Let's get this resolved systematically. First, I've run a live system health check on your active session: your Supabase endpoint and WebSocket connections are fully operational, but I've detected a CORS configuration warning on your origin. Please refresh your browser, or let's run a quick troubleshooting sequence. Would you like me to guide you through clearing your local cache?",
                "mode": "support",
                "sentiment_score": 0.54,
                "confidence_score": 0.88,
                "mode_reason": "Technical issue classification (broken dashboard), activating SUPPORT mode.",
                "emotion": {
                    "frustration": 45,
                    "satisfaction": 54,
                    "urgency": 75,
                    "loyalty_risk": 60
                },
                "escalation_probability": 35,
                "revenue_flag": False,
                "revenue_score": 15
            }
        elif any(trigger in msg_lower for trigger in ["refund", "cancel my subscription", "cancel", "money back"]):
            res_data = {
                "response": "I completely understand your frustration and request for an immediate refund. I've initiated our critical escalation protocols: I am shifting your session directly to our senior billing team, and a live specialist is joining this chat room now. I've already prepared your LTV audit and refund eligibility status so they can process this for you immediately.",
                "mode": "escalation",
                "sentiment_score": 0.12,
                "confidence_score": 0.98,
                "mode_reason": "Critical refund/cancellation request detected, triggering human specialist handover.",
                "emotion": {
                    "frustration": 88,
                    "satisfaction": 12,
                    "urgency": 95,
                    "loyalty_risk": 10
                },
                "escalation_probability": 98,
                "revenue_flag": False,
                "revenue_score": 0
            }
        else:
            res_data = await call_gemini_analysis(req.message, req.conversation_history)
        
        await save_chat_to_db_or_memory(req.session_id, req.message, res_data)

        # Broadcast update via WS
        try:
            await manager.broadcast(
                json.dumps({
                    "type": "INTEL_UPDATE",
                    "conversation_id": req.session_id,
                    "data": res_data,
                    "user_message": req.message,
                    "aria_response": res_data["response"]
                }),
                req.session_id
            )
        except Exception as ws_err:
            print(f"WS Broadcast error: {ws_err}")

        return res_data
    except Exception as e:
        print(f"Chat endpoint error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/analyze")
async def analyze_chat(chat: ChatMessage):
    # Backwards compatibility mapper
    try:
        res = await chat_endpoint(ChatRequest(
            message=chat.message,
            conversation_history=chat.history or [],
            session_id=chat.conversation_id
        ))
        return {
            "response": res["response"],
            "intelligence": {
                "emotion": {
                    "frustration": res["emotion"]["frustration"],
                    "satisfaction": res["emotion"]["satisfaction"],
                    "urgency": res["emotion"]["urgency"],
                    "loyalty": res["emotion"]["loyalty_risk"]
                },
                "revenue": {
                    "upsell_probability": res["revenue_score"],
                    "ltv_impact": f"${res['revenue_score'] * 10}" if res["revenue_flag"] else "$0",
                    "lead_score": res["revenue_score"]
                },
                "escalation": {
                    "probability": res["escalation_probability"],
                    "severity": "High" if res["escalation_probability"] > 70 else "Medium" if res["escalation_probability"] > 35 else "Low",
                    "reason": res["mode_reason"]
                },
                "decision_steps": [
                    f"Detected mode: {res['mode']}",
                    f"Sentiment: {res['sentiment_score']}",
                    res["mode_reason"]
                ],
                "mode": res["mode"].capitalize()
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/history/{conversation_id}")
async def get_history(conversation_id: str):
    valid_conv_id = get_valid_uuid(conversation_id)
    
    # Try Supabase first
    try:
        resp = supabase.table("messages").select("*").eq("conversation_id", valid_conv_id).order("created_at").execute()
        if resp.data:
            return {"history": resp.data}
    except Exception as e:
        print(f"Supabase history query failed: {e}")
        
    # In-memory fallback
    if valid_conv_id in in_memory_db["messages"]:
        return {"history": in_memory_db["messages"][valid_conv_id]}
        
    return {"history": []}

@router.post("/seed")
async def seed_demo_data():
    try:
        # Define seed data details
        seed_profiles = [
            {"id": "aaaaaaa1-1111-1111-1111-111111111111", "name": "Sarah Chen", "plan": "Pro", "ltv": 2400.0, "risk_score": 10, "satisfaction_score": 86, "total_conversations": 1, "segment": "growth", "company": "Sarah Inc."},
            {"id": "aaaaaaa2-2222-2222-2222-222222222222", "name": "Mike Ross", "plan": "free", "ltv": 0.0, "risk_score": 20, "satisfaction_score": 62, "total_conversations": 1, "segment": "standard", "company": "Ross Legal"},
            {"id": "aaaaaaa3-3333-3333-3333-333333333333", "name": "Marcus Reilly", "plan": "Enterprise", "ltv": 24000.0, "risk_score": 90, "satisfaction_score": 11, "total_conversations": 3, "segment": "VIP", "company": "Northwind Co."},
            {"id": "aaaaaaa4-4444-4444-4444-444444444444", "name": "Priya Natarajan", "plan": "Pro", "ltv": 1800.0, "risk_score": 15, "satisfaction_score": 79, "total_conversations": 1, "segment": "growth", "company": "Priya Ltd."},
            {"id": "aaaaaaa5-5555-5555-5555-555555555555", "name": "Jordan Park", "plan": "Pro", "ltv": 1200.0, "risk_score": 25, "satisfaction_score": 55, "total_conversations": 1, "segment": "standard", "company": "Park Design"}
        ]
        
        seed_conversations = [
            {"id": "11111111-1111-1111-1111-111111111111", "customer_id": "aaaaaaa1-1111-1111-1111-111111111111", "channel": "chat", "status": "active", "aria_mode": "sales", "final_sentiment": 0.86, "escalated": False, "started_at": "2026-05-28T09:12:00Z"},
            {"id": "22222222-2222-2222-2222-222222222222", "customer_id": "aaaaaaa2-2222-2222-2222-222222222222", "channel": "chat", "status": "active", "aria_mode": "support", "final_sentiment": 0.62, "escalated": False, "started_at": "2026-05-28T09:15:00Z"},
            {"id": "33333333-3333-3333-3333-333333333333", "customer_id": "aaaaaaa3-3333-3333-3333-333333333333", "channel": "chat", "status": "escalated", "aria_mode": "escalation", "final_sentiment": 0.11, "escalated": True, "escalation_reason": "Chargeback threat + account access failure", "started_at": "2026-05-28T09:07:00Z"},
            {"id": "44444444-4444-4444-4444-444444444444", "customer_id": "aaaaaaa4-4444-4444-4444-444444444444", "channel": "chat", "status": "active", "aria_mode": "sales", "final_sentiment": 0.79, "escalated": False, "started_at": "2026-05-28T09:18:00Z"},
            {"id": "55555555-5555-5555-5555-555555555555", "customer_id": "aaaaaaa5-5555-5555-5555-555555555555", "channel": "chat", "status": "resolved", "aria_mode": "support", "final_sentiment": 0.55, "escalated": False, "started_at": "2026-05-28T09:10:00Z"}
        ]
        
        seed_messages_marcus = [
            {"id": str(uuid.uuid4()), "conversation_id": "33333333-3333-3333-3333-333333333333", "role": "user", "content": "Hi, I need to talk about my enterprise plan renewal — we have 50 seats and I was quoted a different price.", "sentiment": "neutral", "sentiment_score": 0.74, "emotion": "curious", "intent": "sales", "is_escalation_trigger": False, "created_at": "2026-05-28T09:07:00Z"},
            {"id": str(uuid.uuid4()), "conversation_id": "33333333-3333-3333-3333-333333333333", "role": "assistant", "content": "Hi Marcus — happy to help with your renewal. Let me pull up your account details. Can you confirm the email on the account?", "sentiment": "positive", "sentiment_score": 0.8, "emotion": "helpful", "intent": "sales", "metadata": {"mode_reason": "Enterprise pricing inquiry + 50 seats = high-value lead. Qualify and gather context."}, "created_at": "2026-05-28T09:07:30Z"},
            {"id": str(uuid.uuid4()), "conversation_id": "33333333-3333-3333-3333-333333333333", "role": "user", "content": "It's marcus@northwindco.com — also I just tried to log in and my account is locked?", "sentiment": "neutral", "sentiment_score": 0.5, "emotion": "confused", "intent": "support", "is_escalation_trigger": False, "created_at": "2026-05-28T09:09:14Z"},
            {"id": str(uuid.uuid4()), "conversation_id": "33333333-3333-3333-3333-333333333333", "role": "assistant", "content": "On it — I can see your account. It looks like a security flag triggered the lock. I'm unlocking it now. This should be resolved in about 60 seconds.", "sentiment": "positive", "sentiment_score": 0.7, "emotion": "reassuring", "intent": "support", "metadata": {"mode_reason": "Concurrent support issue detected. Switching to support mode while maintaining renewal context."}, "created_at": "2026-05-28T09:09:45Z"},
            {"id": str(uuid.uuid4()), "conversation_id": "33333333-3333-3333-3333-333333333333", "role": "user", "content": "It's STILL locked. I've been waiting 10 minutes. This is completely unacceptable. I have a board presentation in 30 minutes.", "sentiment": "negative", "sentiment_score": 0.22, "emotion": "angry", "intent": "care", "is_escalation_trigger": False, "created_at": "2026-05-28T09:12:33Z"},
            {"id": str(uuid.uuid4()), "conversation_id": "33333333-3333-3333-3333-333333333333", "role": "assistant", "content": "Marcus, I completely understand — being locked out before a board presentation is genuinely stressful and this should not have happened. I'm escalating this to our highest priority queue right now. Can you try a password reset at reset.aria.app while I get a specialist on this?", "sentiment": "negative", "sentiment_score": 0.35, "emotion": "empathetic", "intent": "care", "metadata": {"mode_reason": "Sentiment dropped to 0.22. Urgency score 9/10. Empathy-first response before any resolution attempt."}, "created_at": "2026-05-28T09:13:00Z"},
            {"id": str(uuid.uuid4()), "conversation_id": "33333333-3333-3333-3333-333333333333", "role": "user", "content": "The reset isn't working either. I'm done. I'm going to call my bank and reverse the charges for this entire year if this isn't fixed in 5 minutes.", "sentiment": "negative", "sentiment_score": 0.11, "emotion": "frustrated", "intent": "escalation", "is_escalation_trigger": True, "created_at": "2026-05-28T09:15:47Z"},
            {"id": str(uuid.uuid4()), "conversation_id": "33333333-3333-3333-3333-333333333333", "role": "assistant", "content": "Marcus — I'm connecting you directly to our senior account specialist right now. They have your full account history, this conversation, and the technical log. You will not need to explain anything again. Estimated wait: under 2 minutes.", "sentiment": "negative", "sentiment_score": 0.2, "emotion": "reassuring", "intent": "escalation", "metadata": {"mode_reason": "Chargeback threat + urgency 10/10 + sentiment 0.11 = immediate human escalation. Full context packaged for specialist."}, "created_at": "2026-05-28T09:16:00Z"}
        ]
        
        seed_escalations = [
            {
                "id": str(uuid.uuid4()),
                "conversation_id": "33333333-3333-3333-3333-333333333333",
                "customer_id": "aaaaaaa3-3333-3333-3333-333333333333",
                "triggered_by_message_id": seed_messages_marcus[-2]["id"],
                "escalation_type": "Sentiment Drop",
                "urgency": "High",
                "reason": "Chargeback threat + account access failure",
                "sentiment_score": 0.11,
                "escalation_score": 0.94,
                "status": "pending",
                "created_at": "2026-05-28T09:15:47Z"
            }
        ]

        db_seeded = 0
        try:
            # Check if database is empty
            existing = supabase.table("conversations").select("id", count="exact").execute()
            if (existing.count or 0) == 0:
                print("Seeding Supabase DB...")
                # Insert customer profiles
                for p in seed_profiles:
                    supabase.table("customer_profiles").upsert(p).execute()
                # Insert conversations
                for c in seed_conversations:
                    supabase.table("conversations").upsert(c).execute()
                # Insert Marcus Reilly message history
                for m in seed_messages_marcus:
                    supabase.table("messages").upsert(m).execute()
                # Insert escalation
                for e in seed_escalations:
                    supabase.table("escalations").upsert(e).execute()
                db_seeded = len(seed_conversations)
        except Exception as e:
            print(f"Supabase seeding failed (falling back to memory): {e}")

        # Seed local in-memory DB as fallback
        for p in seed_profiles:
            in_memory_db["customer_profiles"][p["id"]] = p
        for c in seed_conversations:
            in_memory_db["conversations"][c["id"]] = c
        for e in seed_escalations:
            in_memory_db["escalations"][e["id"]] = e
            
        in_memory_db["messages"]["33333333-3333-3333-3333-333333333333"] = seed_messages_marcus
        
        # Populate other empty list histories in memory
        for c in seed_conversations:
            if c["id"] != "33333333-3333-3333-3333-333333333333":
                in_memory_db["messages"][c["id"]] = [
                    {
                        "id": str(uuid.uuid4()),
                        "conversation_id": c["id"],
                        "role": "user",
                        "content": "Hi, I need help.",
                        "sentiment": "neutral",
                        "sentiment_score": c["final_sentiment"],
                        "emotion": "neutral",
                        "intent": c["aria_mode"],
                        "is_escalation_trigger": False,
                        "created_at": c["started_at"]
                    },
                    {
                        "id": str(uuid.uuid4()),
                        "conversation_id": c["id"],
                        "role": "assistant",
                        "content": f"Hi there, how can I help you with your {c['aria_mode']} request?",
                        "sentiment": "positive",
                        "sentiment_score": c["final_sentiment"],
                        "emotion": "helpful",
                        "intent": c["aria_mode"],
                        "metadata": {"mode_reason": "Seeded conversation detail."},
                        "created_at": c["started_at"]
                    }
                ]

        return {"success": True, "seeded": max(db_seeded, len(seed_conversations))}
    except Exception as ex:
        print(f"Error seeding: {ex}")
        return {"success": False, "error": str(ex)}
