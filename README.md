# Smart Meeting Notes Generator

AI-based meeting audio transcription and summarization. Upload a meeting recording and get back a transcript, a concise summary, key points, and action items.

- **Frontend:** React (Vite) + Tailwind CSS, Firebase Authentication
- **Backend:** Node.js + Express, Multer for uploads
- **AI:** Groq Whisper for transcription, a Groq language model for structured note generation

## Project Structure

```
.
├── backend/     Node.js + Express API (transcription, note generation, auth checks)
└── frontend/    React + Vite web app (upload, dashboard, meeting details)
```

Each folder has its own README and docs with more detail — see `backend/README.md` and `frontend/README_COMPLETE.md`.

## Getting Started

### 1. Clone and install

```bash
git clone https://github.com/MoeezSajjad/Smart-Meetings-Notes-Generator.git
cd Smart-Meetings-Notes-Generator

cd backend && npm ci
cd ../frontend && npm ci
```

### 2. Set up environment variables

Both apps need a local `.env` file (never committed — see `.gitignore`).

**backend/.env** — copy `backend/.env.example` and fill in:
- `GROQ_API_KEY` — from [console.groq.com](https://console.groq.com)
- `PORT`, `CORS_ORIGIN`, and the rest as documented in `backend/.env.example`

**frontend/.env** — copy `frontend/.env.example` and fill in your Firebase project's config (Firebase Console → Project Settings):
- `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_PROJECT_ID`, etc.
- `VITE_API_URL` — the backend URL (`http://localhost:5000` by default)

### 3. Run it

```bash
# Terminal 1
cd backend
npm run dev

# Terminal 2
cd frontend
npm run dev
```

The frontend runs at `http://localhost:3000`, the backend at `http://localhost:5000`.

## Notes

- `backend/uploads/` is where incoming audio files land during processing. It's git-ignored except for a `.gitkeep` placeholder, so test recordings don't bloat the repo.
- Firebase's client-side config is meant to be public by design (it's not a secret the way an API key normally is), but it's still pulled from environment variables here rather than hardcoded, to keep config in one place and out of source control.

## Restricted demo deployment
Use Node 22+, configure Firebase Email/Password authentication, and use the same Firebase project on the frontend and backend. Set backend FIREBASE_API_KEY, FIREBASE_PROJECT_ID, GROQ_API_KEY, NODE_ENV=production, CORS_ORIGIN and DEMO_ALLOWED_EMAILS. Verify demo accounts before use. Build frontend with npm run build and serve dist with SPA fallback. Set VITE_API_URL to the backend HTTPS URL before building. Do not publish a live demo until dependency audits and integration tests pass. In-memory data is lost on restart; browser copies are not deleted by server expiry. Use synthetic audio only. See backend/README.md for details.
