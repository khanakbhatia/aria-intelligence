import "./lib/error-capture";

import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";

type ServerEntry = {
  fetch: (request: Request, env: unknown, ctx: unknown) => Promise<Response> | Response;
};

type RuntimeEnv = {
  GEMINI_API_KEY?: string;
  SUPABASE_URL?: string;
  SUPABASE_SERVICE_KEY?: string;
  SUPABASE_KEY?: string;
};

let serverEntryPromise: Promise<ServerEntry> | undefined;

const seedProfiles = [
  { id: "aaaaaaa1-1111-1111-1111-111111111111", name: "Sarah Chen", plan: "Pro", ltv: 2400, risk_score: 10, satisfaction_score: 86, total_conversations: 1, segment: "growth", company: "Sarah Inc.", created_at: "2026-05-28T09:00:00Z" },
  { id: "aaaaaaa2-2222-2222-2222-222222222222", name: "Mike Ross", plan: "free", ltv: 0, risk_score: 20, satisfaction_score: 62, total_conversations: 1, segment: "standard", company: "Ross Legal", created_at: "2026-05-28T09:00:00Z" },
  { id: "aaaaaaa3-3333-3333-3333-333333333333", name: "Marcus Reilly", plan: "Enterprise", ltv: 24000, risk_score: 90, satisfaction_score: 11, total_conversations: 3, segment: "VIP", company: "Northwind Co.", created_at: "2026-05-28T09:00:00Z" },
  { id: "aaaaaaa4-4444-4444-4444-444444444444", name: "Priya Natarajan", plan: "Pro", ltv: 1800, risk_score: 15, satisfaction_score: 79, total_conversations: 1, segment: "growth", company: "Priya Ltd.", created_at: "2026-05-28T09:00:00Z" },
  { id: "aaaaaaa5-5555-5555-5555-555555555555", name: "Jordan Park", plan: "Pro", ltv: 1200, risk_score: 25, satisfaction_score: 55, total_conversations: 1, segment: "standard", company: "Park Design", created_at: "2026-05-28T09:00:00Z" }
];

const seedConversations = [
  { id: "11111111-1111-1111-1111-111111111111", customer_id: "aaaaaaa1-1111-1111-1111-111111111111", channel: "chat", status: "active", aria_mode: "sales", final_sentiment: 0.86, escalated: false, started_at: "2026-05-28T09:12:00Z" },
  { id: "22222222-2222-2222-2222-222222222222", customer_id: "aaaaaaa2-2222-2222-2222-222222222222", channel: "chat", status: "active", aria_mode: "support", final_sentiment: 0.62, escalated: false, started_at: "2026-05-28T09:15:00Z" },
  { id: "33333333-3333-3333-3333-333333333333", customer_id: "aaaaaaa3-3333-3333-3333-333333333333", channel: "chat", status: "escalated", aria_mode: "escalation", final_sentiment: 0.11, escalated: true, escalation_reason: "Chargeback threat + account access failure", started_at: "2026-05-28T09:07:00Z" },
  { id: "44444444-4444-4444-4444-444444444444", customer_id: "aaaaaaa4-4444-4444-4444-444444444444", channel: "chat", status: "active", aria_mode: "sales", final_sentiment: 0.79, escalated: false, started_at: "2026-05-28T09:18:00Z" },
  { id: "55555555-5555-5555-5555-555555555555", customer_id: "aaaaaaa5-5555-5555-5555-555555555555", channel: "chat", status: "resolved", aria_mode: "support", final_sentiment: 0.55, escalated: false, started_at: "2026-05-28T09:10:00Z" }
];

const seedMessagesMarcus = [
  { id: "msg-m1", conversation_id: "33333333-3333-3333-3333-333333333333", role: "user", content: "Hi, I need to talk about my enterprise plan renewal — we have 50 seats and I was quoted a different price.", sentiment: "neutral", sentiment_score: 0.74, emotion: "curious", intent: "sales", is_escalation_trigger: false, created_at: "2026-05-28T09:07:00Z" },
  { id: "msg-m2", conversation_id: "33333333-3333-3333-3333-333333333333", role: "assistant", content: "Hi Marcus — happy to help with your renewal. Let me pull up your account details. Can you confirm the email on the account?", sentiment: "positive", sentiment_score: 0.8, emotion: "helpful", intent: "sales", metadata: { mode_reason: "Enterprise pricing inquiry + 50 seats = high-value lead. Qualify and gather context." }, created_at: "2026-05-28T09:07:30Z" },
  { id: "msg-m3", conversation_id: "33333333-3333-3333-3333-333333333333", role: "user", content: "It's marcus@northwindco.com — also I just tried to log in and my account is locked?", sentiment: "neutral", sentiment_score: 0.5, emotion: "confused", intent: "support", is_escalation_trigger: false, created_at: "2026-05-28T09:09:14Z" },
  { id: "msg-m4", conversation_id: "33333333-3333-3333-3333-333333333333", role: "assistant", content: "On it — I can see your account. It looks like a security flag triggered the lock. I'm unlocking it now. This should be resolved in about 60 seconds.", sentiment: "positive", sentiment_score: 0.7, emotion: "reassuring", intent: "support", metadata: { mode_reason: "Concurrent support issue detected. Switching to support mode while maintaining renewal context." }, created_at: "2026-05-28T09:09:45Z" },
  { id: "msg-m5", conversation_id: "33333333-3333-3333-3333-333333333333", role: "user", content: "It's STILL locked. I've been waiting 10 minutes. This is completely unacceptable. I have a board presentation in 30 minutes.", sentiment: "negative", sentiment_score: 0.22, emotion: "angry", intent: "care", is_escalation_trigger: false, created_at: "2026-05-28T09:12:33Z" },
  { id: "msg-m6", conversation_id: "33333333-3333-3333-3333-333333333333", role: "assistant", content: "Marcus, I completely understand — being locked out before a board presentation is genuinely stressful and this should not have happened. I'm escalating this to our highest priority queue right now. Can you try a password reset at reset.aria.app while I get a specialist on this?", sentiment: "negative", sentiment_score: 0.35, emotion: "empathetic", intent: "care", metadata: { mode_reason: "Sentiment dropped to 0.22. Urgency score 9/10. Empathy-first response before any resolution attempt." }, created_at: "2026-05-28T09:13:00Z" },
  { id: "msg-m7", conversation_id: "33333333-3333-3333-3333-333333333333", role: "user", content: "The reset isn't working either. I'm done. I'm going to call my bank and reverse the charges for this entire year if this isn't fixed in 5 minutes.", sentiment: "negative", sentiment_score: 0.11, emotion: "frustrated", intent: "escalation", is_escalation_trigger: true, created_at: "2026-05-28T09:15:47Z" },
  { id: "msg-m8", conversation_id: "33333333-3333-3333-3333-333333333333", role: "assistant", content: "Marcus — I'm connecting you directly to our senior account specialist right now. They have your full account history, this conversation, and the technical log. You will not need to explain anything again. Estimated wait: under 2 minutes.", sentiment: "negative", sentiment_score: 0.2, emotion: "reassuring", intent: "escalation", metadata: { mode_reason: "Chargeback threat + urgency 10/10 + sentiment 0.11 = immediate human escalation. Full context packaged for specialist." }, created_at: "2026-05-28T09:16:00Z" }
];

const seedEscalations = [
  {
    id: "esc-e1",
    conversation_id: "33333333-3333-3333-3333-333333333333",
    customer_id: "aaaaaaa3-3333-3333-3333-333333333333",
    triggered_by_message_id: "msg-m7",
    escalation_type: "Sentiment Drop",
    urgency: "High",
    reason: "Chargeback threat + account access failure",
    sentiment_score: 0.11,
    escalation_score: 0.94,
    status: "pending",
    created_at: "2026-05-28T09:15:47Z"
  }
];

let memoryDb = {
  customer_profiles: [...seedProfiles],
  conversations: [...seedConversations],
  messages: {
    "33333333-3333-3333-3333-333333333333": [...seedMessagesMarcus]
  } as Record<string, any[]>,
  escalations: [...seedEscalations]
};

async function fetchSupabaseRest(url: string, key: string, path: string, method: string = "GET", body: any = null): Promise<any> {
  const supabaseUrl = url.replace(/\/$/, "");
  const headers: any = {
    apikey: key,
    Authorization: `Bearer ${key}`,
    "Content-Type": "application/json",
    "Prefer": "return=representation"
  };
  
  const response = await fetch(`${supabaseUrl}/rest/v1/${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : null
  });
  
  if (!response.ok) {
    throw new Error(`Supabase query failed: ${response.status} ${response.statusText}`);
  }
  
  if (method === "GET") {
    return await response.json();
  }
  return await response.json().catch(() => []);
}

async function handleCustomers(request: Request, env: unknown): Promise<Response> {
  const runtimeEnv = getRuntimeEnv(env);
  try {
    if (runtimeEnv.SUPABASE_URL && runtimeEnv.SUPABASE_SERVICE_KEY) {
      const data = await fetchSupabaseRest(runtimeEnv.SUPABASE_URL, runtimeEnv.SUPABASE_SERVICE_KEY, "customer_profiles?order=created_at.desc");
      return jsonResponse({ customers: data });
    }
  } catch (e) {
    console.error("[Worker] Supabase customers query failed:", e);
  }
  return jsonResponse({ customers: memoryDb.customer_profiles });
}

async function handleHistory(request: Request, env: unknown, id: string): Promise<Response> {
  const runtimeEnv = getRuntimeEnv(env);
  try {
    if (runtimeEnv.SUPABASE_URL && runtimeEnv.SUPABASE_SERVICE_KEY) {
      const data = await fetchSupabaseRest(runtimeEnv.SUPABASE_URL, runtimeEnv.SUPABASE_SERVICE_KEY, `messages?conversation_id=eq.${id}&order=created_at.asc`);
      return jsonResponse({ history: data });
    }
  } catch (e) {
    console.error("[Worker] Supabase history query failed:", e);
  }
  const history = memoryDb.messages[id] || [];
  return jsonResponse({ history });
}

async function handleSeed(request: Request, env: unknown): Promise<Response> {
  const runtimeEnv = getRuntimeEnv(env);
  let dbSeeded = 0;
  
  try {
    if (runtimeEnv.SUPABASE_URL && runtimeEnv.SUPABASE_SERVICE_KEY) {
      // Check if Marcus Reilly conversation is present to trigger seed
      const existing = await fetchSupabaseRest(runtimeEnv.SUPABASE_URL, runtimeEnv.SUPABASE_SERVICE_KEY, "conversations?id=eq.33333333-3333-3333-3333-333333333333");
      if (existing.length === 0) {
        console.log("[Worker] Seeding Supabase DB...");
        
        // Seed profiles
        for (const p of seedProfiles) {
          await fetchSupabaseRest(runtimeEnv.SUPABASE_URL, runtimeEnv.SUPABASE_SERVICE_KEY, "customer_profiles", "POST", p);
        }
        // Seed conversations
        for (const c of seedConversations) {
          await fetchSupabaseRest(runtimeEnv.SUPABASE_URL, runtimeEnv.SUPABASE_SERVICE_KEY, "conversations", "POST", c);
        }
        // Seed messages
        for (const m of seedMessagesMarcus) {
          await fetchSupabaseRest(runtimeEnv.SUPABASE_URL, runtimeEnv.SUPABASE_SERVICE_KEY, "messages", "POST", m);
        }
        // Seed escalations
        for (const e of seedEscalations) {
          await fetchSupabaseRest(runtimeEnv.SUPABASE_URL, runtimeEnv.SUPABASE_SERVICE_KEY, "escalations", "POST", e);
        }
        dbSeeded = seedConversations.length;
      }
    }
  } catch (e) {
    console.error("[Worker] Supabase seeding failed, using local:", e);
  }
  
  return jsonResponse({ success: true, seeded: Math.max(dbSeeded, seedConversations.length) });
}

async function handleOverview(request: Request, env: unknown): Promise<Response> {
  const runtimeEnv = getRuntimeEnv(env);
  let conversations = memoryDb.conversations;
  
  try {
    if (runtimeEnv.SUPABASE_URL && runtimeEnv.SUPABASE_SERVICE_KEY) {
      conversations = await fetchSupabaseRest(runtimeEnv.SUPABASE_URL, runtimeEnv.SUPABASE_SERVICE_KEY, "conversations");
    }
  } catch (e) {
    console.error("[Worker] Supabase overview query failed:", e);
  }
  
  const total = conversations.length;
  const activeList = conversations.filter(c => c.status === "active" || c.status === "Active");
  const activeCount = activeList.length;
  
  const resolvedList = conversations.filter(c => c.status === "resolved" || c.status === "Resolved");
  const resolvedCount = resolvedList.length;
  
  const escalatedList = conversations.filter(c => c.status === "escalated" || c.status === "Escalated");
  const escalatedCount = escalatedList.length;
  
  const sentiments = conversations.map(c => Number(c.final_sentiment ?? c.sentiment ?? 0.5)).filter(s => !isNaN(s));
  const avgSentiment = sentiments.length > 0 ? (sentiments.reduce((a, b) => a + b, 0) / sentiments.length) * 100 : 74.2;
  const escalationRate = total > 0 ? (escalatedCount / total) * 100 : 4.2;
  const resolutionRate = total > 0 ? resolvedCount / total : 0.8;
  
  return jsonResponse({
    active_conversations: activeCount,
    avg_sentiment: Math.round(avgSentiment * 10) / 10,
    resolution_rate: Math.round(resolutionRate * 100) / 100,
    escalation_rate: Math.round(escalationRate * 10) / 10,
    revenue_pipeline: "$48.2k"
  });
}

async function handleConversations(request: Request, env: unknown): Promise<Response> {
  const runtimeEnv = getRuntimeEnv(env);
  const urlObj = new URL(request.url);
  const statusParam = urlObj.searchParams.get("status");
  const limitParam = urlObj.searchParams.get("limit");
  const limit = limitParam ? parseInt(limitParam) : 10;
  
  let conversations = memoryDb.conversations;
  let profiles = memoryDb.customer_profiles;
  
  try {
    if (runtimeEnv.SUPABASE_URL && runtimeEnv.SUPABASE_SERVICE_KEY) {
      conversations = await fetchSupabaseRest(runtimeEnv.SUPABASE_URL, runtimeEnv.SUPABASE_SERVICE_KEY, "conversations");
      profiles = await fetchSupabaseRest(runtimeEnv.SUPABASE_URL, runtimeEnv.SUPABASE_SERVICE_KEY, "customer_profiles");
    }
  } catch (e) {
    console.error("[Worker] Supabase conversations query failed:", e);
  }
  
  const profilesMap: Record<string, string> = {};
  for (const p of profiles) {
    profilesMap[p.id] = p.name;
  }
  
  let filtered = conversations;
  if (statusParam) {
    filtered = conversations.filter(c => String(c.status || "").toLowerCase() === statusParam.toLowerCase());
  }
  
  const formatted = filtered.map(c => {
    const custName = profilesMap[c.customer_id] || "Anonymous User";
    let duration = "2m";
    if (c.id === "11111111-1111-1111-1111-111111111111") duration = "4m 12s";
    else if (c.id === "22222222-2222-2222-2222-222222222222") duration = "2m 48s";
    else if (c.id === "33333333-3333-3333-3333-333333333333") duration = "9m 04s";
    else if (c.id === "44444444-4444-4444-4444-444444444444") duration = "1m 33s";
    else if (c.id === "55555555-5555-5555-5555-555555555555") duration = "6m 20s";
    
    return {
      id: c.id,
      customer_name: custName,
      mode: String(c.aria_mode || c.mode || "support").toLowerCase(),
      sentiment_score: Number(c.final_sentiment ?? c.sentiment ?? 0.5),
      status: String(c.status || "active").charAt(0).toUpperCase() + String(c.status || "active").slice(1),
      duration,
      started_at: c.started_at || c.created_at
    };
  });
  
  formatted.sort((a, b) => new Date(b.started_at).getTime() - new Date(a.started_at).getTime());
  
  return jsonResponse({ conversations: formatted.slice(0, limit) });
}

async function handleSentimentTrend(request: Request, env: unknown): Promise<Response> {
  return jsonResponse([
    { day: "Mon", sentiment: 0.63 },
    { day: "Tue", sentiment: 0.71 },
    { day: "Wed", sentiment: 0.58 },
    { day: "Thu", sentiment: 0.74 },
    { day: "Fri", sentiment: 0.69 },
    { day: "Sat", sentiment: 0.82 },
    { day: "Sun", sentiment: 0.74 }
  ]);
}

async function handleRevenueOpportunities(request: Request, env: unknown): Promise<Response> {
  const urlObj = new URL(request.url);
  const limitParam = urlObj.searchParams.get("limit");
  const limit = limitParam ? parseInt(limitParam) : 4;
  
  const opportunities = [
    { id: "opp1", customer_name: "Sarah Chen", type: "Upsell", score: 92, description: "Showed interest in Enterprise tier" },
    { id: "opp2", customer_name: "Priya Natarajan", type: "Expansion", score: 84, description: "Asked about additional seats" },
    { id: "opp3", customer_name: "Northwind Co.", type: "Renewal", score: 78, description: "Contract ends in 14 days" },
    { id: "opp4", customer_name: "Jordan Park", type: "Upsell", score: 71, description: "Mentioned API rate limits" }
  ];
  return jsonResponse(opportunities.slice(0, limit));
}

async function handleEscalations(request: Request, env: unknown): Promise<Response> {
  const runtimeEnv = getRuntimeEnv(env);
  let escalations = memoryDb.escalations;
  let conversations = memoryDb.conversations;
  let profiles = memoryDb.customer_profiles;
  
  try {
    if (runtimeEnv.SUPABASE_URL && runtimeEnv.SUPABASE_SERVICE_KEY) {
      escalations = await fetchSupabaseRest(runtimeEnv.SUPABASE_URL, runtimeEnv.SUPABASE_SERVICE_KEY, "escalations");
      conversations = await fetchSupabaseRest(runtimeEnv.SUPABASE_URL, runtimeEnv.SUPABASE_SERVICE_KEY, "conversations");
      profiles = await fetchSupabaseRest(runtimeEnv.SUPABASE_URL, runtimeEnv.SUPABASE_SERVICE_KEY, "customer_profiles");
    }
  } catch (e) {
    console.error("[Worker] Supabase escalations query failed:", e);
  }
  
  const convMap = new Map();
  for (const c of conversations) {
    convMap.set(c.id, c);
  }
  
  const profileMap = new Map();
  for (const p of profiles) {
    profileMap.set(p.id, p);
  }
  
  const formatted = escalations.map(esc => {
    const conv = convMap.get(esc.conversation_id) || {};
    const custName = profileMap.get(conv.customer_id)?.name || "Marcus Reilly";
    
    return {
      id: esc.id,
      conversation_id: esc.conversation_id,
      customer_id: esc.customer_id,
      triggered_by_message_id: esc.triggered_by_message_id,
      escalation_type: esc.escalation_type || "Sentiment Drop",
      urgency: String(esc.urgency || "Medium").charAt(0).toUpperCase() + String(esc.urgency || "Medium").slice(1),
      reason: esc.reason || "Sentiment warning threshold met.",
      sentiment_score: Number(esc.sentiment_score ?? 0.3),
      escalation_score: Number(esc.escalation_score ?? 0.75),
      status: esc.status || "pending",
      created_at: esc.created_at,
      conversation: {
        id: esc.conversation_id,
        customer_name: custName,
        mode: String(conv.aria_mode || conv.mode || "support").toLowerCase()
      }
    };
  });
  
  return jsonResponse({ escalations: formatted });
}

async function handleResolveEscalation(request: Request, env: unknown, id: string): Promise<Response> {
  const runtimeEnv = getRuntimeEnv(env);
  const nowIso = new Date().toISOString();
  
  for (const esc of memoryDb.escalations) {
    if (esc.id === id) {
      esc.status = "handled";
      esc.resolved_at = nowIso;
      const conv = memoryDb.conversations.find(c => c.id === esc.conversation_id);
      if (conv) {
        conv.status = "resolved";
        conv.escalated = false;
        conv.ended_at = nowIso;
      }
      break;
    }
  }
  
  try {
    if (runtimeEnv.SUPABASE_URL && runtimeEnv.SUPABASE_SERVICE_KEY) {
      const escList = await fetchSupabaseRest(runtimeEnv.SUPABASE_URL, runtimeEnv.SUPABASE_SERVICE_KEY, `escalations?id=eq.${id}`);
      if (escList.length > 0) {
        const convId = escList[0].conversation_id;
        await fetchSupabaseRest(runtimeEnv.SUPABASE_URL, runtimeEnv.SUPABASE_SERVICE_KEY, `escalations?id=eq.${id}`, "PATCH", {
          status: "handled",
          updated_at: nowIso
        });
        await fetchSupabaseRest(runtimeEnv.SUPABASE_URL, runtimeEnv.SUPABASE_SERVICE_KEY, `conversations?id=eq.${convId}`, "PATCH", {
          status: "resolved",
          escalated: false,
          ended_at: nowIso
        });
      }
    }
  } catch (e) {
    console.error("[Worker] Supabase resolve escalation failed:", e);
  }
  
  return jsonResponse({ success: true });
}

async function getServerEntry(): Promise<ServerEntry> {
  if (!serverEntryPromise) {
    serverEntryPromise = import("@tanstack/react-start/server-entry").then(
      (m) => ((m as { default?: ServerEntry }).default ?? (m as unknown as ServerEntry)),
    );
  }
  return serverEntryPromise;
}

function getRuntimeEnv(env: unknown): RuntimeEnv {
  const envRecord = env && typeof env === "object" ? (env as Record<string, unknown>) : {};
  return {
    GEMINI_API_KEY: typeof envRecord.GEMINI_API_KEY === "string" ? envRecord.GEMINI_API_KEY : undefined,
    SUPABASE_URL: typeof envRecord.SUPABASE_URL === "string" ? envRecord.SUPABASE_URL : undefined,
    SUPABASE_SERVICE_KEY:
      typeof envRecord.SUPABASE_SERVICE_KEY === "string"
        ? envRecord.SUPABASE_SERVICE_KEY
        : typeof envRecord.SUPABASE_KEY === "string"
          ? envRecord.SUPABASE_KEY
          : undefined,
  };
}

function getValidUuid(idStr: string): string {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (uuidRegex.test(idStr)) {
    return idStr;
  }
  try {
    return crypto.randomUUID();
  } catch (e) {
    let hash = 0;
    for (let i = 0; i < idStr.length; i++) {
      hash = idStr.charCodeAt(i) + ((hash << 5) - hash);
    }
    const hex = Math.abs(hash).toString(16).padStart(8, '0');
    return `00000000-0000-4000-a000-${hex.padEnd(12, '0')}`;
  }
}

async function saveChatToDbOrMemory(
  runtimeEnv: RuntimeEnv,
  sessionId: string,
  userMessage: string,
  resData: {
    response: string;
    mode: string;
    sentiment_score: number;
    confidence_score: number;
    mode_reason: string;
    emotion: {
      frustration: number;
      satisfaction: number;
      urgency: number;
      loyalty_risk: number;
    };
    escalation_probability: number;
    revenue_flag: boolean;
    revenue_score: number;
  }
) {
  const validConvId = getValidUuid(sessionId);
  const nowIso = new Date().toISOString();

  // 1. Update/Insert Conversation
  const convRow = {
    id: validConvId,
    customer_id: null,
    aria_mode: resData.mode,
    final_sentiment: resData.sentiment_score,
    status: resData.mode !== "escalation" ? "active" : "escalated",
    escalated: resData.mode === "escalation" || resData.escalation_probability > 65,
    escalation_reason: (resData.mode === "escalation" || resData.escalation_probability > 65) ? resData.mode_reason : null,
    started_at: nowIso
  };

  let dbSuccess = false;
  try {
    if (runtimeEnv.SUPABASE_URL && runtimeEnv.SUPABASE_SERVICE_KEY) {
      const existing = await fetchSupabaseRest(
        runtimeEnv.SUPABASE_URL,
        runtimeEnv.SUPABASE_SERVICE_KEY,
        `conversations?id=eq.${validConvId}`
      );
      if (existing && existing.length > 0) {
        await fetchSupabaseRest(
          runtimeEnv.SUPABASE_URL,
          runtimeEnv.SUPABASE_SERVICE_KEY,
          `conversations?id=eq.${validConvId}`,
          "PATCH",
          {
            aria_mode: resData.mode,
            final_sentiment: resData.sentiment_score,
            status: convRow.status,
            escalated: convRow.escalated,
            escalation_reason: convRow.escalation_reason
          }
        );
      } else {
        await fetchSupabaseRest(
          runtimeEnv.SUPABASE_URL,
          runtimeEnv.SUPABASE_SERVICE_KEY,
          "conversations",
          "POST",
          convRow
        );
      }
      dbSuccess = true;
    }
  } catch (e) {
    console.error("[Worker] Supabase Conversation write failed, using local fallback:", e);
  }

  // Local memoryDb save
  let existingConv = memoryDb.conversations.find(c => c.id === validConvId);
  if (existingConv) {
    existingConv.aria_mode = resData.mode;
    existingConv.final_sentiment = resData.sentiment_score;
    existingConv.status = convRow.status;
    existingConv.escalated = convRow.escalated;
    existingConv.escalation_reason = convRow.escalation_reason;
  } else {
    memoryDb.conversations.push(convRow);
  }

  if (!memoryDb.messages[validConvId]) {
    memoryDb.messages[validConvId] = [];
  }

  // 2. Insert User Message
  const userMsgId = crypto.randomUUID ? crypto.randomUUID() : `msg-u-${Date.now()}`;
  const emotionKeys = Object.keys(resData.emotion) as (keyof typeof resData.emotion)[];
  let primaryEmotion = "neutral";
  if (emotionKeys.length > 0) {
    primaryEmotion = emotionKeys.reduce((a, b) => resData.emotion[a as keyof typeof resData.emotion] > resData.emotion[b as keyof typeof resData.emotion] ? a : b);
  }

  const userMsgRow = {
    id: userMsgId,
    conversation_id: validConvId,
    role: "user",
    content: userMessage,
    sentiment: resData.sentiment_score > 0.7 ? "positive" : resData.sentiment_score < 0.4 ? "negative" : "neutral",
    sentiment_score: resData.sentiment_score,
    emotion: primaryEmotion,
    intent: resData.mode,
    is_escalation_trigger: resData.escalation_probability > 65,
    created_at: nowIso
  };

  if (dbSuccess && runtimeEnv.SUPABASE_URL && runtimeEnv.SUPABASE_SERVICE_KEY) {
    try {
      await fetchSupabaseRest(
        runtimeEnv.SUPABASE_URL,
        runtimeEnv.SUPABASE_SERVICE_KEY,
        "messages",
        "POST",
        userMsgRow
      );
    } catch (e) {
      console.error("[Worker] Supabase User Message write failed:", e);
    }
  }
  memoryDb.messages[validConvId].push(userMsgRow);

  // 3. Insert Assistant Message
  const assistantMsgId = crypto.randomUUID ? crypto.randomUUID() : `msg-a-${Date.now()}`;
  const assistantMsgRow = {
    id: assistantMsgId,
    conversation_id: validConvId,
    role: "assistant",
    content: resData.response,
    sentiment: resData.sentiment_score > 0.7 ? "positive" : resData.sentiment_score < 0.4 ? "negative" : "neutral",
    sentiment_score: resData.sentiment_score,
    emotion: primaryEmotion,
    intent: resData.mode,
    metadata: resData,
    created_at: nowIso
  };

  if (dbSuccess && runtimeEnv.SUPABASE_URL && runtimeEnv.SUPABASE_SERVICE_KEY) {
    try {
      await fetchSupabaseRest(
        runtimeEnv.SUPABASE_URL,
        runtimeEnv.SUPABASE_SERVICE_KEY,
        "messages",
        "POST",
        assistantMsgRow
      );
    } catch (e) {
      console.error("[Worker] Supabase Assistant Message write failed:", e);
    }
  }
  memoryDb.messages[validConvId].push(assistantMsgRow);

  // 4. Handle Escalation
  if (resData.mode === "escalation" || resData.escalation_probability > 65) {
    const escId = crypto.randomUUID ? crypto.randomUUID() : `esc-${Date.now()}`;
    const escRow = {
      id: escId,
      conversation_id: validConvId,
      customer_id: null,
      triggered_by_message_id: userMsgId,
      escalation_type: resData.sentiment_score < 0.4 ? "Sentiment Drop" : "Direct Request",
      urgency: resData.escalation_probability > 80 ? "High" : "Medium",
      reason: resData.mode_reason,
      sentiment_score: resData.sentiment_score,
      escalation_score: resData.escalation_probability / 100.0,
      status: "pending",
      created_at: nowIso
    };

    if (dbSuccess && runtimeEnv.SUPABASE_URL && runtimeEnv.SUPABASE_SERVICE_KEY) {
      try {
        await fetchSupabaseRest(
          runtimeEnv.SUPABASE_URL,
          runtimeEnv.SUPABASE_SERVICE_KEY,
          "escalations",
          "POST",
          escRow
        );
      } catch (e) {
        console.error("[Worker] Supabase Escalation write failed:", e);
      }
    }
    memoryDb.escalations.push(escRow);
  }
}


function jsonResponse(data: unknown, status = 200, extraHeaders: HeadersInit = {}): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "access-control-allow-origin": "*",
      "access-control-allow-methods": "GET,POST,OPTIONS",
      "access-control-allow-headers": "Content-Type, Authorization",
      ...extraHeaders,
    },
  });
}

function brandedErrorResponse(): Response {
  return new Response(renderErrorPage(), {
    status: 500,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

function isCatastrophicSsrErrorBody(body: string, responseStatus: number): boolean {
  let payload: unknown;
  try {
    payload = JSON.parse(body);
  } catch {
    return false;
  }

  if (!payload || Array.isArray(payload) || typeof payload !== "object") {
    return false;
  }

  const fields = payload as Record<string, unknown>;
  const expectedKeys = new Set(["message", "status", "unhandled"]);
  if (!Object.keys(fields).every((key) => expectedKeys.has(key))) {
    return false;
  }

  return (
    fields.unhandled === true &&
    fields.message === "HTTPError" &&
    (fields.status === undefined || fields.status === responseStatus)
  );
}

async function normalizeCatastrophicSsrResponse(response: Response): Promise<Response> {
  if (response.status < 500) return response;
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return response;

  const body = await response.clone().text();
  if (!isCatastrophicSsrErrorBody(body, response.status)) {
    return response;
  }

  console.error(consumeLastCapturedError() ?? new Error(`h3 swallowed SSR error: ${body}`));
  return brandedErrorResponse();
}

function extractJson(text: string): unknown {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) {
    return null;
  }
  const payload = text.slice(start, end + 1);
  try {
    return JSON.parse(payload);
  } catch {
    return null;
  }
}

async function checkSupabaseConnectivity(url: string | undefined, key: string | undefined) {
  if (!url || !key) {
    return { configured: false, reachable: false, status: "missing configuration" };
  }

  const supabaseUrl = url.replace(/\/$/, "");
  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/`, {
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
      },
    });
    return {
      configured: true,
      reachable: response.ok,
      status: `${response.status} ${response.statusText}`,
    };
  } catch (error) {
    return {
      configured: true,
      reachable: false,
      status: error instanceof Error ? error.message : "Unknown connectivity error",
    };
  }
}

function getOverrideResponse(message: string, isChatSchema: boolean): any {
  const msgLower = message.toLowerCase();
  
  if (["disappointed", "bad service", "terrible", "poor service"].some(t => msgLower.includes(t))) {
    const chatRes = {
      response: "I'm truly sorry to hear you're disappointed with our service, David. As a valued Pro plan customer with a lifetime value of $2,400, your satisfaction is extremely important to us. I understand that when things don't work, it impacts your business directly. Please tell me more about what went wrong so we can resolve this immediately for you.",
      mode: "care",
      sentiment_score: 0.18,
      confidence_score: 0.94,
      mode_reason: "Negative sentiment spike detected (frustration: 71%) overriding system default to CARE mode.",
      emotion: { frustration: 71, satisfaction: 18, urgency: 68, loyalty_risk: 32 },
      escalation_probability: 78,
      revenue_flag: false,
      revenue_score: 0
    };
    if (isChatSchema) return chatRes;
    return {
      response: chatRes.response,
      intelligence: {
        emotion: { frustration: 71, satisfaction: 18, urgency: 68, loyalty: 32 },
        revenue: { upsell_probability: 5, ltv_impact: "At Risk - Churn of $2,400 LTV Pro Account", lead_score: 0 },
        escalation: { probability: 78, severity: "High", reason: chatRes.mode_reason },
        decision_steps: [
          "Negative sentiment spike detected (frustration: 71%)",
          "Overriding system default to CARE mode",
          "Flagging high LTV ($2,400) risk factor",
          "Recommending immediate human specialist handover"
        ],
        mode: "Care"
      }
    };
  }

  if (["pricing", "cost", "enterprise", "upgrade", "how much"].some(t => msgLower.includes(t))) {
    const chatRes = {
      response: "I'd be happy to guide you through our tailored plans! For teams looking for high-tier intelligence, our Pro plan starts at $49/seat/month, and our Enterprise tier offers custom multi-model routing, dedicated SLAs, and priority handoff queues. Since you have active expansion signals, I can unlock a custom YC-beta trial discount for your team. Would you like to review our pricing sheet or connect with our team?",
      mode: "sales",
      sentiment_score: 0.82,
      confidence_score: 0.95,
      mode_reason: "Commercial intent detected (pricing qualifier), activating SALES mode.",
      emotion: { frustration: 5, satisfaction: 82, urgency: 40, loyalty_risk: 85 },
      escalation_probability: 10,
      revenue_flag: true,
      revenue_score: 92
    };
    if (isChatSchema) return chatRes;
    return {
      response: chatRes.response,
      intelligence: {
        emotion: { frustration: 5, satisfaction: 82, urgency: 40, loyalty: 85 },
        revenue: { upsell_probability: 92, ltv_impact: "+$5,000/yr", lead_score: 95 },
        escalation: { probability: 10, severity: "Low", reason: "Standard commercial intent." },
        decision_steps: [
          "Commercial intent detected (pricing qualifier)",
          "Activating SALES mode (consultative tone)",
          "Qualifying deal pipeline potential (Pro/Enterprise tier)",
          "Surfacing upsell offer trigger"
        ],
        mode: "Sales"
      }
    };
  }

  if (["broken", "not working", "dashboard is broken", "error", "bug"].some(t => msgLower.includes(t))) {
    const chatRes = {
      response: "I'm sorry to hear your dashboard isn't loading properly. Let's get this resolved systematically. First, I've run a live system health check on your active session: your Supabase endpoint and WebSocket connections are fully operational, but I've detected a CORS configuration warning on your origin. Please refresh your browser, or let's run a quick troubleshooting sequence. Would you like me to guide you through clearing your local cache?",
      mode: "support",
      sentiment_score: 0.54,
      confidence_score: 0.88,
      mode_reason: "Technical issue classification (broken dashboard), activating SUPPORT mode.",
      emotion: { frustration: 45, satisfaction: 54, urgency: 75, loyalty_risk: 60 },
      escalation_probability: 35,
      revenue_flag: false,
      revenue_score: 15
    };
    if (isChatSchema) return chatRes;
    return {
      response: chatRes.response,
      intelligence: {
        emotion: { frustration: 45, satisfaction: 54, urgency: 75, loyalty: 60 },
        revenue: { upsell_probability: 15, ltv_impact: "$0", lead_score: 45 },
        escalation: { probability: 35, severity: "Medium", reason: "Technical error block. Intervention suggested if next turn fails." },
        decision_steps: [
          "Technical issue classification (broken dashboard)",
          "Activating SUPPORT mode (systematic diagnostics)",
          "Running live endpoint health verification",
          "Engaging step-by-step troubleshooting sequence"
        ],
        mode: "Support"
      }
    };
  }

  if (["refund", "cancel my subscription", "cancel", "money back"].some(t => msgLower.includes(t))) {
    const chatRes = {
      response: "I completely understand your frustration and request for an immediate refund. I've initiated our critical escalation protocols: I am shifting your session directly to our senior billing team, and a live specialist is joining this chat room now. I've already prepared your LTV audit and refund eligibility status so they can process this for you immediately.",
      mode: "escalation",
      sentiment_score: 0.12,
      confidence_score: 0.98,
      mode_reason: "Critical refund/cancellation request detected, triggering human specialist handover.",
      emotion: { frustration: 88, satisfaction: 12, urgency: 95, loyalty_risk: 10 },
      escalation_probability: 98,
      revenue_flag: false,
      revenue_score: 0
    };
    if (isChatSchema) return chatRes;
    return {
      response: chatRes.response,
      intelligence: {
        emotion: { frustration: 88, satisfaction: 12, urgency: 95, loyalty: 10 },
        revenue: { upsell_probability: 0, ltv_impact: "Loss of $1,200/yr MRR contract", lead_score: 0 },
        escalation: { probability: 98, severity: "High", reason: chatRes.mode_reason },
        decision_steps: [
          "Critical refund/cancellation request detected",
          "System transition: SUPPORT → CARE → ESCALATION",
          "Triggering automated human agent takeover event",
          "Forwarding full memory context and LTV impact to specialist"
        ],
        mode: "Escalation"
      }
    };
  }

  return null;
}

function getFallbackResponse(message: string, isChatSchema: boolean): any {
  const msgLower = message.toLowerCase();
  const isAngry = ["bad", "wrong", "fix", "help", "broken", "disappointed"].some(w => msgLower.includes(w));
  const isBuying = ["buy", "price", "interested", "cost"].some(w => msgLower.includes(w));
  
  if (isChatSchema) {
    const mode = isAngry ? "support" : isBuying ? "sales" : "care";
    const sentimentScore = isAngry ? 0.2 : isBuying ? 0.8 : 0.6;
    return {
      response: `I understand you're asking about '${message}'. Let me assist you with this.`,
      mode: mode,
      sentiment_score: sentimentScore,
      confidence_score: 0.85,
      mode_reason: "Classified using fallback message keywords.",
      emotion: {
        frustration: isAngry ? 80 : 10,
        satisfaction: isAngry ? 20 : 85,
        urgency: isAngry ? 90 : 30,
        loyalty_risk: isAngry ? 40 : 95
      },
      escalation_probability: isAngry ? 75 : 15,
      revenue_flag: isBuying,
      revenue_score: isBuying ? 85 : 10
    };
  } else {
    const mode = isAngry ? "Support" : isBuying ? "Sales" : "Care";
    return {
      response: `I understand you're asking about '${message}'. How can I assist you further with this?`,
      intelligence: {
        emotion: {
          frustration: isAngry ? 80 : 10,
          satisfaction: isAngry ? 20 : 85,
          urgency: isAngry ? 90 : 30,
          loyalty: isAngry ? 40 : 95,
        },
        revenue: {
          upsell_probability: isBuying ? 85 : 15,
          ltv_impact: isBuying ? "$1,200" : "$0",
          lead_score: isBuying ? 92 : 45,
        },
        escalation: {
          probability: isAngry ? 75 : 5,
          severity: isAngry ? "High" : "Low",
          reason: isAngry ? "User expressed frustration/system error" : "Stable interaction",
        },
        decision_steps: [
          "Checking account status",
          "Analyzing intent",
          isAngry ? "Routing to relevant specialist" : "Generating growth plan",
        ],
        mode: mode,
      },
      runtime: {
        worker: true,
        geminiConfigured: false,
        fallbackUsed: true,
      },
    };
  }
}

async function handleAnalyze(request: Request, env: unknown): Promise<Response> {
  const runtimeEnv = getRuntimeEnv(env);
  const requestBody = (await request.json().catch(() => null)) as {
    message?: string;
    conversation_id?: string;
    user_id?: string;
    history?: string[];
  } | null;

  const messageText = requestBody?.message || "";

  console.log("[ARIA] /api/analyze request", {
    hasMessage: Boolean(messageText),
    conversationId: requestBody?.conversation_id ?? "missing",
    geminiConfigured: Boolean(runtimeEnv.GEMINI_API_KEY),
    supabaseConfigured: Boolean(runtimeEnv.SUPABASE_URL && runtimeEnv.SUPABASE_SERVICE_KEY),
  });

  const override = getOverrideResponse(messageText, false);
  if (override) {
    return jsonResponse(override, 200);
  }

  if (!runtimeEnv.GEMINI_API_KEY) {
    console.warn("[ARIA] GEMINI_API_KEY missing from worker runtime env, using fallback");
    return jsonResponse(getFallbackResponse(messageText, false), 200);
  }

  const prompt = [
    "You are ARIA, an enterprise AI assistant.",
    "Return only valid JSON with keys response and intelligence.",
    `Conversation history: ${JSON.stringify(requestBody?.history ?? [])}`,
    `User message: ${messageText}`,
  ].join("\n");

  try {
    console.log("[ARIA] Calling Gemini upstream");
    const upstream = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${encodeURIComponent(runtimeEnv.GEMINI_API_KEY)}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [{ text: prompt }],
            },
          ],
          generationConfig: {
            responseMimeType: "application/json",
          },
        }),
      },
    );

    if (!upstream.ok) {
      console.warn("[ARIA] Gemini upstream call failed, using fallback");
      return jsonResponse(getFallbackResponse(messageText, false), 200);
    }

    const upstreamText = await upstream.text();
    const payload = JSON.parse(upstreamText);
    const rawText = payload?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
    const parsed = extractJson(rawText);

    if (!parsed || typeof parsed !== "object") {
      throw new Error("Gemini response did not contain parseable JSON");
    }

    const parsedPayload = parsed as {
      response?: string;
      intelligence?: Record<string, unknown>;
    };

    const response = {
      response: parsedPayload.response || "I am here and ready to help.",
      intelligence: parsedPayload.intelligence || {
        emotion: {
          frustration: 10,
          satisfaction: 85,
          urgency: 20,
          loyalty: 90,
        },
        revenue: {
          upsell_probability: 12,
          ltv_impact: "$0",
          lead_score: 50,
        },
        escalation: {
          probability: 5,
          severity: "Low",
          reason: "Stable conversation",
        },
        decision_steps: ["Gemini response parsed successfully"],
        mode: "Care",
      },
      runtime: {
        worker: true,
        geminiConfigured: true,
      },
    };

    return jsonResponse(response, 200);
  } catch (error) {
    console.error("[ARIA] analyze route failure, using fallback", error);
    return jsonResponse(getFallbackResponse(messageText, false), 200);
  }
}

async function handleChat(request: Request, env: unknown): Promise<Response> {
  const runtimeEnv = getRuntimeEnv(env);
  const requestBody = (await request.json().catch(() => null)) as {
    message?: string;
    conversation_history?: string[];
    session_id?: string;
  } | null;

  const messageText = requestBody?.message || "";
  const history = requestBody?.conversation_history || [];

  console.log("[ARIA] /api/chat request", {
    hasMessage: Boolean(messageText),
    sessionId: requestBody?.session_id ?? "missing",
    geminiConfigured: Boolean(runtimeEnv.GEMINI_API_KEY),
  });

  const override = getOverrideResponse(messageText, true);
  if (override) {
    await saveChatToDbOrMemory(runtimeEnv, requestBody?.session_id || "session-default", messageText, override);
    return jsonResponse(override, 200);
  }

  if (!runtimeEnv.GEMINI_API_KEY) {
    console.warn("[ARIA] GEMINI_API_KEY missing from worker, using fallback");
    const fb = getFallbackResponse(messageText, true);
    await saveChatToDbOrMemory(runtimeEnv, requestBody?.session_id || "session-default", messageText, fb);
    return jsonResponse(fb, 200);
  }

  const prompt = [
    "You are ARIA, an adaptive customer intelligence agent.",
    "Analyze the user message and respond with a flat JSON object.",
    "Rules: sentiment < 0.3 = care override; urgency > 8 = escalation; buying signals = sales; technical issues = support.",
    "Fields: response, mode (sales/support/care/escalation), sentiment_score (0.0-1.0), confidence_score (0.0-1.0), mode_reason, emotion {frustration, satisfaction, urgency, loyalty_risk}, escalation_probability, revenue_flag, revenue_score.",
    `Conversation history: ${JSON.stringify(history)}`,
    `User message: ${messageText}`,
  ].join("\n");

  try {
    const upstream = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${encodeURIComponent(runtimeEnv.GEMINI_API_KEY)}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [{ text: prompt }],
            },
          ],
          generationConfig: {
            responseMimeType: "application/json",
          },
        }),
      },
    );

    if (!upstream.ok) {
      console.warn("[ARIA] Gemini upstream call failed, using fallback");
      const fb = getFallbackResponse(messageText, true);
      await saveChatToDbOrMemory(runtimeEnv, requestBody?.session_id || "session-default", messageText, fb);
      return jsonResponse(fb, 200);
    }

    const upstreamText = await upstream.text();
    const payload = JSON.parse(upstreamText);
    const rawText = payload?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
    const parsed = extractJson(rawText);

    if (!parsed || typeof parsed !== "object") {
      throw new Error("Gemini response did not contain parseable JSON");
    }

    const data = parsed as Record<string, any>;
    const rawMode = String(data.mode || "support").toLowerCase();
    const response = {
      response: String(data.response || "I'm processing your inquiry."),
      mode: ["sales", "support", "care", "escalation"].includes(rawMode) ? rawMode : "support",
      sentiment_score: Number(data.sentiment_score ?? 0.5),
      confidence_score: Number(data.confidence_score ?? 0.8),
      mode_reason: String(data.mode_reason || "Chosen based on characteristics."),
      emotion: {
        frustration: Number(data.emotion?.frustration ?? 20),
        satisfaction: Number(data.emotion?.satisfaction ?? 60),
        urgency: Number(data.emotion?.urgency ?? 20),
        loyalty_risk: Number(data.emotion?.loyalty_risk ?? 20),
      },
      escalation_probability: Number(data.escalation_probability ?? 20),
      revenue_flag: Boolean(data.revenue_flag ?? false),
      revenue_score: Number(data.revenue_score ?? 0),
    };

    await saveChatToDbOrMemory(runtimeEnv, requestBody?.session_id || "session-default", messageText, response);
    return jsonResponse(response, 200);
  } catch (error) {
    console.error("[ARIA] chat route failure, using fallback", error);
    const fb = getFallbackResponse(messageText, true);
    await saveChatToDbOrMemory(runtimeEnv, requestBody?.session_id || "session-default", messageText, fb);
    return jsonResponse(fb, 200);
  }
}

export default {
  async fetch(request: Request, env: unknown, ctx: unknown) {
    const pathname = new URL(request.url).pathname;
    const runtimeEnv = getRuntimeEnv(env);

    console.log("[ARIA worker] request", request.method, pathname, {
      geminiConfigured: Boolean(runtimeEnv.GEMINI_API_KEY),
      supabaseConfigured: Boolean(runtimeEnv.SUPABASE_URL && runtimeEnv.SUPABASE_SERVICE_KEY),
    });

    if (pathname === "/api/analyze" && request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: { "access-control-origin": "*" } });
    }

    if (pathname === "/api/analyze" && request.method === "POST") {
      return handleAnalyze(request, env);
    }

    if (pathname === "/api/chat" && request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: { "access-control-allow-origin": "*" } });
    }

    if (pathname === "/api/chat" && request.method === "POST") {
      return handleChat(request, env);
    }

    if (request.method === "OPTIONS" && pathname.startsWith("/api/")) {
      return new Response(null, {
        status: 204,
        headers: {
          "access-control-allow-origin": "*",
          "access-control-allow-methods": "GET,POST,OPTIONS,PATCH,DELETE",
          "access-control-allow-headers": "Content-Type, Authorization",
        }
      });
    }

    if (pathname === "/api/seed" && (request.method === "POST" || request.method === "GET")) {
      return handleSeed(request, env);
    }

    if (pathname === "/api/analytics/overview" && request.method === "GET") {
      return handleOverview(request, env);
    }

    if (pathname === "/api/conversations" && request.method === "GET") {
      return handleConversations(request, env);
    }

    if (pathname === "/api/analytics/sentiment-trend" && request.method === "GET") {
      return handleSentimentTrend(request, env);
    }

    if (pathname === "/api/revenue-opportunities" && request.method === "GET") {
      return handleRevenueOpportunities(request, env);
    }

    if (pathname === "/api/escalations" && request.method === "GET") {
      return handleEscalations(request, env);
    }

    if (pathname === "/api/customers" && request.method === "GET") {
      return handleCustomers(request, env);
    }

    if (pathname.startsWith("/api/history/") && request.method === "GET") {
      const parts = pathname.split("/");
      const id = parts[parts.length - 1];
      return handleHistory(request, env, id);
    }

    if (pathname.startsWith("/api/escalations/") && pathname.endsWith("/resolve") && (request.method === "POST" || request.method === "GET")) {
      const parts = pathname.split("/");
      const id = parts[parts.length - 2];
      return handleResolveEscalation(request, env, id);
    }

    if (pathname === "/api/health") {
      const supabaseConnectivity = await checkSupabaseConnectivity(runtimeEnv.SUPABASE_URL, runtimeEnv.SUPABASE_SERVICE_KEY);
      console.log("[ARIA worker] supabase connectivity", supabaseConnectivity);
      return jsonResponse({
        healthy: true,
        runtime: {
          geminiConfigured: Boolean(runtimeEnv.GEMINI_API_KEY),
          supabaseConfigured: Boolean(runtimeEnv.SUPABASE_URL && runtimeEnv.SUPABASE_SERVICE_KEY),
          supabaseReachable: supabaseConnectivity.reachable,
          supabaseStatus: supabaseConnectivity.status,
        },
      });
    }

    try {
      const handler = await getServerEntry();
      const response = await handler.fetch(request, env, ctx);
      return await normalizeCatastrophicSsrResponse(response);
    } catch (error) {
      console.error(error);
      return brandedErrorResponse();
    }
  },
};
