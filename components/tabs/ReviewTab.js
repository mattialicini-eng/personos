export default function ReviewTab() {
  return (
    <>
      <div className="card" style={{ gridColumn: 'span 2' }}>
        <h2>✅ Completato</h2>
        <div className="stat">
          <span>Riunione board VitaOS</span>
        </div>
        <div className="stat">
          <span>Design dashboard v0.1</span>
        </div>
        <div className="stat">
          <span>3 call commerciali</span>
        </div>
        <div className="stat">
          <span>Retrospettiva team</span>
        </div>
      </div>

      <div className="card" style={{ gridColumn: 'span 2' }}>
        <h2>⏸️ Slittato</h2>
        <div className="person-item urgency-high">
          <div className="person-name">Approvazione budget Q3</div>
          <div className="person-note">Spostato a giovedì 14</div>
        </div>
        <div className="person-item urgency-medium">
          <div className="person-name">Migrazione database</div>
          <div className="person-note">Richiede input da Paolo - prossima settimana</div>
        </div>
      </div>

      <div className="card" style={{ gridColumn: 'span 2' }}>
        <h2>🔄 Aperto</h2>
        <div className="stat">
          <span>Ricerca CMO</span>
        </div>
        <div className="stat">
          <span>Negoziazione contratto cliente X</span>
        </div>
        <div className="stat">
          <span>Implementazione analytics</span>
        </div>
      </div>

      <div className="card" style={{ gridColumn: 'span 2' }}>
        <h2>📍 Prossima Settimana - Top 3</h2>
        <div style={{ padding: '1rem', background: 'var(--accent)', color: 'white', borderRadius: '0.5rem', marginBottom: '1rem' }}>
          <div style={{ fontWeight: '600', marginBottom: '0.5rem' }}>1. Chiudere approvazione budget</div>
        </div>
        <div style={{ padding: '1rem', background: 'var(--warning)', color: 'white', borderRadius: '0.5rem', marginBottom: '1rem' }}>
          <div style={{ fontWeight: '600', marginBottom: '0.5rem' }}>2. Completare MVP PersonOS</div>
        </div>
        <div style={{ padding: '1rem', background: 'var(--success)', color: 'white', borderRadius: '0.5rem' }}>
          <div style={{ fontWeight: '600', marginBottom: '0.5rem' }}>3. 2 call con clienti prioritari</div>
        </div>
      </div>
    </>
  )
}
