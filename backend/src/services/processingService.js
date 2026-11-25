import { deleteUploadedFile } from '../middlewares/uploadMiddleware.js';
import { transcribeAudio } from './whisperService.js';
import { generateNotesFromTranscript } from './notesService.js';
import { storeMeeting, updateMeetingStatus, storeTranscript, storeNotes } from './storageService.js';

/**
 * Process an uploaded audio file: transcribe and generate notes
 * This runs asynchronously after file upload
 * @param {string} meetingId - Unique meeting identifier
 * @param {string} audioFilePath - Path to the uploaded audio file
 * @param {Object} metadata - Additional meeting metadata
 */
export const processAudioFile = async (meetingId, audioFilePath, metadata = {}) => {
  try {
    console.log(`[Processing] Starting processing for meeting ${meetingId}`);
    
    // Update status to processing
    updateMeetingStatus(meetingId, 'processing');

    // Step 1: Transcribe audio
    console.log(`[Processing] Step 1: Transcribing audio...`);
    const transcript = await transcribeAudio(audioFilePath);
    
    if (!transcript || transcript.trim().length === 0) {
      throw new Error('Transcription returned empty text');
    }

    // Store transcript
    storeTranscript(meetingId, transcript);
    console.log(`[Processing] Transcript length: ${transcript.length} characters`);

    // Step 2: Generate notes from transcript
    console.log(`[Processing] Step 2: Generating notes...`);
    const notes = await generateNotesFromTranscript(transcript);
    
    // Store notes
    storeNotes(meetingId, notes);

    // Update status to ready
    updateMeetingStatus(meetingId, 'ready');
    
    console.log(`[Processing] ✅ Meeting ${meetingId} processed successfully`);
    
    return {
      success: true,
      meetingId,
      transcript,
      notes,
    };
  } catch (error) {
    console.error(`[Processing] Failed to process meeting ${meetingId}`);
    
    // Update status to error
    updateMeetingStatus(meetingId, 'error');
    
    // Store error details
    storeMeeting(meetingId, {
      error: 'Processing failed',
    });

    throw new Error('Processing failed');
  } finally {
    deleteUploadedFile(audioFilePath);
  }
};