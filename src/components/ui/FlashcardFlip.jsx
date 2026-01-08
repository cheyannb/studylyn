import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { RotateCcw } from 'lucide-react';

export default function FlashcardFlip({ term, definition, onFlip }) {
  const [isFlipped, setIsFlipped] = useState(false);

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
    onFlip?.(!isFlipped);
  };

  return (
    <div 
      className="perspective-1000 w-full cursor-pointer"
      onClick={handleFlip}
    >
      <motion.div
        className="relative w-full h-[320px] md:h-[380px]"
        initial={false}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* Front */}
        <div 
          className="absolute inset-0 w-full h-full rounded-2xl bg-white border border-slate-200 shadow-xl p-8 flex flex-col items-center justify-center"
          style={{ backfaceVisibility: 'hidden' }}
        >
          <span className="text-xs uppercase tracking-wider text-slate-400 mb-4">Term</span>
          <p className="text-2xl md:text-3xl font-medium text-slate-900 text-center leading-relaxed">
            {term}
          </p>
          <div className="absolute bottom-6 flex items-center gap-2 text-slate-400">
            <RotateCcw className="w-4 h-4" />
            <span className="text-sm">Click to flip</span>
          </div>
        </div>

        {/* Back */}
        <div 
          className="absolute inset-0 w-full h-full rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-xl p-8 flex flex-col items-center justify-center"
          style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
        >
          <span className="text-xs uppercase tracking-wider text-white/70 mb-4">Definition</span>
          <p className="text-xl md:text-2xl font-medium text-white text-center leading-relaxed">
            {definition}
          </p>
          <div className="absolute bottom-6 flex items-center gap-2 text-white/60">
            <RotateCcw className="w-4 h-4" />
            <span className="text-sm">Click to flip</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}