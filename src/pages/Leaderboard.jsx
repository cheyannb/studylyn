import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Trophy, Medal, Award, Zap, Crown, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function Leaderboard() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setUser);
  }, []);

  const { data: topPoints = [], isLoading: loadingPoints } = useQuery({
    queryKey: ['leaderboard-points'],
    queryFn: async () => {
      const users = await base44.entities.User.list('-points', 50);
      return users.filter(u => u.points > 0);
    },
  });

  const { data: topStreak = [], isLoading: loadingStreak } = useQuery({
    queryKey: ['leaderboard-streak'],
    queryFn: async () => {
      const users = await base44.entities.User.list('-study_streak', 50);
      return users.filter(u => u.study_streak > 0);
    },
  });

  const getRankIcon = (rank) => {
    if (rank === 0) return <Trophy className="w-5 h-5 text-amber-500" />;
    if (rank === 1) return <Medal className="w-5 h-5 text-slate-400" />;
    if (rank === 2) return <Award className="w-5 h-5 text-amber-700" />;
    return null;
  };

  const renderLeaderboardList = (users, metric) => {
    if (users.length === 0) {
      return (
        <div className="text-center py-12 text-slate-500">
          <TrendingUp className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>No rankings yet. Start studying to appear on the leaderboard!</p>
        </div>
      );
    }

    return (
      <div className="space-y-2">
        {users.map((u, index) => (
          <motion.div
            key={u.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className={`flex items-center gap-4 p-4 rounded-xl ${
              u.id === user?.id
                ? 'bg-indigo-50 border-2 border-indigo-300'
                : 'bg-white border border-slate-200'
            }`}
          >
            <div className="w-10 flex-shrink-0 flex items-center justify-center">
              {getRankIcon(index) || (
                <span className="text-slate-500 font-semibold">#{index + 1}</span>
              )}
            </div>

            <Avatar className="w-10 h-10">
              <AvatarFallback className="bg-indigo-100 text-indigo-600">
                {u.full_name?.[0]?.toUpperCase() || u.email?.[0]?.toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-900">
                  {u.full_name || 'Anonymous'}
                </span>
                {(u.subscription_type === 'monthly' || u.subscription_type === 'lifetime') && (
                  <Crown className="w-4 h-4 text-amber-500" />
                )}
              </div>
              <div className="text-sm text-slate-500">Level {u.level || 1}</div>
            </div>

            <div className="text-right">
              <div className="font-bold text-slate-900">
                {metric === 'points' 
                  ? u.points?.toLocaleString() || 0
                  : u.study_streak || 0}
              </div>
              <div className="text-xs text-slate-500">
                {metric === 'points' ? 'points' : 'day streak'}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-700 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <Trophy className="w-12 h-12 mx-auto mb-4" />
            <h1 className="text-3xl font-bold mb-2">Leaderboard</h1>
            <p className="text-indigo-100">Compete with learners around the world</p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="points" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="points" className="gap-2">
              <Zap className="w-4 h-4" />
              Top Points
            </TabsTrigger>
            <TabsTrigger value="streak" className="gap-2">
              <TrendingUp className="w-4 h-4" />
              Top Streaks
            </TabsTrigger>
          </TabsList>

          <TabsContent value="points">
            {loadingPoints ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-20 bg-slate-100 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : (
              renderLeaderboardList(topPoints, 'points')
            )}
          </TabsContent>

          <TabsContent value="streak">
            {loadingStreak ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-20 bg-slate-100 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : (
              renderLeaderboardList(topStreak, 'streak')
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}