/**
 * Hindi & English Spoken Number and Correction Normalizer
 * Handles mixed Hinglish, standard Hindi numeral words, and in-flight spoken corrections.
 */

const HINDI_NUMBER_WORDS: Record<string, number> = {
  // 0 - 10
  shunya: 0, zero: 0,
  ek: 1, one: 1,
  do: 2, two: 2,
  teen: 3, three: 3,
  chaar: 4, char: 4, four: 4,
  paanch: 5, panch: 5, five: 5,
  chhah: 6, che: 6, six: 6,
  saat: 7, seven: 7,
  aath: 8, ath: 8, eight: 8,
  nau: 9, nine: 9,
  dus: 10, das: 10, ten: 10,

  // 11 - 20
  gyaarah: 11, eleven: 11,
  baarah: 12, twelve: 12,
  terah: 13, thirteen: 13,
  chaudah: 14, fourteen: 14,
  pandrah: 15, fifteen: 15,
  solah: 16, sixteen: 16,
  satrah: 17, seventeen: 17,
  athaarah: 18, eighteen: 18,
  unnees: 19, nineteen: 19,
  bees: 20, twenty: 20,

  // Tens
  tees: 30, thirty: 30,
  chaalis: 40, forty: 40,
  pachaas: 50, fifty: 50,
  saath: 60, sixty: 60,
  sattar: 70, seventy: 70,
  assi: 80, eighty: 80,
  nabbe: 90, ninety: 90,

  // Hundreds & Special Fractions
  sau: 100, so: 100, hundred: 100,
  dedh: 1.5,
  dhai: 2.5,
  hazaar: 1000, hazar: 1000, thousand: 1000,
  lakh: 100000, lac: 100000,
};

/**
 * Parses spoken number expressions from Indian conversational text.
 * E.g., "do sau" -> 200, "paanch sau pachaas" -> 550, "ek hazaar" -> 1000, "dedh sau" -> 150, "dhai sau" -> 250
 */
export function parseSpokenNumberWord(text: string): number | null {
  const clean = text.toLowerCase().replace(/[₹,\.]/g, ' ').trim();

  // Direct digits check first
  const digitMatch = clean.match(/\b\d+(\.\d+)?\b/);
  if (digitMatch && !clean.includes('sau') && !clean.includes('hazar') && !clean.includes('hazaar') && !clean.includes('hundred') && !clean.includes('thousand')) {
    return parseFloat(digitMatch[0]);
  }

  // Compound / Indian idioms
  if (/\b(dedh\s+sau|dedh\s+so)\b/.test(clean)) return 150;
  if (/\b(dhai\s+sau|dhai\s+so)\b/.test(clean)) return 250;
  if (/\b(dedh\s+hazaar|dedh\s+hazar)\b/.test(clean)) return 1500;
  if (/\b(dhai\s+hazaar|dhai\s+hazar)\b/.test(clean)) return 2500;

  const tokens = clean.split(/\s+/);
  let total = 0;
  let currentGroup = 0;
  let hasNumber = false;

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];

    // Numeric digits directly
    if (/^\d+$/.test(token)) {
      const val = parseInt(token, 10);
      currentGroup += val;
      hasNumber = true;
      continue;
    }

    const val = HINDI_NUMBER_WORDS[token];
    if (val !== undefined) {
      hasNumber = true;
      if (val === 100) {
        currentGroup = currentGroup === 0 ? 100 : currentGroup * 100;
      } else if (val === 1000 || val === 100000) {
        currentGroup = currentGroup === 0 ? val : currentGroup * val;
        total += currentGroup;
        currentGroup = 0;
      } else {
        currentGroup += val;
      }
    }
  }

  total += currentGroup;
  return hasNumber && total > 0 ? total : null;
}

/**
 * Handles spoken corrections in audio transcripts.
 * E.g.:
 *  "no, 300, not 200" -> 300
 *  "200 rupees, nahi nahi, 300 rupees likho" -> 300
 *  "arre 500 nahi 400 hai" -> 400
 *  "give 200... wait sorry 300" -> 300
 */
export function resolveSpokenCorrection(text: string): { amount: number; wasCorrected: boolean } | null {
  const normalized = text.toLowerCase();

  // Pattern 1: English "no, X, not Y" (X is new, Y is rejected)
  const englishPattern = /no\s*,?\s*(\d+|[a-z\s]+?)\s*(?:,\s*)?not\s+(\d+|[a-z\s]+)/i;
  const matchEn = normalized.match(englishPattern);
  if (matchEn) {
    const candidate = parseSpokenNumberWord(matchEn[1]);
    if (candidate !== null) {
      return { amount: candidate, wasCorrected: true };
    }
  }

  // Pattern 2: Hindi "[old] nahi [new]" or "arre [old] nahi, [new] hai/likho" (new is second)
  const hindiPattern = /(?:arre\s+)?(\d+|[a-z\s]+?)\s*(?:nahi|nahi\s+nahi)\s*,?\s*(\d+|[a-z\s]+?)(?:\s+(?:hai|rupees|rupaye|likho|rakho|karo|$))/i;
  const matchHi = normalized.match(hindiPattern);
  if (matchHi) {
    const candidate = parseSpokenNumberWord(matchHi[2]);
    if (candidate !== null) {
      return { amount: candidate, wasCorrected: true };
    }
  }

  // Pattern 3: "Y... wait / sorry / actually X" (X is new)
  const waitPattern = /(?:wait|sorry|actually)\s*,?\s*(\d+|[a-z\s]+)/i;
  const matchWait = normalized.match(waitPattern);
  if (matchWait) {
    const candidate = parseSpokenNumberWord(matchWait[1]);
    if (candidate !== null) {
      return { amount: candidate, wasCorrected: true };
    }
  }

  // Fallback: parse last mentioned number if multiple, or standard spoken number
  const numbers = normalized.match(/\d+/g);
  if (numbers && numbers.length > 0) {
    const lastNum = parseInt(numbers[numbers.length - 1], 10);
    return { amount: lastNum, wasCorrected: numbers.length > 1 };
  }

  const parsedWord = parseSpokenNumberWord(text);
  if (parsedWord !== null) {
    return { amount: parsedWord, wasCorrected: false };
  }

  return null;
}
