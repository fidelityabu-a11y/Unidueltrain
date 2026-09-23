/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { CategoryId, DifficultyLevel, GameModeType, OpponentProfile, PlayerStats, Question } from './types/duel';
import { Navbar } from './components/Navbar';
import { DuelLobby } from './components/DuelLobby';
import { ArenaPlay } from './components/ArenaPlay';
import { LeaderboardView } from './components/LeaderboardView';
import { TimerSettingsModal } from './components/TimerSettingsModal';
import { ReviewModal } from './components/ReviewModal';
import { TopicDrillModal } from './components/TopicDrillModal';
import { SubjectSectionView } from './components/SubjectSectionView';
import { MentalMathGym } from './components/MentalMathGym';
import { getStoredProfile, saveStoredProfile, getTimerConfig, saveTimerConfig, CustomTimerConfig } from './utils/storage';
import { CATEGORIES } from './data/categories';

export default function App() {
  const [view, setView] = useState<'lobby' | 'arena' | 'leaderboard' | 'subjects' | 'mental_math'>('lobby');
  const [playerStats, setPlayerStats] = useState<PlayerStats>(getStoredProfile());
  const [timerConfig, setTimerConfig] = useState<CustomTimerConfig>(getTimerConfig());
  const [activeSubjectCategory, setActiveSubjectCategory] = useState<CategoryId>('data_analysis');

  // Modal dialog toggles
  const [showTimerSettings, setShowTimerSettings] = useState<boolean>(false);
  const [showReviewModal, setShowReviewModal] = useState<boolean>(false);
  const [showTopicModal, setShowTopicModal] = useState<boolean>(false);

  // Active game config
  const [gameConfig, setGameConfig] = useState<{
    mode: GameModeType;
    timePerQuestion: number;
    totalQuestions: number;
    selectedCategories: CategoryId[];
    subtopic?: string;
    difficulty: DifficultyLevel;
    opponent?: OpponentProfile;
  }>({
    mode: 'quick_buzz',
    timePerQuestion: 15,
    totalQuestions: 10,
    selectedCategories: ['data_analysis', 'verbal_reasoning', 'applied_math', 'general_knowledge'],
    difficulty: 'varsity',
  });

  // Recent match summary
  const [lastSummary, setLastSummary] = useState<{
    score: number;
    correctCount: number;
    totalCount: number;
    avgTime: number;
    streak: number;
    mode: GameModeType;
    duelWon?: boolean;
    questions: { question: Question; userAns: string; isCorrect: boolean; timeSpent: number }[];
  } | null>(null);

  const handleUpdateStats = (newStats: PlayerStats) => {
    setPlayerStats(newStats);
    saveStoredProfile(newStats);
  };

  const handleSaveTimerConfig = (newConfig: CustomTimerConfig) => {
    setTimerConfig(newConfig);
    saveTimerConfig(newConfig);
  };

  const handleStartGame = (
    mode: GameModeType,
    timePerQuestion: number,
    categories?: CategoryId[],
    opponent?: OpponentProfile,
    subtopic?: string,
    totalQuestions: number = 10
  ) => {
    // Dynamic difficulty calculation based on player's rating
    let initialDiff: DifficultyLevel = 'varsity';
    if (playerStats.rating > 1400) initialDiff = 'champion';
    else if (playerStats.rating < 1100) initialDiff = 'novice';

    setGameConfig({
      mode,
      timePerQuestion,
      totalQuestions,
      selectedCategories: categories && categories.length > 0
        ? categories
        : ['data_analysis', 'verbal_reasoning', 'applied_math', 'general_knowledge'],
      subtopic,
      difficulty: initialDiff,
      opponent,
    });
    setView('arena');
  };

  const handleStartSubjectDrill = (
    category: CategoryId,
    timePerQuestion: number,
    totalQuestions: number,
    subtopic?: string,
    difficulty?: DifficultyLevel
  ) => {
    let diff: DifficultyLevel = difficulty || 'varsity';
    if (!difficulty) {
      if (playerStats.rating > 1400) diff = 'champion';
      else if (playerStats.rating < 1100) diff = 'novice';
    }

    setActiveSubjectCategory(category);
    setGameConfig({
      mode: 'subject_drill',
      timePerQuestion,
      totalQuestions,
      selectedCategories: [category],
      subtopic,
      difficulty: diff,
    });
    setView('arena');
  };

  const handleOpenSubjectSection = (category?: CategoryId) => {
    if (category) {
      setActiveSubjectCategory(category);
    }
    setView('subjects');
  };

  const handleFinishGame = (summary: {
    score: number;
    correctCount: number;
    totalCount: number;
    avgTime: number;
    streak: number;
    mode: GameModeType;
    duelWon?: boolean;
    questions: { question: Question; userAns: string; isCorrect: boolean; timeSpent: number }[];
  }) => {
    setLastSummary(summary);
    setShowReviewModal(true);
    if (gameConfig.mode === 'subject_drill') {
      setView('subjects');
    } else {
      setView('lobby');
    }
  };

  const handlePlayAgainFromReview = () => {
    setShowReviewModal(false);
    setView('arena');
  };

  const getCurrentModeTitle = (): string | undefined => {
    if (view === 'mental_math') return 'Mental Math Training Gym';
    if (view !== 'arena') return undefined;
    switch (gameConfig.mode) {
      case 'quick_buzz':
        return `Quick Buzz (${gameConfig.timePerQuestion}s)`;
      case 'brain_math':
        return `Brain Math (${gameConfig.timePerQuestion}s)`;
      case 'duel_arena':
        return `Duel vs ${gameConfig.opponent?.name || 'Rival'}`;
      case 'custom_practice':
        return `Custom Practice (${gameConfig.timePerQuestion}s)`;
      case 'subject_drill': {
        const catName = CATEGORIES[gameConfig.selectedCategories[0]]?.name || 'Subject';
        return `${catName} Only (${gameConfig.timePerQuestion > 0 ? `${gameConfig.timePerQuestion}s` : 'Untimed'})`;
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 font-sans flex flex-col selection:bg-amber-500/30 selection:text-amber-200">
      <Navbar
        stats={playerStats}
        onUpdateStats={handleUpdateStats}
        onOpenTimerSettings={() => setShowTimerSettings(true)}
        onOpenLeaderboard={() => setView('leaderboard')}
        onOpenReview={() => {
          setLastSummary(null);
          setShowReviewModal(true);
        }}
        onOpenTopicBrowser={() => setShowTopicModal(true)}
        onOpenSubjectSection={handleOpenSubjectSection}
        onOpenMentalMath={() => setView('mental_math')}
        onGoHome={() => setView('lobby')}
        currentModeTitle={getCurrentModeTitle()}
      />

      <main className="flex-1 pb-16">
        {view === 'lobby' && (
          <DuelLobby
            playerStats={playerStats}
            timerConfig={timerConfig}
            onStartGame={handleStartGame}
            onOpenLeaderboard={() => setView('leaderboard')}
            onOpenTimerSettings={() => setShowTimerSettings(true)}
            onOpenTopicBrowser={() => setShowTopicModal(true)}
            onOpenReview={() => {
              setLastSummary(null);
              setShowReviewModal(true);
            }}
            onOpenSubjectSection={handleOpenSubjectSection}
            onOpenMentalMath={() => setView('mental_math')}
          />
        )}

        {view === 'mental_math' && (
          <MentalMathGym
            onBackToLobby={() => setView('lobby')}
          />
        )}

        {view === 'subjects' && (
          <SubjectSectionView
            playerStats={playerStats}
            initialCategory={activeSubjectCategory}
            onStartSubjectDrill={handleStartSubjectDrill}
            onBackToLobby={() => setView('lobby')}
            onOpenMentalMath={() => setView('mental_math')}
          />
        )}

        {view === 'arena' && (
          <ArenaPlay
            mode={gameConfig.mode}
            timePerQuestion={gameConfig.timePerQuestion}
            totalQuestions={gameConfig.totalQuestions}
            selectedCategories={gameConfig.selectedCategories}
            subtopic={gameConfig.subtopic}
            difficulty={gameConfig.difficulty}
            opponent={gameConfig.opponent}
            playerStats={playerStats}
            onUpdateStats={handleUpdateStats}
            onFinishGame={handleFinishGame}
            onQuit={() => setView(gameConfig.mode === 'subject_drill' ? 'subjects' : 'lobby')}
          />
        )}

        {view === 'leaderboard' && (
          <LeaderboardView
            playerStats={playerStats}
            onBack={() => setView('lobby')}
          />
        )}
      </main>

      {/* Timer Adjustment Modal */}
      {showTimerSettings && (
        <TimerSettingsModal
          config={timerConfig}
          onSave={handleSaveTimerConfig}
          onClose={() => setShowTimerSettings(false)}
        />
      )}

      {/* Review Modal & Post-Game Performance Summary */}
      {showReviewModal && (
        <ReviewModal
          summary={lastSummary}
          onPlayAgain={lastSummary ? handlePlayAgainFromReview : undefined}
          onClose={() => {
            setShowReviewModal(false);
            setLastSummary(null);
          }}
        />
      )}

      {/* Syllabus & Topic Drill Browser Modal */}
      {showTopicModal && (
        <TopicDrillModal
          onStartTargetedDrill={(category) => {
            handleStartSubjectDrill(category, timerConfig.customTime, 10);
          }}
          onClose={() => setShowTopicModal(false)}
        />
      )}

      {/* Quiet Collegiate Footer */}
      <footer className="border-t border-slate-900 bg-[#080c14] py-6 text-center text-xs text-slate-500">
        <div className="mx-auto max-w-5xl px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 font-['Syne'] font-bold text-slate-400">
            <span>VARSITY DUEL</span>
            <span className="text-slate-600">·</span>
            <span className="text-[11px] font-normal text-slate-500">Inter-University Academic Championship Prep</span>
          </div>
          <div className="text-[11px] text-slate-500">
            Covers Data Analysis, Verbal Reasoning, Applied Mathematics & African Heritage
          </div>
        </div>
      </footer>
    </div>
  );
}
