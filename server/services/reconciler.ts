import {
  SpokenTransaction,
  RegisterPageData,
  RegisterRow,
  SHGMember,
  Discrepancy,
  DiscrepancyType,
  DiscrepancySeverity,
  InvariantCheck,
  ReconciliationReport,
} from '../../shared/types.js';

export interface ReconcileOptions {
  spokenTransactions: SpokenTransaction[];
  registerData: RegisterPageData;
  members: SHGMember[];
  interestRatePercent?: number; // e.g. 2%
}

/**
 * Deterministic Reconciliation Engine for Indian SHG Accounts.
 * Executed in strict TypeScript arithmetic logic (zero LLM hallucination).
 */
export function reconcileAccounts(options: ReconcileOptions): ReconciliationReport {
  const {
    spokenTransactions,
    registerData,
    members,
    interestRatePercent = 2.0,
  } = options;

  const discrepancies: Discrepancy[] = [];
  const invariantChecks: InvariantCheck[] = [];

  // Group spoken transactions by member and transaction type
  // Map key: `${memberName.toLowerCase()}_${type}`
  const spokenAggregates = new Map<string, { totalAmount: number; txs: SpokenTransaction[] }>();

  for (const tx of spokenTransactions) {
    const key = `${tx.memberName.trim().toLowerCase()}_${tx.type}`;
    const existing = spokenAggregates.get(key) || { totalAmount: 0, txs: [] };
    existing.totalAmount += tx.amount;
    existing.txs.push(tx);
    spokenAggregates.set(key, existing);
  }

  // Map members by normalized name for quick lookup
  const memberMap = new Map<string, SHGMember>();
  for (const m of members) {
    memberMap.set(m.name.trim().toLowerCase(), m);
  }

  // 1. Per-Member Row Checks: Compare Spoken vs Written & Row Total Invariants
  for (let rowIndex = 0; rowIndex < registerData.rows.length; rowIndex++) {
    const row = registerData.rows[rowIndex];
    const normName = row.memberName.trim().toLowerCase();
    const memberProfile = memberMap.get(normName);

    // --- Invariant 1: Row Total Arithmetic ---
    const expectedRowTotal =
      (row.savings || 0) +
      (row.loanRepaid || 0) +
      (row.interest || 0) +
      (row.fine || 0);

    if (row.total !== expectedRowTotal) {
      const diff = row.total - expectedRowTotal;
      discrepancies.push({
        id: `disc_row_math_${rowIndex}`,
        type: 'ROW_TOTAL_ARITHMETIC',
        severity: 'HIGH',
        memberName: row.memberName,
        field: 'total',
        writtenValue: row.total,
        difference: diff,
        description: `Row arithmetic mismatch for ${row.memberName}: Register writes ₹${row.total}, but sum of cells (Savings: ₹${row.savings} + Loan: ₹${row.loanRepaid} + Interest: ₹${row.interest} + Fine: ₹${row.fine}) equals ₹${expectedRowTotal}.`,
        descriptionHi: `${row.memberName} की पंक्ति का योग गलत है: रजिस्टर में कुल ₹${row.total} लिखा है, जबकि घटकों का सही जोड़ ₹${expectedRowTotal} है।`,
        status: 'PENDING',
        evidence: {
          cellLocation: {
            row: rowIndex + 1,
            col: 'Total',
            bbox: row.cellBoxes?.['total'],
          },
        },
      });
    }

    // --- Cross-Check: Savings Spoken vs Written ---
    const savingsKey = `${normName}_savings`;
    const spokenSavingsEntry = spokenAggregates.get(savingsKey);
    const spokenSavings = spokenSavingsEntry ? spokenSavingsEntry.totalAmount : 0;
    const latestSavingsTx = spokenSavingsEntry?.txs[spokenSavingsEntry.txs.length - 1];

    if (spokenSavingsEntry && spokenSavings !== row.savings) {
      discrepancies.push({
        id: `disc_savings_${rowIndex}`,
        type: 'SAVINGS_MISMATCH',
        severity: 'MEDIUM',
        memberName: row.memberName,
        field: 'savings',
        spokenValue: spokenSavings,
        writtenValue: row.savings,
        difference: spokenSavings - row.savings,
        description: `Savings discrepancy for ${row.memberName}: Spoken during meeting was ₹${spokenSavings}, but written in register as ₹${row.savings}.`,
        descriptionHi: `${row.memberName} की बचत में अंतर: बैठक में ₹${spokenSavings} बोला गया, लेकिन रजिस्टर में ₹${row.savings} लिखा गया।`,
        status: 'PENDING',
        evidence: {
          transcriptSnippet: latestSavingsTx?.transcriptSnippet,
          audioSnippetStartMs: latestSavingsTx?.startMs,
          audioSnippetEndMs: latestSavingsTx?.endMs,
          cellLocation: {
            row: rowIndex + 1,
            col: 'Savings',
            bbox: row.cellBoxes?.['savings'],
          },
        },
      });
    }

    // --- Cross-Check: Loan Repaid Spoken vs Written ---
    const loanRepaidKey = `${normName}_loan_repaid`;
    const spokenLoanRepaidEntry = spokenAggregates.get(loanRepaidKey);
    const spokenLoanRepaid = spokenLoanRepaidEntry ? spokenLoanRepaidEntry.totalAmount : 0;
    const latestLoanTx = spokenLoanRepaidEntry?.txs[spokenLoanRepaidEntry.txs.length - 1];

    if (spokenLoanRepaidEntry && spokenLoanRepaid !== row.loanRepaid) {
      discrepancies.push({
        id: `disc_loan_${rowIndex}`,
        type: 'LOAN_REPAID_MISMATCH',
        severity: 'HIGH',
        memberName: row.memberName,
        field: 'loanRepaid',
        spokenValue: spokenLoanRepaid,
        writtenValue: row.loanRepaid,
        difference: spokenLoanRepaid - row.loanRepaid,
        description: `Loan repayment mismatch for ${row.memberName}: Spoken amount was ₹${spokenLoanRepaid}, but register records ₹${row.loanRepaid}.`,
        descriptionHi: `${row.memberName} के ऋण भुगतान में अंतर: मौखिक रूप से ₹${spokenLoanRepaid} कहा गया, किंतु रजिस्टर में ₹${row.loanRepaid} दर्ज है।`,
        status: 'PENDING',
        evidence: {
          transcriptSnippet: latestLoanTx?.transcriptSnippet,
          audioSnippetStartMs: latestLoanTx?.startMs,
          audioSnippetEndMs: latestLoanTx?.endMs,
          cellLocation: {
            row: rowIndex + 1,
            col: 'Loan Repaid',
            bbox: row.cellBoxes?.['loanRepaid'],
          },
        },
      });
    } else if (!spokenLoanRepaidEntry && row.loanRepaid > 0) {
      // Entry written in register but never spoken in meeting audio
      discrepancies.push({
        id: `disc_unspoken_loan_${rowIndex}`,
        type: 'UNSPOKEN_ENTRY',
        severity: 'HIGH',
        memberName: row.memberName,
        field: 'loanRepaid',
        writtenValue: row.loanRepaid,
        spokenValue: 0,
        difference: -row.loanRepaid,
        description: `Unspoken loan repayment recorded for ${row.memberName}: Register has ₹${row.loanRepaid}, but no loan repayment was confirmed in meeting audio.`,
        descriptionHi: `${row.memberName} के लिए अनकहा ऋण भुगतान: रजिस्टर में ₹${row.loanRepaid} लिखा है, पर बैठक ऑडियो में इसका कोई उल्लेख नहीं है।`,
        status: 'PENDING',
        evidence: {
          cellLocation: {
            row: rowIndex + 1,
            col: 'Loan Repaid',
            bbox: row.cellBoxes?.['loanRepaid'],
          },
        },
      });
    }

    // --- Cross-Check: Interest Spoken vs Written ---
    const interestKey = `${normName}_interest`;
    const spokenInterestEntry = spokenAggregates.get(interestKey);
    const spokenInterest = spokenInterestEntry ? spokenInterestEntry.totalAmount : 0;
    const latestInterestTx = spokenInterestEntry?.txs[spokenInterestEntry.txs.length - 1];

    if (spokenInterestEntry && spokenInterest !== row.interest) {
      discrepancies.push({
        id: `disc_interest_${rowIndex}`,
        type: 'INTEREST_MISMATCH',
        severity: 'MEDIUM',
        memberName: row.memberName,
        field: 'interest',
        spokenValue: spokenInterest,
        writtenValue: row.interest,
        difference: spokenInterest - row.interest,
        description: `Interest mismatch for ${row.memberName}: Spoken ₹${spokenInterest}, written ₹${row.interest}.`,
        descriptionHi: `${row.memberName} का ब्याज असंगत: बोला गया ₹${spokenInterest}, लिखा गया ₹${row.interest}।`,
        status: 'PENDING',
        evidence: {
          transcriptSnippet: latestInterestTx?.transcriptSnippet,
          audioSnippetStartMs: latestInterestTx?.startMs,
          audioSnippetEndMs: latestInterestTx?.endMs,
          cellLocation: {
            row: rowIndex + 1,
            col: 'Interest',
            bbox: row.cellBoxes?.['interest'],
          },
        },
      });
    }

    // --- Cross-Check: Fine Spoken vs Written ---
    const fineKey = `${normName}_fine`;
    const spokenFineEntry = spokenAggregates.get(fineKey);
    const spokenFine = spokenFineEntry ? spokenFineEntry.totalAmount : 0;
    const latestFineTx = spokenFineEntry?.txs[spokenFineEntry.txs.length - 1];

    if (spokenFineEntry && spokenFine !== row.fine) {
      discrepancies.push({
        id: `disc_fine_${rowIndex}`,
        type: 'FINE_MISMATCH',
        severity: 'LOW',
        memberName: row.memberName,
        field: 'fine',
        spokenValue: spokenFine,
        writtenValue: row.fine,
        difference: spokenFine - row.fine,
        description: `Penalty/Fine discrepancy for ${row.memberName}: Spoken ₹${spokenFine}, written ₹${row.fine}.`,
        descriptionHi: `${row.memberName} के जुर्माने में अंतर: बोला गया ₹${spokenFine}, लिखा गया ₹${row.fine}।`,
        status: 'PENDING',
        evidence: {
          transcriptSnippet: latestFineTx?.transcriptSnippet,
          audioSnippetStartMs: latestFineTx?.startMs,
          audioSnippetEndMs: latestFineTx?.endMs,
          cellLocation: {
            row: rowIndex + 1,
            col: 'Fine',
            bbox: row.cellBoxes?.['fine'],
          },
        },
      });
    }

    // --- Invariant 2: Loan Continuity & Balance Invariant ---
    if (memberProfile && memberProfile.openingLoanBalance > 0) {
      if (row.loanRepaid > memberProfile.openingLoanBalance) {
        discrepancies.push({
          id: `disc_continuity_${rowIndex}`,
          type: 'LOAN_BALANCE_CONTINUITY',
          severity: 'HIGH',
          memberName: row.memberName,
          field: 'loanRepaid',
          writtenValue: row.loanRepaid,
          difference: row.loanRepaid - memberProfile.openingLoanBalance,
          description: `Loan continuity error for ${row.memberName}: Repayment of ₹${row.loanRepaid} exceeds total outstanding loan balance of ₹${memberProfile.openingLoanBalance}.`,
          descriptionHi: `${row.memberName} के ऋण संतुलन में त्रुटि: भुगतान ₹${row.loanRepaid} कुल बकाया राशि ₹${memberProfile.openingLoanBalance} से अधिक है।`,
          status: 'PENDING',
          evidence: {
            cellLocation: {
              row: rowIndex + 1,
              col: 'Loan Repaid',
              bbox: row.cellBoxes?.['loanRepaid'],
            },
          },
        });
      }
    }
  }

  // 2. Unwritten Entries: Spoken transactions in audio that have no corresponding row/amount in register
  const registerNames = new Set(registerData.rows.map(r => r.memberName.trim().toLowerCase()));
  for (const [key, aggregate] of spokenAggregates.entries()) {
    const [normName, type] = key.split('_');
    const matchedRow = registerData.rows.find(r => r.memberName.trim().toLowerCase() === normName);

    if (!matchedRow) {
      discrepancies.push({
        id: `disc_unwritten_member_${normName}`,
        type: 'UNWRITTEN_ENTRY',
        severity: 'HIGH',
        memberName: aggregate.txs[0].memberName,
        field: type,
        spokenValue: aggregate.totalAmount,
        writtenValue: 0,
        difference: aggregate.totalAmount,
        description: `Spoken transaction for ${aggregate.txs[0].memberName} (${type}: ₹${aggregate.totalAmount}) not found in written register rows.`,
        descriptionHi: `${aggregate.txs[0].memberName} का लेनदेन (${type}: ₹${aggregate.totalAmount}) रजिस्टर में दर्ज नहीं है।`,
        status: 'PENDING',
        evidence: {
          transcriptSnippet: aggregate.txs[0].transcriptSnippet,
          audioSnippetStartMs: aggregate.txs[0].startMs,
          audioSnippetEndMs: aggregate.txs[0].endMs,
        },
      });
    }
  }

  // 3. Invariant 3: Column Total Arithmetic Checks
  let actualColSavings = 0;
  let actualColLoanRepaid = 0;
  let actualColInterest = 0;
  let actualColFine = 0;
  let actualGrandTotal = 0;

  for (const row of registerData.rows) {
    actualColSavings += row.savings || 0;
    actualColLoanRepaid += row.loanRepaid || 0;
    actualColInterest += row.interest || 0;
    actualColFine += row.fine || 0;
    actualGrandTotal += row.total || 0;
  }

  // Savings column total check
  const savingsPassed = actualColSavings === registerData.totals.savings;
  invariantChecks.push({
    id: 'inv_col_savings',
    name: 'Total Savings Column',
    passed: savingsPassed,
    expected: actualColSavings,
    actual: registerData.totals.savings,
    difference: registerData.totals.savings - actualColSavings,
    message: savingsPassed
      ? `Savings column matches perfectly (₹${actualColSavings})`
      : `Savings column arithmetic mismatch: Register footer claims ₹${registerData.totals.savings}, but sum of member savings is ₹${actualColSavings}`,
  });

  if (!savingsPassed) {
    discrepancies.push({
      id: 'disc_col_savings',
      type: 'COL_TOTAL_ARITHMETIC',
      severity: 'HIGH',
      memberName: 'Column Footer',
      field: 'savings',
      writtenValue: registerData.totals.savings,
      difference: registerData.totals.savings - actualColSavings,
      description: `Savings column total arithmetic error: Register claims ₹${registerData.totals.savings}, but column items sum to ₹${actualColSavings}.`,
      descriptionHi: `बचत कॉलम का कुल जोड़ गलत: रजिस्टर में ₹${registerData.totals.savings} लिखा है, पर सही जोड़ ₹${actualColSavings} है।`,
      status: 'PENDING',
      evidence: {
        cellLocation: { row: registerData.rows.length + 1, col: 'Savings Total' },
      },
    });
  }

  // Loan Repaid column total check
  const loanPassed = actualColLoanRepaid === registerData.totals.loanRepaid;
  invariantChecks.push({
    id: 'inv_col_loan',
    name: 'Total Loan Repaid Column',
    passed: loanPassed,
    expected: actualColLoanRepaid,
    actual: registerData.totals.loanRepaid,
    difference: registerData.totals.loanRepaid - actualColLoanRepaid,
    message: loanPassed
      ? `Loan repaid column matches perfectly (₹${actualColLoanRepaid})`
      : `Loan repaid column mismatch: Register claims ₹${registerData.totals.loanRepaid}, but sum of members is ₹${actualColLoanRepaid}`,
  });

  if (!loanPassed) {
    discrepancies.push({
      id: 'disc_col_loan',
      type: 'COL_TOTAL_ARITHMETIC',
      severity: 'HIGH',
      memberName: 'Column Footer',
      field: 'loanRepaid',
      writtenValue: registerData.totals.loanRepaid,
      difference: registerData.totals.loanRepaid - actualColLoanRepaid,
      description: `Loan repaid column total arithmetic error: Register claims ₹${registerData.totals.loanRepaid}, but column items sum to ₹${actualColLoanRepaid}.`,
      descriptionHi: `ऋण वापसी कॉलम का जोड़ गलत: रजिस्टर में ₹${registerData.totals.loanRepaid} लिखा है, पर सही जोड़ ₹${actualColLoanRepaid} है।`,
      status: 'PENDING',
      evidence: {
        cellLocation: { row: registerData.rows.length + 1, col: 'Loan Repaid Total' },
      },
    });
  }

  // Grand Total check
  const grandTotalPassed = actualGrandTotal === registerData.totals.grandTotal;
  invariantChecks.push({
    id: 'inv_grand_total',
    name: 'Grand Total Column',
    passed: grandTotalPassed,
    expected: actualGrandTotal,
    actual: registerData.totals.grandTotal,
    difference: registerData.totals.grandTotal - actualGrandTotal,
    message: grandTotalPassed
      ? `Grand total matches perfectly (₹${actualGrandTotal})`
      : `Grand total mismatch: Register claims ₹${registerData.totals.grandTotal}, actual sum is ₹${actualGrandTotal}`,
  });

  if (!grandTotalPassed) {
    discrepancies.push({
      id: 'disc_col_grand_total',
      type: 'COL_TOTAL_ARITHMETIC',
      severity: 'HIGH',
      memberName: 'Grand Total Footer',
      field: 'grandTotal',
      writtenValue: registerData.totals.grandTotal,
      difference: registerData.totals.grandTotal - actualGrandTotal,
      description: `Grand total mismatch: Register claims ₹${registerData.totals.grandTotal}, but row sums equal ₹${actualGrandTotal}.`,
      descriptionHi: `कुल महायोग गलत: रजिस्टर में ₹${registerData.totals.grandTotal} दर्ज है, पर वास्तविक योग ₹${actualGrandTotal} है।`,
      status: 'PENDING',
      evidence: {
        cellLocation: { row: registerData.rows.length + 1, col: 'Grand Total' },
      },
    });
  }

  // 4. Invariant 4: Cash-in-Box Invariant
  if (registerData.totals.cashInBox !== undefined) {
    const cashInBoxMatches = registerData.totals.cashInBox === actualGrandTotal;
    invariantChecks.push({
      id: 'inv_cash_in_box',
      name: 'Physical Cash in Meeting Box',
      passed: cashInBoxMatches,
      expected: actualGrandTotal,
      actual: registerData.totals.cashInBox,
      difference: registerData.totals.cashInBox - actualGrandTotal,
      message: cashInBoxMatches
        ? `Physical cash in box (₹${registerData.totals.cashInBox}) matches total collections`
        : `Cash in box discrepancy: Counted cash is ₹${registerData.totals.cashInBox}, but calculated collection total is ₹${actualGrandTotal}`,
    });

    if (!cashInBoxMatches) {
      discrepancies.push({
        id: 'disc_cash_in_box',
        type: 'CASH_IN_BOX_MISMATCH',
        severity: 'HIGH',
        memberName: 'Cash Box / तिजोरी',
        field: 'cashInBox',
        writtenValue: registerData.totals.cashInBox,
        difference: registerData.totals.cashInBox - actualGrandTotal,
        description: `Cash in box mismatch: Physical cash count is ₹${registerData.totals.cashInBox}, but total member collections equal ₹${actualGrandTotal}. Deficit/Surplus: ₹${registerData.totals.cashInBox - actualGrandTotal}.`,
        descriptionHi: `तिजोरी की नकद राशि में अंतर: भौतिक नकद ₹${registerData.totals.cashInBox} है, जबकि कुल संग्रह ₹${actualGrandTotal} होना चाहिए।`,
        status: 'PENDING',
        evidence: {
          cellLocation: { row: registerData.rows.length + 2, col: 'Cash in Box' },
        },
      });
    }
  }

  // Calculate totals
  let totalSpokenCash = 0;
  for (const tx of spokenTransactions) {
    if (tx.type !== 'loan_given') {
      totalSpokenCash += tx.amount;
    }
  }

  const highSeverityCount = discrepancies.filter(d => d.severity === 'HIGH').length;

  return {
    timestamp: new Date().toISOString(),
    shgName: registerData.shgName || 'Self Help Group',
    meetingDate: registerData.meetingDate || new Date().toISOString().split('T')[0],
    discrepancies,
    invariantChecks,
    summary: {
      totalMembers: registerData.rows.length,
      totalSpokenCash,
      totalWrittenCash: registerData.totals.grandTotal,
      totalCalculatedCash: actualGrandTotal,
      discrepancyCount: discrepancies.length,
      highSeverityCount,
      status: discrepancies.length === 0 ? 'ALL_MATCH' : 'DISCREPANCIES_FOUND',
    },
  };
}
