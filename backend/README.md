# AI-Powered Meeting Note Generator - Backend

Node.js Express backend for processing audio and generating meeting notes using OpenAI's Whisper API and Hugging Face Transformers.

## Project Structure

```
backend/
├── src/
│   ├── config/          # Configuration files
│   ├── controllers/     # Route controllers
│   ├── middlewares/     # Custom middlewares
│   ├── routes/          # API routes
│   ├── services/        # Business logic & API integrations
│   └── index.js         # Main server file
├── .env.example         # Environment variables template
├── package.json         # Dependencies
└── README.md           # This file
```

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env` and add your API keys:

```bash
cp .env.example .env
```

Edit `.env` with your values:
- `OPENAI_API_KEY` - Get from OpenAI platform
- `HUGGINGFACE_API_KEY` - Get from Hugging Face
- `PORT` - Server port (default: 5000)
- `NODE_ENV` - development or production
- `CORS_ORIGIN` - Frontend URL for CORS

### 3. Start the Server

**Development (with auto-reload):**
```bash
npm run dev
```

**Production:**
```bash
npm start
```

Server will run at `http://localhost:5000`

## API Endpoints

### Health Check
- `GET /api/health` - Server status

### Audio Processing (To be implemented)
- `POST /api/audio/transcribe` - Transcribe audio using Whisper API
- `POST /api/audio/generate-notes` - Generate notes from transcript
- `GET /api/audio/status/:id` - Check processing status

## Folder Details

### `/config`
Centralized configuration management for environment variables and API keys.

### `/controllers`
Handle request/response logic and call appropriate services.

### `/services`
Business logic layer:
- `whisperService.js` - Whisper API integration for audio transcription
- `huggingfaceService.js` - Hugging Face integration for NLP tasks

### `/middlewares`
Custom middlewares:
- Error handling
- Request logging
- Authentication (placeholder)
- Request validation

### `/routes`
API route definitions that use controllers.

## Features Ready to Implement

- ✅ Express server setup
- ✅ CORS enabled
- ✅ JSON body parsing
- ✅ Environment configuration
- ✅ Error handling middleware
- 🔄 Whisper API integration
- 🔄 Hugging Face Transformers integration
- 🔄 Audio file upload handling
- 🔄 Database integration (if needed)

## Development Notes

- Uses ES Modules (`"type": "module"` in package.json)
- Nodemon for auto-reload during development
- All services are async-ready for API calls

## Next Steps

1. Install dependencies: `npm install`
2. Create `.env` file with your API keys
3. Implement Whisper API calls in `whisperService.js`
4. Implement Hugging Face API calls in `huggingfaceService.js`
5. Add authentication middleware
6. Connect frontend to backend API
