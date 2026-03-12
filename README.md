# WWE 2K26 Universe Planner

A Vite + React web app with a custom username/password auth system and multiple cloud save slots for WWE 2K26 Universe planning.

## What changed

This version no longer uses Supabase Auth.

Instead it uses:
- a custom `app_users` table
- hashed passwords with `bcryptjs`
- signed HttpOnly session cookies
- Vercel serverless API routes
- Supabase only as the database

That means users can sign up with only:
- username
- password

No personal email address is required.

## Features

- username + password registration
- login/logout
- multiple universe save slots per user
- guest local save mode
- brand split manager
- roster editor
- title assignment
- rivalry tracker
- weekly card builder
- JSON import/export

## Local development

1. Copy `.env.example` to `.env`
2. Fill in the environment variables
3. Install dependencies
4. Start the app

```bash
cp .env.example .env
npm install
npm run dev
```

Frontend runs on `http://localhost:5173`
Backend API runs on `http://localhost:3001`

## Required environment variables

```env
SUPABASE_URL=https://YOUR_PROJECT.supabase.co
SUPABASE_SERVICE_ROLE_KEY=YOUR_SUPABASE_SERVICE_ROLE_KEY
APP_JWT_SECRET=replace-this-with-a-long-random-secret
```

## Supabase setup

Open Supabase SQL Editor and run:

```sql
-- file: supabase/schema.sql
```

This creates:
- `app_users`
- `universes`

## Deploy to Vercel

1. Push the repo to GitHub
2. Import the repo into Vercel
3. Add the three environment variables in Vercel
4. Deploy

### Vercel environment variables

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `APP_JWT_SECRET`

## Important

- Never commit `.env`
- Never expose `SUPABASE_SERVICE_ROLE_KEY` in frontend code
- Rotate your old public key if you want, but this version does not need it anymore
