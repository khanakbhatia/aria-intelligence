import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Nav } from "@/components/aria/Nav";
import { ChatWidget } from "@/components/aria/ChatWidget";
import { CountUp } from "@/components/aria/CountUp";
import { FloatingChat } from "@/components/aria/FloatingChat";
import { EmotionPanel, RevenuePanel as RevPanel, EscalationPanel, DecisionPanel } from "@/components/aria/IntelPanels";
import { useMemo, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  Sparkles,
  TrendingDown,
  Lock,
  AlertTriangle,
  ShoppingBag,
  LifeBuoy,
  HeartHandshake,
  Users,
  ArrowUpRight,
  Activity,
  MessageSquare,
  CheckCircle2,
  Brain,
  Zap,
  TrendingUp,
  Shield,
  Heart,
  Eye,
  Layers,
  Database,
  GitBranch,
  Workflow,
  Cpu,
  LineChart,
} from "lucide-react";
import { detectMode, type Mode } from "@/components/aria/ChatWidget";
import { analyzeSentimentVader } from "@/lib/sentiment";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  return (
    <main id="top" className="relative min-h-screen overflow-x-hidden bg-[#05010A] text-foreground">
      <Nav />
      <Hero />
      <SocialProof />
      <Problem />
      <ModeSystem />
      <CommandCenter />
      <WowMoment />
      <Features />
      <DashboardPreview />
      <FinalCTA />
      <Footer />
      <FloatingChat />
    </main>
  );
}

/* ============================== HERO ============================== */
function Hero() {
  return (
    <section className="relative pt-32 pb-20 sm:pt-40 sm:pb-28">
      <div className="absolute inset-0 mesh-bg animate-mesh opacity-80" />
      <div className="absolute inset-0 grid-bg opacity-60" />
      <div className="absolute inset-0 noise opacity-[0.35]" />
      <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-5 lg:grid-cols-12 lg:px-8">
        <div className="lg:col-span-7">
          <span className="animate-fade-up inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-white/70 backdrop-blur">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#A855F7] opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#A855F7]" />
            </span>
            <span>Now in private beta · Built for scale</span>
          </span>
          <h1 className="animate-fade-up delay-100 mt-6 text-[42px] font-extrabold leading-[1.02] tracking-[-0.025em] sm:text-6xl lg:text-[80px]">
            <span className="text-gradient">One AI Agent.</span>
            <br />
            <span className="text-gradient">Every Conversation.</span>
            <br />
            <span className="text-gradient-violet">Zero Friction.</span>
          </h1>
          <p className="animate-fade-up delay-200 mt-6 max-w-xl text-base leading-relaxed text-white/60 sm:text-lg">
            ARIA adapts in real-time — sales, support, escalation, and customer care unified into one intelligent conversational operating layer.
          </p>
          <div className="animate-fade-up delay-300 mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg" className="rounded-full bg-gradient-to-r from-[#6D28D9] to-[#C026D3] px-6 text-white hover:opacity-90 hover:glow-violet">
              <a href="#demo">See ARIA Live <ArrowRight className="ml-1 h-4 w-4" /></a>
            </Button>
            <Button asChild size="lg" variant="outline" className="rounded-full border-white/15 bg-white/[0.02] px-6 text-white backdrop-blur hover:bg-white/[0.06]">
              <Link to="/dashboard">Open Command Center</Link>
            </Button>
          </div>
          <div className="animate-fade-up delay-400 mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-[11px] text-white/40">
            <span className="flex items-center gap-1.5"><Shield className="h-3 w-3" /> Enterprise-grade security</span>
            <span className="flex items-center gap-1.5"><Zap className="h-3 w-3" /> &lt;200ms inference</span>
            <span className="flex items-center gap-1.5"><Brain className="h-3 w-3" /> Multi-model routing</span>
          </div>
        </div>
        <div className="animate-fade-up delay-300 relative lg:col-span-5">
          <div className="absolute -inset-10 rounded-[3rem] bg-gradient-to-br from-[#6D28D9]/30 via-[#A855F7]/20 to-[#312E81]/30 blur-3xl" />
          <div className="relative">
            <ChatWidget interactive={false} showIntelligence />
          </div>
          <div className="absolute -left-6 top-10 hidden animate-float lg:block">
            <MiniCard icon={Heart} label="Sentiment" value="84" color="#10B981" />
          </div>
          <div className="absolute -right-4 bottom-12 hidden animate-float lg:block" style={{ animationDelay: "1.2s" }}>
            <MiniCard icon={TrendingUp} label="Revenue" value="+$4.2k" color="#3B82F6" />
          </div>
        </div>
      </div>
    </section>
  );
}

function MiniCard({ icon: Icon, label, value, color }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string; color: string }) {
  return (
    <div className="glass-strong flex items-center gap-2.5 rounded-xl px-3 py-2.5">
      <div className="flex h-7 w-7 items-center justify-center rounded-md" style={{ background: `${color}22`, color }}>
        <Icon className="h-3.5 w-3.5" />
      </div>
      <div>
        <div className="text-[9px] uppercase tracking-wider text-white/40">{label}</div>
        <div className="text-sm font-semibold tabular-nums" style={{ color }}>{value}</div>
      </div>
    </div>
  );
}

/* ============================ SOCIAL PROOF ============================ */
function SocialProof() {
  return (
    <section className="border-y border-white/[0.05] bg-white/[0.01] py-8">
      <div className="mx-auto max-w-6xl px-5">
        <p className="text-center text-[10px] uppercase tracking-[0.2em] text-white/30">Designed for teams at modern companies</p>
      </div>
    </section>
  );
}

/* ============================== PROBLEM ============================== */
function Problem() {
  const stats = [
    { icon: TrendingDown, value: 67, suffix: "%", text: "of customer churn happens due to poor support timing.", color: "#FB7185", delay: 100 },
    { icon: Lock, value: 1, suffix: " mode", text: "Most bots are hardcoded forever — one job, one tone, no nuance.", color: "#F59E0B", delay: 300 },
    { icon: AlertTriangle, value: 400, prefix: "$", suffix: "B", text: "lost annually to unresolved customer issues across industries.", color: "#A855F7", delay: 500 },
  ];
  return (
    <section id="product" className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <span className="text-[11px] uppercase tracking-[0.25em] text-[#A855F7]">The problem</span>
          <h2 className="mt-3 text-balance text-4xl font-bold tracking-tight sm:text-5xl">
            Your customers switch contexts.
            <br />
            <span className="text-gradient-violet">Your AI shouldn't be stuck in one mode.</span>
          </h2>
        </div>
        <div className="mt-14 grid gap-5 md:grid-cols-3">
          {stats.map((s, i) => (
            <div
              key={i}
              className="glass group relative overflow-hidden rounded-2xl p-7 transition-all duration-300 hover:-translate-y-1 hover:border-white/15"
            >
              <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full opacity-30 blur-2xl transition-opacity group-hover:opacity-50" style={{ background: s.color }} />
              <div className="relative">
                <div className="mb-5 flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: `${s.color}1A`, color: s.color }}>
                  <s.icon className="h-5 w-5" />
                </div>
                <div className="text-5xl font-bold tracking-tight" style={{ color: s.color }}>
                  <CountUp to={s.value} prefix={s.prefix} suffix={s.suffix} delay={s.delay} />
                </div>
                <p className="mt-4 text-sm leading-relaxed text-white/60">{s.text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============================ MODE SYSTEM ============================ */
function ModeSystem() {
  const modes = [
    { icon: ShoppingBag, label: "Sales Mode", color: "#3B82F6", desc: "Detects buying signals, qualifies leads, and guides prospects to conversion — naturally, never pushy.", tag: "Revenue intelligence" },
    { icon: LifeBuoy, label: "Support Mode", color: "#F59E0B", desc: "Patient, methodical, expert. Resolves issues with full context across every system you connect.", tag: "Diagnostic engine" },
    { icon: HeartHandshake, label: "Care Mode", color: "#FB7185", desc: "When customers are upset, ARIA leads with empathy before solutions. Humans need to feel heard.", tag: "Emotion-aware" },
  ];
  return (
    <section className="py-24">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <span className="text-[11px] uppercase tracking-[0.25em] text-[#A855F7]">The system</span>
          <h2 className="mt-3 text-balance text-4xl font-bold tracking-tight sm:text-5xl text-gradient">
            Three modes. One agent. Zero hand-offs missed.
          </h2>
        </div>
        <div className="mt-14 grid gap-5 md:grid-cols-3">
          {modes.map((m) => (
            <div
              key={m.label}
              className="group relative overflow-hidden rounded-2xl border border-white/[0.06] bg-gradient-to-b from-white/[0.04] to-white/[0.01] p-7 transition-all hover:-translate-y-1"
              style={{ boxShadow: `inset 0 1px 0 ${m.color}30` }}
            >
              <div className="absolute inset-x-0 top-0 h-px" style={{ background: `linear-gradient(90deg, transparent, ${m.color}, transparent)` }} />
              <div className="absolute -top-20 left-1/2 h-40 w-40 -translate-x-1/2 rounded-full opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-40" style={{ background: m.color }} />
              <div className="relative">
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl" style={{ background: `${m.color}1A`, color: m.color, boxShadow: `0 0 30px -10px ${m.color}` }}>
                  <m.icon className="h-5 w-5" />
                </div>
                <div className="text-[10px] uppercase tracking-widest text-white/40">{m.tag}</div>
                <h3 className="mt-1 text-xl font-semibold" style={{ color: m.color }}>{m.label}</h3>
                <p className="mt-3 text-sm leading-relaxed text-white/60">{m.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Escalation engine */}
        <div className="mt-5 grid gap-5 lg:grid-cols-5">
          <div className="glass-violet relative overflow-hidden rounded-2xl p-7 lg:col-span-3">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#A855F7]/15 text-[#A855F7]">
                <Workflow className="h-5 w-5" />
              </div>
              <div>
                <span className="text-[10px] uppercase tracking-widest text-white/40">Escalation Engine</span>
                <h3 className="mt-1 text-xl font-semibold text-white">When humans are needed, ARIA hands off with full memory.</h3>
                <p className="mt-2 text-sm text-white/60">Your team picks up exactly where ARIA left off — transcript, sentiment timeline, customer history, suggested resolution.</p>
              </div>
            </div>
            {/* timeline */}
            <div className="mt-6 space-y-2">
              {[
                { t: "00:14", c: "#3B82F6", m: "Sales", txt: "Detected pricing intent · qualified as warm lead" },
                { t: "01:42", c: "#F59E0B", m: "Support", txt: "Topic shift → billing exception · running diagnostic" },
                { t: "03:08", c: "#FB7185", m: "Care", txt: "Negative sentiment detected · empathy-first response" },
                { t: "04:22", c: "#A855F7", m: "Escalate", txt: "Routing to senior specialist with full context" },
              ].map((row) => (
                <div key={row.t} className="flex items-center gap-3 rounded-lg border border-white/[0.05] bg-white/[0.02] px-3 py-2 text-xs">
                  <span className="tabular-nums text-white/40">{row.t}</span>
                  <span className="rounded-full px-2 py-0.5 text-[10px] font-medium" style={{ background: `${row.c}1A`, color: row.c }}>{row.m}</span>
                  <span className="truncate text-white/70">{row.txt}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="grid gap-3 lg:col-span-2">
            <EmotionPanel />
            <EscalationPanel />
          </div>
        </div>
      </div>
    </section>
  );
}

/* ============================ COMMAND CENTER ============================ */
function CommandCenter() {
  return (
    <section className="relative py-24">
      <div className="absolute inset-x-0 top-1/3 mx-auto h-96 max-w-4xl bg-[#6D28D9]/20 blur-[140px]" />
      <div className="relative mx-auto max-w-7xl px-5 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <span className="text-[11px] uppercase tracking-[0.25em] text-[#A855F7]">Live command center</span>
          <h2 className="mt-3 text-balance text-4xl font-bold tracking-tight sm:text-5xl text-gradient">
            Mission control for customer intelligence.
          </h2>
          <p className="mt-4 text-white/60">Every conversation, every signal, every dollar — in one cinematic operating layer.</p>
        </div>
        <div className="relative mt-14">
          <div className="glass-strong relative overflow-hidden rounded-2xl p-5 sm:p-7">
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-[#FB7185]" />
                <span className="h-2.5 w-2.5 rounded-full bg-[#F59E0B]" />
                <span className="h-2.5 w-2.5 rounded-full bg-[#10B981]" />
                <span className="ml-4 text-xs text-white/40">aria.app / overview</span>
              </div>
              <span className="flex items-center gap-1.5 text-xs text-emerald-400">
                <span className="relative flex h-2 w-2"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" /><span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" /></span>
                Live
              </span>
            </div>
            <div className="grid gap-4 pt-6 lg:grid-cols-12">
              {/* stat cards */}
              <div className="grid grid-cols-2 gap-3 lg:col-span-8 lg:grid-cols-4">
                {[
                  { label: "Conversations", value: "1,284", trend: "+12.4%", color: "#A855F7" },
                  { label: "Resolution rate", value: "89%", trend: "+3.1%", color: "#10B981" },
                  { label: "Revenue detected", value: "$48.2k", trend: "+22%", color: "#3B82F6" },
                  { label: "Escalations", value: "3", trend: "-2", color: "#FB7185" },
                ].map((s) => (
                  <div key={s.label} className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
                    <div className="text-[10px] uppercase tracking-wider text-white/40">{s.label}</div>
                    <div className="mt-1 text-2xl font-semibold tabular-nums">{s.value}</div>
                    <div className="mt-0.5 text-[11px]" style={{ color: s.color }}>{s.trend}</div>
                  </div>
                ))}
                {/* chart */}
                <div className="col-span-2 mt-1 rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 lg:col-span-4">
                  <div className="mb-3 flex items-center justify-between text-[11px]">
                    <span className="text-white/60">Sentiment · last 24h</span>
                    <span className="text-[#A855F7]">live</span>
                  </div>
                  <MockChart />
                </div>
                {/* heatmap */}
                <div className="col-span-2 rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 lg:col-span-4">
                  <div className="mb-3 text-[11px] text-white/60">Issue priority heatmap</div>
                  <Heatmap />
                </div>
              </div>

              {/* right rail */}
              <div className="space-y-3 lg:col-span-4">
                <RevPanel />
                <EmotionPanel frustration={42} satisfaction={58} urgency={36} loyalty={22} />
                <DecisionPanel steps={["User asked about pricing → enter Sales", "Detected frustration spike → soft-pivot Care", "Sentiment recovered → returned to Support"]} />
              </div>
            </div>

            {/* live conversation strip */}
            <div className="mt-5 grid gap-3 md:grid-cols-3">
              {[
                { mode: "Sales", color: "#3B82F6", text: "Acme Co. — pricing inquiry · high intent" },
                { mode: "Support", color: "#F59E0B", text: "Billing exception · resolved in 2 turns" },
                { mode: "Care", color: "#FB7185", text: "Churn risk · empathy path engaged" },
              ].map((r) => (
                <div key={r.mode} className="flex items-center gap-3 rounded-lg border border-white/[0.06] bg-white/[0.02] p-3 text-xs">
                  <span className="rounded-full px-2 py-0.5" style={{ background: `${r.color}22`, color: r.color }}>{r.mode}</span>
                  <span className="truncate text-white/60">{r.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* floating cards */}
          <FloatingCard className="left-2 top-6 sm:-left-6 sm:top-12" icon={MessageSquare} value="247" label="convos today" accent="#A855F7" />
          <FloatingCard className="right-2 top-32 sm:-right-6" icon={CheckCircle2} value="89%" label="resolution" accent="#10B981" />
          <FloatingCard className="bottom-6 right-10 sm:-bottom-6 sm:right-24" icon={Activity} value="7" label="opportunities" accent="#3B82F6" />
        </div>
      </div>
    </section>
  );
}

function MockChart() {
  const pts = [0.55, 0.62, 0.48, 0.71, 0.66, 0.78, 0.42, 0.58, 0.81, 0.74, 0.69, 0.86];
  const W = 320; const H = 90;
  const sx = W / (pts.length - 1);
  const yFor = (v: number) => H - v * H;
  const path = pts.map((v, i) => {
    if (i === 0) return `M 0 ${yFor(v)}`;
    const px = (i - 1) * sx, py = yFor(pts[i - 1]);
    const x = i * sx, y = yFor(v);
    const cx = (px + x) / 2;
    return `C ${cx} ${py}, ${cx} ${y}, ${x} ${y}`;
  }).join(" ");
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-20 w-full">
      <defs>
        <linearGradient id="ga" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#A855F7" stopOpacity="0.5" /><stop offset="100%" stopColor="#A855F7" stopOpacity="0" /></linearGradient>
        <linearGradient id="gl" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#6D28D9" /><stop offset="100%" stopColor="#C026D3" /></linearGradient>
      </defs>
      <path d={`${path} L ${W} ${H} L 0 ${H} Z`} fill="url(#ga)" />
      <path d={path} stroke="url(#gl)" strokeWidth="2" fill="none" strokeLinecap="round" />
    </svg>
  );
}

function Heatmap() {
  const cols = 12, rows = 5;
  return (
    <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
      {Array.from({ length: cols * rows }).map((_, i) => {
        const intensity = (Math.sin(i * 0.7) + 1) / 2;
        return (
          <div key={i} className="aspect-square rounded-sm" style={{ background: `rgba(168,85,247,${0.08 + intensity * 0.55})` }} />
        );
      })}
    </div>
  );
}

function FloatingCard({ className = "", icon: Icon, value, label, accent = "#A855F7" }: { className?: string; icon: React.ComponentType<{ className?: string }>; value: string; label: string; accent?: string }) {
  return (
    <div className={`glass-strong animate-float absolute hidden items-center gap-3 rounded-xl px-4 py-3 md:flex ${className}`}>
      <div className="flex h-9 w-9 items-center justify-center rounded-lg" style={{ background: `${accent}22`, color: accent }}>
        <Icon className="h-4 w-4" />
      </div>
      <div>
        <div className="text-base font-semibold leading-none">{value}</div>
        <div className="mt-1 text-[10px] text-white/40">{label}</div>
      </div>
    </div>
  );
}

/* ============================ WOW MOMENT ============================ */
function AnimatedNumber({ value }: { value: number }) {
  const [displayVal, setDisplayVal] = useState(value);
  useEffect(() => {
    let start: number | null = null;
    const fromVal = displayVal;
    const duration = 600; // 600ms
    const tick = (now: number) => {
      if (!start) start = now;
      const p = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3); // Cubic ease-out
      setDisplayVal(Math.round(fromVal + (value - fromVal) * eased));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [value]);
  return <span>{displayVal}</span>;
}

function WowMoment() {
  const [messages, setMessages] = useState<{ role: "user" | "aria"; text: string; mode?: Mode; sentiment?: number; reasoning?: string; revenue_flag?: boolean }[]>([
    { role: "aria", mode: "sales", sentiment: 0.8, reasoning: "Initial greeting · neutral baseline", text: "Hey there — I'm ARIA. What can I help you with today?", revenue_flag: false },
  ]);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [sessionId] = useState(() => "session-" + Math.random().toString(36).substring(2, 11));

  const [vaderScore, setVaderScore] = useState<number | null>(null);

  const [intel, setIntel] = useState<{
    mode: Mode;
    sentiment_score: number;
    confidence_score: number;
    mode_reason: string;
    emotion: { frustration: number; satisfaction: number; urgency: number; loyalty_risk: number };
    escalation_probability: number;
    revenue_flag: boolean;
    revenue_score: number;
  }>({
    mode: "sales",
    sentiment_score: 0.8,
    confidence_score: 0.88,
    mode_reason: "Initial greeting · neutral baseline",
    emotion: { frustration: 10, satisfaction: 80, urgency: 20, loyalty_risk: 15 },
    escalation_probability: 20,
    revenue_flag: false,
    revenue_score: 0
  });

  const send = async (text?: string) => {
    const t = (text ?? input).trim();
    if (!t) return;
    setInput("");
    setErrorMessage(null);
    
    // Compute client-side VADER sentiment score
    const score = analyzeSentimentVader(t);
    setVaderScore(score);

    setMessages((m) => [...m, { role: "user", text: t }]);
    setThinking(true);
    
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: t,
          conversation_history: messages.map(m => m.text),
          session_id: sessionId
        })
      });

      const rawText = await response.text();
      let data: any = null;
      try {
        data = rawText ? JSON.parse(rawText) : null;
      } catch (parseError) {
        console.error("ARIA Engine parse error:", parseError, rawText);
        throw new Error(rawText || `HTTP ${response.status} response was not JSON`);
      }

      if (!response.ok) {
        const detail = data?.message || data?.error || data?.detail || `HTTP ${response.status}`;
        console.error("ARIA Engine Error:", { status: response.status, detail });
        setErrorMessage(`ARIA integration error: ${detail}`);
        return;
      }

      // Update state intel driven from real response
      setIntel({
        mode: data.mode as Mode,
        sentiment_score: data.sentiment_score,
        confidence_score: data.confidence_score,
        mode_reason: data.mode_reason,
        emotion: {
          frustration: data.emotion?.frustration ?? 20,
          satisfaction: data.emotion?.satisfaction ?? 60,
          urgency: data.emotion?.urgency ?? 20,
          loyalty_risk: data.emotion?.loyalty_risk ?? 20
        },
        escalation_probability: data.escalation_probability,
        revenue_flag: data.revenue_flag,
        revenue_score: data.revenue_score
      });

      setMessages((m) => [...m, { 
        role: "aria", 
        mode: data.mode as Mode, 
        sentiment: data.sentiment_score, 
        reasoning: data.mode_reason,
        text: data.response || "ARIA responded successfully.",
        revenue_flag: data.revenue_flag
      }]);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown runtime error";
      console.error("ARIA Engine Error:", error);
      setErrorMessage(`ARIA integration error: ${message}`);
    } finally {
      setThinking(false);
    }
  };

  const mode = intel.mode;
  const sentiment = Math.round(intel.sentiment_score * 100);
  const confidence = Math.round(intel.confidence_score * 100);
  const escalationRisk = intel.escalation_probability;

  const MODE_COLOR: Record<Mode, string> = { sales: "#3B82F6", support: "#F59E0B", care: "#FB7185", escalation: "#A855F7" };

  return (
    <section id="demo" className="relative py-24 sm:py-32">
      <div className="absolute inset-0" style={{ background: `radial-gradient(60% 50% at 50% 50%, ${MODE_COLOR[mode]}22, transparent 70%)`, transition: "background 600ms" }} />
      <div className="relative mx-auto max-w-7xl px-5 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <span className="text-[11px] uppercase tracking-[0.25em] text-[#A855F7]">The wow moment</span>
          <h2 className="mt-3 text-balance text-4xl font-bold tracking-tight sm:text-5xl text-gradient">
            Watch the entire system react — in real time.
          </h2>
          <p className="mt-4 text-white/60">Type a message. Watch mode, sentiment, escalation risk, and recommendations update live.</p>
        </div>

        <div className="mt-14 grid gap-5 lg:grid-cols-12">
          {/* chat */}
          <div className="lg:col-span-7">
            <div className="glass-strong overflow-hidden rounded-2xl">
              <div className="flex items-center justify-between border-b border-white/5 px-5 py-3">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#6D28D9] to-[#C026D3]"><Sparkles className="h-4 w-4 text-white" /></div>
                  <div>
                    <div className="text-sm font-semibold">ARIA Playground</div>
                    <div className="text-[10px] text-white/40">Try: "I'm honestly disappointed with your service."</div>
                  </div>
                </div>
                
                <AnimatePresence mode="wait">
                  <motion.span
                    key={mode}
                    initial={{ opacity: 0, scale: 0.8, y: -4 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.8, y: -4 }}
                    transition={{ type: "spring", stiffness: 400, damping: 25, duration: 0.2 }}
                    className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold tracking-wider border uppercase"
                    style={{
                      color: MODE_COLOR[mode],
                      background: `${MODE_COLOR[mode]}1F`,
                      borderColor: `${MODE_COLOR[mode]}30`,
                      boxShadow: `0 0 14px -2px ${MODE_COLOR[mode]}30`,
                    }}
                  >
                    <span className="h-1.5 w-1.5 rounded-full animate-ping" style={{ background: MODE_COLOR[mode] }} />
                    {mode === "escalation" ? "ESCALATING" : `${mode.toUpperCase()} MODE`}
                  </motion.span>
                </AnimatePresence>
              </div>
              <div className="max-h-[380px] min-h-[300px] space-y-3 overflow-y-auto p-5">
                {messages.map((m, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25, ease: "easeOut" }}
                    className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div className="max-w-[85%] space-y-1.5">
                      <div className="flex items-center gap-2">
                        {m.role === "aria" && m.mode && (
                          <span className="inline-block rounded-full px-2 py-0.5 text-[10px] font-medium" style={{ background: `${MODE_COLOR[m.mode]}1F`, color: MODE_COLOR[m.mode] }}>{m.mode}</span>
                        )}
                        {m.role === "aria" && m.revenue_flag && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 text-[10px] font-medium text-amber-500 animate-pulse">
                            💰 Revenue opportunity
                          </span>
                        )}
                      </div>
                      
                      <div className="relative">
                        <div className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${m.role === "user" ? "bg-gradient-to-br from-[#6D28D9] to-[#4F46E5] text-white" : "bg-white/[0.04] ring-1 ring-white/[0.06]"}`}>{m.text}</div>
                        {m.role === "aria" && typeof m.sentiment === "number" && (
                          <div className="mt-1 h-[4px] w-full overflow-hidden rounded-full bg-white/[0.06]">
                            <div
                              className="h-full rounded-full transition-all duration-1000 ease-out"
                              style={{
                                width: `${m.sentiment * 100}%`,
                                background: m.sentiment > 0.7 ? "#34D399" : m.sentiment >= 0.4 ? "#FBBF24" : "#FB7185",
                              }}
                            />
                          </div>
                        )}
                      </div>

                      {m.role === "aria" && m.reasoning && (
                        <div 
                          className="text-[11px] italic text-[#6B7280] mt-1 pl-1"
                          style={{ animation: "fade-up 300ms ease-out both", animationDelay: "300ms" }}
                        >
                          Why: {m.reasoning}
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
                {thinking && (
                  <div className="flex gap-1 pl-2">
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-white/40 [animation-delay:-0.3s]" />
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-white/40 [animation-delay:-0.15s]" />
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-white/40" />
                  </div>
                )}
                {errorMessage && (
                  <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-xs text-rose-100">
                    {errorMessage}
                  </div>
                )}
              </div>
              
              {intel.escalation_probability > 65 && (
                <div className="mx-5 mb-2 rounded-xl bg-gradient-to-r from-red-500/20 to-purple-500/20 border border-red-500/30 py-2.5 px-4 text-xs font-semibold text-rose-300 flex items-center gap-2 animate-pulse">
                  <span>⚠ High escalation risk — specialist may be needed.</span>
                </div>
              )}

              <div className="border-t border-white/5 p-3">
                <div className="flex flex-wrap gap-1.5 pb-2">
                  {["I'm honestly disappointed", "What's your pricing?", "My dashboard is broken", "I want a refund now"].map((s) => (
                    <button key={s} onClick={() => send(s)} className="rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1 text-[10px] text-white/60 transition hover:border-white/20 hover:text-white">{s}</button>
                  ))}
                </div>
                <div className="flex items-center gap-2 rounded-xl bg-white/[0.04] px-3 py-2 ring-1 ring-white/[0.06] focus-within:ring-[#A855F7]/40">
                  <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()} placeholder="Tell ARIA anything…" className="flex-1 bg-transparent text-sm outline-none placeholder:text-white/30" />
                  <button onClick={() => send()} className="flex h-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#6D28D9] to-[#C026D3] px-3 text-xs font-medium text-white"><ArrowRight className="h-3.5 w-3.5" /></button>
                </div>
              </div>
            </div>
          </div>

          {/* live intelligence */}
          <div className="space-y-3 lg:col-span-5">
            <div className="glass-violet rounded-xl p-4">
              <div className="grid grid-cols-3 gap-3">
                <Meter label="Confidence" value={confidence} color="#A855F7" />
                <Meter label="Sentiment" value={sentiment} color={intel.sentiment_score > 0.7 ? "#10B981" : intel.sentiment_score >= 0.4 ? "#F59E0B" : "#FB7185"} />
                <Meter label="Escalation" value={escalationRisk} color={escalationRisk > 60 ? "#A855F7" : "#3B82F6"} />
              </div>
            </div>
            <EmotionPanel
              frustration={intel.emotion.frustration}
              satisfaction={intel.emotion.satisfaction}
              urgency={intel.emotion.urgency}
              loyalty={intel.emotion.loyalty_risk}
            />
            <RevPanel upsell={intel.revenue_score} value={intel.revenue_flag ? `$${intel.revenue_score * 90}` : "$0"} lead={intel.revenue_score} />
            <EscalationPanel probability={escalationRisk} severity={escalationRisk > 60 ? "High" : escalationRisk > 35 ? "Medium" : "Low"} />
            <DecisionPanel steps={[
              `Detected intent: ${mode}`,
              `Sentiment score: ${intel.sentiment_score.toFixed(2)}`,
              `Client-side VADER Sentiment Score: ${vaderScore !== null ? vaderScore.toFixed(2) : "0.80 (baseline)"}`,
              intel.mode_reason,
            ]} />
          </div>
        </div>
      </div>
    </section>
  );
}

function Meter({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="text-center">
      <div className="text-[9px] uppercase tracking-wider text-white/40">{label}</div>
      <div className="mt-1 text-xl font-semibold tabular-nums transition-colors" style={{ color }}>
        <AnimatedNumber value={value} />{label !== "Sentiment" ? "%" : ""}
      </div>
      <div className="mt-1 h-1 overflow-hidden rounded-full bg-white/[0.06]">
        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${value}%`, background: color, boxShadow: `0 0 12px -2px ${color}` }} />
      </div>
    </div>
  );
}

/* ============================== FEATURES ============================== */
function Features() {
  const features = [
    { icon: Heart, label: "Emotion Detection", desc: "Real-time affective analysis on every message — frustration, satisfaction, urgency, loyalty.", color: "#FB7185" },
    { icon: TrendingUp, label: "Sales Intelligence", desc: "Buying signal detection, lead scoring, and revenue opportunity surfacing baked into every conversation.", color: "#3B82F6" },
    { icon: AlertTriangle, label: "Escalation Engine", desc: "Predicts when humans are needed and routes with full context — no repeating the problem.", color: "#A855F7" },
    { icon: Database, label: "Customer Memory", desc: "Persistent conversational memory across sessions, channels, and tickets.", color: "#6366F1" },
    { icon: Brain, label: "AI Reasoning", desc: "Transparent decision chains — every mode switch is explainable and auditable.", color: "#A855F7" },
    { icon: LineChart, label: "Revenue Intelligence", desc: "Pipeline value detected per conversation, churn risk per customer, LTV per segment.", color: "#10B981" },
    { icon: TrendingDown, label: "Churn Prediction", desc: "Early-warning signals on accounts heading for cancellation — before they ask.", color: "#FB7185" },
    { icon: Cpu, label: "Adaptive Reasoning", desc: "Multi-model routing picks the best brain per intent. Cheap when easy, deep when hard.", color: "#C026D3" },
    { icon: Activity, label: "Real-Time Analytics", desc: "Stream-first dashboards. Every signal flows the moment it happens.", color: "#3B82F6" },
    { icon: GitBranch, label: "Human Handoff Intelligence", desc: "Smart routing to the right human, with the right context, at the right time.", color: "#F59E0B" },
    { icon: Layers, label: "Multi-channel Unified", desc: "Web, email, in-app, voice — one memory, one personality.", color: "#6366F1" },
    { icon: Eye, label: "Live Mode Switching", desc: "ARIA shifts personality mid-sentence as the conversation evolves. No bot ever did this.", color: "#A855F7" },
  ];
  return (
    <section id="features" className="py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <span className="text-[11px] uppercase tracking-[0.25em] text-[#A855F7]">Capabilities</span>
          <h2 className="mt-3 text-balance text-4xl font-bold tracking-tight sm:text-5xl text-gradient">
            Not features. An intelligence layer.
          </h2>
        </div>
        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <div key={f.label} className="group relative overflow-hidden rounded-2xl border border-white/[0.06] bg-gradient-to-b from-white/[0.04] to-white/[0.01] p-6 transition-all hover:-translate-y-0.5 hover:border-white/15">
              <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-50" style={{ background: f.color }} />
              <div className="relative">
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: `${f.color}1A`, color: f.color }}>
                  <f.icon className="h-4 w-4" />
                </div>
                <h3 className="text-base font-semibold text-white">{f.label}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-white/55">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============================ DASHBOARD PREVIEW ============================ */
function DashboardPreview() {
  return (
    <section className="relative py-24">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <div>
            <span className="text-[11px] uppercase tracking-[0.25em] text-[#A855F7]">Enterprise dashboard</span>
            <h2 className="mt-3 text-balance text-4xl font-bold tracking-tight sm:text-5xl text-gradient">Your command center for revenue & care.</h2>
            <p className="mt-4 text-white/60">A complete analytics surface: customer segmentation, conversation analytics, AI reasoning history, escalation maps, and a live opportunity pipeline.</p>
            <div className="mt-6 grid grid-cols-2 gap-3 max-w-md">
              {[
                ["Conversation analytics", "#A855F7"],
                ["AI reasoning history", "#6366F1"],
                ["Escalation mapping", "#FB7185"],
                ["Opportunity pipeline", "#10B981"],
                ["Customer segmentation", "#3B82F6"],
                ["KPI dashboards", "#F59E0B"],
              ].map(([l, c]) => (
                <div key={l} className="flex items-center gap-2 rounded-md border border-white/[0.05] bg-white/[0.02] px-3 py-2 text-xs text-white/70">
                  <span className="h-1.5 w-1.5 rounded-full" style={{ background: c }} />
                  {l}
                </div>
              ))}
            </div>
            <div className="mt-6">
              <Button asChild className="rounded-full bg-gradient-to-r from-[#6D28D9] to-[#C026D3] px-5 text-white hover:glow-violet">
                <Link to="/dashboard">Open the dashboard <ArrowUpRight className="ml-1 h-4 w-4" /></Link>
              </Button>
            </div>
          </div>
          <div className="relative">
            <div className="absolute -inset-8 rounded-3xl bg-gradient-to-br from-[#6D28D9]/30 via-[#C026D3]/20 to-[#312E81]/30 blur-3xl" />
            <div className="glass-strong relative overflow-hidden rounded-2xl">
              <div className="border-b border-white/5 px-4 py-3 text-xs text-white/40">aria.app/dashboard</div>
              <div className="grid grid-cols-2 gap-3 p-4">
                {[
                  { l: "MRR detected", v: "$214k", c: "#10B981" },
                  { l: "Active convos", v: "1,284", c: "#A855F7" },
                  { l: "Avg. sentiment", v: "0.74", c: "#3B82F6" },
                  { l: "Churn risk", v: "12", c: "#FB7185" },
                ].map((s) => (
                  <div key={s.l} className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
                    <div className="text-[10px] uppercase tracking-wider text-white/40">{s.l}</div>
                    <div className="mt-1 text-xl font-semibold tabular-nums" style={{ color: s.c }}>{s.v}</div>
                  </div>
                ))}
              </div>
              <div className="px-4 pb-4">
                <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
                  <div className="mb-2 text-[10px] uppercase tracking-wider text-white/40">Opportunity pipeline</div>
                  <MockChart />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ============================== FINAL CTA ============================== */
function FinalCTA() {
  return (
    <section className="py-24 sm:py-32">
      <div className="mx-auto max-w-5xl px-5 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#0E0820] via-[#1a0a3a] to-[#05010A] p-10 text-center sm:p-16">
          <div className="absolute inset-0 mesh-bg opacity-50" />
          <div className="absolute inset-0 grid-bg opacity-30" />
          <div className="absolute -top-32 left-1/2 h-64 w-96 -translate-x-1/2 rounded-full bg-[#A855F7]/40 blur-3xl" />
          <div className="relative">
            <h2 className="text-balance text-4xl font-bold tracking-tight sm:text-6xl">
              <span className="text-gradient">Your AI shouldn't just respond.</span>
              <br />
              <span className="text-gradient-violet">It should understand.</span>
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-white/60">
              Deploy ARIA in minutes. Watch one agent handle every conversation your business has — intelligently.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Button asChild size="lg" className="rounded-full bg-gradient-to-r from-[#6D28D9] to-[#C026D3] px-8 text-white hover:glow-violet">
                <Link to="/dashboard">Deploy ARIA <ArrowUpRight className="ml-1 h-4 w-4" /></Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="rounded-full border-white/15 bg-white/[0.02] px-8 text-white hover:bg-white/[0.06]">
                <a href="#demo">Try the playground</a>
              </Button>
            </div>
            <p className="mt-4 text-xs text-white/40">No credit card required · Setup in under 5 minutes</p>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ============================== FOOTER ============================== */
function Footer() {
  return (
    <footer className="border-t border-white/[0.05] py-12">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <div className="grid gap-8 md:grid-cols-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded bg-gradient-to-br from-[#6D28D9] to-[#C026D3]"><Sparkles className="h-3 w-3 text-white" /></span>
              <span className="text-base font-bold tracking-tight text-white">ARIA</span>
            </div>
            <p className="mt-3 max-w-xs text-xs text-white/50">Adaptive Revenue Intelligence Agent. The conversational operating layer for modern businesses.</p>
          </div>
          {[
            { h: "Product", l: [["Features", "#features"], ["Live Demo", "#demo"], ["Dashboard", "/dashboard"]] },
            { h: "Company", l: [["About", undefined], ["Customers", undefined], ["Careers", undefined]] },
            { h: "Resources", l: [["Docs", undefined], ["Privacy", undefined], ["Terms", undefined]] },
          ].map((col) => (
            <div key={col.h}>
              <div className="text-[10px] uppercase tracking-widest text-white/40">{col.h}</div>
              <ul className="mt-3 space-y-2 text-sm text-white/60">
                {col.l.map(([label, href]) => (
                  <li key={label}>
                    {href ? (
                      <a href={href} className="hover:text-white">{label}</a>
                    ) : (
                      <span className="text-white/40 cursor-not-allowed">{label}</span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-10 flex flex-col items-start justify-between gap-3 border-t border-white/[0.05] pt-6 text-xs text-white/40 md:flex-row md:items-center">
          <span>© {new Date().getFullYear()} FlowZint · ARIA Intelligence OS</span>
          <span className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> All systems operational</span>
        </div>
      </div>
    </footer>
  );
}