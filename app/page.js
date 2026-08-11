'use client'

import { useState, useEffect } from 'react'
import Header from '@/components/Header'
import Dashboard from '@/components/Dashboard'

export default function Home() {
  return (
    <>
      <Header />
      <Dashboard />
    </>
  )
}
