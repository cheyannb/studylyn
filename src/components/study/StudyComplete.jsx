import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, CheckCircle, XCircle, Clock, ArrowRight, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function StudyComplete({ 
  correct, 
  incorrect, 
  total, 
  duration, 
  mode,
  setId,
  onRestart 
}) {
  const percentage = total > 0 ? Math.round((correct / total) * 100) : 0;
  
  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
  };

  const getMessage = () => {
    if (percentage === 100) return "Perfect score! 🎉";
    if (percentage >= 80) return "Great job! 🌟";
    if (percentage >= 60) return "Good progress! 💪";
    return "Keep practicing! 📚";
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="max-w-lg mx-auto text-center py-12"
    >
      <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
        <Trophy className="w-10 h-10 text-white" />
      </div>
      
      <h2 className="text-2xl font-bold text-slate-900 mb-2">Session Complete!</h2>
      <p className="text-lg text-slate-600 mb-8">{getMessage()}</p>

      <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-8">
        <div className="text-5xl font-bold text-indigo-600 mb-2">{percentage}%</div>
        <p className="text-slate-500 mb-6">Accuracy</p>

        <div className="grid grid-cols-3 gap-4">
          <div className="p-4 bg-emerald-50 rounded-xl">
            <CheckCircle className="w-6 h-6 text-emerald-600 mx-auto mb-2" />
            <div className="text-xl font-bold text-emerald-600">{correct}</div>
            <div className="text-sm text-emerald-700">Correct</div>
          </div>
          
          <div className="p-4 bg-red-50 rounded-xl">
            <XCircle className="w-6 h-6 text-red-500 mx-auto mb-2" />
            <div className="text-xl font-bold text-red-500">{incorrect}</div>
            <div className="text-sm text-red-600">Incorrect</div>
          </div>
          
          <div className="p-4 bg-slate-50 rounded-xl">
            <Clock className="w-6 h-6 text-slate-500 mx-auto mb-2" />
            <div className="text-xl font-bold text-slate-700">{formatDuration(duration)}</div>
            <div className="text-sm text-slate-500">Time</div>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Button 
          variant="outline" 
          onClick={onRestart}
          className="gap-2"
        >
          <RotateCcw className="w-4 h-4" />
          Study Again
        </Button>
        <Link to={createPageUrl(`SetDetails?id=${setId}`)}>
          <Button className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 gap-2">
            Back to Set
            <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>
      </div>
    </motion.div>
  );
}