import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Clock, Flame, Zap, Award, CheckCircle2, XCircle, ArrowRight, Lightbulb, Sparkles, User, HelpCircle, ShieldAlert, Pause, Play, FastForward } from 'lucide-react';
import confetti from 'canvas-confetti';
import { CategoryId, DifficultyLevel, GameModeType, OpponentProfile, PlayerStats, Question } from '../types/duel';
import { CATEGORIES } from '../data/categories';
import { soundEngine } from '../utils/audio';
import { questionService } from '../utils/questionService';
import { recordMistake, getTimerConfig, saveTimerConfig } from '../utils/storage';

interface ArenaPlayProps {
  mode: GameModeType;
  timePerQuestion: number;
  totalQuestions: number;
  selectedCategories: CategoryId[];
  subtopic?: string;
  difficulty: DifficultyLevel;
  opponent?: OpponentProfile;
  playerStats: PlayerStats;
  onUpdateStats: (newStats: PlayerStats) => void;
  onFinishGame: (summary: {
    score: number;
    correctCount: number;
    totalCount: number;
    avgTime: number;
    streak: number;
    mode: GameModeType;
    duelWon?: boolean;
    questions: { question: Question; userAns: string; isCorrect: boolean; timeSpent: number }[];
  }) => void;
  onQuit: () => void;
}

export const ArenaPlay: React.FC<ArenaPlayProps> = ({
  mode,
  timePerQuestion,
  totalQuestions,
  selectedCategories,
  subtopic,
  difficulty,
  opponent,
  playerStats,
  onUpdateStats,
  onFinishGame,
  onQuit,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(timePerQuestion > 0 ? timePerQuestion : 0);
  const [score, setScore] = useState<number>(0);
  const [opponentScore, setOpponentScore] = useState<number>(0);
  const [currentStreak, setCurrentStreak] = useState<number>(0);
  const [highestStreakThisGame, setHighestStreakThisGame] = useState<number>(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState<boolean>(false);
  const [coachAnalysis, setCoachAnalysis] = useState<string | null>(null);
  const [loadingCoach, setLoadingCoach] = useState<boolean>(false);
  const [opponentBuzzedFirst, setOpponentBuzzedFirst] = useState<boolean>(false);

  // Auto-Advance Question Progression State (Automatically advances without needing to click Next)
  const initialTimerSettings = useRef(getTimerConfig());
  const [autoAdvance, setAutoAdvance] = useState<boolean>(initialTimerSettings.current.autoAdvance ?? true);
  const [autoAdvanceDelayMs, setAutoAdvanceDelayMs] = useState<number>(initialTimerSettings.current.autoAdvanceDelayMs ?? 1500);
  const [autoAdvanceRemainingMs, setAutoAdvanceRemainingMs] = useState<number>(1500);
  const [isAutoAdvancePaused, setIsAutoAdvancePaused] = useState<boolean>(false);
  const autoAdvanceIntervalRef = useRef<any>(null);

  // Match Question Log for comprehensive post-game review
  const gameLogRef = useRef<{ question: Question; userAns: string; isCorrect: boolean; timeSpent: number }[]>([]);
  const questionStartTimeRef = useRef<number>(Date.now());
  const timerIntervalRef = useRef<any>(null);
  const opponentTimeoutRef = useRef<any>(null);

  const isUntimed = timePerQuestion <= 0;

  // Toggle Auto Advance preference and persist
  const handleToggleAutoAdvance = () => {
    const nextVal = !autoAdvance;
    setAutoAdvance(nextVal);
    const curr = getTimerConfig();
    saveTimerConfig({ ...curr, autoAdvance: nextVal });
  };

  // Load question
  const loadQuestion = useCallback(() => {
    if (autoAdvanceIntervalRef.current) {
      clearInterval(autoAdvanceIntervalRef.current);
      autoAdvanceIntervalRef.current = null;
    }
    setIsAnswered(false);
    setSelectedAnswer(null);
    setCoachAnalysis(null);
    setOpponentBuzzedFirst(false);
    setIsAutoAdvancePaused(false);
    setAutoAdvanceRemainingMs(autoAdvanceDelayMs);
    setTimeLeft(timePerQuestion > 0 ? timePerQuestion : 0);

    const nextQ = questionService.getNextQuestion(
      selectedCategories.length === 1 ? selectedCategories[0] : undefined,
      currentStreak,
      difficulty,
      subtopic
    );
    setCurrentQuestion(nextQ);
    questionStartTimeRef.current = Date.now();

    // If Duel Arena mode with an opponent and timed, simulate rival's buzz attempt
    if (opponent && !isUntimed) {
      if (opponentTimeoutRef.current) clearTimeout(opponentTimeoutRef.current);

      const [minSpeed, maxSpeed] = opponent.buzzSpeedRange;
      const rivalReaction = Math.min(
        timePerQuestion - 0.5,
        Math.max(1.8, minSpeed + Math.random() * (maxSpeed - minSpeed))
      );

      opponentTimeoutRef.current = setTimeout(() => {
        setIsAnswered(prev => {
          if (!prev) {
            setOpponentBuzzedFirst(true);
            const rivalCorrect = Math.random() < opponent.accuracyRating;
            soundEngine.playBuzz();
            if (rivalCorrect) {
              setOpponentScore(os => os + 150);
            } else {
              setOpponentScore(os => Math.max(0, os - 50));
            }
            return true;
          }
          return prev;
        });
      }, rivalReaction * 1000);
    }
  }, [selectedCategories, currentStreak, difficulty, timePerQuestion, opponent, subtopic, isUntimed]);

  // Initial load
  useEffect(() => {
    loadQuestion();
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      if (opponentTimeoutRef.current) clearTimeout(opponentTimeoutRef.current);
    };
  }, []);

  // Timer Tick
  useEffect(() => {
    if (isAnswered || !currentQuestion || isUntimed) return;

    timerIntervalRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerIntervalRef.current);
          handleTimeExpired();
          return 0;
        }
        if (prev <= 4) {
          soundEngine.playUrgentTick();
        } else {
          soundEngine.playTick(600);
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [isAnswered, currentQuestion, isUntimed]);

  // Handle Time Expired (Buzzer Out)
  const handleTimeExpired = () => {
    if (isAnswered || !currentQuestion) return;
    setIsAnswered(true);
    soundEngine.playBuzz();
    soundEngine.playWrong();

    recordMistake(currentQuestion, 'Time Expired (No Answer)');
    gameLogRef.current.push({
      question: currentQuestion,
      userAns: 'TIME_EXPIRED',
      isCorrect: false,
      timeSpent: timePerQuestion,
    });

    setCurrentStreak(0);
  };

  // Answer handler
  const handleSelectOption = (option: string) => {
    if (isAnswered || !currentQuestion) return;
    if (opponentTimeoutRef.current) clearTimeout(opponentTimeoutRef.current);

    const timeSpent = Math.max(0.5, (Date.now() - questionStartTimeRef.current) / 1000);
    const isCorrect = option === currentQuestion.options[currentQuestion.correctIndex];

    setSelectedAnswer(option);
    setIsAnswered(true);

    if (isCorrect) {
      soundEngine.playCorrect();
      const newStreak = currentStreak + 1;
      setCurrentStreak(newStreak);
      if (newStreak > highestStreakThisGame) {
        setHighestStreakThisGame(newStreak);
      }
      if (newStreak % 3 === 0) {
        soundEngine.playStreak();
      }

      // Point calculation: Base 100 + Speed Bonus (up to 150) * multiplier
      const speedBonus = Math.max(0, Math.round(((timePerQuestion - timeSpent) / timePerQuestion) * 150));
      const multiplier = newStreak >= 5 ? 2.5 : newStreak >= 3 ? 1.8 : 1.0;
      const pointsEarned = Math.round((100 + speedBonus) * multiplier);

      setScore(s => s + pointsEarned);
    } else {
      soundEngine.playWrong();
      setCurrentStreak(0);
      recordMistake(currentQuestion, option);
    }

    gameLogRef.current.push({
      question: currentQuestion,
      userAns: option,
      isCorrect,
      timeSpent,
    });
  };

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isAnswered || !currentQuestion) {
        if (isAnswered && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          handleNext();
        }
        return;
      }

      const key = e.key.toUpperCase();
      if (key === '1' || key === 'A') handleSelectOption(currentQuestion.options[0]);
      else if (key === '2' || key === 'B') handleSelectOption(currentQuestion.options[1]);
      else if (key === '3' || key === 'C') handleSelectOption(currentQuestion.options[2]);
      else if (key === '4' || key === 'D') handleSelectOption(currentQuestion.options[3]);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAnswered, currentQuestion]);

  // Next question or finish
  const handleNext = () => {
    if (autoAdvanceIntervalRef.current) {
      clearInterval(autoAdvanceIntervalRef.current);
      autoAdvanceIntervalRef.current = null;
    }
    if (currentIndex + 1 >= totalQuestions) {
      handleCompleteRound();
    } else {
      setCurrentIndex(i => i + 1);
      loadQuestion();
    }
  };

  // Automatic question progression (Auto-Advance) without user needing to press Next
  useEffect(() => {
    if (!isAnswered || !autoAdvance || isAutoAdvancePaused) {
      if (autoAdvanceIntervalRef.current) {
        clearInterval(autoAdvanceIntervalRef.current);
        autoAdvanceIntervalRef.current = null;
      }
      return;
    }

    const totalMs = autoAdvanceDelayMs;
    const startTime = Date.now();
    setAutoAdvanceRemainingMs(totalMs);

    autoAdvanceIntervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, totalMs - elapsed);
      setAutoAdvanceRemainingMs(remaining);

      if (remaining <= 0) {
        if (autoAdvanceIntervalRef.current) {
          clearInterval(autoAdvanceIntervalRef.current);
          autoAdvanceIntervalRef.current = null;
        }
        handleNext();
      }
    }, 40);

    return () => {
      if (autoAdvanceIntervalRef.current) {
        clearInterval(autoAdvanceIntervalRef.current);
        autoAdvanceIntervalRef.current = null;
      }
    };
  }, [isAnswered, autoAdvance, isAutoAdvancePaused, autoAdvanceDelayMs, currentIndex, totalQuestions]);

  const handleCompleteRound = () => {
    const log = gameLogRef.current;
    const correctCount = log.filter(l => l.isCorrect).length;
    const totalTimeSpent = log.reduce((sum, l) => sum + l.timeSpent, 0);
    const avgTime = log.length > 0 ? Number((totalTimeSpent / log.length).toFixed(1)) : timePerQuestion;

    const duelWon = opponent ? score > opponentScore : true;
    if (duelWon) {
      soundEngine.playFanfare();
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#f59e0b', '#10b981', '#06b6d4'],
      });
    }

    // Update player Elo & stats + category accuracy tracking
    const eloDelta = duelWon ? (correctCount >= 7 ? 35 : 20) : -15;
    const newRating = Math.max(800, playerStats.rating + eloDelta);

    const updatedCategoryAccuracy = { ...playerStats.accuracyByCategory };
    log.forEach(item => {
      const cat = item.question.category;
      if (updatedCategoryAccuracy[cat]) {
        updatedCategoryAccuracy[cat] = {
          total: updatedCategoryAccuracy[cat].total + 1,
          correct: updatedCategoryAccuracy[cat].correct + (item.isCorrect ? 1 : 0),
        };
      }
    });

    const updatedStats: PlayerStats = {
      ...playerStats,
      rating: newRating,
      totalPoints: playerStats.totalPoints + score,
      gamesPlayed: playerStats.gamesPlayed + 1,
      duelsWon: duelWon ? playerStats.duelsWon + 1 : playerStats.duelsWon,
      duelsLost: !duelWon && opponent ? playerStats.duelsLost + 1 : playerStats.duelsLost,
      highestStreak: Math.max(playerStats.highestStreak, highestStreakThisGame),
      avgResponseTimeMs: Math.round((playerStats.avgResponseTimeMs + avgTime * 1000) / 2),
      accuracyByCategory: updatedCategoryAccuracy,
    };

    onUpdateStats(updatedStats);

    onFinishGame({
      score,
      correctCount,
      totalCount: totalQuestions,
      avgTime,
      streak: highestStreakThisGame,
      mode,
      duelWon,
      questions: log,
    });
  };

  // Request AI Grandmaster Coach Breakdown
  const handleAskCoach = async () => {
    if (!currentQuestion) return;
    setIsAutoAdvancePaused(true); // Pause auto-advance so the player can carefully study the coach's speed tactics
    setLoadingCoach(true);
    const explanation = await questionService.getCoachExplanation(
      currentQuestion.question,
      currentQuestion.options,
      currentQuestion.options[currentQuestion.correctIndex],
      selectedAnswer || 'No Answer'
    );
    setCoachAnalysis(explanation);
    setLoadingCoach(false);
  };

  if (!currentQuestion) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-amber-500 border-t-transparent" />
          <p className="text-xs text-slate-400">Summoning duel question...</p>
        </div>
      </div>
    );
  }

  const categoryMeta = CATEGORIES[currentQuestion.category];
  const timerFraction = timeLeft / timePerQuestion;
  const strokeDashoffset = 283 * (1 - timerFraction);

  // Timer Color
  let timerColorClass = 'text-emerald-500';
  let timerBgClass = 'bg-emerald-500/10 border-emerald-500/30';
  if (timeLeft <= 3) {
    timerColorClass = 'text-rose-500 animate-pulse';
    timerBgClass = 'bg-rose-500/20 border-rose-500/50';
  } else if (timeLeft <= timePerQuestion * 0.4) {
    timerColorClass = 'text-amber-400';
    timerBgClass = 'bg-amber-500/10 border-amber-500/30';
  }

  const currentMultiplier = currentStreak >= 5 ? '2.5x' : currentStreak >= 3 ? '1.8x' : '1.0x';

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6">
      {/* Duel Arena Header Bar */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-800 bg-slate-900/90 p-4 shadow-xl backdrop-blur-md">
        {/* Left: Round count & Category */}
        <div className="flex items-center gap-3">
          <span className="flex h-8 items-center rounded-lg bg-slate-800 px-3 font-mono text-xs font-bold text-slate-200">
            Q {currentIndex + 1} / {totalQuestions}
          </span>
          <div className="flex items-center gap-1.5 text-xs">
            <span className={`inline-block h-2 w-2 rounded-full`} style={{ backgroundColor: categoryMeta.color }} />
            <span className="font-semibold text-slate-200">{categoryMeta.name}</span>
            <span className="text-slate-500 hidden sm:inline">·</span>
            <span className="text-slate-400 hidden sm:inline truncate max-w-[200px]">{currentQuestion.topic}</span>
          </div>
        </div>

        {/* Center: Live Opponent Duel Tug of War (if duel mode) */}
        {opponent ? (
          <div className="flex items-center gap-4 border-x border-slate-800 px-4">
            <div className="text-right">
              <div className="text-[11px] font-semibold text-slate-400 truncate max-w-[90px]">{playerStats.username}</div>
              <div className="font-mono text-sm font-bold text-amber-400">{score} pts</div>
            </div>
            <div className="font-bold text-xs text-slate-600">VS</div>
            <div className="text-left">
              <div className="text-[11px] font-semibold text-slate-400 truncate max-w-[90px]">{opponent.name}</div>
              <div className="font-mono text-sm font-bold text-cyan-400">{opponentScore} pts</div>
            </div>
          </div>
        ) : (
          /* Multiplier & Points in Solo Mode */
          <div className="flex items-center gap-3">
            {currentStreak > 1 && (
              <div className="flex items-center gap-1.5 rounded-lg border border-orange-500/40 bg-orange-950/40 px-2.5 py-1 text-xs font-bold text-orange-400">
                <Flame className="h-3.5 w-3.5 fill-orange-400" />
                <span>{currentMultiplier} COMBO</span>
              </div>
            )}
            <div className="font-mono text-base font-extrabold text-amber-400">
              {score} <span className="text-xs text-slate-400 font-normal">PTS</span>
            </div>
          </div>
        )}

        {/* Right: Quit button */}
        <button
          onClick={onQuit}
          className="rounded-lg px-2.5 py-1 text-xs font-medium text-slate-400 hover:bg-slate-800 hover:text-white transition"
        >
          Exit Round
        </button>
      </div>

      {/* Opponent Buzzed Banner */}
      {opponentBuzzedFirst && (
        <div className="mb-4 flex items-center justify-between rounded-xl border border-rose-500/40 bg-rose-950/40 p-3 text-xs text-rose-200">
          <div className="flex items-center gap-2">
            <ShieldAlert className="h-4 w-4 text-rose-400" />
            <span>
              <strong>{opponent?.name}</strong> ({opponent?.university}) buzzed in first!
            </span>
          </div>
          <span className="font-mono text-[11px] text-rose-300 font-semibold">Speed Buzz Claimed</span>
        </div>
      )}

      {/* Central Duel Arena Card */}
      <div className="relative rounded-3xl border border-slate-800 bg-gradient-to-b from-slate-900 to-slate-950 p-6 shadow-2xl sm:p-8">
        {/* Circular Countdown Gauge */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="rounded bg-slate-800/80 px-2 py-0.5 font-mono text-[11px] font-semibold text-slate-300 uppercase tracking-wider">
              {difficulty}
            </span>
            <span className="text-xs text-slate-500">
              {isUntimed
                ? 'Untimed Study Mode'
                : mode === 'brain_math'
                ? 'Brain Math (8s Lightning)'
                : mode === 'quick_buzz'
                ? 'Quick Buzz (15s Round)'
                : mode === 'subject_drill'
                ? 'Subject Area Drill'
                : 'Tournament Speed'}
            </span>
          </div>

          {/* Circular SVG Timer or Untimed Icon & Auto-Advance Toggle */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleToggleAutoAdvance}
              title={`Automatic question advance is ${autoAdvance ? 'ON' : 'OFF'}. Click to toggle.`}
              className={`flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-[11px] font-semibold border transition active:scale-95 ${
                autoAdvance
                  ? 'border-amber-500/40 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20'
                  : 'border-slate-800 bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              <Zap className={`h-3.5 w-3.5 ${autoAdvance ? 'text-amber-400' : 'text-slate-500'}`} />
              <span className="hidden sm:inline">Auto-Advance:</span>
              <span className={autoAdvance ? 'text-amber-400 font-bold' : 'text-slate-400'}>
                {autoAdvance ? 'ON' : 'OFF'}
              </span>
            </button>

            {isUntimed ? (
              <div className="flex h-12 items-center gap-1.5 rounded-xl border border-cyan-500/30 bg-cyan-950/40 px-3 py-1 font-mono text-xs font-bold text-cyan-300">
                <span className="text-base leading-none">∞</span>
                <span>Untimed</span>
              </div>
            ) : (
              <div className={`relative flex h-14 w-14 items-center justify-center rounded-full border ${timerBgClass}`}>
                <svg className="h-14 w-14 -rotate-90 transform" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    className="stroke-slate-800"
                    strokeWidth="8"
                    fill="transparent"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    className={`stroke-current transition-all duration-300 ${timerColorClass}`}
                    strokeWidth="8"
                    strokeDasharray="283"
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    fill="transparent"
                  />
                </svg>
                <span className={`absolute font-mono text-base font-extrabold ${timerColorClass}`}>
                  {timeLeft}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Question Statement */}
        <div className="mb-8">
          <h2 className="font-['Syne'] text-lg font-bold leading-relaxed text-white sm:text-xl md:text-2xl whitespace-pre-line text-balance">
            {currentQuestion.question}
          </h2>

          {/* Optional Data Table / Sequence representation */}
          {currentQuestion.dataContext && (
            <div className="mt-4 rounded-xl border border-slate-800 bg-slate-950/80 p-3 font-mono text-xs text-cyan-300">
              {typeof currentQuestion.dataContext.content === 'string'
                ? currentQuestion.dataContext.content
                : JSON.stringify(currentQuestion.dataContext.content, null, 2)}
            </div>
          )}
        </div>

        {/* 4 Interactive Option Pads */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {currentQuestion.options.map((opt, idx) => {
            const letter = ['A', 'B', 'C', 'D'][idx];
            const isSelected = selectedAnswer === opt;
            const isCorrectOption = idx === currentQuestion.correctIndex;

            let optionStyle =
              'border-slate-800 bg-slate-800/50 text-slate-200 hover:border-slate-700 hover:bg-slate-800';

            if (isAnswered) {
              if (isCorrectOption) {
                optionStyle =
                  'border-emerald-500/80 bg-emerald-950/60 text-emerald-200 shadow-md shadow-emerald-500/10 ring-1 ring-emerald-500';
              } else if (isSelected) {
                optionStyle = 'border-rose-500/80 bg-rose-950/60 text-rose-200 ring-1 ring-rose-500';
              } else {
                optionStyle = 'border-slate-800/40 bg-slate-900/30 text-slate-500 opacity-60';
              }
            }

            return (
              <button
                key={opt}
                disabled={isAnswered}
                onClick={() => handleSelectOption(opt)}
                className={`group relative flex items-start gap-3 rounded-2xl border p-4 text-left transition-all duration-150 active:scale-[0.98] ${optionStyle}`}
              >
                {/* Hotkey Tag */}
                <span
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md font-mono text-xs font-bold transition ${
                    isAnswered && isCorrectOption
                      ? 'bg-emerald-500 text-slate-950'
                      : isAnswered && isSelected
                      ? 'bg-rose-500 text-white'
                      : 'bg-slate-700/60 text-slate-300 group-hover:bg-amber-500 group-hover:text-slate-950'
                  }`}
                >
                  {letter}
                </span>

                <span className="flex-1 text-sm font-medium leading-snug break-words">
                  {opt}
                </span>

                {isAnswered && isCorrectOption && (
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-400" />
                )}
                {isAnswered && isSelected && !isCorrectOption && (
                  <XCircle className="h-5 w-5 shrink-0 text-rose-400" />
                )}
              </button>
            );
          })}
        </div>

        {/* Immediate Post-Answer Breakdown & Navigation */}
        {isAnswered && (
          <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-950/90 p-5 animate-in fade-in slide-in-from-bottom-2 duration-200">
            {/* Answer Result Banner & Navigation */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                {selectedAnswer === currentQuestion.options[currentQuestion.correctIndex] ? (
                  <span className="flex items-center gap-1.5 font-['Syne'] text-sm font-bold text-emerald-400">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    Correct! Speedy deduction
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 font-['Syne'] text-sm font-bold text-rose-400">
                    <XCircle className="h-4 w-4 text-rose-400" />
                    Incorrect · Correct: {currentQuestion.options[currentQuestion.correctIndex]}
                  </span>
                )}
              </div>

              {/* Auto-Advance status + Next Action */}
              <div className="flex items-center gap-2">
                {autoAdvance && !isAutoAdvancePaused ? (
                  <div className="flex items-center gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-1.5">
                    <div className="flex items-center gap-1.5 text-xs text-amber-300 font-mono font-semibold">
                      <Zap className="h-3.5 w-3.5 text-amber-400 animate-pulse" />
                      <span>Next in {(autoAdvanceRemainingMs / 1000).toFixed(1)}s</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsAutoAdvancePaused(true)}
                      className="rounded-lg border border-slate-700 bg-slate-800 px-2 py-0.5 text-[11px] font-medium text-slate-300 hover:bg-slate-700 hover:text-white transition flex items-center gap-1"
                      title="Pause auto-advance to read the explanation"
                    >
                      <Pause className="h-3 w-3" />
                      <span>Pause</span>
                    </button>
                  </div>
                ) : autoAdvance && isAutoAdvancePaused ? (
                  <div className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800/80 px-3 py-1.5">
                    <span className="text-xs text-slate-400 font-mono">Auto-advance paused</span>
                    <button
                      type="button"
                      onClick={() => setIsAutoAdvancePaused(false)}
                      className="rounded-lg border border-amber-500/40 bg-amber-500/20 px-2 py-0.5 text-[11px] font-semibold text-amber-300 hover:bg-amber-500/30 transition flex items-center gap-1"
                    >
                      <Play className="h-3 w-3" />
                      <span>Resume</span>
                    </button>
                  </div>
                ) : null}

                {/* Immediate Next Question Button */}
                <button
                  onClick={handleNext}
                  autoFocus
                  className="flex items-center gap-2 rounded-xl bg-amber-500 px-4 py-2 text-xs font-bold text-slate-950 shadow-md shadow-amber-500/20 transition hover:bg-amber-400 active:scale-95"
                  title="Advance immediately to next question"
                >
                  <span>{currentIndex + 1 >= totalQuestions ? 'Finish Match' : 'Next Now'}</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Smooth animated auto-advance progress countdown bar */}
            {autoAdvance && !isAutoAdvancePaused && (
              <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden mt-3 mb-1">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 via-amber-400 to-emerald-400 transition-all duration-75"
                  style={{
                    width: `${Math.max(0, Math.min(100, ((autoAdvanceDelayMs - autoAdvanceRemainingMs) / autoAdvanceDelayMs) * 100))}%`,
                  }}
                />
              </div>
            )}

            {/* Standard Explanation */}
            <div className="mt-3 text-xs text-slate-300 leading-relaxed">
              <strong className="text-slate-100">Step-by-Step Logic: </strong>
              {currentQuestion.explanation}
            </div>

            {/* Mental Shortcut */}
            {currentQuestion.mentalShortcut && (
              <div className="mt-3 flex items-start gap-2 rounded-xl border border-amber-500/30 bg-amber-950/20 p-3 text-xs text-amber-200">
                <Lightbulb className="h-4 w-4 shrink-0 text-amber-400 mt-0.5" />
                <div>
                  <strong className="text-amber-400">Mental Shortcut: </strong>
                  {currentQuestion.mentalShortcut}
                </div>
              </div>
            )}

            {/* Ask AI Grandmaster Coach */}
            <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-col gap-2">
              <button
                type="button"
                onClick={handleAskCoach}
                disabled={loadingCoach}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition"
              >
                <Sparkles className="h-3.5 w-3.5" />
                {loadingCoach ? 'Synthesizing grandmaster coach strategy...' : 'Ask AI Coach: Explain Speed Tactics'}
              </button>

              {coachAnalysis && (
                <div className="rounded-xl border border-cyan-500/30 bg-cyan-950/30 p-3 text-xs text-cyan-200 leading-relaxed animate-in fade-in">
                  <div className="font-semibold text-cyan-300 mb-1 flex items-center gap-1">
                    <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
                    Grandmaster Tournament Analysis:
                  </div>
                  {coachAnalysis}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Keyboard Shortcuts Hint */}
      <div className="mt-4 text-center text-xs text-slate-500">
        Tip: Press <kbd className="rounded border border-slate-700 bg-slate-800 px-1.5 py-0.5 font-mono text-[10px] text-slate-300">1</kbd>, <kbd className="rounded border border-slate-700 bg-slate-800 px-1.5 py-0.5 font-mono text-[10px] text-slate-300">2</kbd>, <kbd className="rounded border border-slate-700 bg-slate-800 px-1.5 py-0.5 font-mono text-[10px] text-slate-300">3</kbd>, <kbd className="rounded border border-slate-700 bg-slate-800 px-1.5 py-0.5 font-mono text-[10px] text-slate-300">4</kbd> or <kbd className="rounded border border-slate-700 bg-slate-800 px-1.5 py-0.5 font-mono text-[10px] text-slate-300">Enter</kbd> to buzz instantly.
      </div>
    </div>
  );
};
