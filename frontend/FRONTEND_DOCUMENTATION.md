# Smart Meeting Notes Generator - Frontend Documentation

## Overview

This is a modern React+Vite frontend application for the AI-Powered Smart Meeting Notes Generator. The application allows users to upload meeting audio files, which are then processed by the backend to generate transcriptions and AI-powered summaries.

## Project Structure

```
src/
├── components/
│   ├── Header.jsx              # Navigation header with auth state
│   ├── Hero.jsx                # Landing page hero section
│   ├── Features.jsx            # Features showcase
│   ├── HowItWorks.jsx          # Process explanation
│   ├── Benefits.jsx            # Key benefits
│   ├── CallToAction.jsx        # CTA section
│   ├── Footer.jsx              # Footer
│   ├── Login.jsx               # Login form
│   ├── Signup.jsx              # Registration form
│   ├── Dashboard.jsx           # User meetings list
│   ├── Upload.jsx              # Audio upload page
│   ├── MeetingDetails.jsx      # Meeting notes viewer
│   ├── Profile.jsx             # User profile settings
│   └── Pricing.jsx             # Pricing page
├── App.jsx                     # Main app with routing
├── firebase.js                 # Firebase authentication
├── main.jsx                    # App entry point
└── index.css                   # Global styles
```

## Pages & Routes

| Route | Component | Purpose | Auth Required |
|-------|-----------|---------|---------------|
| `/` | Landing | Home page with features | No |
| `/signup` | Signup | User registration | No |
| `/login` | Login | User login | No |
| `/pricing` | Pricing | Pricing plans | No |
| `/dashboard` | Dashboard | List of user meetings | Yes |
| `/upload` | Upload | Upload audio files | Yes |
| `/meeting/:meetingId` | MeetingDetails | View meeting notes | Yes |
| `/profile` | Profile | User settings | Yes |

## Features

### 1. **Authentication**
- Firebase-based email/password authentication
- Protected routes (require login)
- User state persistence via localStorage
- Dark/Light mode toggle

### 2. **Dashboard**
- View all uploaded meetings
- Search and filter by status
- Download meeting notes as JSON/Markdown
- Delete meetings
- Quick access to upload new meetings

### 3. **Audio Upload**
- Drag & drop file upload
- Support for MP3, WAV, M4A formats
- File size validation (max 100MB)
- Upload progress tracking
- Real-time status updates

### 4. **Meeting Details**
- View transcription
- Read AI-generated summary
- Browse key points
- Track action items with priorities
- Download meeting notes
- Real-time processing status

### 5. **User Profile**
- View account information
- Update profile settings
- Manage notification preferences
- Logout functionality

### 6. **Pricing**
- Multiple plan tiers (Starter, Professional, Enterprise)
- Feature comparison
- FAQ section
- Contact sales option

## API Integration

### Backend Base URL
The application communicates with the backend via:
```
http://localhost:5000  (development)
```

Configure via `VITE_API_URL` environment variable.

### Key API Endpoints

#### 1. Upload Audio
```javascript
POST /api/audio/upload
Content-Type: multipart/form-data

Request:
- audio: File

Response:
{
  "success": true,
  "data": {
    "meetingId": "uuid",
    "originalFileName": "meeting.mp3",
    "fileSize": 5242880,
    "uploadedAt": "2026-01-16T10:30:00.000Z"
  }
}
```

#### 2. Check Upload Status
```javascript
GET /api/audio/status/:meetingId

Response:
{
  "meetingId": "uuid",
  "status": "processing|transcribed|ready",
  "message": "Processing status"
}
```

#### 3. Health Check
```javascript
GET /api/health

Response:
{
  "status": "Server is running"
}
```

### Implementation Examples

**Upload Component:**
```javascript
const handleUpload = async (file) => {
  const formData = new FormData();
  formData.append('audio', file);

  const response = await fetch('http://localhost:5000/api/audio/upload', {
    method: 'POST',
    body: formData,
  });

  const data = await response.json();
  return data;
};
```

**Check Processing Status:**
```javascript
const checkStatus = async (meetingId) => {
  const response = await fetch(
    `http://localhost:5000/api/audio/status/${meetingId}`
  );
  return response.json();
};
```

**Polling for Updates:**
The `MeetingDetails` component automatically polls the status endpoint every 3 seconds while processing. When status becomes 'ready', it displays the notes.

## Data Management

### localStorage Structure
Meetings are stored in localStorage with this structure:

```javascript
// userMeetings (JSON array)
[
  {
    "meetingId": "uuid",
    "fileName": "meeting.mp3",
    "fileSize": 5242880,
    "uploadedAt": "2026-01-16T10:30:00.000Z",
    "serverPath": "uploads/...",
    "status": "ready|processing|uploaded",
    "transcript": "Full text transcript...",
    "notes": {
      "summary": "Executive summary",
      "keyPoints": ["Point 1", "Point 2"],
      "actionItems": [
        {
          "task": "Task description",
          "owner": "John Doe",
          "priority": "high|medium|low"
        }
      ]
    }
  }
]

// user (JSON object - Firebase user data)
{
  "uid": "user-id",
  "email": "user@example.com",
  "displayName": "User Name"
}
```

## Installation & Setup

### Prerequisites
- Node.js 16+ and npm
- Backend API running on http://localhost:5000

### Installation
```bash
# Install dependencies
npm install

# Create .env.local file
VITE_API_URL=http://localhost:5000
VITE_FIREBASE_CONFIG=your_firebase_config

# Start development server
npm run dev

# Build for production
npm build

# Preview production build
npm run preview
```

### Environment Variables
Create `.env.local`:
```env
VITE_API_URL=http://localhost:5000
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_API_KEY=your-api-key
```

## Dependencies

### Core
- `react` - UI library
- `react-dom` - React DOM utilities
- `react-router-dom` - Client-side routing
- `vite` - Build tool

### UI & Styling
- `tailwindcss` - Utility-first CSS
- `framer-motion` - Animation library
- `lucide-react` - Icon library
- `@radix-ui/*` - Accessible UI components

### Firebase
- `firebase` - Authentication & services

### Utilities
- `class-variance-authority` - CSS variant generation
- `clsx` - Conditional classnames
- `tailwind-merge` - Merge Tailwind classes

## Firebase Setup

1. Create a Firebase project at https://console.firebase.google.com
2. Enable Email/Password authentication
3. Get your Firebase config
4. Add to environment variables

```javascript
// firebase.js configuration
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: "your-app.firebaseapp.com",
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  // ... rest of config
};
```

## UI Components

The application uses a consistent design system with:

- **Colors**: Blue primary (#2563EB), Slate neutral palette
- **Spacing**: Tailwind scale (4px base)
- **Typography**: 
  - Headlines: Bold, 24-48px
  - Body: Regular, 14-16px
  - Labels: Medium, 12-14px
- **Components**: Radix UI primitives for accessibility
- **Dark Mode**: Automatic color inversion

## Performance Optimizations

- Code splitting with React Router
- Lazy loading components
- Optimized images
- CSS modules for scoping
- Tailwind CSS purging
- Framer Motion for efficient animations

## Error Handling

### API Error Responses
```javascript
// Handled in Upload and MeetingDetails components
try {
  const response = await fetch(endpoint);
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.details || data.error);
  }
} catch (error) {
  setError(error.message);
}
```

### User Feedback
- Toast notifications (Radix UI)
- Error messages with icons
- Success confirmations
- Loading states with spinners

## Best Practices

1. **Authentication**
   - Always check `getLocalUser()` before accessing protected data
   - Redirect to login on auth failure
   - Store user session in localStorage

2. **API Calls**
   - Use try-catch for async operations
   - Handle both success and error responses
   - Show loading states to users
   - Implement proper error messages

3. **Data Persistence**
   - Store meetings in localStorage
   - Sync with backend when possible
   - Clear data on logout

4. **Performance**
   - Use `React.memo()` for expensive components
   - Implement debouncing for search
   - Lazy load images and routes

## Testing

```bash
# Run tests (if configured)
npm run test

# Build and test
npm run build
npm run preview
```

## Deployment

### Vercel
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Netlify
```bash
# Build
npm run build

# Deploy dist/ folder to Netlify
```

### Custom Server
```bash
# Build
npm run build

# Serve dist/ with static server
npx serve dist
```

## Troubleshooting

### API Connection Issues
- Check backend is running: `http://localhost:5000/api/health`
- Verify CORS settings in backend
- Check network tab in DevTools

### Auth Issues
- Clear localStorage: `localStorage.clear()`
- Check Firebase configuration
- Verify .env variables are loaded

### Build Errors
- Clear node_modules: `rm -rf node_modules && npm install`
- Clear Vite cache: `rm -rf .vite`
- Check Node version: `node --version`

## Support & Documentation

- Backend API docs: See `backend/API_DOCUMENTATION.md`
- React Router: https://reactrouter.com
- Tailwind CSS: https://tailwindcss.com
- Firebase: https://firebase.google.com/docs

## License

Proprietary - Smart Meeting Notes Generator

## Contributing

Follow these guidelines:
1. Create feature branches from `main`
2. Follow existing code style
3. Write meaningful commit messages
4. Test before pushing
5. Create pull requests for review
