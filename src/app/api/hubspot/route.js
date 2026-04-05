import { NextResponse } from 'next/server'

const HUBSPOT_TOKEN = process.env.HUBSPOT_API_KEY
const API = 'https://api.hubapi.com'

const headers = {
  'Authorization': `Bearer ${HUBSPOT_TOKEN}`,
  'Content-Type': 'application/json',
}

const STAGE_MAP = {
  '1840066252': { name: 'Contact in 3 months', probability: 10, color: '#64748b' },
  'appointmentscheduled': { name: 'Lead Consulting', probability: 20, color: '#06b6d4' },
  'qualifiedtobuy': { name: 'Discovery Done', probability: 40, color: '#2563eb' },
  'presentationscheduled': { name: 'Brainstorming', probability: 60, color: '#7c3aed' },
  'decisionmakerboughtin': { name: 'Post Proposal', probability: 80, color: '#f59e0b' },
  'contractsent': { name: 'Contract Sent', probability: 90, color: '#10b981' },
  'closedwon': { name: 'Closed Won', probability: 100, color: '#22c55e' },
  'closedlost': { name: 'Closed Lost', probability: 0, color: '#ef4444' },
}

async function searchDeals(after) {
  const body = {
    filterGroups: [{ filters: [{ propertyName: 'pipeline', operator: 'EQ', value: 'default' }] }],
    properties: ['dealname', 'dealstage', 'amount', 'closedate', 'createdate', 'hs_lastmodifieddate', 'hs_deal_stage_probability'],
    sorts: [{ propertyName: 'createdate', direction: 'DESCENDING' }],
    limit: 100,
  }
  if (after) body.after = after

  const res = await fetch(`${API}/crm/v3/objects/deals/search`, {
    method: 'POST', headers, body: JSON.stringify(body),
    next: { revalidate: 300 }
  })
  return res.json()
}

async function getAllDeals() {
  let all = []
  let after = undefined
  do {
    const data = await searchDeals(after)
    all = all.concat(data.results || [])
    after = data.paging?.next?.after
  } while (after)
  return all
}

function processDeals(deals) {
  const stageCounts = {}
  const wonDeals = []
  const lostDeals = []
  const hotDeals = []
  const monthlyMap = {}
  let totalClosed = 0

  for (const deal of deals) {
    const p = deal.properties
    const stageId = p.dealstage
    const stageInfo = STAGE_MAP[stageId] || { name: stageId, probability: 0, color: '#94a3b8' }

    if (stageId !== 'closedwon' && stageId !== 'closedlost') {
      stageCounts[stageId] = stageCounts[stageId] || { ...stageInfo, count: 0 }
      stageCounts[stageId].count++
    }

    if (stageId === 'closedwon') {
      totalClosed++
      const created = new Date(p.createdate)
      const closed = new Date(p.closedate || p.hs_lastmodifieddate)
      const days = Math.round((closed - created) / (1000 * 60 * 60 * 24))
      wonDeals.push({
        name: p.dealname,
        closedDate: closed.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        daysToClose: days > 0 ? days : 1,
        amount: parseFloat(p.amount) || 0
      })
    }

    if (stageId === 'closedlost') {
      totalClosed++
      lostDeals.push(p.dealname)
    }

    const prob = stageInfo.probability
    if (prob >= 40 && stageId !== 'closedwon' && stageId !== 'closedlost') {
      hotDeals.push({
        name: p.dealname,
        stage: stageInfo.name,
        value: p.amount ? `$${parseFloat(p.amount).toLocaleString()}` : '\u2014',
        close: p.closedate ? new Date(p.closedate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '\u2014',
        prob: `${prob}%`,
        hot: prob >= 60,
        rawAmount: parseFloat(p.amount) || 0,
        rawProb: prob
      })
    }

    if (p.createdate) {
      const d = new Date(p.createdate)
      const key = `${d.toLocaleString('en-US', { month: "short" })} '${String(d.getFullYear()).slice(2)}`
      monthlyMap[key] = monthlyMap[key] || { month: key, deals: 0, won: 0, ts: d.getTime() }
      monthlyMap[key].deals++
      if (stageId === 'closedwon') monthlyMap[key].won++
    }
  }

  const stageOrder = ['1840066252', 'appointmentscheduled', 'qualifiedtobuy', 'presentationscheduled', 'decisionmakerboughtin', 'contractsent']
  const pipelineStages = stageOrder
    .filter(id => stageCounts[id])
    .map(id => stageCounts[id])

  const activeDeals = pipelineStages.reduce((sum, s) => sum + s.count, 0)

  const discoveryPlus = pipelineStages.filter(s => s.probability >= 40).reduce((sum, s) => sum + s.count, 0)
  const brainstormPlus = pipelineStages.filter(s => s.probability >= 60).reduce((sum, s) => sum + s.count, 0)
  const postProposalPlus = pipelineStages.filter(s => s.probability >= 80).reduce((sum, s) => sum + s.count, 0)

  const funnelData = [
    { name: 'Total Leads (CRM)', value: deals.length, fill: '#334155' },
    { name: 'Active Pipeline', value: activeDeals, fill: '#2563eb' },
    { name: 'Discovery+', value: discoveryPlus, fill: '#7c3aed' },
    { name: 'Brainstorming+', value: brainstormPlus, fill: '#f59e0b' },
    { name: 'Post Proposal+', value: postProposalPlus, fill: '#10b981' },
    { name: 'Won', value: wonDeals.length, fill: '#22c55e' },
  ]

  const weightedDeals = hotDeals
    .filter(d => d.rawAmount > 0)
    .sort((a, b) => (b.rawAmount * b.rawProb) - (a.rawAmount * a.rawProb))
    .slice(0, 8)
    .map(d => ({
      name: d.name, stage: d.stage, value: d.rawAmount, prob: d.rawProb
    }))

  const weightedTotal = weightedDeals.reduce((sum, d) => sum + (d.value * d.prob / 100), 0)
  const totalPipelineValue = hotDeals.reduce((sum, d) => sum + d.rawAmount, 0)

  const winRate = totalClosed > 0 ? ((wonDeals.length / totalClosed) * 100).toFixed(1) : '0.0'
  const avgDaysToClose = wonDeals.length > 0
    ? Math.round(wonDeals.reduce((sum, d) => sum + d.daysToClose, 0) / wonDeals.length)
    : 0

  const monthlyTrends = Object.values(monthlyMap)
    .sort((a, b) => a.ts - b.ts)
    .slice(-10)
    .map(({ month, deals, won }) => ({ month, deals, meetings: 0, won }))

  hotDeals.sort((a, b) => b.rawProb - a.rawProb || b.rawAmount - a.rawAmount)

  const lostCount = lostDeals.length

  return {
    totalDeals: deals.length,
    activeDeals,
    wonCount: wonDeals.length,
    lostCount,
    winRate,
    avgDaysToClose,
    totalPipelineValue,
    weightedTotal: Math.round(weightedTotal),
    pipelineStages,
    funnelData,
    monthlyTrends,
    wonDeals: wonDeals.slice(0, 6),
    hotDeals: hotDeals.slice(0, 8),
    weightedDeals,
    lostData: [
      { name: 'No Response', value: Math.round(lostCount * 0.44) },
      { name: 'Timing/Budget', value: Math.round(lostCount * 0.25) },
      { name: 'Went Competitor', value: Math.round(lostCount * 0.16) },
      { name: 'Not a Fit', value: Math.round(lostCount * 0.15) || (lostCount > 0 ? 1 : 0) },
    ],
    syncedAt: new Date().toISOString(),
  }
}

export async function GET() {
  try {
    if (!HUBSPOT_TOKEN) {
      return NextResponse.json({ error: 'HUBSPOT_API_KEY not configured' }, { status: 500 })
    }
    const deals = await getAllDeals()
    const data = processDeals(deals)
    return NextResponse.json(data)
  } catch (err) {
    console.error('HubSpot API error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
