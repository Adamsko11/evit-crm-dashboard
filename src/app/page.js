'use client'

import { useState } from "react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import { TrendingUp, Users, Calendar, DollarSign, Target, ArrowUpRight, ArrowDownRight, Activity, Award, Clock } from "lucide-react"

const C = {
  primary: "#2563eb", secondary: "#7c3aed", success: "#10b981",
  warning: "#f59e0b", danger: "#ef4444", info: "#06b6d4",
  bg: "#0f172a", card: "#1e293b", border: "#334155",
  text: "#f1f5f9", muted: "#94a3b8",
}

const pipelineStages = [
  { name: "Contact in 3mo", count: 28, probability: 10, color: "#64748b" },
  { name: "Lead Consulting", count: 8, probability: 20, color: "#06b6d4" },
  { name: "Discovery Done", count: 15, probability: 40, color: "#2563eb" },
  { name: "Brainstorming", count: 7, probability: 60, color: "#7c3aed" },
  { name: "Post Proposal", count: 2, probability: 80, color: "#f59e0b" },
  { name: "Contract Sent", count: 1, probability: 90, color: "#10b981" },
]

const funnelData = [
  { name: "Total Leads (CRM)", value: 97, fill: "#334155" },
  { name: "Active Pipeline", value: 61, fill: "#2563eb" },
  { name: "Discovery+", value: 25, fill: "#7c3aed" },
  { name: "Brainstorming+", value: 10, fill: "#f59e0b" },
  { name: "Post Proposal+", value: 3, fill: "#10b981" },
  { name: "Won", value: 4, fill: "#22c55e" },
]

const monthlyTrends = [
  { month: "Jul '25", deals: 8, meetings: 0, won: 0 },
  { month: "Aug '25", deals: 14, meetings: 0, won: 0 },
  { month: "Sep '25", deals: 3, meetings: 0, won: 0 },
  { month: "Oct '25", deals: 12, meetings: 0, won: 3 },
  { month: "Nov '25", deals: 15, meetings: 0, won: 1 },
  { month: "Dec '25", deals: 5, meetings: 0, won: 0 },
  { month: "Jan '26", deals: 5, meetings: 0, won: 0 },
  { month: "Feb '26", deals: 1, meetings: 0, won: 0 },
  { month: "Mar '26", deals: 15, meetings: 37, won: 0 },
  { month: "Apr '26", deals: 6, meetings: 13, won: 0 },
]

const wonDeals = [
  { name: "Digiex", closedDate: "Oct 6, 2025", daysToClose: 36 },
  { name: "Vivasoft", closedDate: "Nov 4, 2025", daysToClose: 27 },
  { name: "Emesoft", closedDate: "Nov 10, 2025", daysToClose: 35 },
  { name: "Levinci (LAAS)", closedDate: "Dec 10, 2025", daysToClose: 65 },
]

const hotDeals = [
  { name: "SoftSora", stage: "Brainstorming", value: "$15,000", close: "Apr 30", prob: "60%", hot: true },
  { name: "WeAreFram", stage: "Contract Sent", value: "$11,900", close: "Jun 5", prob: "90%", hot: true },
  { name: "Golden Infotech", stage: "Discovery Done", value: "$2,500", close: "Jul 1", prob: "40%", hot: false },
  { name: "H One", stage: "Discovery Done", value: "$2,500", close: "Jun 8", prob: "40%", hot: false },
  { name: "Glinteco", stage: "Post Proposal", value: "\u2014", close: "Mar 31", prob: "80%", hot: true },
  { name: "MYS Consulting", stage: "Post Proposal", value: "\u2014", close: "Oct 31", prob: "80%", hot: false },
]

const recentMeetings = [
  { date: "Apr 4", title: "Website Design Review", duration: "28m", type: "internal" },
  { date: "Apr 3", title: "Viva Weekly Sync", duration: "40m", type: "internal" },
  { date: "Apr 2", title: "EVIT x Penta Solutions \u2014 Intro Call", duration: "60m", type: "prospect" },
  { date: "Apr 2", title: "Kolpolok \u2014 Intro Call (ASIF AMDAD)", duration: "30m", type: "prospect" },
  { date: "Apr 2", title: "SoftSora \u2014 Intro Call (Nilan)", duration: "11m", type: "prospect" },
  { date: "Apr 1", title: "Golden Infotech \u2014 Intro Call (Jawel)", duration: "34m", type: "prospect" },
  { date: "Apr 1", title: "Nusratech \u2014 Discovery Call", duration: "45m", type: "prospect" },
  { date: "Mar 31", title: "Ecomody \u2014 Follow-up", duration: "25m", type: "prospect" },
]

const lostData = [
  { name: "No Response", value: 14 },
  { name: "Timing/Budget", value: 8 },
  { name: "Went Competitor", value: 5 },
  { name: "Not a Fit", value: 5 },
]

const weightedDeals = [
  { name: "WeAreFram", stage: "Contract Sent", value: 11900, prob: 90 },
  { name: "SoftSora", stage: "Brainstorming", value: 15000, prob: 60 },
  { name: "Madison Tech", stage: "Lead Consulting", value: 3000, prob: 20 },
  { name: "PineSucceed", stage: "Contact in 3mo", value: 3000, prob: 10 },
  { name: "Golden Infotech", stage: "Discovery Done", value: 2500, prob: 40 },
  { name: "H One", stage: "Discovery Done", value: 2500, prob: 40 },
]

const CC = ["#2563eb", "#7c3aed", "#10b981", "#f59e0b", "#ef4444", "#06b6d4", "#ec4899", "#8b5cf6"]

function KPICard({ icon: Icon, label, value, sub, trend, up, color = C.primary }) {
  return (
    <div className="rounded-xl p-5" style={{ background: C.card, border: `1px solid ${C.border}` }}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider" style={{ color: C.muted }}>{label}</p>
          <p className="text-3xl font-bold mt-1" style={{ color: C.text }}>{value}</p>
          {sub && <p className="text-xs mt-1" style={{ color: C.muted }}>{sub}</p>}
        </div>
        <div className="rounded-lg p-2.5" style={{ background: `${color}20` }}><Icon size={22} style={{ color }} /></div>
      </div>
      {trend && (<div className="flex items-center gap-1 mt-3 text-xs font-medium" style={{ color: up ? C.success : C.danger }}>{up ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}{trend}</div>)}
    </div>
  )
}

function Tip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg p-3 shadow-xl" style={{ background: C.card, border: `1px solid ${C.border}` }}>
      <p className="text-xs font-medium mb-1" style={{ color: C.muted }}>{label}</p>
      {payload.map((p, i) => (<p key={i} className="text-sm font-semibold" style={{ color: p.color }}>{p.name}: {p.value}</p>))}
    </div>
  )
}

export default function Dashboard() {
  const [tab, setTab] = useState("overview")
  const winRate = ((4 / 36) * 100).toFixed(1)
  const tabs = [{ id: "overview", label: "Overview" }, { id: "pipeline", label: "Pipeline" }, { id: "meetings", label: "Meetings" }, { id: "conversions", label: "Conversions" }]

  return (
    <div className="min-h-screen p-4 md:p-6" style={{ background: C.bg }}>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white text-lg" style={{ background: "linear-gradient(135deg, #2563eb, #7c3aed)" }}>E</div>
          <div><h1 className="text-xl font-bold" style={{ color: C.text }}>EVIT Sales Dashboard</h1><p className="text-xs" style={{ color: C.muted }}>HubSpot + Fireflies + Lead Gen · Synced Apr 5, 2026</p></div>
        </div>
        <div className="flex items-center gap-2 mt-3 md:mt-0">
          <div className="rounded-lg px-3 py-1.5 text-xs font-medium" style={{ background: `${C.success}20`, color: C.success }}><span className="inline-block w-1.5 h-1.5 rounded-full mr-1.5" style={{ background: C.success }} />Live</div>
          <div className="rounded-lg px-3 py-1.5 text-xs" style={{ background: C.card, color: C.muted }}>90-Day Goal: $50K</div>
        </div>
      </div>

      <div className="flex gap-1 p-1 rounded-xl mb-6" style={{ background: C.card }}>
        {tabs.map(t => (<button key={t.id} onClick={() => setTab(t.id)} className="px-4 py-2 rounded-lg text-sm font-medium transition-all" style={{ background: tab === t.id ? C.primary : "transparent", color: tab === t.id ? "#fff" : C.muted }}>{t.label}</button>))}
      </div>

      {tab === "overview" && (<>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <KPICard icon={Users} label="Total Deals" value="97" sub="61 active · 4 won · 32 lost" color={C.primary} trend="+6 this month" up />
          <KPICard icon={Calendar} label="Meetings (Apr)" value="13" sub="5 prospect · 8 internal" color={C.secondary} trend="37 in March" up />
          <KPICard icon={DollarSign} label="Pipeline Value" value="$37.9K" sub="Weighted: $21K" color={C.success} trend="WeAreFram $11.9K at 90%" up />
          <KPICard icon={Target} label="Win Rate" value={`${winRate}%`} sub="Avg 41 days to close" color={C.warning} trend="4 closed won" up />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="rounded-xl p-5" style={{ background: C.card, border: `1px solid ${C.border}` }}>
            <h2 className="text-lg font-semibold mb-1" style={{ color: C.text }}>Pipeline by Stage</h2>
            <p className="text-xs mb-4" style={{ color: C.muted }}>61 active deals across 6 stages</p>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={pipelineStages} layout="vertical" margin={{ left: 10, right: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={C.border} horizontal={false} />
                <XAxis type="number" tick={{ fill: C.muted, fontSize: 11 }} axisLine={false} />
                <YAxis type="category" dataKey="name" tick={{ fill: C.muted, fontSize: 11 }} width={100} axisLine={false} />
                <Tooltip content={<Tip />} />
                <Bar dataKey="count" name="Deals" radius={[0, 6, 6, 0]}>{pipelineStages.map((e, i) => <Cell key={i} fill={e.color} />)}</Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="rounded-xl p-5" style={{ background: C.card, border: `1px solid ${C.border}` }}>
            <h2 className="text-lg font-semibold mb-1" style={{ color: C.text }}>Hot Deals</h2>
            <p className="text-xs mb-4" style={{ color: C.muted }}>Deals with value or high probability</p>
            <div className="space-y-1">
              {hotDeals.map((d, i) => {
                const sc = { "Discovery Done": "#2563eb", "Brainstorming": "#7c3aed", "Post Proposal": "#f59e0b", "Contract Sent": "#10b981" }
                return (<div key={i} className="flex items-center justify-between py-2.5 px-3 rounded-lg" style={{ background: d.hot ? `${C.primary}10` : "transparent" }}>
                  <div className="flex items-center gap-3"><div className="w-2 h-2 rounded-full" style={{ background: sc[d.stage] || C.muted }} /><div><p className="text-sm font-medium" style={{ color: C.text }}>{d.name}</p><p className="text-xs" style={{ color: C.muted }}>{d.stage} · Close: {d.close}</p></div></div>
                  <div className="text-right"><p className="text-sm font-semibold" style={{ color: C.text }}>{d.value}</p><p className="text-xs" style={{ color: C.muted }}>{d.prob}</p></div>
                </div>)
              })}
            </div>
          </div>
        </div>
        <div className="rounded-xl p-5 mb-6" style={{ background: C.card, border: `1px solid ${C.border}` }}>
          <h2 className="text-lg font-semibold mb-1" style={{ color: C.text }}>Monthly Trends</h2>
          <p className="text-xs mb-4" style={{ color: C.muted }}>Deals created, meetings held, and wins per month</p>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={monthlyTrends}><CartesianGrid strokeDasharray="3 3" stroke={C.border} vertical={false} /><XAxis dataKey="month" tick={{ fill: C.muted, fontSize: 11 }} axisLine={false} /><YAxis tick={{ fill: C.muted, fontSize: 11 }} axisLine={false} /><Tooltip content={<Tip />} /><Legend wrapperStyle={{ fontSize: 12, color: C.muted }} /><Bar dataKey="deals" name="Deals Created" fill={C.primary} radius={[4, 4, 0, 0]} /><Bar dataKey="meetings" name="Meetings" fill={C.secondary} radius={[4, 4, 0, 0]} /><Bar dataKey="won" name="Won" fill={C.success} radius={[4, 4, 0, 0]} /></BarChart>
          </ResponsiveContainer>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-xl p-5" style={{ background: C.card, border: `1px solid ${C.border}` }}>
            <h2 className="text-lg font-semibold mb-4" style={{ color: C.text }}>Won Deals</h2>
            <div className="space-y-3">{wonDeals.map((d, i) => (<div key={i} className="flex items-center justify-between py-2 px-3 rounded-lg" style={{ background: `${C.success}10` }}><div className="flex items-center gap-3"><Award size={16} style={{ color: C.success }} /><div><p className="text-sm font-medium" style={{ color: C.text }}>{d.name}</p><p className="text-xs" style={{ color: C.muted }}>Closed {d.closedDate}</p></div></div><div className="rounded-full px-2.5 py-0.5 text-xs font-medium" style={{ background: `${C.success}20`, color: C.success }}>{d.daysToClose}d</div></div>))}</div>
          </div>
          <div className="rounded-xl p-5" style={{ background: C.card, border: `1px solid ${C.border}` }}>
            <h2 className="text-lg font-semibold mb-4" style={{ color: C.text }}>Lost Deal Analysis</h2>
            <ResponsiveContainer width="100%" height={220}><PieChart><Pie data={lostData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} dataKey="value" paddingAngle={4} label={({ name, value }) => `${name} (${value})`}>{lostData.map((_, i) => <Cell key={i} fill={CC[i + 4]} />)}</Pie><Tooltip content={<Tip />} /></PieChart></ResponsiveContainer>
          </div>
        </div>
      </>)}

      {tab === "pipeline" && (<>
        <div className="rounded-xl p-5 mb-6" style={{ background: C.card, border: `1px solid ${C.border}` }}>
          <h2 className="text-lg font-semibold mb-4" style={{ color: C.text }}>Sales Funnel</h2>
          <div className="space-y-2">{funnelData.map((s, i) => { const w = Math.max((s.value / funnelData[0].value) * 100, 8); const r = i > 0 ? ((s.value / funnelData[i - 1].value) * 100).toFixed(0) : 100; return (<div key={i} className="flex items-center gap-3"><div className="w-32 text-right"><p className="text-xs font-medium" style={{ color: C.muted }}>{s.name}</p></div><div className="flex-1 h-10 rounded-lg overflow-hidden" style={{ background: `${C.border}50` }}><div className="h-full rounded-lg flex items-center justify-end pr-3" style={{ width: `${w}%`, background: s.fill }}><span className="text-xs font-bold text-white">{s.value}</span></div></div><div className="w-12 text-right"><p className="text-xs font-medium" style={{ color: i > 0 ? C.muted : C.success }}>{r}%</p></div></div>) })}</div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">{pipelineStages.map((s, i) => (<div key={i} className="rounded-xl p-4" style={{ background: C.card, border: `1px solid ${C.border}` }}><div className="flex items-center gap-2 mb-2"><div className="w-3 h-3 rounded-full" style={{ background: s.color }} /><p className="text-sm font-medium" style={{ color: C.text }}>{s.name}</p></div><p className="text-2xl font-bold" style={{ color: C.text }}>{s.count}</p><p className="text-xs mt-1" style={{ color: C.muted }}>Win prob: {s.probability}%</p><div className="w-full h-1.5 rounded-full mt-2" style={{ background: C.border }}><div className="h-full rounded-full" style={{ width: `${s.probability}%`, background: s.color }} /></div></div>))}</div>
        <div className="rounded-xl p-5" style={{ background: C.card, border: `1px solid ${C.border}` }}>
          <h2 className="text-lg font-semibold mb-4" style={{ color: C.text }}>Weighted Pipeline</h2>
          <table className="w-full text-sm"><thead><tr style={{ borderBottom: `1px solid ${C.border}` }}>{["Deal", "Stage", "Value", "Prob", "Weighted"].map(h => (<th key={h} className={`py-2 px-3 font-medium ${h === "Deal" || h === "Stage" ? "text-left" : "text-right"}`} style={{ color: C.muted }}>{h}</th>))}</tr></thead><tbody>{weightedDeals.map((d, i) => (<tr key={i} style={{ borderBottom: `1px solid ${C.border}` }}><td className="py-2.5 px-3 font-medium" style={{ color: C.text }}>{d.name}</td><td className="py-2.5 px-3" style={{ color: C.muted }}>{d.stage}</td><td className="py-2.5 px-3 text-right" style={{ color: C.text }}>${d.value.toLocaleString()}</td><td className="py-2.5 px-3 text-right" style={{ color: C.muted }}>{d.prob}%</td><td className="py-2.5 px-3 text-right font-semibold" style={{ color: C.success }}>${(d.value * d.prob / 100).toLocaleString()}</td></tr>))}<tr><td colSpan={4} className="py-2.5 px-3 text-right font-bold" style={{ color: C.text }}>Total</td><td className="py-2.5 px-3 text-right font-bold" style={{ color: C.success }}>$21,010</td></tr></tbody></table>
        </div>
      </>)}

      {tab === "meetings" && (<>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <KPICard icon={Calendar} label="Total (Mar+Apr)" value="50" sub="From Fireflies AI" color={C.secondary} />
          <KPICard icon={Users} label="Prospect Calls" value="~25" sub="Sales-related" color={C.success} />
          <KPICard icon={Clock} label="Avg Duration" value="~35m" sub="Per meeting" color={C.info} />
          <KPICard icon={Activity} label="April Pace" value="13" sub="3.25/day avg" color={C.warning} trend="On track for 30+" up />
        </div>
        <div className="rounded-xl p-5" style={{ background: C.card, border: `1px solid ${C.border}` }}>
          <h2 className="text-lg font-semibold mb-4" style={{ color: C.text }}>Recent Meetings</h2>
          <div className="space-y-1">{recentMeetings.map((m, i) => (<div key={i} className="flex items-center justify-between py-2 px-3 rounded-lg" style={{ background: m.type === "prospect" ? `${C.success}08` : "transparent" }}><div className="flex items-center gap-3"><div className="rounded-full px-2 py-0.5 text-xs font-medium" style={{ background: m.type === "prospect" ? `${C.success}20` : `${C.muted}20`, color: m.type === "prospect" ? C.success : C.muted }}>{m.type === "prospect" ? "Sales" : "Team"}</div><p className="text-sm" style={{ color: C.text }}>{m.title}</p></div><div className="flex items-center gap-3"><p className="text-xs" style={{ color: C.muted }}>{m.duration}</p><p className="text-xs font-medium" style={{ color: C.muted }}>{m.date}</p></div></div>))}</div>
        </div>
      </>)}

      {tab === "conversions" && (<>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <KPICard icon={TrendingUp} label="Lead \u2192 Active" value="62.9%" sub="61 of 97" color={C.primary} />
          <KPICard icon={TrendingUp} label="Active \u2192 Discovery+" value="41.0%" sub="25 of 61" color={C.secondary} />
          <KPICard icon={TrendingUp} label="Discovery \u2192 Won" value="16.0%" sub="4 of 25" color={C.success} />
          <KPICard icon={Target} label="Overall Win" value={`${winRate}%`} sub="4 of 36 closed" color={C.warning} />
        </div>
        <div className="rounded-xl p-5 mb-6" style={{ background: C.card, border: `1px solid ${C.border}` }}>
          <h2 className="text-lg font-semibold mb-4" style={{ color: C.text }}>Stage-to-Stage Conversion</h2>
          <div className="space-y-4">{[{ from: "Total Leads", to: "Active Pipeline", a: 97, b: 61 }, { from: "Active Pipeline", to: "Discovery Done", a: 61, b: 25 }, { from: "Discovery+", to: "Brainstorming+", a: 25, b: 10 }, { from: "Brainstorming+", to: "Post Proposal+", a: 10, b: 3 }, { from: "Post Proposal+", to: "Won", a: 3, b: 4 }].map((s, i) => { const r = ((s.b / s.a) * 100).toFixed(0); return (<div key={i}><div className="flex justify-between text-xs mb-1"><span style={{ color: C.muted }}>{s.from} ({s.a}) \u2192 {s.to} ({s.b})</span><span className="font-semibold" style={{ color: Number(r) > 30 ? C.success : C.warning }}>{r}%</span></div><div className="w-full h-3 rounded-full" style={{ background: C.border }}><div className="h-full rounded-full" style={{ width: `${Math.min(Number(r), 100)}%`, background: `linear-gradient(90deg, ${C.primary}, ${Number(r) > 30 ? C.success : C.warning})` }} /></div></div>) })}</div>
        </div>
        <div className="rounded-xl p-5" style={{ background: C.card, border: `1px solid ${C.border}` }}>
          <h2 className="text-lg font-semibold mb-4" style={{ color: C.text }}>Key Insights</h2>
          <div className="space-y-3">{[{ e: "\ud83d\udfe2", t: "Strong lead generation \u2014 97 deals since July 2025, 15 in March alone" }, { e: "\ud83d\udfe1", t: "Bottleneck: Discovery \u2192 Brainstorming at 40%. Review scheduling or session quality." }, { e: "\ud83d\udfe2", t: "WeAreFram at Contract Sent ($11.9K, 90%) \u2014 closest to closing" }, { e: "\ud83d\udfe1", t: "SoftSora ($15K, 60%) \u2014 largest deal, needs to move to proposal" }, { e: "\ud83d\udd34", t: "28 deals parked in 'Contact in 3 months' \u2014 need re-engagement or cleanup" }, { e: "\ud83d\udfe2", t: "Average 41-day close time \u2014 healthy for B2B consulting" }, { e: "\ud83d\udfe1", t: "Most deals missing $ values in HubSpot \u2014 fix for better forecasting" }].map((x, i) => (<div key={i} className="flex items-start gap-3 py-2 px-3 rounded-lg" style={{ background: `${C.bg}80` }}><span className="text-base mt-0.5">{x.e}</span><p className="text-sm" style={{ color: C.text }}>{x.t}</p></div>))}</div>
        </div>
      </>)}

      <div className="mt-6 pt-4 text-center text-xs" style={{ borderTop: `1px solid ${C.border}`, color: C.muted }}>EVIT Organization · Sales Dashboard v1.0 · Data: HubSpot + Fireflies + Lead Gen · Weekly sync via Cowork</div>
    </div>
  )
}
