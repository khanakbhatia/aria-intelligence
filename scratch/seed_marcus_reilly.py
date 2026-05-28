import os
import uuid
from dotenv import load_dotenv
from supabase import create_client, Client
from datetime import datetime, timedelta

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SUPABASE_KEY = os.getenv("SUPABASE_KEY") or os.getenv("SUPABASE_SERVICE_KEY", "")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# Define stable UUIDs
MARCUS_PROFILE_ID = "33333333-3333-3333-3333-333333333333"
MARCUS_CONVO_ID = "44444444-4444-4444-4444-444444444444"

# Messages UUIDs
MSG_1 = str(uuid.uuid4())
MSG_2 = str(uuid.uuid4())
MSG_3 = str(uuid.uuid4())
MSG_4 = str(uuid.uuid4())

def seed():
    print("Seeding Marcus Reilly's VIP Profile...")
    try:
        # Check and delete existing
        supabase.table("customer_profiles").delete().eq("id", MARCUS_PROFILE_ID).execute()
        supabase.table("conversations").delete().eq("id", MARCUS_CONVO_ID).execute()
        
        # 1. Insert Marcus Profile
        supabase.table("customer_profiles").insert({
            "id": MARCUS_PROFILE_ID,
            "name": "Marcus Reilly",
            "email": "marcus.reilly@northwind.io",
            "company": "Northwind Trading Co.",
            "plan": "enterprise",
            "ltv": 2400.00,
            "risk_score": 92,
            "satisfaction_score": 34,
            "total_conversations": 4,
            "segment": "vip",
            "tags": ["High LTV", "Payroll Priority", "API Integrator"],
            "metadata": {"preferred_contact": "phone", "sla_tier": "Gold Platinum"}
        }).execute()
        print("Success: Seeded customer_profiles!")

        # 2. Insert Conversation
        supabase.table("conversations").insert({
            "id": MARCUS_CONVO_ID,
            "customer_id": MARCUS_PROFILE_ID,
            "channel": "chat",
            "status": "escalated",
            "aria_mode": "escalation",
            "final_sentiment": "0.34",
            "escalated": True,
            "escalation_reason": "High LTV account expressing critical churn risk due to weekend payout ACH delay.",
            "satisfaction_rating": 2,
            "summary": "Customer Marcus Reilly (LTV $2,400) experiencing payroll payout block due to ACH delay. Threatening competitor migration. Escalated to billing supervisor.",
            "started_at": (datetime.now() - timedelta(minutes=15)).isoformat(),
            "created_at": (datetime.now() - timedelta(minutes=15)).isoformat()
        }).execute()
        print("Success: Seeded conversations!")

        # 3. Seed messages
        # MSG 1
        supabase.table("messages").insert({
            "id": MSG_1,
            "conversation_id": MARCUS_CONVO_ID,
            "role": "user",
            "content": "Hi, I've been waiting for my payout for 3 days now and your system says it's processed, but I see nothing in my bank account. What is going on?",
            "sentiment": "negative",
            "sentiment_score": 0.45,
            "emotion": "concerned",
            "intent": "support",
            "is_escalation_trigger": False,
            "created_at": (datetime.now() - timedelta(minutes=14)).isoformat()
        }).execute()

        # MSG 2
        supabase.table("messages").insert({
            "id": MSG_2,
            "conversation_id": MARCUS_CONVO_ID,
            "role": "assistant",
            "content": "I understand how important timely payouts are for your business operations, Marcus. Let me inspect our transaction gateway logs. I see transaction ID tx_84920 was successfully verified by our clearing house, but is currently in an ACH processing queue due to a standard federal clearing delay. It is guaranteed to clear by Monday morning. I apologize for the worry.",
            "sentiment": "neutral",
            "sentiment_score": 0.65,
            "emotion": "analytical",
            "intent": "support",
            "is_escalation_trigger": False,
            "created_at": (datetime.now() - timedelta(minutes=13)).isoformat()
        }).execute()

        # MSG 3 (CRITICAL ESCALATION TRIGGER)
        supabase.table("messages").insert({
            "id": MSG_3,
            "conversation_id": MARCUS_CONVO_ID,
            "role": "user",
            "content": "That is completely unacceptable! Monday is too late, I have payroll running today! Your service promised instant transfers when I upgraded to Pro! I want this fixed now or I am moving to a competitor immediately!",
            "sentiment": "negative",
            "sentiment_score": 0.12,
            "emotion": "angry",
            "intent": "care",
            "is_escalation_trigger": True,
            "created_at": (datetime.now() - timedelta(minutes=12)).isoformat()
        }).execute()

        # MSG 4 (ARIA ESCALATION ASSURANCE)
        supabase.table("messages").insert({
            "id": MSG_4,
            "conversation_id": MARCUS_CONVO_ID,
            "role": "assistant",
            "content": "I completely understand your frustration, Marcus, and I sincerely apologize for this critical impact on your payroll timeline. I have engaged our priority escalation protocols: I am immediately transferring your session to our senior operations team, and a billing specialist is joining this room now. They are reviewing your transactional clearance status to execute a manual instant override wire for you. I am forwarding your full payout history now.",
            "sentiment": "positive",
            "sentiment_score": 0.75,
            "emotion": "empathetic",
            "intent": "escalation",
            "is_escalation_trigger": False,
            "created_at": (datetime.now() - timedelta(minutes=11)).isoformat(),
            "metadata": {
                "mode": "Escalation",
                "emotion": {
                    "frustration": 92,
                    "satisfaction": 12,
                    "urgency": 98,
                    "loyalty": 14
                },
                "revenue": {
                    "upsell_probability": 0,
                    "ltv_impact": "Severe churn risk - Potential loss of $2,400 VIP subscription contract",
                    "lead_score": 0
                },
                "escalation": {
                    "probability": 98,
                    "severity": "High",
                    "reason": "Customer expressed critical billing blockage (payroll timeline) and competitor migration threat. Escalated to wire team."
                },
                "decision_steps": [
                    "Critical refund/cancellation or competitor threat detected",
                    "System transition: SUPPORT -> CARE -> ESCALATION",
                    "Triggering automated human agent takeover event",
                    "Forwarding full memory context and LTV impact to specialist"
                ]
            }
        }).execute()
        print("Success: Seeded Marcus Reilly's conversation transcript!")

    except Exception as e:
        print("Seeding failed:", e)

if __name__ == "__main__":
    seed()
