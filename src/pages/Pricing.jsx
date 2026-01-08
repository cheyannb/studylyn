import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { 
  ArrowLeft, Check, Crown, Zap, Infinity, 
  Sparkles, BookOpen, Brain, Star
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

export default function Pricing() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    base44.auth.me().then(setUser);
  }, []);

  const handleSubscribe = async (type) => {
    // Check if running in iframe
    if (window.self !== window.top) {
      toast.error('Checkout only works from the published app. Please open the app in a new tab.');
      return;
    }

    setIsLoading(true);
    try {
      const priceId = type === 'monthly' 
        ? 'price_1Sn7IxAKCM31iqaNZwmj6pIX' 
        : 'price_1Sn7IxAKCM31iqaNpPUZof0Y';

      const response = await base44.functions.invoke('createCheckout', {
        priceId,
        subscriptionType: type,
      });

      if (response.data?.url) {
        window.location.href = response.data.url;
      } else {
        toast.error('Failed to create checkout session');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error('Failed to process subscription');
    } finally {
      setIsLoading(false);
    }
  };

  const isPremium = user?.subscription_type === 'monthly' || user?.subscription_type === 'lifetime';

  const features = [
    { icon: Infinity, text: 'Unlimited flashcard sets' },
    { icon: Sparkles, text: 'AI-powered card generation' },
    { icon: Brain, text: 'Spaced repetition algorithm' },
    { icon: BookOpen, text: 'Advanced study analytics' },
    { icon: Star, text: 'Priority support' },
    { icon: Zap, text: 'Early access to new features' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <Link to={createPageUrl('Home')}>
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <h1 className="text-xl font-bold text-slate-900">Pricing</h1>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 bg-indigo-100 text-indigo-700 px-4 py-2 rounded-full text-sm font-medium mb-6"
          >
            <Crown className="w-4 h-4" />
            studyLyn Premium
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-3xl md:text-4xl font-bold text-slate-900 mb-4"
          >
            Learn smarter with Premium
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg text-slate-600 max-w-2xl mx-auto"
          >
            Unlock advanced features and supercharge your learning with AI-powered tools
          </motion.p>
        </div>

        {isPremium ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-md mx-auto bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-8 text-white text-center"
          >
            <Crown className="w-12 h-12 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">You're a Premium Member!</h2>
            <p className="text-indigo-100 mb-4">
              {user?.subscription_type === 'lifetime' 
                ? 'You have lifetime access to all premium features.'
                : 'Your monthly subscription is active.'}
            </p>
            <Link to={createPageUrl('Home')}>
              <Button className="bg-white text-indigo-600 hover:bg-indigo-50">
                Start Studying
              </Button>
            </Link>
          </motion.div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {/* Monthly Plan */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-2xl border border-slate-200 p-8 hover:shadow-xl transition-shadow"
            >
              <div className="text-center mb-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-2">Monthly</h3>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-4xl font-bold text-slate-900">$7.99</span>
                  <span className="text-slate-500">/month</span>
                </div>
                <p className="text-sm text-slate-500 mt-2">Billed monthly, cancel anytime</p>
              </div>

              <ul className="space-y-3 mb-8">
                {features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                      <Check className="w-3 h-3 text-indigo-600" />
                    </div>
                    <span className="text-slate-700">{feature.text}</span>
                  </li>
                ))}
              </ul>

              <Button
                onClick={() => handleSubscribe('monthly')}
                disabled={isLoading}
                className="w-full bg-indigo-600 hover:bg-indigo-700"
              >
                Subscribe Monthly
              </Button>
            </motion.div>

            {/* Lifetime Plan */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-8 text-white relative overflow-hidden"
            >
              <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium">
                Best Value
              </div>

              <div className="text-center mb-6">
                <h3 className="text-lg font-semibold mb-2">Lifetime</h3>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-4xl font-bold">$100</span>
                  <span className="text-indigo-200">one-time</span>
                </div>
                <p className="text-sm text-indigo-200 mt-2">Pay once, own forever</p>
              </div>

              <ul className="space-y-3 mb-8">
                {features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                    <span className="text-white">{feature.text}</span>
                  </li>
                ))}
                <li className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                  <span className="text-white font-medium">Lifetime updates included</span>
                </li>
              </ul>

              <Button
                onClick={() => handleSubscribe('lifetime')}
                disabled={isLoading}
                className="w-full bg-white text-indigo-600 hover:bg-indigo-50"
              >
                Get Lifetime Access
              </Button>
            </motion.div>
          </div>
        )}

        {/* FAQ */}
        <div className="mt-16 max-w-2xl mx-auto">
          <h2 className="text-xl font-bold text-slate-900 text-center mb-8">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            {[
              {
                q: 'Can I cancel my subscription anytime?',
                a: 'Yes! Monthly subscribers can cancel at any time and will retain access until the end of their billing period.'
              },
              {
                q: 'What payment methods do you accept?',
                a: 'We accept all major credit cards including Visa, Mastercard, and American Express.'
              },
              {
                q: 'Is there a free trial?',
                a: 'You can use studyLyn for free with basic features. Premium unlocks advanced AI features and unlimited sets.'
              },
            ].map((faq, index) => (
              <div key={index} className="bg-white rounded-xl border border-slate-200 p-6">
                <h3 className="font-semibold text-slate-900 mb-2">{faq.q}</h3>
                <p className="text-slate-600">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}