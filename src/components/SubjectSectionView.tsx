import React, { useState } from 'react';
import {
  BarChart3,
  BrainCircuit,
  Calculator,
  Globe2,
  Zap,
  Play,
  ArrowRight,
  Clock,
  Sparkles,
  BookOpen,
  Target,
  Flame,
  Award,
  ChevronRight,
  HelpCircle,
  Lightbulb,
} from 'lucide-react';
import { CategoryId, DifficultyLevel, PlayerStats } from '../types/duel';
import { CATEGORIES } from '../data/categories';

interface SubjectSectionViewProps {
  playerStats: PlayerStats;
  initialCategory?: CategoryId;
  onStartSubjectDrill: (
    category: CategoryId,
    timePerQuestion: number,
    totalQuestions: number,
    subtopic?: string,
    difficulty?: DifficultyLevel
  ) => void;
  onBackToLobby: () => void;
  onOpenMentalMath?: () => void;
}

// Subject-specific formula & mental shortcut cheat-sheets
const SUBJECT_CHEATS: Record<CategoryId, { title: string; shortcuts: { label: string; tip: string }[] }> = {
  data_analysis: {
    title: 'Data Analysis Quick Intuition & Mental Formulas',
    shortcuts: [
      {
        label: 'Mean from Symmetrical Sets',
        tip: 'For arithmetic sequences (e.g. 12, 17, 22, 27, 32), the mean equals the median (middle number 22) or (first + last)/2.',
      },
      {
        label: 'Empirical Rule (68-95-99.7)',
        tip: 'Normal distribution: 68% within ±1σ, 95% within ±2σ, 99.7% within ±3σ. Above +1σ is exactly 16% (50% - 34%).',
      },
      {
        label: 'Interquartile Range Outliers',
        tip: 'Upper Outlier Fence = Q3 + 1.5 × IQR. Lower Fence = Q1 - 1.5 × IQR.',
      },
      {
        label: 'Circle Graph Sector Angles',
        tip: 'Angle = (Percentage / 100) × 360°. Trick: 10% = 36°, 25% = 90°, 33.3% = 120°. For 15%, do 36° + 18° = 54°.',
      },
      {
        label: 'Fast Combinations nCr',
        tip: 'nC2 = n(n-1)/2. e.g., 8C2 = (8 × 7)/2 = 28. nC3 = n(n-1)(n-2)/6.',
      },
      {
        label: 'Venn Inclusion-Exclusion',
        tip: 'n(A ∪ B) = n(A) + n(B) - n(A ∩ B). Both = (Only A + Only B + Both) - Universal.',
      },
    ],
  },
  verbal_reasoning: {
    title: 'Verbal Reasoning Speed Patterns & Deductive Shortcuts',
    shortcuts: [
      {
        label: 'Alphabet Reverse Positions',
        tip: 'Sum of forward and reverse letter rank is always 27. (e.g. A=1 & Z=26; 1+26=27. C=3 & X=24; 3+24=27).',
      },
      {
        label: 'Pythagorean Displacement in Direction Sense',
        tip: 'Classic displacement triplets: 3-4-5 (and multiples 6-8-10, 9-12-15), 5-12-13, 8-15-17. Turn right 3 times = 1 turn left.',
      },
      {
        label: 'Blood Relation Reduction',
        tip: '"Son of my grandfather’s only son" = Your father’s son = Yourself (or brother). Replace descriptions working backward from the end.',
      },
      {
        label: 'Odd Classification Traps',
        tip: 'Check category parity first (living vs non-living, prime vs composite, synonym vs antonym, African capital vs non-capital).',
      },
      {
        label: 'Syllogism Universal vs Particular',
        tip: 'From two particular statements (Some + Some), no valid universal conclusion can ever be derived.',
      },
    ],
  },
  applied_math: {
    title: 'Applied Math Mental Rules & Stoichiometric Shortcuts',
    shortcuts: [
      {
        label: 'Chemical Dilution Law',
        tip: 'M1 × V1 = M2 × V2. If volume doubles, concentration halves. If volume triples, concentration is 1/3.',
      },
      {
        label: 'Fast Speed Unit Conversion',
        tip: 'To convert m/s to km/h, multiply by 3.6 (or × 18/5). e.g., 20 m/s = 20 × 3.6 = 72 km/h.',
      },
      {
        label: '2×2 Matrix Determinant',
        tip: 'det([[a, b], [c, d]]) = ad - bc. If det = 0, the matrix is singular and has no inverse.',
      },
      {
        label: 'pH and Hydrogen Concentration',
        tip: 'pH = -log10[H+]. A tenfold decrease in [H+] increases pH by 1. e.g. [H+] = 10^-5 M => pH = 5.',
      },
      {
        label: 'Genetics Monohybrid & Dihybrid Ratios',
        tip: 'Heterozygous cross (Aa × Aa) produces 3:1 dominant to recessive phenotype. Dihybrid (AaBb × AaBb) produces 9:3:3:1.',
      },
      {
        label: 'Calculus Power Rule for Velocity',
        tip: 'Position s(t) = a*t^n => Velocity v(t) = n*a*t^(n-1). Acceleration a(t) = v\'(t).',
      },
    ],
  },
  general_knowledge: {
    title: 'African Heritage, Leadership & Tech Hub Insights',
    shortcuts: [
      {
        label: 'Nobel & Literary Milestones',
        tip: 'Wole Soyinka was the first African to win the Nobel Prize in Literature in 1986. Chinua Achebe published Things Fall Apart in 1958.',
      },
      {
        label: 'Afrobeat Architecture',
        tip: 'Pioneered by Fela Anikulapo Kuti and drummer Tony Allen in the late 1960s at the Afrika Shrine, combining highlife, jazz, and Yoruba percussion.',
      },
      {
        label: 'Green Energy Frontiers',
        tip: 'Noor Ouarzazate (Morocco) is one of the world’s largest concentrated solar plants; Lake Turkana (Kenya) is Africa’s largest wind farm.',
      },
      {
        label: 'Indigenous Textile Capitals',
        tip: 'Adire (Yoruba indigo tie-dye), Kente (Ashanti Ghana woven silk/cotton), Bogolanfini (Malian mud cloth), Aso Oke (Yoruba handwoven prestigious fabric).',
      },
      {
        label: 'African Tech Clusters',
        tip: 'Yabacon Valley is in Yaba, Lagos (Nigeria). Silicon Savannah is in Nairobi (Kenya). Both host leading unicorns (Flutterwave, Interswitch, Paystack).',
      },
      {
        label: 'Agricultural Hegemony',
        tip: 'Nigeria is the undisputed #1 producer of both Yam (over 65% of global supply) and Cassava in the world.',
      },
    ],
  },
};

export const SubjectSectionView: React.FC<SubjectSectionViewProps> = ({
  playerStats,
  initialCategory = 'data_analysis',
  onStartSubjectDrill,
  onBackToLobby,
  onOpenMentalMath,
}) => {
  const [activeCategory, setActiveCategory] = useState<CategoryId>(initialCategory);
  const [selectedSubtopic, setSelectedSubtopic] = useState<string>('all');
  const [questionCount, setQuestionCount] = useState<number>(10);
  const [timerSeconds, setTimerSeconds] = useState<number>(15);
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('varsity');

  const meta = CATEGORIES[activeCategory];
  const cheats = SUBJECT_CHEATS[activeCategory];

  // Subject-specific player stats
  const subjectStats = playerStats.accuracyByCategory[activeCategory] || { total: 0, correct: 0 };
  const accuracyPct = subjectStats.total > 0
    ? Math.round((subjectStats.correct / subjectStats.total) * 100)
    : 0;

  const getSubjectIcon = (id: CategoryId) => {
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

  const handleLaunch = () => {
    onStartSubjectDrill(
      activeCategory,
      timerSeconds,
      questionCount,
      selectedSubtopic === 'all' ? undefined : selectedSubtopic,
      difficulty
    );
  };

  const handleLaunchSubtopicDirect = (topic: string) => {
    onStartSubjectDrill(
      activeCategory,
      timerSeconds,
      10,
      topic,
      difficulty
    );
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      {/* Top Breadcrumb & Subject Tabs */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <button
            onClick={onBackToLobby}
            className="text-xs font-semibold text-slate-400 hover:text-amber-400 transition flex items-center gap-1 mb-1"
          >
            ← Back to Duel Main Lobby
          </button>
          <h1 className="font-['Syne'] text-2xl font-black text-white sm:text-3xl flex items-center gap-2.5">
            <Target className="h-7 w-7 text-amber-400" />
            Dedicated Subject Arenas
          </h1>
          <p className="text-xs text-slate-400">
            Select a subject to practice and answer questions exclusively from that domain
          </p>
        </div>
      </div>

      {/* 4 Interactive Subject Switcher Tabs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
        {(Object.keys(CATEGORIES) as CategoryId[]).map(catId => {
          const cat = CATEGORIES[catId];
          const isActive = activeCategory === catId;
          const stat = playerStats.accuracyByCategory[catId] || { total: 0, correct: 0 };
          const acc = stat.total > 0 ? Math.round((stat.correct / stat.total) * 100) : 0;

          return (
            <button
              key={catId}
              onClick={() => {
                setActiveCategory(catId);
                setSelectedSubtopic('all');
              }}
              className={`relative overflow-hidden rounded-2xl border p-4 text-left transition-all duration-200 active:scale-[0.98] ${
                isActive
                  ? 'border-amber-500 bg-slate-900 shadow-xl shadow-amber-500/10 ring-2 ring-amber-500/50'
                  : 'border-slate-800 bg-slate-900/50 hover:border-slate-700 hover:bg-slate-900'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div
                  className="flex h-9 w-9 items-center justify-center rounded-xl"
                  style={{
                    backgroundColor: `${cat.color}20`,
                    color: cat.color,
                  }}
                >
                  {getSubjectIcon(catId)}
                </div>
                {stat.total > 0 && (
                  <span className="font-mono text-[11px] font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/40">
                    {acc}% Acc
                  </span>
                )}
              </div>

              <div className="font-['Syne'] text-sm font-bold text-white mb-0.5 truncate">
                {cat.name}
              </div>
              <div className="text-[11px] text-slate-400">
                {stat.total} Questions Answered
              </div>

              {isActive && (
                <div
                  className="absolute bottom-0 left-0 right-0 h-1"
                  style={{ backgroundColor: cat.color }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Main Subject Section Hero Card */}
      <div className="rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900 via-[#101726] to-slate-950 p-6 sm:p-8 shadow-2xl mb-8">
        <div className="flex flex-col lg:flex-row items-start justify-between gap-6 pb-6 border-b border-slate-800">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-bold mb-3"
                 style={{ backgroundColor: `${meta.color}20`, color: meta.color, border: `1px solid ${meta.color}40` }}>
              {getSubjectIcon(activeCategory)}
              <span className="uppercase tracking-wider font-mono text-[10px]">
                {meta.name} ONLY SECTION
              </span>
            </div>

            <h2 className="font-['Syne'] text-2xl font-black text-white sm:text-3xl">
              {meta.name} Arena
            </h2>
            <p className="mt-2 text-sm text-slate-300 leading-relaxed">
              {meta.tagline}. Every question in this session is guaranteed to come solely from the official <strong>{meta.name}</strong> syllabus.
            </p>

            {(activeCategory === 'data_analysis' || activeCategory === 'applied_math') && onOpenMentalMath && (
              <div className="mt-3 inline-flex items-center gap-2">
                <button
                  type="button"
                  onClick={onOpenMentalMath}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-300 hover:bg-emerald-500/20 transition"
                >
                  <Zap className="h-3.5 w-3.5 text-emerald-400" />
                  <span>Train Rapid Mental Calculations in the Gym →</span>
                </button>
              </div>
            )}
          </div>

          {/* Player stats in this subject */}
          <div className="flex flex-wrap sm:flex-nowrap gap-3 w-full lg:w-auto">
            <div className="flex-1 sm:flex-initial rounded-2xl border border-slate-800 bg-slate-950/80 p-4 min-w-[130px] text-center">
              <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                Answered
              </div>
              <div className="font-mono text-xl font-black text-white mt-1">
                {subjectStats.total} <span className="text-xs font-normal text-slate-500">Qs</span>
              </div>
            </div>

            <div className="flex-1 sm:flex-initial rounded-2xl border border-slate-800 bg-slate-950/80 p-4 min-w-[130px] text-center">
              <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                Accuracy
              </div>
              <div className="font-mono text-xl font-black text-emerald-400 mt-1">
                {accuracyPct}%
              </div>
            </div>

            <div className="flex-1 sm:flex-initial rounded-2xl border border-slate-800 bg-slate-950/80 p-4 min-w-[130px] text-center">
              <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                Syllabus Topics
              </div>
              <div className="font-mono text-xl font-black text-amber-400 mt-1">
                {meta.topics.length}
              </div>
            </div>
          </div>
        </div>

        {/* Drill Configuration Form */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Subtopic Filter */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <BookOpen className="h-3.5 w-3.5 text-amber-400" />
              <span>Target Topic</span>
            </label>
            <select
              value={selectedSubtopic}
              onChange={e => setSelectedSubtopic(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
            >
              <option value="all">⚡ All {meta.name} Topics (Mixed)</option>
              {meta.topics.map((t, idx) => (
                <option key={idx} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          {/* Question Count */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Target className="h-3.5 w-3.5 text-cyan-400" />
              <span>Question Count</span>
            </label>
            <select
              value={questionCount}
              onChange={e => setQuestionCount(Number(e.target.value))}
              className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
            >
              <option value={5}>5 Questions (Quick Test)</option>
              <option value={10}>10 Questions (Standard Round)</option>
              <option value={20}>20 Questions (Endurance Drill)</option>
              <option value={50}>50 Questions (Mastery Marathon)</option>
            </select>
          </div>

          {/* Timer Per Question */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-emerald-400" />
              <span>Timer / Question</span>
            </label>
            <select
              value={timerSeconds}
              onChange={e => setTimerSeconds(Number(e.target.value))}
              className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
            >
              <option value={5}>5s (Hyper Speed Lightning)</option>
              <option value={8}>8s (Brain Math Standard)</option>
              <option value={10}>10s (Blitz Duel)</option>
              <option value={15}>15s (Quick Buzz Standard)</option>
              <option value={20}>20s (Collegiate Standard)</option>
              <option value={30}>30s (Deliberate Study)</option>
              <option value={0}>∞ Untimed (Practice & Study Mode)</option>
            </select>
          </div>

          {/* Difficulty */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Award className="h-3.5 w-3.5 text-purple-400" />
              <span>Difficulty Level</span>
            </label>
            <select
              value={difficulty}
              onChange={e => setDifficulty(e.target.value as DifficultyLevel)}
              className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
            >
              <option value="varsity">Varsity (Tournament Standard)</option>
              <option value="novice">Novice (Foundational Speed)</option>
              <option value="champion">Champion (Grandmaster Speed)</option>
            </select>
          </div>
        </div>

        {/* Big Launch Button */}
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-800">
          <div className="text-xs text-slate-400 text-center sm:text-left">
            Answering <strong className="text-white">{questionCount} questions</strong> from <strong className="text-amber-400">{selectedSubtopic === 'all' ? `All ${meta.name}` : selectedSubtopic}</strong> at <strong className="text-cyan-400">{timerSeconds > 0 ? `${timerSeconds}s per question` : 'Untimed'}</strong>.
          </div>

          <button
            onClick={handleLaunch}
            className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-2xl bg-amber-500 px-8 py-3.5 text-sm font-extrabold text-slate-950 shadow-lg shadow-amber-500/20 hover:bg-amber-400 active:scale-95 transition"
          >
            <Play className="h-4 w-4 fill-slate-950" />
            <span>Answer {meta.name} Questions Now</span>
          </button>
        </div>
      </div>

      {/* Quick Launch Cards for Every Subtopic */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-['Syne'] text-lg font-bold text-white flex items-center gap-2">
              <Zap className="h-5 w-5 text-amber-400" />
              Specific Subtopic Sprints in {meta.name}
            </h3>
            <p className="text-xs text-slate-400">
              Pick an exact subtopic to test your mastery with a focused 10-question sprint
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {meta.topics.map((topic, idx) => (
            <div
              key={idx}
              className="flex flex-col justify-between rounded-2xl border border-slate-800 bg-slate-900/60 p-4 transition hover:border-slate-700 hover:bg-slate-900"
            >
              <div>
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-300 mb-1">
                  <span className="flex h-5 w-5 items-center justify-center rounded-md bg-slate-800 text-[10px] font-mono text-amber-400">
                    {idx + 1}
                  </span>
                  <span className="line-clamp-2 leading-snug">{topic}</span>
                </div>
              </div>

              <button
                onClick={() => handleLaunchSubtopicDirect(topic)}
                className="mt-3 flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950/80 px-3 py-2 text-xs font-semibold text-amber-400 hover:border-amber-500/50 hover:bg-amber-500/10 transition"
              >
                <span>Drill This Topic</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Mental Shortcut & Formulas Cheat Sheet for this Subject */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900/50 p-6 sm:p-8">
        <div className="flex items-center gap-2.5 mb-4 pb-3 border-b border-slate-800">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400">
            <Lightbulb className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-['Syne'] text-base font-bold text-white">
              {cheats.title}
            </h3>
            <p className="text-xs text-slate-400">
              Crucial formulas and mental speed tricks for solving {meta.name} questions under tournament buzzer pressure
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {cheats.shortcuts.map((sc, idx) => (
            <div
              key={idx}
              className="rounded-2xl border border-slate-800/80 bg-slate-950/60 p-4 text-xs"
            >
              <div className="font-bold text-amber-400 mb-1 flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5" />
                <span>{sc.label}</span>
              </div>
              <p className="text-slate-300 leading-relaxed">
                {sc.tip}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
