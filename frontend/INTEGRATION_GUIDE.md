# Frontend & Backend Integration Guide

## Overview

This guide explains how the frontend application integrates with the Node.js/Express backend API for the Smart Meeting Notes Generator.

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│           Frontend (React + Vite)                        │
│  - User Interface                                        │
│  - Authentication (Firebase)                            │
│  - File Uploads                                         │
│  - Status Polling                                       │
└──────────────────────────┬──────────────────────────────┘
                           │ HTTP/REST
                           ▼
┌─────────────────────────────────────────────────────────┐
│           Backend (Node.js + Express)                   │
│  - Audio Upload Handling                               │
│  - Transcription (OpenAI Whisper)                      │
│  - NLP Processing (Hugging Face)                       │
│  - Status Management                                   │
└─────────────────────────────────────────────────────────┘
```

## Getting Started

### 1. Start the Backend

```bash
cd backend
npm install
cp .env.example .env
# Update .env with your API keys

npm run dev  # Development mode
# Server runs on http://localhost:5000
```

### 2. Configure Frontend

```bash
cd smart\ meetings\ note\ generator
npm install
cp .env.example .env.local
# Update .env.local with API URL and Firebase config

npm run dev  # Development mode
# App runs on http://localhost:3000
```

## API Integration Points

### 1. Audio Upload (Upload.jsx)

**Component Location:** `src/components/Upload.jsx`

**Flow:**
1. User selects audio file (MP3, WAV, M4A)
2. File validation (type, size)
3. FormData created with audio file
4. POST request to `/api/audio/upload`
5. Meeting saved to localStorage
6. User redirected to meeting details page

**Code Example:**
```javascript
const handleUpload = async (file) => {
  const formData = new FormData();
  formData.append('audio', file);

  try {
    const response = await fetch(`${API_BASE}/api/audio/upload`, {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error);
    }

    // Save to localStorage
    const newMeeting = {
      meetingId: data.data.meetingId,
      fileName: data.data.originalFileName,
      fileSize: data.data.fileSize,
      uploadedAt: data.data.uploadedAt,
      status: 'uploaded',
      transcript: null,
      notes: null,
    };

    const meetings = JSON.parse(localStorage.getItem('userMeetings') || '[]');
    meetings.unshift(newMeeting);
    localStorage.setItem('userMeetings', JSON.stringify(meetings));

    return data;
  } catch (error) {
    console.error('Upload error:', error);
    throw error;
  }
};
```

**API Response (Success):**
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
  }
}
```

**Error Response:**
```json
{
  "error": "Invalid file format",
  "details": "Only WAV, MP3, and M4A files are allowed",
  "status": 400
}
```

### 2. Status Polling (MeetingDetails.jsx)

**Component Location:** `src/components/MeetingDetails.jsx`

**Flow:**
1. Component mounts with meetingId from URL
2. Starts polling `/api/audio/status/:meetingId` every 3 seconds
3. Updates meeting status in localStorage
4. Continues polling while status is 'processing' or 'uploaded'
5. Displays content when status becomes 'ready'

**Code Example:**
```javascript
const pollStatus = async () => {
  if (!meetingId) return;

  try {
    const response = await fetch(
      `${API_BASE}/api/audio/status/${meetingId}`
    );
    const data = await response.json();

    if (response.ok) {
      // Update meeting status
      setMeeting(prev => prev ? { ...prev, status: data.status } : null);

      // Continue polling if processing
      if (data.status === 'processing' || data.status === 'uploaded') {
        setTimeout(pollStatus, 3000);
      }
    }
  } catch (error) {
    console.error('Failed to check status:', error);
  }
};
```

**Possible Status Values:**
- `uploaded` - File successfully uploaded to backend
- `processing` - Being transcribed/analyzed (Whisper + NLP)
- `transcribed` - Audio converted to text
- `ready` - Notes generated and available
- `error` - Processing failed

**API Response:**
```json
{
  "meetingId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "status": "processing",
  "message": "Your meeting is being transcribed and analyzed"
}
```

### 3. Dashboard Data Management (Dashboard.jsx)

**Component Location:** `src/components/Dashboard.jsx`

**Flow:**
1. Loads all meetings from localStorage
2. Displays in grid with status badges
3. Allows search and filtering
4. Shows download/delete options

**Data Structure:**
```javascript
[
  {
    meetingId: "uuid",
    fileName: "meeting.mp3",
    fileSize: 5242880,
    uploadedAt: "2026-01-16T10:30:00.000Z",
    status: "ready|processing|uploaded|error",
    transcript: "Full transcript text",
    notes: {
      summary: "Executive summary",
      keyPoints: ["Point 1", "Point 2"],
      actionItems: [
        {
          task: "Task description",
          owner: "John Doe",
          priority: "high"
        }
      ]
    }
  }
]
```

### 4. Meeting Details Display (MeetingDetails.jsx)

**Features:**
- View full transcript
- Read AI-generated summary
- Browse key discussion points
- Track action items with priorities
- Download notes as Markdown
- Real-time processing status

**Meeting Details Response Structure:**
The component expects notes to have:
```javascript
{
  summary: string,
  keyPoints: string[],
  actionItems: [
    {
      task: string,
      owner?: string,
      dueDate?: string,
      priority: 'high' | 'medium' | 'low'
    }
  ],
  sentiment?: string
}
```

## Data Flow Diagrams

### Upload & Processing Flow

```
User uploads file
       ↓
Frontend validates
       ↓
POST /api/audio/upload
       ↓
Backend creates unique ID
       ↓
File saved to uploads/
       ↓
Response with meetingId
       ↓
Frontend saves to localStorage
       ↓
User redirected to /meeting/:meetingId
       ↓
Frontend polls /api/audio/status/:meetingId
       ↓
Backend processes:
  - Whisper API (transcription)
  - Hugging Face (summarization/extraction)
       ↓
Backend updates status
       ↓
Frontend detects status change
       ↓
Display completed notes
```

### Meeting Retrieval Flow

```
User navigates to /meeting/:meetingId
       ↓
Load from localStorage
       ↓
If status = 'processing'
  ├─ Poll /api/audio/status/:meetingId
  └─ Every 3 seconds until 'ready'
       ↓
If status = 'ready'
  └─ Display notes in tabs
       ↓
User can download notes
```

## Error Handling

### Common Error Scenarios

**Invalid File Format:**
```json
{
  "error": "Invalid file",
  "details": "Invalid file format. Only WAV, MP3, and M4A files are allowed. Received: audio/ogg",
  "status": 400
}
```

**File Too Large:**
```json
{
  "error": "File too large",
  "details": "File size exceeds 100MB limit. Received: 150.50MB",
  "status": 413
}
```

**Processing Error:**
```json
{
  "error": "Failed to process audio",
  "details": "Error from OpenAI API: Invalid API key",
  "status": 500
}
```

**Handling in Frontend:**
```javascript
try {
  const response = await fetch(endpoint);
  const data = await response.json();
  
  if (!response.ok) {
    // Show user-friendly error
    setError(data.details || data.error || 'An error occurred');
    return;
  }
  
  // Process success response
} catch (error) {
  setError('Network error: ' + error.message);
}
```

## Environment Configuration

### Frontend (.env.local)

```env
# Backend API
VITE_API_URL=http://localhost:5000

# Firebase
VITE_FIREBASE_API_KEY=sk-abc123...
VITE_FIREBASE_PROJECT_ID=my-project
```

### Backend (.env)

```env
# Server
PORT=5000
NODE_ENV=development

# CORS
CORS_ORIGIN=http://localhost:3000

# APIs
OPENAI_API_KEY=sk-test-...
HUGGINGFACE_API_KEY=hf_...
```

## Deployment Considerations

### CORS Configuration

In production, update backend CORS_ORIGIN:
```env
CORS_ORIGIN=https://your-frontend-domain.com
```

### API URL in Frontend

For production, update the API URL:
```javascript
// src/components/Upload.jsx
const API_BASE = import.meta.env.VITE_API_URL || 'https://your-api.com';
```

### File Storage

Backend uploads folder structure:
```
backend/uploads/
├── meeting_1705408200000_123456789.mp3
├── meeting_1705408201000_987654321.wav
└── ...
```

Consider migrating to cloud storage (AWS S3, Google Cloud Storage) in production.

## Testing Integration

### Local Testing

```bash
# Terminal 1: Start Backend
cd backend
npm run dev
# Verify: curl http://localhost:5000/api/health

# Terminal 2: Start Frontend
npm run dev
# Open: http://localhost:3000
```

### Test Uploads

1. Go to http://localhost:3000/upload (after signup)
2. Download test audio: [Wikipedia Audio](https://en.wikipedia.org/wiki/File:Voiceover-New_Zealand_Constitution_Reforms.ogg)
3. Convert to MP3 if needed
4. Upload and verify status polling

### Monitoring

**Frontend (Browser DevTools):**
- Network tab: Monitor API calls
- Console: Check for errors
- Application > localStorage: View meeting data

**Backend (Terminal):**
- Console logs for API requests
- Check file uploads in `backend/uploads/`
- Monitor external API calls (Whisper, HuggingFace)

## Rate Limiting & Throttling

### Frontend
- Debounce search in dashboard (300ms)
- Throttle status polling (3000ms)
- File upload validation before request

### Backend
- Rate limiting on upload endpoint (recommended)
- Queue processing for large files
- Timeout handling for external APIs

## Future Enhancements

1. **Real-time WebSocket Updates**
   - Replace polling with WebSocket for instant updates
   - Better performance and reduced server load

2. **Batch Processing**
   - Upload multiple files at once
   - Queue management dashboard

3. **Export Formats**
   - PDF export with formatting
   - Notion/Confluence integration
   - Calendar event creation

4. **Collaborative Features**
   - Share meetings with team
   - Comments on notes
   - Real-time collaboration

5. **Advanced Analytics**
   - Meeting duration trends
   - Speaker identification
   - Topic extraction

## Support & Debugging

### Common Issues

**API Connection Refused**
```bash
# Check backend is running
curl http://localhost:5000/api/health

# Verify API URL in .env.local
VITE_API_URL=http://localhost:5000
```

**CORS Errors**
```
Access to XMLHttpRequest at 'http://localhost:5000/api/audio/upload' 
from origin 'http://localhost:3000' has been blocked
```
- Update backend CORS_ORIGIN
- Check frontend API URL matches

**File Upload Fails**
- Check file format (MP3, WAV, M4A)
- Check file size < 100MB
- Check backend uploads/ directory exists

**Status Never Updates**
- Check backend logs for processing
- Verify external API keys (OpenAI, HuggingFace)
- Check browser console for network errors

## References

- [Backend API Documentation](./backend/API_DOCUMENTATION.md)
- [Frontend Documentation](./FRONTEND_DOCUMENTATION.md)
- [OpenAI Whisper API](https://platform.openai.com/docs/guides/speech-to-text)
- [Hugging Face Transformers](https://huggingface.co/docs/transformers/)
