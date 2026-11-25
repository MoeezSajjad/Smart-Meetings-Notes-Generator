import { openAsBlob } from "node:fs";
import path from "node:path";

export async function transcribeAudio(file) {
  const body = new FormData();
  body.append("file", await openAsBlob(file), "meeting" + path.extname(file));
  body.append(
    "model",
    process.env.GROQ_TRANSCRIPTION_MODEL || "whisper-large-v3-turbo",
  );
  const response = await fetch(
    "https://api.groq.com/openai/v1/audio/transcriptions",
    {
      method: "POST",
      headers: { Authorization: "Bearer " + process.env.GROQ_API_KEY },
      body,
      signal: AbortSignal.timeout(120000),
    },
  );
  if (!response.ok) throw new Error("Transcription provider unavailable");
  const result = await response.json();
  if (
    typeof result.text !== "string" ||
    !result.text.trim() ||
    result.text.length > 100000
  )
    throw new Error("Unsupported transcript length");
  return result.text.trim();
}
