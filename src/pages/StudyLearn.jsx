import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ArrowLeft, Loader2, Check, X, ArrowRight, Lightbulb } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import ProgressBar from '@/components/ui/ProgressBar';
import StudyComplete from '@/components/study/StudyComplete';
import { motion, AnimatePresence } from 'framer-motion';

export default function StudyLearn() {
  const urlParams = new URLSearchParams(window.location.search);
  const setId = urlParams.get('id');

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answer, setAnswer] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [correct, setCorrect] = useState(0);
  const [incorrect, setIncorrect] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [startTime] = useState(Date.now());
  const [showHint, setShowHint] = useState(false);
  const inputRef = useRef(null);

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

  const checkAnswer = () => {
    const userAnswer = answer.trim().toLowerCase();
    const correctAnswer = cards[currentIndex].definition.trim().toLowerCase();
    
    // Flexible matching - check if main keywords match
    const isAnswerCorrect = userAnswer === correctAnswer || 
      (userAnswer.length > 3 && correctAnswer.includes(userAnswer)) ||
      (correctAnswer.length > 3 && userAnswer.includes(correctAnswer));
    
    setIsCorrect(isAnswerCorrect);
    setShowResult(true);
    
    if (isAnswerCorrect) {
      setCorrect(prev => prev + 1);
    } else {
      setIncorrect(prev => prev + 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < cards.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setAnswer('');
      setShowResult(false);
      setShowHint(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setCompleted(true);
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setAnswer('');
    setShowResult(false);
    setCorrect(0);
    setIncorrect(0);
    setCompleted(false);
    setShowHint(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      if (showResult) {
        handleNext();
      } else if (answer.trim()) {
        checkAnswer();
      }
    }
  };

  useEffect(() => {
    inputRef.current?.focus();
  }, [currentIndex]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (cards.length === 0) {
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

  const currentCard = cards[currentIndex];
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
              <p className="text-sm text-slate-500">Learn Mode</p>
            </div>
            <div className="w-10" />
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {completed ? (
          <StudyComplete
            correct={correct}
            incorrect={incorrect}
            total={cards.length}
            duration={duration}
            mode="learn"
            setId={setId}
            onRestart={handleRestart}
          />
        ) : (
          <>
            {/* Progress */}
            <div className="mb-8">
              <ProgressBar current={currentIndex + 1} total={cards.length} />
            </div>

            {/* Question Card */}
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl border border-slate-200 shadow-lg p-8 mb-6"
            >
              <span className="text-xs uppercase tracking-wider text-slate-400 mb-3 block">
                Term
              </span>
              <h2 className="text-2xl md:text-3xl font-medium text-slate-900 text-center mb-8">
                {currentCard.term}
              </h2>

              {!showResult ? (
                <div className="space-y-4">
                  <Input
                    ref={inputRef}
                    placeholder="Type your answer..."
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="h-14 text-lg text-center"
                    autoComplete="off"
                  />
                  
                  <div className="flex items-center justify-between">
                    <Button
                      variant="ghost"
                      onClick={() => setShowHint(!showHint)}
                      className="text-slate-500 gap-2"
                    >
                      <Lightbulb className="w-4 h-4" />
                      {showHint ? 'Hide Hint' : 'Show Hint'}
                    </Button>
                    <Button
                      onClick={checkAnswer}
                      disabled={!answer.trim()}
                      className="bg-indigo-600 hover:bg-indigo-700"
                    >
                      Check Answer
                    </Button>
                  </div>

                  <AnimatePresence>
                    {showHint && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="p-4 bg-amber-50 rounded-lg border border-amber-200"
                      >
                        <p className="text-amber-800 text-sm">
                          First letter: <strong>{currentCard.definition[0]}</strong>
                          {currentCard.definition.length > 1 && (
                            <span> ({currentCard.definition.length} characters)</span>
                          )}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="space-y-4"
                >
                  <div className={`p-4 rounded-xl ${
                    isCorrect 
                      ? 'bg-emerald-50 border border-emerald-200' 
                      : 'bg-red-50 border border-red-200'
                  }`}>
                    <div className="flex items-center gap-3 mb-2">
                      {isCorrect ? (
                        <Check className="w-6 h-6 text-emerald-600" />
                      ) : (
                        <X className="w-6 h-6 text-red-500" />
                      )}
                      <span className={`font-semibold ${isCorrect ? 'text-emerald-700' : 'text-red-700'}`}>
                        {isCorrect ? 'Correct!' : 'Not quite right'}
                      </span>
                    </div>
                    
                    {!isCorrect && (
                      <>
                        <p className="text-sm text-slate-600 mb-1">Your answer:</p>
                        <p className="text-red-700 mb-3">{answer}</p>
                      </>
                    )}
                    
                    <p className="text-sm text-slate-600 mb-1">Correct answer:</p>
                    <p className={isCorrect ? 'text-emerald-700 font-medium' : 'text-slate-900 font-medium'}>
                      {currentCard.definition}
                    </p>
                  </div>

                  <Button
                    onClick={handleNext}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 gap-2"
                  >
                    {currentIndex < cards.length - 1 ? 'Next Card' : 'See Results'}
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </motion.div>
              )}
            </motion.div>

            <p className="text-center text-sm text-slate-400">
              Press Enter to check or continue
            </p>
          </>
        )}
      </div>
    </div>
  );
}