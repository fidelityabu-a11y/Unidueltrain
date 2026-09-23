import React, { useState } from 'react';
import { Trophy, Volume2, VolumeX, Clock, BookOpen, User, Flame, Sparkles, Shield, Target, Zap } from 'lucide-react';
import { CategoryId, PlayerStats } from '../types/duel';
import { FAMOUS_UNIVERSITIES } from '../data/opponents';
import { soundEngine } from '../utils/audio';

interface NavbarProps {
  stats: PlayerStats;
  onUpdateStats: (newStats: PlayerStats) => void;
  onOpenTimerSettings: () => void;
  onOpenLeaderboard: () => void;
  onOpenReview: () => void;
  onOpenTopicBrowser: () => void;
  onOpenSubjectSection: (category?: CategoryId) => void;
  onOpenMentalMath: () => void;
  onGoHome: () => void;
  currentModeTitle?: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  stats,
  onUpdateStats,
  onOpenTimerSettings,
  onOpenLeaderboard,
  onOpenReview,
  onOpenTopicBrowser,
  onOpenSubjectSection,
  onOpenMentalMath,
  onGoHome,
  currentModeTitle,
}) => {
  const [soundOn, setSoundOn] = useState(soundEngine.enabled);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [tempName, setTempName] = useState(stats.username);
  const [tempUni, setTempUni] = useState(stats.university);

  const toggleSound = () => {
    const next = !soundOn;
    soundEngine.enabled = next;
    setSoundOn(next);
    if (next) soundEngine.playTick(900);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateStats({
      ...stats,
      username: tempName.trim() || 'VarsityScholar',
      university: tempUni,
    });
    setShowProfileModal(false);
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-[#0b0f19]/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <button
              onClick={onGoHome}
              className="group flex items-center gap-2.5 text-left transition-transform active:scale-95"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 via-amber-600 to-yellow-600 font-extrabold text-slate-950 shadow-md shadow-amber-500/20">
                <Shield className="h-5 w-5 fill-slate-950 stroke-slate-950" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-['Syne'] text-base font-bold tracking-tight text-white group-hover:text-amber-400 sm:text-lg">
                    VARSITY DUEL
                  </span>
                  <span className="rounded-md bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-amber-400 border border-amber-500/30">
                    PREP ARENA
                  </span>
                </div>
                <p className="text-xs text-slate-400 hidden sm:block">
                  University Academic Championship
                </p>
              </div>
            </button>

            {currentModeTitle && (
              <div className="hidden md:flex items-center gap-2 pl-4 border-l border-slate-800 text-xs">
                <span className="text-slate-500">Active Mode:</span>
                <span className="font-medium text-amber-400">{currentModeTitle}</span>
              </div>
            )}
          </div>

          {/* Player stats & action controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Institution Badge / Profile Clickable */}
            <button
              onClick={() => setShowProfileModal(true)}
              className="flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-900/80 px-2.5 py-1.5 text-xs text-slate-200 transition hover:border-slate-700 hover:bg-slate-800"
              title="Edit Scholar Profile & University"
            >
              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-500/20 text-[11px] font-bold text-amber-400">
                {stats.username.charAt(0).toUpperCase()}
              </div>
              <div className="hidden lg:block text-left">
                <div className="max-w-[130px] truncate font-medium text-slate-200 leading-tight">
                  {stats.username}
                </div>
                <div className="max-w-[130px] truncate text-[10px] text-slate-400 leading-tight">
                  {stats.university.split('(')[0]}
                </div>
              </div>
              <div className="rounded bg-amber-950/60 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-amber-400 border border-amber-800/40">
                {stats.rating} Elo
              </div>
            </button>

            {/* Streak Counter */}
            {stats.highestStreak > 0 && (
              <div className="hidden sm:flex items-center gap-1 rounded-lg border border-orange-500/30 bg-orange-950/30 px-2.5 py-1.5 text-xs font-semibold text-orange-400">
                <Flame className="h-3.5 w-3.5 fill-orange-400 text-orange-400" />
                <span>{stats.highestStreak} Streak</span>
              </div>
            )}

            {/* Subject Areas Section */}
            <button
              onClick={() => onOpenSubjectSection()}
              className="flex h-9 items-center gap-1.5 rounded-lg border border-amber-500/40 bg-amber-500/10 px-2.5 text-xs font-semibold text-amber-300 transition hover:bg-amber-500/20 active:scale-95"
              title="Answer questions by subject area (Data Analysis, Verbal Reasoning, Applied Math, General Knowledge)"
            >
              <Target className="h-3.5 w-3.5 text-amber-400" />
              <span>Subject Areas</span>
            </button>

            {/* Mental Math Training Gym */}
            <button
              onClick={onOpenMentalMath}
              className="flex h-9 items-center gap-1.5 rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-2.5 text-xs font-semibold text-emerald-300 transition hover:bg-emerald-500/20 active:scale-95 shadow-sm"
              title="Train Mental Math capabilities: Cross-multiplication, squaring ending in 5, dilutions, 60s blitz"
            >
              <Zap className="h-3.5 w-3.5 text-emerald-400" />
              <span>Mental Math</span>
            </button>

            {/* Timer Settings Button */}
            <button
              onClick={onOpenTimerSettings}
              className="flex h-9 items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900/80 px-2.5 text-xs font-medium text-slate-300 transition hover:border-slate-700 hover:text-white"
              title="Adjust Timers (5s, 8s, 10s, 15s, etc.)"
            >
              <Clock className="h-3.5 w-3.5 text-cyan-400" />
              <span className="hidden sm:inline">Timers</span>
            </button>

            {/* Syllabus Topics */}
            <button
              onClick={onOpenTopicBrowser}
              className="flex h-9 items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900/80 px-2.5 text-xs font-medium text-slate-300 transition hover:border-slate-700 hover:text-white"
              title="Syllabus & Topics Drill"
            >
              <BookOpen className="h-3.5 w-3.5 text-purple-400" />
              <span className="hidden md:inline">Syllabus</span>
            </button>

            {/* Leaderboard Button */}
            <button
              onClick={onOpenLeaderboard}
              className="flex h-9 items-center gap-1.5 rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 text-xs font-medium text-amber-300 transition hover:bg-amber-500/20 active:scale-95"
              title="Global Tournament Leaderboard"
            >
              <Trophy className="h-3.5 w-3.5 text-amber-400" />
              <span className="hidden sm:inline">Rankings</span>
            </button>

            {/* Sound Toggle */}
            <button
              onClick={toggleSound}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-800 bg-slate-900/80 text-slate-400 transition hover:border-slate-700 hover:text-slate-200"
              title={soundOn ? 'Mute Sound' : 'Unmute Sound'}
            >
              {soundOn ? (
                <Volume2 className="h-4 w-4 text-emerald-400" />
              ) : (
                <VolumeX className="h-4 w-4 text-slate-500" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Profile Modal */}
      {showProfileModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <h3 className="font-['Syne'] text-lg font-bold text-white flex items-center gap-2">
                <User className="h-5 w-5 text-amber-400" /> Contestant Profile
              </h3>
              <button
                onClick={() => setShowProfileModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Duelist Handle / Display Name
                </label>
                <input
                  type="text"
                  value={tempName}
                  onChange={e => setTempName(e.target.value)}
                  maxLength={25}
                  className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white focus:border-amber-500 focus:outline-none"
                  placeholder="e.g. Mastermind_99"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  University Affiliation (Represent Your Alma Mater)
                </label>
                <select
                  value={tempUni}
                  onChange={e => setTempUni(e.target.value)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white focus:border-amber-500 focus:outline-none"
                >
                  {FAMOUS_UNIVERSITIES.map(u => (
                    <option key={u} value={u}>
                      {u}
                    </option>
                  ))}
                  <option value="Independent Varsity Scholar">Independent Varsity Scholar</option>
                </select>
              </div>

              <div className="rounded-xl bg-slate-950/60 p-3.5 border border-slate-800 text-xs space-y-1.5">
                <div className="flex justify-between text-slate-400">
                  <span>Current Tournament Elo:</span>
                  <span className="font-bold text-amber-400">{stats.rating}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Duel Record:</span>
                  <span className="text-slate-200">
                    {stats.duelsWon}W - {stats.duelsLost}L
                  </span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Best Streak:</span>
                  <span className="font-semibold text-orange-400">{stats.highestStreak} answers</span>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowProfileModal(false)}
                  className="rounded-lg px-4 py-2 text-xs font-medium text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-amber-500 px-5 py-2 text-xs font-bold text-slate-950 shadow-md transition hover:bg-amber-400"
                >
                  Save Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
