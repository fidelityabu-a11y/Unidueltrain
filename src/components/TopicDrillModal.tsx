import React, { useState } from 'react';
import { BookOpen, BarChart3, BrainCircuit, Calculator, Globe2, ArrowRight, CheckCircle2, ChevronRight, Zap, Shuffle, Database, RefreshCw } from 'lucide-react';
import { CategoryId } from '../types/duel';
import { CATEGORIES } from '../data/categories';
import { questionService } from '../utils/questionService';

interface TopicDrillModalProps {
  onStartTargetedDrill: (category: CategoryId) => void;
  onClose: () => void;
}

export const TopicDrillModal: React.FC<TopicDrillModalProps> = ({
  onStartTargetedDrill,
  onClose,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<CategoryId>('data_analysis');
  const [bankStats, setBankStats] = useState(questionService.getBankStats());
  const [resetMessage, setResetMessage] = useState<string | null>(null);

  const catMeta = CATEGORIES[selectedCategory];

  const handleResetHistory = () => {
    questionService.resetSeenHistory();
    setBankStats(questionService.getBankStats());
    setResetMessage('Question history reset! All 6,000+ questions are refreshed.');
    setTimeout(() => setResetMessage(null), 3500);
  };

  const getIcon = (id: CategoryId) => {
    switch (id) {
      case 'data_analysis':
        return <BarChart3 className="h-5 w-5" />;
      case 'verbal_reasoning':
        return <BrainCircuit className="h-5 w-5" />;
      case 'applied_math':
        return <Calculator className="h-5 w-5" />;
      case 'general_knowledge':
        return <Globe2 className="h-5 w-5" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm overflow-y-auto">
      <div className="w-full max-w-4xl my-8 rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-2xl sm:p-8">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-['Syne'] text-xl font-bold text-white">
                Official Duel Syllabus & Topic Drills
              </h2>
              <p className="text-xs text-slate-400">
                Four comprehensive tournament domains tailored for rapid mental calculation and reasoning
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

        {/* 6,000+ Question Bank & Dynamic Shuffling Banner */}
        <div className="mt-4 rounded-2xl border border-indigo-500/30 bg-gradient-to-r from-indigo-950/40 via-slate-900 to-purple-950/40 p-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500/20 text-indigo-400 shrink-0">
                <Database className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm font-bold text-indigo-300">
                    6,000+ Tournament Question Bank
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-400 border border-emerald-500/30">
                    <Shuffle className="h-3 w-3" />
                    <span>Auto-Shuffled Fresh Every Game</span>
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Over <strong className="text-slate-200">8,600+ unique questions & procedural variants</strong> across the 4 domains. Non-repetition engine active ({bankStats.seenCount} seen in current cycle).
                </p>
              </div>
            </div>

            <button
              onClick={handleResetHistory}
              title="Reset question history to reshuffle entire pool"
              className="shrink-0 flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800/80 px-2.5 py-1.5 text-[11px] text-slate-300 hover:bg-slate-700 hover:text-white transition"
            >
              <RefreshCw className="h-3 w-3" />
              <span>Reshuffle Entire Bank</span>
            </button>
          </div>

          {resetMessage && (
            <div className="mt-2 text-xs font-semibold text-emerald-400 bg-emerald-950/60 p-2 rounded-lg border border-emerald-800/40 flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4" />
              <span>{resetMessage}</span>
            </div>
          )}
        </div>

        {/* 4 Main Category Cards */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {(Object.keys(CATEGORIES) as CategoryId[]).map(catId => {
            const cat = CATEGORIES[catId];
            const isSelected = selectedCategory === catId;
            return (
              <button
                key={catId}
                onClick={() => setSelectedCategory(catId)}
                className={`flex flex-col items-start p-4 rounded-2xl border text-left transition-all ${
                  isSelected
                    ? 'border-amber-500 bg-amber-500/10 shadow-md shadow-amber-500/10 ring-1 ring-amber-500'
                    : 'border-slate-800 bg-slate-950/60 hover:border-slate-700 hover:bg-slate-800/40'
                }`}
              >
                <div
                  className="p-2.5 rounded-xl mb-3"
                  style={{ backgroundColor: `${cat.color}20`, color: cat.color }}
                >
                  {getIcon(catId)}
                </div>
                <div className="font-['Syne'] text-sm font-bold text-white mb-1">
                  {cat.name}
                </div>
                <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                  {cat.tagline}
                </p>
              </button>
            );
          })}
        </div>

        {/* Syllabus Breakdown for Selected Category */}
        <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-950/70 p-6">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-800">
            <div>
              <h3 className="font-['Syne'] text-base font-bold text-white flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: catMeta.color }} />
                {catMeta.name} Topics Covered
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {catMeta.topics.length} core subtopics in the university duel syllabus
              </p>
            </div>

            <button
              onClick={() => {
                onStartTargetedDrill(selectedCategory);
                onClose();
              }}
              className="flex items-center gap-2 rounded-xl bg-amber-500 px-5 py-2.5 text-xs font-bold text-slate-950 shadow-md shadow-amber-500/20 hover:bg-amber-400 active:scale-95 transition"
            >
              <Zap className="h-4 w-4" />
              <span>Launch Targeted Drill</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 max-h-72 overflow-y-auto pr-1">
            {catMeta.topics.map((topic, idx) => (
              <div
                key={idx}
                className="flex items-start gap-2.5 p-3 rounded-xl border border-slate-800/80 bg-slate-900/60 text-xs text-slate-200"
              >
                <ChevronRight className="h-3.5 w-3.5 shrink-0 text-amber-400 mt-0.5" />
                <span className="leading-snug">{topic}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 flex justify-end pt-4 border-t border-slate-800">
          <button
            onClick={onClose}
            className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
