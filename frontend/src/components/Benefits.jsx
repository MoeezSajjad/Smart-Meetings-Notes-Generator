import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Users, Target, Clock } from 'lucide-react';

const benefits = [
  {
    icon: Clock,
    title: 'Save 5+ Hours Weekly',
    description: 'Eliminate manual note-taking and post-meeting documentation. Focus on what matters most.',
    stat: '70%',
    statLabel: 'Time Saved',
  },
  {
    icon: Target,
    title: 'Never Miss Action Items',
    description: 'Automatically capture and track every action item with clear ownership and deadlines.',
    stat: '95%',
    statLabel: 'Task Completion',
  },
  {
    icon: Users,
    title: 'Improve Team Alignment',
    description: 'Ensure everyone is on the same page with consistent, comprehensive meeting documentation.',
    stat: '85%',
    statLabel: 'Better Alignment',
  },
  {
    icon: TrendingUp,
    title: 'Boost Productivity',
    description: 'Turn meetings into actionable insights that drive results and keep projects moving forward.',
    stat: '3x',
    statLabel: 'Productivity Increase',
  },
];

const Benefits = () => {
  return (
    <section id="benefits" className="py-20 bg-white dark:bg-slate-950 transition-colors duration-300">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-4">
            Real Results for Your Team
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Join thousands of teams already experiencing the transformative power of smart meeting notes
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="text-center group"
              >
                <div className="relative inline-block mb-6">
                  <div className="absolute inset-0 bg-blue-600 rounded-full blur-xl opacity-30 group-hover:opacity-50 transition-opacity duration-300" />
                  <div className="relative h-20 w-20 mx-auto rounded-full bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center">
                    <Icon className="h-10 w-10 text-white" />
                  </div>
                </div>
                
                <div className="mb-4">
                  <p className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-1">
                    {benefit.stat}
                  </p>
                  <p className="text-sm text-slate-500 dark:text-slate-500 font-medium">
                    {benefit.statLabel}
                  </p>
                </div>
                
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">
                  {benefit.title}
                </h3>
                
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                  {benefit.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Benefits;