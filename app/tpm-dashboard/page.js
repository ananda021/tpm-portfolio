'use client'
import { useState, useRef } from 'react'
import Papa from 'papaparse'

export default function Dashboard() {
  const [mode, setMode] = useState('manual')
  const [name, setName] = useState('')
  const [status, setStatus] = useState('On Track')
  const [milestones, setMilestones] = useState('')
  const [blockers, setBlockers] = useState('')
  const [ctx, setCtx] = useState('')
  const [programName, setProgramName] = useState('')
  const [jiraData, setJiraData] = useState('')
  const [fileName, setFileName] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const fileRef = useRef()

  function handleFile(e) {
  const file = e.target.files[0]
  if (!file) return
  setFileName(file.name)
  const reader = new FileReader()
  reader.onload = (ev) => {
    const parsed = Papa.parse(ev.target.result, { header: true, skipEmptyLines: true })
    const usefulColumns = ['Summary', 'Issue Type', 'Status', 'Priority', 'Assignee', 'Due Date', 'Labels', 'Description', 'Sprint', 'Epic Name']
    const trimmed = parsed.data.map(row => {
      const filtered = {}
      usefulColumns.forEach(col => {
        if (row[col]) filtered[col] = row[col]
      })
      return filtered
    })
    const condensed = JSON.stringify(trimmed, null, 0)
    setJiraData(condensed)
  }
  reader.readAsText(file)
}

  async function analyze() {
    if (mode === 'manual' && !milestones && !blockers) {
      setError('Please fill in at least milestones or blockers.')
      return
    }
    if (mode === 'jira' && !jiraData) {
      setError('Please upload a Jira CSV file.')
      return
    }
    setError('')
    setLoading(true)
    setResult(null)

    const payload = mode === 'jira'
      ? { mode: 'jira', jiraData, programName }
      : { mode: 'manual', name, status, milestones, blockers, ctx }

    const res = await fetch('/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })

    const data = await res.json()
    if (data.error) {
      setError(data.error)
    } else {
      setResult(data)
    }
    setLoading(false)
  }

  function downloadPDF() {
    const { jsPDF } = window.jspdf
    const doc = new jsPDF()
    const margin = 20
    let y = 20

    const addText = (text, size, color, bold) => {
      doc.setFontSize(size)
      doc.setTextColor(...color)
      doc.setFont('helvetica', bold ? 'bold' : 'normal')
      const lines = doc.splitTextToSize(text, 170)
      lines.forEach(line => {
        if (y > 270) { doc.addPage(); y = 20 }
        doc.text(line, margin, y)
        y += size * 0.5
      })
      y += 4
    }

    const addDivider = () => {
      doc.setDrawColor(220, 220, 220)
      doc.line(margin, y, 190, y)
      y += 8
    }

    const title = mode === 'jira' ? (programName || 'Program Health Report') : (name || 'Program Health Report')
    addText(title, 18, [17, 17, 17], true)
    addText(`Status: ${result.overall_status}  |  Risk: ${result.risk_level}`, 11, [120, 120, 120], false)
    y += 4
    addDivider()

    addText('LEADERSHIP ASK', 9, [150, 150, 150], true)
    addText(result.leadership_ask, 12, [12, 68, 124], false)
    y += 4
    addDivider()

    addText('EXECUTIVE SUMMARY', 9, [150, 150, 150], true)
    addText(result.executive_summary, 12, [50, 50, 50], false)
    if (result.blocker_bullets && result.blocker_bullets.length) {
      y += 2
      result.blocker_bullets.forEach(b => {
        addText(`• ${b}`, 11, [163, 45, 45], false)
      })
    }
    y += 4
    addDivider()

    addText('RECOMMENDED ACTIONS', 9, [150, 150, 150], true)
    result.recommended_actions.forEach((a, i) => {
      addText(`${i + 1}. ${a}`, 11, [50, 50, 50], false)
    })
    y += 4
    addDivider()

    if (result.milestones && result.milestones.length) {
      addText('MILESTONE TRACKER', 9, [150, 150, 150], true)
      result.milestones.forEach(m => {
        addText(`${m.name}  |  ${m.due_date || ''}  |  ${m.status || ''}  |  ${m.assignee || ''}`, 11, [50, 50, 50], false)
      })
    }

    doc.save(`${title}-report.pdf`)
  }

  const riskColor = { High: '#A32D2D', Medium: '#854F0B', Low: '#3B6D11' }
  const riskBg = { High: '#FCEBEB', Medium: '#FAEEDA', Low: '#EAF3DE' }
  const statusColor = (s) => s === 'On Track' ? '#3B6D11' : s === 'At Risk' ? '#854F0B' : '#A32D2D'

  const pillStyle = (s) => {
    if (s?.toLowerCase().includes('done') || s?.toLowerCase().includes('complete')) return { background: '#EAF3DE', color: '#27500A' }
    if (s?.toLowerCase().includes('progress')) return { background: '#FAEEDA', color: '#633806' }
    if (s?.toLowerCase().includes('block')) return { background: '#FCEBEB', color: '#791F1F' }
    return { background: '#F1EFE8', color: '#444441' }
  }

  return (
    <main style={{ maxWidth: '1100px', margin: '0 auto', padding: '48px 24px', fontFamily: 'system-ui, sans-serif' }}>
      <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js" />
      <a href="/" style={{ fontSize: '13px', color: '#999', textDecoration: 'none', display: 'block', marginBottom: '32px' }}>← Back to portfolio</a>

      <h1 style={{ fontSize: '24px', fontWeight: '600', margin: '0 0 6px' }}>Program health dashboard</h1>
      <p style={{ fontSize: '14px', color: '#666', margin: '0 0 24px' }}>Get an AI-generated risk narrative and recommended actions.</p>

      {/* TABS */}
      <div style={{ display: 'flex', gap: '0', marginBottom: '24px', borderBottom: '1px solid #e5e5e5' }}>
        {['manual', 'jira'].map(m => (
          <button key={m} onClick={() => { setMode(m); setResult(null); setError('') }}
            style={{ padding: '10px 20px', border: 'none', background: 'transparent', fontSize: '14px', fontWeight: mode === m ? '600' : '400', color: mode === m ? '#111' : '#999', borderBottom: mode === m ? '2px solid #111' : '2px solid transparent', cursor: 'pointer', marginBottom: '-1px' }}>
            {m === 'manual' ? 'Manual entry' : 'Jira CSV upload'}
          </button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: result ? '1fr 1fr' : '1fr', gap: '40px', alignItems: 'start' }}>

        {/* FORM */}
        <div>
          {mode === 'manual' ? (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                <div>
                  <label style={label}>Program name</label>
                  <input style={input} value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Data Platform Migration Q3" />
                </div>
                <div>
                  <label style={label}>Overall status</label>
                  <select style={input} value={status} onChange={e => setStatus(e.target.value)}>
                    <option>On Track</option>
                    <option>At Risk</option>
                    <option>Off Track</option>
                    <option>On Hold</option>
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={label}>Milestones (milestone | due date | status)</label>
                <textarea style={{ ...input, height: '120px', resize: 'vertical' }} value={milestones} onChange={e => setMilestones(e.target.value)}
                  placeholder={"Data model finalized | Jun 15 | Complete\nETL pipelines built | Jul 1 | In Progress\nUAT sign-off | Jul 20 | Not Started"} />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={label}>Blockers / risks</label>
                <textarea style={{ ...input, height: '100px', resize: 'vertical' }} value={blockers} onChange={e => setBlockers(e.target.value)}
                  placeholder={"Vendor API docs incomplete — waiting since May 10\n2 engineers pulled to P0 — capacity down 40%"} />
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={label}>Key decisions needed or exec context</label>
                <textarea style={{ ...input, height: '80px', resize: 'vertical' }} value={ctx} onChange={e => setCtx(e.target.value)}
                  placeholder="Need VP approval on revised timeline by EOW." />
              </div>
            </>
          ) : (
            <>
              <div style={{ marginBottom: '16px' }}>
                <label style={label}>Program name</label>
                <input style={input} value={programName} onChange={e => setProgramName(e.target.value)} placeholder="e.g. Data Platform Migration Q3" />
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={label}>Upload Jira CSV export</label>
                <div onClick={() => fileRef.current.click()}
                  style={{ border: '1px dashed #ccc', borderRadius: '8px', padding: '32px', textAlign: 'center', cursor: 'pointer', background: '#fafafa' }}>
                  <div style={{ fontSize: '24px', marginBottom: '8px' }}>📎</div>
                  <div style={{ fontSize: '14px', color: '#666', marginBottom: '4px' }}>
                    {fileName || 'Click to upload your Jira CSV export'}
                  </div>
                  <div style={{ fontSize: '12px', color: '#999' }}>Exports from Jira Cloud and Jira Server supported</div>
                  <input ref={fileRef} type="file" accept=".csv" onChange={handleFile} style={{ display: 'none' }} />
                </div>
                {fileName && (
                  <div style={{ marginTop: '8px', fontSize: '13px', color: '#3B6D11' }}>
                    ✓ {fileName} loaded
                  </div>
                )}
              </div>

              <div style={{ background: '#f9f9f9', borderRadius: '8px', padding: '14px 16px', marginBottom: '24px' }}>
                <div style={{ fontSize: '12px', fontWeight: '500', color: '#999', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>How to export from Jira</div>
                <ol style={{ margin: '0', paddingLeft: '18px', fontSize: '13px', color: '#555', lineHeight: '1.8' }}>
  <li>Click the <strong>search bar</strong> at the top of Jira</li>
  <li>Select <strong>View all work items</strong> to open the issue navigator</li>
  <li>Apply filters to select the issues you want</li>
  <li>Click the <strong>three dots</strong> (More Options) on the right</li>
  <li>Choose <strong>Export to CSV</strong> → All fields</li>
</ol>
              </div>
            </>
          )}

          <button onClick={analyze} disabled={loading} style={{ padding: '10px 24px', borderRadius: '8px', border: '1px solid #ddd', background: 'transparent', fontSize: '14px', fontWeight: '500', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.6 : 1 }}>
            {loading ? 'Analyzing...' : 'Analyze with AI ↗'}
          </button>

          {error && <p style={{ color: '#A32D2D', fontSize: '13px', marginTop: '12px' }}>{error}</p>}
        </div>

        {/* RESULTS */}
        {result && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', marginBottom: '12px' }}>
              {[
                { label: 'Status', value: result.overall_status, color: statusColor(result.overall_status) },
                { label: 'Milestones', value: result.milestone_count },
                { label: 'Blockers', value: result.blocker_count, color: result.blocker_count > 2 ? '#A32D2D' : result.blocker_count > 0 ? '#854F0B' : '#3B6D11' },
                { label: 'Risk level', value: result.risk_level, color: riskColor[result.risk_level] },
              ].map(m => (
                <div key={m.label} style={{ background: '#f9f9f9', borderRadius: '8px', padding: '12px 14px' }}>
                  <div style={{ fontSize: '11px', color: '#999', marginBottom: '4px' }}>{m.label}</div>
                  <div style={{ fontSize: '18px', fontWeight: '600', color: m.color || '#111' }}>{m.value}</div>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
              <button onClick={downloadPDF} style={{ fontSize: '13px', padding: '6px 14px', borderRadius: '8px', border: '1px solid #ddd', background: 'transparent', cursor: 'pointer', color: '#333' }}>
                Download PDF ↓
              </button>
            </div>

            <div style={{ ...card, borderLeft: '3px solid #185FA5', background: '#f0f6fd' }}>
              <div style={cardLabel}>Leadership ask</div>
              <div style={{ fontSize: '14px', color: '#0C447C', lineHeight: '1.7', fontWeight: '500' }}>
                {result.leadership_ask}
              </div>
            </div>

            <div style={card}>
              <div style={cardLabel}>Executive summary</div>
              <p style={{ fontSize: '14px', lineHeight: '1.7', color: '#333', margin: '0 0 12px' }}>{result.executive_summary}</p>
              {result.blocker_bullets && result.blocker_bullets.length > 0 && (
                <ul style={{ margin: '0', paddingLeft: '18px' }}>
                  {result.blocker_bullets.map((b, i) => (
                    <li key={i} style={{ fontSize: '14px', color: '#A32D2D', lineHeight: '1.7', marginBottom: '4px' }}>{b}</li>
                  ))}
                </ul>
              )}
            </div>

            <div style={card}>
              <div style={cardLabel}>Recommended actions</div>
              {result.recommended_actions.map((a, i) => (
                <div key={i} style={{ display: 'flex', gap: '10px', marginBottom: '10px', fontSize: '14px', color: '#333', lineHeight: '1.6' }}>
                  <span style={{ fontSize: '12px', color: '#999', minWidth: '18px', paddingTop: '2px' }}>{i + 1}.</span>
                  <span>{a}</span>
                </div>
              ))}
            </div>

            {result.milestones && result.milestones.length > 0 && (
              <div style={card}>
                <div style={cardLabel}>Milestone tracker</div>
                {result.milestones.map((m, i, arr) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: i < arr.length - 1 ? '1px solid #f0f0f0' : 'none' }}>
                    <div>
                      <div style={{ fontSize: '13px', color: '#333' }}>{m.name}</div>
                      {m.assignee && <div style={{ fontSize: '11px', color: '#999', marginTop: '2px' }}>{m.assignee}</div>}
                    </div>
                    <span style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <span style={{ fontSize: '12px', color: '#999' }}>{m.due_date}</span>
                      <span style={{ fontSize: '11px', fontWeight: '500', padding: '2px 8px', borderRadius: '6px', ...pillStyle(m.status) }}>{m.status}</span>
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  )
}

const label = { display: 'block', fontSize: '13px', color: '#666', marginBottom: '6px' }
const input = { width: '100%', boxSizing: 'border-box', border: '1px solid #e5e5e5', borderRadius: '8px', padding: '10px 12px', fontSize: '14px', fontFamily: 'system-ui, sans-serif', background: '#fff', color: '#111' }
const card = { background: '#fff', border: '1px solid #f0f0f0', borderRadius: '12px', padding: '20px', marginBottom: '16px' }
const cardLabel = { fontSize: '12px', fontWeight: '500', color: '#999', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '10px' }