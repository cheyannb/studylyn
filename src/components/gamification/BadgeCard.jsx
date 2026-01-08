import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Lock } from 'lucide-react';

export default function BadgeCard({ badge, earned, isPremium }) {
  const isLocked = !earned && badge.premium && !isPremium;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`relative p-4 rounded-xl border-2 ${
        earned
          ? 'bg-gradient-to-br from-amber-50 to-yellow-50 border-amber-300'
          : isLocked
          ? 'bg-slate-50 border-slate-200 opacity-60'
          : 'bg-white border-slate-200'
      }`}
    >
      {isLocked && (
        <div className="absolute top-2 right-2">
          <Lock className="w-4 h-4 text-slate-400" />
        </div>
      )}
      
      <div className={`w-16 h-16 mx-auto mb-3 rounded-full flex items-center justify-center ${
        earned
          ? 'bg-gradient-to-br from-amber-400 to-yellow-500'
          : 'bg-slate-200'
      }`}>
        <span className="text-3xl">{badge.icon}</span>
      </div>
      
      <h3 className={`font-semibold text-center mb-1 ${
        earned ? 'text-slate-900' : 'text-slate-500'
      }`}>
        {badge.name}
      </h3>
      
      <p className="text-xs text-slate-500 text-center">{badge.description}</p>
      
      {badge.premium && (
        <div className="mt-2 flex items-center justify-center gap-1 text-xs text-amber-600">
          <Trophy className="w-3 h-3" />
          <span>Premium</span>
        </div>
      )}
    </motion.div>
  );
}