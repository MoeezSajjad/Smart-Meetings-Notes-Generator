import React from 'react';
import { motion } from 'framer-motion';
import { Mic, FileText, CheckCircle2, Search, Share2, Zap } from 'lucide-react';

const features = [
  {
    icon: Mic,
    title: 'Real-Time Transcription',
    description: 'Crystal-clear audio transcription with 98% accuracy, supporting multiple languages and accents.',
    color: 'from-blue-500 to-blue-600',
  },
  {
    icon: FileText,
    title: 'AI-Powered Summaries',
    description: 'Intelligent summarization that captures key points, decisions, and important discussions automatically.',
    color: 'from-indigo-500 to-indigo-600',
  },
  {
    icon: CheckCircle2,
    title: 'Action Item Extraction',
    description: 'Automatically identifies and organizes action items with assignees and deadlines.',
    color: 'from-violet-500 to-violet-600',
  },
  {
    icon: Search,
    title: 'Smart Search',
    description: 'Find any discussion, decision, or action item across all your meetings instantly.',
    color: 'from-purple-500 to-purple-600',
  },
  {
    icon: Share2,
    title: 'Easy Sharing',
    description: 'Share meeting notes with team members, stakeholders, or integrate with your favorite tools.',
    color: 'from-fuchsia-500 to-fuchsia-600',
  },
  {
    icon: Zap,
    title: 'Instant Insights',
    description: 'Get meeting analytics, participation metrics, and trends to improve team collaboration.',
    color: 'from-pink-500 to-pink-600',
  },
];

const Features = () => {
  return (
    <section id="features" className="py-20 bg-white dark:bg-slate-950 transition-colors duration-300">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-4">
            Powerful Features
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Everything you need to capture, organize, and act on your meeting insights.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="group relative bg-slate-50 dark:bg-slate-900 rounded-2xl p-8 border border-slate-200 dark:border-slate-800 hover:border-blue-500 dark:hover:border-blue-500 transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-5 rounded-2xl transition-opacity duration-300`} />
                
                <div className={`relative h-14 w-14 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className="h-7 w-7 text-white" />
                </div>
                
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">
                  {feature.title}
                </h3>
                
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Features;