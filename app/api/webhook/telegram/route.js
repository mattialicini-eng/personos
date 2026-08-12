import { NextResponse } from 'next/server'
import { createCapture, createTask, getProfile, getTasks } from '@/lib/store'
import OpenAI from 'openai'
import https from 'https'

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN
const TELEGRAM_API = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}`

async function downloadFile(fileId) {
  try {
    console.log(`[TELEGRAM] Downloading file: ${fileId}`)
    const fileInfoResponse = await fetch(`${TELEGRAM_API}/getFile?file_id=${fileId}`)
    const fileInfo = await fileInfoResponse.json()

    if (!fileInfo.ok) {
      console.error('[TELEGRAM] getFile failed:', fileInfo)
      return null
    }

    const filePath = fileInfo.result.file_path
    const fileUrl = `https://api.telegram.org/file/bot${TELEGRAM_BOT_TOKEN}/${filePath}`
    console.log(`[TELEGRAM] File URL: ${fileUrl}`)

    const response = await fetch(fileUrl)
    if (!response.ok) {
      console.error('[TELEGRAM] Download failed:', response.status)
      return null
    }

    const buffer = await response.arrayBuffer()
    console.log(`[TELEGRAM] Downloaded ${buffer.byteLength} bytes`)
    return Buffer.from(buffer)
  } catch (error) {
    console.error('[TELEGRAM] Download error:', error)
    return null
  }
}

async function transcribeAudio(audioBuffer) {
  try {
    console.log(`[WHISPER] Starting transcription of ${audioBuffer.length} bytes`)
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
    console.log(`[WHISPER] Response:`, data)

    if (!response.ok) {
      console.error('[WHISPER] API error:', data)
      return null
    }

    console.log(`[WHISPER] Transcribed: "${data.text}"`)
    return data.text || null
  } catch (error) {
    console.error('[WHISPER] Transcription error:', error)
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
    const userId = process.env.USER_ID || 'default-user'
    let captureText = null

    // Handle commands
    if (message.text?.startsWith('/')) {
      const [command, ...args] = message.text.split(' ')

      if (command === '/task') {
        const title = args.join(' ')
        if (!title) {
          await sendMessage(chatId, '❌ Uso: /task <titolo>')
          return NextResponse.json({ ok: true })
        }
        const task = await createTask({
          user_id: userId,
          title,
          urgency: 'normal',
          priority: 'medium',
          tags: ['telegram']
        })
        if (task) {
          await sendMessage(chatId, `✅ Task creato: "${title}"`)
        } else {
          await sendMessage(chatId, '❌ Errore nel salvataggio del task')
        }
        return NextResponse.json({ ok: true })
      }

      if (command === '/status') {
        const profile = await getProfile(userId)
        const tasks = await getTasks(userId)
        const activeTasks = tasks.filter(t => t.status !== 'completed')

        const status = `📊 Status PersonOS\n\n` +
          `🎯 Focus: ${profile?.focus || '-'}\n` +
          `📋 Task attivi: ${activeTasks.length}\n` +
          `✅ Task completati: ${tasks.filter(t => t.status === 'completed').length}\n` +
          `📍 Città: ${profile?.city || '-'}`

        await sendMessage(chatId, status)
        return NextResponse.json({ ok: true })
      }

      if (command === '/addfocus') {
        const title = args.join(' ')
        if (!title) {
          await sendMessage(chatId, '❌ Uso: /addfocus <titolo>')
          return NextResponse.json({ ok: true })
        }

        try {
          const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/focus`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title, priority: 1 })
          })
          const data = await res.json()
          if (data.ok) {
            await sendMessage(chatId, `✅ Focus aggiunto: "${title}"`)
          } else {
            await sendMessage(chatId, '❌ Errore nel salvataggio')
          }
        } catch (err) {
          await sendMessage(chatId, '❌ Errore: ' + err.message)
        }
        return NextResponse.json({ ok: true })
      }

      if (command === '/focuslist') {
        try {
          const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/focus?status=active`)
          const data = await res.json()
          if (data.ok && data.focus.length > 0) {
            const list = data.focus.map(f => `• ${f.title}`).join('\n')
            await sendMessage(chatId, `🎯 Focus attivi:\n\n${list}`)
          } else {
            await sendMessage(chatId, '📭 Nessun focus attivo')
          }
        } catch (err) {
          await sendMessage(chatId, '❌ Errore: ' + err.message)
        }
        return NextResponse.json({ ok: true })
      }

      if (command === '/addtodo') {
        const title = args.join(' ')
        if (!title) {
          await sendMessage(chatId, '❌ Uso: /addtodo <titolo>')
          return NextResponse.json({ ok: true })
        }

        try {
          const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/todo`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title, source: 'telegram' })
          })
          const data = await res.json()
          if (data.ok) {
            await sendMessage(chatId, `✅ Task aggiunto: "${title}"`)
          } else {
            await sendMessage(chatId, '❌ Errore nel salvataggio')
          }
        } catch (err) {
          await sendMessage(chatId, '❌ Errore: ' + err.message)
        }
        return NextResponse.json({ ok: true })
      }

      if (command === '/todolist') {
        try {
          const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/todo?status=pending`)
          const data = await res.json()
          if (data.ok && data.todo.length > 0) {
            const list = data.todo.map((t, i) => `${i + 1}. ${t.title}`).join('\n')
            await sendMessage(chatId, `✓ To Do List:\n\n${list}`)
          } else {
            await sendMessage(chatId, '✨ Nessun task in lista!')
          }
        } catch (err) {
          await sendMessage(chatId, '❌ Errore: ' + err.message)
        }
        return NextResponse.json({ ok: true })
      }

      if (command === '/help') {
        const help = `🤖 PersonOS Telegram Bot\n\n` +
          `Comandi disponibili:\n` +
          `/task <titolo> - Crea nuovo task\n` +
          `/addtodo <titolo> - Aggiungi to do\n` +
          `/todolist - Mostra to do list\n` +
          `/addfocus <titolo> - Aggiungi focus\n` +
          `/focuslist - Mostra focus attivi\n` +
          `/status - Mostra focus e task\n` +
          `/help - Mostra questo messaggio\n\n` +
          `Invia testo o voce per catturare note`

        await sendMessage(chatId, help)
        return NextResponse.json({ ok: true })
      }

      await sendMessage(chatId, '❓ Comando non riconosciuto. Usa /help per i comandi')
      return NextResponse.json({ ok: true })
    }

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
      user_id: userId,
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
