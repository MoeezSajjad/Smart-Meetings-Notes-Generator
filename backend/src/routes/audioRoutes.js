// Audio processing routes
import express from 'express';
import { uploadAudio, getUploadStatus, processAudio, generateNotes } from '../controllers/audioController.js';
import { uploadMiddleware } from '../middlewares/uploadMiddleware.js';

const router = express.Router();

/**
 * POST /api/audio/upload
 * Upload audio file for meeting transcription
 * Requires: multipart/form-data with 'audio' field
 * Supported formats: .wav, .mp3, .m4a
 * Max size: 100MB
 */
router.post('/upload', uploadMiddleware, uploadAudio);

/**
 * GET /api/audio/status/:meetingId
 * Get status of uploaded audio file
 */
router.get('/status/:meetingId', getUploadStatus);

// Legacy routes (to be updated with real processing logic)
router.post('/transcribe', processAudio);
router.post('/generate-notes', generateNotes);

export default router;
