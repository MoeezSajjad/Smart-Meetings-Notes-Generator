import fs from 'fs';
import path from 'path';
import FormData from 'form-data';

/**
 * Transcribe audio file using Groq Whisper API
 * @param {string} audioFilePath - Path to the local audio file
 * @returns {Promise<string>} - Transcription text
 */
export const transcribeAudio = async (audioFilePath) => {
  const groqApiKey = process.env.GROQ_API_KEY;
  
  if (!groqApiKey) {
    throw new Error('GROQ_API_KEY is not set in environment variables');
  }

  if (!fs.existsSync(audioFilePath)) {
    throw new Error(`Audio file not found: ${audioFilePath}`);
  }

  console.log('[Whisper] Starting transcription for:', audioFilePath);

  try {
    const formData = new FormData();
    
    // Create read stream
    const fileStream = fs.createReadStream(audioFilePath);
    const fileName = path.basename(audioFilePath);
    
    // Append file - form-data package handles this correctly
    formData.append('file', fileStream, fileName);
    formData.append('model', 'whisper-large-v3');

    // Use form-data's submit method instead of fetch
    const response = await new Promise((resolve, reject) => {
      formData.submit(
        {
          protocol: 'https:',
          host: 'api.groq.com',
          path: '/openai/v1/audio/transcriptions',
          headers: {
            'Authorization': `Bearer ${groqApiKey}`,
          },
        },
        (err, res) => {
          if (err) return reject(err);
          
          let data = '';
          res.on('data', chunk => data += chunk);
          res.on('end', () => {
            if (res.statusCode !== 200) {
              reject(new Error(`Groq API error: ${res.statusCode} - ${data}`));
            } else {
              resolve({ ok: true, data });
            }
          });
          res.on('error', reject);
        }
      );
    });

    const result = JSON.parse(response.data);
    
    if (!result.text || result.text.trim().length === 0) {
      throw new Error('Transcription returned empty text');
    }
    
    console.log('[Whisper] Transcription completed successfully');
    console.log('[Whisper] Transcript length:', result.text.length, 'characters');
    
    return result.text;
  } catch (error) {
    console.error('[Whisper] Transcription failed:', error);
    throw new Error(`Transcription failed: ${error.message}`);
  }
};

export const validateAudioFile = (file) => {
  const supportedFormats = ['mp3', 'wav', 'webm', 'm4a'];
  const fileExtension = file.name.split('.').pop().toLowerCase();
  
  if (!supportedFormats.includes(fileExtension)) {
    throw new Error(`Unsupported audio format: ${fileExtension}`);
  }
  
  return true;
};