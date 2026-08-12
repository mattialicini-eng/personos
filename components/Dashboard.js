'use client'

import { useState } from 'react'
import { useData } from '@/lib/hooks'
import CaptureBar from './CaptureBar'
import HomeTab from './tabs/HomeTab'
import CrmTab from './tabs/CrmTab'
import FinanceTab from './tabs/FinanceTab'
import ReviewTab from './tabs/ReviewTab'
import MemoryTab from './tabs/MemoryTab'

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('home')
  const { data, loading, error } = useData('all')

  const tabs = [
    { id: 'home', label: 'Home' },
    { id: 'crm', label: 'CRM' },
    { id: 'finance', label: 'Finanze' },
    { id: 'review', label: 'Review' },
    { id: 'memory', label: 'Memoria' }
  ]

  return (
    <div className="content">
      <CaptureBar />
      <div className="tabs">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading && (
        <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-light)' }}>
          Caricamento dati...
        </div>
      )}

      {error && (
        <div style={{ padding: '2rem', color: 'var(--danger)', textAlign: 'center' }}>
          Errore: {error}
        </div>
      )}

      {!loading && data && (
        <div className="grid">
          {activeTab === 'home' && <HomeTab data={data} />}
          {activeTab === 'crm' && <CrmTab data={data} />}
          {activeTab === 'finance' && <FinanceTab data={data} />}
          {activeTab === 'review' && <ReviewTab data={data} />}
          {activeTab === 'memory' && <MemoryTab data={data} />}
        </div>
      )}
    </div>
  )
}
