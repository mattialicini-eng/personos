export default function HomeTab({ data }) {
  if (!data?.profile) {
    return <div>No data</div>
  }

  const profile = data.profile
  const tasks = data.tasks || []
  const today = data.today || {}

  return (
    <>
      <div className="card" style={{ gridColumn: 'span 2' }}>
        <h2>📅 Prossimi Eventi</h2>
        {data.calendar && data.calendar.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1rem' }}>
            {data.calendar.map((event, i) => {
              const startTime = new Date(event.start_time)
              const timeStr = startTime.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })
              const dateStr = startTime.toLocaleDateString('it-IT', { month: 'short', day: 'numeric' })
              return (
                <div key={i} style={{
                  padding: '0.75rem',
                  background: 'var(--bg-light)',
                  borderRadius: '0.375rem',
                  borderLeft: '3px solid var(--primary)'
                }}>
                  <div style={{ fontWeight: '600', fontSize: '0.95rem' }}>{event.title}</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-light)', marginTop: '0.25rem' }}>
                    {dateStr} · {timeStr}
                  </div>
                  {event.attendees && event.attendees.length > 0 && (
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-light)', marginTop: '0.25rem' }}>
                      👥 {event.attendees.length} partecipanti
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        ) : (
          <div style={{ color: 'var(--text-light)', fontSize: '0.875rem', marginTop: '1rem' }}>Nessun evento in calendario</div>
        )}
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
