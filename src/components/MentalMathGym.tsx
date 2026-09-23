import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Zap,
  Clock,
  Flame,
  Award,
  BookOpen,
  ArrowRight,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Lightbulb,
  Sparkles,
  ArrowLeft,
  ChevronRight,
  Delete,
  Hash,
  ListOrdered
} from 'lucide-react';
import confetti from 'canvas-confetti';
import {
  generateMentalMathProblem,
  MentalMathCategory,
  MentalMathProblem,
  MENTAL_MATH_TECHNIQUES,
  MentalMathTechnique
} from '../utils/mentalMathGenerator';
import { soundEngine } from '../utils/audio';

type GymMode = 'blitz_60' | 'streak_survivor' | 'targeted_drill';
type InputMode = 'options' | 'numpad';

interface MentalMathGymProps {
  onBackToLobby: () => void;
}

export const MentalMathGym: React.FC<MentalMathGymProps> = ({ onBackToLobby }) => {
  // Gym State
  const [gymState, setGymState] = useState<'lobby' | 'playing' | 'results' | 'codex'>('lobby');
  const [selectedMode, setSelectedMode] = useState<GymMode>('blitz_60');
  const [selectedCategory, setSelectedCategory] = useState<MentalMathCategory>('all');
  const [inputMode, setInputMode] = useState<InputMode>('numpad');

  // Play session state
  const [currentProblem, setCurrentProblem] = useState<MentalMathProblem | null>(null);
  const [userTypedInput, setUserTypedInput] = useState<string>('');
  const [selectedOption, setSelectedOption] = useState<string | number | null>(null);
  const [isAnswered, setIsAnswered] = useState<boolean>(false);
  const [isCorrect, setIsCorrect] = useState<boolean>(false);

  // Scoring & Stats
  const [score, setScore] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);
  const [highestStreak, setHighestStreak] = useState<number>(0);
  const [solvedCount, setSolvedCount] = useState<number>(0);
  const [mistakeList, setMistakeList] = useState<{ problem: MentalMathProblem; userAns: string }[]>([]);

  // 60-Second Blitz Timer
  const [timeLeft, setTimeLeft] = useState<number>(60);
  const blitzIntervalRef = useRef<any>(null);
  const questionStartTimeRef = useRef<number>(Date.now());
  const responseTimesRef = useRef<number[]>([]);
  const autoAdvanceTimeoutRef = useRef<any>(null);

  // Local storage high scores
  const [highScoreBlitz, setHighScoreBlitz] = useState<number>(() => {
    try {
      return parseInt(localStorage.getItem('varsity_mm_high_blitz') || '0', 10);
    } catch {
      return 0;
    }
  });
  const [bestStreakRecord, setBestStreakRecord] = useState<number>(() => {
    try {
      return parseInt(localStorage.getItem('varsity_mm_best_streak') || '0', 10);
    } catch {
      return 0;
    }
  });

  // Load next mental math problem
  const loadNextProblem = useCallback(() => {
    if (autoAdvanceTimeoutRef.current) clearTimeout(autoAdvanceTimeoutRef.current);
    setIsAnswered(false);
    setUserTypedInput('');
    setSelectedOption(null);
    setIsCorrect(false);

    const problem = generateMentalMathProblem(selectedCategory);
    setCurrentProblem(problem);
    questionStartTimeRef.current = Date.now();
  }, [selectedCategory]);

  // Start Session
  const handleStartSession = (mode: GymMode) => {
    setSelectedMode(mode);
    setScore(0);
    setStreak(0);
    setHighestStreak(0);
    setSolvedCount(0);
    setMistakeList([]);
    responseTimesRef.current = [];
    setTimeLeft(mode === 'blitz_60' ? 60 : 0);
    setGymState('playing');

    loadNextProblem();
  };

  // 60-second blitz countdown
  useEffect(() => {
    if (gymState !== 'playing' || selectedMode !== 'blitz_60') return;

    blitzIntervalRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(blitzIntervalRef.current);
          handleFinishSession();
          return 0;
        }
        if (prev <= 5) soundEngine.playUrgentTick();
        else soundEngine.playTick(700);
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (blitzIntervalRef.current) clearInterval(blitzIntervalRef.current);
    };
  }, [gymState, selectedMode]);

  // Finish session
  const handleFinishSession = () => {
    if (blitzIntervalRef.current) clearInterval(blitzIntervalRef.current);
    if (autoAdvanceTimeoutRef.current) clearTimeout(autoAdvanceTimeoutRef.current);
    soundEngine.playFanfare();

    setGymState('results');

    // Update records
    if (selectedMode === 'blitz_60') {
      setScore(currScore => {
        if (currScore > highScoreBlitz) {
          setHighScoreBlitz(currScore);
          try {
            localStorage.setItem('varsity_mm_high_blitz', currScore.toString());
          } catch {}
          confetti({ particleCount: 70, spread: 60 });
        }
        return currScore;
      });
    }

    setHighestStreak(currHigh => {
      if (currHigh > bestStreakRecord) {
        setBestStreakRecord(currHigh);
        try {
          localStorage.setItem('varsity_mm_best_streak', currHigh.toString());
        } catch {}
      }
      return currHigh;
    });
  };

  // Process user answer
  const submitAnswer = (userAnswer: string | number) => {
    if (isAnswered || !currentProblem) return;

    const timeSpent = (Date.now() - questionStartTimeRef.current) / 1000;
    responseTimesRef.current.push(timeSpent);

    const correctStr = String(currentProblem.correctAnswer).trim().toLowerCase();
    const userStr = String(userAnswer).trim().toLowerCase();
    const correct = userStr === correctStr;

    setIsAnswered(true);
    setIsCorrect(correct);
    setSelectedOption(userAnswer);

    if (correct) {
      soundEngine.playCorrect();
      const newStreak = streak + 1;
      setStreak(newStreak);
      if (newStreak > highestStreak) setHighestStreak(newStreak);
      if (newStreak % 5 === 0) soundEngine.playStreak();

      const speedMultiplier = timeSpent < 2 ? 2.0 : timeSpent < 3.5 ? 1.5 : 1.0;
      const pts = Math.round((100 + Math.max(0, 10 - timeSpent) * 15) * speedMultiplier);
      setScore(s => s + pts);
      setSolvedCount(c => c + 1);

      // Fast auto-advance on correct answers (0.6s) to maintain rapid flow!
      autoAdvanceTimeoutRef.current = setTimeout(() => {
        loadNextProblem();
      }, 700);
    } else {
      soundEngine.playWrong();
      setStreak(0);
      setMistakeList(prev => [...prev, { problem: currentProblem, userAns: String(userAnswer) }]);

      // If Streak Survivor mode, 1 mistake ends the round immediately!
      if (selectedMode === 'streak_survivor') {
        autoAdvanceTimeoutRef.current = setTimeout(() => {
          handleFinishSession();
        }, 1200);
        return;
      }

      // Slightly longer delay on wrong answer so user can register the mental shortcut
      autoAdvanceTimeoutRef.current = setTimeout(() => {
        loadNextProblem();
      }, 1600);
    }
  };

  // Numpad key handlers
  const handleNumpadPress = (digit: string) => {
    if (isAnswered) return;
    setUserTypedInput(prev => {
      const next = prev + digit;
      // If the answer is an exact match already, auto-submit!
      if (currentProblem && next.trim().toLowerCase() === String(currentProblem.correctAnswer).trim().toLowerCase()) {
        submitAnswer(next);
      }
      return next;
    });
  };

  const handleNumpadBackspace = () => {
    if (isAnswered) return;
    setUserTypedInput(prev => prev.slice(0, -1));
  };

  const handleNumpadSubmit = () => {
    if (isAnswered || !userTypedInput.trim()) return;
    submitAnswer(userTypedInput.trim());
  };

  // Physical Keyboard Listener
  useEffect(() => {
    if (gymState !== 'playing' || !currentProblem) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (isAnswered) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          loadNextProblem();
        }
        return;
      }

      // Multiple choice option mode hotkeys
      if (inputMode === 'options') {
        if (['1', '2', '3', '4'].includes(e.key)) {
          const idx = parseInt(e.key, 10) - 1;
          if (currentProblem.options[idx] !== undefined) {
            submitAnswer(currentProblem.options[idx]);
          }
        }
        return;
      }

      // Direct numpad / typing mode
      if (e.key >= '0' && e.key <= '9') {
        handleNumpadPress(e.key);
      } else if (e.key === '.' || e.key === '-') {
        handleNumpadPress(e.key);
      } else if (e.key === 'Backspace') {
        handleNumpadBackspace();
      } else if (e.key === 'Enter') {
        e.preventDefault();
        handleNumpadSubmit();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gymState, isAnswered, currentProblem, inputMode, userTypedInput]);

  // Average time calculation
  const avgTime =
    responseTimesRef.current.length > 0
      ? (responseTimesRef.current.reduce((a, b) => a + b, 0) / responseTimesRef.current.length).toFixed(1)
      : '0.0';

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6">
      {/* Top Breadcrumb & Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              if (gymState !== 'lobby') {
                if (autoAdvanceTimeoutRef.current) clearTimeout(autoAdvanceTimeoutRef.current);
                if (blitzIntervalRef.current) clearInterval(blitzIntervalRef.current);
                setGymState('lobby');
              } else {
                onBackToLobby();
              }
            }}
            className="flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-900/80 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:bg-slate-800 hover:text-white transition"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>{gymState === 'lobby' ? 'Back to Lobby' : 'Exit Session'}</span>
          </button>

          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <Zap className="h-4 w-4" />
            </span>
            <h1 className="font-['Syne'] text-lg font-bold text-white sm:text-xl">
              Mental Math Training Gym
            </h1>
          </div>
        </div>

        {/* Technique Codex Button */}
        <button
          onClick={() => setGymState(gymState === 'codex' ? 'lobby' : 'codex')}
          className={`flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-bold transition ${
            gymState === 'codex'
              ? 'bg-amber-500 text-slate-950'
              : 'border border-amber-500/40 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20'
          }`}
        >
          <BookOpen className="h-4 w-4 text-amber-400" />
          <span>{gymState === 'codex' ? 'Back to Training' : 'Mental Math Formula Codex'}</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* 1. LOBBY VIEW */}
      {/* ========================================================================= */}
      {gymState === 'lobby' && (
        <div className="space-y-8 animate-in fade-in duration-150">
          {/* Hero Banner */}
          <div className="relative overflow-hidden rounded-3xl border border-emerald-500/30 bg-gradient-to-r from-emerald-950/60 via-slate-900 to-cyan-950/60 p-6 sm:p-8">
            <div className="relative z-10 max-w-2xl">
              <div className="inline-flex items-center gap-1.5 rounded-md bg-emerald-500/10 px-2.5 py-0.5 text-xs font-bold text-emerald-400 border border-emerald-500/30 mb-3">
                <Sparkles className="h-3.5 w-3.5" />
                <span>HIGH-VELOCITY MENTAL CALCULATION</span>
              </div>
              <h2 className="font-['Syne'] text-2xl font-black text-white sm:text-3xl tracking-tight">
                Sharpen Lightning Mental Speed
              </h2>
              <p className="mt-2 text-xs sm:text-sm text-slate-300 leading-relaxed">
                Master collegiate speed arithmetic: cross-multiplication, squaring ending in 5, dilution factors,
                logarithmic pH, matrix determinants, and commutative percentages without paper or calculator.
              </p>

              {/* Records showcase */}
              <div className="mt-5 flex flex-wrap gap-4 pt-4 border-t border-slate-800/80">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-amber-400" />
                  <span className="text-xs text-slate-400">60s Blitz High Score:</span>
                  <span className="font-mono text-sm font-bold text-amber-400">{highScoreBlitz} pts</span>
                </div>
                <div className="flex items-center gap-2">
                  <Flame className="h-4 w-4 text-rose-400" />
                  <span className="text-xs text-slate-400">Best Streak:</span>
                  <span className="font-mono text-sm font-bold text-rose-400">{bestStreakRecord} in a row</span>
                </div>
              </div>
            </div>
          </div>

          {/* Training Modes Grid */}
          <div>
            <h3 className="font-['Syne'] text-base font-bold text-white mb-4">
              Select Your Speed Challenge
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* 60s Blitz */}
              <div
                onClick={() => handleStartSession('blitz_60')}
                className="group cursor-pointer rounded-2xl border border-amber-500/30 bg-slate-900/80 p-5 transition hover:border-amber-400 hover:bg-slate-900 shadow-lg relative overflow-hidden"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400 group-hover:scale-105 transition">
                    <Clock className="h-6 w-6" />
                  </div>
                  <span className="font-mono text-[10px] font-bold uppercase rounded bg-amber-950/80 text-amber-300 px-2 py-0.5 border border-amber-800/40">
                    60 Seconds
                  </span>
                </div>
                <h4 className="font-['Syne'] text-base font-bold text-white group-hover:text-amber-300 transition">
                  60-Second Blitz Sprint
                </h4>
                <p className="mt-1.5 text-xs text-slate-400 leading-relaxed">
                  Race against the clock to solve as many mental arithmetic problems as you can before the buzzer hits zero.
                </p>
                <div className="mt-5 flex items-center text-xs font-bold text-amber-400">
                  <span>Start 60s Blitz</span>
                  <ArrowRight className="h-3.5 w-3.5 ml-1.5 group-hover:translate-x-1 transition" />
                </div>
              </div>

              {/* Streak Survivor */}
              <div
                onClick={() => handleStartSession('streak_survivor')}
                className="group cursor-pointer rounded-2xl border border-rose-500/30 bg-slate-900/80 p-5 transition hover:border-rose-400 hover:bg-slate-900 shadow-lg"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-rose-500/20 text-rose-400 group-hover:scale-105 transition">
                    <Flame className="h-6 w-6" />
                  </div>
                  <span className="font-mono text-[10px] font-bold uppercase rounded bg-rose-950/80 text-rose-300 px-2 py-0.5 border border-rose-800/40">
                    Sudden Death
                  </span>
                </div>
                <h4 className="font-['Syne'] text-base font-bold text-white group-hover:text-rose-300 transition">
                  Streak Survivor
                </h4>
                <p className="mt-1.5 text-xs text-slate-400 leading-relaxed">
                  Sudden death mental arithmetic! One single miscalculation and the round ends. How far can your focus take you?
                </p>
                <div className="mt-5 flex items-center text-xs font-bold text-rose-400">
                  <span>Enter Survivor</span>
                  <ArrowRight className="h-3.5 w-3.5 ml-1.5 group-hover:translate-x-1 transition" />
                </div>
              </div>

              {/* Targeted Skills Drill */}
              <div
                onClick={() => handleStartSession('targeted_drill')}
                className="group cursor-pointer rounded-2xl border border-cyan-500/30 bg-slate-900/80 p-5 transition hover:border-cyan-400 hover:bg-slate-900 shadow-lg"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-500/20 text-cyan-400 group-hover:scale-105 transition">
                    <Zap className="h-6 w-6" />
                  </div>
                  <span className="font-mono text-[10px] font-bold uppercase rounded bg-cyan-950/80 text-cyan-300 px-2 py-0.5 border border-cyan-800/40">
                    Untimed / Precision
                  </span>
                </div>
                <h4 className="font-['Syne'] text-base font-bold text-white group-hover:text-cyan-300 transition">
                  Targeted Skills Drill
                </h4>
                <p className="mt-1.5 text-xs text-slate-400 leading-relaxed">
                  Focus on specific calculation modules: cross-multiplication, solution dilutions, logarithms, or series Gauss sums.
                </p>
                <div className="mt-5 flex items-center text-xs font-bold text-cyan-400">
                  <span>Start Drill</span>
                  <ArrowRight className="h-3.5 w-3.5 ml-1.5 group-hover:translate-x-1 transition" />
                </div>
              </div>
            </div>
          </div>

          {/* Module Filter & Input Mode Selector */}
          <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-5">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">
              Focus Calculation Module
            </h4>
            <div className="flex flex-wrap gap-2">
              {[
                { id: 'all', label: 'All Operations & Shortcuts' },
                { id: 'squaring_powers', label: 'Squaring (Ending in 5 & Expansions)' },
                { id: 'multiplication', label: 'Cross-Multiplication & 11s' },
                { id: 'percentages_fractions', label: 'Commutative % & Splits' },
                { id: 'lab_science', label: 'Lab Dilutions, pH & Half-Lives' },
                { id: 'algebra_matrices', label: '2×2 Determinants & Diff of Squares' },
                { id: 'series_combinatorics', label: 'Series Sums & Combinations' },
              ].map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id as MentalMathCategory)}
                  className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold transition ${
                    selectedCategory === cat.id
                      ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                      : 'border border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            <div className="mt-5 pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-4">
              <div>
                <span className="text-xs font-semibold text-white">Input Method:</span>
                <span className="text-xs text-slate-400 ml-2">Choose how you answer calculation prompts</span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setInputMode('numpad')}
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                    inputMode === 'numpad'
                      ? 'bg-emerald-500 text-slate-950'
                      : 'border border-slate-800 bg-slate-900 text-slate-400 hover:text-white'
                  }`}
                >
                  <Hash className="h-3.5 w-3.5" />
                  <span>Direct Numpad / Typing</span>
                </button>
                <button
                  onClick={() => setInputMode('options')}
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                    inputMode === 'options'
                      ? 'bg-emerald-500 text-slate-950'
                      : 'border border-slate-800 bg-slate-900 text-slate-400 hover:text-white'
                  }`}
                >
                  <ListOrdered className="h-3.5 w-3.5" />
                  <span>Multiple Choice Flash</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. PLAYING / TRAINING SESSION VIEW */}
      {/* ========================================================================= */}
      {gymState === 'playing' && currentProblem && (
        <div className="mx-auto max-w-2xl space-y-6 animate-in fade-in duration-150">
          {/* Status Bar */}
          <div className="flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-950/80 px-5 py-3">
            {/* Mode & Category */}
            <div className="flex items-center gap-2">
              <span className="rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-bold uppercase">
                {currentProblem.categoryLabel}
              </span>
              <span className="text-xs text-slate-400">
                {selectedMode === 'blitz_60'
                  ? '60s Blitz'
                  : selectedMode === 'streak_survivor'
                  ? 'Streak Survivor'
                  : 'Targeted Drill'}
              </span>
            </div>

            {/* Timer or Score */}
            <div className="flex items-center gap-4">
              {selectedMode === 'blitz_60' && (
                <div className={`flex items-center gap-1.5 font-mono text-base font-bold ${
                  timeLeft <= 10 ? 'text-rose-400 animate-pulse' : 'text-amber-400'
                }`}>
                  <Clock className="h-4 w-4" />
                  <span>{timeLeft}s</span>
                </div>
              )}

              <div className="flex items-center gap-1 text-xs text-rose-400 font-mono font-bold">
                <Flame className="h-4 w-4" />
                <span>Streak: {streak}</span>
              </div>

              <div className="text-xs text-amber-300 font-mono font-bold">
                {score} pts
              </div>
            </div>
          </div>

          {/* Central Problem Display */}
          <div className={`rounded-3xl border p-8 text-center transition-all ${
            isAnswered
              ? isCorrect
                ? 'border-emerald-500/60 bg-emerald-950/30 shadow-lg shadow-emerald-500/10'
                : 'border-rose-500/60 bg-rose-950/30 shadow-lg shadow-rose-500/10'
              : 'border-slate-800 bg-slate-900/90'
          }`}>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Calculate in Your Head
            </span>

            {/* The math problem */}
            <div className="my-5 font-mono text-4xl sm:text-5xl font-black text-white whitespace-pre-line tracking-wide">
              {currentProblem.problem}
            </div>

            {currentProblem.subtext && (
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                {currentProblem.subtext}
              </p>
            )}

            {/* Answer Feedback Banner */}
            {isAnswered && (
              <div className="mt-5 rounded-2xl border border-slate-800 bg-slate-950/90 p-4 animate-in fade-in text-left">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    {isCorrect ? (
                      <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
                        <CheckCircle2 className="h-4 w-4" /> Correct! Next problem auto-loading...
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 text-xs font-bold text-rose-400">
                        <XCircle className="h-4 w-4" /> Incorrect · Correct Answer: {currentProblem.correctAnswer}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={loadNextProblem}
                    className="flex items-center gap-1 rounded-lg bg-amber-500 px-3 py-1 text-xs font-bold text-slate-950 hover:bg-amber-400 transition"
                  >
                    <span>Next</span>
                    <ArrowRight className="h-3 w-3" />
                  </button>
                </div>

                <div className="flex items-start gap-2 text-xs text-amber-200">
                  <Lightbulb className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-amber-400">Speed Shortcut: </strong>
                    {currentProblem.shortcut}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input Method 1: DIRECT NUMPAD */}
          {inputMode === 'numpad' && (
            <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-5">
              {/* Display of typed digits */}
              <div className="mb-4 flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900 px-4 py-3">
                <span className="text-xs text-slate-400">Your Answer:</span>
                <span className="font-mono text-2xl font-bold text-white tracking-widest min-h-[32px]">
                  {userTypedInput || <span className="text-slate-600 animate-pulse">_</span>}
                </span>
                <button
                  type="button"
                  onClick={handleNumpadBackspace}
                  className="rounded-lg border border-slate-700 bg-slate-800 p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 transition"
                  title="Backspace"
                >
                  <Delete className="h-4 w-4" />
                </button>
              </div>

              {/* On-screen touch keypad */}
              <div className="grid grid-cols-3 gap-2.5 max-w-xs mx-auto">
                {['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0', '-'].map(key => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => handleNumpadPress(key)}
                    disabled={isAnswered}
                    className="flex h-12 items-center justify-center rounded-xl border border-slate-800 bg-slate-900/90 font-mono text-lg font-bold text-slate-200 transition hover:border-emerald-500/50 hover:bg-slate-800 active:scale-95 disabled:opacity-50"
                  >
                    {key}
                  </button>
                ))}
              </div>

              {/* Submit CTA */}
              <div className="mt-4 flex gap-2 max-w-xs mx-auto">
                <button
                  type="button"
                  onClick={() => setUserTypedInput('')}
                  disabled={isAnswered || !userTypedInput}
                  className="flex-1 rounded-xl border border-slate-800 bg-slate-900 py-2.5 text-xs font-semibold text-slate-400 hover:text-white transition disabled:opacity-50"
                >
                  Clear
                </button>
                <button
                  type="button"
                  onClick={handleNumpadSubmit}
                  disabled={isAnswered || !userTypedInput.trim()}
                  className="flex-2 flex items-center justify-center gap-1.5 rounded-xl bg-emerald-500 py-2.5 px-6 text-xs font-bold text-slate-950 shadow-md shadow-emerald-500/20 hover:bg-emerald-400 active:scale-95 transition disabled:opacity-50"
                >
                  <span>Submit Answer (Enter)</span>
                </button>
              </div>

              <div className="mt-3 text-center text-[11px] text-slate-500">
                You can also type numbers directly on your physical keyboard and hit Enter.
              </div>
            </div>
          )}

          {/* Input Method 2: MULTIPLE CHOICE FLASH */}
          {inputMode === 'options' && (
            <div className="grid grid-cols-2 gap-3">
              {currentProblem.options.map((opt, idx) => {
                const isSelected = selectedOption === opt;
                const isCorrectOpt = String(opt).trim().toLowerCase() === String(currentProblem.correctAnswer).trim().toLowerCase();

                let btnClass = 'border-slate-800 bg-slate-900/80 text-white hover:border-emerald-500/40 hover:bg-slate-850';
                if (isAnswered) {
                  if (isCorrectOpt) {
                    btnClass = 'border-emerald-500 bg-emerald-950/60 text-emerald-200 shadow-md shadow-emerald-500/20';
                  } else if (isSelected && !isCorrectOpt) {
                    btnClass = 'border-rose-500 bg-rose-950/60 text-rose-200';
                  } else {
                    btnClass = 'border-slate-800/40 bg-slate-950/30 text-slate-500';
                  }
                }

                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => submitAnswer(opt)}
                    disabled={isAnswered}
                    className={`flex items-center justify-between rounded-2xl border p-4 text-left transition active:scale-98 ${btnClass}`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="flex h-6 w-6 items-center justify-center rounded-md bg-slate-800 font-mono text-xs font-bold text-slate-400">
                        {idx + 1}
                      </span>
                      <span className="font-mono text-base font-bold">
                        {opt}
                      </span>
                    </div>

                    {isAnswered && isCorrectOpt && <CheckCircle2 className="h-5 w-5 text-emerald-400" />}
                    {isAnswered && isSelected && !isCorrectOpt && <XCircle className="h-5 w-5 text-rose-400" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. RESULTS VIEW */}
      {/* ========================================================================= */}
      {gymState === 'results' && (
        <div className="mx-auto max-w-xl space-y-6 animate-in fade-in duration-150">
          <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-8 text-center shadow-2xl">
            <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 mb-4">
              <Award className="h-8 w-8" />
            </div>

            <h3 className="font-['Syne'] text-2xl font-bold text-white">
              Mental Math Sprint Complete!
            </h3>
            <p className="mt-1 text-xs text-slate-400">
              {selectedMode === 'blitz_60'
                ? '60-Second Blitz Performance Report'
                : selectedMode === 'streak_survivor'
                ? 'Streak Survivor Run Concluded'
                : 'Targeted Calculation Session Finished'}
            </p>

            {/* Score Grid */}
            <div className="my-6 grid grid-cols-3 gap-3">
              <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3">
                <span className="text-[11px] text-slate-400">Total Points</span>
                <div className="font-mono text-xl font-bold text-amber-400">{score}</div>
              </div>
              <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3">
                <span className="text-[11px] text-slate-400">Problems Solved</span>
                <div className="font-mono text-xl font-bold text-emerald-400">{solvedCount}</div>
              </div>
              <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3">
                <span className="text-[11px] text-slate-400">Peak Streak</span>
                <div className="font-mono text-xl font-bold text-rose-400">{highestStreak}</div>
              </div>
            </div>

            {/* Average Speed */}
            <div className="flex items-center justify-center gap-2 text-xs text-slate-300">
              <Clock className="h-4 w-4 text-cyan-400" />
              <span>Average Calculation Velocity: </span>
              <strong className="font-mono text-cyan-400">{avgTime}s per problem</strong>
            </div>

            {/* Action CTAs */}
            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={() => handleStartSession(selectedMode)}
                className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-emerald-500 py-3 text-xs font-bold text-slate-950 shadow-md shadow-emerald-500/20 hover:bg-emerald-400 active:scale-95 transition"
              >
                <RotateCcw className="h-4 w-4" />
                <span>Play Again</span>
              </button>
              <button
                type="button"
                onClick={() => setGymState('lobby')}
                className="flex-1 rounded-xl border border-slate-800 bg-slate-800/80 py-3 text-xs font-semibold text-slate-200 hover:bg-slate-700 transition"
              >
                Choose Another Mode
              </button>
            </div>
          </div>

          {/* Mistakes & Speed Shortcuts Review */}
          {mistakeList.length > 0 && (
            <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-5">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">
                Review Calculation Shortcuts ({mistakeList.length} missed)
              </h4>
              <div className="space-y-3">
                {mistakeList.map((item, idx) => (
                  <div key={idx} className="rounded-xl border border-slate-800 bg-slate-900/60 p-3.5 text-xs">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-mono font-bold text-white text-sm">{item.problem.problem}</span>
                      <span className="font-mono text-[11px] text-rose-400">
                        You: {item.userAns} · Correct: {item.problem.correctAnswer}
                      </span>
                    </div>
                    <div className="text-amber-300 flex items-start gap-1.5 mt-1">
                      <Lightbulb className="h-3.5 w-3.5 text-amber-400 shrink-0 mt-0.5" />
                      <span>{item.problem.shortcut}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. MENTAL MATH FORMULA CODEX */}
      {/* ========================================================================= */}
      {gymState === 'codex' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-['Syne'] text-xl font-bold text-white">
                Mental Speed Formula Codex
              </h3>
              <p className="text-xs text-slate-400">
                Collegiate calculation heuristics, commutative shortcuts, and base-100 arithmetic rules
              </p>
            </div>
            <button
              onClick={() => setGymState('lobby')}
              className="rounded-xl bg-amber-500 px-4 py-2 text-xs font-bold text-slate-950 hover:bg-amber-400 transition"
            >
              Start Training Now →
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {MENTAL_MATH_TECHNIQUES.map(tech => (
              <div
                key={tech.id}
                className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-sm space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase rounded bg-slate-800 text-slate-300 px-2 py-0.5">
                    {tech.category}
                  </span>
                </div>
                <h4 className="font-['Syne'] text-base font-bold text-white">
                  {tech.title}
                </h4>

                {/* Formula box */}
                <div className="rounded-xl border border-amber-500/30 bg-amber-950/20 px-3.5 py-2 font-mono text-xs font-bold text-amber-300">
                  {tech.formula}
                </div>

                <div className="text-xs text-slate-300 leading-relaxed">
                  <strong className="text-white">Example: </strong>
                  <span className="font-mono text-emerald-300">{tech.example}</span>
                </div>

                <p className="text-xs text-slate-400 leading-relaxed">
                  {tech.explanation}
                </p>

                <div className="rounded-lg bg-slate-950/60 p-2.5 text-[11px] text-cyan-300 border border-slate-800/80">
                  💡 <strong>Pro Tip: </strong> {tech.tip}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
