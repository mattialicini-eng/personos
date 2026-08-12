import { NextResponse } from 'next/server'
import { searchMemory, createMemory } from '@/lib/store'
import OpenAI from 'openai'

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

export async function POST(request) {
  try {
    const { query, limit = 5 } = await request.json()

    if (!query || query.trim().length === 0) {
      return NextResponse.json(
        { error: 'Query is required' },
        { status: 400 }
      )
    }

    // Get embedding from OpenAI
    const embeddingResponse = await client.embeddings.create({
      model: 'text-embedding-3-small',
      input: query
    })

    const embedding = embeddingResponse.data[0].embedding

    // Search in database
    const results = await searchMemory(embedding, limit)

    return NextResponse.json({
      ok: true,
      query,
      results,
      count: results.length
    })
  } catch (error) {
    console.error('Memory search error:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({ error: 'Use POST' }, { status: 405 })
}
