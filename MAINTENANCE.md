# Sasquatch Wilderness Maintenance Guide

This guide keeps your site reliable and easy to update.

## Quick Command

Run a full health check anytime:

- npm run health

This validates required files, Node/npm availability, production build, hostname resolution, and local HTTPS reachability.

## 1) Important Reality Check

Your current site runs locally from your machine.

- If the local server is stopped, the site stops.
- If VS Code is closed and no server process is running, the site stops.
- If your PC is shut down, the site stops.

If you want 24/7 uptime, deploy to a hosting provider.

## 2) Weekly Maintenance

1. Start and verify locally.
   - Run: npm run dev
   - Open: https://sasquatchwilderness/
   - Confirm:
     - Category buttons load
     - Wipe dropdown opens and switches
     - Player table fills with live data
2. Validate production build.
   - Run: npm run build
   - Fix any errors before making additional changes.
3. Quick UI check on desktop and mobile widths.
   - Header and logo
   - Category arrows
   - Wipe menu
   - Table readability

## 3) Monthly Maintenance

1. Update packages.
   - Run: npm outdated
   - Run: npm update
   - Run: npm run build
2. Validate API behavior.
   - Check that totals and leaderboard still load.
   - Confirm category columns still map correctly.
3. Check local HTTPS trust and hostname behavior.
   - Open https://sasquatchwilderness/
   - Confirm browser security icon is normal.

## 4) Safe Change Workflow

1. Make small edits.
2. Run: npm run build
3. Run: npm run dev
4. Verify the specific feature you changed.
5. Commit with a clear message.

## 5) File Ownership Map

- index.html: Structure and controls markup
- styles.css: Theme, layout, responsive styling
- app.js: API fetching, state, rendering, interactions
- vite.config.js: Dev server, proxy, custom host, HTTPS
- package.json: Scripts and dependencies

## 6) Troubleshooting

### A) Site does not load

1. Confirm dev server is running.
   - Command: npm run dev
2. Confirm hostname resolves.
   - Command: ping sasquatchwilderness
3. Confirm no conflicting app is using your dev port.

### B) Browser says Not Secure

1. Certificate may be missing or mismatched.
2. Recreate local cert setup used by Vite.
3. Ensure sasquatchwilderness is included in certificate hostnames.
4. Restart dev server and reload browser.

### C) Missing or wrong player data

1. Open browser devtools network tab.
2. Check responses from:
   - /api/leaderboard/wipes
   - /api/leaderboard/totals/{category}
   - /api/leaderboard
3. If API schema changed, update mapping logic in app.js.

### D) Wipe dropdown looks wrong or does not open

1. Check app.js for wipe menu open/close handlers.
2. Check styles.css for wipe picker and menu styles.
3. Hard refresh browser after changes.

### E) Category navigation arrows not behaving

1. Verify scroll container element exists.
2. Verify disabled-state update logic in app.js.
3. Check responsive CSS at narrow widths.

## 7) Backup and Recovery

1. Keep the project in Git.
2. Commit after each stable change.
3. Tag known-good versions.
4. Before big edits, create a branch.

## 8) Optional: 24/7 Hosting Path

If you want the site always online:

1. Push project to GitHub.
2. Deploy dist output through Vercel, Netlify, or Cloudflare Pages.
3. Add your public domain.
4. Keep this local setup for development and testing.
