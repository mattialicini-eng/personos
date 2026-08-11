import { NextResponse } from 'next/server'
import { getProfile, updateProfile } from '@/lib/store'

export async function POST(request) {
  try {
    // Check if profile already exists
    const existing = await getProfile()

    if (existing) {
      return NextResponse.json({
        ok: true,
        message: 'Profile already initialized',
        profile: existing
      })
    }

    // Get seed data
    const seedPath = require('path').join(process.cwd(), 'data/seed.json')
    const seed = JSON.parse(require('fs').readFileSync(seedPath, 'utf-8'))

    // Insert profile with user_id from env
    const profile = {
      user_id: process.env.USER_ID || 'default-user',
      name: seed.profile.name,
      role: seed.profile.role,
      city: seed.profile.city,
      focus: seed.profile.focus,
      habits: seed.profile.habits,
      calorie_goal: seed.profile.calorieGoal
    }

    const result = await updateProfile(profile)

    return NextResponse.json({
      ok: true,
      message: 'Profile initialized',
      profile: result
    })
  } catch (error) {
    console.error('Init error:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const profile = await getProfile()

    if (!profile) {
      return NextResponse.json({
        ok: false,
        message: 'Profile not initialized. Call POST /api/init to initialize.'
      })
    }

    return NextResponse.json({
      ok: true,
      profile
    })
  } catch (error) {
    console.error('Get profile error:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
