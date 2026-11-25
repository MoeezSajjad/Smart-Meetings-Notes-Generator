# Meeting API

## Local setup

Use Node.js 22. In PowerShell, in the backend directory:

```powershell
npm ci
Copy-Item .env.example .env
npm start
```

Create the local environment file only once. Fill in a Groq Free API key and the Firebase project ID used by the frontend, then start the server. Check http://localhost:5000/api/health. To test without provider credentials, run `npm test`. Run `npm audit` to check installed versions.

| Variable | Purpose |
|---|---|
| GROQ_API_KEY | Private Groq credential. Backend only. Use a Free organization. |
| FIREBASE_PROJECT_ID | Expected token audience and issuer. The project ID also appears in the public Firebase client configuration. |
| CORS_ORIGIN | Comma-separated exact frontend origins. For localhost, use the port Vite actually serves. Production requires HTTPS. |
| DEMO_ALLOWED_EMAILS | Comma-separated verified Firebase account emails allowed to use live processing. Required in production. Keep the list server-side. |
| PORT | Hosting-assigned port, locally defaults to 5000. |
| NODE_ENV | Set to production on hosting. |
| GROQ_TRANSCRIPTION_MODEL | Defaults to whisper-large-v3-turbo. |
| GROQ_NOTES_MODEL | Defaults to openai/gpt-oss-20b on Groq. |

## HTTP interface

Requests to `/api/audio` need `Authorization: Bearer <Firebase ID token>`. Get an ID token from the signed-in Firebase browser client. Never put a token in URLs or support logs. Responses have cache control set to no-store.

| Method and path | Input and response |
|---|---|
| GET /api/health | Public liveness check. Returns 200 and a status of ok. |
| POST /api/audio/upload | Multipart field named audio. One WAV, MP3 or M4A file up to 25,000,000 bytes. 201 returns data.meetingId, originalFileName, uploadedAt and initial status. |
| GET /api/audio/meetings | 200 returns an object containing a meetings array, newest first, with metadata for the current user. |
| GET /api/audio/status/:meetingId | 200 returns metadata and data containing transcript, notes and error. An unknown or other user's meeting returns 404. |

The normal sequence is uploaded → processing → ready or error. On success, notes contains summary, keyPoints and actionItems. Each action has task, priority and nullable owner. An empty task list is valid. Polling clients should stop on terminal responses, sign-out, 404, route change or timeout.

400 means missing/invalid upload, 401 means invalid or expired login, 403 means the verified account is outside the live demo, 413 means oversized audio and 429 means the hourly upload allowance was reached. 503 can indicate temporary authentication service failure. An upstream transcription or notes failure moves the existing meeting to error.

## Operations and data

Results expire approximately an hour after their last update. The worker removes its file after processing and sweeps abandoned server-generated audio after one hour. No transcript database is used. Choose a single instance with a writable temporary directory. Health confirms process liveness only. See [deployment](../DEPLOYMENT.md) and [audit](../AUDIT.md) for limits and checks.
