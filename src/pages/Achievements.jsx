import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ArrowLeft, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import BadgeCard from '@/components/gamification/BadgeCard';
import LevelProgress from '@/components/gamification/LevelProgress';

const BADGES = [
  { id: 'first_set', name: 'Getting Started', icon: '🎯', description: 'Create your first study set', premium: false },
  { id: 'first_study', name: 'First Steps', icon: '👟', description: 'Complete your first study session', premium: false },
  { id: 'streak_3', name: '3 Day Streak', icon: '🔥', description: 'Study for 3 consecutive days', premium: false },
  { id: 'streak_7', name: 'Week Warrior', icon: '⚡', description: 'Study for 7 consecutive days', premium: false },
  { id: 'streak_30', name: 'Monthly Master', icon: '💎', description: 'Study for 30 consecutive days', premium: true },
  { id: 'cards_100', name: 'Century Club', icon: '💯', description: 'Study 100 cards', premium: false },
  { id: 'cards_500', name: 'Knowledge Seeker', icon: '📚', description: 'Study 500 cards', premium: false },
  { id: 'cards_1000', name: 'Study Legend', icon: '👑', description: 'Study 1,000 cards', premium: true },
  { id: 'perfect_test', name: 'Perfectionist', icon: '⭐', description: 'Get 100% on a test', premium: false },
  { id: 'level_5', name: 'Rising Star', icon: '🌟', description: 'Reach level 5', premium: false },
  { id: 'level_10', name: 'Expert Learner', icon: '🎓', description: 'Reach level 10', premium: true },
  { id: 'daily_goal_7', name: 'Goal Getter', icon: '🎯', description: 'Meet daily goal 7 days in a row', premium: true },
];

export default function Achievements() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setUser);
  }, []);

  const userBadges = user?.badges || [];
  const points = user?.points || 0;
  const level = user?.level || 1;
  const isPremium = user?.subscription_type === 'monthly' || user?.subscription_type === 'lifetime';

  const earnedCount = userBadges.length;
  const totalCount = BADGES.length;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <Link to={createPageUrl('Home')}>
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <h1 className="text-xl font-bold text-slate-900">Achievements</h1>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <LevelProgress points={points} level={level} />

        <div className="mt-8 bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-900">Badges</h2>
            <span className="text-sm text-slate-500">
              {earnedCount} / {totalCount} earned
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {BADGES.map((badge) => (
              <BadgeCard
                key={badge.id}
                badge={badge}
                earned={userBadges.includes(badge.id)}
                isPremium={isPremium}
              />
            ))}
          </div>
        </div>

        {!isPremium && (
          <div className="mt-6 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl p-6 text-white">
            <div className="flex items-center gap-3 mb-3">
              <Crown className="w-8 h-8" />
              <h3 className="text-lg font-semibold">Unlock Premium Badges</h3>
            </div>
            <p className="text-indigo-100 mb-4">
              Upgrade to Premium to unlock exclusive achievements and earn premium badges!
            </p>
            <Link to={createPageUrl('Pricing')}>
              <Button className="bg-white text-indigo-600 hover:bg-indigo-50">
                Upgrade Now
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}