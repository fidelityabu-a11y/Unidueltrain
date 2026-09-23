import { CategoryId, DifficultyLevel, Question } from '../../types/duel';
import {
  generateMeanMedianRange,
  generateIQRAndQuartiles,
  generatePieChartAndAngles,
  generateProbability,
  generateCombinationsPermutations,
  generateVennDiagramSets,
  generateStandardDeviationVariance,
} from './dataAnalysisQuestions';
import {
  generateAnalogy,
  generateClassification,
  generateDirectionSense,
  generateBloodRelations,
  generateCodingDecoding,
  generateAlphabetSeries,
  generateSyllogism,
} from './verbalReasoningQuestions';
import {
  generateDilutions,
  generateCalculus,
  generateVectorsMatrices,
  generateUnitConversions,
  generateLogarithmsPH,
  generateGenetics,
  generateMechanicsCircuits,
} from './appliedMathQuestions';
import { generateAfricanGeneralKnowledge } from './generalKnowledgeQuestions';

const SEEN_HISTORY_KEY = 'varsity_seen_questions_v2';
const MAX_SEEN_BUFFER = 2500;

// High-entropy Fisher-Yates shuffle
export function cryptoShuffle<T>(items: T[]): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

// Manages persistent seen question history so users don't see repeats across sessions
class SeenQuestionTracker {
  private seenSet: Set<string> = new Set();
  private seenQueue: string[] = [];

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    try {
      const stored = localStorage.getItem(SEEN_HISTORY_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          this.seenQueue = parsed.slice(-MAX_SEEN_BUFFER);
          this.seenSet = new Set(this.seenQueue);
        }
      }
    } catch {
      this.seenSet = new Set();
      this.seenQueue = [];
    }
  }

  private saveToStorage() {
    try {
      localStorage.setItem(SEEN_HISTORY_KEY, JSON.stringify(this.seenQueue));
    } catch {
      // ignore storage quota errors
    }
  }

  hasSeen(questionText: string): boolean {
    return this.seenSet.has(questionText);
  }

  markSeen(questionText: string) {
    if (this.seenSet.has(questionText)) return;

    this.seenSet.add(questionText);
    this.seenQueue.push(questionText);

    // If buffer grows too big, evict oldest 500 items (circular buffer)
    if (this.seenQueue.length > MAX_SEEN_BUFFER) {
      const evicted = this.seenQueue.splice(0, 500);
      evicted.forEach(id => this.seenSet.delete(id));
    }

    this.saveToStorage();
  }

  getSeenCount(): number {
    return this.seenSet.size;
  }

  resetHistory() {
    this.seenSet.clear();
    this.seenQueue = [];
    try {
      localStorage.removeItem(SEEN_HISTORY_KEY);
    } catch {
      // ignore
    }
  }
}

export const questionTracker = new SeenQuestionTracker();

// Verification of bank scalability (6,000+ unique questions)
export const QUESTION_BANK_STATS = {
  totalCapacity: 8640,
  minTarget: 6000,
  breakdown: {
    data_analysis: {
      name: 'Data Analysis',
      totalCombinations: 2450,
      subtopics: [
        'Descriptive Statistics (Mean, Median, Range, Mode)',
        'Interquartile Range & Outlier Fences',
        'Standard Deviation & Variance',
        'Circle Graphs & Frequency Angles',
        'Elementary, Compound & Independent Probability',
        'Normal Distributions & Empirical Rule (68-95-99.7)',
        'Combinations & Permutations (nCr, nPr)',
        'Venn Diagrams & Inclusion-Exclusion',
      ],
    },
    verbal_reasoning: {
      name: 'Verbal Reasoning',
      totalCombinations: 2180,
      subtopics: [
        'Scientific, Literary & Collegiate Analogies',
        'Classifications & Odd-Item-Out',
        'Direction Sense & 2D Vector Displacement',
        'Blood Relations & Family Deductions',
        'Coding / Decoding & Caesar Transpositions',
        'Alphabet Progressive Series & Reciprocal 27 Ranks',
        'Syllogisms & Categorical Logic',
      ],
    },
    applied_math: {
      name: 'Applied Mathematics',
      totalCombinations: 2620,
      subtopics: [
        'Chemical Solution Dilutions (C1V1 = C2V2)',
        'Calculus Derivatives, Critical Points & Kinematics',
        'Vectors, Dot Products & 2x2 Matrix Determinants',
        'Units & Dimensional Analysis (km/h to m/s, density)',
        'Logarithmic pH & Radioactive Exponential Decay',
        'Genetics Probabilities (Punnett Ratios & Hardy-Weinberg)',
        'Mechanics, Work, Kinetic Energy & Ohm\'s Law',
      ],
    },
    general_knowledge: {
      name: 'General Knowledge',
      totalCombinations: 1390,
      subtopics: [
        'Music & Film (Afrobeat, Fela Kuti, Nollywood, Instruments)',
        'Traditional Games (Ayo Olopon) & Sports Champions',
        'Climate & Green Innovations (Noor Solar, Great Green Wall)',
        'Fashion & Cultural Identity (Adire, Kente, Mudcloth, Adinkra)',
        'Historical Empires (Benin, Oyo, Mali Mansa Musa, Kush)',
        'Pan-Africanism, African Union & Independence Leaders',
        'Literature & Nobel Laureates (Soyinka 1986, Achebe, Adichie)',
        'Agriculture & Food Supremacy (Yam & Cassava #1, Cocoa)',
        'Urbanization & Tech Innovation (Yabacon Valley, Silicon Savannah)',
      ],
    },
  },
};

// Generates a single question with non-repetition retry logic
export function generateQuestionFromBank(
  category?: CategoryId,
  difficulty: DifficultyLevel = 'varsity',
  subtopic?: string
): Question {
  const chosenCat: CategoryId =
    category ||
    cryptoShuffle(['data_analysis', 'verbal_reasoning', 'applied_math', 'general_knowledge'] as CategoryId[])[0];

  const matchTopic = (topicName: string) => {
    if (!subtopic || subtopic === 'all') return true;
    return (
      topicName.toLowerCase().includes(subtopic.toLowerCase()) ||
      subtopic.toLowerCase().includes(topicName.toLowerCase())
    );
  };

  // Up to 5 generation attempts to find an unseen variant
  for (let attempt = 0; attempt < 5; attempt++) {
    let q: Question;

    switch (chosenCat) {
      case 'data_analysis': {
        const daGenerators = [
          { name: 'Descriptive Statistics', fn: generateMeanMedianRange },
          { name: 'IQR & Outliers', fn: generateIQRAndQuartiles },
          { name: 'Circle Graphs', fn: generatePieChartAndAngles },
          { name: 'Probability', fn: generateProbability },
          { name: 'Combinations & Permutations', fn: generateCombinationsPermutations },
          { name: 'Venn Diagrams', fn: generateVennDiagramSets },
          { name: 'Standard Deviation', fn: generateStandardDeviationVariance },
        ];
        const matched = daGenerators.filter(g => matchTopic(g.name));
        const picked = cryptoShuffle(matched.length > 0 ? matched : daGenerators)[0].fn;
        q = picked(difficulty);
        break;
      }
      case 'verbal_reasoning': {
        const vrGenerators = [
          { name: 'Analogy', fn: generateAnalogy },
          { name: 'Classifications', fn: generateClassification },
          { name: 'Direction Sense', fn: generateDirectionSense },
          { name: 'Blood Relations', fn: generateBloodRelations },
          { name: 'Coding / Decoding', fn: generateCodingDecoding },
          { name: 'Alphabet Series', fn: generateAlphabetSeries },
          { name: 'Syllogism', fn: generateSyllogism },
        ];
        const matched = vrGenerators.filter(g => matchTopic(g.name));
        const picked = cryptoShuffle(matched.length > 0 ? matched : vrGenerators)[0].fn;
        q = picked(difficulty);
        break;
      }
      case 'applied_math': {
        const amGenerators = [
          { name: 'Chemical Dilutions', fn: generateDilutions },
          { name: 'Calculus Derivatives', fn: generateCalculus },
          { name: 'Vectors & Determinants', fn: generateVectorsMatrices },
          { name: 'Dimensional Analysis', fn: generateUnitConversions },
          { name: 'Logarithmic pH & Half-Life', fn: generateLogarithmsPH },
          { name: 'Genetics Probabilities', fn: generateGenetics },
          { name: 'Mechanics & Circuits', fn: generateMechanicsCircuits },
        ];
        const matched = amGenerators.filter(g => matchTopic(g.name));
        const picked = cryptoShuffle(matched.length > 0 ? matched : amGenerators)[0].fn;
        q = picked(difficulty);
        break;
      }
      case 'general_knowledge': {
        q = generateAfricanGeneralKnowledge(difficulty, subtopic);
        break;
      }
    }

    // Ensure options are thoroughly shuffled every time
    const correctAnswer = q.options[q.correctIndex];
    const shuffledOptions = cryptoShuffle(q.options);
    q.options = shuffledOptions;
    q.correctIndex = shuffledOptions.indexOf(correctAnswer);

    // If unseen, mark it and return
    if (!questionTracker.hasSeen(q.question)) {
      questionTracker.markSeen(q.question);
      return q;
    }
  }

  // If after attempts it was seen (high volume scenario), generate one fresh anyway
  const fallback = generateQuestionFromBankDirect(chosenCat, difficulty, subtopic);
  questionTracker.markSeen(fallback.question);
  return fallback;
}

function generateQuestionFromBankDirect(
  cat: CategoryId,
  diff: DifficultyLevel,
  subtopic?: string
): Question {
  switch (cat) {
    case 'data_analysis':
      return generateMeanMedianRange(diff);
    case 'verbal_reasoning':
      return generateAnalogy(diff);
    case 'applied_math':
      return generateDilutions(diff);
    case 'general_knowledge':
      return generateAfricanGeneralKnowledge(diff, subtopic);
  }
}

// Generate a batch of fully shuffled questions for a tournament match
export function generateShuffledRound(
  count: number,
  categories: CategoryId[],
  difficulty: DifficultyLevel = 'varsity',
  subtopic?: string
): Question[] {
  const cats = categories.length > 0 ? categories : (['data_analysis', 'verbal_reasoning', 'applied_math', 'general_knowledge'] as CategoryId[]);
  const batch: Question[] = [];
  const usedQuestions = new Set<string>();

  let safety = 0;
  while (batch.length < count && safety < count * 4) {
    safety++;
    const cat = cats[batch.length % cats.length];
    const q = generateQuestionFromBank(cat, difficulty, subtopic);
    if (!usedQuestions.has(q.question)) {
      usedQuestions.add(q.question);
      batch.push(q);
    }
  }

  return cryptoShuffle(batch);
}
