import { NextResponse } from 'next/server'
import { createCapture } from '@/lib/store'
import OpenAI from 'openai'
import https from 'https'

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN
const TELEGRAM_API = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}`

async function downloadFile(fileId) {
  try {
    const fileInfoResponse = await fetch(`${TELEGRAM_API}/getFile?file_id=${fileId}`)
    const fileInfo = await fileInfoResponse.json()

    if (!fileInfo.ok) return null

    const filePath = fileInfo.result.file_path
    const fileUrl = `https://api.telegram.org/file/bot${TELEGRAM_BOT_TOKEN}/${filePath}`

    const response = await fetch(fileUrl)
    return await response.buffer()
  } catch (error) {
    console.error('Download error:', error)
    return null
  }
}

async function transcribeAudio(audioBuffer) {
  try {
    const formData = new FormData()
    formData.append('file', new Blob([audioBuffer], { type: 'audio/ogg' }), 'audio.ogg')
    formData.append('model', 'whisper-1')
    formData.append('language', 'it')

    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: formData
    })

    const data = await response.json()
    return data.text || null
  } catch (error) {
    console.error('Transcription error:', error)
    return null
  }
}

async function sendMessage(chatId, text) {
  try {
    await fetch(`${TELEGRAM_API}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: text
      })
    })
  } catch (error) {
    console.error('Send message error:', error)
  }
}

export async function POST(request) {
  try {
    const update = await request.json()

    if (!update.message) {
      return NextResponse.json({ ok: true })
    }

    const message = update.message
    const chatId = message.chat.id
    let captureText = null

    // Handle text message
    if (message.text) {
      captureText = message.text
    }
    // Handle voice message
    else if (message.voice) {
      const audioBuffer = await downloadFile(message.voice.file_id)
      if (audioBuffer) {
        captureText = await transcribeAudio(audioBuffer)
      }
    }

    if (!captureText) {
      await sendMessage(chatId, '❌ Non riesco a elaborare il messaggio')
      return NextResponse.json({ ok: true })
    }

    // Save capture
    const capture = await createCapture({
      user_id: process.env.USER_ID || 'default-user',
      text: captureText,
      source: 'telegram',
      classification: null,
      destination: null,
      classification_method: 'telegram',
      metadata: {
        chat_id: chatId,
        message_id: message.message_id
      }
    })

    if (capture) {
      await sendMessage(chatId, `✅ Catturato: "${captureText.substring(0, 50)}..."`)
    } else {
      await sendMessage(chatId, '❌ Errore nel salvataggio')
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json({ ok: true }) // Always return ok to Telegram
  }
}

export async function GET() {
  return NextResponse.json({ message: 'Webhook active' })
}
