export type TransactionType =
  | 'savings'
  | 'loan_given'
  | 'loan_repaid'
  | 'interest'
  | 'fine'
  | 'other';

export interface SHGMember {
  id: string;
  name: string;
  phone?: string;
  openingSavings: number;
  openingLoanBalance: number;
}

export interface Utterance {
  id: string;
  speaker: string; // e.g. "Speaker 1"
  speakerName?: string; // mapped name e.g. "Sunita Devi"
  text: string;
  startMs: number;
  endMs: number;
  confidence?: number;
}

export interface SpokenTransaction {
  id: string;
  memberId?: string;
  memberName: string;
  type: TransactionType;
  amount: number;
  timestamp: string; // e.g. "01:24"
  startMs?: number;
  endMs?: number;
  transcriptSnippet: string;
  speakerTag?: string;
  confidence?: number;
}

export interface CellConfidence {
  savings: number;
  loanRepaid: number;
  interest: number;
  fine: number;
  total: number;
}

export interface RegisterRow {
  memberId?: string;
  memberName: string;
  savings: number;
  loanRepaid: number;
  interest: number;
  fine: number;
  total: number;
  confidence: CellConfidence;
  cellBoxes?: Record<string, { x: number; y: number; w: number; h: number }>;
}

export interface RegisterTotals {
  savings: number;
  loanRepaid: number;
  interest: number;
  fine: number;
  grandTotal: number;
  cashInBox?: number;
}

export interface RegisterPageData {
  meetingDate: string;
  shgName: string;
  village: string;
  rows: RegisterRow[];
  totals: RegisterTotals;
  imageWidth?: number;
  imageHeight?: number;
}

export type DiscrepancySeverity = 'HIGH' | 'MEDIUM' | 'LOW';

export type DiscrepancyType =
  | 'SAVINGS_MISMATCH'
  | 'LOAN_REPAID_MISMATCH'
  | 'INTEREST_MISMATCH'
  | 'FINE_MISMATCH'
  | 'ROW_TOTAL_ARITHMETIC'
  | 'COL_TOTAL_ARITHMETIC'
  | 'CASH_IN_BOX_MISMATCH'
  | 'LOAN_BALANCE_CONTINUITY'
  | 'UNSPOKEN_ENTRY'
  | 'UNWRITTEN_ENTRY';

export type ResolutionStatus =
  | 'PENDING'
  | 'RESOLVED_SPOKEN'
  | 'RESOLVED_WRITTEN'
  | 'RESOLVED_MANUAL';

export interface DiscrepancyEvidence {
  transcriptSnippet?: string;
  audioSnippetStartMs?: number;
  audioSnippetEndMs?: number;
  cellLocation?: {
    row: number;
    col: string;
    bbox?: { x: number; y: number; w: number; h: number };
  };
}

export interface Discrepancy {
  id: string;
  type: DiscrepancyType;
  severity: DiscrepancySeverity;
  memberId?: string;
  memberName: string;
  field: string;
  spokenValue?: number;
  writtenValue?: number;
  difference?: number;
  description: string;
  descriptionHi?: string;
  status: ResolutionStatus;
  resolvedValue?: number;
  evidence: DiscrepancyEvidence;
}

export interface InvariantCheck {
  id: string;
  name: string;
  passed: boolean;
  expected: number;
  actual: number;
  difference: number;
  message: string;
}

export interface ReconciliationReport {
  timestamp: string;
  shgName: string;
  meetingDate: string;
  discrepancies: Discrepancy[];
  invariantChecks: InvariantCheck[];
  summary: {
    totalMembers: number;
    totalSpokenCash: number;
    totalWrittenCash: number;
    totalCalculatedCash: number;
    discrepancyCount: number;
    highSeverityCount: number;
    status: 'ALL_MATCH' | 'DISCREPANCIES_FOUND';
  };
}

export interface FinalLedgerEntry {
  memberId: string;
  memberName: string;
  savings: number;
  loanRepaid: number;
  interest: number;
  fine: number;
  total: number;
  closingLoanBalance: number;
  remarks: string;
}

export interface EvaluationResult {
  totalTestPages: number;
  totalPlantedDiscrepancies: number;
  truePositives: number;
  falsePositives: number;
  falseNegatives: number;
  precision: number;
  recall: number;
  f1Score: number;
  arithmeticAccuracy: number;
  tests: {
    testId: string;
    description: string;
    plantedCount: number;
    detectedCount: number;
    matched: boolean;
    flags: string[];
  }[];
}
