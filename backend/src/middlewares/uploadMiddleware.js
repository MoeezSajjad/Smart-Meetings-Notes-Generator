import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Define upload directory
const uploadDir = path.join(__dirname, '../../uploads');

// Create uploads directory if it doesn't exist
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Create unique filename: timestamp_originalname
    const uniqueSuffix = Date.now() + '_' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);
    const basename = path.basename(file.originalname, extension);
    cb(null, `${basename}_${uniqueSuffix}${extension}`);
  }
});

// File filter to validate audio formats and file size
const fileFilter = (req, file, cb) => {
  // Allowed audio MIME types
  const allowedMimeTypes = [
    'audio/wav',
    'audio/mpeg',        // mp3
    'audio/mp3',         // mp3 (alternative)
    'audio/x-wav',       // wav (alternative)
    'audio/x-m4a',       // m4a
    'audio/mp4'          // m4a (alternative)
  ];

  // Allowed file extensions
  const allowedExtensions = ['.wav', '.mp3', '.m4a'];

  // Check MIME type
  if (!allowedMimeTypes.includes(file.mimetype)) {
    return cb(new Error(`Invalid file format. Only WAV, MP3, and M4A files are allowed. Received: ${file.mimetype}`), false);
  }

  // Check file extension
  const extension = path.extname(file.originalname).toLowerCase();
  if (!allowedExtensions.includes(extension)) {
    return cb(new Error(`Invalid file extension. Only .wav, .mp3, and .m4a are allowed. Received: ${extension}`), false);
  }

  cb(null, true);
};

// Configure multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit
  }
});

/**
 * Upload middleware for single audio file
 * Expects form field name: 'audio'
 */
export const uploadMiddleware = (req, res, next) => {
  const singleFileUpload = upload.single('audio');

  singleFileUpload(req, res, (err) => {
    // Handle multer errors
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(413).json({
          error: 'File too large',
          details: `File size exceeds 100MB limit. Received: ${(err.limit / 1024 / 1024).toFixed(2)}MB`,
          status: 413,
          timestamp: new Date().toISOString()
        });
      }
      if (err.code === 'LIMIT_PART_COUNT') {
        return res.status(400).json({
          error: 'Too many parts in request',
          status: 400,
          timestamp: new Date().toISOString()
        });
      }
      return res.status(400).json({
        error: 'Upload error',
        details: err.message,
        status: 400,
        timestamp: new Date().toISOString()
      });
    }

    // Handle custom file filter errors
    if (err) {
      return res.status(400).json({
        error: 'Invalid file',
        details: err.message,
        status: 400,
        timestamp: new Date().toISOString()
      });
    }

    // Check if file was provided
    if (!req.file) {
      return res.status(400).json({
        error: 'No audio file provided',
        details: 'Please provide an audio file in the "audio" form field',
        status: 400,
        timestamp: new Date().toISOString()
      });
    }

    // File successfully uploaded, proceed to next middleware/controller
    next();
  });
};

/**
 * Clean up uploaded file (utility function)
 * Can be used when processing is done or if an error occurs
 */
export const deleteUploadedFile = (filePath) => {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log(`File deleted: ${filePath}`);
    }
  } catch (error) {
    console.error(`Error deleting file ${filePath}:`, error);
  }
};

/**
 * Get upload directory path
 * Useful for other parts of the application that need to access uploaded files
 */
export const getUploadDir = () => uploadDir;
