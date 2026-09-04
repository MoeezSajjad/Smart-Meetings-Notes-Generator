import React from 'react';
import { motion } from 'framer-motion';
import { Check, ArrowRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { getLocalUser } from '../firebase';

const Pricing = () => {
  const user = getLocalUser();
  const navigate = useNavigate();

  const plans = [
    {
      name: 'Starter',
      price: 0,
      period: 'forever free',
      description: 'Perfect for getting started',
      cta: user ? 'Go to Dashboard' : 'Get Started Free',
      ctaLink: user ? '/dashboard' : '/signup',
      highlighted: false,
      features: [
        '3 meetings per month',
        'Audio transcription',
        'Basic notes generation',
        'Up to 1 hour per meeting',
        'Basic search',
        'Email support',
      ],
    },
    {
      name: 'Professional',
      price: 29,
      period: 'per month',
      description: 'For active teams',
      cta: 'Start Free Trial',
      ctaLink: user ? '/upload' : '/signup',
      highlighted: true,
      features: [
        'Unlimited meetings',
        'Audio & video transcription',
        'Advanced AI summaries',
        'Up to 4 hours per meeting',
        'Advanced search & filters',
        'Priority email support',
        'Team collaboration tools',
        'Custom integrations',
        'Meeting analytics',
        'Advanced security',
      ],
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      period: 'contact sales',
      description: 'For large organizations',
      cta: 'Contact Sales',
      ctaLink: '#',
      highlighted: false,
      features: [
        'Everything in Professional',
        'Custom deployment options',
        'Dedicated account manager',
        'Advanced analytics',
        'Custom training',
        'API access',
        'White-label options',
        'Advanced security features',
        'Compliance & audit logs',
        '24/7 phone support',
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-950 dark:to-blue-950">
      {/* Header */}
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link
            to="/"
            className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors mb-4 inline-block"
          >
            ← Back to Home
          </Link>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Simple, Transparent Pricing</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2">Choose the perfect plan for your meeting documentation needs.</p>
        </div>
      </header>

      {/* Pricing Content */}
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Pricing Toggle */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <p className="text-slate-600 dark:text-slate-400 mb-6">
            Save 20% with annual billing
          </p>
          <div className="inline-flex items-center rounded-lg border border-slate-200 dark:border-slate-800 p-1 bg-white dark:bg-slate-900">
            <button className="px-6 py-2 rounded-md bg-blue-600 text-white font-medium">Monthly</button>
            <button className="px-6 py-2 rounded-md text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors font-medium">Annual</button>
          </div>
        </motion.div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {plans.map((plan, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className={`relative rounded-2xl overflow-hidden transition-all duration-300 ${
                plan.highlighted
                  ? 'ring-2 ring-blue-600 shadow-2xl scale-105 lg:scale-110'
                  : 'border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              <div className={`p-8 ${
                plan.highlighted
                  ? 'bg-gradient-to-br from-blue-600 to-blue-800'
                  : 'bg-white dark:bg-slate-900'
              }`}>
                {plan.highlighted && (
                  <div className="absolute top-4 right-4 bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-xs font-bold">
                    POPULAR
                  </div>
                )}

                <h3 className={`text-2xl font-bold mb-2 ${
                  plan.highlighted ? 'text-white' : 'text-slate-900 dark:text-white'
                }`}>
                  {plan.name}
                </h3>
                <p className={`text-sm mb-6 ${
                  plan.highlighted ? 'text-blue-100' : 'text-slate-600 dark:text-slate-400'
                }`}>
                  {plan.description}
                </p>

                <div className="mb-6">
                  <span className={`text-5xl font-bold ${
                    plan.highlighted ? 'text-white' : 'text-slate-900 dark:text-white'
                  }`}>
                    {plan.price === 'Custom' ? plan.price : `$${plan.price}`}
                  </span>
                  <span className={`ml-2 ${
                    plan.highlighted ? 'text-blue-100' : 'text-slate-600 dark:text-slate-400'
                  }`}>
                    {plan.period}
                  </span>
                </div>

                <button
                  onClick={() => {
                    if (plan.ctaLink === '#') {
                      window.location.href = 'mailto:sales@smartmeetingnotes.com';
                    } else {
                      navigate(plan.ctaLink);
                    }
                  }}
                  className={`w-full flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all mb-8 ${
                    plan.highlighted
                      ? 'bg-white text-blue-600 hover:bg-blue-50'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {plan.cta}
                  <ArrowRight className="h-5 w-5" />
                </button>
              </div>

              <div className={`p-8 ${
                plan.highlighted
                  ? 'bg-white dark:bg-slate-900'
                  : 'bg-slate-50 dark:bg-slate-800/50'
              }`}>
                <p className={`font-semibold mb-6 ${
                  plan.highlighted
                    ? 'text-slate-900 dark:text-white'
                    : 'text-slate-900 dark:text-white'
                }`}>
                  What's included
                </p>
                <ul className="space-y-4">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start gap-3">
                      <Check className={`h-5 w-5 flex-shrink-0 mt-0.5 ${
                        plan.highlighted
                          ? 'text-blue-600'
                          : 'text-green-600'
                      }`} />
                      <span className={`text-sm ${
                        plan.highlighted
                          ? 'text-slate-700 dark:text-slate-300'
                          : 'text-slate-600 dark:text-slate-400'
                      }`}>
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          ))}
        </div>

        {/* FAQ Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8"
        >
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-8">Frequently Asked Questions</h2>

          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Can I change plans anytime?</h3>
              <p className="text-slate-600 dark:text-slate-400">Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately.</p>
            </div>

            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Do you offer refunds?</h3>
              <p className="text-slate-600 dark:text-slate-400">We offer a 30-day money-back guarantee if you're not satisfied with our service.</p>
            </div>

            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white mb-2">What payment methods do you accept?</h3>
              <p className="text-slate-600 dark:text-slate-400">We accept all major credit cards, PayPal, and bank transfers for enterprise customers.</p>
            </div>

            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Is there a free trial?</h3>
              <p className="text-slate-600 dark:text-slate-400">Yes, get 14 days of Professional plan free with no credit card required.</p>
            </div>

            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Do you have a student discount?</h3>
              <p className="text-slate-600 dark:text-slate-400">Yes, students and educators receive 50% off with a valid school email.</p>
            </div>

            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white mb-2">What about bulk discounts?</h3>
              <p className="text-slate-600 dark:text-slate-400">Contact our sales team for special pricing on 10+ licenses.</p>
            </div>
          </div>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-12 text-center"
        >
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">Ready to get started?</h2>
          <p className="text-slate-600 dark:text-slate-400 mb-6 text-lg">Join thousands of teams transforming how they document meetings.</p>
          <button
            onClick={() => navigate(user ? '/upload' : '/signup')}
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
          >
            Get Started for Free
            <ArrowRight className="h-5 w-5" />
          </button>
        </motion.div>
      </main>
    </div>
  );
};

export default Pricing;
