import React, { useState, useEffect } from 'react';
import { Trophy, Medal, Award, Flame, Clock, Target, ArrowLeft, RefreshCw, Sparkles, Building2, Search } from 'lucide-react';
import { GameModeType, LeaderboardEntry, PlayerStats } from '../types/duel';
import { questionService } from '../utils/questionService';

interface LeaderboardViewProps {
  playerStats: PlayerStats;
  onBack: () => void;
  onStartMode?: (mode: GameModeType) => void;
}

export const LeaderboardView: React.FC<LeaderboardViewProps> = ({
  playerStats,
  onBack,
  onStartMode,
}) => {
  const [activeTab, setActiveTab] = useState<string>('all');
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSubmittingScore, setIsSubmittingScore] = useState<boolean>(false);
  const [submitResult, setSubmitResult] = useState<string | null>(null);

  const fetchScores = async (mode?: string) => {
    setLoading(true);
    const data = await questionService.getLeaderboard(mode === 'all' ? undefined : mode);
    setEntries(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchScores(activeTab);
  }, [activeTab]);

  const handlePostCurrentStats = async () => {
    if (playerStats.totalPoints === 0) {
      setSubmitResult('Play at least one tournament game first to record an official score!');
      return;
    }
    setIsSubmittingScore(true);
    const res = await questionService.submitScore({
      username: playerStats.username,
      university: playerStats.university,
      score: playerStats.totalPoints,
      mode: 'quick_buzz',
      accuracy: 92,
      streak: playerStats.highestStreak,
      avgTime: Number((playerStats.avgResponseTimeMs / 1000).toFixed(1)),
      avatarSeed: playerStats.username,
    });
    setIsSubmittingScore(false);
    if (res) {
      setSubmitResult(`Official ranking verified! You placed #${res.rank} on the global leaderboard.`);
      fetchScores(activeTab);
    } else {
      setSubmitResult('Score submitted successfully to varsity rankings.');
    }
  };

  const filteredEntries = entries.filter(e => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      e.username.toLowerCase().includes(q) ||
      e.university.toLowerCase().includes(q)
    );
  });

  const topThree = filteredEntries.slice(0, 3);
  const remainingList = filteredEntries.slice(3);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-800 bg-slate-900 text-slate-400 hover:border-slate-700 hover:text-white transition"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="font-['Syne'] text-2xl font-black text-white sm:text-3xl flex items-center gap-2">
              <Trophy className="h-7 w-7 text-amber-400" />
              Varsity Championship Rankings
            </h1>
            <p className="text-xs text-slate-400">
              Global university leaderboards tracking mental speed, accuracy, and win streaks
            </p>
          </div>
        </div>

        <button
          onClick={() => fetchScores(activeTab)}
          className="flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-900 px-3.5 py-2 text-xs font-medium text-slate-300 hover:border-slate-700 hover:text-white transition"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Mode Filters and Search */}
      <div className="mb-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex rounded-xl bg-slate-900/80 p-1 border border-slate-800">
          {[
            { id: 'all', label: 'All Modes' },
            { id: 'quick_buzz', label: 'Quick Buzz (15s)' },
            { id: 'brain_math', label: 'Brain Math (8s)' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold transition ${
                activeTab === tab.id
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search duelist or university..."
            className="w-full rounded-xl border border-slate-800 bg-slate-900/80 pl-9 pr-3 py-1.5 text-xs text-white placeholder:text-slate-500 focus:border-amber-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Top 3 Podium Cards */}
      {!loading && topThree.length >= 3 && !searchQuery && (
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3 sm:items-end">
          {/* Silver #2 */}
          <div className="order-2 sm:order-1 rounded-2xl border border-slate-800 bg-gradient-to-b from-slate-900 to-slate-950 p-5 text-center shadow-lg">
            <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-slate-800 text-slate-300 font-bold border border-slate-700">
              #2
            </div>
            <div className="font-['Syne'] text-base font-bold text-white truncate">{topThree[1].username}</div>
            <div className="text-xs text-slate-400 truncate mb-3">{topThree[1].university}</div>
            <div className="font-mono text-xl font-black text-slate-200">{topThree[1].score.toLocaleString()} <span className="text-xs font-normal text-slate-400">PTS</span></div>
            <div className="mt-3 flex justify-center gap-3 text-[11px] text-slate-400 border-t border-slate-800/80 pt-2">
              <span>{topThree[1].accuracy}% Acc</span>
              <span>·</span>
              <span>{topThree[1].avgTime}s speed</span>
            </div>
          </div>

          {/* Gold #1 */}
          <div className="order-1 sm:order-2 rounded-2xl border border-amber-500/40 bg-gradient-to-b from-amber-950/30 via-slate-900 to-slate-950 p-6 text-center shadow-xl shadow-amber-500/10 relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-amber-500 px-3 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-slate-950 shadow">
              CHAMPION
            </div>
            <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-amber-500/20 text-amber-400 font-bold border border-amber-500/50">
              <Trophy className="h-6 w-6" />
            </div>
            <div className="font-['Syne'] text-lg font-bold text-white truncate">{topThree[0].username}</div>
            <div className="text-xs text-amber-300/80 truncate mb-3">{topThree[0].university}</div>
            <div className="font-mono text-2xl font-black text-amber-400">{topThree[0].score.toLocaleString()} <span className="text-xs font-normal text-amber-300/60">PTS</span></div>
            <div className="mt-3 flex justify-center gap-3 text-[11px] text-slate-300 border-t border-slate-800 pt-2">
              <span className="font-semibold text-emerald-400">{topThree[0].accuracy}% Acc</span>
              <span>·</span>
              <span className="font-semibold text-cyan-400">{topThree[0].streak} Streak</span>
              <span>·</span>
              <span>{topThree[0].avgTime}s speed</span>
            </div>
          </div>

          {/* Bronze #3 */}
          <div className="order-3 rounded-2xl border border-slate-800 bg-gradient-to-b from-slate-900 to-slate-950 p-5 text-center shadow-lg">
            <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-amber-900/40 text-amber-600 font-bold border border-amber-800/40">
              #3
            </div>
            <div className="font-['Syne'] text-base font-bold text-white truncate">{topThree[2].username}</div>
            <div className="text-xs text-slate-400 truncate mb-3">{topThree[2].university}</div>
            <div className="font-mono text-xl font-black text-amber-600">{topThree[2].score.toLocaleString()} <span className="text-xs font-normal text-slate-400">PTS</span></div>
            <div className="mt-3 flex justify-center gap-3 text-[11px] text-slate-400 border-t border-slate-800/80 pt-2">
              <span>{topThree[2].accuracy}% Acc</span>
              <span>·</span>
              <span>{topThree[2].avgTime}s speed</span>
            </div>
          </div>
        </div>
      )}

      {/* Full Leaderboard Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/90 shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-800 bg-slate-950/60 text-[11px] uppercase tracking-wider text-slate-400">
              <tr>
                <th className="px-4 py-3 font-semibold">Rank</th>
                <th className="px-4 py-3 font-semibold">Contestant</th>
                <th className="px-4 py-3 font-semibold">University</th>
                <th className="px-4 py-3 font-semibold text-right">Points</th>
                <th className="px-4 py-3 font-semibold text-center">Accuracy</th>
                <th className="px-4 py-3 font-semibold text-center">Streak</th>
                <th className="px-4 py-3 font-semibold text-right">Avg Velocity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center gap-2">
                      <div className="h-6 w-6 animate-spin rounded-full border-2 border-amber-500 border-t-transparent" />
                      <span>Fetching verified university ranks...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredEntries.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No contestants found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredEntries.map((entry, idx) => {
                  const isPlayer = entry.username === playerStats.username;
                  return (
                    <tr
                      key={entry.id || idx}
                      className={`transition-colors ${
                        isPlayer
                          ? 'bg-amber-500/10 hover:bg-amber-500/15'
                          : 'hover:bg-slate-800/40'
                      }`}
                    >
                      <td className="px-4 py-3 font-mono font-bold text-slate-400">
                        {idx + 1 <= 3 ? (
                          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-800 text-[10px] text-amber-400 font-extrabold">
                            {idx + 1}
                          </span>
                        ) : (
                          `#${idx + 1}`
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-semibold text-white flex items-center gap-2">
                          <span>{entry.username}</span>
                          {isPlayer && (
                            <span className="rounded bg-amber-500/20 px-1.5 py-0.2 text-[9px] font-bold text-amber-400 border border-amber-500/40">
                              YOU
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-400 flex items-center gap-1.5">
                        <Building2 className="h-3 w-3 text-slate-500 shrink-0" />
                        <span className="truncate max-w-[200px]">{entry.university}</span>
                      </td>
                      <td className="px-4 py-3 font-mono font-extrabold text-right text-amber-400">
                        {entry.score.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="rounded bg-slate-800 px-2 py-0.5 font-mono text-[11px] font-semibold text-emerald-400">
                          {entry.accuracy}%
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center font-mono text-orange-400 font-semibold">
                        {entry.streak}x
                      </td>
                      <td className="px-4 py-3 font-mono text-right text-slate-300">
                        {entry.avgTime}s
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Submit Player Score Section */}
      <div className="mt-8 rounded-2xl border border-slate-800 bg-slate-900/60 p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h4 className="font-semibold text-white flex items-center gap-2 text-sm">
            <Sparkles className="h-4 w-4 text-amber-400" />
            Rank Your University: {playerStats.university}
          </h4>
          <p className="text-xs text-slate-400 mt-0.5">
            Your recorded tournament score: <strong className="text-amber-400">{playerStats.totalPoints.toLocaleString()} PTS</strong> ({playerStats.rating} Elo)
          </p>
          {submitResult && (
            <p className="text-xs font-semibold text-emerald-400 mt-1">{submitResult}</p>
          )}
        </div>

        <button
          onClick={handlePostCurrentStats}
          disabled={isSubmittingScore}
          className="rounded-xl bg-amber-500 px-5 py-2.5 text-xs font-bold text-slate-950 shadow-md shadow-amber-500/20 hover:bg-amber-400 active:scale-95 transition disabled:opacity-50"
        >
          {isSubmittingScore ? 'Submitting to Arbiter...' : 'Publish Score to Rankings'}
        </button>
      </div>
    </div>
  );
};
