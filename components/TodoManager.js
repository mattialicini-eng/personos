'use client'

import { useState, useEffect } from 'react'

const CATEGORIES = ['Sikuro', 'Structural', 'Personal', 'Home Works', 'Chiamate']

export default function TodoManager() {
  const [todo, setTodo] = useState([])
  const [newTitle, setNewTitle] = useState('')
  const [newCategory, setNewCategory] = useState('Sikuro')
  const [loading, setLoading] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState(null)

  useEffect(() => {
    loadTodo()
  }, [])

  async function loadTodo() {
    try {
      const res = await fetch('/api/todo?status=pending')
      const data = await res.json()
      if (data.ok) {
        setTodo(data.todo)
      }
    } catch (err) {
      console.error('Load todo error:', err)
    }
  }

  async function addTodo(e) {
    e.preventDefault()
    if (!newTitle.trim()) return

    setLoading(true)
    try {
      const res = await fetch('/api/todo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newTitle, source: 'dashboard', category: newCategory })
      })
      const data = await res.json()
      if (data.ok) {
        setTodo([data.todo, ...todo])
        setNewTitle('')
      }
    } catch (err) {
      console.error('Add todo error:', err)
    } finally {
      setLoading(false)
    }
  }

  async function completeTodo(id) {
    try {
      const res = await fetch('/api/todo', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: 'completed' })
      })
      const data = await res.json()
      if (data.ok) {
        setTodo(todo.filter(t => t.id !== id))
      }
    } catch (err) {
      console.error('Complete todo error:', err)
    }
  }

  async function deleteTodo(id) {
    try {
      const res = await fetch(`/api/todo?id=${id}`, {
        method: 'DELETE'
      })
      const data = await res.json()
      if (data.ok) {
        setTodo(todo.filter(t => t.id !== id))
      }
    } catch (err) {
      console.error('Delete todo error:', err)
    }
  }

  return (
    <>
      <h2 style={{ marginBottom: '1rem' }}>✓ To Do List</h2>

      <form onSubmit={addTodo} style={{ marginBottom: '1rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        <input
          type="text"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          placeholder="Aggiungi nuovo task..."
          disabled={loading}
          style={{
            flex: 1,
            padding: '0.75rem',
            border: '1px solid var(--border)',
            borderRadius: '0.375rem',
            fontSize: '0.95rem',
            minWidth: '200px'
          }}
        />
        <select
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value)}
          style={{
            padding: '0.75rem',
            border: '1px solid var(--border)',
            borderRadius: '0.375rem',
            background: 'var(--bg-light)',
            color: 'inherit',
            cursor: 'pointer'
          }}
        >
          {CATEGORIES.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
        <button
          type="submit"
          disabled={loading}
          style={{
            padding: '0.75rem 1.5rem',
            background: 'var(--primary)',
            color: 'white',
            border: 'none',
            borderRadius: '0.375rem',
            cursor: 'pointer',
            fontWeight: '600'
          }}
        >
          + Aggiungi
        </button>
      </form>

      <div style={{ marginBottom: '1rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        <button
          onClick={() => setSelectedCategory(null)}
          style={{
            padding: '0.5rem 1rem',
            background: selectedCategory === null ? 'var(--primary)' : 'var(--bg-light)',
            color: selectedCategory === null ? 'white' : 'inherit',
            border: 'none',
            borderRadius: '0.25rem',
            cursor: 'pointer',
            fontSize: '0.85rem',
            fontWeight: '600'
          }}
        >
          Tutte
        </button>
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            style={{
              padding: '0.5rem 1rem',
              background: selectedCategory === cat ? 'var(--primary)' : 'var(--bg-light)',
              color: selectedCategory === cat ? 'white' : 'inherit',
              border: 'none',
              borderRadius: '0.25rem',
              cursor: 'pointer',
              fontSize: '0.85rem',
              fontWeight: '600'
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {(() => {
        const filtered = selectedCategory ? todo.filter(t => t.category === selectedCategory) : todo
        return filtered.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {filtered.map(item => (
              <div
                key={item.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '1rem',
                  background: 'var(--bg-light)',
                  borderRadius: '0.375rem',
                  borderLeft: '4px solid var(--primary)'
                }}
              >
                <button
                  onClick={() => completeTodo(item.id)}
                  style={{
                    width: '28px',
                    height: '28px',
                    border: '2px solid var(--primary)',
                    borderRadius: '4px',
                    background: 'transparent',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '16px',
                    fontWeight: '600'
                  }}
                  title="Completa"
                >
                  ✓
                </button>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '1rem' }}>{item.title}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-light)', marginTop: '0.25rem' }}>
                    {item.category}
                  </div>
                </div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-light)' }}>
                  {item.source === 'telegram' ? '📱' : '💻'}
                </span>
                <button
                  onClick={() => deleteTodo(item.id)}
                  style={{
                    padding: '0.5rem 0.75rem',
                    background: 'var(--danger)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.25rem',
                    cursor: 'pointer',
                    fontSize: '0.85rem'
                  }}
                >
                  Elimina
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div style={{
            color: 'var(--text-light)',
            fontSize: '0.95rem',
            textAlign: 'center',
            padding: '2rem 1rem',
            background: 'var(--bg-light)',
            borderRadius: '0.375rem'
          }}>
            ✨ Nessun task. Aggiungi il tuo primo task!
          </div>
        )
      })()}
    </>
  )
}
