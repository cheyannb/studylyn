import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ArrowLeft, Loader2, Clock, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import ProgressBar from '@/components/ui/ProgressBar';
import StudyComplete from '@/components/study/StudyComplete';
import { motion } from 'framer-motion';

function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export default function StudyTest() {
  const urlParams = new URLSearchParams(window.location.search);
  const setId = urlParams.get('id');

  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [correct, setCorrect] = useState(0);
  const [incorrect, setIncorrect] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [startTime] = useState(Date.now());
  const [answers, setAnswers] = useState([]);

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
    if (cards.length >= 4) {
      const shuffledCards = shuffleArray(cards);
      const generatedQuestions = shuffledCards.map((card, index) => {
        // Get wrong answers from other cards
        const otherCards = cards.filter(c => c.id !== card.id);
        const wrongAnswers = shuffleArray(otherCards)
          .slice(0, 3)
          .map(c => c.definition);
        
        const allOptions = shuffleArray([card.definition, ...wrongAnswers]);
        
        return {
          id: card.id,
          term: card.term,
          correctAnswer: card.definition,
          options: allOptions,
        };
      });
      setQuestions(generatedQuestions);
    }
  }, [cards]);

  const handleAnswer = () => {
    const isCorrect = selectedAnswer === questions[currentIndex].correctAnswer;
    setAnswers([...answers, { 
      question: questions[currentIndex].term,
      userAnswer: selectedAnswer,
      correctAnswer: questions[currentIndex].correctAnswer,
      isCorrect 
    }]);
    
    if (isCorrect) {
      setCorrect(prev => prev + 1);
    } else {
      setIncorrect(prev => prev + 1);
    }
    setShowResult(true);
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setSelectedAnswer('');
      setShowResult(false);
    } else {
      setCompleted(true);
    }
  };

  const handleRestart = () => {
    const shuffledCards = shuffleArray(cards);
    const generatedQuestions = shuffledCards.map(card => {
      const otherCards = cards.filter(c => c.id !== card.id);
      const wrongAnswers = shuffleArray(otherCards)
        .slice(0, 3)
        .map(c => c.definition);
      
      const allOptions = shuffleArray([card.definition, ...wrongAnswers]);
      
      return {
        id: card.id,
        term: card.term,
        correctAnswer: card.definition,
        options: allOptions,
      };
    });
    setQuestions(generatedQuestions);
    setCurrentIndex(0);
    setSelectedAnswer('');
    setShowResult(false);
    setCorrect(0);
    setIncorrect(0);
    setCompleted(false);
    setAnswers([]);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (cards.length < 4) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-slate-900 mb-2">Need at least 4 cards for Test mode</h2>
          <p className="text-slate-500 mb-4">Add more cards to unlock this feature</p>
          <Link to={createPageUrl(`SetDetails?id=${setId}`)}>
            <Button variant="outline">Go back and add cards</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];
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
              <p className="text-sm text-slate-500">Test Mode</p>
            </div>
            <div className="flex items-center gap-2 text-slate-500">
              <Clock className="w-4 h-4" />
              <span className="text-sm">{Math.floor(duration / 60)}:{(duration % 60).toString().padStart(2, '0')}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {completed ? (
          <div>
            <StudyComplete
              correct={correct}
              incorrect={incorrect}
              total={questions.length}
              duration={duration}
              mode="test"
              setId={setId}
              onRestart={handleRestart}
            />
            
            {/* Review Answers */}
            <div className="mt-8 bg-white rounded-2xl border border-slate-200 p-6">
              <h3 className="font-semibold text-slate-900 mb-4">Review Your Answers</h3>
              <div className="space-y-4">
                {answers.map((answer, index) => (
                  <div 
                    key={index} 
                    className={`p-4 rounded-lg border ${
                      answer.isCorrect 
                        ? 'bg-emerald-50 border-emerald-200' 
                        : 'bg-red-50 border-red-200'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {answer.isCorrect ? (
                        <CheckCircle className="w-5 h-5 text-emerald-600 mt-0.5" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-500 mt-0.5" />
                      )}
                      <div className="flex-1">
                        <p className="font-medium text-slate-900">{answer.question}</p>
                        {!answer.isCorrect && (
                          <p className="text-sm text-red-600 mt-1">
                            Your answer: {answer.userAnswer}
                          </p>
                        )}
                        <p className="text-sm text-slate-600 mt-1">
                          Correct: {answer.correctAnswer}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Progress */}
            <div className="mb-8">
              <ProgressBar current={currentIndex + 1} total={questions.length} />
            </div>

            {/* Question */}
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl border border-slate-200 shadow-lg p-8 mb-6"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-slate-500">Question {currentIndex + 1} of {questions.length}</span>
              </div>

              <h2 className="text-xl md:text-2xl font-medium text-slate-900 mb-8">
                What is the definition of "<span className="text-indigo-600">{currentQuestion.term}</span>"?
              </h2>

              <RadioGroup 
                value={selectedAnswer} 
                onValueChange={setSelectedAnswer}
                disabled={showResult}
                className="space-y-3"
              >
                {currentQuestion.options.map((option, index) => {
                  const isCorrectAnswer = option === currentQuestion.correctAnswer;
                  const isSelected = option === selectedAnswer;
                  
                  let optionClass = 'border-slate-200 hover:border-indigo-300 hover:bg-indigo-50';
                  if (showResult) {
                    if (isCorrectAnswer) {
                      optionClass = 'border-emerald-400 bg-emerald-50';
                    } else if (isSelected && !isCorrectAnswer) {
                      optionClass = 'border-red-400 bg-red-50';
                    }
                  } else if (isSelected) {
                    optionClass = 'border-indigo-400 bg-indigo-50';
                  }

                  return (
                    <Label
                      key={index}
                      htmlFor={`option-${index}`}
                      className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all ${optionClass}`}
                    >
                      <RadioGroupItem value={option} id={`option-${index}`} />
                      <span className="text-slate-700">{option}</span>
                      {showResult && isCorrectAnswer && (
                        <CheckCircle className="w-5 h-5 text-emerald-600 ml-auto" />
                      )}
                      {showResult && isSelected && !isCorrectAnswer && (
                        <XCircle className="w-5 h-5 text-red-500 ml-auto" />
                      )}
                    </Label>
                  );
                })}
              </RadioGroup>

              <div className="mt-6">
                {!showResult ? (
                  <Button
                    onClick={handleAnswer}
                    disabled={!selectedAnswer}
                    className="w-full bg-indigo-600 hover:bg-indigo-700"
                  >
                    Submit Answer
                  </Button>
                ) : (
                  <Button
                    onClick={handleNext}
                    className="w-full bg-indigo-600 hover:bg-indigo-700"
                  >
                    {currentIndex < questions.length - 1 ? 'Next Question' : 'See Results'}
                  </Button>
                )}
              </div>
            </motion.div>
          </>
        )}
      </div>
    </div>
  );
}