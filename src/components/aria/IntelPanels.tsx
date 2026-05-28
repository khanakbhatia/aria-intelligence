import { Brain, TrendingUp, AlertTriangle, Heart } from "lucide-react";

export function EmotionPanel({ frustration = 18, satisfaction = 82, urgency = 24, loyalty = 9 }: { frustration?: number; satisfaction?: number; urgency?: number; loyalty?: number }) {
  const rows: [string, number, string][] = [
    ["Frustration", frustration, "#FB7185"],
    ["Satisfaction", satisfaction, "#10B981"],
    ["Urgency", urgency, "#F59E0B"],
    ["Loyalty risk", loyalty, "#A855F7"],
  ];
  return (
    <Panel title="Emotion Engine" icon={Heart} accent="#FB7185">
      <div className="space-y-2">
        {rows.map(([k, v, c]) => (
          <div key={k} className="flex items-center gap-3 text-[11px]">
            <span className="w-24 text-white/50">{k}</span>
            <div className="h-1 flex-1 overflow-hidden rounded-full bg-white/[0.06]">
              <div className="h-full rounded-full" style={{ width: `${v}%`, background: c, boxShadow: `0 0 12px -2px ${c}`, transition: "width 600ms cubic-bezier(0.4, 0, 0.2, 1)" }} />
            </div>
            <span className="w-8 text-right tabular-nums text-white/70">{v}%</span>
          </div>
        ))}
      </div>
    </Panel>
  );
}

export function RevenuePanel({ upsell = 71, value = "$4.2k", lead = 86 }: { upsell?: number; value?: string; lead?: number }) {
  return (
    <Panel title="Revenue Intelligence" icon={TrendingUp} accent="#3B82F6">
      <div className="grid grid-cols-3 gap-2 text-center">
        <Stat label="Upsell" value={`${upsell}%`} color="#3B82F6" />
        <Stat label="LTV" value={value} color="#10B981" />
        <Stat label="Lead score" value={`${lead}`} color="#A855F7" />
      </div>
    </Panel>
  );
}

export function EscalationPanel({ probability = 12, severity = "Low" }: { probability?: number; severity?: string }) {
  return (
    <Panel title="Escalation Engine" icon={AlertTriangle} accent="#A855F7">
      <div className="flex items-center justify-between text-[11px]">
        <div>
          <div className="text-white/50">Probability</div>
          <div className="mt-0.5 text-lg font-semibold tabular-nums" style={{ color: probability > 50 ? "#FB7185" : "#A855F7" }}>{probability}%</div>
        </div>
        <div className="text-right">
          <div className="text-white/50">Severity</div>
          <div className="mt-0.5 rounded-full bg-white/[0.06] px-2 py-0.5 text-xs font-medium" style={{ color: severity === "High" ? "#FB7185" : "#10B981" }}>{severity}</div>
        </div>
      </div>
      <div className="mt-3 rounded-md border border-white/[0.05] bg-white/[0.02] p-2 text-[10px] text-white/60">
        {probability > 50 ? "Suggest: bring in senior specialist with full transcript." : "Auto-resolution path is stable."}
      </div>
    </Panel>
  );
}

export function DecisionPanel({ steps }: { steps: string[] }) {
  return (
    <Panel title="AI Decision Engine" icon={Brain} accent="#A855F7">
      <ol className="space-y-1.5 text-[11px] text-white/70">
        {steps.map((s, i) => (
          <li key={i} className="flex gap-2">
            <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#A855F7]/15 text-[9px] font-semibold text-[#A855F7]">{i + 1}</span>
            <span>{s}</span>
          </li>
        ))}
      </ol>
    </Panel>
  );
}

function Panel({ title, icon: Icon, accent, children }: { title: string; icon: React.ComponentType<{ className?: string }>; accent: string; children: React.ReactNode }) {
  return (
    <div className="glass-violet rounded-xl p-3.5">
      <div className="mb-2.5 flex items-center gap-2">
        <div className="flex h-6 w-6 items-center justify-center rounded-md" style={{ background: `${accent}22`, color: accent }}>
          <Icon className="h-3 w-3" />
        </div>
        <span className="text-[11px] font-semibold uppercase tracking-wider text-white/70">{title}</span>
      </div>
      {children}
    </div>
  );
}

function Stat({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="rounded-md border border-white/[0.05] bg-white/[0.02] py-1.5">
      <div className="text-[9px] uppercase tracking-wider text-white/40">{label}</div>
      <div className="mt-0.5 text-sm font-semibold tabular-nums" style={{ color }}>{value}</div>
    </div>
  );
}