import { readFile } from 'node:fs/promises';
import path from 'node:path';

export const transcribeAudio = async (audioFilePath) => {
  const audio = await readFile(audioFilePath);
  const form = new FormData();
  form.append('file', new Blob([audio]), path.basename(audioFilePath));
  form.append('model', process.env.GROQ_TRANSCRIPTION_MODEL || 'whisper-large-v3');
  const response = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${process.env.GROQ_API_KEY}` },
    body: form,
    signal: AbortSignal.timeout(120_000),
  });
  if (!response.ok) throw new Error(`Transcription provider returned ${response.status}`);
  const data = await response.json();
  if (typeof data.text !== 'string' || !data.text.trim()) throw new Error('Empty transcription');
  return data.text;
};

export const validateAudioFile = (file) => {
  if (!['mp3', 'wav', 'webm', 'm4a'].includes(file.name.split('.').pop().toLowerCase())) throw new Error('Unsupported audio format');
  return true;
};
