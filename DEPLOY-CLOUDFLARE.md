# Deploy Free (Cloudflare Pages)

This is the lowest-cost 24/7 setup for your project.

## Why this setup

- Hosting cost: usually free for this type of site.
- SSL: automatic HTTPS.
- Your app can keep calling `/api/...` and Cloudflare will proxy to `https://peanutswasteland.com/api/...`.

## 1) Push project to GitHub

1. Create a new GitHub repository.
2. Push this project to that repo.

## 2) Create Cloudflare Pages project

1. Go to Cloudflare Dashboard.
2. Pages -> Create a project -> Connect to Git.
3. Select your GitHub repo.
4. Build settings:
   - Framework preset: Vite
   - Build command: `npm run build`
   - Build output directory: `dist`

## 3) Deploy

1. Click Deploy.
2. Wait for build to finish.
3. Open your generated `*.pages.dev` URL.

## 4) Optional custom domain

1. In Pages project, go to Custom domains.
2. Add your domain.
3. Cloudflare will issue SSL automatically.

## 5) Verify after deploy

1. Category list loads.
2. Wipe dropdown works.
3. Leaderboard table fills with players.
4. Browser console has no failed `/api` calls.

## Notes

- Local dev still works with your current Vite proxy.
- Production uses Cloudflare Pages Functions in `functions/api/[[path]].js`.
