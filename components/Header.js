'use client'

import { useEffect, useState } from 'react'

export default function Header() {
  const [time, setTime] = useState('')

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

  return (
    <div className="header">
      <div>
        <h1>PersonOS</h1>
        <div className="time">{time}</div>
      </div>
      <div style={{ textAlign: 'right', fontSize: '0.875rem' }}>
        Mattia<br />Founder @ Sikuro
      </div>
    </div>
  )
}
