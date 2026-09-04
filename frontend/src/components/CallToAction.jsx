import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { getLocalUser } from '../firebase';

const CallToAction = () => {
  const user = getLocalUser();

  return (
    <section className="py-20 bg-slate-50 dark:bg-slate-900/50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative overflow-hidden bg-gradient-to-br from-blue-600 to-blue-800 rounded-3xl p-8 sm:p-16 text-center"
        >
          {/* Background Decorative Circles */}
          <div className="absolute top-0 left-0 w-64 h-64 bg-white opacity-5 rounded-full -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white opacity-5 rounded-full translate-x-1/3 translate-y-1/3" />

          <div className="relative z-10 max-w-3xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
              Ready to Transform Your Meetings?
            </h2>
            <p className="text-blue-100 text-lg mb-10 max-w-2xl mx-auto">
              Join thousands of teams who have revolutionized their meeting productivity with Smart Meeting Notes Generator.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to={user ? '/upload' : '/signup'}
                className="bg-white text-blue-700 hover:bg-blue-50 px-8 py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-200 hover:-translate-y-0.5"
              >
                Start Free Trial
              </Link>
              <Link
                to="/pricing"
                className="bg-blue-700 text-white hover:bg-blue-600 border border-blue-500/30 px-8 py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-200"
              >
                View Pricing
              </Link>
            </div>
            <p className="mt-6 text-sm text-blue-200 opacity-80">
              No credit card required · 14-day free trial · Cancel anytime
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default CallToAction;