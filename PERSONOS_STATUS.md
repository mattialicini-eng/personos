# PersonOS - Session Status & Continuation Guide

## Project Info
- **Repo**: https://github.com/mattialicini-eng/personos
- **Deployment**: https://personos-eight.vercel.app
- **Last Commit**: Fix voice transcription with form-data package
- **Date**: 2026-08-12

## Architecture
- **Frontend**: Next.js 16, React hooks, vanilla CSS
- **Backend**: Vercel serverless
- **Database**: Supabase (Postgres + pgvector)
- **APIs**: Claude (classification), OpenAI (embeddings + Whisper), Microsoft Graph (calendar), Telegram Bot
- **Auth**: Password + Email OTP 2FA (via Resend)

## Environment Variables (Set in Vercel)
```
LOGIN_PASSWORD=<your-password>
AUTH_SECRET=dev-secret
ANTHROPIC_MODEL=claude-opus-4-1-20250805
USER_ID=default-user
ANTHROPIC_API_KEY=<sk-ant-...>
OPENAI_API_KEY=<sk-proj-...>
SUPABASE_URL=https://fjmcydjglblzmorwrgie.supabase.co
SUPABASE_SERVICE_KEY=<eyJhbGc...>
RESEND_API_KEY=<your-resend-key>
MICROSOFT_CLIENT_ID=7e431afe-0668-4885-9699-d181e5d8229d
MICROSOFT_CLIENT_SECRET=<your-microsoft-secret>
MICROSOFT_TENANT_ID=8d10e67c-2957-4d9f-b7f0-593a9aac5b4f
TELEGRAM_BOT_TOKEN=<your-telegram-token>
NEXT_PUBLIC_APP_URL=https://personos-eight.vercel.app
```

## Features Completed ✅
1. **Authentication**
   - 2FA with password + email OTP (Resend)
   - Endpoints: `/api/auth/request-code`, `/api/auth/verify-code`
   - Login page with 2-step flow

2. **Data Capture & Classification**
   - CaptureBar with text input
   - Claude API for intelligent classification (task/person/finance/habit/memory/health)
   - Telegram bot integration (text messages + voice transcription)

3. **Memory & Search**
   - Semantic search using pgvector
   - OpenAI text-embedding-3-small
   - Tab "Memoria" with search interface

4. **Calendar Integration**
   - Microsoft Graph OAuth
   - Sync calendar events (next 5 displayed in Home tab)
   - Auto-sync every 30 seconds

5. **Focus Management**
   - Dashboard form to add/complete/delete focus
   - Telegram: `/addfocus <text>`, `/focuslist`
   - Stores in `focus_items` table

6. **To Do Management**
   - Dashboard "To Do" tab
   - Add/complete/delete todos
   - Telegram: `/addtodo <text>`, `/todolist`
   - Stores in `todo_items` table with source tracking

7. **Morning Briefing**
   - `/api/briefing/generate` endpoint
   - Vercel cron daily at 8:00 AM
   - Email digest with summary (TODO: integrate real email sending)

8. **Data Export**
   - JSON/CSV export from menu
   - Endpoint: `/api/export`
   - Downloads all user data

9. **Telegram Bot Commands**
   - `/task <title>` - Create task
   - `/status` - Show profile summary
   - `/addfocus <text>` - Add focus
   - `/focuslist` - Show focus items
   - `/addtodo <text>` - Add todo
   - `/todolist` - Show todo items
   - `/help` - Show all commands

## Personalisation Done
- Name: Mattia
- Role: COO c/o Sikuro
- City: Alzano Lombardo
- Focus: Balance lavoro, crescita personale e fitness
- Habits: Lettura serale, Studio inglese 3x/week, Mangiare pulito, Allenamento palestra 3x/week, Corse 2x/week
- Calorie goal: 2000
- Email: m.licini@sikuro.eu

## Known Issues ⚠️
**Voice Transcription (IN PROGRESS)**
- Telegram voice messages return "Non riesco a elaborare il messaggio"
- Diagnosis: Whisper API error (FormData in Node.js serverless)
- Solution attempted: Switch to `form-data` package with Readable stream
- Status: Deploy in Vercel, needs testing
- Logs show: `[WHISPER] API error: { error: {...} }`

## Database Tables
1. `profile` - User profile (email, name, role, city, focus, habits, calorie_goal)
2. `captures` - Notes with classification (text, source, classification)
3. `tasks` - Task management (title, urgency, priority, status, person_id)
4. `people` - CRM contacts (name, organization, type, metadata)
5. `daily_logs` - Daily tracking (habits, meals, goals, finance, notes)
6. `memory` - Semantic memory (text, embedding vector, source, metadata)
7. `calendar_events` - Microsoft Calendar sync (title, start_time, end_time, attendees)
8. `focus_items` - Focus management (title, status, priority, source)
9. `todo_items` - Todo management (title, status, priority, source)
10. `auth_codes` - 2FA OTP codes (email, code, expires_at, used)
11. `microsoft_tokens` - OAuth tokens (access_token, refresh_token, expires_at)
12. `registry` - Activity log

## To Continue In Next Session

### Immediate Priority (Voice Fix)
1. Check Vercel logs for latest Whisper API error details
2. Verify OpenAI API key is valid and has quota
3. Possible fixes:
   - Use OpenAI client library instead of fetch
   - Check if form-data headers are correct
   - Verify audio buffer format (might need conversion)

### Optional Enhancements
1. Microsoft Mail integration (`/api/email/sync`)
2. MyFitnessPal via Zapier
3. UI improvements (settings page, custom themes)
4. Custom reminder times for weekly/monthly objectives
5. Backup system (daily snapshots to cloud)
6. Rate limiting on API endpoints

### Configuration Needed
1. Resend email sending (currently logs to console)
2. Morning briefing email integration
3. Session timeout logic
4. Optional: Custom briefing times

## Key Files Structure
```
app/
  ├── api/
  │   ├── auth/ (2FA, Microsoft OAuth)
  │   ├── capture/ (AI classification)
  │   ├── data/ (dashboard data)
  │   ├── memory/search/ (semantic search)
  │   ├── calendar/sync/ (Microsoft Calendar)
  │   ├── focus/ (focus CRUD)
  │   ├── todo/ (todo CRUD)
  │   ├── briefing/generate/ (email digest)
  │   ├── export/ (JSON/CSV)
  │   ├── cron/daily-briefing/ (scheduled cron)
  │   └── webhook/telegram/ (bot handler)
  ├── login/ (2FA login UI)
  └── layout.js (root layout)
components/
  ├── Dashboard.js (tab navigation)
  ├── Header.js (menu + export)
  ├── CaptureBar.js (text input)
  ├── FocusManager.js (focus form)
  ├── TodoManager.js (todo form)
  └── tabs/ (Home, CRM, Finance, Review, Memory)
lib/
  ├── store.js (Supabase CRUD)
  └── hooks.js (useData for dashboard)
data/
  └── seed.json (initial profile data)
```

## Last Working State
- Dashboard fully functional with all tabs
- Microsoft Calendar synced and displaying
- 2FA authentication working via email OTP
- Focus & Todo management UI complete
- Telegram bot responding to text commands
- Telegram voice messages failing (see Known Issues)

---
**Next Session Instructions:**
Paste this entire document + grep latest Vercel logs for Whisper error details. Focus on fixing voice transcription then proceed with optional enhancements.
