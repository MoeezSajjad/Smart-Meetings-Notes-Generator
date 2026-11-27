# Smart Meeting Notes frontend

A React, Vite and Tailwind application with a public example and an optional Firebase-authenticated workspace. The public sample uses fictional fixed content and works without Firebase or Groq. The signed-in view uses the backend for meeting lists, uploads and status.

## Local preview

Use Node.js 22.13 or later. From this directory run:

```sh
npm ci
npm test
npm run dev
```

Open http://localhost:3000/sample for the demonstration. Choose **Transcript**, **Key points** or **Action items**, then **Download notes** for a plain-text copy. Theme switching is available on every page.

To enable the live workspace, copy `.env.example` to `.env.local`, provide the Firebase web app settings and point `VITE_API_URL` to the backend. Restart Vite after changing settings. Use HTTPS for deployed APIs. The development server also permits HTTP localhost. Firebase **Email/Password** sign-in must be enabled. Production processing requires an account on the server allowlist and a verified email address. New users can verify their address and refresh verification on the Account page.

## Public environment

| Variable | Purpose |
|---|---|
| VITE_API_URL | Backend origin without an endpoint suffix |
| VITE_FIREBASE_API_KEY | Public Firebase web API key |
| VITE_FIREBASE_AUTH_DOMAIN | Firebase web authentication domain |
| VITE_FIREBASE_PROJECT_ID | Project ID matching the backend token verifier |
| VITE_FIREBASE_APP_ID | Firebase web app ID |
| VITE_ROUTER_MODE | Set to `hash` for GitHub project Pages |

Vite embeds every referenced public value into the downloaded client JavaScript. Keep Groq credentials and service-account keys on the backend. If live settings are incomplete, the frontend serves the sample and explains why sign-in is unavailable.

## Production builds

Run `npm run build`. Serve `dist/` on a static host. Cloudflare Pages uses project root `frontend`, build command `npm run build`, output `dist` and the included SPA fallback. For GitHub project Pages set `VITE_ROUTER_MODE=hash` in the build environment; the sample link ends in `/#/sample` and assets use relative URLs. See the root deployment guide for the actual hosting status.

## Account data

Firebase handles session-scoped authentication. The UI waits for Firebase to resolve the user before rendering private routes. Meeting content is requested from the owner-scoped API and kept in React memory. Changing users remounts the protected views and cancels active requests. The app removes its legacy unprotected meeting caches when opened. The theme preference is saved locally. The dashboard provides filename search and a status filter. Records expire on the server approximately one hour after completion, or sooner if the server restarts; download finished notes for a personal copy. The dashboard has no manual server deletion control.

## Tests

`npm test` checks the upload size boundary and formats, empty input and plain-text exports. A production build checks module resolution and bundling. Full Firebase and Groq integration requires configured accounts, provider connectivity and quota. See the repository audit for the actual test record.
