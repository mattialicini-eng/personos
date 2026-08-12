import { NextResponse } from 'next/server'
import {
  getProfile,
  getTasks,
  getPeople,
  getDailyLogs,
  getCaptures
} from '@/lib/store'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'all'
    const dateFrom = searchParams.get('dateFrom')
    const dateTo = searchParams.get('dateTo')

    const data = {}

    // Always fetch profile
    data.profile = await getProfile()

    if (type === 'all' || type === 'home') {
      data.tasks = await getTasks()
      data.people = await getPeople()

      // Get today's log
      const today = new Date().toISOString().split('T')[0]
      const todayLog = await getDailyLogs(today, today)
      data.today = todayLog[0] || null
    }

    if (type === 'all' || type === 'crm') {
      data.people = await getPeople()
    }

    if (type === 'all' || type === 'finance') {
      // For now, return empty
      data.finance = {}
    }

    if (type === 'all' || type === 'review') {
      // Get week data
      const today = new Date()
      const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
      const todayStr = today.toISOString().split('T')[0]
      const weekAgoStr = weekAgo.toISOString().split('T')[0]

      data.weekLogs = await getDailyLogs(weekAgoStr, todayStr)
      data.tasks = await getTasks()
    }

    return NextResponse.json({
      ok: true,
      data,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Data fetch error:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}

export async function POST(request) {
  return NextResponse.json({ error: 'Use GET' }, { status: 405 })
}
