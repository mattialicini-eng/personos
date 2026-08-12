import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

export async function GET(request) {
  const userId = process.env.USER_ID || 'default-user'

  try {
    const { data, error } = await supabase
      .from('goals')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw error

    return NextResponse.json({
      ok: true,
      goals: data || []
    })
  } catch (error) {
    console.error('Goals fetch error:', error)
    return NextResponse.json({
      ok: true,
      goals: []
    })
  }
}

export async function POST(request) {
  const userId = process.env.USER_ID || 'default-user'
  const { title, deadline } = await request.json()

  if (!title) {
    return NextResponse.json({ ok: false, error: 'Title required' }, { status: 400 })
  }

  try {
    const { data, error } = await supabase
      .from('goals')
      .insert({
        user_id: userId,
        title,
        deadline,
        completed: false,
        created_at: new Date().toISOString()
      })
      .select()

    if (error) throw error

    return NextResponse.json({ ok: true, goal: data?.[0] })
  } catch (error) {
    console.error('Goal save error:', error)
    return NextResponse.json({ ok: true })
  }
}

export async function PUT(request) {
  const userId = process.env.USER_ID || 'default-user'
  const { id, completed, title, deadline } = await request.json()

  try {
    const { error } = await supabase
      .from('goals')
      .update({
        completed,
        title,
        deadline
      })
      .eq('id', id)
      .eq('user_id', userId)

    if (error) throw error

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Goal update error:', error)
    return NextResponse.json({ ok: true })
  }
}

export async function DELETE(request) {
  const userId = process.env.USER_ID || 'default-user'
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')

  try {
    const { error } = await supabase
      .from('goals')
      .delete()
      .eq('id', id)
      .eq('user_id', userId)

    if (error) throw error

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Goal delete error:', error)
    return NextResponse.json({ ok: true })
  }
}
