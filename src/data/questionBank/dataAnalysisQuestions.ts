import { DifficultyLevel, Question } from '../../types/duel';

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function choice<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function buildQ(
  topic: string,
  difficulty: DifficultyLevel,
  question: string,
  correctAnswer: string,
  distractors: string[],
  explanation: string,
  mentalShortcut?: string,
  dataContext?: Question['dataContext']
): Question {
  const uniqueDistractors = Array.from(new Set(distractors.filter(d => d !== correctAnswer)));
  while (uniqueDistractors.length < 3) {
    uniqueDistractors.push(`Alt ${uniqueDistractors.length + 1}`);
  }
  const picked = shuffle(uniqueDistractors).slice(0, 3);
  const options = shuffle([correctAnswer, ...picked]);
  const correctIndex = options.indexOf(correctAnswer);

  return {
    id: `da_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
    category: 'data_analysis',
    topic,
    difficulty,
    question,
    options,
    correctIndex,
    explanation,
    mentalShortcut,
    dataContext,
  };
}

// 1. Mean, Median, Mode, and Range
export function generateMeanMedianRange(diff: DifficultyLevel): Question {
  const base = randInt(12, 60);
  const step = randInt(3, 8);
  const shift = diff === 'champion' ? randInt(2, 5) : 0;
  const numbers = [base, base + step, base + step * 2, base + step * 3 + shift, base + step * 4];
  const sum = numbers.reduce((a, b) => a + b, 0);
  const mean = Math.round((sum / numbers.length) * 10) / 10;
  const sorted = [...numbers].sort((a, b) => a - b);
  const median = sorted[2];
  const range = sorted[4] - sorted[0];

  const target = choice(['mean', 'median', 'range', 'sum'] as const);

  if (target === 'mean') {
    return buildQ(
      'Basic Descriptive Statistics (Mean, Median, Range)',
      diff,
      `What is the arithmetic mean of the university duel score set: [${numbers.join(', ')}]?`,
      `${mean}`,
      [`${(mean + step).toFixed(1)}`, `${(mean - step).toFixed(1)}`, `${median}`],
      `The sum of all 5 values is ${sum}. Dividing by 5: ${sum} / 5 = ${mean}.`,
      `Mental trick: Notice near-symmetry around ${numbers[2]}. Sum extremes (${numbers[0]} + ${numbers[4]} = ${numbers[0] + numbers[4]}), then average.`
    );
  } else if (target === 'median') {
    return buildQ(
      'Basic Descriptive Statistics (Mean, Median, Range)',
      diff,
      `Identify the median of the following unordered score dataset: [${shuffle(numbers).join(', ')}]`,
      `${median}`,
      [`${mean}`, `${median + step}`, `${sorted[1]}`],
      `Ordered sequence: [${sorted.join(', ')}]. The middle (3rd) value is ${median}.`,
      `For odd sample sizes, the median is always the exact middle rank (n+1)/2.`
    );
  } else if (target === 'range') {
    return buildQ(
      'Basic Descriptive Statistics (Mean, Median, Range)',
      diff,
      `Find the range of the numbers: [${shuffle(numbers).join(', ')}]`,
      `${range}`,
      [`${range + step}`, `${range - step}`, `${range * 2}`],
      `Range = Maximum - Minimum = ${sorted[4]} - ${sorted[0]} = ${range}.`,
      `Quickly spot the smallest (${sorted[0]}) and largest (${sorted[4]}) and subtract.`
    );
  } else {
    return buildQ(
      'Basic Descriptive Statistics (Mean, Median, Range)',
      diff,
      `If the mean score of 5 dueling contestants is ${mean}, what is the total sum of their combined scores?`,
      `${sum}`,
      [`${sum + 10}`, `${sum - 15}`, `${Math.round(mean * 4)}`],
      `Total Sum = Mean × Number of items = ${mean} × 5 = ${sum}.`,
      `Multiply by 5: Multiply by 10 and halve (${mean} × 10 = ${mean * 10} / 2 = ${sum}).`
    );
  }
}

// 2. Interquartile Range & Outlier Fences
export function generateIQRAndQuartiles(diff: DifficultyLevel): Question {
  const q1 = randInt(25, 70);
  const iqr = randInt(12, 32);
  const q3 = q1 + iqr;
  const isOutlier = choice(['upper_fence', 'lower_fence', 'iqr'] as const);

  if (isOutlier === 'upper_fence') {
    const upperFence = q3 + 1.5 * iqr;
    return buildQ(
      'Boxplots & Outliers',
      diff,
      `In a boxplot analysis with Q1 = ${q1} and Q3 = ${q3} (IQR = ${iqr}), what is the upper outlier boundary?`,
      `${upperFence}`,
      [`${q3 + iqr}`, `${upperFence + 5}`, `${q3 + 2 * iqr}`],
      `Upper outlier threshold = Q3 + 1.5 × IQR = ${q3} + 1.5(${iqr}) = ${upperFence}.`,
      `1.5 × IQR is IQR + half of IQR (${iqr} + ${iqr / 2} = ${1.5 * iqr}). Add to Q3: ${q3} + ${1.5 * iqr} = ${upperFence}.`
    );
  } else if (isOutlier === 'lower_fence') {
    const lowerFence = q1 - 1.5 * iqr;
    return buildQ(
      'Boxplots & Outliers',
      diff,
      `For a research distribution where Q1 = ${q1} and IQR = ${iqr}, calculate the lower outlier cutoff fence.`,
      `${lowerFence}`,
      [`${q1 - iqr}`, `${lowerFence - 5}`, `${q1 - 2 * iqr}`],
      `Lower outlier fence = Q1 - 1.5 × IQR = ${q1} - 1.5(${iqr}) = ${lowerFence}.`,
      `Take Q1 and subtract (IQR + 0.5 × IQR).`
    );
  } else {
    return buildQ(
      'Interquartile Range (IQR) & Quartiles',
      diff,
      `A survey of university tournament times reveals a 25th percentile (Q1) of ${q1} s and a 75th percentile (Q3) of ${q3} s. What is the IQR?`,
      `${iqr} s`,
      [`${iqr + 6} s`, `${iqr - 4} s`, `${(q1 + q3) / 2} s`],
      `IQR is defined as Q3 - Q1 = ${q3} - ${q1} = ${iqr} s.`,
      `IQR measures the spread of the middle 50% of contestants.`
    );
  }
}

// 3. Circle Graphs & Frequency Sectors
export function generatePieChartAndAngles(diff: DifficultyLevel): Question {
  const percent = choice([10, 15, 20, 25, 30, 35, 40, 45, 50, 60, 75]);
  const angle = (percent / 100) * 360;
  const totalStudents = choice([200, 400, 500, 800, 1000]);
  const count = (percent / 100) * totalStudents;

  const mode = choice(['angle_from_percent', 'count_from_angle'] as const);

  if (mode === 'angle_from_percent') {
    return buildQ(
      'Circle Graphs, Bar Graphs & Frequency Distribution',
      diff,
      `In a collegiate audience poll, ${percent}% of spectators picked University of Ibadan. What angle does this sector subtend on a pie chart?`,
      `${angle}°`,
      [`${angle + 18}°`, `${angle - 18}°`, `${percent * 3}°`],
      `Angle = (${percent} / 100) × 360° = ${angle}°.`,
      `Mental trick: 10% = 36°. For ${percent}%, do 3.6 × ${percent} = ${angle}°.`
    );
  } else {
    return buildQ(
      'Circle Graphs, Bar Graphs & Frequency Distribution',
      diff,
      `On a pie chart representing ${totalStudents} total contestants, a category has an angle of ${angle}°. How many contestants does this represent?`,
      `${count}`,
      [`${count + 15}`, `${count - 20}`, `${Math.round(totalStudents * 0.5)}`],
      `Fraction of circle = ${angle}° / 360° = ${percent / 100}. Count = ${percent / 100} × ${totalStudents} = ${count}.`,
      `Recognize ${angle}° is ${percent}% of 360°. Then take ${percent}% of ${totalStudents}.`
    );
  }
}

// 4. Elementary & Compound Probability
export function generateProbability(diff: DifficultyLevel): Question {
  const type = choice(['independent', 'normal_empirical', 'dice_sum', 'card_deck'] as const);

  if (type === 'independent') {
    const p1_num = choice([1, 2, 3]);
    const p1_den = 4;
    const p2_num = choice([1, 2]);
    const p2_den = choice([3, 5]);

    const num = p1_num * p2_num;
    const den = p1_den * p2_den;
    const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
    const g = gcd(num, den);
    const correct = `${num / g}/${den / g}`;
    const wrong1 = `${(num + 1) / g}/${den / g}`;
    const wrong2 = `${p1_num + p2_num}/${p1_den + p2_den}`;
    const wrong3 = `1/${den / g}`;

    return buildQ(
      'Elementary Probability (Compound & Independent)',
      diff,
      `Two independent events X and Y have probabilities P(X) = ${p1_num}/${p1_den} and P(Y) = ${p2_num}/${p2_den}. What is P(X and Y)?`,
      correct,
      [wrong1, wrong2, wrong3],
      `For independent events, P(X ∩ Y) = P(X) × P(Y) = (${p1_num}/${p1_den}) × (${p2_num}/${p2_den}) = ${num}/${den} = ${correct}.`,
      `Rule: Independent 'AND' means multiply probabilities directly.`
    );
  } else if (type === 'normal_empirical') {
    const mean = randInt(65, 85);
    const sd = choice([5, 8, 10]);
    const rangeChoice = choice(['1sd', '2sd', 'above_1sd'] as const);

    if (rangeChoice === '1sd') {
      return buildQ(
        'Normal Probability Distribution (Empirical Rule)',
        diff,
        `Contestant scores in the Academic Duel follow a normal distribution with mean μ = ${mean} and standard deviation σ = ${sd}. What percentage of scores fall between ${mean - sd} and ${mean + sd}?`,
        `68%`,
        [`95%`, `99.7%`, `50%`],
        `By the Empirical Rule (68-95-99.7), 68% of normal data lies within 1 standard deviation (μ ± 1σ).`,
        `Empirical rule benchmark: 1σ is always 68%.`
      );
    } else if (rangeChoice === '2sd') {
      return buildQ(
        'Normal Probability Distribution (Empirical Rule)',
        diff,
        `If exam ratings have μ = ${mean} and σ = ${sd}, what proportion of participants score within 2 standard deviations (${mean - 2 * sd} to ${mean + 2 * sd})?`,
        `95%`,
        [`68%`, `99.7%`, `90%`],
        `Under a normal curve, exactly ~95% falls within 2 standard deviations (μ ± 2σ).`,
        `2σ standard coverage is 95%.`
      );
    } else {
      return buildQ(
        'Normal Probability Distribution (Empirical Rule)',
        diff,
        `In a bell-shaped distribution with mean ${mean} and σ = ${sd}, what percentage of contestants score higher than ${mean + sd}?`,
        `16%`,
        [`32%`, `5%`, `2.5%`],
        `Between μ and μ + 1σ is 34%. Since 50% lies above the mean, above μ + 1σ is 50% - 34% = 16%.`,
        `Upper tail beyond 1σ is always ~16% (half of the 32% outside ±1σ).`
      );
    }
  } else if (type === 'dice_sum') {
    const targetSum = choice([7, 8, 9, 10, 11, 12]);
    let favorable = 0;
    for (let d1 = 1; d1 <= 6; d1++) {
      for (let d2 = 1; d2 <= 6; d2++) {
        if (d1 + d2 === targetSum) favorable++;
      }
    }
    const correct = `${favorable}/36`;
    const wrong1 = `${favorable + 1}/36`;
    const wrong2 = `${favorable}/12`;
    const wrong3 = `${favorable - 1 || 2}/36`;

    return buildQ(
      'Elementary Probability (Compound & Independent)',
      diff,
      `When rolling two fair 6-sided dice, what is the probability that the sum of the numbers is exactly ${targetSum}?`,
      correct,
      [wrong1, wrong2, wrong3],
      `There are 36 total outcomes. There are ${favorable} favorable pairs summing to ${targetSum}, giving ${favorable}/36.`,
      `7 is the most probable sum (6 pairs, 6/36). As the sum moves away from 7, the pairs decrease by 1 for each step.`
    );
  } else {
    // Standard deck
    const questionChoice = choice([
      { q: 'What is the probability of drawing an Ace from a standard 52-card deck?', ans: '1/13', dist: ['1/52', '4/13', '1/4'] },
      { q: 'What is the probability of drawing a red face card (J, Q, K of Hearts or Diamonds)?', ans: '3/26', dist: ['6/52', '1/4', '3/13'] },
      { q: 'What is the probability of drawing a Spade or a King from a standard 52-card deck?', ans: '4/13', dist: ['17/52', '1/4', '9/26'] },
    ]);
    return buildQ(
      'Elementary Probability (Compound & Independent)',
      diff,
      questionChoice.q,
      questionChoice.ans,
      questionChoice.dist,
      `Standard deck has 52 cards, 4 suits of 13 cards, and 12 face cards.`,
      `Use inclusion-exclusion for unions: P(Spade ∪ King) = 13/52 + 4/52 - 1/52 = 16/52 = 4/13.`
    );
  }
}

// 5. Combinations, Permutations & Counting Methods
export function generateCombinationsPermutations(diff: DifficultyLevel): Question {
  const isComb = Math.random() > 0.45;
  if (isComb) {
    const n = choice([5, 6, 7, 8]);
    const r = choice([2, 3]);
    let ans = 1;
    if (n === 5 && r === 2) ans = 10;
    else if (n === 5 && r === 3) ans = 10;
    else if (n === 6 && r === 2) ans = 15;
    else if (n === 6 && r === 3) ans = 20;
    else if (n === 7 && r === 2) ans = 21;
    else if (n === 7 && r === 3) ans = 35;
    else if (n === 8 && r === 2) ans = 28;
    else if (n === 8 && r === 3) ans = 56;

    return buildQ(
      'Counting Methods: Combinations & Permutations',
      diff,
      `A university squad must choose ${r} representatives from a pool of ${n} elite math duelists. How many distinct combinations can be formed?`,
      `${ans}`,
      [`${ans + 6}`, `${ans - 4}`, `${ans * 2}`],
      `Combinations formula: C(${n}, ${r}) = ${n}! / (${r}!(${n - r})!) = ${ans}.`,
      `For C(n, 2), quickly compute n(n-1)/2. (e.g. ${n}×${n - 1}/2 = ${ans}).`
    );
  } else {
    // Permutations
    const n = choice([4, 5, 6]);
    const r = choice([2, 3]);
    let ans = 1;
    if (n === 4 && r === 2) ans = 12;
    else if (n === 4 && r === 3) ans = 24;
    else if (n === 5 && r === 2) ans = 20;
    else if (n === 5 && r === 3) ans = 60;
    else if (n === 6 && r === 2) ans = 30;
    else if (n === 6 && r === 3) ans = 120;

    return buildQ(
      'Counting Methods: Combinations & Permutations',
      diff,
      `In how many different ordered ways can 1st, 2nd, and 3rd place podium spots be awarded among ${n} university finalists?`,
      `${ans}`,
      [`${ans + 12}`, `${ans / 2}`, `${ans - 8}`],
      `Permutations: P(${n}, ${r}) = ${n}! / (${n - r})! = ${ans}.`,
      `Multiply down: ${n} × ${n - 1} × ${r === 3 ? n - 2 : 1} = ${ans}.`
    );
  }
}

// 6. Venn Diagrams & Sets
export function generateVennDiagramSets(diff: DifficultyLevel): Question {
  const nA = randInt(30, 60);
  const nB = randInt(25, 55);
  const nBoth = randInt(10, 22);
  const nTotal = nA + nB - nBoth;

  const target = choice(['union', 'only_a', 'only_b'] as const);

  if (target === 'union') {
    return buildQ(
      'Venn Diagrams & Simple Interest',
      diff,
      `In an academic cohort, ${nA} students study Data Analysis, ${nB} study Applied Math, and ${nBoth} study both. How many students study at least one of these two subjects?`,
      `${nTotal}`,
      [`${nA + nB}`, `${nTotal + 5}`, `${nTotal - 6}`],
      `Inclusion-Exclusion Principle: n(A ∪ B) = n(A) + n(B) - n(A ∩ B) = ${nA} + ${nB} - ${nBoth} = ${nTotal}.`,
      `Add both totals (${nA} + ${nB} = ${nA + nB}) and subtract the double-counted intersection (${nBoth}).`
    );
  } else if (target === 'only_a') {
    const onlyA = nA - nBoth;
    return buildQ(
      'Venn Diagrams & Simple Interest',
      diff,
      `Out of ${nA} students enrolled in Data Analysis, ${nBoth} also take Applied Math. How many take Data Analysis ONLY?`,
      `${onlyA}`,
      [`${nA}`, `${onlyA + 4}`, `${nA + nBoth}`],
      `Only A = Total in A - Both = ${nA} - ${nBoth} = ${onlyA}.`,
      `Subtract the intersection from set A directly: ${nA} - ${nBoth} = ${onlyA}.`
    );
  } else {
    const onlyB = nB - nBoth;
    return buildQ(
      'Venn Diagrams & Simple Interest',
      diff,
      `Out of ${nB} contestants who solve Verbal Reasoning, ${nBoth} also solve Logic. How many solve Verbal Reasoning ONLY?`,
      `${onlyB}`,
      [`${nB}`, `${onlyB + 5}`, `${nB + nBoth}`],
      `Only B = Total in B - Both = ${nB} - ${nBoth} = ${onlyB}.`,
      `Direct difference: ${nB} - ${nBoth} = ${onlyB}.`
    );
  }
}

// 7. Standard Deviation & Variance
export function generateStandardDeviationVariance(diff: DifficultyLevel): Question {
  const mode = choice(['variance_to_sd', 'linear_transformation', 'identical_set'] as const);

  if (mode === 'variance_to_sd') {
    const sd = choice([4, 5, 6, 7, 8, 9, 10, 11, 12]);
    const variance = sd * sd;
    return buildQ(
      'Standard Deviation & Variance',
      diff,
      `A dataset of student tournament reaction times has a variance of ${variance}. What is the standard deviation?`,
      `${sd}`,
      [`${sd * 2}`, `${variance / 2}`, `${sd + 1}`],
      `Standard deviation σ = √Variance = √${variance} = ${sd}.`,
      `Standard deviation is always the square root of variance.`
    );
  } else if (mode === 'linear_transformation') {
    const c = randInt(5, 20);
    const sd = randInt(3, 8);
    return buildQ(
      'Standard Deviation & Variance',
      diff,
      `If every score in a distribution with standard deviation σ = ${sd} has a constant of ${c} points added to it, what is the new standard deviation?`,
      `${sd}`,
      [`${sd + c}`, `${sd * c}`, `0`],
      `Adding a constant shifts all data points equally, leaving the spread unchanged. Therefore the standard deviation remains ${sd}.`,
      `Adding or subtracting a constant never changes variance or standard deviation.`
    );
  } else {
    return buildQ(
      'Standard Deviation & Variance',
      diff,
      `What is the sample standard deviation of the constant dataset: [8, 8, 8, 8, 8]?`,
      `0`,
      [`8`, `1`, `√8`],
      `Since all values are identical, there is zero dispersion or deviation from the mean (8 - 8 = 0). σ = 0.`,
      `A dataset of identical constants always has standard deviation = 0.`
    );
  }
}
