import React, { useState } from 'react';
import { CheckCircle2, XCircle, Lightbulb, Sparkles, BookOpen, Trash2, ArrowRight, RotateCcw, Clock, Trophy } from 'lucide-react';
import { GameModeType, Question } from '../types/duel';
import { getStoredMistakes, clearStoredMistakes, StoredMistake } from '../utils/storage';
import { questionService } from '../utils/questionService';

interface ReviewModalProps {
  summary?: {
    score: number;
    correctCount: number;
    totalCount: number;
    avgTime: number;
    streak: number;
    mode: GameModeType;
    duelWon?: boolean;
    questions: { question: Question; userAns: string; isCorrect: boolean; timeSpent: number }[];
  } | null;
  onPlayAgain?: () => void;
  onClose: () => void;
}

export const ReviewModal: React.FC<ReviewModalProps> = ({
  summary,
  onPlayAgain,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'round' | 'mistakes'>(summary ? 'round' : 'mistakes');
  const [mistakes, setMistakes] = useState<StoredMistake[]>(getStoredMistakes());
  const [loadingCoachIndex, setLoadingCoachIndex] = useState<number | null>(null);
  const [coachExplanations, setCoachExplanations] = useState<Record<number, string>>({});

  const handleAskCoach = async (
    idx: number,
    question: string,
    options: string[],
    correct: string,
    userAns: string
  ) => {
    setLoadingCoachIndex(idx);
    const explanation = await questionService.getCoachExplanation(question, options, correct, userAns);
    setCoachExplanations(prev => ({ ...prev, [idx]: explanation }));
    setLoadingCoachIndex(null);
  };

  const handleClearMistakes = () => {
    clearStoredMistakes();
    setMistakes([]);
  };

  const accuracyPct = summary
    ? Math.round((summary.correctCount / summary.totalCount) * 100)
    : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm overflow-y-auto">
      <div className="w-full max-w-3xl my-8 rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-2xl sm:p-8">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-['Syne'] text-xl font-bold text-white">
                {summary ? 'Tournament Debrief & Performance' : 'Mistakes Revision Notebook'}
              </h2>
              <p className="text-xs text-slate-400">
                Sharpen mental agility and eliminate trap answers
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition text-sm"
          >
            ✕
          </button>
        </div>

        {/* Round Summary Card (if opened after a match) */}
        {summary && (
          <div className="mt-5 rounded-2xl border border-slate-800 bg-slate-950/60 p-5">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 text-center">
              <div className="rounded-xl bg-slate-900/60 p-3 border border-slate-800/80">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Final Points</div>
                <div className="font-mono text-xl font-black text-amber-400 mt-1">{summary.score}</div>
              </div>

              <div className="rounded-xl bg-slate-900/60 p-3 border border-slate-800/80">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Accuracy</div>
                <div className="font-mono text-xl font-black text-emerald-400 mt-1">
                  {summary.correctCount} / {summary.totalCount} ({accuracyPct}%)
                </div>
              </div>

              <div className="rounded-xl bg-slate-900/60 p-3 border border-slate-800/80">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Average Velocity</div>
                <div className="font-mono text-xl font-black text-cyan-400 mt-1">{summary.avgTime}s / Q</div>
              </div>

              <div className="rounded-xl bg-slate-900/60 p-3 border border-slate-800/80">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Top Streak</div>
                <div className="font-mono text-xl font-black text-orange-400 mt-1">{summary.streak} in a row</div>
              </div>
            </div>

            {/* Duel Result Banner if Duel Mode */}
            {summary.duelWon !== undefined && (
              <div className={`mt-4 rounded-xl p-3 text-xs font-bold text-center border ${
                summary.duelWon
                  ? 'bg-emerald-950/50 border-emerald-500/40 text-emerald-300'
                  : 'bg-rose-950/50 border-rose-500/40 text-rose-300'
              }`}>
                {summary.duelWon ? '🏆 DUEL VICTORY: You outmaneuvered your collegiate rival!' : 'DEFIGHT RECORDED: Close contest! Review shortcuts below to reclaim your lead.'}
              </div>
            )}
          </div>
        )}

        {/* Tab Controls */}
        <div className="mt-6 flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex gap-2">
            {summary && (
              <button
                onClick={() => setActiveTab('round')}
                className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold transition ${
                  activeTab === 'round'
                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Current Match Breakdown ({summary.questions.length})
              </button>
            )}
            <button
              onClick={() => setActiveTab('mistakes')}
              className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold transition ${
                activeTab === 'mistakes'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Saved Mistakes Notebook ({mistakes.length})
            </button>
          </div>

          {activeTab === 'mistakes' && mistakes.length > 0 && (
            <button
              onClick={handleClearMistakes}
              className="flex items-center gap-1 text-[11px] text-slate-500 hover:text-rose-400 transition"
            >
              <Trash2 className="h-3.5 w-3.5" /> Clear History
            </button>
          )}
        </div>

        {/* Content List */}
        <div className="mt-5 space-y-4 max-h-[420px] overflow-y-auto pr-1">
          {activeTab === 'round' && summary && (
            summary.questions.map((item, idx) => {
              const isCorrect = item.isCorrect;
              const correctAns = item.question.options[item.question.correctIndex];
              return (
                <div
                  key={idx}
                  className={`rounded-2xl border p-4 ${
                    isCorrect
                      ? 'border-emerald-500/30 bg-emerald-950/20'
                      : 'border-rose-500/30 bg-rose-950/20'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2">
                      {isCorrect ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                      ) : (
                        <XCircle className="h-4 w-4 text-rose-400 shrink-0" />
                      )}
                      <span className="font-mono text-xs font-bold text-slate-400">Q{idx + 1}</span>
                      <span className="rounded bg-slate-800 px-2 py-0.5 text-[10px] font-semibold text-slate-300">
                        {item.question.topic}
                      </span>
                    </div>
                    <span className="font-mono text-[11px] text-slate-400">{item.timeSpent.toFixed(1)}s</span>
                  </div>

                  <p className="text-sm font-medium text-white mb-3 leading-relaxed whitespace-pre-line">
                    {item.question.question}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs mb-3">
                    <div className={`p-2.5 rounded-lg border ${
                      isCorrect ? 'bg-emerald-900/30 border-emerald-700/50 text-emerald-200' : 'bg-rose-900/30 border-rose-700/50 text-rose-200'
                    }`}>
                      <span className="text-[10px] uppercase font-bold tracking-wider block opacity-70">Your Response</span>
                      {item.userAns}
                    </div>
                    <div className="p-2.5 rounded-lg border bg-emerald-950/40 border-emerald-800/60 text-emerald-300">
                      <span className="text-[10px] uppercase font-bold tracking-wider block opacity-70">Correct Answer</span>
                      {correctAns}
                    </div>
                  </div>

                  <div className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                    <strong className="text-slate-100">Explanation: </strong>
                    {item.question.explanation}
                  </div>

                  {item.question.mentalShortcut && (
                    <div className="mt-2 text-xs text-amber-300 flex items-start gap-1.5">
                      <Lightbulb className="h-3.5 w-3.5 text-amber-400 shrink-0 mt-0.5" />
                      <span><strong>Mental Shortcut:</strong> {item.question.mentalShortcut}</span>
                    </div>
                  )}

                  {/* Coach Breakdown CTA */}
                  <div className="mt-3 pt-2 border-t border-slate-800/60">
                    {coachExplanations[idx] ? (
                      <div className="rounded-xl border border-cyan-500/30 bg-cyan-950/30 p-2.5 text-xs text-cyan-200">
                        <strong className="text-cyan-400">Coach Insight: </strong>
                        {coachExplanations[idx]}
                      </div>
                    ) : (
                      <button
                        onClick={() => handleAskCoach(idx, item.question.question, item.question.options, correctAns, item.userAns)}
                        disabled={loadingCoachIndex === idx}
                        className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition"
                      >
                        <Sparkles className="h-3 w-3" />
                        {loadingCoachIndex === idx ? 'Consulting arbiter...' : 'Deep AI Breakdown'}
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}

          {activeTab === 'mistakes' && (
            mistakes.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs">
                Your mistakes notebook is spotless! Keep competing to record tough questions.
              </div>
            ) : (
              mistakes.map((m, idx) => {
                const correctAns = m.question.options[m.question.correctIndex];
                return (
                  <div
                    key={idx}
                    className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="rounded bg-slate-800 px-2 py-0.5 text-[10px] font-semibold text-amber-400">
                        {m.question.topic}
                      </span>
                      <span className="text-[10px] text-slate-500">
                        {new Date(m.timestamp).toLocaleDateString()}
                      </span>
                    </div>

                    <p className="text-sm font-medium text-white mb-2 leading-relaxed">
                      {m.question.question}
                    </p>

                    <div className="text-xs text-slate-300 bg-slate-900 p-2.5 rounded-lg border border-slate-800 mb-2">
                      <span className="text-emerald-400 font-bold">Answer: </span>
                      {correctAns}
                    </div>

                    <p className="text-xs text-slate-400 leading-relaxed">
                      {m.question.explanation}
                    </p>

                    {m.question.mentalShortcut && (
                      <div className="mt-2 text-xs text-amber-300/90 flex items-start gap-1">
                        <Lightbulb className="h-3.5 w-3.5 text-amber-400 shrink-0 mt-0.5" />
                        <span>{m.question.mentalShortcut}</span>
                      </div>
                    )}
                  </div>
                );
              })
            )
          )}
        </div>

        {/* Footer Actions */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-800">
          <button
            onClick={onClose}
            className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white transition"
          >
            Back to Arena
          </button>

          {onPlayAgain && (
            <button
              onClick={onPlayAgain}
              className="flex items-center gap-1.5 rounded-xl bg-amber-500 px-6 py-2.5 text-xs font-bold text-slate-950 shadow-md shadow-amber-500/20 hover:bg-amber-400 active:scale-95 transition"
            >
              <RotateCcw className="h-4 w-4" />
              <span>Play Next Round</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
