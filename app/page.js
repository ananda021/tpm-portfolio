export default function Home() {
  return (
    <main style={{ maxWidth: '720px', margin: '0 auto', padding: '60px 24px', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ marginBottom: '48px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: '600', margin: '0 0 8px' }}>Aditi Nanda</h1>
        <p style={{ fontSize: '16px', color: '#666', margin: '0 0 4px' }}>Senior Technical Program Manager</p>
        <p style={{ fontSize: '14px', color: '#999', margin: '0' }}>AI tools I've built to solve real TPM problems</p>
      </div>

      <div style={{ display: 'grid', gap: '16px' }}>
        <a href="/tpm-dashboard" style={{ display: 'block', padding: '24px', border: '1px solid #e5e5e5', borderRadius: '12px', textDecoration: 'none', color: 'inherit' }}>
          <p style={{ fontSize: '13px', color: '#999', margin: '0 0 6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Program Management</p>
          <h2 style={{ fontSize: '18px', fontWeight: '600', margin: '0 0 8px' }}>Program Health Dashboard</h2>
          <p style={{ fontSize: '14px', color: '#666', margin: '0', lineHeight: '1.6' }}>Paste your program status data and get an AI-generated risk narrative, executive summary, and recommended actions.</p>
        </a>
      </div>
    </main>
  )
}