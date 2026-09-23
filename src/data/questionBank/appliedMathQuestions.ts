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
    uniqueDistractors.push(`Value ${uniqueDistractors.length + 1}`);
  }
  const picked = shuffle(uniqueDistractors).slice(0, 3);
  const options = shuffle([correctAnswer, ...picked]);
  const correctIndex = options.indexOf(correctAnswer);

  return {
    id: `am_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
    category: 'applied_math',
    topic,
    difficulty,
    question,
    options,
    correctIndex,
    explanation,
    mentalShortcut,
  };
}

// 1. Solution Dilutions & Molarity (C1V1 = C2V2)
export function generateDilutions(diff: DifficultyLevel): Question {
  const c1 = choice([2, 4, 5, 6, 8, 10]);
  const factor = choice([2, 3, 4, 5]);
  const c2 = c1 / factor;
  const v2 = choice([100, 200, 250, 400, 500, 600]);
  const v1 = Math.round(v2 / factor);

  return buildQ(
    'Ratios, Proportions & Chemical Dilutions (M1V1 = M2V2)',
    diff,
    `How many mL of ${c1} M stock HCl solution are required to prepare ${v2} mL of ${c2} M dilute solution?`,
    `${v1} mL`,
    [`${v1 + 20} mL`, `${v1 * 2} mL`, `${Math.round(v1 / 2)} mL`],
    `Using dilution conservation: C₁V₁ = C₂V₂. V₁ = (C₂ × V₂) / C₁ = (${c2} × ${v2}) / ${c1} = ${v1} mL.`,
    `Dilution factor shortcut: The concentration decreases by a factor of ${factor} (${c1} → ${c2}), so stock volume must be 1/${factor} of final volume (${v2} / ${factor} = ${v1} mL).`
  );
}

// 2. Calculus Derivatives, Stationary Points & Kinematics
export function generateCalculus(diff: DifficultyLevel): Question {
  const type = choice(['derivative', 'stationary_point', 'velocity'] as const);

  if (type === 'derivative') {
    const a = choice([2, 3, 4, 5, 6]);
    const n = choice([2, 3, 4]);
    const xVal = choice([1, 2, 3]);
    const coeff = a * n;
    const power = n - 1;
    const evaluated = coeff * Math.pow(xVal, power);

    return buildQ(
      'Calculus (Rates of Change, Derivatives & Maxima)',
      diff,
      `If f(x) = ${a}x^${n} + 7x - 4, what is the value of the first derivative f'(${xVal})?`,
      `${evaluated + 7}`,
      [`${evaluated}`, `${evaluated + 14}`, `${coeff * xVal}`],
      `Differentiate term by term: f'(x) = d/dx(${a}x^${n}) + 7 = ${coeff}x^${power} + 7. Substituting x = ${xVal}: ${coeff}(${xVal}^${power}) + 7 = ${evaluated + 7}.`,
      `Power rule: Multiply exponent by coefficient (${a} × ${n} = ${coeff}), decrease exponent by 1, and add the linear constant (+7).`
    );
  } else if (type === 'stationary_point') {
    // f(x) = ax^2 - bx -> f'(x) = 2ax - b = 0 -> x = b / 2a
    const a = choice([1, 2, 3]);
    const root = choice([2, 3, 4, 5]);
    const b = 2 * a * root;

    return buildQ(
      'Calculus (Rates of Change, Derivatives & Maxima)',
      diff,
      `At what x-value does the parabola function f(x) = ${a > 1 ? `${a}x²` : 'x²'} - ${b}x + 12 reach its critical stationary point (minimum)?`,
      `${root}`,
      [`${root + 2}`, `${root * 2}`, `${b}`],
      `Set the derivative to zero: f'(x) = ${2 * a}x - ${b} = 0 ⟹ x = ${b} / ${2 * a} = ${root}.`,
      `Vertex formula: x = -b / (2a) = ${b} / ${2 * a} = ${root}.`
    );
  } else {
    // Kinematics: s(t) = ut + 0.5at^2 -> v(t) = u + at
    const u = choice([5, 10, 15, 20]);
    const a = choice([2, 3, 4, 5, 6]);
    const t = choice([2, 3, 4]);
    const v = u + a * t;

    return buildQ(
      'Calculus (Rates of Change, Derivatives & Maxima)',
      diff,
      `A vehicle's displacement is given by s(t) = ${u}t + ${a / 2}t² (meters). What is its instantaneous velocity v(t) at time t = ${t} seconds?`,
      `${v} m/s`,
      [`${v + a} m/s`, `${u * t} m/s`, `${v - 4} m/s`],
      `Velocity is the time derivative of displacement: v(t) = ds/dt = ${u} + ${a}t. At t = ${t} s: v(${t}) = ${u} + ${a}(${t}) = ${v} m/s.`,
      `v = u + at directly: ${u} + (${a} × ${t}) = ${v} m/s.`
    );
  }
}

// 3. Vectors & 2x2 Matrix Determinants
export function generateVectorsMatrices(diff: DifficultyLevel): Question {
  const type = choice(['determinant', 'dot_product', 'vector_magnitude'] as const);

  if (type === 'determinant') {
    const a = randInt(2, 7);
    const d = randInt(2, 7);
    const b = randInt(1, 5);
    const c = randInt(1, 5);
    const det = a * d - b * c;

    return buildQ(
      'Vectors and 2x2 Matrices (Determinants & Dot Products)',
      diff,
      `Calculate the determinant of the 2×2 matrix: | [${a}, ${b}], [${c}, ${d}] |`,
      `${det}`,
      [`${det + 4}`, `${a * d + b * c}`, `${det - 5}`],
      `Determinant formula: det(M) = ad - bc = (${a} × ${d}) - (${b} × ${c}) = ${a * d} - ${b * c} = ${det}.`,
      `Cross-multiply: Main diagonal (${a} × ${d} = ${a * d}) minus off diagonal (${b} × ${c} = ${b * c}) = ${det}.`
    );
  } else if (type === 'dot_product') {
    const u1 = randInt(-3, 6);
    const u2 = randInt(1, 6);
    const v1 = randInt(1, 6);
    const v2 = randInt(-3, 6);
    const dot = u1 * v1 + u2 * v2;

    return buildQ(
      'Vectors and 2x2 Matrices (Determinants & Dot Products)',
      diff,
      `Find the scalar dot product of vectors u = (${u1}, ${u2}) and v = (${v1}, ${v2}).`,
      `${dot}`,
      [`${dot + 5}`, `${u1 * v2 + u2 * v1}`, `${dot - 3}`],
      `Dot product u · v = (u₁ × v₁) + (u₂ × v₂) = (${u1} × ${v1}) + (${u2} × ${v2}) = ${u1 * v1} + ${u2 * v2} = ${dot}.`,
      `Multiply matching coordinate components and add: (${u1 * v1}) + (${u2 * v2}) = ${dot}.`
    );
  } else {
    // Magnitude of a 3-4-5 or 5-12-13 vector
    const triplets = [
      { x: 3, y: 4, mag: 5 },
      { x: 6, y: 8, mag: 10 },
      { x: 5, y: 12, mag: 13 },
      { x: 8, y: 15, mag: 17 },
    ];
    const item = choice(triplets);
    return buildQ(
      'Vectors and 2x2 Matrices (Determinants & Dot Products)',
      diff,
      `What is the magnitude (Euclidean length) of vector v = ${item.x}i + ${item.y}j?`,
      `${item.mag}`,
      [`${item.x + item.y}`, `${item.mag + 2}`, `${Math.abs(item.y - item.x)}`],
      `Magnitude ||v|| = √(x² + y²) = √(${item.x}² + ${item.y}²) = √(${item.x * item.x + item.y * item.y}) = ${item.mag}.`,
      `Standard right-triangle hypotenuse: ${item.x}-${item.y}-${item.mag}.`
    );
  }
}

// 4. Units & Dimensional Analysis
export function generateUnitConversions(diff: DifficultyLevel): Question {
  const kmhValues = [36, 54, 72, 90, 108, 126, 144];
  const speedKmh = choice(kmhValues);
  const speedMs = (speedKmh * 1000) / 3600; // speedKmh / 3.6

  const mode = choice(['kmh_to_ms', 'density_si', 'volume_liters'] as const);

  if (mode === 'kmh_to_ms') {
    return buildQ(
      'Units & Dimensional Analysis (m/s to km/h)',
      diff,
      `Convert an aerodynamic velocity of ${speedKmh} km/h into SI units of meters per second (m/s).`,
      `${speedMs} m/s`,
      [`${speedMs + 5} m/s`, `${speedKmh / 2} m/s`, `${speedMs - 3} m/s`],
      `Conversion factor: 1 km/h = 1000 m / 3600 s = 1 / 3.6 m/s. ${speedKmh} / 3.6 = ${speedMs} m/s.`,
      `Quick rule: Divide km/h by 3.6 (or multiply by 5/18): ${speedKmh} × (5/18) = ${speedMs} m/s.`
    );
  } else if (mode === 'density_si') {
    const g_cm3 = choice([1, 2.5, 3.2, 7.8, 13.6]);
    const kg_m3 = g_cm3 * 1000;
    return buildQ(
      'Units & Dimensional Analysis (m/s to km/h)',
      diff,
      `A dense alloy sample has a density of ${g_cm3} g/cm³. What is this density expressed in standard SI units (kg/m³)?`,
      `${kg_m3} kg/m³`,
      [`${g_cm3 * 100} kg/m³`, `${g_cm3} kg/m³`, `${kg_m3 / 10} kg/m³`],
      `1 g/cm³ = (10⁻³ kg) / (10⁻⁶ m³) = 10³ kg/m³ = 1000 kg/m³. Multiply by 1000: ${g_cm3} × 1000 = ${kg_m3} kg/m³.`,
      `Golden rule: To go from g/cm³ to kg/m³, always multiply directly by 1,000.`
    );
  } else {
    return buildQ(
      'Units & Dimensional Analysis (m/s to km/h)',
      diff,
      `How many liters (L) are contained within a cubic volume of 5000 cm³?`,
      `5 L`,
      [`50 L`, `0.5 L`, `500 L`],
      `1 Liter = 1,000 cm³ (or 1 dm³). 5,000 cm³ / 1,000 = 5 L.`,
      `1 L = 1000 cm³. Move decimal point 3 places left.`
    );
  }
}

// 5. Logarithms & pH Scale
export function generateLogarithmsPH(diff: DifficultyLevel): Question {
  const phVal = choice([2, 3, 4, 5, 8, 9, 11]);
  const isHtoPH = Math.random() > 0.5;

  if (isHtoPH) {
    return buildQ(
      'Logarithms & Exponentials (pH, Doubling Times)',
      diff,
      `An aqueous biological solution has a hydrogen ion concentration [H⁺] of 1.0 × 10⁻${phVal} M. What is its pH?`,
      `${phVal}`,
      [`${phVal + 1}`, `${14 - phVal}`, `${phVal - 1}`],
      `pH = -log₁₀[H⁺] = -log₁₀(10⁻${phVal}) = ${phVal}.`,
      `When [H⁺] is 1.0 × 10⁻ⁿ, the pH is simply the positive exponent n.`
    );
  } else {
    const halfLifeYears = choice([5, 10, 15, 20, 25]);
    const cycles = choice([2, 3, 4]);
    const totalTime = halfLifeYears * cycles;
    const fractionRemaining = `1/${Math.pow(2, cycles)}`;

    return buildQ(
      'Logarithms & Exponentials (pH, Doubling Times)',
      diff,
      `A radioactive isotope has a half-life of ${halfLifeYears} years. What fraction of the original sample remains after ${totalTime} years?`,
      fractionRemaining,
      [`1/${Math.pow(2, cycles - 1)}`, `1/${cycles * 2}`, `1/${Math.pow(2, cycles + 1)}`],
      `Number of half-life intervals n = ${totalTime} / ${halfLifeYears} = ${cycles}. Remaining fraction = (1/2)^${cycles} = ${fractionRemaining}.`,
      `Halve successively: After 1 cycle = 1/2, 2 = 1/4, 3 = 1/8, 4 = 1/16.`
    );
  }
}

// 6. Probabilities in Genetics (Punnett & Hardy-Weinberg)
export function generateGenetics(diff: DifficultyLevel): Question {
  const type = choice(['monohybrid', 'dihybrid', 'hardy_weinberg'] as const);

  if (type === 'monohybrid') {
    return buildQ(
      'Probabilities in Genetics (Punnett & Hardy-Weinberg)',
      diff,
      `In a cross between two heterozygous individuals (Aa × Aa) for complete dominance, what proportion of the offspring are expected to express the dominant phenotype?`,
      `3/4 (75%)`,
      [`1/2 (50%)`, `1/4 (25%)`, `2/3 (67%)`],
      `Genotypic ratio: 1 AA : 2 Aa : 1 aa. Dominant phenotypes (AA and Aa) make up 1 + 2 = 3 out of 4 (75%).`,
      `Classic Mendelian monohybrid ratio: Phenotypic ratio is 3:1 (75% dominant, 25% recessive).`
    );
  } else if (type === 'dihybrid') {
    return buildQ(
      'Probabilities in Genetics (Punnett & Hardy-Weinberg)',
      diff,
      `In a classical Mendelian dihybrid cross (AaBb × AaBb) with independently assorting genes, what fraction of offspring will display BOTH recessive phenotypes (aabb)?`,
      `1/16`,
      [`3/16`, `9/16`, `1/4`],
      `Phenotypic dihybrid ratio is 9 (both dominant) : 3 (dom/rec) : 3 (rec/dom) : 1 (both recessive). The double recessive is 1/16.`,
      `Product of independent traits: (1/4 aa) × (1/4 bb) = 1/16.`
    );
  } else {
    // Hardy Weinberg: q^2 = 0.09 -> q = 0.3 -> p = 0.7 -> 2pq = 0.42
    return buildQ(
      'Probabilities in Genetics (Punnett & Hardy-Weinberg)',
      diff,
      `In a population in Hardy-Weinberg equilibrium, 9% (0.09) of individuals exhibit a homozygous recessive phenotype (q² = 0.09). What is the frequency of heterozygotes (2pq)?`,
      `0.42 (42%)`,
      [`0.30 (30%)`, `0.49 (49%)`, `0.18 (18%)`],
      `q = √0.09 = 0.30. Since p + q = 1, p = 1 - 0.30 = 0.70. Heterozygote frequency 2pq = 2 × 0.70 × 0.30 = 0.42 (42%).`,
      `Take square root of q² to get q (0.3), subtract from 1 to get p (0.7), then 2 × p × q = 2 × 0.21 = 0.42.`
    );
  }
}

// 7. Basic Mechanics & Circuit Laws
export function generateMechanicsCircuits(diff: DifficultyLevel): Question {
  const type = choice(['ohms_law', 'kinetic_energy', 'work'] as const);

  if (type === 'ohms_law') {
    const v = choice([12, 24, 48, 120, 240]);
    const r = choice([2, 3, 4, 6, 8, 12]);
    const i = v / r;

    return buildQ(
      'Complex Numbers & Basic Mechanics (v=u+at, Work, Power)',
      diff,
      `In an electrical laboratory experiment, a ${v} V potential difference is applied across a ${r} Ω resistor. What electric current flows through it?`,
      `${i} A`,
      [`${i + 2} A`, `${v * r} A`, `${i / 2} A`],
      `Ohm's Law: V = I × R ⟹ I = V / R = ${v} / ${r} = ${i} A.`,
      `Divide Voltage by Resistance directly.`
    );
  } else if (type === 'kinetic_energy') {
    const m = choice([2, 4, 6, 10]);
    const v = choice([3, 4, 5, 10]);
    const ke = 0.5 * m * v * v;

    return buildQ(
      'Complex Numbers & Basic Mechanics (v=u+at, Work, Power)',
      diff,
      `What is the kinetic energy of a ${m} kg test projectile moving at a velocity of ${v} m/s?`,
      `${ke} J`,
      [`${ke * 2} J`, `${m * v} J`, `${ke + 10} J`],
      `Kinetic Energy KE = (1/2)mv² = 0.5 × ${m} × ${v}² = 0.5 × ${m} × ${v * v} = ${ke} J.`,
      `Halve the mass (${m / 2}) and multiply by the square of velocity (${v * v}) = ${ke} Joules.`
    );
  } else {
    const f = choice([10, 20, 25, 50]);
    const d = choice([3, 4, 5, 8]);
    const work = f * d;

    return buildQ(
      'Complex Numbers & Basic Mechanics (v=u+at, Work, Power)',
      diff,
      `A constant horizontal force of ${f} N moves a laboratory cart across a displacement of ${d} m in the direction of the force. How much work is done?`,
      `${work} J`,
      [`${work + 25} J`, `${f + d} J`, `${Math.round(work / 2)} J`],
      `Work = Force × Displacement = ${f} N × ${d} m = ${work} J.`,
      `W = F × d.`
    );
  }
}
