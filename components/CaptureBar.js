'use client'

import { useState } from 'react'

export default function CaptureBar() {
  const [text, setText] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [status, setStatus] = useState('')

  async function handleCapture(e) {
    e.preventDefault()
    if (!text.trim()) return

    setIsLoading(true)
    setStatus('')

    try {
      const response = await fetch('/api/capture', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      })

      const data = await response.json()

      if (!response.ok) {
        setStatus(`Errore: ${data.error}`)
        return
      }

      setStatus(`Catturato come ${data.classification.category} (confidenza: ${(data.classification.confidence * 100).toFixed(0)}%)`)
      setText('')
      setTimeout(() => setStatus(''), 3000)
    } catch (error) {
      setStatus('Errore di connessione')
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div style={{
      padding: '1rem',
      background: 'var(--bg)',
      borderBottom: '1px solid var(--neutral)',
      marginBottom: '1.5rem'
    }}>
      <form onSubmit={handleCapture} style={{ display: 'flex', gap: '0.5rem' }}>
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Scrivi una nota..."
          disabled={isLoading}
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
          disabled={isLoading || !text.trim()}
          style={{
            padding: '0.75rem 1.5rem',
            background: 'var(--accent)',
            color: 'white',
            border: 'none',
            borderRadius: '0.375rem',
            fontWeight: '600',
            cursor: 'pointer',
            opacity: (isLoading || !text.trim()) ? 0.6 : 1
          }}
        >
          {isLoading ? 'Catturando...' : 'Cattura'}
        </button>
      </form>

      {status && (
        <div style={{
          marginTop: '0.5rem',
          fontSize: '0.875rem',
          color: status.includes('Errore') ? 'var(--danger)' : 'var(--success)'
        }}>
          {status}
        </div>
      )}
    </div>
  )
}
