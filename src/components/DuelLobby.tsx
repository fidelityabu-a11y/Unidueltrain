import React from 'react';
import { Zap, Gauge, Swords, Target, Trophy, Clock, BrainCircuit, BarChart3, Calculator, Globe2, ArrowRight, Flame, Shield, Sparkles, Database, Shuffle } from 'lucide-react';
import { CategoryId, GameModeType, OpponentProfile, PlayerStats } from '../types/duel';
import { UNIVERSITY_RIVALS } from '../data/opponents';
import { CATEGORIES } from '../data/categories';
import { CustomTimerConfig } from '../utils/storage';

interface DuelLobbyProps {
  playerStats: PlayerStats;
  timerConfig: CustomTimerConfig;
  onStartGame: (
    mode: GameModeType,
    timePerQuestion: number,
    categories?: CategoryId[],
    opponent?: OpponentProfile,
    subtopic?: string,
    totalQuestions?: number
  ) => void;
  onOpenLeaderboard: () => void;
  onOpenTimerSettings: () => void;
  onOpenTopicBrowser: () => void;
  onOpenReview: () => void;
  onOpenSubjectSection: (category?: CategoryId) => void;
  onOpenMentalMath: () => void;
}

export const DuelLobby: React.FC<DuelLobbyProps> = ({
  playerStats,
  timerConfig,
  onStartGame,
  onOpenLeaderboard,
  onOpenTimerSettings,
  onOpenTopicBrowser,
  onOpenReview,
  onOpenSubjectSection,
  onOpenMentalMath,
}) => {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-amber-500/30 bg-gradient-to-br from-slate-900 via-[#101726] to-slate-950 p-6 sm:p-10 shadow-2xl">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-bold text-amber-400 mb-4">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Collegiate Academic Duel Prep Engine</span>
          </div>
          <h1 className="font-['Syne'] text-3xl font-extrabold tracking-tight text-white sm:text-5xl leading-tight">
            Train Mental Speed. Master the Duel.
          </h1>
          <p className="mt-3 text-sm text-slate-300 sm:text-base leading-relaxed">
            Unlimited, tournament-grade duel challenges designed for pure mental calculation, razor-sharp pattern recognition, and critical reasoning across <strong>Data Analysis</strong>, <strong>Verbal Reasoning</strong>, <strong>Applied Mathematics</strong>, and <strong>African General Knowledge</strong>.
          </p>

          {/* Quick Stat Pill row */}
          <div className="mt-6 flex flex-wrap items-center gap-4 text-xs text-slate-400">
            <div className="flex items-center gap-1.5">
              <Shield className="h-4 w-4 text-amber-400" />
              <span>Contestant: <strong className="text-white">{playerStats.username}</strong></span>
            </div>
            <span>·</span>
            <div className="flex items-center gap-1.5">
              <span className="font-mono font-bold text-amber-400">{playerStats.rating}</span>
              <span>Elo Rating</span>
            </div>
            <span>·</span>
            <div className="flex items-center gap-1.5">
              <Flame className="h-4 w-4 text-orange-400" />
              <span>Top Streak: <strong className="text-orange-400">{playerStats.highestStreak}</strong></span>
            </div>
            <span>·</span>
            <div className="flex items-center gap-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-2.5 py-0.5 text-indigo-300">
              <Database className="h-3.5 w-3.5 text-indigo-400" />
              <span>6,000+ Questions</span>
            </div>
            <div className="flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-emerald-300">
              <Shuffle className="h-3.5 w-3.5 text-emerald-400" />
              <span>Fresh Shuffled Every Match</span>
            </div>
          </div>
        </div>

        {/* Decorative background glow */}
        <div className="pointer-events-none absolute -right-16 -top-16 h-72 w-72 rounded-full bg-amber-500/10 blur-3xl" />
        <div className="pointer-events-none absolute right-20 -bottom-10 h-60 w-60 rounded-full bg-cyan-500/10 blur-3xl" />
      </div>

      {/* Two Official Championship Levels (As Requested: Quick Buzz 15s & Brain Math 8s) */}
      <div className="mt-10">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-['Syne'] text-xl font-bold text-white sm:text-2xl flex items-center gap-2">
              Official Competition Levels
            </h2>
            <p className="text-xs text-slate-400">
              Select your competitive arena with standardized round timers
            </p>
          </div>
          <button
            onClick={onOpenTimerSettings}
            className="flex items-center gap-1 text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition"
          >
            <Clock className="h-3.5 w-3.5" />
            <span>Customize Timers ({timerConfig.quickBuzzTime}s / {timerConfig.brainMathTime}s)</span>
          </button>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Quick Buzz (15s) */}
          <div className="group relative overflow-hidden rounded-3xl border border-amber-500/40 bg-gradient-to-br from-slate-900/90 via-slate-900 to-amber-950/20 p-6 sm:p-8 shadow-xl transition-all duration-200 hover:border-amber-400 hover:shadow-amber-500/10">
            <div className="flex items-start justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/40 shadow-inner">
                <Zap className="h-6 w-6" />
              </div>
              <span className="font-mono text-xs font-bold uppercase tracking-wider rounded-lg bg-amber-500/20 text-amber-300 px-3 py-1 border border-amber-500/30">
                {timerConfig.quickBuzzTime} SECONDS / Q
              </span>
            </div>

            <h3 className="mt-5 font-['Syne'] text-2xl font-bold text-white group-hover:text-amber-300 transition">
              Quick Buzz Round
            </h3>
            <p className="mt-2 text-xs text-slate-300 leading-relaxed">
              Standard collegiate buzzer tournament round. Tests fast pattern classification, verbal reasoning deductions, data interpretations, and African cultural knowledge.
            </p>

            <div className="mt-6 flex flex-wrap gap-2 text-[11px] text-slate-400">
              <span className="rounded bg-slate-800 px-2 py-1">All 4 Syllabus Areas</span>
              <span className="rounded bg-slate-800 px-2 py-1">10 Questions</span>
              <span className="rounded bg-slate-800 px-2 py-1">Multiplier Combos</span>
            </div>

            <button
              onClick={() => onStartGame('quick_buzz', timerConfig.quickBuzzTime)}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-amber-500 py-3 text-xs font-bold text-slate-950 shadow-md shadow-amber-500/20 transition group-hover:bg-amber-400 active:scale-[0.98]"
            >
              <span>Enter Quick Buzz Arena</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>

          {/* Brain Math (8s) */}
          <div className="group relative overflow-hidden rounded-3xl border border-emerald-500/40 bg-gradient-to-br from-slate-900/90 via-slate-900 to-emerald-950/20 p-6 sm:p-8 shadow-xl transition-all duration-200 hover:border-emerald-400 hover:shadow-emerald-500/10">
            <div className="flex items-start justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-inner">
                <Gauge className="h-6 w-6" />
              </div>
              <span className="font-mono text-xs font-bold uppercase tracking-wider rounded-lg bg-emerald-500/20 text-emerald-300 px-3 py-1 border border-emerald-500/30">
                {timerConfig.brainMathTime} SECONDS / Q
              </span>
            </div>

            <h3 className="mt-5 font-['Syne'] text-2xl font-bold text-white group-hover:text-emerald-300 transition">
              Brain Math Sprint
            </h3>
            <p className="mt-2 text-xs text-slate-300 leading-relaxed">
              Ultra-fast mental arithmetic and quantitative intuition. Rapid-fire probability, ratios & dilutions, calculus rates, sequences, matrix determinants, and percentages.
            </p>

            <div className="mt-6 flex flex-wrap gap-2 text-[11px] text-slate-400">
              <span className="rounded bg-slate-800 px-2 py-1">Data & Applied Math</span>
              <span className="rounded bg-slate-800 px-2 py-1">10 Questions</span>
              <span className="rounded bg-slate-800 px-2 py-1">Mental Shortcuts</span>
            </div>

            <button
              onClick={() => onStartGame('brain_math', timerConfig.brainMathTime, ['data_analysis', 'applied_math'])}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 py-3 text-xs font-bold text-slate-950 shadow-md shadow-emerald-500/20 transition group-hover:bg-emerald-400 active:scale-[0.98]"
            >
              <span>Launch Brain Math Sprint</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Mental Math Training Gym Banner / Feature Card */}
      <div className="mt-10 overflow-hidden rounded-3xl border border-emerald-500/30 bg-gradient-to-r from-emerald-950/40 via-slate-900 to-cyan-950/40 p-6 sm:p-8 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-400 mb-3">
              <Zap className="h-3.5 w-3.5" />
              <span>DEDICATED CALCULATION SPEED GYM</span>
            </div>
            <h3 className="font-['Syne'] text-2xl font-bold text-white">
              Train Mental Math Capabilities
            </h3>
            <p className="mt-2 text-xs sm:text-sm text-slate-300 leading-relaxed">
              Drill lightning mental math tricks: cross-multiplication, squaring ending in 5 (<span className="font-mono text-emerald-300">65² = 4225</span>),
              lab solution dilutions (<span className="font-mono text-emerald-300">C₁V₁ = C₂V₂</span>), logarithmic pH, matrix determinants, and 60-second speed blitzes.
            </p>
            <div className="mt-4 flex flex-wrap gap-2 text-[11px] text-slate-400">
              <span className="rounded bg-slate-800/90 px-2.5 py-1 text-slate-300">⏱️ 60s Blitz Sprint</span>
              <span className="rounded bg-slate-800/90 px-2.5 py-1 text-slate-300">🔥 Sudden Death Streak Survivor</span>
              <span className="rounded bg-slate-800/90 px-2.5 py-1 text-slate-300">🔢 Interactive Numpad & Keyboard</span>
              <span className="rounded bg-slate-800/90 px-2.5 py-1 text-slate-300">📘 Formula & Shortcut Codex</span>
            </div>
          </div>

          <div className="shrink-0 flex flex-col gap-2">
            <button
              onClick={onOpenMentalMath}
              className="flex items-center justify-center gap-2 rounded-2xl bg-emerald-500 px-6 py-3.5 text-xs font-bold text-slate-950 shadow-lg shadow-emerald-500/20 hover:bg-emerald-400 active:scale-95 transition"
            >
              <span>Enter Mental Math Gym</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Head-to-Head University Rival Duel Arena */}
      <div className="mt-12 rounded-3xl border border-slate-800 bg-slate-900/70 p-6 sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="font-['Syne'] text-xl font-bold text-white flex items-center gap-2">
              <Swords className="h-5 w-5 text-rose-400" />
              University Rival Duel Arena
            </h2>
            <p className="text-xs text-slate-400">
              Head-to-head match against elite university scholars with live buzzer competition
            </p>
          </div>
          <div className="text-xs text-slate-400">
            Duel Record: <strong className="text-white">{playerStats.duelsWon} Wins</strong> / {playerStats.duelsLost} Losses
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {UNIVERSITY_RIVALS.slice(0, 3).map((rival, idx) => (
            <div
              key={idx}
              className="rounded-2xl border border-slate-800 bg-slate-950/80 p-5 flex flex-col justify-between transition hover:border-slate-700"
            >
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div className={`h-10 w-10 rounded-xl bg-gradient-to-tr ${rival.avatarColor} flex items-center justify-center text-sm font-bold text-white shadow-md`}>
                    {rival.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-['Syne'] text-sm font-bold text-white leading-tight">{rival.name}</h4>
                    <p className="text-xs text-amber-400/90 leading-tight">{rival.university}</p>
                  </div>
                </div>

                <div className="space-y-1 text-[11px] text-slate-400 border-t border-slate-800/80 pt-2 mb-4">
                  <div className="flex justify-between">
                    <span>Reaction Velocity:</span>
                    <span className="font-mono text-cyan-400 font-semibold">{rival.speedRating}/10</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Accuracy Rating:</span>
                    <span className="font-mono text-emerald-400 font-semibold">{Math.round(rival.accuracyRating * 100)}%</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => onStartGame('duel_arena', 12, undefined, rival)}
                className="flex items-center justify-center gap-1.5 rounded-xl border border-rose-500/40 bg-rose-500/10 py-2 text-xs font-bold text-rose-300 hover:bg-rose-500 hover:text-slate-950 transition active:scale-95"
              >
                <Swords className="h-3.5 w-3.5" />
                <span>Challenge in Duel</span>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* 4 Dedicated Subject Area Sections (Answer questions from those areas only) */}
      <div className="mt-12">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-md bg-amber-500/10 px-2 py-0.5 text-[11px] font-bold text-amber-400 border border-amber-500/30 mb-1">
              <Target className="h-3 w-3" />
              <span>SINGLE-SUBJECT FOCUS SECTIONS</span>
            </div>
            <h2 className="font-['Syne'] text-xl font-bold text-white sm:text-2xl">
              Dedicated Subject Arenas
            </h2>
            <p className="text-xs text-slate-400">
              Answer questions exclusively from a single subject area with dedicated subtopic filters, cheat-sheets, and timers
            </p>
          </div>
          <button
            onClick={() => onOpenSubjectSection()}
            className="flex items-center gap-1.5 rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-2 text-xs font-bold text-amber-300 hover:bg-amber-500/20 transition active:scale-95"
          >
            <Target className="h-3.5 w-3.5 text-amber-400" />
            <span>Enter Subject Arenas →</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Data Analysis */}
          <div
            onClick={() => onOpenSubjectSection('data_analysis')}
            className="group cursor-pointer rounded-2xl border border-cyan-500/30 bg-slate-900/60 p-5 transition hover:border-cyan-400 hover:bg-slate-900 shadow-md"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/20 text-cyan-400 group-hover:scale-105 transition">
                <BarChart3 className="h-5 w-5" />
              </div>
              <span className="font-mono text-[10px] font-bold uppercase rounded bg-cyan-950/80 text-cyan-300 px-2 py-0.5 border border-cyan-800/40">
                10 Topics
              </span>
            </div>
            <h4 className="font-['Syne'] text-base font-bold text-white group-hover:text-cyan-300 transition">
              Data Analysis
            </h4>
            <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
              Mean, median, IQR, boxplots, compound probability, normal curve, permutations.
            </p>
            <div className="mt-4 flex items-center text-xs font-semibold text-cyan-400">
              <span>Open Subject Section</span>
              <ArrowRight className="h-3.5 w-3.5 ml-1 group-hover:translate-x-1 transition" />
            </div>
          </div>

          {/* Verbal Reasoning */}
          <div
            onClick={() => onOpenSubjectSection('verbal_reasoning')}
            className="group cursor-pointer rounded-2xl border border-purple-500/30 bg-slate-900/60 p-5 transition hover:border-purple-400 hover:bg-slate-900 shadow-md"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/20 text-purple-400 group-hover:scale-105 transition">
                <BrainCircuit className="h-5 w-5" />
              </div>
              <span className="font-mono text-[10px] font-bold uppercase rounded bg-purple-950/80 text-purple-300 px-2 py-0.5 border border-purple-800/40">
                10 Topics
              </span>
            </div>
            <h4 className="font-['Syne'] text-base font-bold text-white group-hover:text-purple-300 transition">
              Verbal Reasoning
            </h4>
            <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
              Analogies, odd items out, blood relations, direction sense, alphabet series & ciphers.
            </p>
            <div className="mt-4 flex items-center text-xs font-semibold text-purple-400">
              <span>Open Subject Section</span>
              <ArrowRight className="h-3.5 w-3.5 ml-1 group-hover:translate-x-1 transition" />
            </div>
          </div>

          {/* Applied Mathematics */}
          <div
            onClick={() => onOpenSubjectSection('applied_math')}
            className="group cursor-pointer rounded-2xl border border-emerald-500/30 bg-slate-900/60 p-5 transition hover:border-emerald-400 hover:bg-slate-900 shadow-md"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400 group-hover:scale-105 transition">
                <Calculator className="h-5 w-5" />
              </div>
              <span className="font-mono text-[10px] font-bold uppercase rounded bg-emerald-950/80 text-emerald-300 px-2 py-0.5 border border-emerald-800/40">
                11 Topics
              </span>
            </div>
            <h4 className="font-['Syne'] text-base font-bold text-white group-hover:text-emerald-300 transition">
              Applied Math
            </h4>
            <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
              Dilution ratios, enzyme plots, rates of change, vectors, genetics & mechanics.
            </p>
            <div className="mt-4 flex items-center text-xs font-semibold text-emerald-400">
              <span>Open Subject Section</span>
              <ArrowRight className="h-3.5 w-3.5 ml-1 group-hover:translate-x-1 transition" />
            </div>
          </div>

          {/* General Knowledge */}
          <div
            onClick={() => onOpenSubjectSection('general_knowledge')}
            className="group cursor-pointer rounded-2xl border border-amber-500/30 bg-slate-900/60 p-5 transition hover:border-amber-400 hover:bg-slate-900 shadow-md"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400 group-hover:scale-105 transition">
                <Globe2 className="h-5 w-5" />
              </div>
              <span className="font-mono text-[10px] font-bold uppercase rounded bg-amber-950/80 text-amber-300 px-2 py-0.5 border border-amber-800/40">
                10 Topics
              </span>
            </div>
            <h4 className="font-['Syne'] text-base font-bold text-white group-hover:text-amber-300 transition">
              General Knowledge
            </h4>
            <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
              African music & film, green tech, Adire & Kente, Benin Bronzes, Soyinka & agriculture.
            </p>
            <div className="mt-4 flex items-center text-xs font-semibold text-amber-400">
              <span>Open Subject Section</span>
              <ArrowRight className="h-3.5 w-3.5 ml-1 group-hover:translate-x-1 transition" />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Access Bar */}
      <div className="mt-12 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
        <div className="flex items-center gap-3">
          <Trophy className="h-5 w-5 text-amber-400" />
          <div>
            <div className="text-sm font-semibold text-white">Track Global Standings</div>
            <div className="text-xs text-slate-400">Compare your university against premier institutions across Africa</div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenReview}
            className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white transition"
          >
            Mistakes Notebook
          </button>
          <button
            onClick={onOpenLeaderboard}
            className="rounded-xl bg-amber-500 px-5 py-2 text-xs font-bold text-slate-950 shadow-md shadow-amber-500/20 hover:bg-amber-400 active:scale-95 transition"
          >
            View Leaderboard
          </button>
        </div>
      </div>
    </div>
  );
};
