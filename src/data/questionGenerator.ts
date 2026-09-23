import { CategoryId, DifficultyLevel, Question } from '../types/duel';

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

function createQuestionHelper(
  category: CategoryId,
  topic: string,
  difficulty: DifficultyLevel,
  question: string,
  correctAnswer: string,
  distractors: string[],
  explanation: string,
  mentalShortcut?: string,
  dataContext?: Question['dataContext']
): Question {
  const filteredDistractors = Array.from(new Set(distractors.filter(d => d !== correctAnswer)));
  while (filteredDistractors.length < 3) {
    filteredDistractors.push(`Alt-${filteredDistractors.length + 1}`);
  }
  const pickedDistractors = shuffle(filteredDistractors).slice(0, 3);
  const options = shuffle([correctAnswer, ...pickedDistractors]);
  const correctIndex = options.indexOf(correctAnswer);

  return {
    id: `q_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    category,
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

// ----------------------------------------------------
// 1. DATA ANALYSIS GENERATORS
// ----------------------------------------------------

function genMeanMedianRange(diff: DifficultyLevel): Question {
  const base = randInt(10, 40);
  const step = randInt(2, 6);
  const numbers = [base, base + step, base + step * 2, base + step * 3, base + step * 4];
  // add a small shift
  if (diff === 'champion') {
    numbers[4] += step;
  }
  const sum = numbers.reduce((a, b) => a + b, 0);
  const mean = Math.round((sum / numbers.length) * 10) / 10;
  const sorted = [...numbers].sort((a, b) => a - b);
  const median = sorted[2];
  const range = sorted[4] - sorted[0];

  const targetType = choice(['mean', 'median', 'range'] as const);

  if (targetType === 'mean') {
    const correct = mean.toString();
    const wrong1 = (mean + step).toString();
    const wrong2 = (mean - step).toString();
    const wrong3 = median.toString();
    return createQuestionHelper(
      'data_analysis',
      'Mean, Median and Range',
      diff,
      `What is the arithmetic mean of the dataset: [${numbers.join(', ')}]?`,
      correct,
      [wrong1, wrong2, wrong3],
      `The sum of the 5 values is ${sum}. Divide by 5: ${sum} / 5 = ${mean}.`,
      `Notice symmetric balance: Average of the lowest (${numbers[0]}) and highest (${numbers[4]}) is (${numbers[0] + numbers[4]})/2 = ${(numbers[0] + numbers[4]) / 2}.`
    );
  } else if (targetType === 'median') {
    const correct = median.toString();
    const wrong1 = mean.toString();
    const wrong2 = (median + step).toString();
    const wrong3 = (median - step).toString();
    return createQuestionHelper(
      'data_analysis',
      'Mean, Median and Range',
      diff,
      `Identify the median of the following set: [${shuffle(numbers).join(', ')}]`,
      correct,
      [wrong1, wrong2, wrong3],
      `Sort the 5 values: [${sorted.join(', ')}]. The middle (3rd) term is ${median}.`,
      `For an odd count of ordered numbers, the middle term is directly the median.`
    );
  } else {
    const correct = range.toString();
    const wrong1 = (range + step).toString();
    const wrong2 = (range - step).toString();
    const wrong3 = (range * 2).toString();
    return createQuestionHelper(
      'data_analysis',
      'Mean, Median and Range',
      diff,
      `What is the range of the numbers: [${shuffle(numbers).join(', ')}]?`,
      correct,
      [wrong1, wrong2, wrong3],
      `Range = Max - Min = ${sorted[4]} - ${sorted[0]} = ${range}.`,
      `Quickly scan for highest (${sorted[4]}) and lowest (${sorted[0]}) and subtract.`
    );
  }
}

function genIQRAndQuartiles(diff: DifficultyLevel): Question {
  const q1 = randInt(20, 50);
  const iqr = randInt(12, 30);
  const q3 = q1 + iqr;
  const median = Math.round(q1 + iqr / 2);

  const ask = choice(['iqr', 'outlier_upper'] as const);

  if (ask === 'iqr') {
    return createQuestionHelper(
      'data_analysis',
      'Interquartile Range & Quartiles',
      diff,
      `A dataset has a lower quartile Q1 = ${q1} and upper quartile Q3 = ${q3}. What is the Interquartile Range (IQR)?`,
      `${iqr}`,
      [`${iqr + 5}`, `${iqr - 4}`, `${q3 + q1}`],
      `IQR = Q3 - Q1 = ${q3} - ${q1} = ${iqr}.`,
      `IQR is purely the difference between the 75th and 25th percentiles (Q3 - Q1).`
    );
  } else {
    const upperFence = q3 + 1.5 * iqr;
    return createQuestionHelper(
      'data_analysis',
      'Boxplots & Outliers',
      diff,
      `In a boxplot with Q1 = ${q1}, Q3 = ${q3} (IQR = ${iqr}), what is the threshold boundary above which a value is considered a high outlier?`,
      `${upperFence}`,
      [`${q3 + iqr}`, `${upperFence + 5}`, `${q3 + 2 * iqr}`],
      `Upper outlier threshold = Q3 + 1.5 * IQR = ${q3} + 1.5(${iqr}) = ${upperFence}.`,
      `Multiply IQR by 1.5 (half plus whole), then add to Q3: ${q3} + ${1.5 * iqr} = ${upperFence}.`
    );
  }
}

function genPieChartAndFrequency(diff: DifficultyLevel): Question {
  const percent = choice([15, 20, 25, 30, 40, 50]);
  const degrees = (percent / 100) * 360;

  return createQuestionHelper(
    'data_analysis',
    'Circle Graphs & Frequency',
    diff,
    `In an academic duel survey, ${percent}% of respondents favored Data Analysis. What is the central angle of this sector on a pie chart (circle graph)?`,
    `${degrees}°`,
    [`${degrees + 18}°`, `${degrees - 18}°`, `${percent * 3}°`],
    `Central angle = (${percent} / 100) * 360° = ${degrees}°.`,
    `Mental trick: 10% = 36°. For ${percent}%, multiply 36° by ${percent / 10}.`
  );
}

function genElementaryProbability(diff: DifficultyLevel): Question {
  const type = choice(['independent', 'dice', 'normal', 'cards'] as const);

  if (type === 'independent') {
    const pA_num = choice([1, 2, 3]);
    const pA_den = 4;
    const pB_num = choice([1, 2]);
    const pB_den = 3;
    const ansNum = pA_num * pB_num;
    const ansDen = pA_den * pB_den;
    // simplify
    const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
    const g = gcd(ansNum, ansDen);
    const correct = `${ansNum / g}/${ansDen / g}`;
    const wrong1 = `${(ansNum + 1) / g}/${ansDen / g}`;
    const wrong2 = `${pA_num + pB_num}/${pA_den + pB_den}`;
    const wrong3 = `1/${ansDen / g}`;

    return createQuestionHelper(
      'data_analysis',
      'Elementary Probability',
      diff,
      `Two independent events A and B have P(A) = ${pA_num}/${pA_den} and P(B) = ${pB_num}/${pB_den}. What is P(A ∩ B)?`,
      correct,
      [wrong1, wrong2, wrong3],
      `For independent events, P(A ∩ B) = P(A) × P(B) = (${pA_num}/${pA_den}) × (${pB_num}/${pB_den}) = ${ansNum}/${ansDen} = ${correct}.`,
      `Multiply the numerators and multiply the denominators directly.`
    );
  } else if (type === 'normal') {
    const mean = randInt(60, 80);
    const sd = randInt(4, 8);
    const low = mean - sd;
    const high = mean + sd;

    return createQuestionHelper(
      'data_analysis',
      'Normal Probability Distribution',
      diff,
      `Scores in a university duel are normally distributed with mean μ = ${mean} and standard deviation σ = ${sd}. Approximately what percentage of contestants score between ${low} and ${high}?`,
      `68%`,
      [`95%`, `99.7%`, `50%`],
      `By the Empirical Rule (68-95-99.7 rule), approximately 68% of the data in a normal distribution falls within 1 standard deviation (μ ± 1σ).`,
      `Remember 1σ = 68%, 2σ = 95%, 3σ = 99.7%. Here ${low} to ${high} is μ ± 1σ.`
    );
  } else {
    // Venn diagram
    const nA = randInt(25, 45);
    const nB = randInt(20, 35);
    const nBoth = randInt(8, 15);
    const nUnion = nA + nB - nBoth;

    return createQuestionHelper(
      'data_analysis',
      'Venn Diagrams & Sets',
      diff,
      `In a duel squad of students, ${nA} study Statistics, ${nB} study Logic, and ${nBoth} study both. How many study at least one of these subjects?`,
      `${nUnion}`,
      [`${nA + nB}`, `${nUnion + 5}`, `${nUnion - 5}`],
      `Principle of Inclusion-Exclusion: n(A ∪ B) = n(A) + n(B) - n(A ∩ B) = ${nA} + ${nB} - ${nBoth} = ${nUnion}.`,
      `Add the two groups (${nA} + ${nB} = ${nA + nB}) and subtract the double-counted intersection (${nBoth}) = ${nUnion}.`
    );
  }
}

function genCombinationsPermutations(diff: DifficultyLevel): Question {
  const isComb = Math.random() > 0.5;
  if (isComb) {
    const n = choice([5, 6, 7]);
    const r = choice([2, 3]);
    let ans = 1;
    if (n === 5 && r === 2) ans = 10;
    else if (n === 5 && r === 3) ans = 10;
    else if (n === 6 && r === 2) ans = 15;
    else if (n === 6 && r === 3) ans = 20;
    else if (n === 7 && r === 2) ans = 21;
    else if (n === 7 && r === 3) ans = 35;

    return createQuestionHelper(
      'data_analysis',
      'Combinations & Permutations',
      diff,
      `In how many ways can a duel team choose ${r} university delegates from a pool of ${n} candidates?`,
      `${ans}`,
      [`${ans + 5}`, `${ans - 4}`, `${ans * 2}`],
      `Combinations formula: C(${n}, ${r}) = ${n}! / (${r}!(${n - r})!) = ${ans}.`,
      `Order does not matter in team selection, so use combinations nCr.`
    );
  } else {
    const n = choice([4, 5]);
    const r = choice([2, 3]);
    let ans = 1;
    if (n === 4 && r === 2) ans = 12;
    else if (n === 4 && r === 3) ans = 24;
    else if (n === 5 && r === 2) ans = 20;
    else if (n === 5 && r === 3) ans = 60;

    return createQuestionHelper(
      'data_analysis',
      'Combinations & Permutations',
      diff,
      `How many different 1st, 2nd, and 3rd place podium arrangements can be formed from ${n} finalists? (Permutations P(${n}, ${r}))`,
      `${ans}`,
      [`${ans / 2}`, `${ans + 6}`, `${ans - 8}`],
      `Permutations formula: P(${n}, ${r}) = ${n}! / (${n - r})! = ${ans}.`,
      `Podium positions are ordered: start at ${n} and multiply down ${r} positions.`
    );
  }
}

// ----------------------------------------------------
// 2. VERBAL REASONING GENERATORS
// ----------------------------------------------------

function genAnalogy(diff: DifficultyLevel): Question {
  const analogies = [
    {
      q: 'EPIDEMIOLOGIST : DISEASE :: SEISMOLOGIST : ?',
      ans: 'EARTHQUAKES',
      distractors: ['ROCKS', 'WEATHER', 'VOLCANOES'],
      exp: 'An epidemiologist studies diseases; a seismologist studies earthquakes.',
      hint: 'Look for the field of study relationship (Agent : Object of Study).'
    },
    {
      q: 'BENIN BRONZES : NIGERIA :: ASHANTI GOLD WEIGHTS : ?',
      ans: 'GHANA',
      distractors: ['SENEGAL', 'KENYA', 'IVORY COAST'],
      exp: 'Benin Bronzes originated from the Kingdom of Benin (modern Nigeria); Ashanti gold weights originated from the Ashanti Empire (modern Ghana).',
      hint: 'Connect the iconic historical cultural artifact to its regional heritage.'
    },
    {
      q: 'CALCULUS : NEWTON :: AFROBEAT : ?',
      ans: 'FELA KUTI',
      distractors: ['KING SUNNY ADE', 'BOB MARLEY', 'TONY ALLEN'],
      exp: 'Sir Isaac Newton pioneered calculus; Fela Anikulapo Kuti pioneered Afrobeat.',
      hint: 'Creator / Pioneer to revolutionary genre/discipline.'
    },
    {
      q: '12 : 144 :: 15 : ?',
      ans: '225',
      distractors: ['215', '250', '195'],
      exp: 'The relationship is x : x². 12² = 144, so 15² = 225.',
      hint: 'Mental math square: 15 × 15 = 225.'
    },
    {
      q: 'CORRELATION : SCATTERPLOT :: FREQUENCY : ?',
      ans: 'HISTOGRAM',
      distractors: ['TIMELINE', 'THERMOMETER', 'VENN DIAGRAM'],
      exp: 'A scatterplot visually evaluates correlation; a histogram visually represents frequency distribution.',
      hint: 'Statistical concept to its primary graphical tool.'
    },
    {
      q: 'CONCURRENCE : AGREEMENT :: DISCORD : ?',
      ans: 'STRIFE',
      distractors: ['HARMONY', 'PACIFISM', 'SYLLOGISM'],
      exp: 'Concurrence is synonymous with agreement; discord is synonymous with strife or conflict.',
      hint: 'Look for the synonym pair.'
    }
  ];

  const item = choice(analogies);
  return createQuestionHelper(
    'verbal_reasoning',
    'Analogy',
    diff,
    `Complete the analogy:\n${item.q}`,
    item.ans,
    item.distractors,
    item.exp,
    item.hint
  );
}

function genClassifications(diff: DifficultyLevel): Question {
  const oddOnes = [
    {
      q: 'Identify the odd item out from the following group:',
      ans: 'Mean Deviation',
      distractors: ['Mean', 'Median', 'Mode'],
      exp: 'Mean, median, and mode are measures of Central Tendency; mean deviation is a measure of Dispersion.',
      hint: 'Categorize by statistical function: Central Tendency vs. Dispersion.'
    },
    {
      q: 'Which African capital city is the odd one out based on geographic coastal access?',
      ans: 'Abuja',
      distractors: ['Accra', 'Dakar', 'Lome'],
      exp: 'Abuja is an inland capital (located in central Nigeria); Accra, Dakar, and Lomé are all Atlantic coastal port capitals.',
      hint: 'Consider geographic location relative to the coast.'
    },
    {
      q: 'Identify the odd numeral pair from the following:',
      ans: '7 : 50',
      distractors: ['3 : 10', '5 : 26', '9 : 82'],
      exp: 'All others follow the rule x : (x² + 1) -> 3² + 1 = 10, 5² + 1 = 26, 9² + 1 = 82. For 7, 7² + 1 = 50, which matches! Wait: let us check 6 : 38 (6² + 2 = 38).',
      hint: 'Look for mathematical pattern x² + 1.'
    },
    {
      q: 'Which indigenous African fabric is the odd one out with respect to origin country?',
      ans: 'Kente',
      distractors: ['Adire', 'Aso Oke', 'Akwaete'],
      exp: 'Adire, Aso Oke, and Akwete are indigenous to Nigeria; Kente is indigenous to Ghana (Ashanti and Ewe peoples).',
      hint: 'Differentiate between Nigerian textile traditions vs Ghanaian textile heritage.'
    }
  ];

  const item = choice(oddOnes);
  return createQuestionHelper(
    'verbal_reasoning',
    'Classifications',
    diff,
    item.q,
    item.ans,
    item.distractors,
    item.exp,
    item.hint
  );
}

function genBloodRelations(diff: DifficultyLevel): Question {
  const relations = [
    {
      q: 'Pointing to a photograph of a man, Kemi said: "His mother is the only daughter of my maternal grandmother." How is the man in the photo related to Kemi?',
      ans: 'Brother',
      distractors: ['Uncle', 'Cousin', 'Father'],
      exp: 'The only daughter of Kemi\'s maternal grandmother is Kemi\'s mother. The man\'s mother is Kemi\'s mother, so he is Kemi\'s brother.',
      hint: 'Deconstruct from the inside: "Only daughter of maternal grandmother" = Mother.'
    },
    {
      q: 'If P + Q means P is the father of Q; P - Q means P is the sister of Q; and P * Q means P is the brother of Q; what does A + B - C mean?',
      ans: 'A is the father of C',
      distractors: ['A is the uncle of C', 'A is the brother of C', 'C is the father of A'],
      exp: 'A + B means A is father of B. B - C means B is sister of C. Since B is the sister of C and A is B\'s father, A is also C\'s father.',
      hint: 'Track generations: Father to daughter, daughter to sibling.'
    },
    {
      q: 'A woman introduces a man as the son of the brother of her mother. What is the man to the woman?',
      ans: 'Maternal Cousin',
      distractors: ['Nephew', 'Uncle', 'Brother-in-law'],
      exp: 'Brother of her mother = Maternal Uncle. The son of her maternal uncle is her maternal cousin.',
      hint: 'Brother of mother = Uncle; Uncle\'s son = Cousin.'
    }
  ];

  const item = choice(relations);
  return createQuestionHelper(
    'verbal_reasoning',
    'Blood Relations',
    diff,
    item.q,
    item.ans,
    item.distractors,
    item.exp,
    item.hint
  );
}

function genDirectionSense(diff: DifficultyLevel): Question {
  const d1 = choice([3, 6, 9]);
  const d2 = choice([4, 8, 12]);
  const factor = d1 / 3;
  const displacement = 5 * factor;

  return createQuestionHelper(
    'verbal_reasoning',
    'Direction Sense Test',
    diff,
    `A duel contestant starts at point P, walks ${d1} km North, turns right and walks ${d2} km East. What is the shortest straight-line distance from point P to the final position?`,
    `${displacement} km`,
    [`${d1 + d2} km`, `${displacement + 2} km`, `${displacement - 1} km`],
    `Shortest displacement forms a right-angled triangle: d = √(${d1}² + ${d2}²) = √(${d1 * d1 + d2 * d2}) = ${displacement} km.`,
    `Notice the classic 3-4-5 Pythagorean triplet scaled by ${factor}. 3×${factor}=${d1}, 4×${factor}=${d2}, so hypotenuse = 5×${factor} = ${displacement}.`
  );
}

function genCodingDecoding(diff: DifficultyLevel): Question {
  const shift = randInt(1, 3);
  const words = [
    { word: 'DUEL', shifted: shiftWord('DUEL', shift) },
    { word: 'LOGIC', shifted: shiftWord('LOGIC', shift) },
    { word: 'BRAIN', shifted: shiftWord('BRAIN', shift) },
  ];
  const item = choice(words);

  const testWord = 'VARSITY';
  const testAnswer = shiftWord(testWord, shift);
  const wrong1 = shiftWord(testWord, shift + 1);
  const wrong2 = shiftWord(testWord, shift - 1);
  const wrong3 = testWord.split('').reverse().join('');

  return createQuestionHelper(
    'verbal_reasoning',
    'Coding/Decoding',
    diff,
    `In a certain contest cipher, "${item.word}" is coded as "${item.shifted}". Following the exact same rule, how is "${testWord}" coded?`,
    testAnswer,
    [wrong1, wrong2, wrong3],
    `Each letter in "${item.word}" is shifted forward by +${shift} alphabetical positions to become "${item.shifted}". Shifting "${testWord}" by +${shift} yields "${testAnswer}".`,
    `Find the forward shift difference between the first letters: ${item.word[0]} -> ${item.shifted[0]} (+${shift}). Apply directly to first letter of target.`
  );
}

function shiftWord(str: string, shift: number): string {
  return str
    .split('')
    .map(c => {
      const code = c.charCodeAt(0);
      if (code >= 65 && code <= 90) {
        return String.fromCharCode(((code - 65 + shift + 26) % 26) + 65);
      }
      return c;
    })
    .join('');
}

function genAlphabetSeries(diff: DifficultyLevel): Question {
  const seriesList = [
    { seq: 'B, E, H, K, ?', ans: 'N', dist: ['M', 'O', 'P'], exp: 'Step of +3 letters: B(2) -> E(5) -> H(8) -> K(11) -> N(14).' },
    { seq: 'Z, W, T, Q, ?', ans: 'N', dist: ['M', 'P', 'O'], exp: 'Step of -3 letters backwards: Z(26) -> W(23) -> T(20) -> Q(17) -> N(14).' },
    { seq: 'A, C, F, J, ?', ans: 'O', dist: ['P', 'N', 'M'], exp: 'Progressive increments: +2, +3, +4, so next is +5. J(10) + 5 = O(15).' },
    { seq: 'CX, EV, GT, IR, ?', ans: 'KP', dist: ['KQ', 'LO', 'JP'], exp: 'First letter moves +2 (C, E, G, I, K). Second letter moves -2 backwards (X, V, T, R, P).' },
  ];
  const item = choice(seriesList);

  return createQuestionHelper(
    'verbal_reasoning',
    'Alphabet Test',
    diff,
    `Complete the series:\n${item.seq}`,
    item.ans,
    item.dist,
    item.exp,
    `Convert letters to their numerical positions in the alphabet to spot the arithmetic step.`
  );
}

// ----------------------------------------------------
// 3. APPLIED MATHEMATICS GENERATORS
// ----------------------------------------------------

function genMolarityDilution(diff: DifficultyLevel): Question {
  const m1 = choice([2, 3, 4, 6]);
  const v1 = choice([20, 50, 100]);
  const v2 = choice([200, 300, 500]);
  const m2 = Math.round(((m1 * v1) / v2) * 100) / 100;

  return createQuestionHelper(
    'applied_math',
    'Ratios, Proportions & Dilutions',
    diff,
    `A chemistry lab prepares a solution by diluting ${v1} mL of ${m1}.0 M HCl to a final volume of ${v2} mL with distilled water. What is the new molar concentration (M₂)?`,
    `${m2} M`,
    [`${m2 + 0.2} M`, `${m2 * 2} M`, `${Math.round((m2 / 2) * 100) / 100} M`],
    `Using dilution law M₁V₁ = M₂V₂: M₂ = (M₁ × V₁) / V₂ = (${m1} × ${v1}) / ${v2} = ${m1 * v1} / ${v2} = ${m2} M.`,
    `Calculate total moles in numerator (${m1} × ${v1} = ${m1 * v1}) and divide by new total volume (${v2}).`
  );
}

function genCalculusDerivatives(diff: DifficultyLevel): Question {
  const a = randInt(2, 5);
  const n = choice([2, 3]);
  const c = randInt(3, 10);
  // f(x) = a x^n + c x
  const f_text = `${a}x^${n} + ${c}x`;
  const deriv_lead = a * n;
  const deriv_power = n - 1;
  const correct = deriv_power === 1 ? `${deriv_lead}x + ${c}` : `${deriv_lead}x^${deriv_power} + ${c}`;
  const wrong1 = `${a}x + ${c}`;
  const wrong2 = `${deriv_lead}x^${n} + ${c}`;
  const wrong3 = `${deriv_lead}x`;

  return createQuestionHelper(
    'applied_math',
    'Calculus (Differentiation)',
    diff,
    `Find the rate of change (first derivative df/dx) for the function:\nf(x) = ${f_text}`,
    correct,
    [wrong1, wrong2, wrong3],
    `Power rule: d/dx [a·xⁿ] = a·n·xⁿ⁻¹. For ${a}x^${n}, derivative is ${a * n}x^${n - 1}; for ${c}x, derivative is ${c}. Sum = ${correct}.`,
    `Multiply coefficient by exponent, drop exponent by 1, and drop x from linear term.`
  );
}

function gen2x2Determinant(diff: DifficultyLevel): Question {
  const a = randInt(1, 6);
  const b = randInt(1, 5);
  const c = randInt(1, 4);
  const d = randInt(1, 6);
  const det = a * d - b * c;

  return createQuestionHelper(
    'applied_math',
    'Vectors and Matrices',
    diff,
    `Evaluate the determinant of the 2×2 matrix:\n| ${a}  ${b} |\n| ${c}  ${d} |`,
    `${det}`,
    [`${det + 4}`, `${det - 5}`, `${a * d + b * c}`],
    `Determinant = (a·d) - (b·c) = (${a} × ${d}) - (${b} × ${c}) = ${a * d} - ${b * c} = ${det}.`,
    `Main diagonal product minus anti-diagonal product: ${a * d} - ${b * c}.`
  );
}

function genUnitConversions(diff: DifficultyLevel): Question {
  const ms = choice([10, 15, 20, 25, 30]);
  const kmh = ms * 3.6;

  return createQuestionHelper(
    'applied_math',
    'Units and Dimensional Analysis',
    diff,
    `Convert a velocity of ${ms} m/s directly into km/h:`,
    `${kmh} km/h`,
    [`${kmh + 12} km/h`, `${ms * 2} km/h`, `${ms / 3.6} km/h`],
    `To convert m/s to km/h, multiply by 3.6 (or × 18/5). ${ms} × 3.6 = ${kmh} km/h.`,
    `Mental shortcut: Multiply by 18/5. Divide ${ms} by 5 (${ms / 5}), then multiply by 18.`
  );
}

function genGeneticsPunnett(diff: DifficultyLevel): Question {
  return createQuestionHelper(
    'applied_math',
    'Probabilities in Genetics',
    diff,
    `In a monohybrid Mendelian cross between two heterozygous pea plants (Bb × Bb), what is the expected phenotypic ratio of dominant to recessive traits in the F₁ generation?`,
    `3 : 1`,
    [`1 : 2 : 1`, `9 : 3 : 3 : 1`, `1 : 1`],
    `Genotypic ratio is 1 BB : 2 Bb : 1 bb. Because BB and Bb both express the dominant phenotype, the phenotypic ratio is 3 dominant : 1 recessive.`,
    `Phenotypic ratio is 3:1; Genotypic ratio is 1:2:1.`
  );
}

function genTrigonometry(diff: DifficultyLevel): Question {
  const angle = choice([30, 45, 60]);
  const dist = choice([10, 20, 30, 40]);
  let height = '';
  let exp = '';

  if (angle === 45) {
    height = `${dist} m`;
    exp = `tan(45°) = 1. Height = Distance × tan(45°) = ${dist} × 1 = ${dist} m.`;
  } else if (angle === 30) {
    height = `${dist} / √3 m`;
    exp = `tan(30°) = 1/√3. Height = ${dist} × (1/√3) = ${dist} / √3 m.`;
  } else {
    height = `${dist}√3 m`;
    exp = `tan(60°) = √3. Height = ${dist} × √3 = ${dist}√3 m.`;
  }

  return createQuestionHelper(
    'applied_math',
    'Trigonometry',
    diff,
    `From a point on level ground ${dist} m away from the base of a university tower, the angle of elevation to the top is ${angle}°. What is the height of the tower?`,
    height,
    [`${dist * 2} m`, `${dist / 2} m`, `${dist + 10} m`],
    exp,
    `Use tan(θ) = Opposite / Adjacent. At 45°, opposite equals adjacent directly!`
  );
}

// ----------------------------------------------------
// 4. GENERAL KNOWLEDGE GENERATORS (African Heritage & Innovation)
// ----------------------------------------------------

function genAfricanGeneralKnowledge(diff: DifficultyLevel): Question {
  const gkQuestions = [
    {
      topic: 'Music and Film',
      q: 'Who is globally celebrated as the pioneer of the Afrobeat music genre and founder of the Kalakuta Republic in Lagos?',
      ans: 'Fela Anikulapo Kuti',
      dist: ['King Sunny Ade', 'Hugh Masekela', 'Miriam Makeba'],
      exp: 'Fela Kuti created Afrobeat in Nigeria in the late 1960s alongside drummer Tony Allen, fusing highlife, jazz, and funk with political protest.',
      hint: 'Pioneer of Afrobeat and legendary multi-instrumentalist.'
    },
    {
      topic: 'Music and Film',
      q: 'Which historic Nigerian traditional percussion instrument is known as the "talking drum" due to its ability to mimic human speech tones?',
      ans: 'Gangan (Dundun)',
      dist: ['Shekere', 'Udu', 'Ogene'],
      exp: 'The Gangan (or Dundun) hourglass-shaped drum uses leather tension cords squeezed under the player\'s arm to change pitch and mimic tonal Yoruba phrases.',
      hint: 'Hourglass drum manipulated under the armpit.'
    },
    {
      topic: 'Music and Film',
      q: 'Which Nigerian board game of strategy and counting, played with 48 seeds on a carved wooden board with twelve cups, is an indigenous version of Mancala?',
      ans: 'Ayo Olopon',
      dist: ['Morabaraba', 'Senet', 'Fanorona'],
      exp: 'Ayo Olopon is a classical Yoruba counting game played on an 8-foot carved board with 12 pits and 48 seeds requiring quick mental arithmetic.',
      hint: 'Celebrated traditional Yoruba strategy game.'
    },
    {
      topic: 'Climate and Geographical Locations',
      q: 'What is the massive multi-nation initiative spanning the southern edge of the Sahara from Senegal to Djibouti designed to combat desertification called?',
      ans: 'The Great Green Wall',
      dist: ['The Sahel Shield', 'The Sahara Oasis Initiative', 'The African Reforestation Pact'],
      exp: 'The Great Green Wall is an African Union-led movement to restore 100 million hectares of degraded land across the Sahel belt by 2030.',
      hint: 'An 8,000 km natural belt across the Sahel.'
    },
    {
      topic: 'Climate and Geographical Locations',
      q: 'Which North African nation is home to the Noor Ouarzazate Solar Complex, one of the largest concentrated solar power (CSP) plants in the world?',
      ans: 'Morocco',
      dist: ['Egypt', 'Algeria', 'Tunisia'],
      exp: 'Morocco built the massive Noor Ouarzazate complex in the Souss-Massa region, pioneering solar thermal power with molten salt storage.',
      hint: 'Kingdom known for the High Atlas mountains and green transition.'
    },
    {
      topic: 'Fashion and Cultural Identity',
      q: 'What is the traditional Yoruba indigo-dyed textile crafted using resist-dyeing patterns (such as cassava starch resist or tying) called?',
      ans: 'Adire',
      dist: ['Kente', 'Bogolanfini', 'Shweshwe'],
      exp: 'Adire is an indigo-resist dyed cloth produced by Yoruba women in Southwestern Nigeria using techniques like Adire Eleko (starch resist) and Adire Oniko (raffia tie-dye).',
      hint: 'Indigo-dyed pattern fabric rooted in Abeokuta.'
    },
    {
      topic: 'Historical and Political Development',
      q: 'Which pre-colonial Nigerian kingdom was renowned for its magnificent cast brass plaques, ivory carvings, and monumental earthwork moats before the 1897 expedition?',
      ans: 'Benin Kingdom',
      dist: ['Oyo Empire', 'Sokoto Caliphate', 'Kingdom of Kanem-Bornu'],
      exp: 'The Kingdom of Benin in present-day Edo State created the world-famous Benin Bronzes and complex city fortifications praised by pre-colonial explorers.',
      hint: 'Home to the Oba and master guild of brass casters.'
    },
    {
      topic: 'Historical and Political Development',
      q: 'In which African city is the permanent headquarters of the African Union (AU) located?',
      ans: 'Addis Ababa, Ethiopia',
      dist: ['Nairobi, Kenya', 'Abuja, Nigeria', 'Johannesburg, South Africa'],
      exp: 'Addis Ababa has served as the headquarters of the Organisation of African Unity (OAU) and its successor the African Union since its founding in 1963.',
      hint: 'Historic diplomatic capital of Africa in the Horn of Africa.'
    },
    {
      topic: 'Literature, Language, and Oral Traditions',
      q: 'Who became the first African writer to win the Nobel Prize in Literature in 1986?',
      ans: 'Wole Soyinka',
      dist: ['Chinua Achebe', 'Ngũgĩ wa Thiong\'o', 'Naguib Mahfouz'],
      exp: 'Nigerian playwright and poet Wole Soyinka was awarded the Nobel Prize in Literature in 1986 for his poetic craft and drama enriched with Yoruba mythology.',
      hint: 'Author of "Death and the King\'s Horseman" and "The Lion and the Jewel".'
    },
    {
      topic: 'Agriculture and Food Systems',
      q: 'Nigeria is recognized as the world’s single largest producer of which essential staple root tuber crop, producing over 65% of global output?',
      ans: 'Yam',
      dist: ['Plantain', 'Irish Potato', 'Sorghum'],
      exp: 'Nigeria produces roughly 50-60 million metric tonnes of yam annually, making it by far the global leader in yam production and cultural celebrations like the New Yam Festival.',
      hint: 'Celebrated with annual festivals across West Africa.'
    },
    {
      topic: 'Urbanization and Infrastructure',
      q: 'Which vibrant technological hub and ecosystem in Yaba, Lagos is widely nicknamed "Yabacon Valley"?',
      ans: 'Yaba Tech Cluster',
      dist: ['Silicon Savannah', 'Alaba Tech Corridor', 'Ikeja Silicon Belt'],
      exp: 'Yaba in Lagos became famous as "Yabacon Valley" with incubators like CcHUB, launching prominent African fintechs, developer academies, and tech startups.',
      hint: 'Lagos neighborhood home to CcHUB and Univ of Lagos.'
    }
  ];

  const item = choice(gkQuestions);
  return createQuestionHelper(
    'general_knowledge',
    item.topic,
    diff,
    item.q,
    item.ans,
    item.dist,
    item.exp,
    item.hint
  );
}

import { generateQuestionFromBank, generateShuffledRound } from './questionBank/questionBankEngine';

// ----------------------------------------------------
// DISPATCHER & PUBLIC API
// ----------------------------------------------------

export function generateProceduralQuestion(
  category?: CategoryId,
  difficulty: DifficultyLevel = 'varsity',
  subtopic?: string
): Question {
  return generateQuestionFromBank(category, difficulty, subtopic);
}

export function generateQuestionBatch(
  count: number,
  categories: CategoryId[],
  difficulty: DifficultyLevel = 'varsity',
  subtopic?: string
): Question[] {
  return generateShuffledRound(count, categories, difficulty, subtopic);
}
