export type CategoryId = 'data_analysis' | 'verbal_reasoning' | 'applied_math' | 'general_knowledge';

export interface CategoryInfo {
  id: CategoryId;
  name: string;
  tagline: string;
  color: string;
  badgeBg: string;
  borderColor: string;
  iconName: string;
  topics: string[];
}

export type DifficultyLevel = 'novice' | 'varsity' | 'champion';

export interface Question {
  id: string;
  category: CategoryId;
  topic: string;
  difficulty: DifficultyLevel;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  mentalShortcut?: string;
  dataContext?: {
    type: 'table' | 'sequence' | 'code' | 'stat_box';
    content: string | Record<string, string | number>[];
  };
}

export type GameModeType = 'quick_buzz' | 'brain_math' | 'duel_arena' | 'custom_practice' | 'subject_drill';

export interface GameSettings {
  mode: GameModeType;
  timePerQuestion: number; // in seconds
  totalQuestions: number;
  selectedCategories: CategoryId[];
  subtopic?: string;
  soundEnabled: boolean;
  hapticsEnabled: boolean;
  adaptiveDifficulty: boolean;
}

export interface PlayerStats {
  username: string;
  university: string;
  rating: number; // Elo-style
  totalPoints: number;
  gamesPlayed: number;
  duelsWon: number;
  duelsLost: number;
  highestStreak: number;
  avgResponseTimeMs: number;
  accuracyByCategory: Record<CategoryId, { total: number; correct: number }>;
}

export interface LeaderboardEntry {
  id: string;
  username: string;
  university: string;
  score: number;
  mode: GameModeType;
  accuracy: number;
  streak: number;
  avgTime: number; // seconds
  timestamp: number;
  avatarSeed: string;
}

export interface OpponentProfile {
  name: string;
  university: string;
  avatarColor: string;
  speedRating: number; // 1 to 10
  accuracyRating: number; // 0.6 to 0.95
  buzzSpeedRange: [number, number]; // [minSeconds, maxSeconds]
}
