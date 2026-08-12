'use client'

import { useState, useEffect } from 'react'

export default function FocusManager() {
  const [focus, setFocus] = useState([])
  const [newTitle, setNewTitle] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadFocus()
  }, [])

  async function loadFocus() {
    try {
      const res = await fetch('/api/focus?status=active')
      const data = await res.json()
      if (data.ok) {
        setFocus(data.focus)
      }
    } catch (err) {
      console.error('Load focus error:', err)
    }
  }

  async function addFocus(e) {
    e.preventDefault()
    if (!newTitle.trim()) return

    setLoading(true)
    try {
      const res = await fetch('/api/focus', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newTitle, priority: 1 })
      })
      const data = await res.json()
      if (data.ok) {
        setFocus([data.focus, ...focus])
        setNewTitle('')
      }
    } catch (err) {
      console.error('Add focus error:', err)
    } finally {
      setLoading(false)
    }
  }

  async function completeFocus(id) {
    try {
      const res = await fetch('/api/focus', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: 'completed' })
      })
      const data = await res.json()
      if (data.ok) {
        setFocus(focus.filter(f => f.id !== id))
      }
    } catch (err) {
      console.error('Complete focus error:', err)
    }
  }

  async function deleteFocus(id) {
    try {
      const res = await fetch(`/api/focus?id=${id}`, {
        method: 'DELETE'
      })
      const data = await res.json()
      if (data.ok) {
        setFocus(focus.filter(f => f.id !== id))
      }
    } catch (err) {
      console.error('Delete focus error:', err)
    }
  }

  return (
    <div className="card" style={{ gridColumn: 'span 2' }}>
      <h2>🎯 I Miei Focus</h2>

      <form onSubmit={addFocus} style={{ marginBottom: '1rem', display: 'flex', gap: '0.5rem' }}>
        <input
          type="text"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          placeholder="Aggiungi nuovo focus..."
          disabled={loading}
          style={{
            flex: 1,
            padding: '0.5rem',
            border: '1px solid var(--border)',
            borderRadius: '0.375rem',
            fontSize: '0.875rem'
          }}
        />
        <button
          type="submit"
          disabled={loading}
          style={{
            padding: '0.5rem 1rem',
            background: 'var(--primary)',
            color: 'white',
            border: 'none',
            borderRadius: '0.375rem',
            cursor: 'pointer',
            fontWeight: '600'
          }}
        >
          +
        </button>
      </form>

      {focus.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {focus.map(item => (
            <div
              key={item.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.75rem',
                background: 'var(--bg-light)',
                borderRadius: '0.375rem',
                borderLeft: '3px solid var(--primary)'
              }}
            >
              <button
                onClick={() => completeFocus(item.id)}
                style={{
                  width: '24px',
                  height: '24px',
                  border: '2px solid var(--primary)',
                  borderRadius: '50%',
                  background: 'transparent',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '14px'
                }}
                title="Completa"
              >
                ✓
              </button>
              <span style={{ flex: 1, fontSize: '0.95rem' }}>{item.title}</span>
              <button
                onClick={() => deleteFocus(item.id)}
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
                ✕
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ color: 'var(--text-light)', fontSize: '0.875rem', textAlign: 'center', padding: '1rem' }}>
          Nessun focus. Aggiungi il tuo primo focus!
        </div>
      )}
    </div>
  )
}
