import { describe, it, expect } from 'vitest';
import { reconcileAccounts } from '../services/reconciler.js';
import {
  MOCK_SHG_MEMBERS,
  MOCK_SPOKEN_TRANSACTIONS,
  MOCK_REGISTER_DATA,
} from '../services/mockService.js';
import {
  parseSpokenNumberWord,
  resolveSpokenCorrection,
} from '../services/hindiNumberParser.js';

describe('Deterministic Reconciliation Engine', () => {
  it('flags row arithmetic mismatch when row total differs from cell sum', () => {
    const report = reconcileAccounts({
      spokenTransactions: MOCK_SPOKEN_TRANSACTIONS,
      registerData: MOCK_REGISTER_DATA,
      members: MOCK_SHG_MEMBERS,
    });

    const rowMathErrors = report.discrepancies.filter(d => d.type === 'ROW_TOTAL_ARITHMETIC');
    expect(rowMathErrors.length).toBeGreaterThan(0);
    // Savitri Bai has total=250 written, but sum is 200
    const savitriError = rowMathErrors.find(e => e.memberName === 'Savitri Bai');
    expect(savitriError).toBeDefined();
    expect(savitriError?.severity).toBe('HIGH');
  });

  it('flags spoken vs written savings mismatch', () => {
    const report = reconcileAccounts({
      spokenTransactions: MOCK_SPOKEN_TRANSACTIONS,
      registerData: MOCK_REGISTER_DATA,
      members: MOCK_SHG_MEMBERS,
    });

    // Radha Bai spoke ₹300, register written ₹200
    const savingsMismatch = report.discrepancies.find(
      d => d.type === 'SAVINGS_MISMATCH' && d.memberName === 'Radha Bai'
    );
    expect(savingsMismatch).toBeDefined();
    expect(savingsMismatch?.spokenValue).toBe(300);
    expect(savingsMismatch?.writtenValue).toBe(200);
  });

  it('flags spoken vs written loan repayment mismatch', () => {
    const report = reconcileAccounts({
      spokenTransactions: MOCK_SPOKEN_TRANSACTIONS,
      registerData: MOCK_REGISTER_DATA,
      members: MOCK_SHG_MEMBERS,
    });

    // Meena Patel spoke ₹500 loan repaid, register recorded ₹400
    const loanMismatch = report.discrepancies.find(
      d => d.type === 'LOAN_REPAID_MISMATCH' && d.memberName === 'Meena Patel'
    );
    expect(loanMismatch).toBeDefined();
    expect(loanMismatch?.spokenValue).toBe(500);
    expect(loanMismatch?.writtenValue).toBe(400);
  });

  it('checks and flags cash-in-box mismatch', () => {
    const report = reconcileAccounts({
      spokenTransactions: MOCK_SPOKEN_TRANSACTIONS,
      registerData: MOCK_REGISTER_DATA,
      members: MOCK_SHG_MEMBERS,
    });

    const cashCheck = report.invariantChecks.find(i => i.id === 'inv_cash_in_box');
    expect(cashCheck).toBeDefined();
    expect(cashCheck?.passed).toBe(false);
  });

  it('flags loan balance continuity error if repayment exceeds total balance', () => {
    // Geeta has openingLoanBalance of 1500; if register writes 2000 loan repayment:
    const modifiedRegister = JSON.parse(JSON.stringify(MOCK_REGISTER_DATA));
    const geetaRow = modifiedRegister.rows.find((r: any) => r.memberName === 'Geeta Verma');
    geetaRow.loanRepaid = 2000;

    const report = reconcileAccounts({
      spokenTransactions: MOCK_SPOKEN_TRANSACTIONS,
      registerData: modifiedRegister,
      members: MOCK_SHG_MEMBERS,
    });

    const continuityErr = report.discrepancies.find(d => d.type === 'LOAN_BALANCE_CONTINUITY');
    expect(continuityErr).toBeDefined();
    expect(continuityErr?.memberName).toBe('Geeta Verma');
  });
});

describe('Hindi & English Spoken Number Normalizer', () => {
  it('parses numbers in Hindi and English words', () => {
    expect(parseSpokenNumberWord('do sau')).toBe(200);
    expect(parseSpokenNumberWord('paanch sau')).toBe(500);
    expect(parseSpokenNumberWord('ek hazaar')).toBe(1000);
    expect(parseSpokenNumberWord('dedh sau')).toBe(150);
    expect(parseSpokenNumberWord('dhai sau')).toBe(250);
    expect(parseSpokenNumberWord('pachaas rupaye')).toBe(50);
  });

  it('handles in-flight spoken corrections properly', () => {
    // "no, 300, not 200"
    const res1 = resolveSpokenCorrection('no, 300, not 200');
    expect(res1?.amount).toBe(300);
    expect(res1?.wasCorrected).toBe(true);

    // "200 nahi 300 likho"
    const res2 = resolveSpokenCorrection('200 nahi 300 likho');
    expect(res2?.amount).toBe(300);
    expect(res2?.wasCorrected).toBe(true);

    // "arre 500 nahi 400 hai"
    const res3 = resolveSpokenCorrection('arre 500 nahi 400 hai');
    expect(res3?.amount).toBe(400);
    expect(res3?.wasCorrected).toBe(true);
  });
});
