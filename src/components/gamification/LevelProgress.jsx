import React from 'react';
import { motion } from 'framer-motion';
import { Zap } from 'lucide-react';

export default function LevelProgress({ points, level }) {
  const pointsForNextLevel = level * 1000;
  const currentLevelPoints = points % 1000;
  const progress = (currentLevelPoints / pointsForNextLevel) * 100;

  return (
    <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl p-4 text-white">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center font-bold">
            {level}
          </div>
          <div>
            <div className="text-sm opacity-90">Level {level}</div>
            <div className="text-xs opacity-75">{points.toLocaleString()} points</div>
          </div>
        </div>
        <Zap className="w-6 h-6" />
      </div>
      
      <div className="h-2 bg-white/20 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-white rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>
      
      <div className="text-xs opacity-75 mt-1 text-center">
        {pointsForNextLevel - currentLevelPoints} points to Level {level + 1}
      </div>
    </div>
  );
}