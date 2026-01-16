import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { 
  Plus, Search, Layers, Flame, Target, BookOpen, 
  TrendingUp, Crown, Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import SetCard from '@/components/ui/SetCard';
import StatCard from '@/components/ui/StatCard';
import SetFormDialog from '@/components/forms/SetFormDialog';
import ProgressBar from '@/components/ui/ProgressBar';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function Home() {
  const [user, setUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingSet, setEditingSet] = useState(null);
  const [deleteSet, setDeleteSet] = useState(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    base44.auth.me().then(setUser);
  }, []);

  const { data: sets = [], isLoading: setsLoading } = useQuery({
    queryKey: ['flashcard-sets', user?.email],
    queryFn: () => user?.email 
      ? base44.entities.FlashcardSet.filter({ created_by: user.email }, '-created_date')
      : Promise.resolve([]),
    enabled: !!user,
  });

  const { data: sessions = [] } = useQuery({
    queryKey: ['study-sessions'],
    queryFn: () => base44.entities.StudySession.list('-created_date', 50),
  });

  const createMutation = useMutation({
    mutationFn: (data) => {
      const isPremium = user?.subscription_type === 'monthly' || user?.subscription_type === 'lifetime';
      if (!isPremium && sets.length >= 10) {
        throw new Error('Free users are limited to 10 study sets. Upgrade to Premium for unlimited sets!');
      }
      return base44.entities.FlashcardSet.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['flashcard-sets'] });
      setShowCreateDialog(false);
    },
    onError: (error) => {
      toast.error(error.message);
      if (error.message.includes('Upgrade to Premium')) {
        setTimeout(() => {
          window.location.href = createPageUrl('Pricing');
        }, 2000);
      }
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.FlashcardSet.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['flashcard-sets'] });
      setEditingSet(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.FlashcardSet.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['flashcard-sets'] });
      setDeleteSet(null);
    },
  });

  const filteredSets = sets.filter(set => 
    set.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    set.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalCardsStudied = user?.total_cards_studied || 0;
  const studyStreak = user?.study_streak || 0;
  const dailyGoal = user?.daily_goal || 20;
  const cardsToday = user?.cards_studied_today || 0;
  const totalSets = sets.length;

  const isPremium = user?.subscription_type === 'monthly' || user?.subscription_type === 'lifetime';

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold mb-2">
                Welcome back{user?.full_name ? `, ${user.full_name.split(' ')[0]}` : ''}!
              </h1>
              <p className="text-indigo-100">Ready to master something new today?</p>
            </div>
            
            {!isPremium && (
              <Link to={createPageUrl('Pricing')}>
                <Button className="bg-white text-indigo-600 hover:bg-indigo-50 gap-2">
                  <Crown className="w-4 h-4" />
                  Upgrade to Premium
                </Button>
              </Link>
            )}
          </div>

          {/* Daily Progress */}
          <div className="mt-8 bg-white/10 backdrop-blur-sm rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <Target className="w-5 h-5 text-indigo-200" />
              <span className="font-medium">Daily Goal</span>
              <span className="text-indigo-200 text-sm">({cardsToday} / {dailyGoal} cards)</span>
            </div>
            <ProgressBar current={cardsToday} total={dailyGoal} showLabel={false} />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard icon={Layers} label="Total Sets" value={totalSets} color="indigo" />
          <StatCard icon={BookOpen} label="Cards Studied" value={totalCardsStudied} color="purple" />
          <StatCard icon={Flame} label="Day Streak" value={studyStreak} color="orange" />
          <StatCard icon={TrendingUp} label="Sessions" value={sessions.length} color="green" />
        </div>

        {/* Your Sets Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <h2 className="text-xl font-bold text-slate-900">Your Study Sets</h2>
          <div className="flex gap-3">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Search sets..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button 
              onClick={() => setShowCreateDialog(true)}
              className="bg-indigo-600 hover:bg-indigo-700 gap-2 whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">New Set</span>
            </Button>
          </div>
        </div>

        {/* Sets Grid */}
        {setsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-40 bg-slate-100 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : filteredSets.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16 bg-white rounded-2xl border border-slate-200"
          >
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-indigo-100 flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-indigo-600" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              {searchQuery ? 'No sets found' : 'Create your first study set'}
            </h3>
            <p className="text-slate-500 mb-6 max-w-sm mx-auto">
              {searchQuery 
                ? 'Try a different search term' 
                : 'Start building your flashcard collection and master any topic'}
            </p>
            {!searchQuery && (
              <Button 
                onClick={() => setShowCreateDialog(true)}
                className="bg-indigo-600 hover:bg-indigo-700 gap-2"
              >
                <Plus className="w-4 h-4" />
                Create Set
              </Button>
            )}
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <AnimatePresence>
              {filteredSets.map((set) => (
                <SetCard 
                  key={set.id} 
                  set={set} 
                  onEdit={setEditingSet}
                  onDelete={setDeleteSet}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Create/Edit Dialog */}
      <SetFormDialog
        open={showCreateDialog || !!editingSet}
        onClose={() => {
          setShowCreateDialog(false);
          setEditingSet(null);
        }}
        onSave={(data) => {
          if (editingSet) {
            updateMutation.mutate({ id: editingSet.id, data });
          } else {
            createMutation.mutate(data);
          }
        }}
        initialData={editingSet}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteSet} onOpenChange={() => setDeleteSet(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Set</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deleteSet?.title}"? This will also delete all cards in this set. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={() => deleteMutation.mutate(deleteSet.id)}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}