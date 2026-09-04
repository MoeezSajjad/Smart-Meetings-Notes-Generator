# Audio Upload API Documentation

## Overview
The audio upload endpoint allows clients to upload meeting audio files, validate them, and receive a unique meeting ID for tracking and processing.

## Endpoint

### POST `/api/audio/upload`
Upload a single audio file and receive a unique meeting ID.

**Content-Type:** `multipart/form-data`

## Request

### Required Parameters
- **Field name:** `audio`
- **Type:** File (binary)
- **Formats:** `.wav`, `.mp3`, `.m4a`
- **Max size:** 100MB

### Example cURL
```bash
curl -X POST http://localhost:5000/api/audio/upload \
  -F "audio=@/path/to/meeting.mp3" \
  -H "Authorization: Bearer your_token_here"
```

### Example JavaScript (fetch)
```javascript
const uploadAudio = async (audioFile, token) => {
  const formData = new FormData();
  formData.append('audio', audioFile); // File from <input type="file">

  const response = await fetch('http://localhost:5000/api/audio/upload', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: formData
  });

  const data = await response.json();
  return data;
};

// Usage
const fileInput = document.querySelector('input[type="file"]');
uploadAudio(fileInput.files[0], authToken).then(result => {
  console.log('Meeting ID:', result.data.meetingId);
});
```

### Example Python (requests)
```python
import requests

def upload_audio(file_path, token):
    headers = {
        'Authorization': f'Bearer {token}'
    }
    
    with open(file_path, 'rb') as f:
        files = {'audio': f}
        response = requests.post(
            'http://localhost:5000/api/audio/upload',
            files=files,
            headers=headers
        )
    
    return response.json()

# Usage
result = upload_audio('meeting.mp3', auth_token)
meeting_id = result['data']['meetingId']
```

## Response

### Success (201 Created)
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

### Error: No File Provided (400 Bad Request)
```json
{
  "error": "No audio file provided",
  "status": 400,
  "timestamp": "2026-01-16T10:30:00.000Z"
}
```

### Error: Invalid File Format (400 Bad Request)
```json
{
  "error": "Invalid file",
  "details": "Invalid file format. Only WAV, MP3, and M4A files are allowed. Received: audio/ogg",
  "status": 400,
  "timestamp": "2026-01-16T10:30:00.000Z"
}
```

### Error: File Too Large (413 Payload Too Large)
```json
{
  "error": "File too large",
  "details": "File size exceeds 100MB limit. Received: 150.25MB",
  "status": 413,
  "timestamp": "2026-01-16T10:30:00.000Z"
}
```

### Error: Invalid File Extension (400 Bad Request)
```json
{
  "error": "Invalid file",
  "details": "Invalid file extension. Only .wav, .mp3, and .m4a are allowed. Received: .flac",
  "status": 400,
  "timestamp": "2026-01-16T10:30:00.000Z"
}
```

### Error: Server Error (500 Internal Server Error)
```json
{
  "error": "Failed to upload audio file",
  "details": "Error message details",
  "status": 500,
  "timestamp": "2026-01-16T10:30:00.000Z"
}
```

## Get Upload Status

### GET `/api/audio/status/:meetingId`
Check the status of a previously uploaded audio file.

**Parameters:**
- `meetingId` (URL parameter): UUID from the upload response

### Example cURL
```bash
curl -X GET http://localhost:5000/api/audio/status/a1b2c3d4-e5f6-7890-abcd-ef1234567890 \
  -H "Authorization: Bearer your_token_here"
```

### Response
```json
{
  "meetingId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "status": "uploaded",
  "message": "File uploaded and ready for processing",
  "timestamp": "2026-01-16T10:30:00.000Z"
}
```

## Implementation Details

### File Storage
- **Location:** `backend/uploads/`
- **Naming:** `filename_timestamp_randomsuffix.extension`
- **Lifespan:** Temporary (should be cleaned up after processing)

### Meeting ID
- **Format:** UUID v4 (e.g., `a1b2c3d4-e5f6-7890-abcd-ef1234567890`)
- **Purpose:** Unique identifier for tracking the audio file and related transcriptions/notes
- **Generated:** On every upload (unique for each file)

### Supported Audio Formats
| Format | Extensions | MIME Types |
|--------|------------|-----------|
| WAV | .wav | audio/wav, audio/x-wav |
| MP3 | .mp3 | audio/mpeg, audio/mp3 |
| M4A | .m4a | audio/x-m4a, audio/mp4 |

### Validation Rules
1. File must have supported MIME type
2. File must have supported extension
3. File size must not exceed 100MB
4. Form field must be named `audio`

## Middleware Components

### Upload Middleware (`src/middlewares/uploadMiddleware.js`)
Handles:
- File upload with multer
- MIME type validation
- File extension validation
- File size limits
- Error handling

### Key Functions
```javascript
// Upload middleware
uploadMiddleware(req, res, next)

// Cleanup function (for future use)
deleteUploadedFile(filePath)

// Get upload directory
getUploadDir()
```

## Integration Example

### Protecting the Upload Endpoint with Authentication
```javascript
// src/routes/audioRoutes.js
import { authenticate } from '../middlewares/index.js';

// Apply authentication to upload route
router.post('/upload', authenticate, uploadMiddleware, uploadAudio);
```

### Using Meeting ID in Subsequent Operations
```javascript
// After upload, use meetingId for transcription
const { meetingId } = uploadResponse.data;

// POST /api/audio/transcribe with meetingId
const transcribeResponse = await fetch('/api/audio/transcribe', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    meetingId: meetingId
  })
});
```

## File Cleanup

### Manual Cleanup (After Processing)
```javascript
import { deleteUploadedFile, getUploadDir } from '../middlewares/uploadMiddleware.js';
import path from 'path';

// Delete uploaded file after processing
const uploadedFilePath = path.join(getUploadDir(), 'filename.mp3');
deleteUploadedFile(uploadedFilePath);
```

### Automatic Cleanup (Recommended)
Consider implementing:
1. Scheduled jobs to delete old uploads
2. Database records to track uploaded files and their processing status
3. Cleanup after successful transcription

## Testing

### Using Postman
1. Create a new POST request to: `http://localhost:5000/api/audio/upload`
2. Go to **Body** tab, select **form-data**
3. Add key: `audio`, type: **File**, value: select your audio file
4. Add header: `Authorization: Bearer your_token_here`
5. Click **Send**

### Using Thunder Client (VS Code Extension)
1. New request → POST
2. URL: `http://localhost:5000/api/audio/upload`
3. Form tab → Add field `audio` as `file`
4. Headers → Add `Authorization: Bearer token`
5. Send

### Using Insomnia
1. New request → POST → `http://localhost:5000/api/audio/upload`
2. Body → Multipart
3. Add field: `audio` (type: File)
4. Headers → `Authorization: Bearer token`
5. Send

## Installation & Setup

### 1. Install Dependencies
```bash
npm install
```

This installs:
- `multer` - File upload handling
- `uuid` - Unique ID generation

### 2. Start Server
```bash
npm run dev
# or
npm start
```

### 3. Test Endpoint
```bash
curl -X POST http://localhost:5000/api/audio/upload \
  -F "audio=@./test-audio.mp3"
```

## Best Practices

1. **Always use authentication** on production endpoints
2. **Validate file types** on both client and server
3. **Implement file cleanup** after processing
4. **Monitor upload directory** size and disk space
5. **Log uploads** for auditing and debugging
6. **Set reasonable size limits** based on your infrastructure
7. **Use HTTPS** in production
8. **Store meeting metadata** (meetingId, filename, size, timestamp) in database
9. **Implement upload progress tracking** on frontend
10. **Handle network errors** and retry logic on client

## Troubleshooting

### "ENOENT: no such file or directory" 
The `uploads/` directory doesn't exist. The middleware creates it automatically, but check permissions.

### "File too large"
The uploaded file exceeds 100MB. Either reduce file size or increase the limit in `uploadMiddleware.js`.

### "Invalid file format"
The MIME type or extension is not supported. Check [Supported Audio Formats](#supported-audio-formats) section.

### "No audio file provided"
The form field name is not `audio` or no file was selected. Verify the field name in your client.

### Upload returns 500 error
Check server logs. Ensure `uploads/` directory exists and is writable. Verify `multer` and `uuid` are installed.

## Future Enhancements

- [ ] Database integration to track uploads
- [ ] Virus scanning before processing
- [ ] Streaming upload for large files
- [ ] Resumable uploads (chunked upload)
- [ ] Upload progress notifications via WebSocket
- [ ] Automatic cleanup scheduler
- [ ] Storage optimization (compress audio)
- [ ] Multi-file batch uploads
