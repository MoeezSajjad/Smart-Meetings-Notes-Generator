import React from 'react';
import { motion } from 'framer-motion';
import { Upload, Brain, Download, Sparkles } from 'lucide-react';

/*
  AI INTEGRATION ARCHITECTURE:
  
  Step 1 (Upload):
  - Frontend uploads audio file to Supabase Storage bucket.
  
  Step 2 (AI Processing):
  - Supabase Database Webhook or Edge Function triggers on upload.
  - Calls Transcription API (OpenAI Whisper or Google Cloud Speech-to-Text).
  - Raw text is returned and stored in 'transcripts' table.
  
  Step 3 (Summarization):
  - Another Edge Function takes raw transcript.
  - Sends prompt to GPT-4: "Summarize this meeting and extract action items."
  - Structured JSON response is saved to 'summaries' table.
  
  Step 4 (Share):
  - Frontend fetches data from 'summaries' table for display.
*/

const steps = [
  {
    icon: Upload,
    number: '01',
    title: 'Upload or Record',
    description: 'Upload your meeting recording or use our live transcription feature during your meeting.',
  },
  {
    icon: Brain,
    number: '02',
    title: 'AI Processing',
    description: 'Our advanced AI analyzes the content, identifies speakers, and extracts key information.',
  },
  {
    icon: Sparkles,
    number: '03',
    title: 'Smart Summarization',
    description: 'Get organized summaries, action items, and insights automatically generated.',
  },
  {
    icon: Download,
    number: '04',
    title: 'Share & Collaborate',
    description: 'Export notes in various formats or share directly with your team for seamless collaboration.',
  },
];

const HowItWorks = () => {
  return (
    <section id="how-it-works" className="py-20 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 transition-colors duration-300">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-4">
            How It Works
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Transform your meetings in four simple steps
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.15 }}
                className="relative"
              >
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 shadow-lg border border-slate-200 dark:border-slate-800 hover:shadow-xl transition-all duration-300 h-full">
                  <div className="flex items-center justify-between mb-6">
                    <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center">
                      <Icon className="h-7 w-7 text-white" />
                    </div>
                    <span className="text-4xl font-bold text-blue-100 dark:text-blue-900">
                      {step.number}
                    </span>
                  </div>
                  
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">
                    {step.title}
                  </h3>
                  
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                    {step.description}
                  </p>
                </div>

                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-10">
                    <div className="h-0.5 w-8 bg-gradient-to-r from-blue-400 to-blue-600" />
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;