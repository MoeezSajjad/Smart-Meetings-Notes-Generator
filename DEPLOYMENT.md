# Deploy the sample and the live API

The public sample can run as a static Vite site. Live uploads also need an Express service, a Firebase project and Groq. The configuration below targets one small demo instance. No paid domain, database, worker or persistent disk is required.

## Cost and host selection

Estimated subscription cost is **PKR 0 per month** while Railway stays on Free, the frontend uses free static hosting, Firebase stays on Spark and the Groq organization uses its free plan. Quota exhaustion can interrupt the live demo. Keep the static example accessible. Verify the plan in each dashboard before enabling live uploads.

| Backend host | Account, compute and sleep | Uploads, jobs and delivery |
| --- | --- | --- |
| Railway Free (selected) | No card required. Free includes USD 1 of monthly usage, up to 0.5 GB RAM and 1 vCPU per service. Exhaustion stops services until the next cycle. A new trial has a separate one-time grant. Choose Free if the trial ends. Free services sleep after about 5–10 minutes without outbound traffic and wake on demand. | GitHub integration, Docker and HTTPS domain. Uploads must finish within 5 minutes. HTTP streams have a 15-minute ceiling while transferring. The app caps each upload at 25 MB. The API processes jobs in memory after upload and uses temporary disk. A restart loses unfinished jobs. |
| Render Free | 750 free instance-hours per workspace each month. Sleeps after 15 idle minutes. A wake-up can take about a minute. The account owner has already encountered registration and card checks. An existing payment method can result in bandwidth or build overage charges. | Supports GitHub-linked Express services. Files disappear on spin-down, restart and deploy. HTTP response limit is 100 minutes. No provider-specific upload cap confirmed here. Application limit still applies. |
| Hugging Face Docker Spaces | CPU Basic hardware has 2 vCPUs, 16 GB RAM and 50 GB ephemeral disk and normally sleeps after 48 idle hours. Creating a new compute-backed Space now requires a paid membership. Static Spaces alone cannot run this API. | Node can run in a Docker Space. Source is a Hub Git repository, with a separate sync step from GitHub. In-process work ends at restart. An applicable inbound request size or timeout guarantee was not verified. |

The reviewed host documentation does not give a Pakistan-specific signup guarantee. Railway verifies individual accounts. Limited trials can have restricted outbound access that would interrupt Firebase or Groq calls. Confirm access with one short synthetic recording before sharing a live upload link. If verification asks for a card or upgrade, use the static sample and local API.

Sources: [Railway Free](https://docs.railway.com/pricing/free-plan), [Railway networking limits](https://docs.railway.com/networking/public-networking/specs-and-limits), [Render Free](https://render.com/docs/free), [Render request timeout](https://render.com/articles/why-does-my-render-app-time-out-after-30-seconds), [Spaces overview](https://huggingface.co/docs/hub/spaces-overview), [Spaces sleep policy](https://huggingface.co/docs/hub/spaces-gpus).

## Cloudflare Pages frontend

1. Sign in to the Cloudflare dashboard. Under **Workers & Pages → Create application**, choose **Pages** and import a Git repository. Authorize only this GitHub repository.
2. Select the reviewed development branch for this demo. Choose **React (Vite)**, root directory **frontend**, build command **npm run build**, and build output **dist**. Set **NODE_VERSION** to **22**.
3. Deploy the static sample first. The resulting HTTPS address ends in **pages.dev**. Keep its exact origin (scheme and hostname) for the API. The checked-in `frontend/public/_redirects` handles direct visits to client routes.
4. To enable accounts, use the project's Firebase Console → **Project settings → General → Your apps → Web app** to obtain the public web configuration. In Pages' production build environment add the relevant `VITE_FIREBASE_*` fields from `frontend/.env.example`. Firebase project IDs must match between the frontend and API.
5. In **Firebase Authentication → Sign-in method**, enable **Email/Password**. Under **Settings → Authorized domains**, add the exact frontend **hostname** without a path or scheme. Use the deployed hostname even when the frontend is served on GitHub Pages.
6. Once the API exists, set `VITE_API_URL` to its HTTPS origin without a trailing slash. Rebuild the frontend. Vite substitutes these variables at build time. The Groq credential belongs only in the backend runtime.

Cloudflare Free currently permits 500 builds per month with a 20-minute build timeout. Static assets are delivered by Pages. Audio goes from the browser directly to Railway. [Pages build settings](https://developers.cloudflare.com/pages/configuration/build-configuration/) · [Pages limits](https://developers.cloudflare.com/pages/platform/limits/) · [Firebase Spark](https://firebase.google.com/docs/projects/billing/firebase-pricing-plans).

## Railway backend

1. Sign in with GitHub at [Railway](https://railway.com/dashboard). Check **Settings → Plans** for the **Free** or no-card trial workspace. Choose the free plan after the trial. Keep billing instruments and paid upgrades disabled. If the CLI is preferred, authenticate locally with `npx --yes --package @railway/cli railway login` and use `railway whoami` through the same CLI package to check the session.
2. Create an **Empty Project**, add one **Empty Service** for the API, then open its settings. Set **Root Directory** to `/backend`, set **Deploy → Healthcheck Path** to `/api/health` with a 90-second timeout, configure **Restart Policy** as **On failure** with up to three retries, and connect this GitHub repository and select the reviewed development branch. Use the checked-in Dockerfile and its start command. Railway supplies `PORT`. The CLI announced retirement of the legacy `railway.json` format on 1 December 2026. The Dockerfile, service health-check settings and restart limit also work independently of that file.
3. Add the backend environment variables listed in `backend/.env.example` under **Variables**. Set `NODE_ENV=production`, set `CORS_ORIGIN` to the exact frontend origin (no trailing slash or subpath), and supply a verified Firebase demo email in `DEMO_ALLOWED_EMAILS`. Keep the allowlist private. Use separate, explicit origins for any preview deployment. Enter `GROQ_API_KEY` as a private backend variable. Use the production Firebase project ID for token validation. The template is the source of truth for any additional required names. A Firebase service account, signing key or Groq key must never appear in the frontend build.
4. Deploy the staged changes. The platform checks `GET /api/health` before routing traffic. Then select **Settings → Networking → Public Networking → Generate Domain**. Use the detected port. Copy the resulting HTTPS origin into the frontend build as described above.
5. Enable uploads for one verified test account. Use a short, synthetic WAV, MP3 or M4A. The API sends audio to Groq for transcription, followed by the transcript for note generation. Keep the backend single-instance since its quota counters and job state live in memory. Download results you need to keep.
6. To suspend live processing, stop the Railway service. The static sample can continue independently. If the free monthly allowance is exhausted, the service stays suspended until renewal. Never select Hobby or attach a card to recover this demo.

[Railway monorepo settings](https://docs.railway.com/deployments/monorepo) · [Health checks](https://docs.railway.com/deployments/healthchecks) · [Groq speech upload limits](https://console.groq.com/docs/speech-to-text) · [Groq models](https://console.groq.com/docs/models).

## Current hosted backend

The Railway project is **smart-meetings-demo**, service **api**, environment **production**. Its assigned origin is [api-production-14144ac0.up.railway.app](https://api-production-14144ac0.up.railway.app/api/health). The initial Docker build succeeded on Node.js 22.23.5. Activation requires setting the Groq runtime secret and obtaining HTTP 200 from the health endpoint. The CLI verified a 30-day trial with no payment method and a zero current bill on 26 November 2026. Select Free when the trial ends to continue within the monthly free allowance.

## Verify a deployment

1. Open the frontend in a private browser window. Open the sample without credentials, refresh the sample route, and check its transcript and notes.
2. Open the API origin followed by `/api/health`. Expect HTTP 200 and JSON. This confirms the server is up. Firebase and Groq each need a separate functional check.
3. Sign in with a verified, allowlisted test account. Submit synthetic audio, observe polling until completion, inspect the transcript and notes and download the result. Confirm the Network panel shows the intended HTTPS API origin.
4. If sign-in fails, check Firebase Email/Password and authorized domains. If upload returns 403, check email verification and the allowlist. With a CORS error, compare the browser origin with `CORS_ORIGIN`; GitHub Pages project paths do not belong in CORS. Rebuild the frontend after any `VITE_*` change.
5. For a cold start, open health once and wait for the service. If health succeeds and note generation fails, inspect Groq usage and model availability and the provider's outbound network rules. Groq retired the free-tier `llama-3.3-70b-versatile` and `llama-3.1-8b-instant` models. Current alternatives include `openai/gpt-oss-20b` for notes and `whisper-large-v3-turbo` for transcription, both hosted by Groq. [Groq changelog](https://console.groq.com/docs/changelog).
