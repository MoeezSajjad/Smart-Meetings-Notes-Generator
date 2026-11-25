/**
 * In-memory storage for meeting data
 * In production, this should be replaced with a proper database
 */

const meetings = new Map();
// Demo-only retention: keep active work; expire completed records after one hour.
const timer = setInterval(() => {
  const cutoff = Date.now() - 60 * 60 * 1000;
  for (const [id, meeting] of meetings) {
    if (['ready', 'error'].includes(meeting.status) && Date.parse(meeting.updatedAt) < cutoff) meetings.delete(id);
  }
}, 60_000);
timer.unref();

/**
 * Store meeting data
 * @param {string} meetingId - Unique meeting identifier
 * @param {Object} data - Meeting data
 */
export const storeMeeting = (meetingId, data) => {
  const existing = meetings.get(meetingId) || {};
  meetings.set(meetingId, { ...existing, ...data, updatedAt: new Date().toISOString() });
  console.log(`[Storage] Meeting ${meetingId} stored`);
};

/**
 * Get meeting data by ID
 * @param {string} meetingId - Unique meeting identifier
 * @returns {Object|null} - Meeting data or null if not found
 */
export const getMeeting = (meetingId) => {
  return meetings.get(meetingId) || null;
};

/**
 * Update meeting status
 * @param {string} meetingId - Unique meeting identifier
 * @param {string} status - New status (uploaded, processing, ready, error)
 */
export const updateMeetingStatus = (meetingId, status) => {
  const existing = meetings.get(meetingId) || {};
  meetings.set(meetingId, { ...existing, status, updatedAt: new Date().toISOString() });
  console.log(`[Storage] Meeting ${meetingId} status updated to: ${status}`);
};

/**
 * Store transcript for a meeting
 * @param {string} meetingId - Unique meeting identifier
 * @param {string} transcript - Transcription text
 */
export const storeTranscript = (meetingId, transcript) => {
  const existing = meetings.get(meetingId) || {};
  meetings.set(meetingId, { ...existing, transcript, updatedAt: new Date().toISOString() });
  console.log(`[Storage] Transcript stored for meeting ${meetingId}`);
};

/**
 * Store notes for a meeting
 * @param {string} meetingId - Unique meeting identifier
 * @param {Object} notes - Generated notes
 */
export const storeNotes = (meetingId, notes) => {
  const existing = meetings.get(meetingId) || {};
  meetings.set(meetingId, { ...existing, notes, updatedAt: new Date().toISOString() });
  console.log(`[Storage] Notes stored for meeting ${meetingId}`);
};

/**
 * Get all meetings (for debugging)
 * @returns {Array} - Array of all meetings
 */
export const getAllMeetings = () => {
  return Array.from(meetings.entries()).map(([id, data]) => ({ id, ...data }));
};