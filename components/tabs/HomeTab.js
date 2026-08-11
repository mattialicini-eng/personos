export default function HomeTab() {
  return (
    <>
      <div className="card" style={{ gridColumn: 'span 2' }}>
        <h2>🎯 Focus Oggi</h2>
        <p style={{ fontSize: '1.125rem', marginBottom: '1rem' }}>Completare milestone VitaOS Q3</p>
        <h3>Abitudini</h3>
        <div className="habit-item">
          <span>Meditazione mattina</span>
          <span style={{ fontWeight: '600', color: 'var(--success)' }}>✓ 24/30</span>
        </div>
        <div className="habit-item">
          <span>Esercizio fisico</span>
          <span style={{ fontWeight: '600', color: 'var(--warning)' }}>⊘ 12/30</span>
        </div>
        <div className="habit-item">
          <span>Lettura sera</span>
          <span style={{ fontWeight: '600', color: 'var(--success)' }}>✓ 20/30</span>
        </div>
      </div>

      <div className="card">
        <h2>📅 Settimana</h2>
        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
          {[8, 9, 10, 11, 12].map((day, i) => (
            <div
              key={day}
              style={{
                flex: 1,
                textAlign: 'center',
                padding: '0.5rem',
                background: i === 1 ? 'var(--accent)' : 'var(--bg-light)',
                color: i === 1 ? 'white' : 'inherit',
                borderRadius: '0.5rem'
              }}
            >
              <div style={{ fontSize: '0.875rem', color: i === 1 ? 'inherit' : 'var(--text-light)' }}>
                {['Lun', 'Mar', 'Mer', 'Gio', 'Ven'][i]}
              </div>
              <div style={{ fontWeight: '600' }}>{day}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <h2>⚠️ Bloccato</h2>
        <div className="stat">
          <span>Approvazione budget</span>
          <span style={{ color: 'var(--warning)' }}>3gg</span>
        </div>
        <div className="stat">
          <span>Richiesta info cliente</span>
          <span style={{ color: 'var(--danger)' }}>8gg</span>
        </div>
      </div>

      <div className="card">
        <h2>💰 Polso Finanziario</h2>
        <div className="stat">
          <span>Saldo disponibile</span>
          <span className="stat-value">€45.200</span>
        </div>
        <div className="stat">
          <span>Spese questo mese</span>
          <span style={{ color: 'var(--danger)' }}>€8.340</span>
        </div>
      </div>

      <div className="card">
        <h2>🍽️ Nutrizione</h2>
        <div className="stat">
          <span>Calorie oggi</span>
          <span className="stat-value">1840/2000</span>
        </div>
        <div className="stat">
          <span>Acqua</span>
          <span className="stat-value">7/8</span>
        </div>
      </div>

      <div className="card">
        <h2>📊 Fitness (ultimi 30gg)</h2>
        <div className="chart-container">
          {[60, 75, 45, 80, 55, 70, 65].map((height, i) => (
            <div key={i} className="bar" style={{ height: `${height}%` }} />
          ))}
        </div>
      </div>

      <div className="card">
        <h2>🎯 Obiettivi</h2>
        <h3>Settimana</h3>
        <div className="stat">
          <span>Completare design V1</span>
        </div>
        <div className="stat">
          <span>5 call commerciali</span>
        </div>
        <h3>Mese</h3>
        <div className="stat">
          <span>Revenue target</span>
          <span style={{ color: 'var(--success)' }}>↑ 85%</span>
        </div>
      </div>
    </>
  )
}
