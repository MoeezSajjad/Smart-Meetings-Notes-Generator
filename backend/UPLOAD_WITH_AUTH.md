# Audio Upload with Authentication

This guide shows how to secure the audio upload endpoint with authentication.

## Setup

### 1. Protect the Upload Route
Update [src/routes/audioRoutes.js](src/routes/audioRoutes.js):

```javascript
import express from 'express';
import { authenticate } from '../middlewares/index.js';
import { uploadAudio, getUploadStatus, processAudio, generateNotes } from '../controllers/audioController.js';
import { uploadMiddleware } from '../middlewares/uploadMiddleware.js';

const router = express.Router();

/**
 * POST /api/audio/upload
 * Protected: Requires valid JWT token
 */
router.post('/upload', authenticate, uploadMiddleware, uploadAudio);

/**
 * GET /api/audio/status/:meetingId
 * Protected: Requires valid JWT token
 */
router.get('/status/:meetingId', authenticate, getUploadStatus);

// Other routes...
router.post('/transcribe', authenticate, processAudio);
router.post('/generate-notes', authenticate, generateNotes);

export default router;
```

### 2. Verify Environment Setup
Ensure `.env` has JWT configuration:

```
JWT_SECRET=your_secret_key_here
CORS_ORIGIN=http://localhost:3000
```

See [AUTHENTICATION.md](AUTHENTICATION.md) for full setup.

## Testing Authenticated Upload

### Using cURL
```bash
# Generate a test token or use your JWT token
TOKEN="your_jwt_token_here"

curl -X POST http://localhost:5000/api/audio/upload \
  -F "audio=@meeting.mp3" \
  -H "Authorization: Bearer $TOKEN"
```

### Using JavaScript
```javascript
async function uploadAudioWithAuth(audioFile, token) {
  const formData = new FormData();
  formData.append('audio', audioFile);

  const response = await fetch('http://localhost:5000/api/audio/upload', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: formData
  });

  if (!response.ok) {
    if (response.status === 401) {
      console.error('Unauthorized: Invalid or missing token');
    } else if (response.status === 400) {
      const error = await response.json();
      console.error('Upload error:', error.error);
    }
    return null;
  }

  const result = await response.json();
  return result.data.meetingId;
}

// Get token from localStorage (set after login)
const token = localStorage.getItem('authToken');
const meetingId = await uploadAudioWithAuth(audioFile, token);

if (meetingId) {
  console.log('Upload successful! Meeting ID:', meetingId);
}
```

### Using Postman
1. **Create Request**
   - Method: POST
   - URL: `http://localhost:5000/api/audio/upload`

2. **Authorization Tab**
   - Type: Bearer Token
   - Token: Your JWT token

3. **Body Tab**
   - Type: form-data
   - Key: `audio`
   - Value: Select your audio file

4. **Send** and check response

## Error Responses

### 401 Unauthorized (Missing Token)
```json
{
  "error": "Missing authorization token",
  "status": 401,
  "timestamp": "2026-01-16T10:30:00.000Z"
}
```

**Solution:** Add Authorization header with valid JWT token

### 401 Unauthorized (Invalid Token)
```json
{
  "error": "Unauthorized: Invalid or expired token",
  "status": 401,
  "timestamp": "2026-01-16T10:30:00.000Z"
}
```

**Solution:** 
- Check token validity
- Refresh token if expired
- Re-authenticate if needed

### 400 Bad Request (No File)
```json
{
  "error": "No audio file provided",
  "status": 400,
  "timestamp": "2026-01-16T10:30:00.000Z"
}
```

**Solution:** Ensure form field name is `audio` and file is selected

## Flow Diagram

```
Client Request
    ↓
[Authorization Header Check]
    ├─ No token → 401 Unauthorized
    ├─ Invalid format → 401 Bad format
    └─ Valid token → Continue
    ↓
[File Upload Processing]
    ├─ No file → 400 Bad Request
    ├─ Invalid format → 400 Bad Request
    ├─ File too large → 413 Payload Too Large
    └─ Valid file → Continue
    ↓
[Generate Meeting ID]
    ↓
[Save File Temporarily]
    ↓
[Return 201 with meetingId]
```

## Frontend Integration Example

### React Component
```jsx
import { useState } from 'react';

export function AudioUpload({ authToken }) {
  const [uploading, setUploading] = useState(false);
  const [meetingId, setMeetingId] = useState(null);
  const [error, setError] = useState(null);

  const handleUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append('audio', file);

    try {
      const response = await fetch('/api/audio/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`
        },
        body: formData
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Upload failed');
      }

      const result = await response.json();
      setMeetingId(result.data.meetingId);
      console.log('Meeting ID:', result.data.meetingId);
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <input
        type="file"
        accept=".wav,.mp3,.m4a"
        onChange={handleUpload}
        disabled={uploading}
      />
      {uploading && <p>Uploading...</p>}
      {meetingId && <p>Meeting ID: {meetingId}</p>}
      {error && <p style={{ color: 'red' }}>Error: {error}</p>}
    </div>
  );
}
```

## Production Considerations

1. **Database Integration**
   - Store meeting metadata (meetingId, filename, userId, timestamp)
   - Track processing status
   - Enable audit logging

2. **File Cleanup**
   - Implement automatic cleanup after processing
   - Archive old files if needed
   - Monitor disk space

3. **Security**
   - Always use HTTPS
   - Validate tokens on every request
   - Implement rate limiting
   - Log all uploads for security audit

4. **Monitoring**
   - Track upload success/failure rates
   - Monitor upload directory size
   - Alert on errors
   - Log suspicious activity

## Disabling Authentication (Development Only)

For testing without authentication:

```javascript
// Remove authenticate middleware temporarily
router.post('/upload', uploadMiddleware, uploadAudio);

// Later, add it back for production
router.post('/upload', authenticate, uploadMiddleware, uploadAudio);
```

## Related Documentation
- [AUTHENTICATION.md](AUTHENTICATION.md) - Authentication setup
- [AUDIO_UPLOAD_API.md](AUDIO_UPLOAD_API.md) - Full upload API docs
- [UPLOAD_QUICK_REFERENCE.md](UPLOAD_QUICK_REFERENCE.md) - Quick reference
