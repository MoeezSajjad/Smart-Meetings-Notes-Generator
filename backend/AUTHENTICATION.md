# Authentication Middleware Guide

## Overview
The authentication middleware validates JWT tokens from request headers and attaches user information to the request object. It rejects unauthorized requests with proper HTTP status codes (401/500).

## Implementation Details

### Middleware Location
- **File**: [src/middlewares/index.js](src/middlewares/index.js)
- **Export**: `authenticate`

### How It Works
1. Extracts the `Authorization` header from incoming requests
2. Validates the header format: `Bearer <token>`
3. Verifies the token (using your chosen auth method)
4. Attaches user data to `req.user` if valid
5. Rejects unauthorized requests with 401 status

### HTTP Status Codes
- **401**: Missing token, invalid format, or invalid token
- **500**: Server configuration error (missing JWT_SECRET)
- **200+**: Valid token, request proceeds

## Setup Instructions

### 1. Environment Variables
Add to your `.env` file:

**For JWT (using jsonwebtoken library):**
```
JWT_SECRET=your_super_secret_key_here
```

**For Supabase:**
```
SUPABASE_JWT_SECRET=your_supabase_secret_key
```

**For Firebase:**
```
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_PRIVATE_KEY=your_private_key
FIREBASE_CLIENT_EMAIL=your_client_email
```

### 2. Install Dependencies (Optional)

**For JWT with jsonwebtoken:**
```bash
npm install jsonwebtoken
```

**For Firebase:**
```bash
npm install firebase-admin
```

Supabase JWT tokens can be verified using the same `jsonwebtoken` library.

### 3. Update Middleware Code

Choose one of the implementations based on your authentication method:

#### Option A: JWT (jsonwebtoken library)
```javascript
import jwt from 'jsonwebtoken';

export const authenticate = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Missing or invalid authorization header',
        status: 401
      });
    }
    
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    req.user = decoded; // Contains: id, email, iat, exp, etc.
    next();
  } catch (error) {
    return res.status(401).json({
      error: 'Invalid or expired token',
      status: 401
    });
  }
};
```

#### Option B: Supabase JWT
```javascript
import jwt from 'jsonwebtoken';

export const authenticate = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Missing or invalid authorization header',
        status: 401
      });
    }
    
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.SUPABASE_JWT_SECRET);
    
    req.user = {
      id: decoded.sub,
      email: decoded.email,
      aud: decoded.aud
    };
    next();
  } catch (error) {
    return res.status(401).json({
      error: 'Unauthorized',
      status: 401
    });
  }
};
```

#### Option C: Firebase
```javascript
import admin from 'firebase-admin';

admin.initializeApp({
  projectId: process.env.FIREBASE_PROJECT_ID,
  privateKey: process.env.FIREBASE_PRIVATE_KEY,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL
});

export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Missing or invalid authorization header',
        status: 401
      });
    }
    
    const token = authHeader.split(' ')[1];
    const decoded = await admin.auth().verifyIdToken(token);
    
    req.user = {
      uid: decoded.uid,
      email: decoded.email
    };
    next();
  } catch (error) {
    return res.status(401).json({
      error: 'Unauthorized',
      status: 401
    });
  }
};
```

## Usage in Routes

### 1. Import the Middleware
```javascript
import { authenticate } from '../middlewares/index.js';
```

### 2. Apply to Routes
```javascript
// Protect a single route
router.get('/protected-route', authenticate, (req, res) => {
  console.log('User:', req.user);
  res.json({ message: 'Protected data', user: req.user });
});

// Protect all routes in a router
router.use(authenticate);
router.post('/upload', uploadController);
router.get('/data', dataController);
```

### 3. Access User Data in Controllers
```javascript
export const audioController = (req, res) => {
  const userId = req.user.id; // or req.user.uid for Firebase
  const userEmail = req.user.email;
  
  // Process request with user context
  res.json({ userId, userEmail });
};
```

## Example: Full Route Protection

```javascript
// src/routes/audioRoutes.js
import express from 'express';
import { authenticate } from '../middlewares/index.js';
import * as audioController from '../controllers/audioController.js';

const router = express.Router();

// All audio routes require authentication
router.use(authenticate);

router.post('/upload', audioController.uploadAudio);
router.get('/transcriptions', audioController.getTranscriptions);
router.delete('/:id', audioController.deleteAudio);

export default router;
```

## Token Format

Requests must include the Authorization header:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Example cURL Request
```bash
curl -X GET http://localhost:5000/api/audio/transcriptions \
  -H "Authorization: Bearer your_jwt_token_here"
```

### Example JavaScript Fetch
```javascript
const token = localStorage.getItem('authToken');

const response = await fetch('http://localhost:5000/api/audio/transcriptions', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});
```

## Error Responses

### Missing Token
```json
{
  "error": "Missing authorization token",
  "status": 401,
  "timestamp": "2026-01-16T10:30:00.000Z"
}
```

### Invalid Format
```json
{
  "error": "Invalid authorization header format. Expected: Bearer <token>",
  "status": 401,
  "timestamp": "2026-01-16T10:30:00.000Z"
}
```

### Invalid or Expired Token
```json
{
  "error": "Unauthorized: Invalid or expired token",
  "status": 401,
  "timestamp": "2026-01-16T10:30:00.000Z"
}
```

## Testing the Middleware

### Using Postman
1. Open Postman
2. Create a GET request to: `http://localhost:5000/api/audio`
3. Go to **Headers** tab
4. Add key: `Authorization`, value: `Bearer your_token_here`
5. Send request

### Using Node.js
```javascript
const testAuth = async () => {
  const token = 'your_token_here';
  
  const response = await fetch('http://localhost:5000/api/audio', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  console.log(await response.json());
};

testAuth();
```

## Notes

- The current implementation includes a placeholder token validation. Replace with your chosen method (JWT/Supabase/Firebase)
- Always verify tokens on the backend; never trust client-side claims
- Store sensitive keys in environment variables, never in code
- Use HTTPS in production to protect tokens in transit
- Consider implementing token refresh logic for long-lived sessions
