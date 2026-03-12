# WWE 2K26 Universe & Creations Planner

A React + Vite companion app for WWE 2K26 players who want to manage rosters, brands, titles, rivalries, and weekly cards.

This version supports:
- guest mode with browser localStorage
- username + password profiles backed by Supabase Auth
- multiple per-user cloud save slots in Supabase
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
4. In **Authentication > Email**, turn **Confirm email** off for this username-only flow.
5. In **Authentication > URL Configuration**, add:
   - `http://localhost:5173`
   - your future Vercel production URL
6. Copy your project URL and publishable key.

### Why Email stays enabled

Supabase Auth requires an email-style identifier for password sign-in. This app does **not** ask users for a personal email address.
Instead, it converts the username into an internal synthetic login like:

```text
username@users.wwe2k26.local
```

That gives you username + password login without collecting personal contact info.

Create a local `.env` file:

```bash
cp .env.example .env
```

Then fill in:

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-publishable-key
```

## 3. Push changes to GitHub

Make sure `.env` is ignored.

```bash
git add .
git commit -m "Add username profiles and multiple universe slots"
git push
```

If `.env` was previously uploaded, remove it once:

```bash
git rm --cached .env
git add .gitignore
git commit -m "Remove env file from repository"
git push
```

## 4. Deploy to Vercel from GitHub

1. Sign in to Vercel.
2. Click **Add New → Project**.
3. Import your GitHub repo.
4. Vercel should detect **Vite** automatically.
5. Add these environment variables in the Vercel project settings:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
6. Deploy.

## 5. Required Vercel environment variables

In Vercel → Project Settings → Environment Variables:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

After deployment, copy your Vercel production URL and add it in Supabase Auth URL settings as a valid Site URL / redirect origin.

## 6. Build manually

```bash
npm run build
```

## 7. Notes

- Guest users save only in their current browser.
- Signed-in users can create multiple universe save slots.
- Each save slot can hold its own brands, roster, rivalries, championships, and cards.
