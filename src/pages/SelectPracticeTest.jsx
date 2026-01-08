import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ArrowLeft, Crown, Lock, Play, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

export default function SelectPracticeTest() {
  const urlParams = new URLSearchParams(window.location.search);
  const category = urlParams.get('category');

  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setUser);
  }, []);

  const { data: allQuestions = [], isLoading } = useQuery({
    queryKey: ['practice-test-questions', category],
    queryFn: () => base44.entities.PracticeTest.filter({ category }, 'test_number'),
    enabled: !!category,
  });

  const isPremium = user?.subscription_type === 'monthly' || user?.subscription_type === 'lifetime';

  // Group questions by test number
  const tests = [...new Set(allQuestions.map(q => q.test_number))].sort((a, b) => a - b).map(testNum => {
    const testQuestions = allQuestions.filter(q => q.test_number === testNum);
    const isTestPremium = testQuestions[0]?.is_premium || false;
    return {
      testNumber: testNum,
      questionCount: testQuestions.length,
      isPremium: isTestPremium,
      isLocked: isTestPremium && !isPremium,
    };
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Loading tests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <Link to={createPageUrl('PracticeTests')}>
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-xl font-bold text-slate-900">{category} Practice Tests</h1>
              <p className="text-sm text-slate-500">{tests.length} tests available • 50 questions each</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Premium Banner */}
        {!isPremium && tests.some(t => t.isPremium) && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-6 text-white"
          >
            <div className="flex items-start gap-4">
              <Crown className="w-6 h-6 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="font-semibold mb-1">Unlock Premium Tests</h3>
                <p className="text-sm text-indigo-100 mb-3">
                  Get access to all 10 practice tests with detailed explanations
                </p>
                <Link to={createPageUrl('Pricing')}>
                  <Button className="bg-white text-indigo-600 hover:bg-indigo-50">
                    Upgrade Now
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        )}

        {/* Tests Grid */}
        <div className="grid md:grid-cols-2 gap-4">
          {tests.map((test, index) => (
            <motion.div
              key={test.testNumber}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <div className={`bg-white rounded-xl border-2 p-6 transition-all ${
                test.isLocked 
                  ? 'border-slate-200 opacity-75' 
                  : 'border-slate-200 hover:border-indigo-300 hover:shadow-md'
              }`}>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 mb-1">
                      Test {test.testNumber}
                    </h3>
                    <p className="text-sm text-slate-500">
                      {test.questionCount} questions
                    </p>
                  </div>
                  {test.isPremium && (
                    <div className="flex items-center gap-1 bg-amber-100 text-amber-700 px-2 py-1 rounded-full text-xs font-medium">
                      <Crown className="w-3 h-3" />
                      Premium
                    </div>
                  )}
                  {!test.isPremium && (
                    <div className="flex items-center gap-1 bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-medium">
                      <CheckCircle className="w-3 h-3" />
                      Free
                    </div>
                  )}
                </div>

                {test.isLocked ? (
                  <Button 
                    className="w-full gap-2" 
                    variant="outline"
                    onClick={() => window.location.href = createPageUrl('Pricing')}
                  >
                    <Lock className="w-4 h-4" />
                    Unlock Test
                  </Button>
                ) : (
                  <Link to={createPageUrl(`TakePracticeTest?category=${category}&test=${test.testNumber}`)}>
                    <Button className="w-full bg-indigo-600 hover:bg-indigo-700 gap-2">
                      <Play className="w-4 h-4" />
                      Start Test
                    </Button>
                  </Link>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}