# WWE 2K26 Universe & Creations Planner

A React + Vite starter web app for managing a WWE 2K26 custom universe.

## What it includes

- Brand split management
- Roster editor with alignment and division tracking
- Championship assignment
- Rivalry tracker
- Weekly card builder
- Local save via browser localStorage
- JSON import/export for backups or migration later

## Why this stack

I chose **React + Vite** because it is:

- fast to run locally
- simple to deploy
- easy to host on shared hosting, VPS, or a static host
- a clean base if you later want to add Supabase, authentication, or a backend API

## Local setup

1. Install Node.js 20 or newer.
2. Open a terminal inside the project folder.
3. Run:

```bash
npm install
npm run dev
```

4. Open the local address shown in the terminal.

## Production build

```bash
npm run build
```

That creates a `dist` folder with the production-ready site.

## Upload to GitHub

### First-time repo setup

Create a new empty GitHub repository, then in the project folder run:

```bash
git init
git add .
git commit -m "Initial commit: WWE 2K26 universe planner"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

### Future updates

```bash
git add .
git commit -m "Describe your changes"
git push
```

## Deploy to a server

You have two easy options.

### Option A: Static hosting or shared hosting

Best if your server can host plain HTML/CSS/JS files.

1. Run:

```bash
npm run build
```

2. Upload everything inside the `dist` folder to your server's public web folder.
   Common examples:
   - `public_html/`
   - `www/`
   - `htdocs/`

3. Your site will load immediately because this MVP is fully static.

### Option B: VPS with Nginx

Best if you want a more professional setup.

Build locally first:

```bash
npm run build
```

Then upload the `dist` folder to your server, for example to:

```bash
/var/www/wwe2k26-planner
```

Example Nginx server block:

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    root /var/www/wwe2k26-planner;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

Then reload Nginx:

```bash
sudo nginx -t
sudo systemctl reload nginx
```

## Suggested next upgrades

- Supabase database and login
- Shared universes per user
- Draft simulator
- Mod compatibility section
- Community Creations collection tracker
- Export to printable PDF or image card

## Recommended project structure later

- `src/components` for UI pieces
- `src/lib` for storage and helper logic
- `src/data` for presets
- `src/pages` if you later expand into multiple screens

## Notes

This starter app currently stores everything in the browser. That makes it easy to test and host right away, but each browser/device keeps its own data until you add a backend.
