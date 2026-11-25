const meetings = new Map();
export function storeMeeting(id, fields) {
  meetings.set(id, { ...meetings.get(id), ...fields, updated: Date.now() });
}
export const getMeeting = (id) => meetings.get(id);
export function metadata({ meetingId, originalFileName, uploadedAt, status }) {
  return { meetingId, originalFileName, uploadedAt, status };
}
export function listMeetings(uid) {
  return [...meetings.values()]
    .filter((m) => m.ownerUid === uid)
    .reverse()
    .map(metadata);
}
const timer = setInterval(() => {
  for (const [id, m] of meetings)
    if (Date.now() - m.updated > 3600000) meetings.delete(id);
}, 60000);
timer.unref();
