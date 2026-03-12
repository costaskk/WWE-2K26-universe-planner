# WWE 2K26 Universe & Creations Planner

React + Vite frontend with Vercel serverless API routes and Supabase Postgres storage.

## What changed in this build

- Custom username/password auth with no email field in the UI
- Multiple save slots per user
- Fancy success/error modals and toast messages
- Brand assignment checker for wrestlers
- Image URL support for wrestlers, brands, and PPV/show cards
- Better local dev script that starts both Vite and the API server
- Missing backend dependencies fixed (`bcryptjs`, `jose`)

## Local development

1. Copy `.env.example` to `.env`
2. Fill in the three environment variables
3. Install packages
4. Start both frontend and backend together

```bash
npm install
npm run dev
```

Frontend: `http://localhost:5173`
API: `http://localhost:3001`

## Environment variables

```env
SUPABASE_URL=https://YOUR_PROJECT.supabase.co
SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVICE_ROLE_KEY
APP_JWT_SECRET=make-this-a-long-random-secret
```

## Supabase SQL

Run `supabase/schema.sql` in the SQL editor.

## Vercel deployment

1. Push the project to GitHub
2. Import the repo into Vercel
3. Add these environment variables in Vercel Project Settings:
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `APP_JWT_SECRET`
4. Set Node.js version to `20.x`
5. Redeploy

## Important

Do not commit `.env` or your `SUPABASE_SERVICE_ROLE_KEY`.
