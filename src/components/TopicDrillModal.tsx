import React, { useState } from 'react';
import { BookOpen, BarChart3, BrainCircuit, Calculator, Globe2, ArrowRight, CheckCircle2, ChevronRight, Zap } from 'lucide-react';
import { CategoryId } from '../types/duel';
import { CATEGORIES } from '../data/categories';

interface TopicDrillModalProps {
  onStartTargetedDrill: (category: CategoryId) => void;
  onClose: () => void;
}

export const TopicDrillModal: React.FC<TopicDrillModalProps> = ({
  onStartTargetedDrill,
  onClose,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<CategoryId>('data_analysis');

  const catMeta = CATEGORIES[selectedCategory];

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
