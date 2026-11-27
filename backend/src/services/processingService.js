import { deleteUploadedFile } from "../middlewares/uploadMiddleware.js";
import { transcribeAudio } from "./whisperService.js";
import { generateNotesFromTranscript } from "./notesService.js";
import { storeMeeting } from "./storageService.js";

export async function processAudioFile(
  id,
  file,
  transcribe = transcribeAudio,
  summarize = generateNotesFromTranscript,
) {
  try {
    storeMeeting(id, { status: "processing" });
    const transcript = await transcribe(file);
    const notes = await summarize(transcript);
    storeMeeting(id, { status: "ready", transcript, notes });
  } catch {
    storeMeeting(id, { status: "error" });
  } finally {
    await deleteUploadedFile(file);
  }
}
