import { CategoryId, PlayerStats, Question } from '../types/duel';

const PROFILE_KEY = 'varsity_duel_profile_v1';
const MISTAKES_KEY = 'varsity_duel_mistakes_v1';
const TIMER_SETTINGS_KEY = 'varsity_duel_timer_settings_v1';

const defaultStats: PlayerStats = {
  username: 'VarsityScholar',
  university: 'University of Ibadan (UI)',
  rating: 1200,
  totalPoints: 0,
  gamesPlayed: 0,
  duelsWon: 0,
  duelsLost: 0,
  highestStreak: 0,
  avgResponseTimeMs: 4500,
  accuracyByCategory: {
    data_analysis: { total: 0, correct: 0 },
    verbal_reasoning: { total: 0, correct: 0 },
    applied_math: { total: 0, correct: 0 },
    general_knowledge: { total: 0, correct: 0 },
  },
};

export function getStoredProfile(): PlayerStats {
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    if (!raw) return defaultStats;
    const parsed = JSON.parse(raw);
    return { ...defaultStats, ...parsed };
  } catch {
    return defaultStats;
  }
}

export function saveStoredProfile(profile: PlayerStats): void {
  try {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  } catch (e) {
    console.error('Failed to save profile', e);
  }
}

export interface StoredMistake {
  question: Question;
  userAnswer: string;
  timestamp: number;
}

export function getStoredMistakes(): StoredMistake[] {
  try {
    const raw = localStorage.getItem(MISTAKES_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function recordMistake(question: Question, userAnswer: string): void {
  try {
    const list = getStoredMistakes();
    // avoid exact question duplicate
    const filtered = list.filter(m => m.question.question !== question.question);
    filtered.unshift({ question, userAnswer, timestamp: Date.now() });
    if (filtered.length > 50) filtered.length = 50;
    localStorage.setItem(MISTAKES_KEY, JSON.stringify(filtered));
  } catch (e) {
    console.error('Failed to record mistake', e);
  }
}

export function clearStoredMistakes(): void {
  localStorage.removeItem(MISTAKES_KEY);
}

export interface CustomTimerConfig {
  quickBuzzTime: number; // default 15
  brainMathTime: number; // default 8
  customTime: number; // default 10
}

export function getTimerConfig(): CustomTimerConfig {
  try {
    const raw = localStorage.getItem(TIMER_SETTINGS_KEY);
    if (!raw) return { quickBuzzTime: 15, brainMathTime: 8, customTime: 10 };
    return JSON.parse(raw);
  } catch {
    return { quickBuzzTime: 15, brainMathTime: 8, customTime: 10 };
  }
}

export function saveTimerConfig(config: CustomTimerConfig): void {
  try {
    localStorage.setItem(TIMER_SETTINGS_KEY, JSON.stringify(config));
  } catch (e) {
    console.error('Failed to save timer config', e);
  }
}
