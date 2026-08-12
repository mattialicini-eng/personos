'use client'

import { useEffect, useState } from 'react'

export default function Header() {
  const [time, setTime] = useState('')
  const [showMenu, setShowMenu] = useState(false)

  useEffect(() => {
    const updateTime = () => {
      const now = new Date()
      const hours = String(now.getHours()).padStart(2, '0')
      const minutes = String(now.getMinutes()).padStart(2, '0')
      setTime(`${hours}:${minutes}`)
    }
    updateTime()
    const interval = setInterval(updateTime, 1000)
    return () => clearInterval(interval)
  }, [])

  function handleExport(format) {
    const url = `/api/export?format=${format}&type=all`
    window.location.href = url
    setShowMenu(false)
  }

  return (
    <div className="header">
      <div>
        <h1>PersonOS</h1>
        <div className="time">{time}</div>
      </div>
      <div style={{ textAlign: 'right', fontSize: '0.875rem', position: 'relative' }}>
        <div>
          Mattia<br />Founder @ Sikuro
        </div>
        <button
          onClick={() => setShowMenu(!showMenu)}
          style={{
            marginTop: '8px',
            padding: '4px 8px',
            fontSize: '0.75rem',
            background: 'transparent',
            border: '1px solid #ccc',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          ⚙️ Menu
        </button>
        {showMenu && (
          <div style={{
            position: 'absolute',
            top: '100%',
            right: 0,
            background: 'white',
            border: '1px solid #ddd',
            borderRadius: '4px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            zIndex: 1000,
            minWidth: '120px',
          }}>
            <button
              onClick={() => handleExport('json')}
              style={{
                display: 'block',
                width: '100%',
                padding: '8px',
                textAlign: 'left',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                fontSize: '0.875rem',
              }}
            >
              📥 Export JSON
            </button>
            <button
              onClick={() => handleExport('csv')}
              style={{
                display: 'block',
                width: '100%',
                padding: '8px',
                textAlign: 'left',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                fontSize: '0.875rem',
              }}
            >
              📥 Export CSV
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
