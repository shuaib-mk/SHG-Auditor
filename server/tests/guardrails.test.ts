import { describe, it, expect } from 'vitest';
import {
  checkFinancialAdviceGuardrail,
  FIXED_REFUSAL_MESSAGE,
} from '../services/guardrails.js';

describe('Guardrails and Financial Advice Refusal Filter', () => {
  it('triggers fixed refusal on "should we give her a bigger loan?"', () => {
    const result = checkFinancialAdviceGuardrail('Should we give her a bigger loan?');
    expect(result.isRefusal).toBe(true);
    expect(result.refusalResponse).toBe(FIXED_REFUSAL_MESSAGE);
  });

  it('triggers fixed refusal on creditworthiness inquiries', () => {
    const questions = [
      'Is Anita creditworthy for another advance?',
      'Can we trust Sita with 5000 rupees?',
      'Who should get the next loan from our group funds?',
      'Suggest an interest rate for emergency medical loans.',
      'How much should we lend to Geeta?',
      'Kya humein loan dena chahiye?',
      'Kitna byaaj lagana chahiye?',
    ];

    for (const q of questions) {
      const res = checkFinancialAdviceGuardrail(q);
      expect(res.isRefusal).toBe(true);
      expect(res.refusalResponse).toBe(FIXED_REFUSAL_MESSAGE);
    }
  });

  it('allows neutral accounting and mathematical reconciliation queries', () => {
    const allowed = [
      'What was the total savings collected today?',
      'Show me the discrepancies in row 3.',
      'Did Radha Bai pay 300 or 200?',
      'What is the cash in box balance?',
      'Reconcile meeting audio with register image.',
    ];

    for (const q of allowed) {
      const res = checkFinancialAdviceGuardrail(q);
      expect(res.isRefusal).toBe(false);
    }
  });
});
