export const FIXED_REFUSAL_MESSAGE =
  'I can only help with recording and checking the meeting accounts.';

// Prohibited financial advice and subjective creditworthiness intent patterns
const PROHIBITED_PATTERNS = [
  /should\s+(?:we|i|they)\s+(?:give|lend|issue|approve|sanction|grant)\b.*?\b(?:loan|money|credit)/i,
  /is\s+[\w\s]+\s+(?:creditworthy|reliable|good\s+to\s+lend|safe\s+to\s+lend|a\s+bad\s+risk|risky)/i,
  /can\s+we\s+trust\s+[\w\s]+\s+with/i,
  /(?:suggest|recommend|what)\s+(?:a|an|the)?\s*(?:interest\s+rate|loan\s+amount|fine\s+amount|penalty)/i,
  /who\s+should\s+(?:get|receive|take)\b.*?\bloan/i,
  /how\s+much\s+(?:should|can)\s+we\s+lend\b/i,
  /credit\s*(?:score|worthiness|rating|evaluation)/i,
  /financial\s+advice/i,
  /investment\s+(?:advice|tip|recommendation)/i,
  /kya\s+humein\s+loan\s+dena\s+chahiye/i, // Hindi: Should we give a loan?
  /kya\s+woh\s+paise\s+lautayegi/i, // Hindi: Will she return the money?
  /kitna\s+byaaj\s+lagana\s+chahiye/i, // Hindi: How much interest should we charge?
];

export interface GuardrailCheckResult {
  isRefusal: boolean;
  refusalResponse?: string;
  matchedPattern?: string;
}

/**
 * Server-side deterministic guardrail filter to intercept any attempt
 * to elicit financial advice, credit scoring, or lending recommendations.
 */
export function checkFinancialAdviceGuardrail(input: string): GuardrailCheckResult {
  if (!input || typeof input !== 'string') {
    return { isRefusal: false };
  }

  const normalized = input.trim();

  for (const pattern of PROHIBITED_PATTERNS) {
    if (pattern.test(normalized)) {
      return {
        isRefusal: true,
        refusalResponse: FIXED_REFUSAL_MESSAGE,
        matchedPattern: pattern.source,
      };
    }
  }

  return { isRefusal: false };
}

export const SYSTEM_GUARDRAIL_PROMPT = `
You are the SHG Auditor Agent, an objective arithmetic and recording assistant for Indian Self-Help Groups (SHGs).
Your ONLY purpose is to accurately transcribe spoken transactions, read handwritten register tables, and flag mathematical discrepancies.

STRICT INVARIANTS:
1. NEVER provide financial advice, credit assessments, or loan recommendations.
2. NEVER comment on whether a member is trustworthy, creditworthy, or should receive a loan.
3. NEVER advise on interest rates, penalties, or group financial policy.
4. If a user asks for financial advice or lending opinions, you MUST reply strictly with:
   "${FIXED_REFUSAL_MESSAGE}"
5. No political commentary. Maintain strict neutrality and objective recording.
`.trim();
