import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  
  // API Keys
  openaiApiKey: process.env.OPENAI_API_KEY,
  huggingfaceApiKey: process.env.HUGGINGFACE_API_KEY,
  
  // Authentication
  jwtSecret: process.env.JWT_SECRET,
  // For Supabase: use process.env.SUPABASE_JWT_SECRET
  // For Firebase: use process.env.FIREBASE_PROJECT_ID, FIREBASE_PRIVATE_KEY, FIREBASE_CLIENT_EMAIL
  
  // Database (if needed)
  dbUrl: process.env.DB_URL,
};

export default config;
