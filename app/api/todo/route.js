import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

const userId = process.env.USER_ID || 'default-user'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') || 'pending'

    const { data, error } = await supabase
      .from('todo_items')
      .select('*')
      .eq('user_id', userId)
      .eq('status', status)
      .order('priority', { ascending: false })
      .order('created_at', { ascending: false })

    if (error) throw error

    return NextResponse.json({ ok: true, todo: data })
  } catch (error) {
    console.error('Todo fetch error:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}

export async function POST(request) {
  try {
    const { title, source, category } = await request.json()

    if (!title) {
      return NextResponse.json(
        { error: 'Titolo richiesto' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('todo_items')
      .insert({
        user_id: userId,
        title,
        status: 'pending',
        source: source || 'dashboard',
        category: category || 'Sikuro'
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ ok: true, todo: data })
  } catch (error) {
    console.error('Todo create error:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}

export async function PUT(request) {
  try {
    const { id, status, priority, title } = await request.json()

    if (!id) {
      return NextResponse.json(
        { error: 'ID richiesto' },
        { status: 400 }
      )
    }

    const updateData = {}
    if (status) updateData.status = status
    if (priority !== undefined) updateData.priority = priority
    if (title) updateData.title = title
    if (status === 'completed') updateData.completed_at = new Date().toISOString()

    const { data, error } = await supabase
      .from('todo_items')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ ok: true, todo: data })
  } catch (error) {
    console.error('Todo update error:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'ID richiesto' },
        { status: 400 }
      )
    }

    const { error } = await supabase
      .from('todo_items')
      .delete()
      .eq('id', id)
      .eq('user_id', userId)

    if (error) throw error

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Todo delete error:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
