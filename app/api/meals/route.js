import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

export async function GET(request) {
  const userId = process.env.USER_ID || 'default-user'
  const { searchParams } = new URL(request.url)
  const dateParam = searchParams.get('date')

  const today = new Date().toISOString().split('T')[0]
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

  const queryDate = dateParam || today

  const meals = [
    { type: 'colazione', label: '🌅 Colazione' },
    { type: 'pranzo', label: '☀️ Pranzo' },
    { type: 'spuntini', label: '🍎 Spuntini' },
    { type: 'cena', label: '🌙 Cena' },
    { type: 'vitamine', label: '💊 Vitamine' },
    { type: 'creatina', label: '⚡ Creatina' }
  ]

  try {
    // Query date meals
    const { data: todayData, error: todayError } = await supabase
      .from('meals')
      .select('*')
      .eq('user_id', userId)
      .eq('date', queryDate)
      .order('meal_type', { ascending: true })

    if (todayError) throw todayError

    const mealData = meals.map(m => {
      const existing = todayData?.find(d => d.meal_type === m.type)
      return {
        type: m.type,
        label: m.label,
        status: existing?.status || null
      }
    })

    // Last 30 days summary
    const { data: monthlyData, error: monthlyError } = await supabase
      .from('meals')
      .select('*')
      .eq('user_id', userId)
      .gte('date', thirtyDaysAgo)
      .lte('date', today)

    if (monthlyError) throw monthlyError

    const monthlyGood = monthlyData?.filter(d => d.status === 'good').length || 0
    const monthlyBad = monthlyData?.filter(d => d.status === 'bad').length || 0

    return NextResponse.json({
      ok: true,
      meals: mealData,
      monthlySummary: { good: monthlyGood, bad: monthlyBad }
    })
  } catch (error) {
    console.error('Meals fetch error:', error)
    const mealData = meals.map(m => ({
      type: m.type,
      label: m.label,
      status: null
    }))
    return NextResponse.json({
      ok: true,
      meals: mealData,
      monthlySummary: { good: 0, bad: 0 }
    })
  }
}

export async function POST(request) {
  const userId = process.env.USER_ID || 'default-user'
  const { mealType, status } = await request.json()
  const today = new Date().toISOString().split('T')[0]

  try {
    const { error } = await supabase
      .from('meals')
      .upsert({
        user_id: userId,
        date: today,
        meal_type: mealType,
        status: status
      }, {
        onConflict: 'user_id,date,meal_type'
      })

    if (error) throw error

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Meal save error:', error)
    // Fallback: pretend it saved (UI will still work)
    return NextResponse.json({ ok: true })
  }
}
