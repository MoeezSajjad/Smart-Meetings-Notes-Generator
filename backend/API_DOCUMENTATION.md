# Backend API Documentation

Complete technical documentation for the AI-Powered Meeting Note Generator backend. This document provides all necessary information for front-end integration.

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [Environment Setup](#environment-setup)
4. [API Endpoints](#api-endpoints)
5. [Authentication](#authentication)
6. [Error Handling](#error-handling)
7. [Data Models](#data-models)
8. [Examples](#examples)
9. [Deployment](#deployment)

---

## Project Overview

**Backend Framework:** Node.js with Express.js  
**Primary Purpose:** Process audio files and generate AI-powered meeting notes  
**Key Technologies:**
- OpenAI Whisper API (speech-to-text transcription)
- Hugging Face Transformers (NLP & summarization)
- Multer (file upload handling)
- UUID (unique meeting ID generation)

---

## Architecture

### System Architecture Diagram

```
┌─────────────────────────────────────────────────────────┐
│                   Frontend Application                  │
└──────────────────────────┬──────────────────────────────┘
                           │ HTTP/REST
                           ▼
┌─────────────────────────────────────────────────────────┐
│          Express.js Server (Node.js Backend)            │
├─────────────────────────────────────────────────────────┤
│                    Middleware Layer                      │
│  ┌──────────────┬──────────────┬──────────────────────┐ │
│  │    CORS      │   Multer     │   Authentication     │ │
│  │  (Allowed    │   (File      │   (To be added)      │ │
│  │  Domains)    │   Upload)    │                      │ │
│  └──────────────┴──────────────┴──────────────────────┘ │
├─────────────────────────────────────────────────────────┤
│                    Routes Layer                         │
│  ┌────────────────────────────────────────────────────┐ │
│  │         /api/audio/* - Audio Endpoints             │ │
│  └────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────┤
│                  Controllers Layer                      │
│  ┌────────────────────────────────────────────────────┐ │
│  │  uploadAudio | getUploadStatus | processAudio     │ │
│  │  generateNotes                                     │ │
│  └────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────┤
│                   Services Layer                        │
│  ┌──────────────────────┬──────────────────────────┐   │
│  │   whisperService     │  huggingfaceService      │   │
│  │   - transcribeAudio  │  - generateSummary       │   │
│  │   - validateAudioFile│  - extractKeyPoints      │   │
│  │                      │  - sentimentAnalysis     │   │
│  └──────────────────────┴──────────────────────────┘   │
└──────────┬──────────────┬──────────────┬────────────────┘
           │              │              │
           ▼              ▼              ▼
    ┌─────────────┐ ┌──────────────┐ ┌──────────────┐
    │   Local     │ │  OpenAI      │ │  Hugging     │
    │   Storage   │ │  Whisper API │ │  Face API    │
    │   (uploads/)│ │              │ │              │
    └─────────────┘ └──────────────┘ └──────────────┘
```

### Project Directory Structure

```
backend/
├── src/
│   ├── config/
│   │   └── index.js                  # Configuration & environment variables
│   ├── controllers/
│   │   └── audioController.js        # Route handlers for audio endpoints
│   ├── middlewares/
│   │   ├── index.js                  # Middleware exports
│   │   └── uploadMiddleware.js        # Multer upload configuration
│   ├── routes/
│   │   └── audioRoutes.js            # API routes definition
│   ├── services/
│   │   ├── whisperService.js         # OpenAI Whisper integration
│   │   └── huggingfaceService.js     # Hugging Face integration
│   └── index.js                      # Main application entry point
├── uploads/                          # Directory for uploaded audio files
├── .env.example                      # Environment variables template
├── package.json                      # Dependencies & scripts
├── README.md                         # Basic setup guide
└── API_DOCUMENTATION.md              # This file
```

### Key Components Explained

| Component | Purpose |
|-----------|---------|
| **Controllers** | Handle incoming requests, validate data, call services |
| **Routes** | Define API endpoints and map them to controllers |
| **Middlewares** | Process requests before reaching controllers (file upload, validation) |
| **Services** | Contain business logic and integrate with external APIs |
| **Config** | Centralized configuration and environment variables |

---

## Environment Setup

### Required Environment Variables

Create a `.env` file in the project root with the following variables:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# CORS Configuration (Frontend URL)
CORS_ORIGIN=http://localhost:3000

# OpenAI Configuration (for Whisper API)
OPENAI_API_KEY=sk_test_... 

# Hugging Face Configuration (for NLP tasks)
HUGGINGFACE_API_KEY=hf_...

# Authentication (optional, for future implementation)
JWT_SECRET=your_secret_key_here

# Database URL (if needed in the future)
DB_URL=
```

### Getting API Keys

**OpenAI Whisper API:**
1. Go to [platform.openai.com](https://platform.openai.com)
2. Create an account and log in
3. Navigate to API keys section
4. Create a new API key
5. Copy and paste into `OPENAI_API_KEY`

**Hugging Face API:**
1. Go to [huggingface.co](https://huggingface.co)
2. Create an account and log in
3. Navigate to Settings → Access Tokens
4. Create a new token with read permission
5. Copy and paste into `HUGGINGFACE_API_KEY`

### Installation

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Start development server (with auto-reload)
npm run dev

# Or start production server
npm start
```

The server will start on `http://localhost:5000` (or your configured PORT)

---

## API Endpoints

### 1. Health Check

**Endpoint:** `GET /api/health`

**Description:** Check if the server is running and responsive.

**Request:**
```bash
curl http://localhost:5000/api/health
```

**Response (200 OK):**
```json
{
  "status": "Server is running",
  "timestamp": "2026-01-16T10:30:00.000Z"
}
```

---

### 2. Upload Audio File

**Endpoint:** `POST /api/audio/upload`

**Description:** Upload an audio file for processing. Returns a unique meeting ID.

**Content-Type:** `multipart/form-data`

**Request Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `audio` | File | Yes | Audio file to upload |

**Supported Formats:**
- `.wav` (WAV audio)
- `.mp3` (MPEG audio)
- `.m4a` (MPEG-4 audio)

**File Size Limit:** 100 MB

**Headers:**
```
Content-Type: multipart/form-data
Authorization: Bearer <token> (Optional - future implementation)
```

**cURL Example:**
```bash
curl -X POST http://localhost:5000/api/audio/upload \
  -F "audio=@/path/to/meeting.mp3"
```

**JavaScript (Fetch) Example:**
```javascript
const uploadAudio = async (audioFile) => {
  const formData = new FormData();
  formData.append('audio', audioFile);

  const response = await fetch('http://localhost:5000/api/audio/upload', {
    method: 'POST',
    body: formData
  });

  return response.json();
};

// Usage
const fileInput = document.querySelector('input[type="file"]');
uploadAudio(fileInput.files[0]).then(result => {
  if (result.success) {
    console.log('Meeting ID:', result.data.meetingId);
    console.log('File saved to:', result.data.serverPath);
  }
});
```

**Python Example:**
```python
import requests

def upload_audio(file_path):
    with open(file_path, 'rb') as f:
        files = {'audio': f}
        response = requests.post(
            'http://localhost:5000/api/audio/upload',
            files=files
        )
    return response.json()

result = upload_audio('meeting.mp3')
meeting_id = result['data']['meetingId']
```

**React Example:**
```jsx
import React, { useState } from 'react';

function AudioUpload() {
  const [file, setFile] = useState(null);
  const [meetingId, setMeetingId] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return;

    setLoading(true);
    const formData = new FormData();
    formData.append('audio', file);

    try {
      const res = await fetch('http://localhost:5000/api/audio/upload', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (data.success) {
        setMeetingId(data.data.meetingId);
        console.log('Upload successful!', data);
      }
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleUpload}>
      <input
        type="file"
        accept="audio/*"
        onChange={(e) => setFile(e.target.files[0])}
      />
      <button disabled={!file || loading}>
        {loading ? 'Uploading...' : 'Upload Audio'}
      </button>
      {meetingId && <p>Meeting ID: {meetingId}</p>}
    </form>
  );
}

export default AudioUpload;
```

**Success Response (201 Created):**
```json
{
  "success": true,
  "message": "Audio file uploaded successfully",
  "status": 201,
  "data": {
    "meetingId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "originalFileName": "meeting.mp3",
    "fileExtension": ".mp3",
    "fileSize": 5242880,
    "mimeType": "audio/mpeg",
    "uploadedAt": "2026-01-16T10:30:00.000Z",
    "serverPath": "uploads/meeting_1705408200000_123456789.mp3"
  },
  "timestamp": "2026-01-16T10:30:00.000Z"
}
```

**Error Response - No File (400 Bad Request):**
```json
{
  "error": "No audio file provided",
  "details": "Please provide an audio file in the \"audio\" form field",
  "status": 400,
  "timestamp": "2026-01-16T10:30:00.000Z"
}
```

**Error Response - Invalid Format (400 Bad Request):**
```json
{
  "error": "Invalid file",
  "details": "Invalid file format. Only WAV, MP3, and M4A files are allowed. Received: audio/ogg",
  "status": 400,
  "timestamp": "2026-01-16T10:30:00.000Z"
}
```

**Error Response - File Too Large (413 Payload Too Large):**
```json
{
  "error": "File too large",
  "details": "File size exceeds 100MB limit. Received: 150.50MB",
  "status": 413,
  "timestamp": "2026-01-16T10:30:00.000Z"
}
```

---

### 3. Get Upload Status

**Endpoint:** `GET /api/audio/status/:meetingId`

**Description:** Retrieve the status of an uploaded audio file using its meeting ID.

**URL Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `meetingId` | UUID | Yes | Unique meeting identifier from upload response |

**cURL Example:**
```bash
curl http://localhost:5000/api/audio/status/a1b2c3d4-e5f6-7890-abcd-ef1234567890
```

**JavaScript Example:**
```javascript
const checkStatus = async (meetingId) => {
  const response = await fetch(
    `http://localhost:5000/api/audio/status/${meetingId}`
  );
  return response.json();
};

checkStatus('a1b2c3d4-e5f6-7890-abcd-ef1234567890').then(status => {
  console.log('Status:', status.status);
});
```

**Response (200 OK):**
```json
{
  "meetingId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "status": "uploaded",
  "message": "File uploaded and ready for processing",
  "timestamp": "2026-01-16T10:30:00.000Z"
}
```

**Possible Status Values:**
- `uploaded` - File successfully uploaded
- `processing` - Currently being transcribed/processed
- `transcribed` - Transcription complete
- `ready` - Notes generated and ready
- `error` - Processing failed

---

### 4. Transcribe Audio (Legacy)

**Endpoint:** `POST /api/audio/transcribe`

**Description:** Transcribe audio to text using OpenAI Whisper API. *(Currently placeholder implementation)*

**Request Body:**
```json
{
  "meetingId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
}
```

**Expected Response (200 OK):**
```json
{
  "message": "Audio processing controller"
}
```

**Status:** ⚠️ Under development - full implementation pending

---

### 5. Generate Meeting Notes (Legacy)

**Endpoint:** `POST /api/audio/generate-notes`

**Description:** Generate meeting notes from transcribed text using Hugging Face. *(Currently placeholder implementation)*

**Request Body:**
```json
{
  "meetingId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "transcript": "Meeting transcription text..."
}
```

**Expected Response (200 OK):**
```json
{
  "message": "Notes generation controller"
}
```

**Status:** ⚠️ Under development - full implementation pending

---

## Authentication

### Current Status
🔐 **Not yet implemented** - All endpoints currently accessible without authentication

### Future Implementation Plan

Authentication will be implemented using JWT (JSON Web Tokens). Expected flow:

```
1. Frontend obtains token from auth provider
   (Firebase, Supabase, or custom auth service)

2. Frontend includes token in Authorization header:
   Authorization: Bearer <jwt_token>

3. Backend validates token in middleware

4. Request proceeds if token is valid
```

### Recommended Auth Solutions

1. **Firebase Authentication**
   - Setup: https://firebase.google.com/docs
   - Environment vars: `FIREBASE_PROJECT_ID`, `FIREBASE_PRIVATE_KEY`, `FIREBASE_CLIENT_EMAIL`

2. **Supabase Auth**
   - Setup: https://supabase.io/docs/guides/auth
   - Environment vars: `SUPABASE_URL`, `SUPABASE_ANON_KEY`

3. **Auth0**
   - Setup: https://auth0.com/docs
   - Environment vars: `AUTH0_DOMAIN`, `AUTH0_CLIENT_ID`

---

## Error Handling

### Error Response Format

All errors follow a consistent format:

```json
{
  "error": "Error title",
  "details": "Detailed error message",
  "status": 400,
  "timestamp": "2026-01-16T10:30:00.000Z"
}
```

### HTTP Status Codes

| Status | Meaning | Common Causes |
|--------|---------|---------------|
| 200 | OK | Successful GET request |
| 201 | Created | Successful POST request (resource created) |
| 400 | Bad Request | Invalid input, missing file, invalid format |
| 403 | Forbidden | Authentication/authorization failed |
| 404 | Not Found | Route or resource not found |
| 413 | Payload Too Large | File exceeds size limit |
| 500 | Internal Server Error | Server error, check logs |

### Common Error Scenarios

**No File Provided:**
```json
{
  "error": "No audio file provided",
  "details": "Please provide an audio file in the \"audio\" form field",
  "status": 400
}
```

**Invalid File Format:**
```json
{
  "error": "Invalid file",
  "details": "Invalid file format. Only WAV, MP3, and M4A files are allowed.",
  "status": 400
}
```

**File Too Large:**
```json
{
  "error": "File too large",
  "details": "File size exceeds 100MB limit.",
  "status": 413
}
```

**Server Error:**
```json
{
  "error": "Failed to upload audio file",
  "details": "EACCES: permission denied, open '/path/to/file'",
  "status": 500
}
```

---

## Data Models

### Meeting Object

Represents a meeting with uploaded audio.

```typescript
interface Meeting {
  meetingId: string;           // UUID v4, unique identifier
  originalFileName: string;     // Original file name from upload
  fileExtension: string;        // File type: .mp3, .wav, .m4a
  fileSize: number;            // File size in bytes
  mimeType: string;            // MIME type: audio/mpeg, audio/wav, etc.
  serverPath: string;          // Path to stored file on server
  uploadedAt: string;          // ISO 8601 timestamp
  status?: string;             // 'uploaded', 'processing', 'transcribed', etc.
}
```

### Transcript Object (Future)

```typescript
interface Transcript {
  meetingId: string;
  text: string;                // Full transcription
  duration: number;            // Audio duration in seconds
  language: string;            // Detected language (e.g., 'en')
  confidence: number;          // Confidence score 0-1
  segments?: Segment[];        // Timestamped segments
}

interface Segment {
  startTime: number;           // Seconds
  endTime: number;             // Seconds
  text: string;               // Segment transcript
}
```

### Meeting Notes Object (Future)

```typescript
interface MeetingNotes {
  meetingId: string;
  summary: string;             // Executive summary
  keyPoints: string[];         // Important discussion points
  actionItems: ActionItem[];   // Tasks to be done
  sentiment: string;           // Overall sentiment
  participants?: string[];     // Detected speakers (if available)
  generatedAt: string;         // ISO 8601 timestamp
}

interface ActionItem {
  task: string;
  owner?: string;              // Assigned person
  dueDate?: string;            // ISO 8601 date
  priority: 'high' | 'medium' | 'low';
}
```

---

## Examples

### Complete Upload & Check Status Flow

**JavaScript:**
```javascript
// 1. Upload audio
async function uploadAndCheck(audioFile) {
  try {
    // Upload
    const formData = new FormData();
    formData.append('audio', audioFile);

    const uploadRes = await fetch('http://localhost:5000/api/audio/upload', {
      method: 'POST',
      body: formData
    });

    const uploadData = await uploadRes.json();

    if (!uploadData.success) {
      throw new Error(uploadData.error);
    }

    const meetingId = uploadData.data.meetingId;
    console.log('Upload successful! Meeting ID:', meetingId);

    // Check status after a delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    const statusRes = await fetch(
      `http://localhost:5000/api/audio/status/${meetingId}`
    );
    const statusData = await statusRes.json();

    console.log('Current status:', statusData.status);
    return { meetingId, ...statusData };

  } catch (error) {
    console.error('Error:', error.message);
    throw error;
  }
}

// Usage
const fileInput = document.querySelector('input[type="file"]');
fileInput.addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (file) {
    try {
      const result = await uploadAndCheck(file);
      console.log('Final result:', result);
    } catch (error) {
      alert('Upload failed: ' + error.message);
    }
  }
});
```

**React Component Example:**
```jsx
import React, { useState } from 'react';

function MeetingUploader() {
  const [file, setFile] = useState(null);
  const [meeting, setMeeting] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return;

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('audio', file);

      const res = await fetch('http://localhost:5000/api/audio/upload', {
        method: 'POST',
        body: formData
      });

      const data = await res.json();

      if (!data.success) {
        throw new Error(data.error || 'Upload failed');
      }

      setMeeting({
        meetingId: data.data.meetingId,
        fileName: data.data.originalFileName,
        uploadedAt: data.data.uploadedAt,
        size: (data.data.fileSize / 1024 / 1024).toFixed(2) + ' MB'
      });

      setFile(null);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const checkStatus = async () => {
    if (!meeting) return;

    try {
      const res = await fetch(
        `http://localhost:5000/api/audio/status/${meeting.meetingId}`
      );
      const data = await res.json();
      alert(`Meeting Status: ${data.status}`);
    } catch (err) {
      setError('Failed to check status');
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '500px' }}>
      <h2>Upload Meeting Audio</h2>

      {error && <div style={{ color: 'red' }}>{error}</div>}

      {!meeting ? (
        <form onSubmit={handleUpload}>
          <input
            type="file"
            accept="audio/*"
            onChange={(e) => setFile(e.target.files[0])}
          />
          <button disabled={!file || loading}>
            {loading ? 'Uploading...' : 'Upload'}
          </button>
        </form>
      ) : (
        <div>
          <p><strong>File:</strong> {meeting.fileName}</p>
          <p><strong>Size:</strong> {meeting.size}</p>
          <p><strong>Meeting ID:</strong> {meeting.meetingId}</p>
          <p><strong>Uploaded:</strong> {new Date(meeting.uploadedAt).toLocaleString()}</p>
          <button onClick={checkStatus}>Check Status</button>
          <button onClick={() => setMeeting(null)}>Upload Another</button>
        </div>
      )}
    </div>
  );
}

export default MeetingUploader;
```

---

## Deployment

### Production Checklist

Before deploying to production:

- [ ] Set `NODE_ENV=production` in `.env`
- [ ] Ensure all API keys are securely configured
- [ ] Test all endpoints with production data
- [ ] Set up proper CORS_ORIGIN for your frontend domain
- [ ] Configure proper logging and monitoring
- [ ] Set up file storage cleanup for old uploads
- [ ] Implement database for persistent storage
- [ ] Enable authentication
- [ ] Set up SSL/TLS certificates
- [ ] Configure rate limiting
- [ ] Set up error tracking (Sentry, etc.)

### Deployment Platforms

**Heroku:**
```bash
# Install Heroku CLI and login
heroku login

# Create app
heroku create your-app-name

# Set environment variables
heroku config:set OPENAI_API_KEY=sk_test_...
heroku config:set HUGGINGFACE_API_KEY=hf_...
heroku config:set CORS_ORIGIN=https://your-frontend.com

# Deploy
git push heroku main
```

**Railway:**
```bash
# Create project at railway.app
# Connect GitHub repository
# Add environment variables in dashboard
# Auto-deploys on push
```

**AWS EC2:**
```bash
# SSH into instance
ssh -i key.pem ec2-user@your-instance

# Install Node.js
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install -y nodejs

# Clone and setup
git clone your-repo
cd backend
npm install

# Start with PM2
npm install -g pm2
pm2 start src/index.js --name "audio-api"
pm2 startup
pm2 save
```

**Docker:**
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 5000

CMD ["npm", "start"]
```

```bash
# Build and run
docker build -t audio-api .
docker run -p 5000:5000 --env-file .env audio-api
```

---

## Support & Troubleshooting

### Common Issues

**CORS Error:**
- Ensure `CORS_ORIGIN` matches your frontend URL
- Frontend URL should include protocol: `http://localhost:3000` or `https://domain.com`

**Upload Fails with 413 Error:**
- Check file size - max is 100MB
- Verify MIME type is supported (mp3, wav, m4a)

**Environment Variables Not Loading:**
- Ensure `.env` file exists in project root
- Restart server after changing `.env`
- Check for syntax errors in `.env`

**API Key Errors:**
- Verify API keys are correct and active
- Check API key permissions/scope
- Ensure API keys are not expired

### Monitoring & Logs

```javascript
// View logs
npm run dev  // Development logs visible in console

// In production, check your platform logs:
// Heroku: heroku logs --tail
// Railway: View in dashboard
// EC2: /var/log/pm2/logs
```

### Contact & Questions

For questions or issues:
1. Check the documentation in this file
2. Review code comments in `/src` directory
3. Check existing error responses and status codes
4. Create GitHub issue with error details and steps to reproduce

---

## API Summary Table

| Method | Endpoint | Purpose | Status |
|--------|----------|---------|--------|
| GET | `/api/health` | Check server status | ✅ Ready |
| POST | `/api/audio/upload` | Upload audio file | ✅ Ready |
| GET | `/api/audio/status/:meetingId` | Check upload status | ✅ Ready |
| POST | `/api/audio/transcribe` | Transcribe audio | ⚠️ Placeholder |
| POST | `/api/audio/generate-notes` | Generate notes | ⚠️ Placeholder |

---

**Last Updated:** January 16, 2026  
**Backend Version:** 1.0.0  
**Documentation Version:** 1.0.0
