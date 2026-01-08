import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ArrowLeft, Crown, Lock, CheckCircle, XCircle, Sparkles, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import confetti from 'canvas-confetti';

export default function TakePracticeTest() {
  const urlParams = new URLSearchParams(window.location.search);
  const category = urlParams.get('category');
  const testNumber = parseInt(urlParams.get('test'));

  const [user, setUser] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [score, setScore] = useState({ correct: 0, incorrect: 0 });
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    base44.auth.me().then(setUser);
  }, []);

  const { data: allQuestions = [], isLoading } = useQuery({
    queryKey: ['practice-test-questions', category, testNumber],
    queryFn: () => base44.entities.PracticeTest.filter({ category, test_number: testNumber }, 'question_number'),
    enabled: !!category && !!testNumber,
  });

  const questions = allQuestions;
  const isPremium = user?.subscription_type === 'monthly' || user?.subscription_type === 'lifetime';
  const currentQuestion = questions[currentIndex];
  const isLocked = currentQuestion?.is_premium && !isPremium;

  const handleAnswerSelect = (answerIndex) => {
    if (showExplanation || isLocked) return;
    setSelectedAnswer(answerIndex);
  };

  const handleSubmit = () => {
    if (selectedAnswer === null) return;

    setShowExplanation(true);
    const isCorrect = selectedAnswer === currentQuestion.correct_answer;
    
    if (isCorrect) {
      setScore(prev => ({ ...prev, correct: prev.correct + 1 }));
    } else {
      setScore(prev => ({ ...prev, incorrect: prev.incorrect + 1 }));
    }
  };

  const handleNext = async () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
    } else {
      setCompleted(true);
      
      const accuracy = Math.round((score.correct / (score.correct + score.incorrect)) * 100);
      if (accuracy === 100) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      }

      // Award points
      try {
        await base44.functions.invoke('awardPoints', {
          points: score.correct * 15,
          correctAnswers: score.correct,
          totalCards: questions.length,
          accuracy,
        });
      } catch (error) {
        console.error('Failed to award points:', error);
      }
    }
  };

  const handleUnlock = () => {
    toast.error('This question requires Premium');
    setTimeout(() => {
      window.location.href = createPageUrl('Pricing');
    }, 1500);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Loading questions...</p>
        </div>
      </div>
    );
  }

  if (completed) {
    const total = score.correct + score.incorrect;
    const percentage = Math.round((score.correct / total) * 100);

    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-lg w-full text-center"
        >
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
            <Trophy className="w-10 h-10 text-white" />
          </div>
          
          <h2 className="text-3xl font-bold text-slate-900 mb-2">Test Complete!</h2>
          <p className="text-lg text-slate-600 mb-8">
            {percentage === 100 ? 'Perfect score! 🎉' : percentage >= 80 ? 'Great job! 🌟' : 'Keep practicing! 💪'}
          </p>

          <div className="bg-white rounded-2xl border border-slate-200 p-8 mb-8">
            <div className="text-5xl font-bold text-indigo-600 mb-6">{percentage}%</div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-emerald-50 rounded-xl">
                <CheckCircle className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-emerald-600">{score.correct}</div>
                <div className="text-sm text-emerald-700">Correct</div>
              </div>
              
              <div className="p-4 bg-red-50 rounded-xl">
                <XCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-red-500">{score.incorrect}</div>
                <div className="text-sm text-red-600">Incorrect</div>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <Link to={createPageUrl(`SelectPracticeTest?category=${category}`)}>
              <Button className="w-full bg-indigo-600 hover:bg-indigo-700">
                Back to Tests
              </Button>
            </Link>
            <Button variant="outline" onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link to={createPageUrl(`SelectPracticeTest?category=${category}`)}>
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div className="text-center flex-1">
              <div className="text-sm text-slate-500">{category} Test {testNumber}</div>
              <div className="font-semibold text-slate-900">
                Question {currentIndex + 1} of {questions.length}
              </div>
            </div>
            <div className="w-10"></div>
          </div>
          
          <div className="mt-3 bg-slate-100 rounded-full h-2 overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-indigo-500 to-purple-600"
              initial={{ width: 0 }}
              animate={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isLocked ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-16"
          >
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-amber-400 to-yellow-500 flex items-center justify-center">
              <Lock className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Premium Question</h2>
            <p className="text-slate-600 mb-6 max-w-md mx-auto">
              This question is part of our premium content. Upgrade to access all practice questions and detailed explanations.
            </p>
            <Button onClick={handleUnlock} className="bg-indigo-600 hover:bg-indigo-700 gap-2">
              <Crown className="w-4 h-4" />
              Unlock Premium
            </Button>
          </motion.div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-white rounded-2xl border border-slate-200 p-8"
            >
              <div className="mb-6">
                {currentQuestion?.is_premium && (
                  <div className="inline-flex items-center gap-1 bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-sm font-medium mb-3">
                    <Crown className="w-3 h-3" />
                    Premium
                  </div>
                )}
                <h2 className="text-xl font-semibold text-slate-900 mb-2">
                  {currentQuestion?.question}
                </h2>
                <div className="text-sm text-slate-500">
                  Difficulty: <span className="capitalize">{currentQuestion?.difficulty}</span>
                </div>
              </div>

              <div className="space-y-3 mb-6">
                {currentQuestion?.options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => handleAnswerSelect(index)}
                    disabled={showExplanation}
                    className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                      showExplanation
                        ? index === currentQuestion.correct_answer
                          ? 'border-emerald-500 bg-emerald-50'
                          : index === selectedAnswer
                          ? 'border-red-500 bg-red-50'
                          : 'border-slate-200 bg-slate-50 opacity-50'
                        : selectedAnswer === index
                        ? 'border-indigo-500 bg-indigo-50'
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold ${
                        showExplanation
                          ? index === currentQuestion.correct_answer
                            ? 'bg-emerald-500 text-white'
                            : index === selectedAnswer
                            ? 'bg-red-500 text-white'
                            : 'bg-slate-200 text-slate-600'
                          : selectedAnswer === index
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-200 text-slate-600'
                      }`}>
                        {String.fromCharCode(65 + index)}
                      </div>
                      <span className="flex-1 text-slate-900">{option}</span>
                      {showExplanation && index === currentQuestion.correct_answer && (
                        <CheckCircle className="w-5 h-5 text-emerald-600" />
                      )}
                      {showExplanation && index === selectedAnswer && index !== currentQuestion.correct_answer && (
                        <XCircle className="w-5 h-5 text-red-500" />
                      )}
                    </div>
                  </button>
                ))}
              </div>

              {showExplanation && currentQuestion?.explanation && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-6 p-4 bg-indigo-50 border border-indigo-200 rounded-xl"
                >
                  <div className="flex items-start gap-2">
                    <Sparkles className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="font-semibold text-indigo-900 mb-1">Explanation</div>
                      <p className="text-indigo-800 text-sm">{currentQuestion.explanation}</p>
                    </div>
                  </div>
                </motion.div>
              )}

              <div className="flex justify-end">
                {!showExplanation ? (
                  <Button
                    onClick={handleSubmit}
                    disabled={selectedAnswer === null}
                    className="bg-indigo-600 hover:bg-indigo-700"
                  >
                    Submit Answer
                  </Button>
                ) : (
                  <Button onClick={handleNext} className="bg-indigo-600 hover:bg-indigo-700">
                    {currentIndex < questions.length - 1 ? 'Next Question' : 'Finish Test'}
                  </Button>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}