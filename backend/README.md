# Backend — Smart Meetings Notes Generator
Node 22 or newer. Express API with Groq transcription and note generation.
Copy .env.example to .env, fill in Groq and Firebase project settings, then run npm ci and npm start.
GET /api/health is public. POST /api/audio/upload (multipart audio, maximum 25 MB) and GET /api/audio/status/:meetingId require Firebase ID tokens. Only the uploader may retrieve results.
Production requires CORS_ORIGIN and DEMO_ALLOWED_EMAILS; allowlisted users must verify their email through Firebase. This is a restricted portfolio demo, not a production SaaS. Storage is in memory, results expire after one hour, restarts lose results, and uploaded files are removed after processing. Browser copies remain until deleted. Use synthetic recordings only.
Before public deployment, run npm audit in both directories, remediate advisories and test authenticated uploads, ownership, invalid input and provider failures. Do not use confidential recordings.
