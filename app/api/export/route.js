import { NextResponse } from 'next/server'
import { getProfile, getTasks, getPeople, getDailyLogs, getMemory } from '@/lib/store'

function convertToCSV(data, headers) {
  if (!data || data.length === 0) return ''

  const csvHeaders = headers.join(',')
  const csvRows = data.map(item => {
    return headers.map(header => {
      const value = item[header]
      if (value === null || value === undefined) return ''
      if (typeof value === 'object') return JSON.stringify(value).replace(/"/g, '""')
      return String(value).replace(/"/g, '""').includes(',') ? `"${value}"` : value
    }).join(',')
  })

  return [csvHeaders, ...csvRows].join('\n')
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const format = searchParams.get('format') || 'json' // json or csv
    const type = searchParams.get('type') || 'all' // all, tasks, people, memory, daily, profile
    const userId = process.env.USER_ID || 'default-user'

    const data = {}

    // Fetch data based on type
    if (type === 'all' || type === 'profile') {
      const profile = await getProfile(userId)
      if (profile) data.profile = profile
    }

    if (type === 'all' || type === 'tasks') {
      const tasks = await getTasks(userId)
      data.tasks = tasks
    }

    if (type === 'all' || type === 'people') {
      const people = await getPeople(userId)
      data.people = people
    }

    if (type === 'all' || type === 'memory') {
      const memories = await getMemory(userId)
      data.memory = memories
    }

    if (type === 'all' || type === 'daily') {
      const dailyLogs = await getDailyLogs(userId)
      data.daily = dailyLogs
    }

    if (format === 'json') {
      const filename = `personos-export-${new Date().toISOString().split('T')[0]}.json`
      const response = new NextResponse(JSON.stringify(data, null, 2))
      response.headers.set('Content-Type', 'application/json')
      response.headers.set('Content-Disposition', `attachment; filename="${filename}"`)
      return response
    }

    if (format === 'csv') {
      // For CSV, we export each data type as separate sections
      let csvContent = ''

      if (data.profile) {
        csvContent += '# PROFILE\n'
        csvContent += convertToCSV([data.profile], Object.keys(data.profile)) + '\n\n'
      }

      if (data.tasks && data.tasks.length > 0) {
        csvContent += '# TASKS\n'
        const taskHeaders = ['id', 'title', 'urgency', 'priority', 'status', 'due_date', 'person_id', 'tags']
        csvContent += convertToCSV(data.tasks, taskHeaders) + '\n\n'
      }

      if (data.people && data.people.length > 0) {
        csvContent += '# PEOPLE\n'
        const peopleHeaders = ['id', 'name', 'organization', 'type', 'metadata']
        csvContent += convertToCSV(data.people, peopleHeaders) + '\n\n'
      }

      if (data.memory && data.memory.length > 0) {
        csvContent += '# MEMORY\n'
        const memoryHeaders = ['id', 'text', 'source', 'created_at', 'metadata']
        csvContent += convertToCSV(data.memory, memoryHeaders) + '\n\n'
      }

      if (data.daily && data.daily.length > 0) {
        csvContent += '# DAILY LOGS\n'
        const dailyHeaders = ['date', 'habits', 'meals', 'goals', 'finance', 'notes']
        csvContent += convertToCSV(data.daily, dailyHeaders) + '\n\n'
      }

      const filename = `personos-export-${new Date().toISOString().split('T')[0]}.csv`
      const response = new NextResponse(csvContent)
      response.headers.set('Content-Type', 'text/csv; charset=utf-8')
      response.headers.set('Content-Disposition', `attachment; filename="${filename}"`)
      return response
    }

    return NextResponse.json(
      { error: 'Format non supportato (use json or csv)' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Export error:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
