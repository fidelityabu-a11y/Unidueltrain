export type MentalMathCategory =
  | 'all'
  | 'multiplication'
  | 'squaring_powers'
  | 'percentages_fractions'
  | 'lab_science'
  | 'algebra_matrices'
  | 'series_combinatorics';

export interface MentalMathProblem {
  id: string;
  category: MentalMathCategory;
  categoryLabel: string;
  problem: string;
  subtext?: string;
  correctAnswer: string | number;
  options: (string | number)[];
  shortcut: string;
  explanation: string;
}

export interface MentalMathTechnique {
  id: string;
  title: string;
  category: string;
  formula: string;
  example: string;
  explanation: string;
  tip: string;
}

export const MENTAL_MATH_TECHNIQUES: MentalMathTechnique[] = [
  {
    id: 'square_ending_5',
    title: 'Squaring Numbers Ending in 5',
    category: 'Multiplication & Powers',
    formula: '(10a + 5)² = [a × (a + 1)] concat 25',
    example: '65² = (6 × 7) followed by 25 = 4225',
    explanation: 'Take the tens digit (6), multiply by the next integer (7) = 42, then attach 25 at the end.',
    tip: 'Works instantly for 15, 25, 35, 45, 65, 75, 85, 95, 105!',
  },
  {
    id: 'multiply_11',
    title: 'Multiplying 2-Digit Numbers by 11',
    category: 'Multiplication',
    formula: 'ab × 11 = a [a + b] b',
    example: '53 × 11 = 5 | (5+3) | 3 = 583',
    explanation: 'Split the digits, add them together in the middle. If sum ≥ 10, carry 1 to the hundreds place (e.g. 78 × 11 = 7 | 15 | 8 = 858).',
    tip: 'Never do long multiplication for 11.',
  },
  {
    id: 'reverse_percentages',
    title: 'Commutative Percentage Trick (X% of Y = Y% of X)',
    category: 'Percentages',
    formula: 'X% of Y = Y% of X = (X × Y) / 100',
    example: '16% of 50 = 50% of 16 = 8!',
    explanation: 'Since multiplication is commutative, swapping the percentage and the number often turns an awkward calculation into a trivial mental half or quarter.',
    tip: 'Another example: 48% of 25 = 25% of 48 = 48 / 4 = 12.',
  },
  {
    id: 'diff_of_squares',
    title: 'Difference of Squares for Tough Products',
    category: 'Algebra & Products',
    formula: '(A - B)(A + B) = A² - B²',
    example: '53 × 47 = (50 + 3)(50 - 3) = 50² - 3² = 2500 - 9 = 2491',
    explanation: 'If two numbers are equidistant from a round base number (like 50), square the base and subtract the square of the difference.',
    tip: 'Also works in reverse: 64² - 36² = (64 - 36)(64 + 36) = 28 × 100 = 2800!',
  },
  {
    id: 'dilution_factor',
    title: 'Lab Dilution Equation (C₁V₁ = C₂V₂)',
    category: 'Applied Science',
    formula: 'C₂ = (C₁ × V₁) / V₂',
    example: '25 mL of 4.0 M stock diluted to 100 mL = (25 × 4) / 100 = 1.0 M',
    explanation: 'Notice the volume ratio: 100 mL is 4× the initial 25 mL, so concentration drops by a factor of 4: 4.0 M / 4 = 1.0 M.',
    tip: 'Always look for dilution factors: 2×, 4×, 5×, or 10×.',
  },
  {
    id: 'divide_by_5_25',
    title: 'Division by 5 and 25',
    category: 'Rapid Arithmetic',
    formula: 'N / 5 = (2N) / 10  and  N / 25 = (4N) / 100',
    example: '340 / 5 = 680 / 10 = 68;  450 / 25 = 1800 / 100 = 18',
    explanation: 'Doubling or quadrupling a number is far faster in your head than dividing by 5 or 25, followed by shifting decimal places.',
    tip: 'To divide by 50: double the number and divide by 100 (e.g. 750 / 50 = 1500 / 100 = 15).',
  },
  {
    id: 'matrix_det',
    title: '2×2 Determinant Calculation',
    category: 'Linear Algebra',
    formula: 'det [a, b; c, d] = ad - bc',
    example: 'det [8, 3; 4, 5] = (8 × 5) - (3 × 4) = 40 - 12 = 28',
    explanation: 'Multiply main diagonal elements, then subtract off-diagonal product.',
    tip: 'Keep track of negative signs: ad - (-bc) = ad + bc.',
  },
  {
    id: 'near_100_mult',
    title: 'Multiplication Near 100',
    category: 'Multiplication',
    formula: '(100 - x)(100 - y) = [100 - (x + y)] concat (x × y)',
    example: '96 × 94 (deficits 4 and 6): 100 - 10 = 90, 4 × 6 = 24 → 9024',
    explanation: 'Compute how far each number is below 100. Subtract the sum of deficits from 100 for the thousands/hundreds, multiply deficits for the last 2 digits.',
    tip: '98 × 97: deficits 2 and 3 → 100 - 5 = 95, 2 × 3 = 06 → 9506.',
  },
];

// Helper to shuffle array
function shuffle<T>(arr: T[]): T[] {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

// Generate options around the correct numeric value
function generateNumericOptions(correct: number): (number | string)[] {
  const optionsSet = new Set<number>();
  optionsSet.add(correct);

  const deltas = [-10, 10, -1, 1, -2, 2, -5, 5, -20, 20];
  const shuffledDeltas = shuffle(deltas);

  for (const delta of shuffledDeltas) {
    if (optionsSet.size >= 4) break;
    const candidate = correct + delta;
    if (candidate >= 0 && candidate !== correct) {
      optionsSet.add(candidate);
    }
  }

  // Fallback if needed
  let mult = 1.1;
  while (optionsSet.size < 4) {
    const candidate = Math.round(correct * mult);
    if (!optionsSet.has(candidate)) optionsSet.add(candidate);
    mult += 0.15;
  }

  return shuffle(Array.from(optionsSet));
}

// Generator functions for distinct categories
export function generateMentalMathProblem(categoryFilter: MentalMathCategory = 'all'): MentalMathProblem {
  const availableCategories: MentalMathCategory[] =
    categoryFilter === 'all'
      ? ['multiplication', 'squaring_powers', 'percentages_fractions', 'lab_science', 'algebra_matrices', 'series_combinatorics']
      : [categoryFilter];

  const cat = availableCategories[Math.floor(Math.random() * availableCategories.length)];
  const id = `mm_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

  switch (cat) {
    case 'squaring_powers': {
      // 1. Ending in 5 or near round numbers
      const subType = Math.random();
      if (subType < 0.6) {
        const tens = [2, 3, 4, 5, 6, 7, 8, 9, 11][Math.floor(Math.random() * 9)];
        const num = tens * 10 + 5;
        const ans = num * num;
        return {
          id,
          category: 'squaring_powers',
          categoryLabel: 'Squaring Tricks',
          problem: `${num}² = ?`,
          subtext: 'Apply the ending-in-5 rule: tens × (tens + 1) attached with 25',
          correctAnswer: ans,
          options: generateNumericOptions(ans),
          shortcut: `${tens} × ${tens + 1} = ${tens * (tens + 1)}, attach 25 → ${ans}`,
          explanation: `For any number ending in 5, multiply the prefix ${tens} by the next integer ${tens + 1} to get ${tens * (tens + 1)}, then append 25 at the end to get ${ans}.`,
        };
      } else {
        const base = [20, 30, 40, 50, 60, 70][Math.floor(Math.random() * 6)];
        const diff = [1, 2, 3][Math.floor(Math.random() * 3)];
        const num = base + diff;
        const ans = num * num;
        return {
          id,
          category: 'squaring_powers',
          categoryLabel: 'Square Expansion',
          problem: `${num}² = ?`,
          subtext: `Use binomial expansion: (${base} + ${diff})² = ${base}² + 2(${base})(${diff}) + ${diff}²`,
          correctAnswer: ans,
          options: generateNumericOptions(ans),
          shortcut: `${base}² = ${base * base}, 2(${base})(${diff}) = ${2 * base * diff}, ${diff}² = ${diff * diff} → ${ans}`,
          explanation: `Break into (${base} + ${diff})² = ${base * base} + ${2 * base * diff} + ${diff * diff} = ${ans}.`,
        };
      }
    }

    case 'multiplication': {
      const type = Math.random();
      if (type < 0.35) {
        // Multiply by 11
        const tens = Math.floor(Math.random() * 7) + 2;
        const units = Math.floor(Math.random() * 8) + 1;
        const num = tens * 10 + units;
        const ans = num * 11;
        return {
          id,
          category: 'multiplication',
          categoryLabel: 'Cross-Multiplication',
          problem: `${num} × 11 = ?`,
          subtext: 'Add the digits together and insert between them',
          correctAnswer: ans,
          options: generateNumericOptions(ans),
          shortcut: `${tens} + ${units} = ${tens + units} → insert between ${tens} and ${units} = ${ans}`,
          explanation: `Separate digits: ${tens} and ${units}. Middle digit is ${tens} + ${units} = ${tens + units}. The result is ${ans}.`,
        };
      } else if (type < 0.65) {
        // Near 100 multiplication
        const d1 = Math.floor(Math.random() * 6) + 2; // deficit 2 to 7
        const d2 = Math.floor(Math.random() * 6) + 2;
        const a = 100 - d1;
        const b = 100 - d2;
        const ans = a * b;
        return {
          id,
          category: 'multiplication',
          categoryLabel: 'Base-100 Complements',
          problem: `${a} × ${b} = ?`,
          subtext: `Deficits from 100: -${d1} and -${d2}`,
          correctAnswer: ans,
          options: generateNumericOptions(ans),
          shortcut: `100 - (${d1} + ${d2}) = ${100 - (d1 + d2)}, ${d1} × ${d2} = ${d1 * d2 < 10 ? '0' : ''}${d1 * d2} → ${ans}`,
          explanation: `Deficits are ${d1} and ${d2}. First part: 100 - (${d1} + ${d2}) = ${100 - (d1 + d2)}. Last part: ${d1} × ${d2} = ${d1 * d2}. Combining gives ${ans}.`,
        };
      } else {
        // Double and Half trick (e.g. 35 × 18 = 70 × 9 = 630)
        const fiveNum = [15, 25, 35, 45][Math.floor(Math.random() * 4)];
        const evenNum = [12, 14, 16, 18, 22, 24][Math.floor(Math.random() * 6)];
        const ans = fiveNum * evenNum;
        return {
          id,
          category: 'multiplication',
          categoryLabel: 'Double and Half',
          problem: `${fiveNum} × ${evenNum} = ?`,
          subtext: 'Double the 5-number, halve the even number',
          correctAnswer: ans,
          options: generateNumericOptions(ans),
          shortcut: `(${fiveNum} × 2) × (${evenNum} / 2) = ${fiveNum * 2} × ${evenNum / 2} = ${ans}`,
          explanation: `Double ${fiveNum} to get ${fiveNum * 2}, and halve ${evenNum} to get ${evenNum / 2}. Multiplying ${fiveNum * 2} × ${evenNum / 2} = ${ans}.`,
        };
      }
    }

    case 'percentages_fractions': {
      const type = Math.random();
      if (type < 0.5) {
        // Commutative percentage swap: X% of 50 = 50% of X
        const evenX = [24, 36, 48, 64, 72, 86, 94][Math.floor(Math.random() * 7)];
        const ans = evenX / 2;
        return {
          id,
          category: 'percentages_fractions',
          categoryLabel: 'Commutative Percentage',
          problem: `${evenX}% of 50 = ?`,
          subtext: 'Swap trick: X% of 50 = 50% of X (half of X)',
          correctAnswer: ans,
          options: generateNumericOptions(ans),
          shortcut: `Swap: 50% of ${evenX} = ${evenX} / 2 = ${ans}`,
          explanation: `Since X% of Y = Y% of X, calculate 50% of ${evenX}, which is simply ${evenX} / 2 = ${ans}.`,
        };
      } else {
        // 15% calculation (10% + 5%)
        const base = [60, 80, 120, 140, 160, 240, 320][Math.floor(Math.random() * 7)];
        const tenPercent = base / 10;
        const fivePercent = tenPercent / 2;
        const ans = tenPercent + fivePercent;
        return {
          id,
          category: 'percentages_fractions',
          categoryLabel: 'Quick Tip / Percent Split',
          problem: `15% of ${base} = ?`,
          subtext: 'Split into 10% + half of 10%',
          correctAnswer: ans,
          options: generateNumericOptions(ans),
          shortcut: `10% of ${base} = ${tenPercent}, 5% = ${fivePercent} → sum = ${ans}`,
          explanation: `10% of ${base} is ${tenPercent}. 5% is half of that (${fivePercent}). Total 15% = ${tenPercent} + ${fivePercent} = ${ans}.`,
        };
      }
    }

    case 'lab_science': {
      const type = Math.random();
      if (type < 0.45) {
        // Dilution C1V1 = C2V2
        const c1 = [2, 4, 5, 8, 10][Math.floor(Math.random() * 5)];
        const v1 = [20, 25, 50][Math.floor(Math.random() * 3)];
        const factor = [2, 4, 5, 10][Math.floor(Math.random() * 4)];
        const v2 = v1 * factor;
        const c2 = Number((c1 / factor).toFixed(2));
        return {
          id,
          category: 'lab_science',
          categoryLabel: 'Solution Dilutions',
          problem: `${v1} mL of ${c1} M stock is diluted to ${v2} mL. Final concentration?`,
          subtext: `Dilution factor = ${v2} / ${v1} = ${factor}×`,
          correctAnswer: `${c2} M`,
          options: shuffle([`${c2} M`, `${(c2 * 2).toFixed(1)} M`, `${(c2 / 2).toFixed(2)} M`, `${(c2 + 1).toFixed(1)} M`]),
          shortcut: `Volume expanded ${factor}× → Concentration divides by ${factor}: ${c1} / ${factor} = ${c2} M`,
          explanation: `C₂ = (C₁ × V₁) / V₂ = (${c1} × ${v1}) / ${v2} = ${c2} M.`,
        };
      } else if (type < 0.75) {
        // Half-life halving
        const halfLives = [3, 4, 5][Math.floor(Math.random() * 3)];
        const initial = Math.pow(2, halfLives) * 10;
        const ans = 10;
        return {
          id,
          category: 'lab_science',
          categoryLabel: 'Radioactive Half-Life',
          problem: `A ${initial} mg sample decays over ${halfLives} half-lives. How much remains?`,
          subtext: `Each half-life halves the sample (divide by 2^${halfLives} = ${Math.pow(2, halfLives)})`,
          correctAnswer: `${ans} mg`,
          options: shuffle([`${ans} mg`, `${ans * 2} mg`, `${ans * 4} mg`, `${Math.round(ans / 2)} mg`]),
          shortcut: `${initial} / 2^${halfLives} = ${initial} / ${Math.pow(2, halfLives)} = ${ans} mg`,
          explanation: `After ${halfLives} half-lives, the amount remaining is ${initial} / 2^${halfLives} = ${initial} / ${Math.pow(2, halfLives)} = ${ans} mg.`,
        };
      } else {
        // pH calculation from [H+]
        const exp = Math.floor(Math.random() * 8) + 2; // 2 to 9
        return {
          id,
          category: 'lab_science',
          categoryLabel: 'Acid-Base pH',
          problem: `If [H⁺] = 1.0 × 10⁻${exp} M, what is the pH?`,
          subtext: 'pH = -log₁₀[H⁺]',
          correctAnswer: exp,
          options: shuffle([exp, exp + 1, Math.max(1, exp - 1), 14 - exp]),
          shortcut: `Negative log of 10^-${exp} is simply ${exp}`,
          explanation: `By definition pH = -log[H⁺] = -log(10⁻${exp}) = ${exp}.`,
        };
      }
    }

    case 'algebra_matrices': {
      const type = Math.random();
      if (type < 0.5) {
        // 2x2 Determinant
        const a = Math.floor(Math.random() * 7) + 2;
        const d = Math.floor(Math.random() * 7) + 2;
        const b = Math.floor(Math.random() * 4) + 1;
        const c = Math.floor(Math.random() * 4) + 1;
        const ans = a * d - b * c;
        return {
          id,
          category: 'algebra_matrices',
          categoryLabel: '2×2 Determinant',
          problem: `det | ${a}   ${b} | \n     | ${c}   ${d} | = ?`,
          subtext: 'Cross multiply: (a × d) - (b × c)',
          correctAnswer: ans,
          options: generateNumericOptions(ans),
          shortcut: `(${a} × ${d}) - (${b} × ${c}) = ${a * d} - ${b * c} = ${ans}`,
          explanation: `The determinant of a 2×2 matrix is ad - bc = (${a})(${d}) - (${b})(${c}) = ${a * d} - ${b * c} = ${ans}.`,
        };
      } else {
        // Difference of Squares mental product: e.g. 52 × 48 = 50² - 2² = 2496
        const base = [30, 40, 50, 60, 70][Math.floor(Math.random() * 5)];
        const d = [2, 3, 4][Math.floor(Math.random() * 3)];
        const num1 = base + d;
        const num2 = base - d;
        const ans = base * base - d * d;
        return {
          id,
          category: 'algebra_matrices',
          categoryLabel: 'Difference of Squares',
          problem: `${num1} × ${num2} = ?`,
          subtext: `Equidistant from ${base}: (${base} + ${d})(${base} - ${d}) = ${base}² - ${d}²`,
          correctAnswer: ans,
          options: generateNumericOptions(ans),
          shortcut: `${base}² - ${d}² = ${base * base} - ${d * d} = ${ans}`,
          explanation: `Use (A + B)(A - B) = A² - B². Here (${base} + ${d})(${base} - ${d}) = ${base * base} - ${d * d} = ${ans}.`,
        };
      }
    }

    case 'series_combinatorics':
    default: {
      const type = Math.random();
      if (type < 0.5) {
        // Sum of first N integers: N(N + 1) / 2
        const n = [10, 12, 14, 16, 20, 24, 30][Math.floor(Math.random() * 7)];
        const ans = (n * (n + 1)) / 2;
        return {
          id,
          category: 'series_combinatorics',
          categoryLabel: 'Arithmetic Series Sum',
          problem: `1 + 2 + 3 + ... + ${n} = ?`,
          subtext: `Gauss pairing: n(n + 1) / 2 = ${n}(${n + 1}) / 2`,
          correctAnswer: ans,
          options: generateNumericOptions(ans),
          shortcut: `(${n} / 2) × ${n + 1} = ${n / 2} × ${n + 1} = ${ans}`,
          explanation: `The sum of the first n integers is n(n + 1) / 2 = ${n} × ${n + 1} / 2 = ${ans}.`,
        };
      } else {
        // Fast Combinations C(n, 2) = n(n - 1) / 2
        const n = [6, 7, 8, 9, 10, 12][Math.floor(Math.random() * 6)];
        const ans = (n * (n - 1)) / 2;
        return {
          id,
          category: 'series_combinatorics',
          categoryLabel: 'Combinations C(n, 2)',
          problem: `C(${n}, 2) = ?`,
          subtext: `Pairs chosen from ${n} items: ${n} × ${n - 1} / 2`,
          correctAnswer: ans,
          options: generateNumericOptions(ans),
          shortcut: `${n} × ${n - 1} / 2 = ${n * (n - 1)} / 2 = ${ans}`,
          explanation: `Number of combinations of choosing 2 items from ${n} is ${n}(${n - 1}) / 2 = ${n * (n - 1)} / 2 = ${ans}.`,
        };
      }
    }
  }
}
