import { useEffect, useState } from 'react'

export default function HomeTab({ data }) {
  const [meals, setMeals] = useState([])
  const [summary, setSummary] = useState({ good: 0, bad: 0 })
  const [weekDays, setWeekDays] = useState([])
  const [fitnessSummary, setFitnessSummary] = useState({ workouts: 0, runs: 0 })
  const [goals, setGoals] = useState([])
  const [newGoal, setNewGoal] = useState('')
  const [newGoalDeadline, setNewGoalDeadline] = useState('')
  const [selectedDay, setSelectedDay] = useState('oggi')
  const [allMeals, setAllMeals] = useState({})
  const [selectedFitnessDay, setSelectedFitnessDay] = useState(0)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      loadMeals('oggi')
      loadFitness()
      loadGoals()
    }
  }, [])

  const changeDay = (day) => {
    setSelectedDay(day)
    loadMeals(day)
  }

  const loadMeals = async (day = 'oggi') => {
    try {
      const today = new Date().toISOString().split('T')[0]
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      const queryDate = day === 'oggi' ? today : yesterday

      const res = await fetch(`/api/meals?date=${queryDate}`)
      const result = await res.json()
      if (result.ok) {
        setMeals(result.meals)
        setSummary(result.monthlySummary)
        setAllMeals(prev => ({ ...prev, [day]: result.meals }))
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
      loadMeals(selectedDay)
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

  const loadGoals = async () => {
    try {
      const res = await fetch('/api/goals')
      const result = await res.json()
      if (result.ok && result.goals?.length > 0) {
        setGoals(result.goals)
      } else {
        // Fallback to localStorage
        const stored = localStorage.getItem('goals')
        if (stored) {
          setGoals(JSON.parse(stored))
        } else {
          setGoals([])
        }
      }
    } catch (err) {
      console.error('Load goals error:', err)
      // Fallback to localStorage
      const stored = localStorage.getItem('goals')
      if (stored) {
        setGoals(JSON.parse(stored))
      }
    }
  }

  const addGoal = async () => {
    if (!newGoal.trim()) return

    const newGoalObj = {
      id: Date.now(),
      title: newGoal,
      deadline: newGoalDeadline || null,
      completed: false,
      created_at: new Date().toISOString()
    }

    try {
      const res = await fetch('/api/goals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newGoal, deadline: newGoalDeadline || null })
      })
      const result = await res.json()
      if (!result.ok) throw new Error('API failed')
    } catch (err) {
      console.warn('Goals DB unavailable, using localStorage')
      // Save to localStorage
      const stored = localStorage.getItem('goals')
      const storedGoals = stored ? JSON.parse(stored) : []
      storedGoals.push(newGoalObj)
      localStorage.setItem('goals', JSON.stringify(storedGoals))
    }

    setNewGoal('')
    setNewGoalDeadline('')
    loadGoals()
  }

  const toggleGoal = async (goal) => {
    try {
      await fetch('/api/goals', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: goal.id, completed: !goal.completed, title: goal.title, deadline: goal.deadline })
      })
    } catch (err) {
      console.warn('Goals DB unavailable, using localStorage')
      const stored = localStorage.getItem('goals')
      const storedGoals = stored ? JSON.parse(stored) : []
      const updated = storedGoals.map(g => g.id === goal.id ? { ...g, completed: !g.completed } : g)
      localStorage.setItem('goals', JSON.stringify(updated))
    }
    loadGoals()
  }

  const deleteGoal = async (goalId) => {
    try {
      await fetch(`/api/goals?id=${goalId}`, { method: 'DELETE' })
    } catch (err) {
      console.warn('Goals DB unavailable, using localStorage')
      const stored = localStorage.getItem('goals')
      const storedGoals = stored ? JSON.parse(stored) : []
      const filtered = storedGoals.filter(g => g.id !== goalId)
      localStorage.setItem('goals', JSON.stringify(filtered))
    }
    loadGoals()
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
        <h2>🍽️ Nutrizione</h2>
        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem', marginBottom: '1rem' }}>
          <button
            onClick={() => changeDay('ieri')}
            style={{
              padding: '0.5rem 1rem',
              background: selectedDay === 'ieri' ? 'var(--primary)' : 'var(--bg-light)',
              color: selectedDay === 'ieri' ? 'white' : 'inherit',
              border: 'none',
              borderRadius: '0.25rem',
              cursor: 'pointer',
              fontSize: '0.85rem',
              fontWeight: '600'
            }}
          >
            Ieri
          </button>
          <button
            onClick={() => changeDay('oggi')}
            style={{
              padding: '0.5rem 1rem',
              background: selectedDay === 'oggi' ? 'var(--primary)' : 'var(--bg-light)',
              color: selectedDay === 'oggi' ? 'white' : 'inherit',
              border: 'none',
              borderRadius: '0.25rem',
              cursor: 'pointer',
              fontSize: '0.85rem',
              fontWeight: '600'
            }}
          >
            Oggi
          </button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '0.5rem' }}>
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <input
              type="text"
              placeholder="Nuovo obiettivo..."
              value={newGoal}
              onChange={(e) => setNewGoal(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addGoal()}
              style={{
                flex: 1,
                padding: '0.5rem',
                border: '1px solid var(--border)',
                borderRadius: '0.25rem',
                background: 'var(--bg-light)',
                color: 'inherit',
                minWidth: '150px'
              }}
            />
            <input
              type="date"
              value={newGoalDeadline}
              onChange={(e) => setNewGoalDeadline(e.target.value)}
              style={{
                padding: '0.5rem',
                border: '1px solid var(--border)',
                borderRadius: '0.25rem',
                background: 'var(--bg-light)',
                color: 'inherit'
              }}
            />
            <button
              onClick={addGoal}
              style={{
                padding: '0.5rem 1rem',
                background: 'var(--primary)',
                color: 'white',
                border: 'none',
                borderRadius: '0.25rem',
                cursor: 'pointer',
                fontWeight: '600'
              }}
            >
              +
            </button>
          </div>

          {goals.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {goals.map(goal => (
                <div
                  key={goal.id}
                  style={{
                    padding: '0.75rem',
                    background: 'var(--bg-light)',
                    borderRadius: '0.375rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    opacity: goal.completed ? 0.6 : 1
                  }}
                >
                  <input
                    type="checkbox"
                    checked={goal.completed}
                    onChange={() => toggleGoal(goal)}
                    style={{ cursor: 'pointer', width: '18px', height: '18px' }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      textDecoration: goal.completed ? 'line-through' : 'none',
                      fontWeight: '600',
                      wordBreak: 'break-word'
                    }}>
                      {goal.title}
                    </div>
                    {goal.deadline && (
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-light)', marginTop: '0.25rem' }}>
                        Scadenza: {new Date(goal.deadline).toLocaleDateString('it-IT')}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => deleteGoal(goal.id)}
                    style={{
                      padding: '0.25rem 0.5rem',
                      background: 'var(--danger)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '0.25rem',
                      cursor: 'pointer',
                      fontSize: '0.75rem'
                    }}
                  >
                    Rimuovi
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ color: 'var(--text-light)', fontSize: '0.875rem', textAlign: 'center', padding: '1rem' }}>
              Nessun obiettivo. Aggiungine uno!
            </div>
          )}
        </div>
      </div>
    </>
  )
}
