import { NextResponse } from 'next/server'
import { getProfile, getTasks, getDailyLog } from '@/lib/store'

function generateBriefingHtml(profile, today, tasks, dailyLog) {
  const date = new Date(today).toLocaleDateString('it-IT', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

  const habits = dailyLog?.habits || []
  const meals = dailyLog?.meals || []
  const finance = dailyLog?.finance || {}
  const goals = dailyLog?.goals || []

  const activeTasks = tasks.filter(t => t.status !== 'completed').slice(0, 5)
  const completedToday = tasks.filter(t => t.status === 'completed').length

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px; }
        .section { margin: 20px 0; padding: 15px; background: #f5f5f5; border-radius: 8px; }
        .section h2 { margin-top: 0; color: #667eea; font-size: 18px; }
        .metric { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #ddd; }
        .metric-value { font-weight: bold; color: #667eea; }
        .task { padding: 8px 0; display: flex; justify-content: space-between; }
        .task-priority { font-size: 12px; background: #667eea; color: white; padding: 2px 6px; border-radius: 3px; }
        .footer { text-align: center; color: #999; font-size: 12px; margin-top: 20px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>📊 PersonOS Briefing</h1>
          <p>${date}</p>
        </div>

        <div class="section">
          <h2>🎯 Oggi</h2>
          <div class="metric">
            <span>Focus:</span>
            <span class="metric-value">${profile?.focus || '-'}</span>
          </div>
          <div class="metric">
            <span>Task completati:</span>
            <span class="metric-value">${completedToday}</span>
          </div>
          <div class="metric">
            <span>Task attivi:</span>
            <span class="metric-value">${activeTasks.length}</span>
          </div>
        </div>

        ${habits.length > 0 ? `
        <div class="section">
          <h2>✨ Abitudini</h2>
          ${habits.map(h => `<div class="metric"><span>${h.name}</span><span class="metric-value">${h.completed ? '✅' : '⏳'}</span></div>`).join('')}
        </div>
        ` : ''}

        ${activeTasks.length > 0 ? `
        <div class="section">
          <h2>📋 Prossimi Task</h2>
          ${activeTasks.map(t => `
            <div class="task">
              <span>${t.title}</span>
              <span class="task-priority">${t.urgency || 'normal'}</span>
            </div>
          `).join('')}
        </div>
        ` : ''}

        ${meals.length > 0 ? `
        <div class="section">
          <h2>🍽️ Nutrizione</h2>
          <div class="metric">
            <span>Calorie:</span>
            <span class="metric-value">${dailyLog?.notes?.calories || '0'} / ${profile?.calorie_goal || 2000}</span>
          </div>
        </div>
        ` : ''}

        ${finance?.expenses ? `
        <div class="section">
          <h2>💰 Finanze</h2>
          <div class="metric">
            <span>Spese oggi:</span>
            <span class="metric-value">€${finance.expenses}</span>
          </div>
        </div>
        ` : ''}

        <div class="footer">
          <p>PersonOS • ${new Date().getFullYear()}</p>
        </div>
      </div>
    </body>
    </html>
  `
}

export async function POST(request) {
  try {
    const { userId, email, date } = await request.json()

    if (!userId || !email) {
      return NextResponse.json(
        { error: 'userId e email richiesti' },
        { status: 400 }
      )
    }

    const today = date || new Date().toISOString().split('T')[0]

    const profile = await getProfile(userId)
    const tasks = await getTasks(userId)
    const dailyLog = await getDailyLog(userId, today)

    const html = generateBriefingHtml(profile, today, tasks, dailyLog)

    console.log(`[BRIEFING] Generated for ${email} on ${today}`)
    console.log(`[BRIEFING_HTML]\n${html}`)

    return NextResponse.json({
      ok: true,
      message: 'Briefing generato',
      email,
      date: today,
      html
    })
  } catch (error) {
    console.error('Briefing error:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
