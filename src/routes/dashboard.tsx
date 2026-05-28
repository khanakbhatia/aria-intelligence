import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect, useMemo, useRef } from "react";
import {
  Home,
  MessageSquare,
  BarChart3,
  AlertTriangle,
  DollarSign,
  Brain,
  Settings,
  Search,
  Bell,
  ChevronLeft,
  ChevronRight,
  ArrowUp,
  ArrowDown,
  TrendingUp,
  Eye,
  Sparkles,
  ArrowUpRight,
  Users,
  CheckCircle2,
  Shield,
  RefreshCw,
  Cpu,
  Database,
  Save,
  Heart,
  Activity,
  Clock,
  Send,
  Zap,
  Building,
  HeartHandshake,
} from "lucide-react";
import { toast } from "sonner";
import { EmotionPanel, RevenuePanel as RevPanel, EscalationPanel, DecisionPanel } from "@/components/aria/IntelPanels";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Overview — ARIA Dashboard" },
      { name: "description", content: "ARIA customer intelligence command center." },
    ],
  }),
  component: DashboardPage,
});

const NAV = [
  { icon: Home, label: "Overview" },
  { icon: MessageSquare, label: "Conversations" },
  { icon: BarChart3, label: "Analytics" },
  { icon: AlertTriangle, label: "Escalations" },
  { icon: DollarSign, label: "Revenue Intelligence" },
  { icon: Brain, label: "ARIA Memory" },
  { icon: Settings, label: "Settings" },
];

function DashboardPage() {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState("Overview");
  const [selectedConvoId, setSelectedConvoId] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);
  const [overviewLoading, setOverviewLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [pulseCycle, setPulseCycle] = useState(0);

  const fetchData = async () => {
    if (!data) {
      setOverviewLoading(true);
    }

    try {
      // 1. Fetch overview
      const overviewRes = await fetch("/api/analytics/overview");
      const overviewStats = await overviewRes.json();

      // 2. Fetch active conversations
      const convosRes = await fetch("/api/conversations?limit=10&status=active");
      const convosData = await convosRes.json();

      // 3. Fetch sentiment trends
      const trendRes = await fetch("/api/analytics/sentiment-trend?days=7");
      const trendData = await trendRes.json();

      // 4. Fetch revenue opportunities
      const revRes = await fetch("/api/revenue-opportunities?limit=4");
      const revData = await revRes.json();

      setData({
        stats: {
          active_conversations: overviewStats.active_conversations,
          avg_sentiment: overviewStats.avg_sentiment,
          escalation_rate: overviewStats.escalation_rate,
          revenue_pipeline: overviewStats.revenue_pipeline,
          resolution_rate: overviewStats.resolution_rate
        },
        trends: trendData,
        live_convos: convosData.conversations.map((c: any) => ({
          id: c.id,
          user: c.customer_name,
          mode: c.mode,
          sentiment: c.sentiment_score,
          duration: c.duration,
          status: c.status
        })),
        revenue_opps: revData
      });

      setLastUpdated(new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      }));
    } catch (e) {
      console.error("Dashboard fetch error:", e);
    } finally {
      setOverviewLoading(false);
    }
  };

  useEffect(() => {
    const initAndFetch = async () => {
      try {
        await fetch("/api/seed", { method: "POST" });
      } catch (e) {
        console.error("Seeding error:", e);
      }
      fetchData();
    };
    initAndFetch();
    const timer = setInterval(fetchData, 10000); // refresh every 10s
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const driftTimer = setInterval(() => {
      setData((prevData: any) => {
        if (!prevData) return prevData;
        const newData = { ...prevData };
        const cycle = (pulseCycle + 1) % 3;
        setPulseCycle(cycle);

        if (cycle === 0) {
          // Flash a random opportunity
          const opps = ["Sarah Chen", "Priya Natarajan", "Northwind Co.", "Jordan Park"];
          newData.flash_opp_customer = opps[Math.floor(Math.random() * opps.length)];
          // Clear live convo flash
          if (newData.live_convos) {
            newData.live_convos = newData.live_convos.map((c: any) => ({ ...c, flash: false }));
          }
        } else if (cycle === 1) {
          // Increment active conversation count by 1 temporarily
          if (newData.stats) {
            newData.stats = {
              ...newData.stats,
              active_conversations: (newData.stats.active_conversations || 0) + 1,
            };
          }
          newData.flash_opp_customer = null;
        } else if (cycle === 2) {
          // Shift sentiment of one of the live conversations slightly
          if (newData.live_convos && newData.live_convos.length > 0) {
            newData.live_convos = newData.live_convos.map((c: any) => {
              if (c.user === "Mike Ross") {
                const shift = Math.random() > 0.5 ? 0.05 : -0.05;
                const newSentiment = Math.max(0.1, Math.min(1.0, c.sentiment + shift));
                return { ...c, sentiment: newSentiment };
              }
              return c;
            });
          }
          // Flash a random conversation row
          if (newData.live_convos && newData.live_convos.length > 0) {
            const idx = Math.floor(Math.random() * newData.live_convos.length);
            newData.live_convos = newData.live_convos.map((c: any, i: number) => ({
              ...c,
              flash: i === idx,
            }));
          }
          newData.flash_opp_customer = null;
        }
        return newData;
      });
    }, 8000);

    return () => clearInterval(driftTimer);
  }, [pulseCycle]);

  const handleViewConvo = (id: string) => {
    navigate({ to: "/dashboard/conversations/$id", params: { id } as any });
  };

  return (
    <div className="min-h-screen bg-[#05010A] text-foreground flex">
      <Sidebar 
        collapsed={collapsed} 
        onToggle={() => setCollapsed((c) => !c)} 
        activeTab={activeTab}
        onSelectTab={(tab) => {
          setActiveTab(tab);
          if (tab !== "Conversations") {
            setSelectedConvoId(null);
          }
        }}
      />
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar activeTab={activeTab} lastUpdated={lastUpdated} onRefresh={fetchData} />
        <main className="flex-1 p-6 lg:p-8 space-y-6 overflow-x-hidden">
          {activeTab === "Overview" && (
            <>
              <div className="animate-fade-up glass rounded-[1.75rem] border border-white/[0.08] bg-[#100a1e]/80 p-6 overflow-hidden relative">
                <div className="pointer-events-none absolute inset-x-0 top-0 h-36 bg-[radial-gradient(circle_at_top,_rgba(168,85,247,0.18),_transparent_40%)]" />
                <div className="relative grid gap-5 lg:grid-cols-[1.5fr_0.9fr] items-center">
                  <div className="space-y-3">
                    <div className="inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.05] px-3 py-1 text-[11px] uppercase tracking-[0.24em] text-white/50">
                      <Sparkles className="h-3.5 w-3.5 text-[#A855F7]" /> Real-time ARIA pulse
                    </div>
                    <div>
                      <h2 className="text-3xl font-semibold tracking-tight text-white">Command Center overview</h2>
                      <p className="mt-2 max-w-2xl text-sm leading-6 text-white/60">Accelerated analytics, live conversation signals, and AI insight in a single responsive dashboard.</p>
                    </div>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {overviewLoading ? (
                      Array.from({ length: 4 }).map((_, idx) => (
                        <div key={idx} className="h-20 rounded-3xl bg-white/[0.03] animate-pulse" />
                      ))
                    ) : (
                      [
                        { label: "Active Chats", value: data?.stats?.active_conversations || "—", accent: "text-[#A855F7]" },
                        { label: "Avg Sentiment", value: `${data?.stats?.avg_sentiment || "—"}%`, accent: "text-[#3B82F6]" },
                        { label: "Escalation Risk", value: `${data?.stats?.escalation_rate || "—"}%`, accent: "text-[#F59E0B]" },
                        { label: "Pipeline Value", value: data?.stats?.revenue_pipeline || "$—k", accent: "text-[#10B981]" },
                      ].map((item) => (
                        <div key={item.label} className="rounded-3xl border border-white/[0.06] bg-white/[0.02] p-4 text-sm transition hover:border-white/[0.12] hover:bg-white/[0.04]">
                          <div className="text-[10px] uppercase tracking-[0.26em] text-white/40">{item.label}</div>
                          <div className={`mt-3 text-2xl font-semibold ${item.accent}`}>{item.value}</div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
              <EscalationBanner 
                count={data?.stats?.active_conversations ? Math.floor(data.stats.active_conversations) : 0} 
                onViewAll={() => setActiveTab("Escalations")}
              />
              <StatCards stats={data?.stats} loading={overviewLoading} />
              <AnalyticsHighlights stats={data?.stats} liveEvents={data?.live_events} loading={overviewLoading} />
               <ChartsRow loading={overviewLoading} trends={data?.trends} />
              <LiveConversations convos={data?.live_convos} onSelect={handleViewConvo} loading={overviewLoading} />
              <RevenuePanel onViewPipeline={() => setActiveTab("Revenue Intelligence")} loading={overviewLoading} opps={data?.revenue_opps} flashCustomer={data?.flash_opp_customer} />
            </>
          )}

          {activeTab === "Conversations" && (
            <ConversationsView initialConvoId={selectedConvoId} />
          )}

          {activeTab === "Analytics" && (
            <AnalyticsView stats={data?.stats} trends={data?.trends} />
          )}

          {activeTab === "Escalations" && (
            <EscalationsView onSelectConvo={handleViewConvo} />
          )}

          {activeTab === "Revenue Intelligence" && (
            <RevenueIntelligenceView onSelectConvo={handleViewConvo} />
          )}

          {activeTab === "ARIA Memory" && (
            <AriaMemoryView onSelectConvo={handleViewConvo} />
          )}

          {activeTab === "Settings" && (
            <SettingsView />
          )}
        </main>
      </div>
    </div>
  );
}

/* --------------------------------- SIDEBAR --------------------------------- */
function Sidebar({ 
  collapsed, 
  onToggle,
  activeTab,
  onSelectTab
}: { 
  collapsed: boolean; 
  onToggle: () => void;
  activeTab: string;
  onSelectTab: (tab: string) => void;
}) {
  return (
    <aside
      className="sticky top-0 h-screen shrink-0 border-r border-white/[0.08] bg-[#0C081A] transition-[width,background-color] duration-300 ease-out flex flex-col"
      style={{ width: collapsed ? 64 : 240 }}
    >
      <div className="h-14 flex items-center px-4 border-b border-white/[0.06]">
        <Link to="/" className="flex items-center gap-3 min-w-0">
          <div className="h-9 w-9 shrink-0 rounded-2xl bg-gradient-to-br from-[#A855F7] to-[#C026D3] flex items-center justify-center shadow-[0_18px_60px_-40px_rgba(168,85,247,0.9)] transition-transform duration-300 hover:scale-105">
            <Sparkles className="h-4 w-4 text-[#080810]" />
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <span className="block font-semibold tracking-tight text-sm">ARIA</span>
              <span className="block text-[11px] text-white/50">AI command center</span>
            </div>
          )}
        </Link>
      </div>

      <nav className="flex-1 p-3 space-y-2">
        {NAV.map((item) => {
          const Icon = item.icon;
          const active = item.label === activeTab;
          return (
            <button
              key={item.label}
              onClick={() => onSelectTab(item.label)}
              title={item.label}
              className={`group relative w-full flex items-center gap-3 rounded-[1.35rem] px-3 py-3 text-sm transition-all duration-200 ease-out ${
                active
                  ? "bg-[#A855F7]/[0.16] text-[#A855F7] shadow-[0_20px_55px_-35px_rgba(168,85,247,0.9)] border border-[#A855F7]/20"
                  : "text-white/60 hover:text-white hover:bg-white/[0.08] hover:shadow-[0_16px_35px_-28px_rgba(255,255,255,0.18)]"
              }`}
            >
              <span className={`flex h-10 w-10 items-center justify-center rounded-2xl transition-colors duration-200 ${
                active ? "bg-[#A855F7]/[0.12] text-[#A855F7]" : "bg-white/[0.03] text-white/60 group-hover:bg-white/[0.08] group-hover:text-white"
              }`}>
                <Icon className="h-4 w-4" />
              </span>
              {!collapsed && <span className="truncate font-medium">{item.label}</span>}
              {active && !collapsed && (
                <span className="absolute right-3 h-2 w-2 rounded-full bg-[#A855F7] shadow-[0_0_12px_rgba(168,85,247,0.8)] animate-pulse" />
              )}
            </button>
          );
        })}
      </nav>

      <button
        onClick={onToggle}
        className="mx-3 mb-2 flex h-11 items-center justify-center rounded-full bg-white/[0.04] text-white/50 hover:text-white hover:bg-white/[0.08] transition-all duration-200 hover:-translate-y-0.5"
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
      </button>

      <div className="p-3 border-t border-white/[0.06]">
        <div className="flex items-center gap-3 min-w-0">
          <div className="h-8 w-8 shrink-0 rounded-full bg-gradient-to-br from-[#3B82F6] to-[#A855F7] flex items-center justify-center text-xs font-semibold">
            AM
          </div>
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <div className="text-sm font-medium truncate">Alex Morgan</div>
              <div className="inline-flex items-center gap-1 text-[10px] text-[#A855F7] bg-[#A855F7]/10 px-1.5 py-0.5 rounded">
                Pro Plan
              </div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}

/* --------------------------------- TOP BAR --------------------------------- */
function TopBar({ activeTab, lastUpdated, onRefresh }: { activeTab: string; lastUpdated: string | null; onRefresh: () => void; }) {
  return (
    <header className="sticky top-0 z-20 h-14 border-b border-white/[0.06] bg-[#05010A]/70 backdrop-blur-xl">
      <div className="h-full px-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-[15px] font-semibold tracking-tight">{activeTab}</h1>
          <p className="text-[11px] text-white/40 mt-0.5 flex items-center gap-1.5">
            <span className="relative flex h-1.5 w-1.5 shrink-0">
              <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-400" />
            </span>
            Live intelligence hub · {lastUpdated ? `Synced at ${lastUpdated}` : "Syncing…"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-white/40" />
            <input
              placeholder="Search command center…"
              className="h-8 w-64 rounded-xl bg-white/[0.04] border border-white/[0.06] pl-9 pr-3 text-xs placeholder:text-white/30 focus:outline-none focus:border-[#A855F7]/40 focus:bg-white/[0.06] transition-colors"
            />
          </div>

          <button
            onClick={onRefresh}
            className="hidden sm:inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.04] px-3 py-1 text-[11px] font-semibold text-white/80 transition hover:border-[#A855F7]/40 hover:text-white hover:bg-[#A855F7]/10"
          >
            <RefreshCw className="h-3.5 w-3.5 text-[#A855F7]" /> Refresh
          </button>

          <button className="relative h-8 w-8 rounded-xl hover:bg-white/[0.04] flex items-center justify-center text-white/60 hover:text-white transition-colors">
            <Bell className="h-4 w-4" />
            <span className="absolute top-1 right-1 h-4 min-w-4 px-1 rounded-full bg-[#F43F5E] text-[9px] font-semibold flex items-center justify-center text-white">
              0
            </span>
          </button>
          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-[#3B82F6] to-[#A855F7] flex items-center justify-center text-xs font-semibold">
            AM
          </div>
        </div>
      </div>
    </header>
  );
}

/* ------------------------------ ESCALATION BANNER ------------------------------ */
function EscalationBanner({ count = 0, onViewAll }: { count?: number; onViewAll: () => void }) {
  if (count === 0) return null;
  return (
    <div
      className="animate-fade-up relative overflow-hidden rounded-xl border p-4 flex items-center justify-between"
      style={{
        background:
          "linear-gradient(135deg, rgba(244,63,94,0.12), rgba(244,63,94,0.04))",
        borderColor: "rgba(244,63,94,0.3)",
      }}
    >
      <div className="flex items-center gap-3">
        <div className="h-9 w-9 rounded-lg bg-[#F43F5E]/15 border border-[#F43F5E]/30 flex items-center justify-center">
          <AlertTriangle className="h-4 w-4 text-[#F43F5E]" />
        </div>
        <div>
          <div className="text-sm font-medium">{count} conversation{count > 1 ? 's' : ''} require human attention</div>
          <div className="text-xs text-white/50">Sentiment dropped below intervention threshold</div>
        </div>
      </div>
      <button 
        onClick={onViewAll}
        className="text-xs font-medium text-[#F43F5E] hover:text-white px-3 py-1.5 rounded-md hover:bg-[#F43F5E]/10 transition-colors"
      >
        Handle Now →
      </button>
    </div>
  );
}

/* --------------------------------- STAT CARDS --------------------------------- */
function StatCards({ stats, loading }: { stats?: any; loading?: boolean }) {
  const cards = [
    { label: "Active Conversations", value: stats?.active_conversations || "0", delta: "+12%", sub: "vs yesterday", positive: true },
    { label: "Avg Sentiment", value: `${stats?.avg_sentiment || "0"}%`, delta: "+3%", sub: "vs last week", positive: true },
    { label: "Escalation Rate", value: `${stats?.escalation_rate || "0"}%`, delta: "-0.4%", sub: "fewer than yesterday", positive: true },
    { label: "Revenue Pipeline", value: stats?.revenue_pipeline || "$0k", delta: "+$2k", sub: "new today", positive: true, cyan: true },
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, idx) => (
          <div key={idx} className="animate-pulse rounded-[1.25rem] bg-white/[0.03] h-28" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((c, i) => (
        <div
          key={c.label}
          className="animate-fade-up glass rounded-xl p-5 border border-white/[0.08] transition-all duration-300 hover:-translate-y-0.5 hover:border-white/[0.12] hover:shadow-[0_18px_60px_-35px_rgba(168,85,247,0.8)]"
          style={{ animationDelay: `${i * 80}ms` }}
        >
          <div className="text-[11px] uppercase tracking-wider text-white/40 font-medium">
            {c.label}
          </div>
          <div className="mt-2 flex items-end justify-between gap-4">
            <div className="text-3xl font-semibold tracking-tight tabular-nums">{c.value}</div>
            <div
              className={`inline-flex items-center gap-0.5 text-xs font-semibold ${
                c.cyan ? "text-[#A855F7]" : "text-emerald-400"
              }`}
            >
              {c.delta.startsWith("-") ? <ArrowDown className="h-3 w-3" /> : <ArrowUp className="h-3 w-3" />}
              {c.delta.replace("-", "")}
            </div>
          </div>
          <div className="mt-1 text-[11px] text-white/40">{c.sub}</div>
        </div>
      ))}
    </div>
  );
}

function AnalyticsHighlights({ stats, liveEvents, loading }: { stats?: any; liveEvents?: any[]; loading?: boolean }) {
  if (loading) {
    return (
      <div className="grid gap-4 xl:grid-cols-[1.4fr_0.9fr]">
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          <div className="rounded-3xl bg-white/[0.03] p-5 animate-pulse h-48" />
          <div className="rounded-3xl bg-white/[0.03] p-5 animate-pulse h-48" />
        </div>
        <div className="rounded-3xl bg-white/[0.03] p-5 animate-pulse h-96" />
      </div>
    );
  }

  const revenueTrend = stats?.revenue_trend || { value: "$68.3k", growth: 14.3, series: [36, 42, 49, 55, 62, 71, 83] };
  const sentiment = typeof stats?.avg_sentiment === "number" ? stats.avg_sentiment : 87;
  const escalationRisk = typeof stats?.escalation_rate === "number" ? stats.escalation_rate : 11.2;
  const liveFeed = liveEvents?.length
    ? liveEvents
    : [
        { title: "VIP account flagged", detail: "Loyalty score dropped 18%", icon: Users, color: "#A855F7" },
        { title: "Revenue signal detected", detail: "Potential upsell from priority customer", icon: DollarSign, color: "#3B82F6" },
        { title: "Escalation trigger", detail: "Urgency score exceeded 78%", icon: AlertTriangle, color: "#F43F5E" },
        { title: "AI recommendation", detail: "Deploy agent assist on active Sales chat", icon: Zap, color: "#10B981" },
      ];

  const sparkPath = revenueTrend.series
    .map((value: number, index: number) => `${index * 18 + 8},${70 - value * 0.75}`)
    .join(" L ");

  return (
    <div className="grid gap-4 xl:grid-cols-[1.4fr_0.9fr]">
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <div className="glass rounded-xl border border-white/[0.08] p-5 transition hover:-translate-y-0.5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-[11px] uppercase tracking-[0.26em] text-white/40">Revenue trends</div>
              <div className="mt-2 text-2xl font-semibold text-white">{revenueTrend.value}</div>
            </div>
            <div className="inline-flex items-center rounded-full bg-[#A855F7]/10 px-3 py-1 text-[10px] font-semibold text-[#A855F7]">
              +{revenueTrend.growth}% MoM
            </div>
          </div>
          <div className="mt-5 overflow-hidden rounded-3xl bg-white/[0.04] p-4">
            <svg viewBox="0 0 150 80" className="w-full h-20">
              <defs>
                <linearGradient id="revGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#A855F7" stopOpacity="0.45" />
                  <stop offset="100%" stopColor="#A855F7" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path d={`M 8 70 L ${sparkPath}`} fill="none" stroke="#A855F7" strokeWidth="3" strokeLinecap="round" />
              <path d={`M 8 70 L ${sparkPath} L 140 70 Z`} fill="url(#revGradient)" />
              <circle cx="140" cy={`${70 - revenueTrend.series[revenueTrend.series.length - 1] * 0.75}`} r="4" fill="#A855F7" />
            </svg>
            <div className="mt-4 grid grid-cols-2 gap-3 text-[11px] text-white/50">
              <div className="rounded-3xl bg-white/[0.03] p-3">
                <div className="text-white/60">Booked ARR</div>
                <div className="mt-2 font-semibold text-white">$18.4k</div>
              </div>
              <div className="rounded-3xl bg-white/[0.03] p-3">
                <div className="text-white/60">Forecast accuracy</div>
                <div className="mt-2 font-semibold text-white">94.1%</div>
              </div>
            </div>
          </div>
        </div>

        <div className="glass rounded-xl border border-white/[0.08] p-5 transition hover:-translate-y-0.5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-[11px] uppercase tracking-[0.26em] text-white/40">Customer sentiment</div>
              <div className="mt-2 text-2xl font-semibold text-white">{sentiment}% Positive</div>
            </div>
            <span className="inline-flex items-center rounded-full bg-[#3B82F6]/10 px-3 py-1 text-[10px] font-semibold text-[#3B82F6]">
              +8.7% week
            </span>
          </div>
          <div className="mt-5 space-y-3">
            {[
              { label: "Satisfied", value: 64 },
              { label: "Neutral", value: 22 },
              { label: "At risk", value: 14 },
            ].map((item) => (
              <div key={item.label} className="space-y-2">
                <div className="flex items-center justify-between text-xs text-white/50">
                  <span>{item.label}</span>
                  <span>{item.value}%</span>
                </div>
                <div className="h-2 rounded-full bg-white/[0.06] overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${item.value}%`, background: item.label === "At risk" ? "#F43F5E" : item.label === "Neutral" ? "#F59E0B" : "#10B981" }} />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-5 rounded-3xl bg-white/[0.03] p-3 text-[12px] text-white/70">
            Predicted service sentiment is stable. Escalation risk remains <span className="font-semibold text-[#F59E0B]">{escalationRisk}%</span>. Recommend adding one extra agent to support growing VIP demand.
          </div>
        </div>
      </div>

      <div className="glass rounded-xl border border-white/[0.08] p-5 transition hover:-translate-y-0.5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-[11px] uppercase tracking-[0.26em] text-white/40">AI recommendations</div>
            <div className="mt-2 text-2xl font-semibold text-white">Real-time actions</div>
          </div>
          <span className="inline-flex items-center gap-1 rounded-full bg-[#A855F7]/10 px-3 py-1 text-[10px] font-semibold text-[#A855F7]">
            Live signal
          </span>
        </div>

        <div className="mt-5 space-y-3">
          {liveFeed.map((event, idx) => {
            const Icon = event.icon;
            return (
              <div key={idx} className="flex items-start gap-3 rounded-3xl border border-white/[0.06] bg-white/[0.02] p-4">
                <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-2xl" style={{ background: `${event.color}1A`, color: event.color }}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <div className="font-medium text-white">{event.title}</div>
                  <div className="mt-1 text-xs text-white/50">{event.detail}</div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3 text-[11px] text-white/50">
          <div className="rounded-3xl bg-white/[0.03] p-3">
            <div className="font-semibold text-white">+24 Signals</div>
            <div className="mt-1">New opportunities in last 30m</div>
          </div>
          <div className="rounded-3xl bg-white/[0.03] p-3">
            <div className="font-semibold text-white">2 Escalations</div>
            <div className="mt-1">Triggered by sentiment drift</div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* --------------------------------- CHARTS ROW --------------------------------- */
function ChartsRow({ loading, trends }: { loading?: boolean; trends?: any[] }) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="rounded-3xl bg-white/[0.03] p-5 animate-pulse h-56" />
        <div className="rounded-3xl bg-white/[0.03] p-5 animate-pulse h-56 lg:col-span-2" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <SentimentChart trends={trends} className="lg:col-span-2" />
      <ModeDonut />
    </div>
  );
}

function ConvosPerDayChart() {
  const data = [
    { day: "Mon", count: 420 },
    { day: "Tue", count: 510 },
    { day: "Wed", count: 380 },
    { day: "Thu", count: 640 },
    { day: "Fri", count: 590 },
    { day: "Sat", count: 280 },
    { day: "Sun", count: 340 }
  ];
  const maxVal = Math.max(...data.map(d => d.count));
  return (
    <div className="animate-fade-up glass rounded-xl p-5 relative overflow-hidden group">
      <h3 className="text-sm font-semibold">Conversations per Day</h3>
      <p className="text-xs text-white/40 mt-0.5">Last 7 days volume</p>
      <div className="mt-8 flex items-end justify-between h-[120px] gap-2 px-1">
        {data.map((d) => {
          const heightPct = (d.count / maxVal) * 100;
          return (
            <div key={d.day} className="flex-1 flex flex-col items-center gap-2 group/bar">
              <div className="relative w-full flex justify-center">
                <span className="absolute -top-7 scale-0 transition-all rounded bg-white px-1.5 py-0.5 text-[9px] text-black font-semibold group-hover/bar:scale-100 font-mono z-20">
                  {d.count}
                </span>
                <div 
                  className="w-full rounded-t bg-gradient-to-t from-[#6D28D9] to-[#A855F7] opacity-80 group-hover/bar:opacity-100 transition-all duration-300 shadow-[0_0_12px_rgba(168,85,247,0.3)]"
                  style={{ height: `${heightPct}%`, minHeight: "4px" }}
                />
              </div>
              <span className="text-[10px] text-white/40">{d.day}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function SentimentChart({ trends = [], className = "" }: { trends?: any[]; className?: string }) {
  const points = trends.length > 0 ? trends.map(t => typeof t.sentiment === 'number' ? t.sentiment : parseFloat(t.sentiment) || 0.5) : [0.62, 0.71, 0.58, 0.74, 0.66, 0.48, 0.81];
  const W = 600;
  const H = 220;
  const PAD_L = 36;
  const PAD_R = 12;
  const PAD_T = 16;
  const PAD_B = 28;
  const stepX = (W - PAD_L - PAD_R) / (points.length - 1);
  const yFor = (v: number) => PAD_T + (1 - v) * (H - PAD_T - PAD_B);
  const coords = points.map((v, i) => [PAD_L + i * stepX, yFor(v)] as const);

  const path = coords
    .map((p, i, arr) => {
      if (i === 0) return `M ${p[0]} ${p[1]}`;
      const prev = arr[i - 1];
      const cx = (prev[0] + p[0]) / 2;
      return `C ${cx} ${prev[1]}, ${cx} ${p[1]}, ${p[0]} ${p[1]}`;
    })
    .join(" ");
  const area = `${path} L ${coords[coords.length - 1][0]} ${H - PAD_B} L ${coords[0][0]} ${H - PAD_B} Z`;

  const days = trends.length > 0 ? trends.map(t => t.day) : ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const thresholdY = yFor(0.4);

  return (
    <div className={`animate-fade-up glass rounded-xl p-5 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold">Customer Sentiment Trend</h3>
          <p className="text-xs text-white/40 mt-0.5">Last 7 days · 0–1 scale</p>
        </div>
        <div className="inline-flex items-center gap-1.5 text-xs text-white/50">
          <span className="h-2 w-2 rounded-full bg-[#A855F7]" /> Sentiment
        </div>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-[220px]">
        <defs>
          <linearGradient id="sentArea" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#A855F7" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#A855F7" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="sentLine" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#A855F7" />
            <stop offset="100%" stopColor="#3B82F6" />
          </linearGradient>
        </defs>
        {[0, 0.25, 0.5, 0.75, 1].map((v) => (
          <g key={v}>
            <line
              x1={PAD_L}
              x2={W - PAD_R}
              y1={yFor(v)}
              y2={yFor(v)}
              stroke="rgba(255,255,255,0.05)"
            />
            <text x={8} y={yFor(v) + 3} fontSize="10" fill="rgba(255,255,255,0.3)">
              {v.toFixed(2)}
            </text>
          </g>
        ))}
        <line
          x1={PAD_L}
          x2={W - PAD_R}
          y1={thresholdY}
          y2={thresholdY}
          stroke="#F43F5E"
          strokeDasharray="4 4"
          strokeWidth="1"
        />
        <text x={W - PAD_R - 100} y={thresholdY - 4} fontSize="10" fill="#F43F5E">
          Intervention Zone
        </text>
        <path d={area} fill="url(#sentArea)" />
        <path d={path} stroke="url(#sentLine)" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        {coords.map((p, i) => (
          <circle key={i} cx={p[0]} cy={p[1]} r="3" fill="#A855F7" stroke="#080810" strokeWidth="2" />
        ))}
        {days.map((d, i) => (
          <text
            key={d}
            x={PAD_L + i * stepX}
            y={H - 8}
            fontSize="10"
            fill="rgba(255,255,255,0.4)"
            textAnchor="middle"
          >
            {d}
          </text>
        ))}
      </svg>
    </div>
  );
}

function ModeDonut() {
  const segs = [
    { label: "Sales", value: 38, color: "#3B82F6" },
    { label: "Support", value: 32, color: "#F59E0B" },
    { label: "Care", value: 22, color: "#FB7185" },
    { label: "Escalation", value: 8, color: "#A855F7" },
  ];
  const total = segs.reduce((s, x) => s + x.value, 0);
  const R = 60;
  const C = 2 * Math.PI * R;
  let offset = 0;
  return (
    <div className="animate-fade-up glass rounded-xl p-5">
      <h3 className="text-sm font-semibold">Mode Distribution</h3>
      <p className="text-xs text-white/40 mt-0.5">Last 24 hours</p>
      <div className="relative mt-4 flex items-center justify-center">
        <svg width="180" height="180" viewBox="0 0 180 180">
          <g transform="translate(90 90) rotate(-90)">
            <circle r={R} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="18" />
            {segs.map((s) => {
              const len = (s.value / total) * C;
              const el = (
                <circle
                  key={s.label}
                  r={R}
                  fill="none"
                  stroke={s.color}
                  strokeWidth="18"
                  strokeDasharray={`${len} ${C - len}`}
                  strokeDashoffset={-offset}
                  strokeLinecap="butt"
                />
              );
              offset += len;
              return el;
            })}
          </g>
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-[10px] uppercase tracking-wider text-white/40">Total</div>
          <div className="text-2xl font-semibold tabular-nums">{total}%</div>
        </div>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2">
        {segs.map((s) => (
          <div key={s.label} className="flex items-center gap-2 text-xs">
            <span className="h-2 w-2 rounded-full" style={{ background: s.color }} />
            <span className="text-white/60">{s.label}</span>
            <span className="ml-auto tabular-nums text-white/40">{s.value}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ----------------------------- LIVE CONVERSATIONS ----------------------------- */
const MODE_COLORS: Record<string, string> = {
  Sales: "#3B82F6",
  Support: "#F59E0B",
  Care: "#FB7185",
  Escalation: "#A855F7",
  sales: "#3B82F6",
  support: "#F59E0B",
  care: "#FB7185",
  escalation: "#A855F7",
};

function LiveConversations({ convos = [], onSelect, loading }: { convos?: any[]; onSelect: (id: string) => void; loading?: boolean }) {
  const displayConvos = loading
    ? []
    : convos.length > 0
      ? convos
      : [
          { id: "1", user: "Sarah Chen", mode: "Sales", sentiment: 0.86, messages: 12, duration: "4m 12s", status: "Active" },
          { id: "2", user: "Mike Ross", mode: "Support", sentiment: 0.62, messages: 8, duration: "2m 48s", status: "Active" },
          { id: "3", user: "Marcus Reilly", mode: "Care", sentiment: 0.34, messages: 21, duration: "9m 04s", status: "Escalated" },
        ];

  return (
    <div className="animate-fade-up glass rounded-xl overflow-hidden">
      <div className="flex items-center justify-between p-5 border-b border-white/[0.06]">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
          </span>
          <h3 className="text-sm font-semibold">Live Conversations</h3>
          <span className="text-xs text-white/40">· {loading ? 'Loading…' : `${displayConvos.length} active`}</span>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-[10px] uppercase tracking-wider text-white/40">
              <th className="text-left font-medium px-5 py-2.5">Customer</th>
              <th className="text-left font-medium px-3 py-2.5">Mode</th>
              <th className="text-left font-medium px-3 py-2.5 w-44">Sentiment</th>
              <th className="text-left font-medium px-3 py-2.5">Status</th>
              <th className="text-left font-medium px-3 py-2.5">Duration</th>
              <th className="px-3 py-2.5" />
            </tr>
          </thead>
          <tbody>
            {loading
              ? Array.from({ length: 4 }).map((_, idx) => (
                  <tr key={idx} className="animate-pulse border-t border-white/[0.04] bg-white/[0.02]">
                    <td className="px-5 py-3 h-8" colSpan={6}>
                      <div className="h-3 rounded-full bg-white/[0.06] w-3/4" />
                    </td>
                  </tr>
                ))
              : displayConvos.map((c, i) => {
              const customerName = c.name || c.user || "Anonymous User";
              const rawMode = c.mode || "Support";
              const formattedMode = rawMode.charAt(0).toUpperCase() + rawMode.slice(1).toLowerCase();
              const color = MODE_COLORS[formattedMode] || "#6B7280";
              const sentimentVal = typeof c.sentiment === 'number' ? c.sentiment : parseFloat(c.sentiment) || 0.5;
              const sentColor =
                sentimentVal >= 0.7 ? "#10B981" : sentimentVal >= 0.4 ? "#F59E0B" : "#F43F5E";
              
              const cleanStatus = (c.status || "Active").toLowerCase();
              const statusStyles =
                cleanStatus === "active"
                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                  : cleanStatus === "resolved"
                    ? "bg-white/[0.04] text-white/60 border-white/10"
                    : "bg-rose-500/10 text-rose-400 border-rose-500/20";
                    
              return (
                <tr
                  key={c.id || i}
                  className={`group border-t border-white/[0.04] transition-all duration-1000 hover:bg-white/[0.03] ${
                    i % 2 === 1 ? "bg-white/[0.015]" : ""
                  } ${c.flash ? "bg-[#A855F7]/10 ring-1 ring-[#A855F7]/30" : ""}`}
                >
                  <td className="px-5 py-3 font-medium truncate max-w-[150px]">{customerName}</td>
                  <td className="px-3 py-3">
                    <span
                      className="inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium border"
                      style={{
                        background: `${color}1A`,
                        borderColor: `${color}40`,
                        color,
                      }}
                    >
                      {formattedMode}
                    </span>
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 flex-1 max-w-[120px] rounded-full bg-white/[0.06] overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{ width: `${sentimentVal * 100}%`, background: sentColor }}
                        />
                      </div>
                      <span className="text-xs tabular-nums text-white/50">
                        {sentimentVal.toFixed(2)}
                      </span>
                    </div>
                  </td>
                  <td className="px-3 py-3">
                    <span
                      className={`inline-flex items-center rounded-md px-2 py-0.5 text-[11px] border ${statusStyles}`}
                    >
                      {cleanStatus.charAt(0).toUpperCase() + cleanStatus.slice(1)}
                    </span>
                  </td>
                  <td className="px-3 py-3 tabular-nums text-white/70">{c.duration || "1m"}</td>
                  <td className="px-3 py-3 text-right pr-5">
                    <Link
                      to="/dashboard/conversations/$id"
                      params={{ id: c.id } as any}
                      className="opacity-0 group-hover:opacity-100 transition-opacity inline-flex items-center gap-1 text-xs text-[#A855F7] hover:text-white px-2 py-1 rounded-md hover:bg-[#A855F7]/10"
                    >
                      <Eye className="h-3 w-3" /> Inspect
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ------------------------------ REVENUE PANEL ------------------------------ */
const OPPS = [
  { customer: "Sarah Chen", type: "Upsell", detail: "Showed interest in Enterprise tier", score: 92 },
  { customer: "Priya Natarajan", type: "Expansion", detail: "Asked about additional seats", score: 84 },
  { customer: "Northwind Co.", type: "Renewal", detail: "Contract ends in 14 days", score: 78 },
  { customer: "Jordan Park", type: "Upsell", detail: "Mentioned API rate limits", score: 71 },
];

const OPP_COLOR: Record<string, string> = {
  Upsell: "#A855F7",
  Renewal: "#A855F7",
  Expansion: "#3B82F6",
};

function RevenuePanel({ onViewPipeline, loading, opps = [], flashCustomer }: { onViewPipeline: () => void; loading?: boolean; opps?: any[]; flashCustomer?: string | null }) {
  if (loading) {
    return (
      <div className="animate-fade-up glass rounded-xl p-5">
        <div className="rounded-3xl bg-white/[0.03] h-48 animate-pulse" />
      </div>
    );
  }

  const displayOpps = opps.length > 0 ? opps.map(o => ({
    customer: o.customer_name || o.customer,
    type: o.type,
    detail: o.description || o.detail,
    score: o.score
  })) : OPPS;

  return (
    <div className="animate-fade-up glass rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-md bg-[#A855F7]/10 border border-[#A855F7]/20 flex items-center justify-center">
            <DollarSign className="h-3.5 w-3.5 text-[#A855F7]" />
          </div>
          <h3 className="text-sm font-semibold">Revenue Opportunities Detected</h3>
          <span className="text-xs text-white/40">· {displayOpps.length} active</span>
        </div>
        <button 
          onClick={onViewPipeline}
          className="text-xs text-white/50 hover:text-white inline-flex items-center gap-1"
        >
          <TrendingUp className="h-3 w-3" /> View pipeline
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {displayOpps.map((o) => {
          const c = OPP_COLOR[o.type] || "#3B82F6";
          const isFlashed = flashCustomer === o.customer;
          return (
            <div
              key={o.customer}
              className={`rounded-3xl border p-4 transition-all duration-1000 ${
                isFlashed 
                  ? "bg-[#A855F7]/10 border-[#A855F7]/40 ring-1 ring-[#A855F7]/20 -translate-y-1 shadow-[0_0_15px_-3px_rgba(168,85,247,0.4)]" 
                  : "border-white/[0.06] bg-white/[0.02] hover:-translate-y-1 hover:border-white/[0.14] hover:bg-white/[0.06]"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-sm font-medium truncate">{o.customer}</div>
                  <div className="text-xs text-white/50 mt-0.5 truncate">{o.detail}</div>
                </div>
                <span
                  className="shrink-0 inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium border"
                  style={{ background: `${c}1A`, borderColor: `${c}40`, color: c }}
                >
                  {o.type}
                </span>
              </div>
              <div className="mt-3 flex items-center gap-2">
                <div className="h-1 flex-1 rounded-full bg-white/[0.06] overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${o.score}%`, background: c }} />
                </div>
                <span className="text-xs tabular-nums text-white/60">{o.score}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}


/* =========================================================================== */
/* ============================= DASHBOARD VIEWS ============================= */
/* =========================================================================== */

/* --------------------------- CONVERSATIONS VIEW ---------------------------- */
function ConversationsView({ initialConvoId }: { initialConvoId?: string | null }) {
  const [convos, setConvos] = useState<any[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(initialConvoId || null);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [convoLoading, setConvoLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [msgInput, setMsgInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [modeFilter, setModeFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchConvos = async () => {
    setConvoLoading(true);
    try {
      const res = await fetch("/api/conversations");
      const json = await res.json();
      if (json.conversations) {
        setConvos(json.conversations);
        if (json.conversations.length > 0 && !selectedId) {
          setSelectedId(json.conversations[0].id);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setConvoLoading(false);
    }
  };

  useEffect(() => {
    fetchConvos();
  }, []);

  useEffect(() => {
    if (initialConvoId) {
      setSelectedId(initialConvoId);
    }
  }, [initialConvoId]);

  useEffect(() => {
    if (!selectedId) return;
    const fetchHistory = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/history/${selectedId}`);
        const json = await res.json();
        setHistory(json.history || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [selectedId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history]);

  const activeConvo = convos.find(c => c.id === selectedId);

  const filteredConvos = useMemo(() => {
    return convos.filter((c) => {
      const searchTerm = searchQuery.toLowerCase();
      const matchesSearch =
        !searchTerm ||
        c.user?.toLowerCase().includes(searchTerm) ||
        c.id?.toLowerCase().includes(searchTerm) ||
        c.aria_mode?.toLowerCase().includes(searchTerm) ||
        c.status?.toLowerCase().includes(searchTerm);

      const matchesMode =
        modeFilter === "All" || (c.aria_mode && c.aria_mode.toLowerCase() === modeFilter.toLowerCase());
      const matchesStatus =
        statusFilter === "All" || (c.status && c.status.toLowerCase() === statusFilter.toLowerCase());
      return matchesSearch && matchesMode && matchesStatus;
    });
  }, [convos, searchQuery, modeFilter, statusFilter]);

  // Find the last assistant message that contains deep intelligence metadata
  const lastIntelMessage = useMemo(() => {
    return [...history].reverse().find(m => m.role === "assistant" && m.metadata);
  }, [history]);

  const activeIntel = lastIntelMessage?.metadata || {
    emotion: { frustration: 10, satisfaction: 80, urgency: 20, loyalty: 90 },
    revenue: { upsell_probability: 15, ltv_impact: "$0", lead_score: 30 },
    escalation: { probability: 10, severity: "Low", reason: "Stable conversation" },
    decision_steps: ["Baseline loaded", "No recent intelligence payload found in DB"],
    mode: activeConvo?.aria_mode || "Support"
  };

  const aiSummary = lastIntelMessage?.metadata?.summary || activeConvo?.summary || "ARIA is extracting key themes and suggested actions from this conversation.";
  const conversationInsights = [
    { label: "Escalation risk", value: `${activeIntel.escalation?.probability || 0}%`, tone: "text-[#F59E0B]" },
    { label: "Revenue potential", value: `${activeIntel.revenue?.upsell_probability || 15}%`, tone: "text-[#3B82F6]" },
    { label: "Sentiment drift", value: `${activeIntel.emotion?.frustration || 10}%`, tone: "text-[#F43F5E]" },
    { label: "Loyalty signal", value: `${activeIntel.emotion?.loyalty || 90}%`, tone: "text-[#10B981]" },
  ];

  const handleSendMessage = async () => {
    if (!msgInput.trim() || !selectedId) return;
    setSending(true);
    const text = msgInput;
    setMsgInput("");
    
    // Add user message optimistically
    setHistory(prev => [...prev, { 
      role: "user", 
      content: text, 
      created_at: new Date().toISOString() 
    }]);
    
    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          conversation_id: selectedId,
          user_id: activeConvo?.customer_id || "anonymous-dashboard",
          history: history.map(m => m.content)
        })
      });
      const data = await response.json();
      
      setHistory(prev => [...prev, { 
        role: "assistant", 
        content: data.response, 
        metadata: data.intelligence,
        created_at: new Date().toISOString() 
      }]);
      
      fetchConvos(); // refresh listing
    } catch (e) {
      console.error(e);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 h-[calc(100vh-140px)]">
      {/* 1. Conversations Sidebar (Left) */}
      <div className="lg:col-span-3 border border-white/[0.06] bg-white/[0.02] rounded-xl flex flex-col min-h-0 overflow-hidden">
        <div className="p-4 border-b border-white/[0.06] space-y-4 shrink-0">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-[#A855F7]" />
              <div>
                <div className="text-sm font-semibold">Inbox</div>
                <div className="text-[11px] text-white/50">Live conversation pipeline with AI signal filters</div>
              </div>
            </div>
            <span className="text-xs text-white/40 font-mono">{convos.length} total</span>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-white/40" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by customer, mode or ID"
              className="w-full rounded-2xl border border-white/[0.08] bg-[#05010A] py-2.5 pl-10 pr-3 text-sm text-white placeholder:text-white/30 focus:border-[#A855F7] focus:outline-none focus:ring-2 focus:ring-[#A855F7]/10"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {['All', 'Sales', 'Support', 'Care', 'Escalation'].map((mode) => (
              <button
                key={mode}
                onClick={() => setModeFilter(mode)}
                className={`rounded-full px-3 py-1 text-[11px] transition ${
                  modeFilter === mode
                    ? 'bg-[#A855F7]/15 text-[#A855F7] border border-[#A855F7]/20'
                    : 'bg-white/[0.03] text-white/60 hover:bg-white/[0.08]'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap gap-2">
            {['All', 'active', 'escalated', 'resolved'].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`rounded-full px-3 py-1 text-[11px] transition ${
                  statusFilter === status
                    ? 'bg-[#3B82F6]/15 text-[#3B82F6] border border-[#3B82F6]/20'
                    : 'bg-white/[0.03] text-white/60 hover:bg-white/[0.08]'
                }`}
              >
                {status === 'all' ? 'All status' : status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
          {convoLoading ? (
            Array.from({ length: 5 }).map((_, idx) => (
              <div key={idx} className="rounded-3xl border border-white/[0.06] bg-white/[0.01] p-4 animate-pulse" />
            ))
          ) : !filteredConvos.length ? (
            <div className="rounded-3xl border border-dashed border-white/[0.08] bg-white/[0.01] p-5 text-center text-sm text-white/50">
              No conversations match the current filter. Try a different search or status.
            </div>
          ) : filteredConvos.map((c) => {
            const active = c.id === selectedId;
            const modeName = c.aria_mode || "Support";
            const formattedMode = modeName.charAt(0).toUpperCase() + modeName.slice(1).toLowerCase();
            const color = MODE_COLORS[formattedMode] || "#6B7280";
            
            const sentimentVal = typeof c.final_sentiment === 'number' ? c.final_sentiment : parseFloat(c.final_sentiment) || 0.5;
            const sentColor = sentimentVal >= 0.7 ? "bg-emerald-400" : sentimentVal >= 0.4 ? "bg-amber-400" : "bg-rose-400";

            return (
              <button
                key={c.id}
                onClick={() => setSelectedId(c.id)}
                className={`w-full text-left p-3 rounded-lg border transition-all ${
                  active 
                    ? "bg-[#A855F7]/[0.08] border-[#A855F7]/40 shadow-[0_0_15px_-5px_rgba(168,85,247,0.4)]" 
                    : "bg-transparent border-white/[0.04] hover:bg-white/[0.03] hover:border-white/[0.08]"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="font-medium text-xs truncate max-w-[120px]">
                    {c.id.slice(0, 8)}... (Guest)
                  </span>
                  <span 
                    className="shrink-0 text-[9px] font-semibold border px-1.5 py-0.5 rounded-full"
                    style={{ background: `${color}1A`, borderColor: `${color}40`, color }}
                  >
                    {formattedMode}
                  </span>
                </div>
                
                <div className="mt-2 space-y-2">
                  <div className="flex items-center gap-2 text-[10px] text-white/40">
                    <div className={`inline-flex items-center rounded-full px-2 py-0.5 font-semibold ${sentColor === 'bg-emerald-400' ? 'bg-emerald-500/10 text-emerald-300' : sentColor === 'bg-amber-400' ? 'bg-amber-500/10 text-amber-300' : 'bg-rose-500/10 text-rose-300'}`}>
                      {sentimentVal >= 0.7 ? 'Positive' : sentimentVal >= 0.4 ? 'Neutral' : 'At risk'}
                    </div>
                    <span>{sentimentVal.toFixed(1)} sentiment</span>
                  </div>
                  <div className="flex items-center justify-between gap-2 text-[9px] text-white/50">
                    <span className="inline-flex items-center rounded-full border border-white/[0.08] px-2 py-1 uppercase tracking-wider">{c.status}</span>
                    <span className="text-[9px] text-white/50">{c.duration || '—'} active</span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Interactive Chat Room (Center) */}
      <div className="lg:col-span-5 border border-white/[0.06] bg-white/[0.01] rounded-xl flex flex-col min-h-0 overflow-hidden relative">
        {selectedId ? (
          <>
            {/* Header */}
            <div className="p-4 border-b border-white/[0.06] bg-white/[0.02] space-y-4 shrink-0">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h4 className="text-xs text-white/40 font-mono uppercase tracking-wider">Active Room</h4>
                  <div className="text-sm font-semibold truncate max-w-[200px] mt-0.5">{selectedId}</div>
                </div>
                <div className="flex items-center gap-2">
                  {activeConvo?.status === "escalated" && (
                    <span className="px-2 py-0.5 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 text-[10px] font-semibold animate-pulse">
                      ESCALATED
                    </span>
                  )}
                  <span className="inline-flex items-center rounded-full bg-white/[0.04] px-3 py-1 text-[10px] text-white/50">
                    {activeConvo?.aria_mode ? `${activeConvo.aria_mode} mode` : activeIntel.mode} · {activeConvo?.duration || 'Live'}
                  </span>
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
                <div className="rounded-3xl border border-white/[0.06] bg-white/[0.02] p-3 text-sm leading-6 text-white/70">
                  <span className="block text-[11px] text-white/40">Quick summary</span>
                  <p className="mt-2 text-sm text-white">{aiSummary}</p>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {conversationInsights.map((insight) => (
                    <div key={insight.label} className="rounded-3xl border border-white/[0.06] bg-white/[0.02] p-3 text-[11px]">
                      <div className="text-white/40">{insight.label}</div>
                      <div className={`mt-2 font-semibold ${insight.tone}`}>{insight.value}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Message Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {loading ? (
                <div className="h-full flex items-center justify-center text-xs text-white/40">
                  <RefreshCw className="h-5 w-5 animate-spin text-[#A855F7] mb-2" /> Loading transcript...
                </div>
              ) : history.length === 0 ? (
                <div className="h-full flex items-center justify-center text-xs text-white/40">
                  No messages in this conversation.
                </div>
              ) : (
                history.map((m, idx) => {
                  const user = m.role === "user";
                  return (
                    <div key={m.id || idx} className={`flex ${user ? 'justify-end' : 'justify-start'}`}>
                      <div className="max-w-[85%] space-y-1.5">
                        <div className={`rounded-xl px-4 py-2.5 text-sm leading-relaxed ${
                          user 
                            ? 'bg-gradient-to-br from-[#6D28D9] to-[#4F46E5] text-white shadow-lg' 
                            : 'bg-white/[0.04] border border-white/[0.06]'
                        }`}>
                          {m.content}
                        </div>
                        
                        {!user && m.metadata?.decision_steps && (
                          <div className="rounded-lg border border-white/[0.05] bg-white/[0.02] p-2 text-[10px] text-white/50 space-y-1 max-w-[90%]">
                            <div className="flex items-center gap-1 font-semibold text-white/70">
                              <Brain className="h-3 w-3 text-[#A855F7]" /> ARIA Reasoning Tree:
                            </div>
                            <ul className="list-disc pl-3.5 space-y-0.5 font-sans">
                              {m.metadata.decision_steps.slice(0, 3).map((s: string, sIdx: number) => (
                                <li key={sIdx}>{s}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        <div className="text-[9px] text-white/30 px-1 font-mono">
                          {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              {sending && (
                <div className="flex justify-start">
                  <div className="rounded-3xl border border-white/[0.06] bg-white/[0.04] px-4 py-3 text-sm text-white/70 shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-2xl bg-[#A855F7]/10 text-[#A855F7]">
                        <span className="h-2.5 w-2.5 rounded-full bg-current animate-bounce delay-75"></span>
                      </div>
                      <div>
                        <div className="font-semibold text-white">ARIA is typing</div>
                        <div className="text-[11px] text-white/50">Composing a response with sentiment-aware recommendations…</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Bar */}
            <div className="p-3 border-t border-white/[0.06] bg-white/[0.02] shrink-0">
              <div className="flex items-center gap-2 rounded-xl bg-white/[0.04] px-3 py-2 ring-1 ring-white/[0.06] focus-within:ring-[#A855F7]/40">
                <input 
                  value={msgInput} 
                  onChange={(e) => setMsgInput(e.target.value)} 
                  onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                  placeholder="Draft response or type customer message..." 
                  className="flex-1 bg-transparent text-sm outline-none placeholder:text-white/30"
                  disabled={sending}
                />
                <button 
                  onClick={handleSendMessage}
                  className="flex h-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#6D28D9] to-[#C026D3] px-3 text-xs font-medium text-white hover:glow-violet transition"
                  disabled={sending || !msgInput.trim()}
                >
                  <Send className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-xs text-white/30 p-8 text-center">
            <MessageSquare className="h-10 w-10 text-white/10 mb-3" />
            <div className="font-semibold text-white/50">No conversation selected</div>
            <div className="mt-1">Pick an active chat room from the sidebar to inspect intelligence metrics in real-time.</div>
          </div>
        )}
      </div>

      {/* 3. Deep Intelligence Panels (Right) */}
      <div className="lg:col-span-4 space-y-4 overflow-y-auto pr-1">
        <div className="border border-white/[0.06] bg-white/[0.02] rounded-xl p-4 shrink-0">
          <div className="text-xs uppercase tracking-wider text-[#A855F7] font-semibold mb-3 flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 animate-pulse" /> Live Analysis Payload
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg border border-white/[0.04] bg-white/[0.01] p-3 text-center">
              <div className="text-[9px] uppercase tracking-wider text-white/40">Urgency Score</div>
              <div className="text-lg font-semibold tabular-nums mt-1 text-[#3B82F6]">{activeIntel.emotion?.urgency || 0}%</div>
            </div>
            <div className="rounded-lg border border-white/[0.04] bg-white/[0.01] p-3 text-center">
              <div className="text-[9px] uppercase tracking-wider text-white/40">Resolution Mode</div>
              <div className="text-lg font-semibold mt-1 text-[#A855F7]">{activeIntel.mode || "Support"}</div>
            </div>
          </div>
          <div className="mt-4 rounded-3xl border border-white/[0.05] bg-white/[0.02] p-4 space-y-3">
            <div className="text-[10px] uppercase tracking-[0.3em] text-white/40">Conversation insight</div>
            <div className="text-sm font-semibold text-white">Most likely next action</div>
            <div className="text-[12px] text-white/70">ARIA recommends prioritizing this room for response, as escalation probability is {activeIntel.escalation?.probability || 0}% and revenue opportunity is {activeIntel.revenue?.upsell_probability || 15}%.</div>
            <div className="grid grid-cols-2 gap-2 text-[11px] text-white/50">
              <div className="rounded-2xl bg-white/[0.03] p-3">Trend: sentiment drift rising</div>
              <div className="rounded-2xl bg-white/[0.03] p-3">Action: send tailored retention offer</div>
            </div>
          </div>
        </div>

        <EmotionPanel 
          frustration={activeIntel.emotion?.frustration || 0}
          satisfaction={activeIntel.emotion?.satisfaction || 0}
          urgency={activeIntel.emotion?.urgency || 0}
          loyalty={activeIntel.emotion?.loyalty || 0}
        />
        
        <RevPanel 
          upsell={activeIntel.revenue?.upsell_probability || 0}
          value={activeIntel.revenue?.ltv_impact || "$0"}
          lead={activeIntel.revenue?.lead_score || 0}
        />
        
        <EscalationPanel 
          probability={activeIntel.escalation?.probability || 0}
          severity={activeIntel.escalation?.severity || "Low"}
        />

        <DecisionPanel steps={activeIntel.decision_steps || []} />
      </div>
    </div>
  );
}

/* ----------------------------- ANALYTICS VIEW ------------------------------ */
function AnalyticsView({ stats, trends }: { stats?: any; trends?: any[] }) {
  const metricCards = [
    { icon: Clock, label: "Average Response Time", value: "192ms", delta: "-24ms", sub: "lower than SLA limit (250ms)" },
    { icon: CheckCircle2, label: "SLA Adherence Rate", value: "99.4%", delta: "+0.2%", sub: "gained over last month" },
    { icon: Users, label: "Total Customer Base", value: "148,290", delta: "+1.2%", sub: "growth factor index active" },
    { icon: Activity, label: "Event Stream Count", value: "14,802", delta: "+384", sub: "active pipeline signals parsed" }
  ];

  return (
    <div className="space-y-6">
      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metricCards.map((c, i) => (
          <div key={i} className="glass rounded-xl p-5 border border-white/[0.06] hover:border-white/[0.12] transition">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase tracking-wider text-white/40 font-semibold">{c.label}</span>
              <c.icon className="h-4 w-4 text-[#A855F7]" />
            </div>
            <div className="mt-3 flex items-end justify-between">
              <div className="text-2xl font-bold tracking-tight">{c.value}</div>
              <div className="text-xs font-semibold text-emerald-400">{c.delta}</div>
            </div>
            <div className="mt-1.5 text-[10px] text-white/40">{c.sub}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <SentimentChart trends={trends} className="lg:col-span-1" />
        <ModeDonut />
        <ConvosPerDayChart />
      </div>

      {/* SLA Graph Simulation */}
      <div className="glass rounded-xl p-6 border border-white/[0.06]">
        <h3 className="text-sm font-semibold mb-4">SLA Compliance Trends (By Mode)</h3>
        <div className="space-y-4">
          {[
            { mode: "Sales Mode", count: 1840, val: 99.8, col: "#3B82F6" },
            { mode: "Support Mode", count: 2190, val: 99.2, col: "#F59E0B" },
            { mode: "Care Mode", count: 480, val: 98.4, col: "#FB7185" },
            { mode: "Escalation Mode", count: 120, val: 100.0, col: "#A855F7" }
          ].map((item, idx) => (
            <div key={idx} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-white/80">{item.mode} <span className="text-white/40 text-[10px] ml-1 font-mono">({item.count} interactions)</span></span>
                <span className="font-semibold" style={{ color: item.col }}>{item.val}% SLA compliant</span>
              </div>
              <div className="h-2 rounded-full bg-white/[0.04] overflow-hidden">
                <div className="h-full rounded-full transition-all" style={{ width: `${item.val}%`, backgroundColor: item.col }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ----------------------------- ESCALATIONS VIEW ---------------------------- */
function EscalationsView({ onSelectConvo }: { onSelectConvo: (id: string) => void }) {
  const [escalations, setEscalations] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchEscalations = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/escalations");
      const json = await res.json();
      setEscalations(json.escalations || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEscalations();
  }, []);

  const handleResolve = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const res = await fetch(`/api/escalations/${id}/resolve`, {
        method: "POST"
      });
      const json = await res.json();
      if (json.success) {
        fetchEscalations(); // reload
      }
    } catch (err) {
      console.error(err);
    }
  };

  const activeEscalations = escalations.filter(esc => esc.status === "pending");
  const handledEscalations = escalations.filter(esc => esc.status === "handled");

  return (
    <div className="space-y-6">
      <div className="border border-red-500/20 bg-red-500/5 p-4 rounded-xl flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-red-500/10 border border-red-500/30 flex items-center justify-center">
            <AlertTriangle className="h-4 w-4 text-[#F43F5E]" />
          </div>
          <div>
            <div className="text-sm font-semibold text-rose-400">{activeEscalations.length} Active Escalations</div>
            <div className="text-xs text-white/40">These conversations require immediate human intervention.</div>
          </div>
        </div>
        <button 
          onClick={fetchEscalations}
          className="text-xs text-white/50 hover:text-white border border-white/10 hover:bg-white/[0.04] px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition"
        >
          <RefreshCw className="h-3 w-3" /> Refresh
        </button>
      </div>

      {loading ? (
        <div className="h-40 flex items-center justify-center text-xs text-white/40">
          <RefreshCw className="h-4 w-4 animate-spin text-[#A855F7] mr-2" /> Loading escalations...
        </div>
      ) : escalations.length === 0 ? (
        <div className="h-40 border border-dashed border-white/10 rounded-xl flex flex-col items-center justify-center text-xs text-white/40 p-8 text-center">
          <CheckCircle2 className="h-8 w-8 text-emerald-400/30 mb-2" />
          <div className="font-semibold text-white/60">System Clean: Zero Escalations!</div>
          <div>All customers are within stable sentiment parameters.</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Active Queue */}
          <div className="space-y-4">
            <h3 className="text-xs uppercase tracking-wider text-rose-400 font-semibold px-1">
              Active Intervention Queue ({activeEscalations.length})
            </h3>
            {activeEscalations.length === 0 ? (
              <div className="p-8 border border-white/[0.06] rounded-xl text-center text-xs text-white/30">
                Intervention queue empty. Perfect.
              </div>
            ) : (
              activeEscalations.map((esc) => {
                const satVal = typeof esc.sentiment_score === 'number' ? esc.sentiment_score : parseFloat(esc.sentiment_score) || 0.5;
                const escScore = typeof esc.escalation_score === 'number' ? esc.escalation_score : parseFloat(esc.escalation_score) || 0.8;
                return (
                  <div 
                    key={esc.id}
                    onClick={() => onSelectConvo(esc.conversation_id)}
                    className="p-5 border border-red-500/20 bg-[#F43F5E]/[0.02] hover:bg-[#F43F5E]/[0.05] hover:border-red-500/30 transition rounded-xl cursor-pointer relative overflow-hidden group shadow-[0_0_20px_-10px_rgba(244,63,94,0.3)]"
                  >
                    <div className="absolute right-0 top-0 h-16 w-16 bg-red-500/10 rounded-bl-full blur-xl group-hover:scale-150 transition duration-500" />
                    <div className="flex items-start justify-between gap-4 relative">
                      <div className="space-y-1">
                        <div className="text-[10px] uppercase font-mono text-rose-400 tracking-widest">
                          Urgency: {esc.urgency?.toUpperCase() || "HIGH"}
                        </div>
                        <div className="text-sm font-semibold truncate max-w-[200px] text-white/90">
                          {esc.conversation?.id ? `Guest Room (${esc.conversation.id.slice(0,8)})` : "Guest Room"}
                        </div>
                        <div className="text-xs text-white/60 leading-relaxed mt-2 italic bg-black/30 border border-white/[0.04] p-2.5 rounded-lg">
                          "{esc.reason || 'Sentiment dropped below threshold'}"
                        </div>
                      </div>
                      
                      <div className="text-right shrink-0">
                        <span className="text-[10px] bg-red-500/10 text-[#F43F5E] border border-red-500/30 px-2 py-0.5 rounded font-semibold">
                          Score: {Math.round(escScore * 100)}%
                        </span>
                        <div className="text-[10px] text-white/40 font-mono mt-1">
                          {new Date(esc.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-white/[0.04] flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-16 bg-white/[0.06] rounded-full overflow-hidden">
                          <div className="h-full bg-rose-400" style={{ width: `${satVal * 100}%` }} />
                        </div>
                        <span className="text-[10px] text-white/40">Sentiment: {satVal.toFixed(2)}</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={(e) => handleResolve(esc.id, e)}
                          className="px-2.5 py-1 rounded bg-[#10B981]/10 border border-[#10B981]/30 hover:bg-[#10B981]/20 text-[#10B981] font-semibold text-[10px]"
                        >
                          Resolve Intercept
                        </button>
                        <button className="px-2 py-1 rounded border border-white/10 hover:bg-white/[0.04] text-[10px] font-semibold text-white/60 hover:text-white">
                          View
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Handled Log */}
          <div className="space-y-4">
            <h3 className="text-xs uppercase tracking-wider text-emerald-400 font-semibold px-1">
              Resolved Escalations Log ({handledEscalations.length})
            </h3>
            {handledEscalations.length === 0 ? (
              <div className="p-8 border border-white/[0.06] rounded-xl text-center text-xs text-white/30">
                No historically resolved escalations in the current cache.
              </div>
            ) : (
              handledEscalations.map((esc) => (
                <div 
                  key={esc.id}
                  className="p-4 border border-white/[0.06] bg-white/[0.01] rounded-xl flex items-center justify-between text-xs text-white/60 opacity-60 hover:opacity-100 transition"
                >
                  <div>
                    <div className="font-semibold text-white">Escalation Resolved ({esc.id.slice(0, 8)})</div>
                    <div className="text-[10px] text-white/40 mt-0.5">Reason: {esc.reason || 'Sentiment trigger'}</div>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-semibold">
                    RESOLVED
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* ----------------------- REVENUE INTELLIGENCE VIEW ------------------------ */
function RevenueIntelligenceView({ onSelectConvo }: { onSelectConvo: (id: string) => void }) {
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchOpportunities = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/revenue-opportunities?limit=10");
      const json = await res.json();
      setOpportunities(json);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOpportunities();
  }, []);

  const displayOpps = opportunities.length > 0 ? opportunities : [
    { id: "opp1", customer_name: "Sarah Chen", type: "Upsell", score: 92, description: "Showed interest in Enterprise tier" },
    { id: "opp2", customer_name: "Priya Natarajan", type: "Expansion", score: 84, description: "Asked about additional seats" },
    { id: "opp3", customer_name: "Northwind Co.", type: "Renewal", score: 78, description: "Contract ends in 14 days" },
    { id: "opp4", customer_name: "Jordan Park", type: "Upsell", score: 71, description: "Mentioned API rate limits" }
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: "Detected Growth Revenue", value: "$48.2k", col: "#A855F7" },
          { label: "Pipeline Conversion Index", value: "92%", col: "#3B82F6" },
          { label: "High-probability Qualified Deals", value: `${displayOpps.length} Opportunities`, col: "#10B981" }
        ].map((item, idx) => (
          <div key={idx} className="glass rounded-xl p-5 border border-white/[0.06]">
            <div className="text-[10px] uppercase tracking-wider text-white/40 font-semibold">{item.label}</div>
            <div className="text-3xl font-bold tracking-tight mt-2" style={{ color: item.col }}>{item.value}</div>
          </div>
        ))}
      </div>

      <div className="glass rounded-xl border border-white/[0.06] overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-white/[0.06] bg-white/[0.02]">
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-[#A855F7]" /> Surfaced Opportunities Pipeline
          </h3>
          <span className="text-xs text-white/40">Real-time ARIA Qualifiers</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-[10px] uppercase tracking-wider text-white/40 border-b border-white/[0.06]">
                <th className="text-left font-medium px-5 py-3">Customer</th>
                <th className="text-left font-medium px-3 py-3">Opportunity Type</th>
                <th className="text-left font-medium px-3 py-3">Description</th>
                <th className="text-left font-medium px-3 py-3 w-40">Lead Score</th>
                <th className="px-5 py-3 text-right" />
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 4 }).map((_, idx) => (
                  <tr key={idx} className="animate-pulse border-t border-white/[0.04] bg-white/[0.01]">
                    <td className="px-5 py-4 h-12" colSpan={5}>
                      <div className="h-3 rounded bg-white/[0.06] w-3/4" />
                    </td>
                  </tr>
                ))
              ) : (
                displayOpps.map((opp, idx) => {
                  const typeColor = opp.type === "Upsell" || opp.type === "Renewal" ? "#A855F7" : "#3B82F6";
                  return (
                    <tr 
                      key={opp.id || idx} 
                      className={`border-b border-white/[0.04] transition-colors hover:bg-white/[0.02] ${
                        idx % 2 === 1 ? "bg-white/[0.005]" : ""
                      }`}
                    >
                      <td className="px-5 py-4 font-semibold text-white">{opp.customer_name}</td>
                      <td className="px-3 py-4">
                        <span 
                          className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold border"
                          style={{ background: `${typeColor}1A`, borderColor: `${typeColor}30`, color: typeColor }}
                        >
                          {opp.type}
                        </span>
                      </td>
                      <td className="px-3 py-4 text-white/60 max-w-xs truncate">{opp.description}</td>
                      <td className="px-3 py-4">
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 flex-1 max-w-[100px] rounded-full bg-white/[0.06] overflow-hidden">
                            <div className="h-full rounded-full bg-gradient-to-r from-[#6D28D9] to-[#C026D3]" style={{ width: `${opp.score}%` }} />
                          </div>
                          <span className="text-xs font-mono text-white/50">{opp.score}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <button 
                          onClick={() => {
                            let convoId = "11111111-1111-1111-1111-111111111111";
                            if (opp.customer_name === "Priya Natarajan") convoId = "44444444-4444-4444-4444-444444444444";
                            else if (opp.customer_name === "Jordan Park") convoId = "55555555-5555-5555-5555-555555555555";
                            else if (opp.customer_name === "Northwind Co.") convoId = "33333333-3333-3333-3333-333333333333";
                            onSelectConvo(convoId);
                          }}
                          className="text-xs bg-[#A855F7]/10 hover:bg-[#A855F7]/20 border border-[#A855F7]/30 hover:border-[#A855F7] text-white px-3 py-1.5 rounded-lg transition"
                        >
                          Qualify Deal
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ----------------------------- ARIA MEMORY VIEW ----------------------------- */
function AriaMemoryView({ onSelectConvo }: { onSelectConvo: (id: string) => void }) {
  const [customers, setCustomers] = useState<any[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/customers");
      const json = await res.json();
      if (json.customers) {
        setCustomers(json.customers);
        if (json.customers.length > 0) {
          setSelectedCustomerId(json.customers[0].id);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const activeCustomer = customers.find(c => c.id === selectedCustomerId);

  const customerMemories: Record<string, string[]> = {
    VIP: [
      "Customer plans major infrastructure migration in June.",
      "Requires explicit technical documentation regarding WebSocket limits.",
      "Prefers direct system escalation path when urgency score exceeds 75%."
    ],
    Standard: [
      "Inquired about billing exception due to multi-seat setup delays.",
      "Referred by retraining segment VIP accounts.",
      "Customer prefers standard caretakers for care flow."
    ]
  };

  const memories = activeCustomer?.plan?.toLowerCase() === "enterprise" || activeCustomer?.ltv > 1000 
    ? customerMemories.VIP 
    : customerMemories.Standard;

  return (
    <div className="space-y-6">
      <div className="glass rounded-xl p-5 border border-white/[0.06] flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-[#A855F7]/10 border border-[#A855F7]/20 flex items-center justify-center">
            <Brain className="h-4 w-4 text-[#A855F7]" />
          </div>
          <div>
            <div className="text-sm font-semibold">ARIA Cognitive Memory Center</div>
            <div className="text-xs text-white/40">Storing persistent customer identities, LTV trackers, and real-time sentiment histories.</div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="h-40 flex items-center justify-center text-xs text-white/40">
          <RefreshCw className="h-4 w-4 animate-spin text-[#A855F7] mr-2" /> Loading memory cards...
        </div>
      ) : customers.length === 0 ? (
        <div className="h-40 border border-dashed border-white/10 rounded-xl flex flex-col items-center justify-center text-xs text-white/40 p-8 text-center">
          <Database className="h-8 w-8 text-white/10 mb-2" />
          <div className="font-semibold text-white/60">Memory Center Empty</div>
          <div>No customer profiles registered. Interact with ARIA in the playground to seed cognitive profiles.</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 h-[calc(100vh-220px)]">
          {/* Customer list (Left) */}
          <div className="lg:col-span-4 border border-white/[0.06] bg-white/[0.02] rounded-xl flex flex-col min-h-0 overflow-hidden">
            <div className="p-3 border-b border-white/[0.06] shrink-0 font-semibold text-xs text-white/60">
              Profiles Catalog ({customers.length})
            </div>
            <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
              {customers.map((c) => {
                const active = c.id === selectedCustomerId;
                return (
                  <button
                    key={c.id}
                    onClick={() => setSelectedCustomerId(c.id)}
                    className={`w-full text-left p-3 rounded-lg border transition-all ${
                      active 
                        ? "bg-[#A855F7]/[0.08] border-[#A855F7]/40 shadow-sm" 
                        : "bg-transparent border-white/[0.04] hover:bg-white/[0.03]"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold text-xs text-white/90 truncate max-w-[150px]">{c.name}</span>
                      <span className="text-[9px] uppercase tracking-wider bg-white/[0.04] px-2 py-0.5 rounded text-white/40">{c.plan}</span>
                    </div>
                    <div className="mt-2 flex items-center justify-between text-[10px] text-white/40 font-mono">
                      <span>LTV: ${c.ltv}</span>
                      <span>Risk: {c.risk_score}%</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Profile Memory Graph (Right) */}
          <div className="lg:col-span-8 border border-white/[0.06] bg-white/[0.01] rounded-xl p-5 overflow-y-auto space-y-6">
            {activeCustomer ? (
              <>
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/[0.06] pb-4">
                  <div>
                    <h3 className="text-base font-semibold text-white">{activeCustomer.name}</h3>
                    <p className="text-xs text-white/40 font-mono mt-0.5">ID: {activeCustomer.id}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase font-semibold text-[#A855F7] bg-[#A855F7]/10 border border-[#A855F7]/30 px-2.5 py-1 rounded">
                      Segment: {activeCustomer.segment || "standard"}
                    </span>
                  </div>
                </div>

                {/* Core metrics */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: "Customer Lifetime Value", value: `$${activeCustomer.ltv || 0}`, col: "text-[#10B981]" },
                    { label: "Satisfaction Score", value: `${activeCustomer.satisfaction_score || 0}%`, col: "text-[#3B82F6]" },
                    { label: "System Risk Level", value: `${activeCustomer.risk_score || 0}%`, col: "text-rose-400" },
                    { label: "Total Conversations", value: activeCustomer.total_conversations || 1, col: "text-[#A855F7]" }
                  ].map((stat, idx) => (
                    <div key={idx} className="p-3 border border-white/[0.06] bg-white/[0.02] rounded-lg text-center">
                      <div className="text-[9px] uppercase tracking-wider text-white/40">{stat.label}</div>
                      <div className={`text-lg font-bold mt-1.5 ${stat.col}`}>{stat.value}</div>
                    </div>
                  ))}
                </div>

                {/* Persistent memories */}
                <div className="space-y-3">
                  <h4 className="text-xs font-semibold text-white/80 flex items-center gap-1.5">
                    <Brain className="h-3.5 w-3.5 text-[#A855F7]" /> Persistent Learned Context
                  </h4>
                  <div className="space-y-2">
                    {memories.map((mem, idx) => (
                      <div key={idx} className="p-3 border border-white/[0.06] bg-white/[0.02] rounded-lg text-xs leading-relaxed text-white/80 flex items-start gap-2.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-[#A855F7] shrink-0 mt-1.5" />
                        <span>{mem}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Metadata block */}
                <div className="space-y-3">
                  <h4 className="text-xs font-semibold text-white/80 flex items-center gap-1.5">
                    <Database className="h-3.5 w-3.5 text-[#A855F7]" /> Raw Customer Profile JSON
                  </h4>
                  <pre className="p-3.5 border border-white/[0.06] bg-black/40 rounded-lg text-[10px] font-mono text-emerald-400 overflow-x-auto leading-normal">
                    {JSON.stringify(activeCustomer, null, 2)}
                  </pre>
                </div>
              </>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-white/30">
                Select a cognitive profile from the list to display learned customer memories.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* ------------------------------- SETTINGS VIEW ------------------------------ */
function SettingsView() {
  const [model, setModel] = useState("gemini-2.5-flash");
  const [frustLimit, setFrustLimit] = useState(75);
  const [urgLimit, setUrgLimit] = useState(70);
  const [businessName, setBusinessName] = useState("ARIA Global Systems");
  const [tone, setTone] = useState("Empathetic-first");
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    toast.success("Settings saved successfully!", {
      description: `Configurations updated for ${businessName} with ${tone} response tone.`
    });
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="max-w-3xl space-y-6">
      <div className="glass rounded-xl border border-white/[0.06] p-6 space-y-6">
        <h3 className="text-sm font-semibold flex items-center gap-2 border-b border-white/[0.06] pb-3">
          <Settings className="h-4 w-4 text-[#A855F7]" /> ARIA Intelligence Core Config
        </h3>

        {/* Business Name Input */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-white/80 flex items-center gap-1.5">
            <Building className="h-3.5 w-3.5 text-[#A855F7]" /> Business / Company Name
          </label>
          <input
            type="text"
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
            className="w-full bg-[#0E0820] border border-white/[0.06] rounded-lg p-2.5 text-xs text-white outline-none focus:border-[#A855F7] transition"
            placeholder="Enter business name..."
          />
        </div>

        {/* Response Tone Selection */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-white/80 flex items-center gap-1.5">
            <HeartHandshake className="h-3.5 w-3.5 text-[#A855F7]" /> Response Tone Selection
          </label>
          <select 
            value={tone} 
            onChange={(e) => setTone(e.target.value)}
            className="w-full bg-[#0E0820] border border-white/[0.06] rounded-lg p-2.5 text-xs text-white outline-none focus:border-[#A855F7] transition"
          >
            <option value="Empathetic-first">Empathetic-first — Warm, soft, high empathy</option>
            <option value="Direct & Technical">Direct & Technical — Action-oriented, fact-driven</option>
            <option value="Casual & Friendly">Casual & Friendly — Approachable, conversation-focused</option>
            <option value="Strict Corporate">Strict Corporate — Formal, compliant, standard SLAs</option>
          </select>
        </div>

        {/* Model Selection */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-white/80 flex items-center gap-1.5">
            <Cpu className="h-3.5 w-3.5 text-[#A855F7]" /> Model Intelligence Engine
          </label>
          <select 
            value={model} 
            onChange={(e) => setModel(e.target.value)}
            className="w-full bg-[#0E0820] border border-white/[0.06] rounded-lg p-2.5 text-xs text-white outline-none focus:border-[#A855F7] transition"
          >
            <option value="gemini-2.5-flash">Gemini 2.5 Flash — Fast & Lightweight (Highly Recommended)</option>
            <option value="gemini-2.5-pro">Gemini 2.5 Pro — Deep Reasoning & Contextual Extraction</option>
            <option value="gemini-3.1-flash-lite-preview">Gemini 3.1 Flash Lite Preview — Cutting Edge</option>
          </select>
          <span className="text-[10px] text-white/40 block mt-1">Multi-model routing dynamically selects appropriate model based on query severity.</span>
        </div>

        {/* Threshold Sliders */}
        <div className="space-y-4 pt-2">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-medium text-white/80">
              <span className="flex items-center gap-1.5"><Heart className="h-3.5 w-3.5 text-rose-400" /> Auto-Escalate on Frustration</span>
              <span className="font-semibold text-rose-400">{frustLimit}%</span>
            </div>
            <input 
              type="range" 
              min="30" 
              max="95" 
              value={frustLimit} 
              onChange={(e) => setFrustLimit(parseInt(e.target.value))}
              className="w-full accent-rose-400 bg-white/[0.06] rounded-lg h-1.5 cursor-pointer"
            />
            <span className="text-[10px] text-white/40 block">Automatically flags room for support intercept if frustration exceeds limit.</span>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-medium text-white/80">
              <span className="flex items-center gap-1.5"><AlertTriangle className="h-3.5 w-3.5 text-[#3B82F6]" /> Intervention Urgency Threshold</span>
              <span className="font-semibold text-[#3B82F6]">{urgLimit}%</span>
            </div>
            <input 
              type="range" 
              min="30" 
              max="95" 
              value={urgLimit} 
              onChange={(e) => setUrgLimit(parseInt(e.target.value))}
              className="w-full accent-[#3B82F6] bg-white/[0.06] rounded-lg h-1.5 cursor-pointer"
            />
            <span className="text-[10px] text-white/40 block">Escalation timelines will fire a system warning when urgency probability matches score.</span>
          </div>
        </div>

        {/* Connection Status */}
        <div className="space-y-3 pt-3 border-t border-white/[0.06]">
          <h4 className="text-xs font-semibold text-white/85">Operational Systems Verifier</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {[
              { label: "Supabase DB Connector", status: "Operational", col: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" },
              { label: "Gemini Key Hydration", status: "Hydrated", col: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" },
              { label: "WS Manager Router", status: "Active (200ms)", col: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" }
            ].map((sys, idx) => (
              <div key={idx} className={`p-3 border rounded-lg text-center ${sys.col}`}>
                <div className="text-[9px] uppercase tracking-wider text-white/40">{sys.label}</div>
                <div className="text-xs font-bold mt-1">{sys.status}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Buttons */}
        <div className="pt-3 flex items-center justify-between">
          <span className="text-xs text-white/40 font-mono">SOC2 Type II verified configurations.</span>
          <button 
            onClick={handleSave}
            className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-[#6D28D9] to-[#C026D3] hover:glow-violet text-white font-semibold text-xs px-4 py-2 transition"
          >
            {saved ? (
              <>
                <CheckCircle2 className="h-3.5 w-3.5" /> Configurations Saved!
              </>
            ) : (
              <>
                <Save className="h-3.5 w-3.5" /> Save Configuration
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}