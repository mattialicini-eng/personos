export default function FinanceTab() {
  return (
    <>
      <div className="card">
        <h2>💎 Patrimonio</h2>
        <div className="stat">
          <span>Liquidità</span>
          <span className="stat-value">€45.200</span>
        </div>
        <div className="stat">
          <span>Investimenti</span>
          <span className="stat-value">€182.500</span>
        </div>
        <div className="stat">
          <span>Immobili</span>
          <span className="stat-value">€380.000</span>
        </div>
        <div style={{ borderTop: '2px solid var(--neutral)', paddingTop: '0.75rem', marginTop: '0.75rem' }}>
          <div className="stat">
            <span style={{ fontWeight: '600' }}>Totale</span>
            <span className="stat-value" style={{ fontSize: '1.5rem' }}>€607.700</span>
          </div>
        </div>
      </div>

      <div className="card">
        <h2>📉 Ritmo</h2>
        <div className="stat">
          <span>Spesa media al mese</span>
          <span className="stat-value">€7.200</span>
        </div>
        <div className="stat">
          <span>Mesi di runway</span>
          <span className="stat-value" style={{ color: 'var(--success)' }}>84</span>
        </div>
        <div className="stat">
          <span>Cambio vs scorso anno</span>
          <span style={{ color: 'var(--success)' }}>↑ +12%</span>
        </div>
      </div>

      <div className="card" style={{ gridColumn: 'span 2' }}>
        <h2>💸 Spese Questo Mese</h2>
        <div className="stat">
          <span>Operativi</span>
          <span className="stat-value">€3.200</span>
        </div>
        <div className="stat">
          <span>Personale</span>
          <span className="stat-value">€2.840</span>
        </div>
        <div className="stat">
          <span>Investimenti</span>
          <span className="stat-value">€1.500</span>
        </div>
        <div className="stat">
          <span>Altro</span>
          <span className="stat-value">€800</span>
        </div>
      </div>

      <div className="card" style={{ gridColumn: 'span 2' }}>
        <h2>📌 Debiti</h2>
        <div className="person-item" style={{ borderLeftColor: 'var(--danger)' }}>
          <div className="person-name">Ufficio commercialista</div>
          <div className="person-note">Dichiarazione 2025: €450</div>
        </div>
        <div className="person-item" style={{ borderLeftColor: 'var(--warning)' }}>
          <div className="person-name">Fondo sviluppo</div>
          <div className="person-note">Investimento previsto agosto: €5.000</div>
        </div>
      </div>
    </>
  )
}
