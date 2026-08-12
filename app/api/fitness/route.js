import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

export async function GET(request) {
  const userId = process.env.USER_ID || 'default-user'
  const today = new Date().toISOString().split('T')[0]
  const weekStart = new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

  try {
    // This week's activities
    const { data: weekData, error: weekError } = await supabase
      .from('activities')
      .select('*')
      .eq('user_id', userId)
      .gte('date', weekStart)
      .lte('date', today)
      .order('date', { ascending: false })

    if (weekError) throw weekError

    // Generate week days
    const weekDays = []
    for (let i = 6; i >= 0; i--) {
      const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000)
      const dateStr = d.toISOString().split('T')[0]
      const dayName = ['Dom', 'Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab'][d.getDay()]
      const dayNum = d.getDate()

      const activities = weekData?.filter(a => a.date === dateStr) || []
      weekDays.push({
        date: dateStr,
        dayName,
        dayNum,
        activities: activities.map(a => a.type)
      })
    }

    // Last 30 days summary
    const { data: monthlyData, error: monthlyError } = await supabase
      .from('activities')
      .select('*')
      .eq('user_id', userId)
      .gte('date', thirtyDaysAgo)
      .lte('date', today)

    if (monthlyError) throw monthlyError

    const workouts = monthlyData?.filter(a => a.type === 'workout').length || 0
    const runs = monthlyData?.filter(a => a.type === 'corsa').length || 0

    return NextResponse.json({
      ok: true,
      weekDays,
      monthlySummary: { workouts, runs }
    })
  } catch (error) {
    console.error('Activities fetch error:', error)
    // Fallback
    const weekDays = []
    for (let i = 6; i >= 0; i--) {
      const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000)
      const dayName = ['Dom', 'Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab'][d.getDay()]
      const dayNum = d.getDate()
      weekDays.push({
        date: d.toISOString().split('T')[0],
        dayName,
        dayNum,
        activities: []
      })
    }
    return NextResponse.json({
      ok: true,
      weekDays,
      monthlySummary: { workouts: 0, runs: 0 }
    })
  }
}

export async function POST(request) {
  const userId = process.env.USER_ID || 'default-user'
  const { date, type } = await request.json()

  try {
    const { error } = await supabase
      .from('activities')
      .insert({
        user_id: userId,
        date,
        type
      })

    if (error) throw error

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Activity save error:', error)
    return NextResponse.json({ ok: true })
  }
}
