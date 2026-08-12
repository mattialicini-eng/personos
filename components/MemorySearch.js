'use client'

import { useState } from 'react'

export default function MemorySearch() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)

  async function handleSearch(e) {
    e.preventDefault()
    if (!query.trim()) return

    setLoading(true)
    setSearched(true)

    try {
      const response = await fetch('/api/memory/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, limit: 5 })
      })

      const data = await response.json()

      if (!response.ok) {
        setResults([])
        return
      }

      setResults(data.results || [])
    } catch (error) {
      console.error('Search error:', error)
      setResults([])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      padding: '1.5rem',
      background: 'var(--bg)',
      borderRadius: '0.5rem',
      border: '1px solid var(--neutral)',
      marginBottom: '2rem'
    }}>
      <h3 style={{ marginBottom: '1rem', fontSize: '1rem' }}>🧠 Ricerca Memoria</h3>

      <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Cerca nella tua memoria..."
          disabled={loading}
          style={{
            flex: 1,
            padding: '0.75rem',
            border: '1px solid var(--neutral)',
            borderRadius: '0.375rem',
            fontSize: '1rem'
          }}
        />
        <button
          type="submit"
          disabled={loading || !query.trim()}
          style={{
            padding: '0.75rem 1.5rem',
            background: 'var(--accent)',
            color: 'white',
            border: 'none',
            borderRadius: '0.375rem',
            fontWeight: '600',
            cursor: 'pointer',
            opacity: (loading || !query.trim()) ? 0.6 : 1
          }}
        >
          {loading ? 'Cercando...' : 'Cerca'}
        </button>
      </form>

      {searched && (
        <div>
          {loading && (
            <div style={{ color: 'var(--text-light)', fontSize: '0.875rem' }}>
              Ricerca in corso...
            </div>
          )}

          {!loading && results.length === 0 && (
            <div style={{ color: 'var(--text-light)', fontSize: '0.875rem' }}>
              Nessun risultato trovato.
            </div>
          )}

          {!loading && results.length > 0 && (
            <div>
              <div style={{ fontSize: '0.875rem', marginBottom: '0.75rem', color: 'var(--text-light)' }}>
                {results.length} risultato(i) trovato(i):
              </div>
              {results.map((result, i) => (
                <div
                  key={i}
                  style={{
                    padding: '0.75rem',
                    marginBottom: '0.75rem',
                    background: 'var(--bg-light)',
                    borderLeft: '3px solid var(--accent)',
                    borderRadius: '0.25rem'
                  }}
                >
                  <div style={{ fontSize: '0.875rem', marginBottom: '0.25rem' }}>
                    {result.text}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}>
                    {result.source} • Somiglianza: {(result.similarity * 100).toFixed(0)}%
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
