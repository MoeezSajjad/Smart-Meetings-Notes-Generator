# API Integration Reference

Quick reference guide for integrating frontend components with the backend API.

## Backend Server

**Development:** `http://localhost:5000`  
**Production:** Set via `VITE_API_URL` environment variable

### Health Check

```javascript
// Test if backend is running
fetch('http://localhost:5000/api/health')
  .then(res => res.json())
  .then(data => console.log(data));
// Response: { status: "Server is running", timestamp: "..." }
```

## Audio Upload

**Endpoint:** `POST /api/audio/upload`  
**Location:** `src/components/Upload.jsx`

### Request
```javascript
const formData = new FormData();
formData.append('audio', audioFile); // File object

fetch('http://localhost:5000/api/audio/upload', {
  method: 'POST',
  body: formData
})
```

### Response (201 Created)
```javascript
{
  success: true,
  message: "Audio file uploaded successfully",
  data: {
    meetingId: "uuid",           // Use this for subsequent calls
    originalFileName: "meeting.mp3",
    fileExtension: ".mp3",
    fileSize: 5242880,           // In bytes
    mimeType: "audio/mpeg",
    uploadedAt: "2026-01-16T...",
    serverPath: "uploads/..."    // Backend storage path
  }
}
```

### Error Response
```javascript
{
  error: "Invalid file",
  details: "Only WAV, MP3, and M4A files are allowed",
  status: 400
}
```

### Frontend Implementation
```javascript
// src/components/Upload.jsx
const handleUpload = async (file) => {
  const formData = new FormData();
  formData.append('audio', file);

  const response = await fetch(`${API_BASE}/api/audio/upload`, {
    method: 'POST',
    body: formData,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.details || data.error);
  }

  return data;
};
```

## Status Polling

**Endpoint:** `GET /api/audio/status/:meetingId`  
**Location:** `src/components/MeetingDetails.jsx`

### Request
```javascript
fetch('http://localhost:5000/api/audio/status/a1b2c3d4-e5f6-7890-abcd-ef1234567890')
  .then(res => res.json())
  .then(data => console.log(data));
```

### Response
```javascript
{
  meetingId: "uuid",
  status: "uploaded|processing|transcribed|ready|error",
  message: "Status message",
  timestamp: "2026-01-16T..."
}
```

### Frontend Implementation
```javascript
// Polling function in MeetingDetails.jsx
const pollStatus = async () => {
  try {
    const response = await fetch(
      `${API_BASE}/api/audio/status/${meetingId}`
    );
    const data = await response.json();

    if (response.ok) {
      setMeeting(prev => 
        prev ? { ...prev, status: data.status } : null
      );

      // Continue polling if still processing
      if (['processing', 'uploaded'].includes(data.status)) {
        setTimeout(pollStatus, 3000); // Poll every 3 seconds
      }
    }
  } catch (error) {
    console.error('Status check failed:', error);
  }
};
```

## Status Values Explained

| Status | Meaning | Next Action | UI Display |
|--------|---------|-------------|-----------|
| `uploaded` | File received, queued | Wait/Poll | Spinner + "Queued for processing" |
| `processing` | Being transcribed/analyzed | Wait/Poll | Spinner + "Processing..." |
| `transcribed` | Transcript complete | Wait/Poll | Spinner + "Generating notes..." |
| `ready` | All processing done | Display notes | Tabs with content |
| `error` | Processing failed | Retry upload | Error icon + message |

## Data Persistence

### localStorage Structure

**Meetings Array:**
```javascript
const meetings = [
  {
    meetingId: "uuid",
    fileName: "meeting.mp3",
    fileSize: 5242880,
    uploadedAt: "2026-01-16T10:30:00.000Z",
    serverPath: "uploads/file.mp3",
    status: "ready",
    transcript: "Full transcription text...",
    notes: {
      summary: "Executive summary...",
      keyPoints: [
        "Key point 1",
        "Key point 2"
      ],
      actionItems: [
        {
          task: "Complete project proposal",
          owner: "John Doe",
          dueDate: "2026-01-20",
          priority: "high"
        }
      ]
    }
  }
];

localStorage.setItem('userMeetings', JSON.stringify(meetings));
```

**User Object:**
```javascript
const user = {
  uid: "firebase-uid",
  email: "user@example.com",
  displayName: "John Doe"
};

localStorage.setItem('user', JSON.stringify(user));
```

## Component Integration Map

### Upload Flow
```
Upload.jsx
  ↓
handleUpload()
  ↓
POST /api/audio/upload
  ↓
Save meetingId + response to localStorage
  ↓
Navigate to /meeting/:meetingId
```

### Status Check Flow
```
MeetingDetails.jsx (mount)
  ↓
Load from localStorage
  ↓
If status !== 'ready'
  ├─ Start polling
  ├─ GET /api/audio/status/:meetingId
  └─ Every 3 seconds
  ↓
Update localStorage when status changes
  ↓
Display content when ready
```

### Dashboard Flow
```
Dashboard.jsx (mount)
  ↓
Read all from localStorage
  ↓
Filter/Search
  ↓
Display in grid with status badges
  ↓
Click card → navigate to MeetingDetails
```

## Error Scenarios & Handling

### Upload Errors

**No file provided**
```javascript
{
  error: "No audio file provided",
  details: "Please provide an audio file in the \"audio\" form field",
  status: 400
}
```

**Invalid format**
```javascript
{
  error: "Invalid file",
  details: "Invalid file format. Only WAV, MP3, and M4A files are allowed. Received: audio/ogg",
  status: 400
}
```

**File too large (>100MB)**
```javascript
{
  error: "File too large",
  details: "File size exceeds 100MB limit. Received: 150.50MB",
  status: 413
}
```

### Processing Errors

**API key invalid**
```javascript
{
  status: "error",
  message: "Failed to process: Invalid OpenAI API key"
}
```

**Network timeout**
```javascript
{
  status: "error",
  message: "Processing timeout - audio may be too long"
}
```

## Frontend Error Handling Pattern

```javascript
try {
  const response = await fetch(endpoint);
  const data = await response.json();

  // Check response status
  if (!response.ok) {
    const errorMsg = data.details || data.error || 'Unknown error';
    throw new Error(errorMsg);
  }

  // Handle success
  return data;

} catch (error) {
  // Display to user
  setError(error.message);
  
  // Log for debugging
  console.error('API Error:', error);
}
```

## Testing with cURL

### Upload Audio
```bash
curl -X POST http://localhost:5000/api/audio/upload \
  -F "audio=@/path/to/meeting.mp3"
```

### Check Status
```bash
curl http://localhost:5000/api/audio/status/a1b2c3d4-e5f6-7890-abcd-ef1234567890
```

### Health Check
```bash
curl http://localhost:5000/api/health
```

## Testing with Postman

1. **Create request:** POST /api/audio/upload
2. **Body:** form-data
3. **Key:** audio (File type)
4. **Value:** Select your audio file
5. **Send**
6. **Copy meetingId from response**
7. **Create new GET request:** /api/audio/status/:meetingId
8. **Repeat to see status changes**

## Environment Variables

**Frontend (.env.local):**
```env
VITE_API_URL=http://localhost:5000
VITE_FIREBASE_API_KEY=...
```

**Backend (.env):**
```env
PORT=5000
CORS_ORIGIN=http://localhost:3000
OPENAI_API_KEY=sk-...
HUGGINGFACE_API_KEY=hf_...
```

## Request/Response Timing

- **Upload:** 1-5 seconds (network dependent)
- **Processing:** 30 seconds - 5 minutes (audio length dependent)
- **Status check:** < 100ms
- **Polling interval:** 3 seconds

## CORS Configuration

Ensure backend allows frontend requests:

```javascript
// backend - allowed origin
CORS_ORIGIN=http://localhost:3000

// frontend - same origin
VITE_API_URL=http://localhost:5000
```

## Browser DevTools Debugging

### Network Tab
1. Open DevTools (F12)
2. Go to Network tab
3. Perform action (upload, status check)
4. Click request
5. View Request/Response headers and body

### Console Tab
1. Check for JavaScript errors
2. View logged API responses
3. Test API manually:
```javascript
fetch('http://localhost:5000/api/health')
  .then(r => r.json())
  .then(console.log)
```

### Storage Tab
1. View localStorage keys
2. Inspect userMeetings data
3. Monitor auth state changes

## Performance Tips

1. **Minimize API calls**
   - Cache responses in state
   - Use localStorage for persistence
   - Avoid polling when not needed

2. **Handle network delays**
   - Show loading states
   - Implement timeouts
   - Queue failed requests

3. **Optimize file uploads**
   - Validate before upload
   - Show progress
   - Handle large files

4. **Efficient polling**
   - Stop polling when ready
   - Use appropriate intervals (3s)
   - Implement exponential backoff for errors

## Future API Endpoints (Planned)

```javascript
// Transcribe (placeholder)
POST /api/audio/transcribe
Request: { meetingId }
Response: { transcript, duration }

// Generate Notes (placeholder)
POST /api/audio/generate-notes
Request: { meetingId, transcript }
Response: { summary, keyPoints, actionItems }

// Get Meeting (future)
GET /api/meetings/:meetingId
Response: { Meeting object with all data }

// List Meetings (future)
GET /api/meetings
Response: { Array of meetings for user }

// Delete Meeting (future)
DELETE /api/meetings/:meetingId
Response: { success }
```

## API Rate Limits (Recommended)

- Upload: 10 per minute per user
- Status checks: No limit (low overhead)
- Processing: 1 per 30 seconds per meeting

## Troubleshooting

### 502 Bad Gateway
- Backend server crashed
- Check terminal for errors
- Restart: `npm run dev`

### 403 Forbidden / CORS Error
- Frontend URL not in CORS_ORIGIN
- Check backend .env CORS_ORIGIN value
- Ensure URLs match exactly (with protocol)

### 413 Payload Too Large
- File exceeds 100MB limit
- Check file size before upload

### 500 Internal Server Error
- Backend error processing
- Check backend logs for details
- Usually API key issues

### Polling not updating
- Meeting not processing on backend
- Check backend logs
- Verify API keys are correct
- Try manual status check in browser

---

**Last Updated:** January 16, 2026  
**API Version:** 1.0.0  
**Backend Version:** 1.0.0
