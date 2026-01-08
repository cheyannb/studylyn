import React, { useState, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { 
  ArrowLeft, ChevronLeft, ChevronRight, Shuffle, 
  X, Check, Loader2, RotateCcw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import FlashcardFlip from '@/components/ui/FlashcardFlip';
import ProgressBar from '@/components/ui/ProgressBar';
import StudyComplete from '@/components/study/StudyComplete';
import { motion, AnimatePresence } from 'framer-motion';

export default function StudyFlashcard() {
  const urlParams = new URLSearchParams(window.location.search);
  const setId = urlParams.get('id');

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [shuffled, setShuffled] = useState(false);
  const [studyCards, setStudyCards] = useState([]);
  const [correct, setCorrect] = useState(0);
  const [incorrect, setIncorrect] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [startTime] = useState(Date.now());
  const [cardKey, setCardKey] = useState(0);

  const queryClient = useQueryClient();

  const { data: set } = useQuery({
    queryKey: ['flashcard-set', setId],
    queryFn: async () => {
      const sets = await base44.entities.FlashcardSet.filter({ id: setId });
      return sets[0];
    },
    enabled: !!setId,
  });

  const { data: cards = [], isLoading } = useQuery({
    queryKey: ['flashcards', setId],
    queryFn: () => base44.entities.Flashcard.filter({ set_id: setId }, 'order'),
    enabled: !!setId,
  });

  useEffect(() => {
    if (cards.length > 0) {
      setStudyCards([...cards]);
    }
  }, [cards]);

  const handleShuffle = useCallback(() => {
    const shuffledCards = [...studyCards].sort(() => Math.random() - 0.5);
    setStudyCards(shuffledCards);
    setShuffled(true);
    setCurrentIndex(0);
    setCardKey(prev => prev + 1);
  }, [studyCards]);

  const handlePrev = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setCardKey(prev => prev + 1);
    }
  }, [currentIndex]);

  const handleNext = useCallback(() => {
    if (currentIndex < studyCards.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setCardKey(prev => prev + 1);
    }
  }, [currentIndex, studyCards.length]);

  const handleKnow = useCallback(() => {
    setCorrect(prev => prev + 1);
    if (currentIndex < studyCards.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setCardKey(prev => prev + 1);
    } else {
      setCompleted(true);
    }
  }, [currentIndex, studyCards.length]);

  const handleDontKnow = useCallback(() => {
    setIncorrect(prev => prev + 1);
    if (currentIndex < studyCards.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setCardKey(prev => prev + 1);
    } else {
      setCompleted(true);
    }
  }, [currentIndex, studyCards.length]);

  const handleRestart = () => {
    setCurrentIndex(0);
    setCorrect(0);
    setIncorrect(0);
    setCompleted(false);
    setCardKey(prev => prev + 1);
    if (!shuffled) {
      setStudyCards([...cards]);
    }
  };

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (completed) return;
      switch (e.key) {
        case 'ArrowLeft':
          handlePrev();
          break;
        case 'ArrowRight':
          handleNext();
          break;
        case ' ':
          e.preventDefault();
          setCardKey(prev => prev + 1);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handlePrev, handleNext, completed]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (studyCards.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-slate-900 mb-2">No cards to study</h2>
          <Link to={createPageUrl(`SetDetails?id=${setId}`)}>
            <Button variant="outline">Go back and add cards</Button>
          </Link>
        </div>
      </div>
    );
  }

  const currentCard = studyCards[currentIndex];
  const duration = Math.floor((Date.now() - startTime) / 1000);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link to={createPageUrl(`SetDetails?id=${setId}`)}>
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div className="text-center">
              <h1 className="font-semibold text-slate-900">{set?.title}</h1>
              <p className="text-sm text-slate-500">Flashcard Mode</p>
            </div>
            <Button variant="ghost" size="icon" onClick={handleShuffle}>
              <Shuffle className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {completed ? (
          <StudyComplete
            correct={correct}
            incorrect={incorrect}
            total={studyCards.length}
            duration={duration}
            mode="flashcard"
            setId={setId}
            onRestart={handleRestart}
          />
        ) : (
          <>
            {/* Progress */}
            <div className="mb-8">
              <ProgressBar current={currentIndex + 1} total={studyCards.length} />
            </div>

            {/* Flashcard */}
            <AnimatePresence mode="wait">
              <motion.div
                key={cardKey}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.2 }}
              >
                <FlashcardFlip
                  term={currentCard.term}
                  definition={currentCard.definition}
                  onFlip={setIsFlipped}
                />
              </motion.div>
            </AnimatePresence>

            {/* Controls */}
            <div className="mt-8 space-y-4">
              {/* Know / Don't Know buttons */}
              <div className="flex justify-center gap-4">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={handleDontKnow}
                  className="flex-1 max-w-[160px] gap-2 border-red-200 text-red-600 hover:bg-red-50"
                >
                  <X className="w-5 h-5" />
                  Still Learning
                </Button>
                <Button
                  size="lg"
                  onClick={handleKnow}
                  className="flex-1 max-w-[160px] gap-2 bg-emerald-600 hover:bg-emerald-700"
                >
                  <Check className="w-5 h-5" />
                  Know It
                </Button>
              </div>

              {/* Navigation */}
              <div className="flex items-center justify-center gap-4">
                <Button
                  variant="ghost"
                  onClick={handlePrev}
                  disabled={currentIndex === 0}
                  className="gap-2"
                >
                  <ChevronLeft className="w-5 h-5" />
                  Previous
                </Button>
                <span className="text-sm text-slate-500 min-w-[60px] text-center">
                  {currentIndex + 1} / {studyCards.length}
                </span>
                <Button
                  variant="ghost"
                  onClick={handleNext}
                  disabled={currentIndex === studyCards.length - 1}
                  className="gap-2"
                >
                  Next
                  <ChevronRight className="w-5 h-5" />
                </Button>
              </div>
            </div>

            {/* Keyboard hints */}
            <p className="text-center text-sm text-slate-400 mt-8">
              Use arrow keys to navigate, spacebar to flip
            </p>
          </>
        )}
      </div>
    </div>
  );
}