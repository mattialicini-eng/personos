import { NextResponse } from 'next/server'
import { createCapture } from '@/lib/store'
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic()

const DESTINATIONS = {
  task: 'tasks',
  person: 'people',
  finance: 'finance',
  habit: 'habits',
  memory: 'memory',
  health: 'health'
}

async function classifyCapture(text) {
  try {
    const response = await client.messages.create({
      model: process.env.ANTHROPIC_MODEL || 'claude-3-5-sonnet-20241022',
      max_tokens: 200,
      messages: [
        {
          role: 'user',
          content: `Classifica questa nota in una categoria. Rispondi SOLO con il JSON e nulla altro.

Nota: "${text}"

Rispondi con JSON:
{"category": "task|person|finance|habit|memory|health", "confidence": 0.0-1.0}

Esempi:
- "Ricorda di chiamare Marco" → {"category": "person", "confidence": 0.95}
- "Speso 50€ per la cena" → {"category": "finance", "confidence": 0.9}
- "Meditazione 10 minuti" → {"category": "habit", "confidence": 0.85}
- "Ricordare l'algoritmo di Dijkstra" → {"category": "memory", "confidence": 0.8}`
        }
      ]
    })

    const content = response.content[0].text
    const parsed = JSON.parse(content)
    return parsed
  } catch (error) {
    console.error('Classification error:', error)
    // Fallback to regex if Claude fails
    return classifyByRegex(text)
  }
}

function classifyByRegex(text) {
  const lower = text.toLowerCase()

  if (/euro|€|\$|soldi|speso|costo|pagare|fattura/.test(lower)) {
    return { category: 'finance', confidence: 0.6 }
  }
  if (/richiam|contatt|chiamare|mail|whatsapp|messag/.test(lower)) {
    return { category: 'person', confidence: 0.6 }
  }
  if (/medita|yoga|eserciz|corsa|palestra|workout/.test(lower)) {
    return { category: 'habit', confidence: 0.6 }
  }
  if (/ricord|imparare|sapere|come|cosa|perch/.test(lower)) {
    return { category: 'memory', confidence: 0.5 }
  }
  if (/fare|todo|task|compito|completare/.test(lower)) {
    return { category: 'task', confidence: 0.6 }
  }

  return { category: 'memory', confidence: 0.3 }
}

export async function POST(request) {
  try {
    const { text, source = 'dashboard' } = await request.json()

    if (!text || text.trim().length === 0) {
      return NextResponse.json(
        { error: 'Text is required' },
        { status: 400 }
      )
    }

    // Classify the capture
    const classification = await classifyCapture(text)

    // Create capture record
    const capture = await createCapture({
      user_id: process.env.USER_ID || 'default-user',
      text: text.trim(),
      source,
      classification: classification.category,
      destination: DESTINATIONS[classification.category] || 'memory',
      classification_method: 'claude',
      metadata: {
        confidence: classification.confidence,
        timestamp: new Date().toISOString()
      }
    })

    return NextResponse.json({
      ok: true,
      capture,
      classification
    })
  } catch (error) {
    console.error('Capture error:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 })
}
