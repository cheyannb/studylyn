import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { 
  ArrowLeft, User, Target, Crown, Mail, 
  Loader2, Save, CheckCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

export default function Settings() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [dailyGoal, setDailyGoal] = useState(20);

  useEffect(() => {
    base44.auth.me().then((userData) => {
      setUser(userData);
      setDailyGoal(userData.daily_goal || 20);
    });
  }, []);

  const handleSaveDailyGoal = async () => {
    setIsLoading(true);
    try {
      await base44.auth.updateMe({ daily_goal: dailyGoal });
      setUser({ ...user, daily_goal: dailyGoal });
      toast.success('Daily goal updated!');
    } catch (error) {
      toast.error('Failed to update');
    } finally {
      setIsLoading(false);
    }
  };

  const isPremium = user?.subscription_type === 'monthly' || user?.subscription_type === 'lifetime';

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <Link to={createPageUrl('Home')}>
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <h1 className="text-xl font-bold text-slate-900">Settings</h1>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Profile */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                  <User className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <CardTitle>Profile</CardTitle>
                  <CardDescription>Your account information</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Name</Label>
                  <Input value={user?.full_name || ''} disabled className="bg-slate-50" />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input value={user?.email || ''} disabled className="bg-slate-50" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Daily Goal */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                  <Target className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <CardTitle>Daily Goal</CardTitle>
                  <CardDescription>Set your daily study target</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Cards per day</span>
                  <span className="text-2xl font-bold text-indigo-600">{dailyGoal}</span>
                </div>
                <Slider
                  value={[dailyGoal]}
                  onValueChange={(value) => setDailyGoal(value[0])}
                  min={5}
                  max={100}
                  step={5}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-slate-400">
                  <span>5 cards</span>
                  <span>100 cards</span>
                </div>
              </div>
              <Button 
                onClick={handleSaveDailyGoal}
                disabled={isLoading || dailyGoal === user?.daily_goal}
                className="bg-indigo-600 hover:bg-indigo-700 gap-2"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                Save Goal
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Subscription */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                  <Crown className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <CardTitle>Subscription</CardTitle>
                  <CardDescription>Manage your plan</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {isPremium ? (
                <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-200">
                  <CheckCircle className="w-8 h-8 text-indigo-600" />
                  <div>
                    <p className="font-semibold text-slate-900">
                      {user?.subscription_type === 'lifetime' ? 'Lifetime Premium' : 'Monthly Premium'}
                    </p>
                    <p className="text-sm text-slate-600">
                      {user?.subscription_type === 'lifetime' 
                        ? 'You have lifetime access to all features'
                        : 'Your subscription is active'}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <div>
                    <p className="font-semibold text-slate-900">Free Plan</p>
                    <p className="text-sm text-slate-600">Upgrade to unlock all features</p>
                  </div>
                  <Link to={createPageUrl('Pricing')}>
                    <Button className="bg-indigo-600 hover:bg-indigo-700 gap-2">
                      <Crown className="w-4 h-4" />
                      Upgrade Now
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Study Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Study Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-slate-50 rounded-xl">
                  <p className="text-2xl font-bold text-slate-900">{user?.total_cards_studied || 0}</p>
                  <p className="text-sm text-slate-500">Cards Studied</p>
                </div>
                <div className="text-center p-4 bg-slate-50 rounded-xl">
                  <p className="text-2xl font-bold text-slate-900">{user?.study_streak || 0}</p>
                  <p className="text-sm text-slate-500">Day Streak</p>
                </div>
                <div className="text-center p-4 bg-slate-50 rounded-xl">
                  <p className="text-2xl font-bold text-slate-900">{user?.cards_studied_today || 0}</p>
                  <p className="text-sm text-slate-500">Today</p>
                </div>
                <div className="text-center p-4 bg-slate-50 rounded-xl">
                  <p className="text-2xl font-bold text-slate-900">{dailyGoal}</p>
                  <p className="text-sm text-slate-500">Daily Goal</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}