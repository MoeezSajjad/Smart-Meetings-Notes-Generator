import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import { processAudioFile } from '../services/processingService.js';
import { storeMeeting, getMeeting } from '../services/storageService.js';

/**
 * Upload audio file and generate unique meeting ID
 * POST /api/audio/upload
 * 
 * Expected multipart/form-data with 'audio' field
 * Supported formats: wav, mp3, m4a
 * Max file size: 25 MB
 */
export const uploadAudio = (req, res) => {
  try {
    // Check if file exists (multer middleware validates)
    if (!req.file) {
      return res.status(400).json({
        error: 'No audio file provided',
        status: 400,
        timestamp: new Date().toISOString()
      });
    }

    // Generate unique meeting ID
    const meetingId = uuidv4();
    const originalFileName = req.file.originalname;
    const fileSize = req.file.size;
    const mimeType = req.file.mimetype;
    const audioFilePath = req.file.path;

    // File extension
    const fileExtension = path.extname(originalFileName).toLowerCase();

    // Store initial meeting data
    storeMeeting(meetingId, {
      meetingId,
      ownerUid: req.user.uid,
      originalFileName,
      fileExtension,
      fileSize,
      mimeType,
      uploadedAt: new Date().toISOString(),
      status: 'uploaded',
    });

    // Start processing asynchronously (don't wait for it)
    // This allows the upload response to return immediately
    processAudioFile(meetingId, audioFilePath, {
      originalFileName,
      fileSize,
      mimeType,
    }).catch(error => {
      console.error(`[Upload] Background processing failed for ${meetingId}:`, error);
    });

    // Success response
    res.status(201).json({
      success: true,
      message: 'Audio file uploaded successfully. Processing has started.',
      status: 201,
      data: {
        meetingId: meetingId,
        originalFileName: originalFileName,
        fileExtension: fileExtension,
        fileSize: fileSize,
        mimeType: mimeType,
        uploadedAt: new Date().toISOString(),
        status: 'uploaded', // Will change to 'processing' then 'ready'
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      error: 'Failed to upload audio file',
      status: 500,
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * Get upload status by meeting ID
 * GET /api/audio/status/:meetingId
 */
export const getUploadStatus = (req, res) => {
  try {
    const { meetingId } = req.params;

    // Get meeting from storage
    const meeting = getMeeting(meetingId);

    if (!meeting || meeting.ownerUid !== req.user.uid) {
      return res.status(404).json({
        error: 'Meeting not found',
        meetingId: meetingId,
        status: 404,
        timestamp: new Date().toISOString()
      });
    }

    // Return meeting status and data
    res.json({
      meetingId: meetingId,
      status: meeting.status,
      message: getStatusMessage(meeting.status),
      data: {
        transcript: meeting.transcript || null,
        notes: meeting.notes || null,
        error: meeting.status === 'error' ? 'Processing failed. Please try again.' : null,
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to get status',
      status: 500,
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * Get human-readable status message
 */
const getStatusMessage = (status) => {
  const messages = {
    'uploaded': 'File uploaded and queued for processing',
    'processing': 'Transcribing audio and generating notes',
    'ready': 'Meeting notes are ready',
    'error': 'An error occurred during processing',
  };
  return messages[status] || 'Unknown status';
};

// Legacy route - can be removed or repurposed
export const processAudio = (req, res) => {
  res.json({ 
    message: 'This endpoint is deprecated. Processing happens automatically after upload.',
    info: 'Use POST /api/audio/upload to upload and process audio files.'
  });
};

// Legacy route - can be removed or repurposed
export const generateNotes = (req, res) => {
  res.json({ 
    message: 'This endpoint is deprecated. Notes generation happens automatically after transcription.',
    info: 'Use GET /api/audio/status/:meetingId to check processing status.'
  });
};