import express from 'express';
import type { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Initialize Gemini Client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Seed Initial Tournament Leaderboard
interface LeaderboardEntryServer {
  id: string;
  username: string;
  university: string;
  score: number;
  mode: string;
  accuracy: number;
  streak: number;
  avgTime: number;
  timestamp: number;
  avatarSeed: string;
}

const leaderboardStore: LeaderboardEntryServer[] = [
  {
    id: 'lead_1',
    username: 'Chidi O.',
    university: 'University of Ibadan (UI)',
    score: 9850,
    mode: 'quick_buzz',
    accuracy: 94,
    streak: 18,
    avgTime: 5.2,
    timestamp: Date.now() - 3600000 * 2,
    avatarSeed: 'chidi',
  },
  {
    id: 'lead_2',
    username: 'Amina Bello',
    university: 'Ahmadu Bello University (ABU)',
    score: 9420,
    mode: 'brain_math',
    accuracy: 96,
    streak: 22,
    avgTime: 3.8,
    timestamp: Date.now() - 3600000 * 5,
    avatarSeed: 'amina',
  },
  {
    id: 'lead_3',
    username: 'Kwame Mensah',
    university: 'KNUST (Ghana)',
    score: 9180,
    mode: 'quick_buzz',
    accuracy: 91,
    streak: 15,
    avgTime: 6.1,
    timestamp: Date.now() - 3600000 * 8,
    avatarSeed: 'kwame',
  },
  {
    id: 'lead_4',
    username: 'Folashade Adeyemi',
    university: 'University of Lagos (UNILAG)',
    score: 8990,
    mode: 'brain_math',
    accuracy: 93,
    streak: 14,
    avgTime: 4.1,
    timestamp: Date.now() - 3600000 * 12,
    avatarSeed: 'fola',
  },
  {
    id: 'lead_5',
    username: 'Tendai Moyo',
    university: 'Univ of Cape Town (UCT)',
    score: 8740,
    mode: 'quick_buzz',
    accuracy: 89,
    streak: 12,
    avgTime: 6.4,
    timestamp: Date.now() - 3600000 * 18,
    avatarSeed: 'tendai',
  },
  {
    id: 'lead_6',
    username: 'Kelechi Eze',
    university: 'Univ of Nigeria Nsukka (UNN)',
    score: 8560,
    mode: 'brain_math',
    accuracy: 90,
    streak: 11,
    avgTime: 4.6,
    timestamp: Date.now() - 3600000 * 24,
    avatarSeed: 'kelechi',
  },
  {
    id: 'lead_7',
    username: 'Naima Hassan',
    university: 'Cairo University (Egypt)',
    score: 8320,
    mode: 'quick_buzz',
    accuracy: 88,
    streak: 10,
    avgTime: 7.0,
    timestamp: Date.now() - 3600000 * 30,
    avatarSeed: 'naima',
  },
  {
    id: 'lead_8',
    username: 'Tobi Olusegun',
    university: 'Obafemi Awolowo Univ (OAU)',
    score: 8150,
    mode: 'brain_math',
    accuracy: 92,
    streak: 9,
    avgTime: 4.3,
    timestamp: Date.now() - 3600000 * 36,
    avatarSeed: 'tobi',
  },
];

// Leaderboard APIs
app.get('/api/leaderboard', (req: Request, res: Response) => {
  const mode = req.query.mode as string | undefined;
  let results = [...leaderboardStore];
  if (mode && mode !== 'all') {
    results = results.filter(entry => entry.mode === mode);
  }
  results.sort((a, b) => b.score - a.score);
  res.json({ success: true, leaderboard: results });
});

app.post('/api/leaderboard', (req: Request, res: Response) => {
  const { username, university, score, mode, accuracy, streak, avgTime, avatarSeed } = req.body;
  if (!username || typeof score !== 'number') {
    res.status(400).json({ error: 'Missing required fields' });
    return;
  }

  const newEntry: LeaderboardEntryServer = {
    id: `entry_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    username: String(username).trim().substring(0, 30),
    university: String(university || 'Independent Duelist').substring(0, 50),
    score: Math.round(score),
    mode: String(mode || 'quick_buzz'),
    accuracy: Math.round(accuracy || 0),
    streak: Math.round(streak || 0),
    avgTime: Number(Number(avgTime || 0).toFixed(1)),
    timestamp: Date.now(),
    avatarSeed: String(avatarSeed || username),
  };

  leaderboardStore.push(newEntry);
  leaderboardStore.sort((a, b) => b.score - a.score);
  if (leaderboardStore.length > 100) {
    leaderboardStore.length = 100;
  }

  const rank = leaderboardStore.findIndex(e => e.id === newEntry.id) + 1;
  res.json({ success: true, entry: newEntry, rank });
});

// Gemini AI Generator API: On-demand unlimited question generator
app.post('/api/duel/generate-questions', async (req: Request, res: Response) => {
  try {
    const { category, count = 5, difficulty = 'varsity', subtopic } = req.body;

    const systemPrompt = `You are the Official Chief Arbiter for the "University Academic Duel", a premier televised collegiate championship.
Generate fast-paced, high-stakes competition questions that can be solved in the contestant's brain within 8 to 15 seconds.
Questions must be clean, rigorous, and strictly multiple-choice with 4 distinct options and only ONE unequivocal correct answer.
Category areas:
1. DATA ANALYSIS: Mean, median, mode, range, standard deviation, IQR, quartiles, percentiles, pie/bar/line graph angles and interpretation, compound/independent probability, conditional probability, normal distribution (68-95-99.7 rule), combinations (nCr), permutations (nPr), Venn diagrams, simple interest.
2. VERBAL REASONING: Analogies (word/number/African GK), classifications (odd one out), blood relations, direction sense, alphabet series, syllogisms, statements & assumptions, statements & conclusions, cause & effect, coding/decoding (shifts, letters to numbers, clock ciphers).
3. APPLIED MATHEMATICS: Molarity & dilution ratios (M1V1 = M2V2), enzyme reaction kinetics & rates of change, calculus derivatives/rates (velocity, acceleration), 2x2 matrix determinant & dot products, units & dimensional conversions (m/s to km/h, mm3 to cm3), pH logs (-log[H+]), exponential doubling, genetics Punnett ratios (3:1, 9:3:3:1) & Hardy-Weinberg, percentage yields, mechanics (v=u+at, work/power/density).
4. GENERAL KNOWLEDGE (African Heritage & Leadership with Nigeria as a reference point): African music & film (Afrobeat origins Fela Kuti/Tony Allen, modern Grammys, Nollywood, African instruments like Gangan/Kora/Mbira, traditional games Ayo Olopon/Mancala), Climate & green innovation (Noor solar Morocco, Lake Turkana wind Kenya, Great Green Wall, Solar Power Naija), Fashion & Cultural Identity (Adire, Kente, Bogolanfini, Aso Oke, Adinkra symbols), Pre-colonial empires (Benin, Oyo, Mali Mansa Musa, Songhai, Kush, Great Zimbabwe) & Pan-Africanism (Azikiwe, Nkrumah, Mandela, Sankara, AU, ECOWAS), Literature (Wole Soyinka 1986 Nobel, Chinua Achebe, Adichie), Agriculture & food (Yam & cassava leadership, cocoa, jollof dynamics), Tech clusters (Yabacon Valley Lagos, Silicon Savannah Nairobi).

CRITICAL RULE: The question MUST be mentally solvable (no 10-step tedious algebra). Include a "mentalShortcut" explaining the quick intuitive trick or rule to crack it under tournament pressure.`;

    const userPrompt = `Generate ${count} questions.
Target Category: ${category || 'mixed'}
Target Subtopic: ${subtopic || 'any syllabus subtopic'}
Difficulty: ${difficulty} (novice = fast foundational, varsity = standard tournament, champion = high-speed mastery).
Format your output strictly as a JSON array of objects following this schema:
[
  {
    "category": "data_analysis" | "verbal_reasoning" | "applied_math" | "general_knowledge",
    "topic": string,
    "difficulty": "novice" | "varsity" | "champion",
    "question": string,
    "options": [string, string, string, string],
    "correctIndex": number (0 to 3),
    "explanation": string,
    "mentalShortcut": string
  }
]`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: userPrompt,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              category: { type: Type.STRING },
              topic: { type: Type.STRING },
              difficulty: { type: Type.STRING },
              question: { type: Type.STRING },
              options: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              correctIndex: { type: Type.INTEGER },
              explanation: { type: Type.STRING },
              mentalShortcut: { type: Type.STRING },
            },
            required: ['category', 'topic', 'difficulty', 'question', 'options', 'correctIndex', 'explanation', 'mentalShortcut'],
          },
        },
      },
    });

    const parsed = JSON.parse(response.text || '[]');
    const formatted = parsed.map((q: any, i: number) => ({
      ...q,
      id: `ai_${Date.now()}_${i}_${Math.random().toString(36).substring(2, 6)}`,
    }));

    res.json({ success: true, questions: formatted });
  } catch (err: any) {
    console.error('Error generating AI questions:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to generate online questions via AI. Fallback will be triggered.',
    });
  }
});

// Deep AI Question Explanation Breakdown
app.post('/api/duel/explain', async (req: Request, res: Response) => {
  try {
    const { question, options, correctAnswer, userSelected } = req.body;
    const prompt = `A contestant in the University Academic Duel tackled this question:
Question: "${question}"
Options: ${JSON.stringify(options)}
Correct Answer: "${correctAnswer}"
Contestant Selected: "${userSelected}"

Provide an energetic, razor-sharp 2-3 sentence tournament breakdown:
1. Why the correct answer is logically/mathematically sound.
2. The instant mental shortcut or pattern-recognition cue to solve it in under 8 seconds.
3. If the contestant chose incorrectly, explain the common distractor trap.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction: 'You are an elite University Duel grandmaster coach providing succinct, actionable mental speed tips.',
      },
    });

    res.json({ success: true, explanation: response.text });
  } catch (err) {
    console.error('Error in explanation:', err);
    res.status(500).json({ success: false, error: 'Could not generate coach analysis.' });
  }
});

// Setup Vite middleware in dev or serve dist in production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`Varsity Duel server running on http://localhost:${PORT}`);
  });
}

startServer();
