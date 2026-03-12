# WWE 2K26 Universe & Creations Planner

A React + Vite companion app for WWE 2K26 players who want to manage rosters, brands, titles, rivalries, and weekly cards.

This version supports:
- guest mode with browser localStorage
- email registration and login with Supabase Auth
- per-user cloud save storage in Supabase
- JSON import and export
- Vercel deployment from GitHub

## 1. Run locally

```bash
npm install
npm run dev
```

## 2. Create a Supabase project

1. Create a new project in Supabase.
2. In **SQL Editor**, run the contents of `supabase/schema.sql`.
3. In **Authentication > Providers**, keep Email enabled.
4. In **Authentication > URL Configuration**, add:
   - `http://localhost:5173`
   - your future Vercel production URL
5. Copy your project URL and anon key.

Create a local `.env` file:

```bash
cp .env.example .env
```

Then fill in:

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-public-anon-key
```

## 3. Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit: WWE 2K26 Universe Planner"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/wwe2k26-universe-planner.git
git push -u origin main
```

## 4. Deploy to Vercel from GitHub

This app is a good fit for Vercel. Vercel supports importing a GitHub repository and automatically deploying on each push, including branch preview deployments. Official docs: Vercel's Git deployment and import guides. citeturn907724search2turn907724search4

### Vercel steps

1. Sign in to Vercel.
2. Click **Add New → Project**.
3. Import your GitHub repo.
4. Vercel should detect **Vite** automatically.
5. Add these environment variables in the Vercel project settings:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
6. Deploy.

Vercel CLI is optional. The official docs also support deploying from the CLI with `vercel --prod`. citeturn907724search6turn907724search18

## 5. Required Vercel environment variables

In Vercel → Project Settings → Environment Variables:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

After deployment, copy your Vercel production URL and add it in Supabase Auth URL settings as a valid Site URL / redirect origin. Supabase's auth docs note that your app URL should be included in the auth configuration for browser-based login flows. citeturn907724search1turn907724search15

## 6. Build manually

```bash
npm run build
```

## 7. Notes

- Guest users save only in their current browser.
- Registered users get one cloud-synced universe in this MVP.
- You can expand this later into multiple universes, profile pages, shared leagues, or a community creations tracker.
