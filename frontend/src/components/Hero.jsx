import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Play } from 'lucide-react';
import { Link } from 'react-router-dom';

const Hero = () => {
  /* 
    FUTURE INTEGRATION NOTE:
    This component will eventually handle the file upload or recording initialization.
    
    Implementation Plan:
    1. Add state for file selection (const [file, setFile] = useState(null))
    2. Integrate with OpenAI Whisper API for transcription
    3. Send transcript to LLM (GPT-4) for summarization
    
    Example function stub:
    const handleFileUpload = async (file) => {
      // 1. Upload to storage (Supabase Storage)
      // 2. Trigger Edge Function for processing
    }
  */

  return (
    <section className="relative overflow-hidden py-20 sm:py-32">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-transparent dark:from-blue-950/30 dark:to-transparent" />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="space-y-8"
          >
            <div className="inline-flex items-center space-x-2 bg-blue-100 dark:bg-blue-900/30 px-4 py-2 rounded-full">
              <span className="h-2 w-2 bg-blue-600 rounded-full animate-pulse" />
              <span className="text-sm font-medium text-blue-900 dark:text-blue-300">AI-Powered Meeting Intelligence</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 dark:text-white leading-tight">
              Transform Your Meetings Into
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-800 dark:from-blue-400 dark:to-blue-600"> Actionable Insights</span>
            </h1>

            <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
              Never miss important details again. Our AI-powered Smart Meeting Notes Generator automatically transcribes, summarizes, and organizes your meetings into clear, actionable documentation.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                to="/signup"
                className="inline-flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-all duration-200 group hover:shadow-lg hover:-translate-y-0.5"
              >
                Get Started Free
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              
              <button
                className="inline-flex items-center justify-center border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 px-8 py-3 rounded-lg font-semibold transition-all duration-200 group"
                onClick={() => window.alert("Demo video player would open here.")}
              >
                <Play className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
                Watch Demo
              </button>
            </div>

            <div className="flex items-center space-x-8 pt-4">
              <div>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">10K+</p>
                <p className="text-sm text-slate-600 dark:text-slate-400">Active Users</p>
              </div>
              <div className="h-12 w-px bg-slate-300 dark:bg-slate-700" />
              <div>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">500K+</p>
                <p className="text-sm text-slate-600 dark:text-slate-400">Meetings Processed</p>
              </div>
              <div className="h-12 w-px bg-slate-300 dark:bg-slate-700" />
              <div>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">98%</p>
                <p className="text-sm text-slate-600 dark:text-slate-400">Accuracy Rate</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="relative"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-blue-600 rounded-2xl blur-3xl opacity-20" />
            <div className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-2xl p-2 border border-slate-200 dark:border-slate-800">
              <img alt="Smart Meeting Notes Dashboard Interface showing transcription and summary panels" className="rounded-xl w-full" src="/LP Img.png" />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Hero;