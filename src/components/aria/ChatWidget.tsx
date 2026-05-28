import { useEffect, useMemo, useRef, useState } from "react";
import { Send, Sparkles, Brain, TrendingUp, AlertTriangle, ShieldCheck } from "lucide-react";

export type Mode = "sales" | "support" | "care" | "escalation";
export type Msg = { role: "user" | "aria"; text: string; mode?: Mode; sentiment?: number; reasoning?: string };

const MODE_META: Record<Mode, { label: string; color: string; bg: string; ring: string }> = {
  sales: { label: "Sales", color: "#3B82F6", bg: "rgba(59,130,246,0.14)", ring: "rgba(59,130,246,0.45)" },
  support: { label: "Support", color: "#F59E0B", bg: "rgba(245,158,11,0.14)", ring: "rgba(245,158,11,0.45)" },
  care: { label: "Care", color: "#FB7185", bg: "rgba(251,113,133,0.14)", ring: "rgba(251,113,133,0.45)" },
  escalation: { label: "Escalation", color: "#A855F7", bg: "rgba(168,85,247,0.18)", ring: "rgba(168,85,247,0.5)" },
};

export function detectMode(text: string): Mode {
  const t = text.toLowerCase();
  if (/(refund|cancel|lawyer|manager|unacceptable|sue|escalat)/.test(t)) return "escalation";
  if (/(upset|angry|frustrat|disappoint|terrible|hate|awful|sad|honestly)/.test(t)) return "care";
  if (/(broke|bug|error|not working|issue|problem|fix|help|stuck)/.test(t)) return "support";
  if (/(pric|cost|plan|buy|upgrade|demo|enterprise|trial|features)/.test(t)) return "sales";
  return "support";
}

function respond(_text: string, mode: Mode): { text: string; reasoning: string; sentiment: number } {
  if (mode === "escalation")
    return {
      text: "I understand — this needs a human on it right now. I'm bringing in a senior specialist with full context of our conversation. Stay with me.",
      reasoning: "Detected escalation keywords + sustained negative sentiment. Routing to human with conversation summary attached.",
      sentiment: 22,
    };
  if (mode === "care")
    return {
      text: "I hear you — that sounds genuinely frustrating, and I'm sorry you're dealing with this. Let's take it one step at a time. What happened first?",
      reasoning: "Affective language detected. Switched to empathy-first response; suppressed upsell hooks; flagged retention risk.",
      sentiment: 38,
    };
  if (mode === "sales")
    return {
      text: "Great question. Our team plans start at $49/mo and scale with usage. Want me to map this to your team size?",
      reasoning: "Buying intent signals present. Surfaced pricing anchor + qualification question. Logged as warm lead.",
      sentiment: 84,
    };
  return {
    text: "Got it — let's get this sorted. Could you share what you were doing right before this happened?",
    reasoning: "Task-oriented language. Activated diagnostic flow; no upsell injected.",
    sentiment: 62,
  };
}

export function ChatWidget({
  seed,
  interactive = true,
  showIntelligence = false,
}: {
  seed?: Msg[];
  interactive?: boolean;
  showIntelligence?: boolean;
}) {
  const [messages, setMessages] = useState<Msg[]>(
    seed ?? [
      { role: "user", text: "Hey, is this thing actually different from a normal chatbot?" },
      { role: "aria", mode: "sales", sentiment: 78, reasoning: "Curiosity signal. Anchor on differentiation; soft-qualify.", text: "Fair question. Most bots are locked to one job. I read the conversation and shift — sales, support, or care — as you do." },
      { role: "user", text: "Cool. Also my last invoice was wrong though." },
      { role: "aria", mode: "support", sentiment: 64, reasoning: "Topic switch → billing. Drop sales context, route to support flow.", text: "Let's fix that. Can you share the invoice number? I'll pull it up and walk through the line items with you." },
    ],
  );
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, thinking]);

  const lastAria = useMemo(() => [...messages].reverse().find((m) => m.role === "aria"), [messages]);
  const activeMode: Mode = lastAria?.mode ?? "support";
  const sentiment = lastAria?.sentiment ?? 60;
  const confidence = Math.min(98, 60 + Math.round(sentiment * 0.35));
  const escalationRisk = Math.max(4, 100 - sentiment);

  const send = () => {
    const text = input.trim();
    if (!text || !interactive) return;
    setMessages((m) => [...m, { role: "user", text }]);
    setInput("");
    setThinking(true);
    const mode = detectMode(text);
    const r = respond(text, mode);
    setTimeout(() => {
      setMessages((m) => [
        ...m,
        { role: "aria", mode, sentiment: r.sentiment, reasoning: r.reasoning, text: r.text },
      ]);
      setThinking(false);
    }, 850);
  };

  return (
    <div className="glass-strong relative w-full overflow-hidden rounded-2xl shadow-[0_30px_100px_-20px_rgba(168,85,247,0.55)]">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/5 px-5 py-3.5">
        <div className="flex items-center gap-2.5">
          <div className="relative flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-[#6D28D9] to-[#C026D3] shadow-[0_0_20px_-4px_rgba(168,85,247,0.8)]">
            <Sparkles className="h-4 w-4 text-white" />
            <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-400 ring-2 ring-[#0E0820]" />
          </div>
          <div>
            <div className="text-sm font-semibold leading-tight">ARIA</div>
            <div className="text-[10px] text-muted-foreground flex items-center gap-1.5">
              <span className="inline-block h-1 w-1 rounded-full bg-emerald-400" />
              Adaptive Intelligence · Online
            </div>
          </div>
        </div>
        <span
          key={activeMode}
          className="animate-slide-spring inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-medium ring-1"
          style={{
            color: MODE_META[activeMode].color,
            background: MODE_META[activeMode].bg,
            boxShadow: `inset 0 0 0 1px ${MODE_META[activeMode].ring}, 0 0 14px -2px ${MODE_META[activeMode].ring}`,
          }}
        >
          <span className="h-1.5 w-1.5 rounded-full animate-pulse-glow" style={{ background: MODE_META[activeMode].color, color: MODE_META[activeMode].color }} />
          {MODE_META[activeMode].label} mode
        </span>
      </div>

      {/* Live intelligence strip */}
      <div className="grid grid-cols-3 divide-x divide-white/5 border-b border-white/5 bg-white/[0.015] text-[10px]">
        <Metric label="Confidence" value={`${confidence}%`} color="#A855F7" />
        <Metric label="Sentiment" value={`${sentiment}`} color={sentiment > 60 ? "#10B981" : sentiment > 40 ? "#F59E0B" : "#FB7185"} />
        <Metric label="Escalation" value={`${escalationRisk}%`} color={escalationRisk > 60 ? "#A855F7" : "#6B7280"} />
      </div>

      {/* Messages */}
      <div className="max-h-[380px] min-h-[300px] space-y-3 overflow-y-auto px-5 py-5">
        {messages.map((m, i) => (
          <div key={i} className={`animate-slide-spring flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[85%] ${m.role === "user" ? "" : "space-y-1.5"}`}>
              {m.role === "aria" && m.mode && (
                <span
                  className="inline-block rounded-full px-2 py-0.5 text-[10px] font-medium"
                  style={{ color: MODE_META[m.mode].color, background: MODE_META[m.mode].bg }}
                >
                  {MODE_META[m.mode].label} mode
                </span>
              )}
              <div
                className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                  m.role === "user"
                    ? "bg-gradient-to-br from-[#6D28D9] to-[#4F46E5] text-white shadow-[0_8px_24px_-8px_rgba(109,40,217,0.7)]"
                    : "bg-white/[0.04] text-foreground ring-1 ring-white/[0.06] backdrop-blur"
                }`}
              >
                {m.text}
              </div>
              {m.role === "aria" && m.reasoning && (
                <div className="flex items-start gap-1.5 rounded-md border border-white/[0.05] bg-white/[0.02] px-2 py-1.5 text-[10px] text-white/50">
                  <Brain className="mt-0.5 h-3 w-3 shrink-0 text-[#A855F7]" />
                  <span><span className="text-white/70">Why this:</span> {m.reasoning}</span>
                </div>
              )}
              {m.role === "aria" && typeof m.sentiment === "number" && (
                <div className="flex items-center gap-2 pl-1 pt-0.5">
                  <span className="text-[10px] text-muted-foreground">sentiment</span>
                  <div className="h-1 w-24 overflow-hidden rounded-full bg-white/[0.06]">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${m.sentiment}%`,
                        background: m.mode ? MODE_META[m.mode].color : "#06B6D4",
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
        {thinking && (
          <div className="flex gap-1 pl-2">
            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.3s]" />
            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.15s]" />
            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground" />
          </div>
        )}
        <div ref={endRef} />
      </div>

      {showIntelligence && (
        <div className="grid grid-cols-3 gap-2 border-t border-white/5 bg-white/[0.015] px-3 py-2.5 text-[10px]">
          <SignalChip icon={TrendingUp} label="Revenue" value={activeMode === "sales" ? "Upsell · 84%" : "—"} color="#3B82F6" />
          <SignalChip icon={AlertTriangle} label="Risk" value={escalationRisk > 50 ? "Churn risk" : "Stable"} color={escalationRisk > 50 ? "#FB7185" : "#10B981"} />
          <SignalChip icon={ShieldCheck} label="Action" value={activeMode === "escalation" ? "Handoff" : "Auto-resolve"} color="#A855F7" />
        </div>
      )}

      {/* Input */}
      <div className="border-t border-white/5 px-3 py-3">
        <div className="flex items-center gap-2 rounded-xl bg-white/[0.04] px-3 py-2 ring-1 ring-white/[0.06] transition focus-within:ring-[#A855F7]/50 focus-within:bg-white/[0.06]">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            placeholder={interactive ? "Try: I'm honestly disappointed…" : "Demo conversation"}
            disabled={!interactive}
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
          <button
            onClick={send}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#6D28D9] to-[#C026D3] text-white transition hover:glow-violet disabled:opacity-50"
            disabled={!interactive || !input.trim()}
            aria-label="Send message"
          >
            <Send className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

function Metric({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="px-3 py-2">
      <div className="text-[9px] uppercase tracking-wider text-white/40">{label}</div>
      <div className="mt-0.5 text-xs font-semibold tabular-nums" style={{ color }}>{value}</div>
    </div>
  );
}

function SignalChip({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div className="flex items-center gap-1.5 rounded-md border border-white/[0.05] bg-white/[0.02] px-2 py-1.5">
      <Icon className="h-3 w-3 shrink-0" style={{ color }} />
      <div className="min-w-0">
        <div className="text-[9px] uppercase tracking-wider text-white/40">{label}</div>
        <div className="truncate text-[10px] font-medium" style={{ color }}>{value}</div>
      </div>
    </div>
  );
}