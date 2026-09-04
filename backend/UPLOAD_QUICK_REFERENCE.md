# Audio Upload API - Quick Reference

## Endpoint
```
POST /api/audio/upload
```

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Server
```bash
npm run dev
```

### 3. Upload Audio
```bash
curl -X POST http://localhost:5000/api/audio/upload \
  -F "audio=@meeting.mp3" \
  -H "Authorization: Bearer your_token_here"
```

## Response Example
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

## Key Features
- ✅ Unique meeting ID generation (UUID v4)
- ✅ File type validation (.wav, .mp3, .m4a)
- ✅ File size limit (100MB)
- ✅ Proper HTTP status codes (201, 400, 413, 500)
- ✅ Clear error messages
- ✅ Temporary file storage
- ✅ Automatic uploads directory creation

## File Locations

| File | Purpose |
|------|---------|
| [src/middlewares/uploadMiddleware.js](src/middlewares/uploadMiddleware.js) | File upload handling with multer |
| [src/controllers/audioController.js](src/controllers/audioController.js) | Upload controller logic |
| [src/routes/audioRoutes.js](src/routes/audioRoutes.js) | API endpoints definition |
| [src/index.js](src/index.js) | Server setup with routes |
| [uploads/](uploads/) | Temporary uploaded files directory |

## API Endpoints

### Upload Audio
```
POST /api/audio/upload
Content-Type: multipart/form-data

Field: audio (file)
Header: Authorization: Bearer <token>

Response: 201 Created with meetingId
```

### Get Upload Status
```
GET /api/audio/status/:meetingId
Header: Authorization: Bearer <token>

Response: 200 OK with status
```

## Error Codes
| Status | Error | Cause |
|--------|-------|-------|
| 400 | No audio file provided | Missing file in form data |
| 400 | Invalid file | Unsupported format or extension |
| 413 | File too large | Exceeds 100MB limit |
| 500 | Upload error | Server error |

## Authentication Integration
The upload endpoint can be protected with authentication:

```javascript
// Apply authentication middleware
router.post('/upload', authenticate, uploadMiddleware, uploadAudio);
```

See [AUTHENTICATION.md](AUTHENTICATION.md) for full authentication setup.

## JavaScript Client Example
```javascript
async function uploadMeetingAudio(audioFile, authToken) {
  const formData = new FormData();
  formData.append('audio', audioFile);

  const response = await fetch('/api/audio/upload', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${authToken}`
    },
    body: formData
  });

  if (!response.ok) {
    const error = await response.json();
    console.error('Upload failed:', error.error);
    return null;
  }

  const result = await response.json();
  return result.data.meetingId;
}

// Usage
const meetingId = await uploadMeetingAudio(audioFile, token);
```

## Supported Audio Formats
- WAV (.wav)
- MP3 (.mp3)
- M4A (.m4a)

## File Size Limits
- Maximum: 100MB
- Recommended: Under 50MB for better performance

## Notes
- Meeting ID is used to track the audio and related transcriptions
- Files are stored temporarily in `backend/uploads/` directory
- Implement cleanup after transcription processing
- Use authentication on production endpoints
- See [AUDIO_UPLOAD_API.md](AUDIO_UPLOAD_API.md) for full documentation
