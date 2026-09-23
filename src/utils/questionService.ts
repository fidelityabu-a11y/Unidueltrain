import { CategoryId, DifficultyLevel, LeaderboardEntry, Question } from '../types/duel';
import { generateProceduralQuestion, generateQuestionBatch } from '../data/questionGenerator';

class QuestionService {
  private onlineQueue: Question[] = [];
  private isPrefetching = false;
  private seenQuestions = new Set<string>();

  constructor() {
    this.prefetchAIQuestions();
  }

  // Pre-fetch a batch of online questions in background
  async prefetchAIQuestions(category?: CategoryId, count = 6) {
    if (this.isPrefetching) return;
    this.isPrefetching = true;
    try {
      const res = await fetch('/api/duel/generate-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category, count, difficulty: 'varsity' }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.questions)) {
          for (const q of data.questions) {
            if (!this.seenQuestions.has(q.question)) {
              this.onlineQueue.push(q);
            }
          }
        }
      }
    } catch (e) {
      // Procedural generator is always active as backup
    } finally {
      this.isPrefetching = false;
    }
  }

  // Get next question with adaptive difficulty
  getNextQuestion(
    category?: CategoryId,
    streak: number = 0,
    forcedDifficulty?: DifficultyLevel,
    subtopic?: string
  ): Question {
    let diff: DifficultyLevel = forcedDifficulty || 'varsity';
    if (!forcedDifficulty) {
      if (streak >= 6) diff = 'champion';
      else if (streak <= 1) diff = 'novice';
      else diff = 'varsity';
    }

    // If online queue has matching question with strict category match, use it
    if (this.onlineQueue.length > 0) {
      const idx = category
        ? this.onlineQueue.findIndex(q => q.category === category)
        : 0;

      if (idx !== -1) {
        const candidate = this.onlineQueue[idx];
        // If subtopic specified, check if it matches or loosely contains
        const matchesSubtopic = !subtopic || subtopic === 'all' || 
          candidate.topic.toLowerCase().includes(subtopic.toLowerCase()) || 
          subtopic.toLowerCase().includes(candidate.topic.toLowerCase());

        if (matchesSubtopic && !this.seenQuestions.has(candidate.question)) {
          this.onlineQueue.splice(idx, 1);
          this.seenQuestions.add(candidate.question);
          // trigger prefetch if low
          if (this.onlineQueue.length < 3) {
            this.prefetchAIQuestions(category);
          }
          return candidate;
        }
      }
    }

    // Procedural instant generator with category and subtopic filter
    const question = generateProceduralQuestion(category, diff, subtopic);
    this.seenQuestions.add(question.question);
    return question;
  }

  // Generate a multi-question round
  getRoundBatch(
    count: number,
    categories: CategoryId[],
    difficulty: DifficultyLevel = 'varsity'
  ): Question[] {
    const list: Question[] = [];
    const pool = generateQuestionBatch(count, categories, difficulty);
    return pool;
  }

  // Fetch online leaderboard
  async getLeaderboard(mode?: string): Promise<LeaderboardEntry[]> {
    try {
      const url = mode ? `/api/leaderboard?mode=${encodeURIComponent(mode)}` : '/api/leaderboard';
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.leaderboard)) {
          return data.leaderboard;
        }
      }
    } catch (err) {
      console.warn('Leaderboard fetch failed, returning mock', err);
    }
    return [];
  }

  // Submit high score to leaderboard
  async submitScore(entry: Omit<LeaderboardEntry, 'id' | 'timestamp'>): Promise<{ rank: number } | null> {
    try {
      const res = await fetch('/api/leaderboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entry),
      });
      if (res.ok) {
        const data = await res.json();
        return { rank: data.rank || 1 };
      }
    } catch (e) {
      console.warn('Score submission error', e);
    }
    return null;
  }

  // Get AI Grandmaster Coach deep explanation
  async getCoachExplanation(
    question: string,
    options: string[],
    correctAnswer: string,
    userSelected: string
  ): Promise<string> {
    try {
      const res = await fetch('/api/duel/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, options, correctAnswer, userSelected }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.explanation) {
          return data.explanation;
        }
      }
    } catch (e) {
      console.warn('Coach explanation fetch error', e);
    }
    return 'Analyze the core variables and isolate known invariants to eliminate distractor traps.';
  }
}

export const questionService = new QuestionService();
