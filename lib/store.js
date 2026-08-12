import { createClient } from '@supabase/supabase-js'

if (!process.env.SUPABASE_URL) {
  throw new Error('SUPABASE_URL env variable is required')
}
if (!process.env.SUPABASE_SERVICE_KEY) {
  throw new Error('SUPABASE_SERVICE_KEY env variable is required')
}

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
)

// Profile functions
export async function getProfile() {
  const { data, error } = await supabase
    .from('profile')
    .select('*')
    .single()

  if (error) {
    console.error('Error fetching profile:', error)
    return null
  }
  return data
}

export async function updateProfile(updates) {
  const { data, error } = await supabase
    .from('profile')
    .upsert({
      id: 1,
      ...updates
    })
    .select()
    .single()

  if (error) {
    console.error('Error updating profile:', error)
    return null
  }
  return data
}

// Captures functions
export async function getCaptures(limit = 100) {
  const { data, error } = await supabase
    .from('captures')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Error fetching captures:', error)
    return []
  }
  return data
}

export async function createCapture(capture) {
  const { data, error } = await supabase
    .from('captures')
    .insert([capture])
    .select()
    .single()

  if (error) {
    console.error('Error creating capture:', error)
    return null
  }
  return data
}

// Tasks functions
export async function getTasks() {
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .order('urgency', { ascending: true })

  if (error) {
    console.error('Error fetching tasks:', error)
    return []
  }
  return data
}

export async function createTask(task) {
  const { data, error } = await supabase
    .from('tasks')
    .insert([task])
    .select()
    .single()

  if (error) {
    console.error('Error creating task:', error)
    return null
  }
  return data
}

export async function updateTask(id, updates) {
  const { data, error } = await supabase
    .from('tasks')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating task:', error)
    return null
  }
  return data
}

// People functions
export async function getPeople() {
  const { data, error } = await supabase
    .from('people')
    .select('*')

  if (error) {
    console.error('Error fetching people:', error)
    return []
  }
  return data
}

export async function createPerson(person) {
  const { data, error } = await supabase
    .from('people')
    .insert([person])
    .select()
    .single()

  if (error) {
    console.error('Error creating person:', error)
    return null
  }
  return data
}

// Daily logs functions
export async function getDailyLog(date) {
  const { data, error } = await supabase
    .from('daily_logs')
    .select('*')
    .eq('date', date)
    .single()

  if (error?.code === 'PGRST116') {
    return null
  }
  if (error) {
    console.error('Error fetching daily log:', error)
    return null
  }
  return data
}

export async function getDailyLogs(startDate, endDate) {
  const { data, error } = await supabase
    .from('daily_logs')
    .select('*')
    .gte('date', startDate)
    .lte('date', endDate)
    .order('date', { ascending: false })

  if (error) {
    console.error('Error fetching daily logs:', error)
    return []
  }
  return data
}

export async function upsertDailyLog(date, log) {
  const { data, error } = await supabase
    .from('daily_logs')
    .upsert({
      date,
      ...log
    })
    .select()
    .single()

  if (error) {
    console.error('Error upserting daily log:', error)
    return null
  }
  return data
}

// Memory functions
export async function getMemory(limit = 100) {
  const { data, error } = await supabase
    .from('memory')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Error fetching memory:', error)
    return []
  }
  return data
}

export async function createMemory(entry) {
  const { data, error } = await supabase
    .from('memory')
    .insert([entry])
    .select()
    .single()

  if (error) {
    console.error('Error creating memory entry:', error)
    return null
  }
  return data
}

export async function searchMemory(embedding, limit = 5) {
  const { data, error } = await supabase
    .rpc('match_memory', {
      query_embedding: embedding,
      match_count: limit
    })

  if (error) {
    console.error('Error searching memory:', error)
    return []
  }
  return data
}

// Registry functions
export async function addRegistry(entry) {
  const { data, error } = await supabase
    .from('registry')
    .insert([entry])
    .select()
    .single()

  if (error) {
    console.error('Error adding registry entry:', error)
    return null
  }
  return data
}

export async function getRegistry() {
  const { data, error } = await supabase
    .from('registry')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching registry:', error)
    return []
  }
  return data
}
