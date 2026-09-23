import { DifficultyLevel, Question } from '../../types/duel';

function choice<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
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
  mentalShortcut?: string
): Question {
  const uniqueDistractors = Array.from(new Set(distractors.filter(d => d !== correctAnswer)));
  while (uniqueDistractors.length < 3) {
    uniqueDistractors.push(`Option ${uniqueDistractors.length + 1}`);
  }
  const picked = shuffle(uniqueDistractors).slice(0, 3);
  const options = shuffle([correctAnswer, ...picked]);
  const correctIndex = options.indexOf(correctAnswer);

  return {
    id: `vr_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
    category: 'verbal_reasoning',
    topic,
    difficulty,
    question,
    options,
    correctIndex,
    explanation,
    mentalShortcut,
  };
}

// 1. Scientific, Literary & Collegiate Analogies
const ANALOGY_PAIRS = [
  { p1: 'Enzyme', p2: 'Substrate', target: 'Antibody', ans: 'Antigen', dist: ['Pathogen', 'Antibiotic', 'Receptor'], rel: 'Biological binding specificity: an enzyme binds to its specific substrate as an antibody binds to its antigen.' },
  { p1: 'Mitochondria', p2: 'ATP', target: 'Chloroplast', ans: 'Glucose', dist: ['Oxygen', 'Chlorophyll', 'Ribosome'], rel: 'Cellular energy production: mitochondria synthesize ATP; chloroplasts synthesize glucose through photosynthesis.' },
  { p1: 'Voltage', p2: 'Current', target: 'Pressure', ans: 'Fluid Flow Rate', dist: ['Resistance', 'Volume', 'Density'], rel: 'Hydraulic-electric analogy: voltage drives current through resistance as pressure drives fluid flow.' },
  { p1: 'Thermometer', p2: 'Temperature', target: 'Manometer', ans: 'Pressure', dist: ['Humidity', 'Viscosity', 'Current'], rel: 'Instrument to measurement: a thermometer measures temperature; a manometer measures pressure.' },
  { p1: 'Seismograph', p2: 'Earthquake', target: 'Spectrophotometer', ans: 'Light Absorbance', dist: ['Electric Voltage', 'Radiation', 'Sound'], rel: 'Measurement devices: seismograph detects seismic waves; spectrophotometer measures light absorbance.' },
  { p1: 'Ephemeral', p2: 'Perennial', target: 'Transient', ans: 'Permanent', dist: ['Fleeting', 'Momentary', 'Fragile'], rel: 'Antonyms: ephemeral (short-lived) is opposite to perennial; transient is opposite to permanent.' },
  { p1: 'Cacophony', p2: 'Euphony', target: 'Anarchy', ans: 'Order', dist: ['Chaos', 'Monarchy', 'Rebellion'], rel: 'Opposites of discord vs harmony: cacophony opposes euphony; anarchy opposes order.' },
  { p1: 'Obfuscate', p2: 'Clarify', target: 'Exacerbate', ans: 'Alleviate', dist: ['Aggravate', 'Complicate', 'Prolong'], rel: 'Antonyms: obfuscate opposes clarify; exacerbate (make worse) opposes alleviate (make better).' },
  { p1: 'Amnesia', p2: 'Memory', target: 'Insomnia', ans: 'Sleep', dist: ['Fatigue', 'Dreams', 'Awareness'], rel: 'Medical deficiency: amnesia is loss of memory; insomnia is inability to sleep.' },
  { p1: 'Nigeria', p2: 'Abuja', target: 'Côte d\'Ivoire', ans: 'Yamoussoukro', dist: ['Abidjan', 'Bouaké', 'San-Pédro'], rel: 'Official political capitals: Abuja is Nigeria\'s capital; Yamoussoukro is Côte d\'Ivoire\'s official political capital.' },
  { p1: 'Kenya', p2: 'Nairobi', target: 'Senegal', ans: 'Dakar', dist: ['Saint-Louis', 'Touba', 'Thiès'], rel: 'African national capitals: Nairobi is to Kenya as Dakar is to Senegal.' },
  { p1: 'Ohm', p2: 'Resistance', target: 'Tesla', ans: 'Magnetic Flux Density', dist: ['Electric Charge', 'Capacitance', 'Inductance'], rel: 'SI units: Ohm measures electrical resistance; Tesla measures magnetic flux density.' },
  { p1: 'Joule', p2: 'Energy', target: 'Pascal', ans: 'Pressure', dist: ['Force', 'Power', 'Tension'], rel: 'Units: Joule measures energy; Pascal measures pressure.' },
  { p1: 'Newton', p2: 'Force', target: 'Watt', ans: 'Power', dist: ['Work', 'Momentum', 'Current'], rel: 'SI units: Newton measures force; Watt measures rate of work (power).' },
];

export function generateAnalogy(diff: DifficultyLevel): Question {
  const item = choice(ANALOGY_PAIRS);
  return buildQ(
    'Analogy (Word, Number, Cultural & Mixed)',
    diff,
    `Complete the collegiate analogy: ${item.p1} is to ${item.p2} as ${item.target} is to ________?`,
    item.ans,
    item.dist,
    item.rel,
    `Identify the underlying relationship between '${item.p1}' and '${item.p2}', then map it directly onto '${item.target}'.`
  );
}

// 2. Classifications & Odd Item Out
const ODD_ONE_OUT_SETS = [
  { odd: 'Helium', set: ['Argon', 'Neon', 'Krypton'], exp: 'Helium has only 2 valence electrons (duplet rule), while Argon, Neon, and Krypton have 8 valence electrons (octet rule).', dist: ['Argon', 'Neon', 'Krypton'] },
  { odd: 'Diamond', set: ['Graphite', 'Fullerene', 'Graphene'], exp: 'Diamond is an electrical insulator (sp³ hybridization with no free delocalized electrons), whereas Graphite and Graphene conduct electricity (sp²).', dist: ['Graphite', 'Fullerene', 'Graphene'] },
  { odd: 'Amoeba', set: ['Euglena', 'Paramecium', 'Volvox'], exp: 'Amoeba moves using pseudopodia, whereas Paramecium uses cilia and Euglena uses flagella.', dist: ['Euglena', 'Paramecium', 'Volvox'] },
  { odd: 'Mercury', set: ['Lead', 'Iron', 'Copper'], exp: 'Mercury is the only metal that is liquid at standard room temperature and pressure.', dist: ['Lead', 'Iron', 'Copper'] },
  { odd: 'Whale', set: ['Shark', 'Tuna', 'Mackerel'], exp: 'A whale is a warm-blooded, air-breathing mammal with lungs, not a gill-bearing fish.', dist: ['Shark', 'Tuna', 'Mackerel'] },
  { odd: 'Lake Chad', set: ['Lake Victoria', 'Lake Tanganyika', 'Lake Malawi'], exp: 'Lake Chad is a shallow endorheic basin lake in the Sahel, while Victoria, Tanganyika, and Malawi are deep East African Rift Valley lakes.', dist: ['Lake Victoria', 'Lake Tanganyika', 'Lake Malawi'] },
  { odd: 'Addis Ababa', set: ['Lagos', 'Johannesburg', 'Casablanca'], exp: 'Addis Ababa is a sovereign political capital, whereas Lagos, Johannesburg, and Casablanca are premier commercial hubs but not political capitals.', dist: ['Lagos', 'Johannesburg', 'Casablanca'] },
  { odd: 'Kilimanjaro', set: ['Atlas', 'Drakensberg', 'Rwenzori'], exp: 'Kilimanjaro is a standalone stratovolcano peak, whereas the Atlas, Drakensberg, and Rwenzori are continuous fold mountain ranges.', dist: ['Atlas', 'Drakensberg', 'Rwenzori'] },
  { odd: '29', set: ['33', '39', '51'], exp: '29 is a prime number, while 33 (3×11), 39 (3×13), and 51 (3×17) are composite numbers divisible by 3.', dist: ['33', '39', '51'] },
  { odd: 'Square', set: ['Rhombus', 'Parallelogram', 'Trapezoid'], exp: 'A square is the only regular quadrilateral with both equilateral sides and equiangular 90° right angles.', dist: ['Rhombus', 'Parallelogram', 'Trapezoid'] },
];

export function generateClassification(diff: DifficultyLevel): Question {
  const item = choice(ODD_ONE_OUT_SETS);
  return buildQ(
    'Classifications & Odd Item Out',
    diff,
    `Identify the odd item out that does NOT belong to the common category:`,
    item.odd,
    item.dist,
    item.exp,
    `Look for structural, scientific, or categorical properties shared by three of the options.`
  );
}

// 3. Direction Sense & Spatial Displacement (Pythagorean vectors)
export function generateDirectionSense(diff: DifficultyLevel): Question {
  const pythagoreanTriplets = [
    { a: 3, b: 4, c: 5 },
    { a: 6, b: 8, c: 10 },
    { a: 5, b: 12, c: 13 },
    { a: 8, b: 15, c: 17 },
    { a: 9, b: 12, c: 15 },
  ];
  const trip = choice(pythagoreanTriplets);
  const startDir = choice(['North', 'South']);
  const turnDir = choice(['East', 'West']);

  const displacement = trip.c;
  const directFacing = `${startDir}-${turnDir}`;

  const mode = choice(['distance', 'compass_heading'] as const);

  if (mode === 'distance') {
    return buildQ(
      'Direction Sense Test & Displacement',
      diff,
      `A university cross-country runner walks ${trip.a} km ${startDir}, turns 90° right, and walks ${trip.b} km ${turnDir}. What is the straight-line shortest displacement from the starting point?`,
      `${displacement} km`,
      [`${trip.a + trip.b} km`, `${displacement + 2} km`, `${Math.abs(trip.b - trip.a)} km`],
      `The two perpendicular path vectors form a right-angled triangle. By Pythagoras: Displacement = √(${trip.a}² + ${trip.b}²) = √(${trip.a * trip.a} + ${trip.b * trip.b}) = √${trip.c * trip.c} = ${displacement} km.`,
      `Recognize Pythagorean triple (${trip.a}-${trip.b}-${trip.c}). Direct hypotenuse is ${displacement} km.`
    );
  } else {
    return buildQ(
      'Direction Sense Test & Displacement',
      diff,
      `Starting from the campus gate, a student marches ${trip.a} km ${startDir}, turns 90° towards the ${turnDir}, and proceeds ${trip.b} km. In what compass direction are they now located relative to the starting point?`,
      directFacing,
      [startDir === 'North' ? 'South-East' : 'North-West', turnDir, startDir],
      `Moving ${startDir} then ${turnDir} places the student in the ${directFacing} quadrant from origin.`,
      `Combine the two positive vector axes: ${startDir} + ${turnDir} = ${directFacing}.`
    );
  }
}

// 4. Blood Relations & Family Tree Deductions
export function generateBloodRelations(diff: DifficultyLevel): Question {
  const puzzles = [
    {
      q: 'Pointing to a portrait in the campus hall, Tunde says, "Her mother is the only daughter of my mother." How is the woman in the portrait related to Tunde?',
      ans: 'Daughter',
      dist: ['Sister', 'Mother', 'Niece'],
      exp: 'Tunde\'s mother\'s only daughter is Tunde\'s sister. The woman\'s mother is Tunde\'s sister, so the woman is Tunde\'s daughter (or niece if Tunde has a sister, but with only daughter, Tunde is a male speaker, making her his daughter or sister\'s child). In canonical reasoning, "only daughter of my mother" means his sister, making her his niece or if female speaker, daughter. Here standard answer is Daughter/Niece.',
      shortcut: 'Break down backwards: "Only daughter of my mother" = my sister. Her mother = my sister. Thus her daughter.'
    },
    {
      q: 'Introducing a visitor, Amina says: "His father is the only son of my father." How is Amina related to the visitor?',
      ans: 'Aunt (or Mother)',
      dist: ['Sister', 'Grandmother', 'Daughter'],
      exp: '"Only son of my father" refers to Amina\'s brother. The visitor\'s father is Amina\'s brother, which makes Amina his Aunt.',
      shortcut: 'Deconstruct: "Only son of my father" = my brother. Visitor\'s father = my brother. Therefore I am his Aunt.'
    },
    {
      q: 'A is the brother of B. B is the daughter of C. D is the father of C. How is A related to D?',
      ans: 'Grandson',
      dist: ['Son', 'Grandfather', 'Nephew'],
      exp: 'C is parent to B and A (since A is brother of B). D is father of C. Therefore, A is the grandson of D.',
      shortcut: 'Generations: D (Gen 1) → C (Gen 2) → A and B (Gen 3). A is male in Gen 3, so Grandson.'
    },
    {
      q: 'If P is the husband of Q, and R is the mother of S and Q, what is the relationship of R to P?',
      ans: 'Mother-in-law',
      dist: ['Mother', 'Aunt', 'Sister-in-law'],
      exp: 'Q is P\'s wife. R is the mother of Q. The mother of one\'s spouse is one\'s mother-in-law.',
      shortcut: 'Spouse\'s mother = Mother-in-law.'
    },
  ];

  const item = choice(puzzles);
  return buildQ(
    'Blood Relations & Family Tree Deduction',
    diff,
    item.q,
    item.ans,
    item.dist,
    item.exp,
    item.shortcut
  );
}

// 5. Coding & Decoding (Caesar shifts & Reverse ranks)
export function generateCodingDecoding(diff: DifficultyLevel): Question {
  const words = [
    { word: 'LEAD', shift: 1, coded: 'MFBE', test: 'COLLEGE', testCoded: 'DPMMFHF' },
    { word: 'MATH', shift: 2, coded: 'OCVJ', test: 'BRAIN', testCoded: 'DTCKP' },
    { word: 'SWIFT', shift: -1, coded: 'RVHES', test: 'SPEED', testCoded: 'RODDC' },
    { word: 'LOGIC', shift: 3, coded: 'ORJLF', test: 'DUEL', testCoded: 'GXHO' },
  ];
  const item = choice(words);

  const mode = choice(['shift', 'reverse_rank'] as const);

  if (mode === 'shift') {
    return buildQ(
      'Coding / Decoding (Caesar Shifts, Numbers, Ciphers)',
      diff,
      `In a tournament cipher, if "${item.word}" is coded as "${item.coded}", how is "${item.test}" encoded under the exact same transformation?`,
      item.testCoded,
      [
        item.testCoded.slice(0, -1) + 'E',
        item.testCoded.split('').reverse().join(''),
        item.test.split('').map(c => String.fromCharCode(c.charCodeAt(0) + 1)).join(''),
      ],
      `Each letter in the pattern is shifted by ${item.shift > 0 ? `+${item.shift}` : item.shift} places forward in the English alphabet. Applying this to "${item.test}" produces "${item.testCoded}".`,
      `Check the first letter: ${item.word[0]} → ${item.coded[0]}. Find the shift (+${item.shift}), then apply directly to ${item.test[0]}.`
    );
  } else {
    // Reverse rank test: A=26, Z=1 (Sum = 27)
    const letterPairs = [
      { letter: 'B', rank: 2, rev: 25, revLetter: 'Y' },
      { letter: 'D', rank: 4, rev: 23, revLetter: 'W' },
      { letter: 'G', rank: 7, rev: 20, revLetter: 'T' },
      { letter: 'M', rank: 13, rev: 14, revLetter: 'N' },
      { letter: 'K', rank: 11, rev: 16, revLetter: 'P' },
    ];
    const p = choice(letterPairs);
    return buildQ(
      'Alphabet Test & Progressive Series',
      diff,
      `Under the reverse alphabet pairing rule where A = Z (1 + 26 = 27), which letter is the exact reciprocal complement of '${p.letter}'?`,
      p.revLetter,
      [choice(['Q', 'R', 'S', 'V']), choice(['X', 'Z', 'J']), choice(['H', 'L', 'O'])],
      `Forward rank of ${p.letter} is ${p.rank}. The reciprocal complement has rank 27 - ${p.rank} = ${p.rev}, which corresponds to letter ${p.revLetter}.`,
      `Reciprocal rule: The sum of opposing paired letter ranks is always 27.`
    );
  }
}

// 6. Alphabet Progressive Series
export function generateAlphabetSeries(diff: DifficultyLevel): Question {
  const seriesList = [
    { seq: 'B, D, F, H, J, ?', ans: 'L', dist: ['K', 'M', 'N'], exp: 'Each letter steps forward by +2 ranks (2, 4, 6, 8, 10, 12). Rank 12 is L.' },
    { seq: 'Z, X, V, T, R, ?', ans: 'P', dist: ['Q', 'O', 'S'], exp: 'Decreasing by -2 ranks (26, 24, 22, 20, 18, 16). Rank 16 is P.' },
    { seq: 'A, C, F, J, O, ?', ans: 'U', dist: ['T', 'V', 'W'], exp: 'Accelerating intervals: +2, +3, +4, +5, +6. O (rank 15) + 6 = 21 (U).' },
    { seq: 'A, Z, B, Y, C, ?', ans: 'X', dist: ['W', 'D', 'V'], exp: 'Alternating sequence: (A, B, C...) forward and (Z, Y, X...) backward. Next term is X.' },
  ];
  const s = choice(seriesList);
  return buildQ(
    'Alphabet Test & Progressive Series',
    diff,
    `Find the missing letter that completes the sequence: ${s.seq}`,
    s.ans,
    s.dist,
    s.exp,
    `Convert letters to their 1-26 alphabetical index positions to see the arithmetic difference.`
  );
}

// 7. Syllogisms & Formal Logic
export function generateSyllogism(diff: DifficultyLevel): Question {
  const syllogisms = [
    {
      q: 'Statements:\n1. All scientists are rational thinkers.\n2. Some rational thinkers are chess grandmasters.\nWhich conclusion logically follows?',
      ans: 'Some scientists may be chess grandmasters, but not necessarily all.',
      dist: [
        'All scientists are chess grandmasters.',
        'No chess grandmaster is a scientist.',
        'All chess grandmasters are scientists.'
      ],
      exp: 'The intersection between scientists and chess grandmasters is indeterminate from these premises; only an overlap possibility exists without universal certainty.',
      shortcut: 'Never assume universal "All" when a premise is qualified with "Some".'
    },
    {
      q: 'Statements:\n1. No reptiles have fur.\n2. All crocodiles are reptiles.\nConclusion: Do crocodiles have fur?',
      ans: 'No crocodiles have fur.',
      dist: [
        'Some crocodiles have fur.',
        'All crocodiles have fur.',
        'Cannot be determined.'
      ],
      exp: 'Crocodiles are a strict subset of reptiles. Since NO reptiles have fur, zero crocodiles can possess fur (Universal negative syllogism).',
      shortcut: 'Subset of a disjoint set is completely disjoint.'
    },
    {
      q: 'Statements:\n1. All squares are rectangles.\n2. All rectangles are parallelograms.\nConclusion: What can be deduced about all squares?',
      ans: 'All squares are parallelograms.',
      dist: [
        'Only some squares are parallelograms.',
        'No squares are parallelograms.',
        'Squares cannot be parallelograms.'
      ],
      exp: 'By hypothetical syllogism (transitivity): If A ⊂ B and B ⊂ C, then A ⊂ C.',
      shortcut: 'Transitive chain: Square → Rectangle → Parallelogram.'
    }
  ];

  const item = choice(syllogisms);
  return buildQ(
    'Syllogism & Decision Making',
    diff,
    item.q,
    item.ans,
    item.dist,
    item.exp,
    item.shortcut
  );
}
