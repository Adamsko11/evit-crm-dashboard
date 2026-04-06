'use client'

import { useState, useEffect } from "react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import { TrendingUp, Users, Calendar, DollarSign, Target, ArrowUpRight, ArrowDownRight, Activity, Award, Clock, Loader2, Linkedin, Send, MessageSquare, UserCheck, Globe, ExternalLink } from "lucide-react"
import { AreaChart, Area, LineChart, Line } from "recharts"

const C = {
  primary: "#2563eb", secondary: "#7c3aed", success: "#10b981",
  warning: "#f59e0b", danger: "#ef4444", info: "#06b6d4",
  bg: "#0f172a", card: "#1e293b", border: "#334155",
  text: "#f1f5f9", muted: "#94a3b8",
}

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
  const [data, setData] = useState(null)
  const [linkedinData, setLinkedinData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [dateRange, setDateRange] = useState({ start: "", end: "" })

  useEffect(() => {
    Promise.all([
      fetch('/api/hubspot').then(r => r.json()),
      fetch('/api/linkedin').then(r => r.json()).catch(() => null)
    ]).then(([hs, li]) => {
      if (hs.error) throw new Error(hs.error)
      setData(hs)
      setLinkedinData(li)
      setLoading(false)
    }).catch(e => { setError(e.message); setLoading(false) })
  }, [])

  const tabs = [{ id: "overview", label: "Overview" }, { id: "pipeline", label: "Pipeline" }, { id: "linkedin", label: "LinkedIn" }, { id: "meetings", label: "Meetings" }, { id: "conversions", label: "Conversions" }]
  const li = linkedinData

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: C.bg }}>
        <div className="text-center">
          <Loader2 size={40} className="animate-spin mx-auto mb-4" style={{ color: C.primary }} />
          <p className="text-lg font-medium" style={{ color: C.text }}>Loading live data from HubSpot...</p>
          <p className="text-sm mt-1" style={{ color: C.muted }}>Fetching deals, pipeline, and metrics</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: C.bg }}>
        <div className="text-center rounded-xl p-8" style={{ background: C.card, border: `1px solid ${C.border}` }}>
          <p className="text-lg font-medium mb-2" style={{ color: C.danger }}>Connection Error</p>
          <p className="text-sm" style={{ color: C.muted }}>{error}</p>
          <button onClick={() => window.location.reload()} className="mt-4 px-4 py-2 rounded-lg text-sm font-medium" style={{ background: C.primary, color: '#fff' }}>Retry</button>
        </div>
      </div>
    )
  }

  const { totalDeals, activeDeals, wonCount, lostCount, winRate, avgDaysToClose, totalPipelineValue, weightedTotal, pipelineStages, funnelData, monthlyTrends, wonDeals, hotDeals, weightedDeals, lostData, syncedAt } = data

  const syncDate = new Date(syncedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  const syncTime = new Date(syncedAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })

  // LinkedIn date filtering
  const filterLinkedinData = (data, startDate, endDate) => {
    if (!data || (!startDate && !endDate)) return data

    const filtered = { ...data }
    const start = startDate ? new Date(startDate) : null
    const end = endDate ? new Date(endDate) : null

    // Filter monthly growth
    if (filtered.monthlyGrowth) {
      filtered.monthlyGrowth = filtered.monthlyGrowth.filter(item => {
        const itemDate = new Date(item.month + "-01")
        if (start && itemDate < start) return false
        if (end && itemDate > end) return false
        return true
      })
    }

    // Filter weekly growth
    if (filtered.weeklyGrowth) {
      filtered.weeklyGrowth = filtered.weeklyGrowth.filter(item => {
        const itemDate = new Date(item.week)
        if (start && itemDate < start) return false
        if (end && itemDate > end) return false
        return true
      })
    }

    // Filter messaging activity
    if (filtered.messageMonthly) {
      filtered.messageMonthly = filtered.messageMonthly.filter(item => {
        const itemDate = new Date(item.month + "-01")
        if (start && itemDate < start) return false
        if (end && itemDate > end) return false
        return true
      })
    }

    // Filter outreach weekly
    if (filtered.outreachWeekly) {
      filtered.outreachWeekly = filtered.outreachWeekly.filter(item => {
        const itemDate = new Date(item.week)
        if (start && itemDate < start) return false
        if (end && itemDate > end) return false
        return true
      })
    }

    return filtered
  }

  const filteredLi = filterLinkedinData(li, dateRange.start, dateRange.end)

  const discoveryPlus = funnelData.find(f => f.name === 'Discovery+')?.value || 0
  const brainstormPlus = funnelData.find(f => f.name === 'Brainstorming+')?.value || 0
  const postProposalPlus = funnelData.find(f => f.name === 'Post Proposal+')?.value || 0
  const totalClosed = wonCount + lostCount

  const conversionSteps = [
    { from: "Total Leads", to: "Active Pipeline", a: totalDeals, b: activeDeals },
    { from: "Active Pipeline", to: "Discovery+", a: activeDeals, b: discoveryPlus },
    { from: "Discovery+", to: "Brainstorming+", a: discoveryPlus, b: brainstormPlus },
    { from: "Brainstorming+", to: "Post Proposal+", a: brainstormPlus, b: postProposalPlus },
    { from: "Post Proposal+", to: "Won", a: postProposalPlus, b: wonCount },
  ]

  return (
    <div className="min-h-screen p-4 md:p-6" style={{ background: C.bg }}>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white text-lg" style={{ background: "linear-gradient(135deg, #2563eb, #7c3aed)" }}>E</div>
          <div><h1 className="text-xl font-bold" style={{ color: C.text }}>EVIT Sales Dashboard</h1><p className="text-xs" style={{ color: C.muted }}>Live from HubSpot &middot; {syncDate} {syncTime}</p></div>
        </div>
        <div className="flex items-center gap-2 mt-3 md:mt-0">
          <div className="rounded-lg px-3 py-1.5 text-xs font-medium" style={{ background: `${C.success}20`, color: C.success }}><span className="inline-block w-1.5 h-1.5 rounded-full mr-1.5" style={{ background: C.success }} />Live</div>
          <div className="rounded-lg px-3 py-1.5 text-xs" style={{ background: C.card, color: C.muted }}>90-Day Goal: $50K</div>
          <button onClick={() => window.location.reload()} className="rounded-lg px-3 py-1.5 text-xs font-medium" style={{ background: C.card, color: C.muted, border: `1px solid ${C.border}` }}>Refresh</button>
        </div>
      </div>

      <div className="flex gap-1 p-1 rounded-xl mb-6" style={{ background: C.card }}>
        {tabs.map(t => (<button key={t.id} onClick={() => setTab(t.id)} className="px-4 py-2 rounded-lg text-sm font-medium transition-all" style={{ background: tab === t.id ? C.primary : "transparent", color: tab === t.id ? "#fff" : C.muted }}>{t.label}</button>))}
      </div>

      {tab === "overview" && (<>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <KPICard icon={Users} label="Total Deals" value={totalDeals} sub={`${activeDeals} active \u00b7 ${wonCount} won \u00b7 ${lostCount} lost`} color={C.primary} />
          <KPICard icon={DollarSign} label="Pipeline Value" value={`$${(totalPipelineValue / 1000).toFixed(1)}K`} sub={`Weighted: $${(weightedTotal / 1000).toFixed(1)}K`} color={C.success} />
          <KPICard icon={Target} label="Win Rate" value={`${winRate}%`} sub={`Avg ${avgDaysToClose} days to close`} color={C.warning} trend={`${wonCount} closed won`} up />
          <KPICard icon={Activity} label="Active Pipeline" value={activeDeals} sub={`${pipelineStages.length} stages`} color={C.secondary} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="rounded-xl p-5" style={{ background: C.card, border: `1px solid ${C.border}` }}>
            <h2 className="text-lg font-semibold mb-1" style={{ color: C.text }}>Pipeline by Stage</h2>
            <p className="text-xs mb-4" style={{ color: C.muted }}>{activeDeals} active deals across {pipelineStages.length} stages</p>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={pipelineStages} layout="vertical" margin={{ left: 10, right: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={C.border} horizontal={false} />
                <XAxis type="number" tick={{ fill: C.muted, fontSize: 11 }} axisLine={false} />
                <YAxis type="category" dataKey="name" tick={{ fill: C.muted, fontSize: 11 }} width={120} axisLine={false} />
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
                  <div className="flex items-center gap-3"><div className="w-2 h-2 rounded-full" style={{ background: sc[d.stage] || C.muted }} /><div><p className="text-sm font-medium" style={{ color: C.text }}>{d.name}</p><p className="text-xs" style={{ color: C.muted }}>{d.stage} &middot; Close: {d.close}</p></div></div>
                  <div className="text-right"><p className="text-sm font-semibold" style={{ color: C.text }}>{d.value}</p><p className="text-xs" style={{ color: C.muted }}>{d.prob}</p></div>
                </div>)
              })}
              {hotDeals.length === 0 && <p className="text-sm py-4 text-center" style={{ color: C.muted }}>No hot deals in pipeline</p>}
            </div>
          </div>
        </div>
        <div className="rounded-xl p-5 mb-6" style={{ background: C.card, border: `1px solid ${C.border}` }}>
          <h2 className="text-lg font-semibold mb-1" style={{ color: C.text }}>Monthly Trends</h2>
          <p className="text-xs mb-4" style={{ color: C.muted }}>Deals created and wins per month</p>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={monthlyTrends}><CartesianGrid strokeDasharray="3 3" stroke={C.border} vertical={false} /><XAxis dataKey="month" tick={{ fill: C.muted, fontSize: 11 }} axisLine={false} /><YAxis tick={{ fill: C.muted, fontSize: 11 }} axisLine={false} /><Tooltip content={<Tip />} /><Legend wrapperStyle={{ fontSize: 12, color: C.muted }} /><Bar dataKey="deals" name="Deals Created" fill={C.primary} radius={[4, 4, 0, 0]} /><Bar dataKey="won" name="Won" fill={C.success} radius={[4, 4, 0, 0]} /></BarChart>
          </ResponsiveContainer>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-xl p-5" style={{ background: C.card, border: `1px solid ${C.border}` }}>
            <h2 className="text-lg font-semibold mb-4" style={{ color: C.text }}>Won Deals</h2>
            <div className="space-y-3">{wonDeals.map((d, i) => (<div key={i} className="flex items-center justify-between py-2 px-3 rounded-lg" style={{ background: `${C.success}10` }}><div className="flex items-center gap-3"><Award size={16} style={{ color: C.success }} /><div><p className="text-sm font-medium" style={{ color: C.text }}>{d.name}</p><p className="text-xs" style={{ color: C.muted }}>Closed {d.closedDate}</p></div></div><div className="rounded-full px-2.5 py-0.5 text-xs font-medium" style={{ background: `${C.success}20`, color: C.success }}>{d.daysToClose}d</div></div>))}</div>
            {wonDeals.length === 0 && <p className="text-sm py-4 text-center" style={{ color: C.muted }}>No won deals yet</p>}
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
          <div className="space-y-2">{funnelData.map((s, i) => { const w = Math.max((s.value / (funnelData[0]?.value || 1)) * 100, 8); const r = i > 0 ? ((s.value / (funnelData[i - 1]?.value || 1)) * 100).toFixed(0) : 100; return (<div key={i} className="flex items-center gap-3"><div className="w-32 text-right"><p className="text-xs font-medium" style={{ color: C.muted }}>{s.name}</p></div><div className="flex-1 h-10 rounded-lg overflow-hidden" style={{ background: `${C.border}50` }}><div className="h-full rounded-lg flex items-center justify-end pr-3" style={{ width: `${w}%`, background: s.fill }}><span className="text-xs font-bold text-white">{s.value}</span></div></div><div className="w-12 text-right"><p className="text-xs font-medium" style={{ color: i > 0 ? C.muted : C.success }}>{r}%</p></div></div>) })}</div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">{pipelineStages.map((s, i) => (<div key={i} className="rounded-xl p-4" style={{ background: C.card, border: `1px solid ${C.border}` }}><div className="flex items-center gap-2 mb-2"><div className="w-3 h-3 rounded-full" style={{ background: s.color }} /><p className="text-sm font-medium" style={{ color: C.text }}>{s.name}</p></div><p className="text-2xl font-bold" style={{ color: C.text }}>{s.count}</p><p className="text-xs mt-1" style={{ color: C.muted }}>Win prob: {s.probability}%</p><div className="w-full h-1.5 rounded-full mt-2" style={{ background: C.border }}><div className="h-full rounded-full" style={{ width: `${s.probability}%`, background: s.color }} /></div></div>))}</div>
        {weightedDeals.length > 0 && (
        <div className="rounded-xl p-5" style={{ background: C.card, border: `1px solid ${C.border}` }}>
          <h2 className="text-lg font-semibold mb-4" style={{ color: C.text }}>Weighted Pipeline</h2>
          <table className="w-full text-sm"><thead><tr style={{ borderBottom: `1px solid ${C.border}` }}>{["Deal", "Stage", "Value", "Prob", "Weighted"].map(h => (<th key={h} className={`py-2 px-3 font-medium ${h === "Deal" || h === "Stage" ? "text-left" : "text-right"}`} style={{ color: C.muted }}>{h}</th>))}</tr></thead><tbody>{weightedDeals.map((d, i) => (<tr key={i} style={{ borderBottom: `1px solid ${C.border}` }}><td className="py-2.5 px-3 font-medium" style={{ color: C.text }}>{d.name}</td><td className="py-2.5 px-3" style={{ color: C.muted }}>{d.stage}</td><td className="py-2.5 px-3 text-right" style={{ color: C.text }}>${d.value.toLocaleString()}</td><td className="py-2.5 px-3 text-right" style={{ color: C.muted }}>{d.prob}%</td><td className="py-2.5 px-3 text-right font-semibold" style={{ color: C.success }}>${(d.value * d.prob / 100).toLocaleString()}</td></tr>))}<tr><td colSpan={4} className="py-2.5 px-3 text-right font-bold" style={{ color: C.text }}>Total</td><td className="py-2.5 px-3 text-right font-bold" style={{ color: C.success }}>${weightedTotal.toLocaleString()}</td></tr></tbody></table>
        </div>
        )}
      </>)}

      {tab === "linkedin" && li && (<>
        <div className="rounded-xl p-4 mb-6" style={{ background: C.card, border: `1px solid ${C.border}` }}>
          <div className="flex flex-col md:flex-row items-start md:items-end gap-4">
            <div className="flex-1">
              <label style={{ color: C.muted }} className="text-xs font-medium uppercase tracking-wider block mb-2">Filter by Date Range</label>
              <div className="flex gap-2">
                <input type="date" value={dateRange.start} onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })} className="flex-1 px-3 py-2 rounded-lg text-sm" style={{ background: C.bg, border: `1px solid ${C.border}`, color: C.text }} placeholder="Start date" />
                <input type="date" value={dateRange.end} onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })} className="flex-1 px-3 py-2 rounded-lg text-sm" style={{ background: C.bg, border: `1px solid ${C.border}`, color: C.text }} placeholder="End date" />
              </div>
            </div>
            {(dateRange.start || dateRange.end) && <button onClick={() => setDateRange({ start: "", end: "" })} className="px-3 py-2 rounded-lg text-xs font-medium" style={{ background: `${C.danger}20`, color: C.danger, border: `1px solid ${C.danger}40` }}>Clear</button>}
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <KPICard icon={Users} label="Total Network" value={li.totalConnections?.toLocaleString()} sub={`+${li.newLast7Days} this week · +${li.newLast30Days} this month`} color={C.primary} trend={`${li.newLast30Days} new in 30d`} up />
          <KPICard icon={Target} label="ICP Matches" value={li.icpMatchCount?.toLocaleString()} sub={`${li.icpMatchRate}% of network`} color={C.success} trend="IT/Tech + Decision Maker" up />
          <KPICard icon={Send} label="Invites Sent" value={li.totalInvitationsSent?.toLocaleString()} sub={`${li.acceptanceRate30d}% acceptance (30d)`} color={C.warning} trend={`${li.totalInvitationsReceived} received`} up />
          <KPICard icon={MessageSquare} label="Messages" value={li.totalMessages?.toLocaleString()} sub={`${li.messagesSent?.toLocaleString()} sent · ${li.uniqueConversations?.toLocaleString()} conversations`} color={C.secondary} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="rounded-xl p-5" style={{ background: C.card, border: `1px solid ${C.border}` }}>
            <h2 className="text-lg font-semibold mb-1" style={{ color: C.text }}>Network Growth</h2>
            <p className="text-xs mb-4" style={{ color: C.muted }}>New connections per month {dateRange.start || dateRange.end ? `(${dateRange.start || "Start"} to ${dateRange.end || "End"})` : ""}</p>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={filteredLi.monthlyGrowth}>
                <CartesianGrid strokeDasharray="3 3" stroke={C.border} vertical={false} />
                <XAxis dataKey="month" tick={{ fill: C.muted, fontSize: 11 }} axisLine={false} />
                <YAxis tick={{ fill: C.muted, fontSize: 11 }} axisLine={false} />
                <Tooltip content={<Tip />} />
                <Bar dataKey="connections" name="New Connections" fill={C.primary} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="rounded-xl p-5" style={{ background: C.card, border: `1px solid ${C.border}` }}>
            <h2 className="text-lg font-semibold mb-1" style={{ color: C.text }}>Outreach Activity</h2>
            <p className="text-xs mb-4" style={{ color: C.muted }}>Weekly invitation requests sent vs received</p>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={filteredLi.outreachWeekly}>
                <CartesianGrid strokeDasharray="3 3" stroke={C.border} vertical={false} />
                <XAxis dataKey="week" tick={{ fill: C.muted, fontSize: 10 }} axisLine={false} />
                <YAxis tick={{ fill: C.muted, fontSize: 11 }} axisLine={false} />
                <Tooltip content={<Tip />} />
                <Legend wrapperStyle={{ fontSize: 12, color: C.muted }} />
                <Bar dataKey="sent" name="Sent" fill={C.warning} radius={[4, 4, 0, 0]} />
                <Bar dataKey="received" name="Received" fill={C.info} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="rounded-xl p-5" style={{ background: C.card, border: `1px solid ${C.border}` }}>
            <h2 className="text-lg font-semibold mb-1" style={{ color: C.text }}>Decision Maker Seniority</h2>
            <p className="text-xs mb-4" style={{ color: C.muted }}>{li.decisionMakers?.toLocaleString()} decision makers ({li.decisionMakerRate}% of network)</p>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={li.seniorityBreakdown} layout="vertical" margin={{ left: 10, right: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={C.border} horizontal={false} />
                <XAxis type="number" tick={{ fill: C.muted, fontSize: 11 }} axisLine={false} />
                <YAxis type="category" dataKey="name" tick={{ fill: C.muted, fontSize: 11 }} width={80} axisLine={false} />
                <Tooltip content={<Tip />} />
                <Bar dataKey="value" name="Connections" radius={[0, 6, 6, 0]}>
                  {li.seniorityBreakdown?.map((_, i) => <Cell key={i} fill={CC[i % CC.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="rounded-xl p-5" style={{ background: C.card, border: `1px solid ${C.border}` }}>
            <h2 className="text-lg font-semibold mb-1" style={{ color: C.text }}>Messaging Activity</h2>
            <p className="text-xs mb-4" style={{ color: C.muted }}>Messages sent vs received per month</p>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={filteredLi.messageMonthly}>
                <CartesianGrid strokeDasharray="3 3" stroke={C.border} vertical={false} />
                <XAxis dataKey="month" tick={{ fill: C.muted, fontSize: 11 }} axisLine={false} />
                <YAxis tick={{ fill: C.muted, fontSize: 11 }} axisLine={false} />
                <Tooltip content={<Tip />} />
                <Legend wrapperStyle={{ fontSize: 12, color: C.muted }} />
                <Bar dataKey="sent" name="Sent" fill={C.primary} radius={[4, 4, 0, 0]} />
                <Bar dataKey="received" name="Received" fill={C.secondary} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="rounded-xl p-5" style={{ background: C.card, border: `1px solid ${C.border}` }}>
            <h2 className="text-lg font-semibold mb-1" style={{ color: C.text }}>Top Companies in Network</h2>
            <p className="text-xs mb-4" style={{ color: C.muted }}>Companies with most connections (excl. freelance/self-employed)</p>
            <div className="space-y-1.5">
              {li.topCompanies?.slice(0, 12).map((c, i) => (
                <div key={i} className="flex items-center justify-between py-1.5 px-3 rounded-lg" style={{ background: i < 3 ? `${C.primary}10` : 'transparent' }}>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono w-5 text-right" style={{ color: C.muted }}>{i + 1}</span>
                    <span className="text-sm" style={{ color: C.text }}>{c.name}</span>
                  </div>
                  <span className="text-sm font-semibold" style={{ color: C.primary }}>{c.value}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-xl p-5" style={{ background: C.card, border: `1px solid ${C.border}` }}>
            <h2 className="text-lg font-semibold mb-1" style={{ color: C.text }}>Recent ICP Matches</h2>
            <p className="text-xs mb-4" style={{ color: C.muted }}>IT/Tech decision makers connected in last 30 days</p>
            <div className="space-y-1">
              {li.recentICPMatches?.map((m, i) => (
                <a key={i} href={m.url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between py-2 px-3 rounded-lg hover:opacity-80 transition-opacity" style={{ background: `${C.success}08` }}>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="text-sm font-medium truncate" style={{ color: C.text }}>{m.name}</p>
                      <ExternalLink size={10} style={{ color: C.muted, flexShrink: 0 }} />
                    </div>
                    <p className="text-xs truncate" style={{ color: C.muted }}>{m.position} @ {m.company}</p>
                  </div>
                  <span className="text-xs ml-2 flex-shrink-0" style={{ color: C.muted }}>{m.connected}</span>
                </a>
              ))}
              {(!li.recentICPMatches || li.recentICPMatches.length === 0) && <p className="text-sm py-4 text-center" style={{ color: C.muted }}>No recent ICP matches</p>}
            </div>
          </div>
        </div>

        <div className="rounded-xl p-5" style={{ background: C.card, border: `1px solid ${C.border}` }}>
          <h2 className="text-lg font-semibold mb-1" style={{ color: C.text }}>Weekly Connection Growth</h2>
          <p className="text-xs mb-4" style={{ color: C.muted }}>Last 10 weeks trend {dateRange.start || dateRange.end ? `(${dateRange.start || "Start"} to ${dateRange.end || "End"})` : ""}</p>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={filteredLi.weeklyGrowth}>
              <CartesianGrid strokeDasharray="3 3" stroke={C.border} vertical={false} />
              <XAxis dataKey="week" tick={{ fill: C.muted, fontSize: 10 }} axisLine={false} />
              <YAxis tick={{ fill: C.muted, fontSize: 11 }} axisLine={false} />
              <Tooltip content={<Tip />} />
              <Area type="monotone" dataKey="connections" name="Connections" stroke={C.primary} fill={`${C.primary}30`} strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-4 rounded-lg px-4 py-3 text-xs" style={{ background: `${C.info}10`, color: C.muted }}>
          <Linkedin size={14} className="inline mr-1.5" style={{ color: C.info }} />
          LinkedIn data last updated: {li.updatedAt} · Upload a new LinkedIn export to refresh
        </div>
      </>)}

      {tab === "linkedin" && !li && (
        <div className="rounded-xl p-8 text-center" style={{ background: C.card, border: `1px solid ${C.border}` }}>
          <Linkedin size={40} className="mx-auto mb-4" style={{ color: C.muted }} />
          <h2 className="text-lg font-semibold mb-2" style={{ color: C.text }}>LinkedIn Data</h2>
          <p className="text-sm" style={{ color: C.muted }}>No LinkedIn data loaded. Upload a LinkedIn data export to see analytics.</p>
        </div>
      )}

      {tab === "meetings" && (<>
        <div className="rounded-xl p-8 text-center" style={{ background: C.card, border: `1px solid ${C.border}` }}>
          <Calendar size={40} className="mx-auto mb-4" style={{ color: C.muted }} />
          <h2 className="text-lg font-semibold mb-2" style={{ color: C.text }}>Meeting Data</h2>
          <p className="text-sm" style={{ color: C.muted }}>Meeting data syncs from Fireflies to HubSpot automatically.</p>
          <p className="text-sm mt-1" style={{ color: C.muted }}>Use the Cowork plugin <code style={{ color: C.primary }}>/sync-crm</code> command for detailed meeting analytics.</p>
        </div>
      </>)}

      {tab === "conversions" && (<>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <KPICard icon={TrendingUp} label="Lead \u2192 Active" value={activeDeals > 0 ? `${((activeDeals / totalDeals) * 100).toFixed(1)}%` : '0%'} sub={`${activeDeals} of ${totalDeals}`} color={C.primary} />
          <KPICard icon={TrendingUp} label="Active \u2192 Discovery+" value={discoveryPlus > 0 ? `${((discoveryPlus / activeDeals) * 100).toFixed(1)}%` : '0%'} sub={`${discoveryPlus} of ${activeDeals}`} color={C.secondary} />
          <KPICard icon={TrendingUp} label="Discovery \u2192 Won" value={wonCount > 0 && discoveryPlus > 0 ? `${((wonCount / discoveryPlus) * 100).toFixed(1)}%` : '0%'} sub={`${wonCount} of ${discoveryPlus}`} color={C.success} />
          <KPICard icon={Target} label="Overall Win" value={`${winRate}%`} sub={`${wonCount} of ${totalClosed} closed`} color={C.warning} />
        </div>
        <div className="rounded-xl p-5 mb-6" style={{ background: C.card, border: `1px solid ${C.border}` }}>
          <h2 className="text-lg font-semibold mb-4" style={{ color: C.text }}>Stage-to-Stage Conversion</h2>
          <div className="space-y-4">{conversionSteps.map((s, i) => { const r = s.a > 0 ? ((s.b / s.a) * 100).toFixed(0) : 0; return (<div key={i}><div className="flex justify-between text-xs mb-1"><span style={{ color: C.muted }}>{s.from} ({s.a}) \u2192 {s.to} ({s.b})</span><span className="font-semibold" style={{ color: Number(r) > 30 ? C.success : C.warning }}>{r}%</span></div><div className="w-full h-3 rounded-full" style={{ background: C.border }}><div className="h-full rounded-full" style={{ width: `${Math.min(Number(r), 100)}%`, background: `linear-gradient(90deg, ${C.primary}, ${Number(r) > 30 ? C.success : C.warning})` }} /></div></div>) })}</div>
        </div>
      </>)}

      <div className="mt-6 pt-4 text-center text-xs" style={{ borderTop: `1px solid ${C.border}`, color: C.muted }}>EVIT Organization &middot; Sales Dashboard v3.0 &middot; Live from HubSpot + LinkedIn &middot; Auto-refreshes on load</div>
    </div>
  )
}
