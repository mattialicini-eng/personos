'use client'

import { useState } from 'react'
import CaptureBar from './CaptureBar'
import HomeTab from './tabs/HomeTab'
import CrmTab from './tabs/CrmTab'
import FinanceTab from './tabs/FinanceTab'
import ReviewTab from './tabs/ReviewTab'

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('home')

  const tabs = [
    { id: 'home', label: 'Home' },
    { id: 'crm', label: 'CRM' },
    { id: 'finance', label: 'Finanze' },
    { id: 'review', label: 'Review' }
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

      <div className="grid">
        {activeTab === 'home' && <HomeTab />}
        {activeTab === 'crm' && <CrmTab />}
        {activeTab === 'finance' && <FinanceTab />}
        {activeTab === 'review' && <ReviewTab />}
      </div>
    </div>
  )
}
