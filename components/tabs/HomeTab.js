import { useEffect, useState } from 'react'

export default function HomeTab({ data }) {
  const [meals, setMeals] = useState([])
  const [summary, setSummary] = useState({ good: 0, bad: 0 })
  const [weekDays, setWeekDays] = useState([])
  const [fitnessSummary, setFitnessSummary] = useState({ workouts: 0, runs: 0 })

  useEffect(() => {
    loadMeals()
    loadFitness()
  }, [])

  const loadMeals = async () => {
    try {
      const res = await fetch('/api/meals')
      const result = await res.json()
      if (result.ok) {
        setMeals(result.meals)
        setSummary(result.monthlySummary)
      }
    } catch (err) {
      console.error('Load meals error:', err)
    }
  }

  const loadFitness = async () => {
    try {
      const res = await fetch('/api/fitness')
      const result = await res.json()
      if (result.ok) {
        setWeekDays(result.weekDays)
        setFitnessSummary(result.monthlySummary)
      }
    } catch (err) {
      console.error('Load fitness error:', err)
    }
  }

  const handleMealStatus = async (mealType, status) => {
    try {
      await fetch('/api/meals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mealType, status })
      })
      loadMeals()
    } catch (err) {
      console.error('Save meal error:', err)
    }
  }

  const handleActivity = async (date, type) => {
    try {
      await fetch('/api/fitness', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date, type })
      })
      loadFitness()
    } catch (err) {
      console.error('Save activity error:', err)
    }
  }

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
        <h2>🍽️ Nutrizione</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
          {meals.map(meal => (
            <div key={meal.type} style={{
              padding: '0.75rem',
              background: 'var(--bg-light)',
              borderRadius: '0.375rem'
            }}>
              <div style={{ fontWeight: '600', marginBottom: '0.5rem' }}>{meal.label}</div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  onClick={() => handleMealStatus(meal.type, 'good')}
                  style={{
                    flex: 1,
                    padding: '0.5rem',
                    background: meal.status === 'good' ? 'var(--success)' : 'var(--bg-light)',
                    color: meal.status === 'good' ? 'white' : 'inherit',
                    border: 'none',
                    borderRadius: '0.25rem',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    fontWeight: '600'
                  }}
                >
                  ✅ Good
                </button>
                <button
                  onClick={() => handleMealStatus(meal.type, 'bad')}
                  style={{
                    flex: 1,
                    padding: '0.5rem',
                    background: meal.status === 'bad' ? 'var(--danger)' : 'var(--bg-light)',
                    color: meal.status === 'bad' ? 'white' : 'inherit',
                    border: 'none',
                    borderRadius: '0.25rem',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    fontWeight: '600'
                  }}
                >
                  ❌ Bad
                </button>
              </div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-light)', marginBottom: '0.75rem' }}>Ultimi 30 giorni</div>
          <div className="stat">
            <span>Pasti Good</span>
            <span style={{ color: 'var(--success)', fontWeight: '600' }}>{summary.good}</span>
          </div>
          <div className="stat">
            <span>Pasti Bad</span>
            <span style={{ color: 'var(--danger)', fontWeight: '600' }}>{summary.bad}</span>
          </div>
        </div>
      </div>

      <div className="card">
        <h2>📊 Fitness</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
          {weekDays.map(day => (
            <div key={day.date} style={{
              padding: '0.75rem',
              background: 'var(--bg-light)',
              borderRadius: '0.375rem'
            }}>
              <div style={{ fontWeight: '600', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                {day.dayName} {day.dayNum}
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  onClick={() => handleActivity(day.date, 'workout')}
                  style={{
                    flex: 1,
                    padding: '0.5rem',
                    background: day.activities.includes('workout') ? 'var(--primary)' : 'var(--bg-light)',
                    color: day.activities.includes('workout') ? 'white' : 'inherit',
                    border: 'none',
                    borderRadius: '0.25rem',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    fontWeight: '600'
                  }}
                >
                  💪 Workout
                </button>
                <button
                  onClick={() => handleActivity(day.date, 'corsa')}
                  style={{
                    flex: 1,
                    padding: '0.5rem',
                    background: day.activities.includes('corsa') ? 'var(--accent)' : 'var(--bg-light)',
                    color: day.activities.includes('corsa') ? 'white' : 'inherit',
                    border: 'none',
                    borderRadius: '0.25rem',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    fontWeight: '600'
                  }}
                >
                  🏃 Corsa
                </button>
              </div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-light)', marginBottom: '0.75rem' }}>Ultimi 30 giorni (target: 3 workout + 2 corse/settimana)</div>
          <div className="stat">
            <span>Workout</span>
            <span style={{
              fontWeight: '600',
              color: fitnessSummary.workouts >= 12 ? 'var(--success)' : 'var(--danger)'
            }}>
              {fitnessSummary.workouts} {fitnessSummary.workouts >= 12 ? '✅' : '❌'}
            </span>
          </div>
          <div className="stat">
            <span>Corse</span>
            <span style={{
              fontWeight: '600',
              color: fitnessSummary.runs >= 8 ? 'var(--success)' : 'var(--danger)'
            }}>
              {fitnessSummary.runs} {fitnessSummary.runs >= 8 ? '✅' : '❌'}
            </span>
          </div>
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
