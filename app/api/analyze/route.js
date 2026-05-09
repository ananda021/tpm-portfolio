export async function POST(req) {
  const body = await req.json()
  const { mode, jiraData, programName, name, status, milestones, blockers, ctx } = body

  let prompt

  if (mode === 'jira') {
    prompt = `You are a senior Technical Program Manager advisor. Below is a Jira CSV export for a program. Analyze it and produce a structured assessment.

Program name: ${programName || 'Unnamed Program'}

Jira export data:
${jiraData}

Instructions:
- Identify milestones from tasks/stories with due dates
- Identify blockers from tickets with status "Blocked", "Impediment", or critical priority with no progress
- Assess overall program status based on the data
- Count distinct blockers

When assessing risk_level, use this rubric:
- High: Multiple unresolved blockers with no clear owner, or critical milestones missed, or timeline already blown
- Medium: One or two blockers with owners identified, or a milestone at risk but recoverable
- Low: Minor blockers, all key milestones on track or complete, clear path to go-live
Do not flag "Not Started" on a future milestone as a risk if prior milestones are complete and on schedule.`

  } else {
    prompt = `You are a senior Technical Program Manager advisor. Analyze the following program status data and produce a structured assessment.

Program: ${name || 'Unnamed Program'}
Overall status: ${status}

Milestones:
${milestones || 'None provided'}

Blockers / Risks:
${blockers || 'None provided'}

Additional context:
${ctx || 'None provided'}

When assessing risk_level, use this rubric:
- High: Multiple unresolved blockers with no clear owner, or critical milestones missed, or timeline already blown
- Medium: One or two blockers with owners identified, or a milestone at risk but recoverable
- Low: Minor blockers, all key milestones on track or complete, clear path to go-live
Do not flag "Not Started" on a future milestone as a risk if prior milestones are complete and on schedule.`
  }

  prompt += `

Respond ONLY with a valid JSON object. No preamble, no markdown fences. Start with { and end with }. Use exactly these keys:
{
  "risk_level": "High" or "Medium" or "Low",
  "overall_status": "On Track" or "At Risk" or "Off Track",
  "milestone_count": integer count of milestones identified,
  "blocker_count": integer count of distinct blockers identified,
  "executive_summary": "Maximum 3 sentences, under 60 words total. Plain English a VP would read in 10 seconds. Specific and direct. End with a sentence introducing the blockers like 'Three issues require immediate attention:'",
  "blocker_bullets": ["exactly 3 most critical blockers, concise, one line each"],
  "recommended_actions": ["exactly 3 most critical actions only, prioritized by impact"],
  "leadership_ask": "One clear specific ask or decision needed from leadership.",
  "milestones": [{"name": "milestone name", "due_date": "date", "status": "status", "assignee": "name"}]
}`

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
max_tokens: 2000,
      messages: [{ role: 'user', content: prompt }]
    })
  })

  const data = await res.json()
  const raw = (data.content || []).map(b => b.text || '').join('')
  console.log('Raw API response:', JSON.stringify(data).substring(0, 500))
  const jsonMatch = raw.match(/\{[\s\S]*\}/)

  if (!jsonMatch) {
  return Response.json({ error: 'No JSON found. Raw response: ' + raw.substring(0, 300) }, { status: 500 })
}

try {
  const parsed = JSON.parse(jsonMatch[0])
  return Response.json(parsed)
} catch (e) {
  return Response.json({ error: 'JSON parse failed: ' + e.message + ' Raw: ' + raw.substring(0, 200) }, { status: 500 })
}
}