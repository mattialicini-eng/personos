import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

export async function GET(request) {
  const userId = process.env.USER_ID || 'default-user'
  const today = new Date().toISOString().split('T')[0]

  const { data, error } = await supabase
    .from('meals')
    .select('*')
    .eq('user_id', userId)
    .eq('date', today)
    .order('meal_type', { ascending: true })

  if (error) {
    console.error('Meals fetch error:', error)
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
  }

  const meals = [
    { type: 'colazione', label: '🌅 Colazione' },
    { type: 'pranzo', label: '☀️ Pranzo' },
    { type: 'cena', label: '🌙 Cena' }
  ]

  const mealData = meals.map(m => {
    const existing = data?.find(d => d.meal_type === m.type)
    return {
      type: m.type,
      label: m.label,
      status: existing?.status || null
    }
  })

  const good = data?.filter(d => d.status === 'good').length || 0
  const bad = data?.filter(d => d.status === 'bad').length || 0

  return NextResponse.json({
    ok: true,
    meals: mealData,
    summary: { good, bad }
  })
}

export async function POST(request) {
  const userId = process.env.USER_ID || 'default-user'
  const { mealType, status } = await request.json()
  const today = new Date().toISOString().split('T')[0]

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

  if (error) {
    console.error('Meal save error:', error)
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
