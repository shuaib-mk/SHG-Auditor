import {
  SHGMember,
  Utterance,
  SpokenTransaction,
  RegisterPageData,
  EvaluationResult,
} from '../../shared/types.js';

export const MOCK_SHG_MEMBERS: SHGMember[] = [
  { id: 'm1', name: 'Sunita Devi', openingSavings: 4200, openingLoanBalance: 3000 },
  { id: 'm2', name: 'Radha Bai', openingSavings: 3800, openingLoanBalance: 2000 },
  { id: 'm3', name: 'Anita Sharma', openingSavings: 5100, openingLoanBalance: 0 },
  { id: 'm4', name: 'Meena Patel', openingSavings: 4600, openingLoanBalance: 4500 },
  { id: 'm5', name: 'Geeta Verma', openingSavings: 3900, openingLoanBalance: 1500 },
  { id: 'm6', name: 'Savitri Bai', openingSavings: 4400, openingLoanBalance: 0 },
  { id: 'm7', name: 'Rekha Yadav', openingSavings: 3200, openingLoanBalance: 2500 },
  { id: 'm8', name: 'Pushpa Devi', openingSavings: 4800, openingLoanBalance: 1000 },
];

export const MOCK_UTTERANCES: Utterance[] = [
  {
    id: 'utt_1',
    speaker: 'Speaker 1',
    speakerName: 'Sunita Devi (Secretary)',
    text: 'Namaste sabhi didiyon ko. Aaj Prerna Mahila SHG ki weekly baithak shuru karte hain. Sunita didi ka savings do sau rupaye jama hua.',
    startMs: 0,
    endMs: 7200,
    confidence: 0.98,
  },
  {
    id: 'utt_2',
    speaker: 'Speaker 2',
    speakerName: 'Radha Bai',
    text: 'Mera bhi bachat le lijiye. Main iss hafte teen sau rupaye de rahi hoon, do sau nahi, teen sau rupaye bachat.',
    startMs: 7500,
    endMs: 14200,
    confidence: 0.96,
  },
  {
    id: 'utt_3',
    speaker: 'Speaker 1',
    speakerName: 'Sunita Devi (Secretary)',
    text: 'Theek hai Radha didi, 300 rupaye bachat note kar liya. Aur Anita didi aapka?',
    startMs: 14500,
    endMs: 19800,
    confidence: 0.97,
  },
  {
    id: 'utt_4',
    speaker: 'Speaker 3',
    speakerName: 'Anita Sharma',
    text: 'Mera standard 200 rupaye savings. Koi karz nahi hai mera.',
    startMs: 20100,
    endMs: 24500,
    confidence: 0.99,
  },
  {
    id: 'utt_5',
    speaker: 'Speaker 4',
    speakerName: 'Meena Patel',
    text: 'Sunita didi, mera bachat 200 rupaye. Aur pichle loan ka repayment 500 rupaye aur 50 rupaye interest jama kar rahi hoon.',
    startMs: 24800,
    endMs: 33400,
    confidence: 0.95,
  },
  {
    id: 'utt_6',
    speaker: 'Speaker 1',
    speakerName: 'Sunita Devi (Secretary)',
    text: 'Haan Meena didi, 200 savings, 500 loan repaid, 50 rupaye byaaj. Geeta didi aapka?',
    startMs: 33700,
    endMs: 40200,
    confidence: 0.98,
  },
  {
    id: 'utt_7',
    speaker: 'Speaker 5',
    speakerName: 'Geeta Verma',
    text: 'Mera 200 bachat aur 300 loan repayment plus 30 interest. Par main 15 minute der se aayi toh 10 rupaye fine bhi de rahi hoon.',
    startMs: 40500,
    endMs: 48900,
    confidence: 0.94,
  },
  {
    id: 'utt_8',
    speaker: 'Speaker 6',
    speakerName: 'Savitri Bai',
    text: 'Savitri Bai: mera 200 rupaye bachat. Koi loan nahi.',
    startMs: 49200,
    endMs: 54100,
    confidence: 0.98,
  },
  {
    id: 'utt_9',
    speaker: 'Speaker 7',
    speakerName: 'Rekha Yadav',
    text: 'Rekha Yadav: 200 rupaye savings aur 400 rupaye karz wapsi aur 40 interest.',
    startMs: 54400,
    endMs: 61000,
    confidence: 0.96,
  },
  {
    id: 'utt_10',
    speaker: 'Speaker 8',
    speakerName: 'Pushpa Devi',
    text: 'Pushpa didi: mera 200 rupaye bachat aur 200 loan kist aur 20 byaaj.',
    startMs: 61300,
    endMs: 67800,
    confidence: 0.97,
  },
];

export const MOCK_SPOKEN_TRANSACTIONS: SpokenTransaction[] = [
  {
    id: 'stx_1',
    memberId: 'm1',
    memberName: 'Sunita Devi',
    type: 'savings',
    amount: 200,
    timestamp: '00:05',
    startMs: 0,
    endMs: 7200,
    transcriptSnippet: 'Sunita didi ka savings do sau rupaye jama hua.',
    speakerTag: 'Speaker 1',
    confidence: 0.98,
  },
  {
    id: 'stx_2',
    memberId: 'm2',
    memberName: 'Radha Bai',
    type: 'savings',
    amount: 300,
    timestamp: '00:11',
    startMs: 7500,
    endMs: 14200,
    transcriptSnippet: 'Main iss hafte teen sau rupaye de rahi hoon, do sau nahi, teen sau rupaye bachat.',
    speakerTag: 'Speaker 2',
    confidence: 0.96,
  },
  {
    id: 'stx_3',
    memberId: 'm3',
    memberName: 'Anita Sharma',
    type: 'savings',
    amount: 200,
    timestamp: '00:22',
    startMs: 20100,
    endMs: 24500,
    transcriptSnippet: 'Mera standard 200 rupaye savings. Koi karz nahi hai mera.',
    speakerTag: 'Speaker 3',
    confidence: 0.99,
  },
  {
    id: 'stx_4',
    memberId: 'm4',
    memberName: 'Meena Patel',
    type: 'savings',
    amount: 200,
    timestamp: '00:26',
    startMs: 24800,
    endMs: 33400,
    transcriptSnippet: 'Sunita didi, mera bachat 200 rupaye.',
    speakerTag: 'Speaker 4',
    confidence: 0.95,
  },
  {
    id: 'stx_5',
    memberId: 'm4',
    memberName: 'Meena Patel',
    type: 'loan_repaid',
    amount: 500,
    timestamp: '00:29',
    startMs: 24800,
    endMs: 33400,
    transcriptSnippet: 'pichle loan ka repayment 500 rupaye',
    speakerTag: 'Speaker 4',
    confidence: 0.95,
  },
  {
    id: 'stx_6',
    memberId: 'm4',
    memberName: 'Meena Patel',
    type: 'interest',
    amount: 50,
    timestamp: '00:31',
    startMs: 24800,
    endMs: 33400,
    transcriptSnippet: 'aur 50 rupaye interest jama kar rahi hoon.',
    speakerTag: 'Speaker 4',
    confidence: 0.94,
  },
  {
    id: 'stx_7',
    memberId: 'm5',
    memberName: 'Geeta Verma',
    type: 'savings',
    amount: 200,
    timestamp: '00:42',
    startMs: 40500,
    endMs: 48900,
    transcriptSnippet: 'Mera 200 bachat',
    speakerTag: 'Speaker 5',
    confidence: 0.96,
  },
  {
    id: 'stx_8',
    memberId: 'm5',
    memberName: 'Geeta Verma',
    type: 'loan_repaid',
    amount: 300,
    timestamp: '00:44',
    startMs: 40500,
    endMs: 48900,
    transcriptSnippet: 'aur 300 loan repayment',
    speakerTag: 'Speaker 5',
    confidence: 0.95,
  },
  {
    id: 'stx_9',
    memberId: 'm5',
    memberName: 'Geeta Verma',
    type: 'interest',
    amount: 30,
    timestamp: '00:46',
    startMs: 40500,
    endMs: 48900,
    transcriptSnippet: 'plus 30 interest',
    speakerTag: 'Speaker 5',
    confidence: 0.96,
  },
  {
    id: 'stx_10',
    memberId: 'm5',
    memberName: 'Geeta Verma',
    type: 'fine',
    amount: 10,
    timestamp: '00:48',
    startMs: 40500,
    endMs: 48900,
    transcriptSnippet: '15 minute der se aayi toh 10 rupaye fine',
    speakerTag: 'Speaker 5',
    confidence: 0.93,
  },
  {
    id: 'stx_11',
    memberId: 'm6',
    memberName: 'Savitri Bai',
    type: 'savings',
    amount: 200,
    timestamp: '00:51',
    startMs: 49200,
    endMs: 54100,
    transcriptSnippet: 'mera 200 rupaye bachat.',
    speakerTag: 'Speaker 6',
    confidence: 0.98,
  },
  {
    id: 'stx_12',
    memberId: 'm7',
    memberName: 'Rekha Yadav',
    type: 'savings',
    amount: 200,
    timestamp: '00:56',
    startMs: 54400,
    endMs: 61000,
    transcriptSnippet: 'Rekha Yadav: 200 rupaye savings',
    speakerTag: 'Speaker 7',
    confidence: 0.96,
  },
  {
    id: 'stx_13',
    memberId: 'm7',
    memberName: 'Rekha Yadav',
    type: 'loan_repaid',
    amount: 400,
    timestamp: '00:58',
    startMs: 54400,
    endMs: 61000,
    transcriptSnippet: 'aur 400 rupaye karz wapsi',
    speakerTag: 'Speaker 7',
    confidence: 0.96,
  },
  {
    id: 'stx_14',
    memberId: 'm7',
    memberName: 'Rekha Yadav',
    type: 'interest',
    amount: 40,
    timestamp: '01:00',
    startMs: 54400,
    endMs: 61000,
    transcriptSnippet: 'aur 40 interest.',
    speakerTag: 'Speaker 7',
    confidence: 0.97,
  },
  {
    id: 'stx_15',
    memberId: 'm8',
    memberName: 'Pushpa Devi',
    type: 'savings',
    amount: 200,
    timestamp: '01:03',
    startMs: 61300,
    endMs: 67800,
    transcriptSnippet: 'Pushpa didi: mera 200 rupaye bachat',
    speakerTag: 'Speaker 8',
    confidence: 0.98,
  },
  {
    id: 'stx_16',
    memberId: 'm8',
    memberName: 'Pushpa Devi',
    type: 'loan_repaid',
    amount: 200,
    timestamp: '01:05',
    startMs: 61300,
    endMs: 67800,
    transcriptSnippet: 'aur 200 loan kist',
    speakerTag: 'Speaker 8',
    confidence: 0.97,
  },
  {
    id: 'stx_17',
    memberId: 'm8',
    memberName: 'Pushpa Devi',
    type: 'interest',
    amount: 20,
    timestamp: '01:07',
    startMs: 61300,
    endMs: 67800,
    transcriptSnippet: 'aur 20 byaaj.',
    speakerTag: 'Speaker 8',
    confidence: 0.98,
  },
];

/**
 * Realistic handwritten register page data containing intentional real-world discrepancies:
 * 1. Radha Bai: Written Savings = 200 (Spoken was 300) -> SAVINGS_MISMATCH
 * 2. Meena Patel: Written Loan Repaid = 400 (Spoken was 500) -> LOAN_REPAID_MISMATCH
 * 3. Savitri Bai: Written Total = 250, but Savings=200, loan=0, int=0, fine=0 -> ROW_TOTAL_ARITHMETIC
 * 4. Register Grand Total says 3550 instead of 3340 -> COL_TOTAL_ARITHMETIC
 */
export const MOCK_REGISTER_DATA: RegisterPageData = {
  meetingDate: '2026-10-24',
  shgName: 'Prerna Mahila Samruddhi SHG',
  village: 'Rampur Gram Panchayat',
  rows: [
    {
      memberId: 'm1',
      memberName: 'Sunita Devi',
      savings: 200,
      loanRepaid: 0,
      interest: 0,
      fine: 0,
      total: 200,
      confidence: { savings: 0.98, loanRepaid: 0.99, interest: 0.99, fine: 0.99, total: 0.98 },
      cellBoxes: {
        savings: { x: 180, y: 120, w: 90, h: 32 },
        loanRepaid: { x: 280, y: 120, w: 90, h: 32 },
        interest: { x: 380, y: 120, w: 90, h: 32 },
        fine: { x: 480, y: 120, w: 90, h: 32 },
        total: { x: 580, y: 120, w: 90, h: 32 },
      },
    },
    {
      memberId: 'm2',
      memberName: 'Radha Bai',
      savings: 200, // Discrepancy: Spoken was 300
      loanRepaid: 0,
      interest: 0,
      fine: 0,
      total: 200,
      confidence: { savings: 0.72, loanRepaid: 0.99, interest: 0.99, fine: 0.99, total: 0.94 }, // Low confidence on written 200
      cellBoxes: {
        savings: { x: 180, y: 160, w: 90, h: 32 },
        loanRepaid: { x: 280, y: 160, w: 90, h: 32 },
        interest: { x: 380, y: 160, w: 90, h: 32 },
        fine: { x: 480, y: 160, w: 90, h: 32 },
        total: { x: 580, y: 160, w: 90, h: 32 },
      },
    },
    {
      memberId: 'm3',
      memberName: 'Anita Sharma',
      savings: 200,
      loanRepaid: 0,
      interest: 0,
      fine: 0,
      total: 200,
      confidence: { savings: 0.98, loanRepaid: 0.99, interest: 0.99, fine: 0.99, total: 0.98 },
      cellBoxes: {
        savings: { x: 180, y: 200, w: 90, h: 32 },
        loanRepaid: { x: 280, y: 200, w: 90, h: 32 },
        interest: { x: 380, y: 200, w: 90, h: 32 },
        fine: { x: 480, y: 200, w: 90, h: 32 },
        total: { x: 580, y: 200, w: 90, h: 32 },
      },
    },
    {
      memberId: 'm4',
      memberName: 'Meena Patel',
      savings: 200,
      loanRepaid: 400, // Discrepancy: Spoken was 500
      interest: 50,
      fine: 0,
      total: 650,
      confidence: { savings: 0.97, loanRepaid: 0.65, interest: 0.95, fine: 0.99, total: 0.92 }, // Low confidence on 400
      cellBoxes: {
        savings: { x: 180, y: 240, w: 90, h: 32 },
        loanRepaid: { x: 280, y: 240, w: 90, h: 32 },
        interest: { x: 380, y: 240, w: 90, h: 32 },
        fine: { x: 480, y: 240, w: 90, h: 32 },
        total: { x: 580, y: 240, w: 90, h: 32 },
      },
    },
    {
      memberId: 'm5',
      memberName: 'Geeta Verma',
      savings: 200,
      loanRepaid: 300,
      interest: 30,
      fine: 10,
      total: 540,
      confidence: { savings: 0.98, loanRepaid: 0.97, interest: 0.96, fine: 0.94, total: 0.96 },
      cellBoxes: {
        savings: { x: 180, y: 280, w: 90, h: 32 },
        loanRepaid: { x: 280, y: 280, w: 90, h: 32 },
        interest: { x: 380, y: 280, w: 90, h: 32 },
        fine: { x: 480, y: 280, w: 90, h: 32 },
        total: { x: 580, y: 280, w: 90, h: 32 },
      },
    },
    {
      memberId: 'm6',
      memberName: 'Savitri Bai',
      savings: 200,
      loanRepaid: 0,
      interest: 0,
      fine: 0,
      total: 250, // Discrepancy: Sum is 200, row total written is 250
      confidence: { savings: 0.98, loanRepaid: 0.99, interest: 0.99, fine: 0.99, total: 0.88 },
      cellBoxes: {
        savings: { x: 180, y: 320, w: 90, h: 32 },
        loanRepaid: { x: 280, y: 320, w: 90, h: 32 },
        interest: { x: 380, y: 320, w: 90, h: 32 },
        fine: { x: 480, y: 320, w: 90, h: 32 },
        total: { x: 580, y: 320, w: 90, h: 32 },
      },
    },
    {
      memberId: 'm7',
      memberName: 'Rekha Yadav',
      savings: 200,
      loanRepaid: 400,
      interest: 40,
      fine: 0,
      total: 640,
      confidence: { savings: 0.98, loanRepaid: 0.96, interest: 0.95, fine: 0.99, total: 0.97 },
      cellBoxes: {
        savings: { x: 180, y: 360, w: 90, h: 32 },
        loanRepaid: { x: 280, y: 360, w: 90, h: 32 },
        interest: { x: 380, y: 360, w: 90, h: 32 },
        fine: { x: 480, y: 360, w: 90, h: 32 },
        total: { x: 580, y: 360, w: 90, h: 32 },
      },
    },
    {
      memberId: 'm8',
      memberName: 'Pushpa Devi',
      savings: 200,
      loanRepaid: 200,
      interest: 20,
      fine: 0,
      total: 420,
      confidence: { savings: 0.98, loanRepaid: 0.97, interest: 0.98, fine: 0.99, total: 0.98 },
      cellBoxes: {
        savings: { x: 180, y: 400, w: 90, h: 32 },
        loanRepaid: { x: 280, y: 400, w: 90, h: 32 },
        interest: { x: 380, y: 400, w: 90, h: 32 },
        fine: { x: 480, y: 400, w: 90, h: 32 },
        total: { x: 580, y: 400, w: 90, h: 32 },
      },
    },
  ],
  totals: {
    savings: 1600,
    loanRepaid: 1300,
    interest: 140,
    fine: 10,
    grandTotal: 3100, // Written grand total in footer (true sum of rows written is 3050 without savitri error, or 3100 with error)
    cashInBox: 3000,  // Physical cash count has deficit of 50-100!
  },
  imageWidth: 700,
  imageHeight: 520,
};

/**
 * Generate a realistic SVG register page representing a handwritten SHG meeting ledger.
 */
export function generateRegisterSvg(registerData: RegisterPageData = MOCK_REGISTER_DATA): string {
  const width = 720;
  const height = 520;
  let rowsSvg = '';

  registerData.rows.forEach((row, i) => {
    const y = 145 + i * 36;
    const isAlt = i % 2 === 1;
    const bgFill = isAlt ? '#faf7f2' : '#ffffff';
    rowsSvg += `
      <rect x="20" y="${y - 24}" width="680" height="34" fill="${bgFill}" stroke="#e2ded4" stroke-width="0.5"/>
      <text x="30" y="${y}" font-family="Arial, sans-serif" font-size="12" fill="#555">${i + 1}</text>
      <text x="60" y="${y}" font-family="'Segoe UI', cursive, sans-serif" font-weight="600" font-size="13" fill="#2d3748">${row.memberName}</text>
      <text x="210" y="${y}" font-family="'Courier New', monospace" font-size="13" fill="#1a202c">₹${row.savings}</text>
      <text x="310" y="${y}" font-family="'Courier New', monospace" font-size="13" fill="#1a202c">₹${row.loanRepaid}</text>
      <text x="410" y="${y}" font-family="'Courier New', monospace" font-size="13" fill="#1a202c">₹${row.interest}</text>
      <text x="510" y="${y}" font-family="'Courier New', monospace" font-size="13" fill="#1a202c">₹${row.fine}</text>
      <text x="610" y="${y}" font-family="'Courier New', monospace" font-weight="bold" font-size="13" fill="#2b6cb0">₹${row.total}</text>
    `;
  });

  const footerY = 145 + registerData.rows.length * 36 + 10;

  return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
      <!-- Paper background with aged texture feel -->
      <rect width="${width}" height="${height}" fill="#fdfbf7"/>
      <rect x="15" y="15" width="${width - 30}" height="${height - 30}" fill="#fffefb" stroke="#cbd5e0" stroke-width="2" rx="4"/>
      
      <!-- Ledger Header -->
      <text x="360" y="45" text-anchor="middle" font-family="'Segoe UI', sans-serif" font-size="18" font-weight="bold" fill="#1a365d">
        ${registerData.shgName.toUpperCase()}
      </text>
      <text x="360" y="68" text-anchor="middle" font-family="'Segoe UI', sans-serif" font-size="13" fill="#4a5568">
        गाँव/Village: ${registerData.village} | दिनांक/Date: ${registerData.meetingDate}
      </text>

      <!-- Table Header Box -->
      <rect x="20" y="85" width="680" height="34" fill="#edf2f7" stroke="#cbd5e0" stroke-width="1"/>
      <text x="30" y="106" font-family="sans-serif" font-size="11" font-weight="bold" fill="#2d3748">क्र./#</text>
      <text x="60" y="106" font-family="sans-serif" font-size="11" font-weight="bold" fill="#2d3748">सदस्य नाम / Member</text>
      <text x="210" y="106" font-family="sans-serif" font-size="11" font-weight="bold" fill="#2d3748">बचत / Savings</text>
      <text x="310" y="106" font-family="sans-serif" font-size="11" font-weight="bold" fill="#2d3748">ऋण वापसी / Loan</text>
      <text x="410" y="106" font-family="sans-serif" font-size="11" font-weight="bold" fill="#2d3748">ब्याज / Interest</text>
      <text x="510" y="106" font-family="sans-serif" font-size="11" font-weight="bold" fill="#2d3748">दंड / Fine</text>
      <text x="610" y="106" font-family="sans-serif" font-size="11" font-weight="bold" fill="#2d3748">कुल / Total</text>

      <!-- Data Rows -->
      ${rowsSvg}

      <!-- Footer / Totals Box -->
      <rect x="20" y="${footerY - 22}" width="680" height="36" fill="#ebf8ff" stroke="#90cdf4" stroke-width="1.5"/>
      <text x="60" y="${footerY}" font-family="sans-serif" font-weight="bold" font-size="13" fill="#2b6cb0">कुल योग / GRAND TOTAL</text>
      <text x="210" y="${footerY}" font-family="'Courier New', monospace" font-weight="bold" font-size="13" fill="#2b6cb0">₹${registerData.totals.savings}</text>
      <text x="310" y="${footerY}" font-family="'Courier New', monospace" font-weight="bold" font-size="13" fill="#2b6cb0">₹${registerData.totals.loanRepaid}</text>
      <text x="410" y="${footerY}" font-family="'Courier New', monospace" font-weight="bold" font-size="13" fill="#2b6cb0">₹${registerData.totals.interest}</text>
      <text x="510" y="${footerY}" font-family="'Courier New', monospace" font-weight="bold" font-size="13" fill="#2b6cb0">₹${registerData.totals.fine}</text>
      <text x="610" y="${footerY}" font-family="'Courier New', monospace" font-weight="bold" font-size="14" fill="#c53030">₹${registerData.totals.grandTotal}</text>

      <!-- Box Cash Count Note -->
      <text x="30" y="${footerY + 34}" font-family="sans-serif" font-size="11" fill="#718096">
        बॉक्स में कुल भौतिक नकद राशि / Physical Cash Counted in Box: ₹${registerData.totals.cashInBox || 0}
      </text>
    </svg>
  `;
}
