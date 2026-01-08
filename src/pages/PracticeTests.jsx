import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Brain, Stethoscope, GraduationCap, Crown, Lock, Trophy, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

const CATEGORIES = [
  {
    id: 'LSAT',
    name: 'LSAT Practice',
    icon: Brain,
    description: 'Law School Admission Test prep',
    color: 'from-blue-500 to-indigo-600',
  },
  {
    id: 'NCLEX',
    name: 'NCLEX Practice',
    icon: Stethoscope,
    description: 'Nursing licensure exam prep',
    color: 'from-pink-500 to-rose-600',
  },
  {
    id: 'SAT',
    name: 'SAT Practice',
    icon: GraduationCap,
    description: 'College admission test prep',
    color: 'from-purple-500 to-indigo-600',
  },
];

export default function PracticeTests() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setUser);
  }, []);

  const { data: allTests = [] } = useQuery({
    queryKey: ['practice-tests'],
    queryFn: () => base44.entities.PracticeTest.list('question_number'),
  });

  const isPremium = user?.subscription_type === 'monthly' || user?.subscription_type === 'lifetime';

  const getTestStats = (category) => {
    const categoryTests = allTests.filter(t => t.category === category);
    const freeTests = categoryTests.filter(t => !t.is_premium).length;
    const premiumTests = categoryTests.filter(t => t.is_premium).length;
    return { total: categoryTests.length, free: freeTests, premium: premiumTests };
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-700 text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <Trophy className="w-12 h-12 mx-auto mb-4" />
            <h1 className="text-3xl md:text-4xl font-bold mb-2">Practice Tests</h1>
            <p className="text-indigo-100 text-lg">Master your exam with gamified practice questions</p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-3 gap-6">
          {CATEGORIES.map((category, index) => {
            const Icon = category.icon;
            const stats = getTestStats(category.id);

            return (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-xl transition-shadow">
                  <div className={`bg-gradient-to-br ${category.color} p-6 text-white`}>
                    <Icon className="w-10 h-10 mb-3" />
                    <h3 className="text-xl font-bold mb-1">{category.name}</h3>
                    <p className="text-sm opacity-90">{category.description}</p>
                  </div>

                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="text-sm text-slate-500">
                        {stats.total} questions available
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                          {stats.free} Free
                        </span>
                        <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-full flex items-center gap-1">
                          <Crown className="w-3 h-3" />
                          {stats.premium} Premium
                        </span>
                      </div>
                    </div>

                    {stats.total === 0 ? (
                      <Button disabled className="w-full">
                        Coming Soon
                      </Button>
                    ) : (
                      <Link to={createPageUrl(`TakePracticeTest?category=${category.id}`)}>
                        <Button className="w-full bg-indigo-600 hover:bg-indigo-700 gap-2">
                          Start Practice
                          <ArrowRight className="w-4 h-4" />
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {!isPremium && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-12 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-8 text-white text-center"
          >
            <Crown className="w-12 h-12 mx-auto mb-4" />
            <h3 className="text-2xl font-bold mb-2">Unlock All Practice Questions</h3>
            <p className="text-indigo-100 mb-6 max-w-2xl mx-auto">
              Upgrade to Premium to access all practice questions, get detailed explanations, and track your progress across all exam categories.
            </p>
            <Link to={createPageUrl('Pricing')}>
              <Button className="bg-white text-indigo-600 hover:bg-indigo-50">
                Upgrade to Premium
              </Button>
            </Link>
          </motion.div>
        )}
      </div>
    </div>
  );
}