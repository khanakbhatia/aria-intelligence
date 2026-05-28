import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { 
  Sparkles, ArrowLeft, Download, Shield, Brain, Zap, Clock, AlertTriangle, 
  MessageSquare, TrendingDown, Check, Home, BarChart3, DollarSign, Settings,
  Activity, Users, UserCheck
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard/conversations/$id")({
  component: ConversationDetailPage,
});

const NAV = [
  { icon: Home, label: "Overview", to: "/dashboard" },
  { icon: MessageSquare, label: "Conversations", to: "/dashboard" },
  { icon: BarChart3, label: "Analytics", to: "/dashboard" },
  { icon: AlertTriangle, label: "Escalations", to: "/dashboard" },
  { icon: DollarSign, label: "Revenue Intelligence", to: "/dashboard" },
  { icon: Brain, label: "ARIA Memory", to: "/dashboard" },
  { icon: Settings, label: "Settings", to: "/dashboard" },
];

function ConversationDetailPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [exported, setExported] = useState(false);

  const handleExport = () => {
    setExported(true);
    toast.success("Transcript exported successfully!", {
      description: "Detailed PDF package generated with cognitive memory attachments."
    });
    setTimeout(() => setExported(false), 2000);
  };

  const isMarcus = id === "33333333-3333-3333-3333-333333333333" || id.toLowerCase() === "marcus";

  const marcusTimeline = [
    { time: "00:00", mode: "sales", color: "#3B82F6", label: "SALES", desc: "Initial inquiry about enterprise pricing" },
    { time: "02:14", mode: "support", color: "#F59E0B", label: "SUPPORT", desc: "Reported access issue mid-conversation" },
    { time: "05:33", mode: "care", color: "#FB7185", label: "CARE", desc: "Frustration spike detected (sentiment: 0.22)" },
    { time: "08:47", mode: "escalation", color: "#A855F7", label: "ESCALATION", desc: "Chargeback threat — routed to senior specialist", active: true }
  ];

  const marcusMessages = [
    {
      role: "user",
      content: "Hi, I need to talk about my enterprise plan renewal — we have 50 seats and I was quoted a different price."
    },
    {
      role: "aria",
      mode: "sales",
      why: "Enterprise pricing inquiry + 50 seats = high-value lead. Qualify and gather context.",
      content: "Hi Marcus — happy to help with your renewal. Let me pull up your account details. Can you confirm the email on the account?"
    },
    {
      role: "user",
      content: "It's marcus@northwindco.com — also I just tried to log in and my account is locked?"
    },
    {
      role: "aria",
      mode: "support",
      why: "Concurrent support issue detected. Switching to support mode while maintaining renewal context.",
      content: "On it — I can see your account. It looks like a security flag triggered the lock. I'm unlocking it now. This should be resolved in about 60 seconds."
    },
    {
      role: "user",
      content: "It's STILL locked. I've been waiting 10 minutes. This is completely unacceptable. I have a board presentation in 30 minutes."
    },
    {
      role: "aria",
      mode: "care",
      why: "Sentiment dropped to 0.22. Urgency score 9/10. Empathy-first response before any resolution attempt.",
      content: "Marcus, I completely understand — being locked out before a board presentation is genuinely stressful and this should not have happened. I'm escalating this to our highest priority queue right now. Can you try a password reset at reset.aria.app while I get a specialist on this?"
    },
    {
      role: "user",
      isTrigger: true,
      content: "The reset isn't working either. I'm done. I'm going to call my bank and reverse the charges for this entire year if this isn't fixed in 5 minutes."
    },
    {
      role: "aria",
      mode: "escalation",
      why: "Chargeback threat + urgency 10/10 + sentiment 0.11 = immediate human escalation. Full context packaged for specialist.",
      content: "Marcus — I'm connecting you directly to our senior account specialist right now. They have your full account history, this conversation, and the technical log. You will not need to explain anything again. Estimated wait: under 2 minutes."
    }
  ];

  const MODE_COLOR: Record<string, string> = { sales: "#3B82F6", support: "#F59E0B", care: "#FB7185", escalation: "#A855F7" };

  return (
    <div className="min-h-screen bg-[#05010A] text-foreground flex">
      {/* Sidebar Layout */}
      <aside
        className="sticky top-0 h-screen shrink-0 border-r border-white/[0.08] bg-[#0C081A] transition-[width] duration-300 flex flex-col"
        style={{ width: collapsed ? 64 : 240 }}
      >
        <div className="h-14 flex items-center px-4 border-b border-white/[0.06]">
          <Link to="/" className="flex items-center gap-3 min-w-0">
            <div className="h-9 w-9 shrink-0 rounded-2xl bg-gradient-to-br from-[#A855F7] to-[#C026D3] flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-[#080810]" />
            </div>
            {!collapsed && (
              <div>
                <span className="block font-semibold tracking-tight text-sm">ARIA</span>
                <span className="block text-[11px] text-white/50">AI command center</span>
              </div>
            )}
          </Link>
        </div>

        <nav className="flex-1 p-3 space-y-2">
          {NAV.map((item) => {
            const Icon = item.icon;
            const active = item.label === "Conversations";
            return (
              <Link
                key={item.label}
                to={item.to}
                search={{ tab: item.label }}
                className={`group relative w-full flex items-center gap-3 rounded-[1.35rem] px-3 py-3 text-sm transition-all ${
                  active
                    ? "bg-[#A855F7]/[0.16] text-[#A855F7] border border-[#A855F7]/20"
                    : "text-white/60 hover:text-white hover:bg-white/[0.08]"
                }`}
              >
                <span className={`flex h-10 w-10 items-center justify-center rounded-2xl ${
                  active ? "bg-[#A855F7]/[0.12] text-[#A855F7]" : "bg-white/[0.03]"
                }`}>
                  <Icon className="h-4 w-4" />
                </span>
                {!collapsed && <span className="truncate font-medium">{item.label}</span>}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main Section */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-20 h-14 border-b border-white/[0.06] bg-[#05010A]/70 backdrop-blur-xl px-6 flex items-center justify-between">
          <button 
            onClick={() => navigate({ to: "/dashboard" })}
            className="flex items-center gap-2 text-xs font-semibold text-white/60 hover:text-white border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 rounded-lg transition"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Dashboard
          </button>
          <div className="flex items-center gap-1.5 text-xs text-emerald-400">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
            </span>
            <span>Live Audit Hub</span>
          </div>
        </header>

        <main className="flex-1 p-6 lg:p-8 space-y-6 overflow-y-auto">
          {isMarcus ? (
            <>
              {/* SECTION 1 - HEADER */}
              <div className="glass rounded-[1.75rem] border border-white/[0.08] p-6 flex flex-wrap items-center justify-between gap-4 relative overflow-hidden">
                <div className="pointer-events-none absolute inset-x-0 top-0 h-36 bg-[radial-gradient(circle_at_top,_rgba(168,85,247,0.12),_transparent_40%)]" />
                <div className="flex items-center gap-4 relative">
                  <div className="h-14 w-14 rounded-3xl bg-gradient-to-br from-[#A855F7] to-[#C026D3] flex items-center justify-center text-xl font-bold">
                    MR
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">Marcus Reilly</h2>
                    <div className="flex items-center gap-3 mt-1.5">
                      <span className="px-2.5 py-0.5 rounded bg-purple-500/10 border border-purple-500/30 text-purple-400 text-xs font-bold uppercase">
                        ESCALATED
                      </span>
                      <span className="text-xs text-white/40 font-mono flex items-center gap-1">
                        <Clock className="h-3 w-3" /> 9m 04s active
                      </span>
                    </div>
                  </div>
                </div>

                <button 
                  onClick={handleExport}
                  className="flex items-center gap-2 text-xs font-semibold text-white bg-gradient-to-r from-[#6D28D9] to-[#C026D3] px-4 py-2.5 rounded-full hover:glow-violet transition"
                >
                  {exported ? <Check className="h-4 w-4" /> : <Download className="h-4 w-4" />}
                  Export Transcript
                </button>
              </div>

              {/* SECTION 2 - MODE TIMELINE */}
              <div className="glass rounded-2xl border border-white/[0.08] p-6 space-y-4">
                <h3 className="text-xs font-semibold text-white/40 uppercase tracking-widest flex items-center gap-2">
                  <Activity className="h-3.5 w-3.5 text-[#A855F7]" /> ARIA Adaptive mode switches
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 pt-4 relative">
                  <div className="absolute top-[28px] left-[20px] right-[20px] h-0.5 bg-white/5 hidden md:block" />
                  {marcusTimeline.map((step) => (
                    <div key={step.time} className="flex md:flex-col gap-4 md:gap-3 relative">
                      <div 
                        className={`h-7 w-7 rounded-full flex items-center justify-center shrink-0 border-2 z-10 ${step.active ? 'animate-pulse' : ''}`}
                        style={{ 
                          borderColor: step.color, 
                          background: step.active ? step.color : '#05010A',
                          boxShadow: step.active ? `0 0 16px ${step.color}` : 'none'
                        }}
                      >
                        {step.active && <Zap className="h-3 w-3 text-white" />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono text-white/45">{step.time}</span>
                          <span className="text-xs font-bold" style={{ color: step.color }}>{step.label}</span>
                        </div>
                        <p className="text-xs text-white/70 mt-1 leading-relaxed">{step.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* SECTION 3 & 4 - TRANSCRIPT & SUMMARY */}
              <div className="grid gap-6 lg:grid-cols-12 items-start">
                {/* Transcript */}
                <div className="lg:col-span-8 glass rounded-2xl border border-white/[0.08] flex flex-col overflow-hidden">
                  <div className="p-4 border-b border-white/[0.06] bg-white/[0.02] flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-[#A855F7]" />
                    <span className="text-xs font-semibold text-white/70">Full conversation history</span>
                  </div>
                  <div className="p-5 space-y-4 max-h-[500px] overflow-y-auto bg-black/10">
                    {marcusMessages.map((msg, idx) => {
                      const isUser = msg.role === "user";
                      return (
                        <div key={idx} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[85%] ${isUser ? '' : 'space-y-1.5'}`}>
                            {/* Mode bubble for ARIA */}
                            {!isUser && msg.mode && (
                              <span 
                                className="inline-block rounded-full px-2 py-0.5 text-[9px] font-bold border uppercase"
                                style={{ background: `${MODE_COLOR[msg.mode]}1F`, borderColor: `${MODE_COLOR[msg.mode]}30`, color: MODE_COLOR[msg.mode] }}
                              >
                                {msg.mode} MODE
                              </span>
                            )}
                            {/* Speech Bubble */}
                            <div 
                              className={`rounded-2xl px-4 py-2.5 text-xs leading-relaxed ${
                                isUser 
                                  ? 'bg-gradient-to-br from-[#6D28D9] to-[#4F46E5] text-white shadow-lg' 
                                  : 'bg-white/[0.04] text-foreground border border-white/[0.06]'
                              } ${msg.isTrigger ? 'border-rose-500/50 border-l-4 shadow-[0_0_12px_rgba(244,63,94,0.1)]' : ''}`}
                            >
                              {msg.content}
                            </div>
                            {/* Trigger details */}
                            {msg.isTrigger && (
                              <div className="inline-flex items-center gap-1 text-[10px] text-rose-400 font-semibold bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 rounded">
                                ⚠ Escalation trigger
                              </div>
                            )}
                            {/* Why reason labels */}
                            {!isUser && msg.why && (
                              <div className="text-[11px] text-[#6B7280] italic pl-1 pt-0.5">
                                Why: {msg.why}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* SECTION 4 - RIGHT PANEL SUMMARY */}
                <div className="lg:col-span-4 space-y-4">
                  <div className="glass rounded-2xl border border-white/[0.08] p-5 space-y-4">
                    <h3 className="text-xs font-semibold text-white/40 uppercase tracking-widest flex items-center gap-2">
                      <Brain className="h-3.5 w-3.5 text-[#A855F7]" /> ARIA Intelligence Summary
                    </h3>
                    <div className="divide-y divide-white/5 space-y-3">
                      <div className="flex justify-between text-xs pt-2">
                        <span className="text-white/50">Opening sentiment:</span>
                        <span className="font-semibold text-emerald-400">0.74</span>
                      </div>
                      <div className="flex justify-between text-xs pt-3">
                        <span className="text-white/50">Closing sentiment:</span>
                        <span className="font-semibold text-rose-400">0.11</span>
                      </div>
                      <div className="flex justify-between text-xs pt-3">
                        <span className="text-white/50">Sentiment trajectory:</span>
                        <span className="font-semibold text-rose-400 flex items-center gap-1">
                          <TrendingDown className="h-3.5 w-3.5" /> Rapidly declining
                        </span>
                      </div>
                      <div className="flex justify-between text-xs pt-3">
                        <span className="text-white/50">Mode switches:</span>
                        <span className="font-semibold text-white">3</span>
                      </div>
                      <div className="flex flex-col gap-1.5 pt-3">
                        <span className="text-white/50 text-xs">Escalation trigger:</span>
                        <span className="text-[11px] text-rose-300 bg-rose-500/10 border border-rose-500/20 p-2 rounded leading-relaxed">
                          "Chargeback threat + account access failure"
                        </span>
                      </div>
                      <div className="flex justify-between text-xs pt-3">
                        <span className="text-white/50">Customer value:</span>
                        <span className="font-semibold text-amber-400">9/10 (Enterprise, 50 seats)</span>
                      </div>
                      <div className="flex justify-between text-xs pt-3">
                        <span className="text-white/50">ARIA confidence:</span>
                        <span className="font-semibold text-[#A855F7]">94%</span>
                      </div>
                      <div className="flex flex-col gap-1.5 pt-3">
                        <span className="text-white/50 text-xs">Recommended action:</span>
                        <span className="text-[11px] text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 p-2.5 rounded leading-relaxed font-semibold">
                          "Priority callback within 5 minutes. Offer 1-month credit."
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 5 - HANDOFF PACKAGE */}
              <div className="glass rounded-2xl border border-white/[0.08] p-6 relative overflow-hidden">
                <div className="absolute right-6 top-6 inline-flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-3 py-1 rounded-full text-xs font-semibold">
                  <Check className="h-3.5 w-3.5" /> Specialist briefing sent ✓
                </div>
                
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <UserCheck className="h-4 w-4 text-emerald-400" /> Human Agent Takeover Handoff Package
                </h3>
                <p className="text-xs text-white/50 mt-1">Cognitive package generated and synchronized to specialist terminal.</p>
                
                <div className="mt-5 grid gap-4 md:grid-cols-3 text-xs bg-white/[0.02] border border-white/[0.05] p-5 rounded-2xl">
                  <div>
                    <div className="text-white/40 uppercase tracking-wider text-[10px]">Customer details</div>
                    <div className="font-semibold text-white mt-1.5">Marcus Reilly, Northwind Co.</div>
                    <div className="text-white/60 mt-1">LTV value: ~$24,000 ARR (Enterprise)</div>
                  </div>
                  <div>
                    <div className="text-white/40 uppercase tracking-wider text-[10px]">State flags</div>
                    <div className="font-semibold text-rose-400 mt-1.5">Distressed (sentiment 0.11)</div>
                    <div className="text-rose-300 font-semibold mt-1 flex items-center gap-1">
                      <AlertTriangle className="h-3.5 w-3.5" /> Chargeback threat: YES
                    </div>
                  </div>
                  <div className="md:col-span-3 border-t border-white/5 pt-3 mt-3">
                    <div className="text-white/40 uppercase tracking-wider text-[10px]">Suggested Specialist Opening Line</div>
                    <div className="mt-2 text-emerald-300 font-mono bg-black/40 p-3 rounded-lg border border-emerald-500/10 italic text-[11px] leading-relaxed">
                      "Hi Marcus, I'm [Name], senior account specialist. I have everything in front of me — let's fix the access issue first, right now."
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="h-96 flex flex-col items-center justify-center text-center text-white/40">
              <MessageSquare className="h-12 w-12 text-white/10 mb-4" />
              <div className="text-base font-semibold">Custom Conversation Details</div>
              <div className="max-w-md text-xs mt-2 leading-relaxed">
                Detail audit page loaded for conversation ID: {id}. Interact with the customer, trigger live analytics, or seed the backend to browse standard history metrics.
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
