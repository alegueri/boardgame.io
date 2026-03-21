import type { TechniqueId } from '../types/problem';

export interface TechniqueInfo {
  id: TechniqueId;
  title: string;
  subtitle: string;
  emoji: string;
  lessonSteps: LessonStep[];
  difficulty: 1 | 2 | 3;
}

export interface LessonStep {
  title: string;
  explanation: string;
  example: string;
  steps: string[];
}

export const TECHNIQUES: TechniqueInfo[] = [
  {
    id: 'foundations',
    title: 'Foundations',
    subtitle: 'Master your basic facts with spaced repetition',
    emoji: '🏗️',
    difficulty: 1,
    lessonSteps: [],
  },
  {
    id: 'times5',
    title: 'Multiply by 5',
    subtitle: 'Halve the number, then × 10',
    emoji: '✋',
    difficulty: 1,
    lessonSteps: [
      {
        title: 'The Secret: ×5 = ÷2 then ×10',
        explanation: 'Multiplying by 5 is the same as dividing by 2 and multiplying by 10. Since dividing by 2 and multiplying by 10 is very easy, this is much faster than the usual method.',
        example: '46 × 5',
        steps: ['46 ÷ 2 = 23', '23 × 10 = 230', 'Answer: 230'],
      },
      {
        title: 'What about odd numbers?',
        explanation: 'If the number is odd, you\'ll get a .5 after dividing by 2 — just keep it and multiply by 10 to get a whole number.',
        example: '37 × 5',
        steps: ['37 ÷ 2 = 18.5', '18.5 × 10 = 185', 'Answer: 185'],
      },
    ],
  },
  {
    id: 'times9',
    title: 'Multiply by 9',
    subtitle: '× 10 then subtract once',
    emoji: '9️⃣',
    difficulty: 1,
    lessonSteps: [
      {
        title: 'The Secret: ×9 = ×10 − original',
        explanation: '9 is just one less than 10. So N × 9 = N × 10 − N. Multiplying by 10 is trivial, and subtracting the original number is fast.',
        example: '47 × 9',
        steps: ['47 × 10 = 470', '470 − 47 = 423', 'Answer: 423'],
      },
    ],
  },
  {
    id: 'times11',
    title: 'Multiply by 11',
    subtitle: 'The digit-sum sandwich trick',
    emoji: '🥪',
    difficulty: 1,
    lessonSteps: [
      {
        title: 'The Sandwich Trick',
        explanation: 'For any 2-digit number AB × 11: the answer is A, then (A+B), then B. The outer digits stay; the middle is the sum of the two digits.',
        example: '34 × 11',
        steps: ['Outer digits: 3 and 4', 'Middle = 3 + 4 = 7', 'Answer: 374'],
      },
      {
        title: 'When the middle digit is 10 or more',
        explanation: 'If A+B ≥ 10, carry the 1 to the left digit.',
        example: '78 × 11',
        steps: ['Middle = 7 + 8 = 15 (carry 1)', 'Left digit = 7 + 1 = 8', 'Answer: 858'],
      },
    ],
  },
  {
    id: 'times25',
    title: 'Multiply by 25',
    subtitle: '÷ 4 then × 100',
    emoji: '💰',
    difficulty: 1,
    lessonSteps: [
      {
        title: 'The Secret: ×25 = ÷4 then ×100',
        explanation: '25 is one quarter of 100. So N × 25 = (N ÷ 4) × 100. This works perfectly when N is divisible by 4.',
        example: '36 × 25',
        steps: ['36 ÷ 4 = 9', '9 × 100 = 900', 'Answer: 900'],
      },
    ],
  },
  {
    id: 'times99',
    title: 'Multiply by 99',
    subtitle: '× 100 then subtract once',
    emoji: '🔢',
    difficulty: 2,
    lessonSteps: [
      {
        title: 'The Secret: ×99 = ×100 − original',
        explanation: '99 is just one less than 100. So N × 99 = N × 100 − N.',
        example: '47 × 99',
        steps: ['47 × 100 = 4700', '4700 − 47 = 4653', 'Answer: 4653'],
      },
    ],
  },
  {
    id: 'square5',
    title: 'Square Numbers Ending in 5',
    subtitle: 'The append-25 trick',
    emoji: '5️⃣²',
    difficulty: 2,
    lessonSteps: [
      {
        title: 'The Magic Formula',
        explanation: 'For any number ending in 5: multiply the tens digit by one more than itself, then append "25". Works every time.',
        example: '65²',
        steps: ['Tens digit: 6', '6 × 7 = 42', 'Append 25: 4225', 'Answer: 4225'],
      },
      {
        title: 'Why it works',
        explanation: '(10n + 5)² = 100n² + 100n + 25 = 100n(n+1) + 25. The n(n+1) part is what you compute first, then you shift it two decimal places (×100) and add 25.',
        example: '35²',
        steps: ['Tens digit: 3', '3 × 4 = 12', 'Append 25: 1225', 'Answer: 1225'],
      },
    ],
  },
  {
    id: 'nearSquare',
    title: 'Near-Square Multiplication',
    subtitle: 'Difference of squares shortcut',
    emoji: '🔲',
    difficulty: 2,
    lessonSteps: [
      {
        title: 'The Difference of Squares Identity',
        explanation: '(A−d)(A+d) = A² − d². When two numbers are the same distance from a round number, you can use this identity to compute their product easily.',
        example: '47 × 53',
        steps: ['Both are 3 away from 50', '50² = 2500', '3² = 9', '2500 − 9 = 2491', 'Answer: 2491'],
      },
      {
        title: 'Finding the round number',
        explanation: 'Look for a midpoint that is a round number (10, 20, 25, 50, 100). The further the offset, the harder the square to remember.',
        example: '18 × 22',
        steps: ['Both are 2 away from 20', '20² = 400', '2² = 4', '400 − 4 = 396', 'Answer: 396'],
      },
    ],
  },
  {
    id: 'twoDigitMul',
    title: 'Two-Digit Multiplication',
    subtitle: 'Left-to-right cross multiplication',
    emoji: '✖️',
    difficulty: 3,
    lessonSteps: [
      {
        title: 'The Left-to-Right Method (Arthur Benjamin)',
        explanation: 'Break each number into tens and ones. Compute left-to-right: hundreds first, then tens, then ones. Accumulate as you go.',
        example: '23 × 47',
        steps: [
          'Left: 20 × 40 = 800',
          'Cross: 20 × 7 = 140, 3 × 40 = 120 → 260',
          'Right: 3 × 7 = 21',
          'Total: 800 + 260 + 21 = 1081',
        ],
      },
    ],
  },
  {
    id: 'nikhilam',
    title: 'Nikhilam (Near 100)',
    subtitle: 'Vedic math for numbers near 100',
    emoji: '🕉️',
    difficulty: 3,
    lessonSteps: [
      {
        title: 'The Nikhilam Sutra',
        explanation: 'For numbers near 100, note each number\'s deviation (positive or negative). The left part = one number + the other\'s deviation. The right part = the product of deviations (2 digits).',
        example: '97 × 96',
        steps: [
          '97 is −3 from 100',
          '96 is −4 from 100',
          'Left: 97 + (−4) = 93',
          'Right: (−3) × (−4) = 12',
          'Answer: 9312',
        ],
      },
      {
        title: 'Numbers above 100',
        explanation: 'Works the same way with positive deviations.',
        example: '108 × 107',
        steps: [
          '108 is +8 from 100',
          '107 is +7 from 100',
          'Left: 108 + 7 = 115',
          'Right: 8 × 7 = 56',
          'Answer: 11556',
        ],
      },
    ],
  },
  {
    id: 'leftToRight',
    title: 'Left-to-Right Addition',
    subtitle: 'Build running totals from left',
    emoji: '➡️',
    difficulty: 2,
    lessonSteps: [
      {
        title: 'Always Add Left to Right',
        explanation: 'School teaches right-to-left addition (to handle carries). Mental math is faster going left-to-right: you build the answer from most significant to least, which matches how you\'d say the number aloud.',
        example: '47 + 38',
        steps: ['40 + 30 = 70', '70 + 7 = 77', '77 + 8 = 85', 'Answer: 85'],
      },
      {
        title: 'Multi-Number Running Totals',
        explanation: 'For a series of numbers, keep a running total after each number. Announce it in your mind after each addition.',
        example: '34 + 27 + 51',
        steps: ['Start: 34', '+ 27 → 61', '+ 51 → 112', 'Answer: 112'],
      },
    ],
  },
];
