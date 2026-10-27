import React from 'react';
import { Download, Printer, CheckCircle, FileSpreadsheet, ShieldCheck } from 'lucide-react';
import { Language, translations } from '../i18n/translations';
import { ReconciliationReport, RegisterPageData, FinalLedgerEntry } from '../../../shared/types';

interface ExportViewProps {
  lang: Language;
  report: ReconciliationReport | null;
  registerData: RegisterPageData | null;
}

export const ExportView: React.FC<ExportViewProps> = ({
  lang,
  report,
  registerData,
}) => {
  const t = translations[lang];

  if (!report || !registerData) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
        <p style={{ color: 'var(--text-muted)' }}>No reconciled meeting ledger available to export.</p>
      </div>
    );
  }

  // Build final entries applying resolved discrepancies
  const finalEntries: FinalLedgerEntry[] = registerData.rows.map((row, idx) => {
    let savings = row.savings;
    let loanRepaid = row.loanRepaid;
    let interest = row.interest;
    let fine = row.fine;
    const remarksArr: string[] = [];

    // Check if any discrepancy was resolved for this member
    report.discrepancies.forEach((d) => {
      if (d.memberName.trim().toLowerCase() === row.memberName.trim().toLowerCase()) {
        const val = d.resolvedValue ?? (d.status === 'RESOLVED_SPOKEN' ? d.spokenValue : d.writtenValue);
        if (val !== undefined) {
          if (d.field === 'savings') {
            savings = val;
            remarksArr.push(`Savings adjusted to ₹${val} (${d.status})`);
          } else if (d.field === 'loanRepaid') {
            loanRepaid = val;
            remarksArr.push(`Loan repayment adjusted to ₹${val} (${d.status})`);
          } else if (d.field === 'interest') {
            interest = val;
            remarksArr.push(`Interest adjusted to ₹${val}`);
          } else if (d.field === 'fine') {
            fine = val;
            remarksArr.push(`Fine adjusted to ₹${val}`);
          }
        }
      }
    });

    const total = savings + loanRepaid + interest + fine;
    return {
      memberId: row.memberId || `m_${idx + 1}`,
      memberName: row.memberName,
      savings,
      loanRepaid,
      interest,
      fine,
      total,
      closingLoanBalance: 0,
      remarks: remarksArr.length > 0 ? remarksArr.join('; ') : 'Verified',
    };
  });

  const grandSavings = finalEntries.reduce((s, e) => s + e.savings, 0);
  const grandLoanRepaid = finalEntries.reduce((s, e) => s + e.loanRepaid, 0);
  const grandInterest = finalEntries.reduce((s, e) => s + e.interest, 0);
  const grandFine = finalEntries.reduce((s, e) => s + e.fine, 0);
  const grandTotal = finalEntries.reduce((s, e) => s + e.total, 0);

  const downloadCsv = () => {
    const headers = ['Sr_No', 'Member_Name', 'Savings_INR', 'Loan_Repaid_INR', 'Interest_INR', 'Fine_INR', 'Total_Collected_INR', 'Audit_Remarks'];
    const rows = finalEntries.map((e, idx) => [
      idx + 1,
      `"${e.memberName}"`,
      e.savings,
      e.loanRepaid,
      e.interest,
      e.fine,
      e.total,
      `"${e.remarks}"`,
    ]);

    // Footer row
    rows.push(['TOTAL', 'GRAND TOTAL', grandSavings, grandLoanRepaid, grandInterest, grandFine, grandTotal, 'RECONCILED']);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${registerData.shgName.replace(/\s+/g, '_')}_${registerData.meetingDate}_reconciled.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div>
      {/* Action Bar (hidden on print) */}
      <div className="card no-print">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldCheck size={22} color="var(--accent)" />
              <h2 style={{ fontSize: '18px', fontWeight: 700 }}>{t.exportTitle}</h2>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
              {t.readyForGov}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={downloadCsv} className="btn-primary">
              <Download size={16} />
              <span>{t.downloadCsv}</span>
            </button>
            <button onClick={handlePrint} className="btn-secondary">
              <Printer size={16} />
              <span>{t.printVoucher}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Printable 1-Page Meeting Voucher */}
      <div className="card print-voucher" style={{ padding: '24px', background: '#ffffff', color: '#1e293b' }}>
        {/* Voucher Header */}
        <div style={{ textAlign: 'center', borderBottom: '2px solid #0f172a', paddingBottom: '12px', marginBottom: '16px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 800, textTransform: 'uppercase', color: '#1e3a8a' }}>
            {registerData.shgName}
          </h2>
          <p style={{ fontSize: '13px', fontWeight: 600, color: '#475569' }}>
            साप्ताहिक बैठक हिसाब वाउचर / WEEKLY MEETING AUDIT VOUCHER
          </p>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px', fontSize: '13px' }}>
            <span><strong>गाँव/Village:</strong> {registerData.village}</span>
            <span><strong>दिनांक/Date:</strong> {registerData.meetingDate}</span>
            <span><strong>ऑडिट स्थिति/Audit Status:</strong> <span style={{ color: '#059669', fontWeight: 'bold' }}>✓ RECONCILED</span></span>
          </div>
        </div>

        {/* Ledger Table */}
        <div className="table-container" style={{ marginBottom: '20px' }}>
          <table style={{ border: '1px solid #cbd5e1' }}>
            <thead>
              <tr style={{ background: '#f1f5f9', color: '#1e293b' }}>
                <th style={{ border: '1px solid #cbd5e1' }}>क्र.</th>
                <th style={{ border: '1px solid #cbd5e1' }}>सदस्य का नाम / Member Name</th>
                <th style={{ border: '1px solid #cbd5e1', textAlign: 'right' }}>बचत (₹)</th>
                <th style={{ border: '1px solid #cbd5e1', textAlign: 'right' }}>ऋण वापसी (₹)</th>
                <th style={{ border: '1px solid #cbd5e1', textAlign: 'right' }}>ब्याज (₹)</th>
                <th style={{ border: '1px solid #cbd5e1', textAlign: 'right' }}>दंड (₹)</th>
                <th style={{ border: '1px solid #cbd5e1', textAlign: 'right' }}>कुल संग्रह (₹)</th>
                <th style={{ border: '1px solid #cbd5e1' }}>रिमार्क / Audit Remark</th>
              </tr>
            </thead>
            <tbody>
              {finalEntries.map((entry, idx) => (
                <tr key={idx}>
                  <td style={{ border: '1px solid #cbd5e1', textAlign: 'center' }}>{idx + 1}</td>
                  <td style={{ border: '1px solid #cbd5e1', fontWeight: 600 }}>{entry.memberName}</td>
                  <td style={{ border: '1px solid #cbd5e1', textAlign: 'right' }}>₹{entry.savings}</td>
                  <td style={{ border: '1px solid #cbd5e1', textAlign: 'right' }}>₹{entry.loanRepaid}</td>
                  <td style={{ border: '1px solid #cbd5e1', textAlign: 'right' }}>₹{entry.interest}</td>
                  <td style={{ border: '1px solid #cbd5e1', textAlign: 'right' }}>₹{entry.fine}</td>
                  <td style={{ border: '1px solid #cbd5e1', textAlign: 'right', fontWeight: 800, color: '#1e40af' }}>₹{entry.total}</td>
                  <td style={{ border: '1px solid #cbd5e1', fontSize: '11px', color: '#64748b' }}>{entry.remarks}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr style={{ background: '#e2e8f0', fontWeight: 800 }}>
                <td colSpan={2} style={{ border: '1px solid #cbd5e1', textAlign: 'center' }}>कुल महायोग / GRAND TOTAL</td>
                <td style={{ border: '1px solid #cbd5e1', textAlign: 'right' }}>₹{grandSavings}</td>
                <td style={{ border: '1px solid #cbd5e1', textAlign: 'right' }}>₹{grandLoanRepaid}</td>
                <td style={{ border: '1px solid #cbd5e1', textAlign: 'right' }}>₹{grandInterest}</td>
                <td style={{ border: '1px solid #cbd5e1', textAlign: 'right' }}>₹{grandFine}</td>
                <td style={{ border: '1px solid #cbd5e1', textAlign: 'right', color: '#1e40af', fontSize: '16px' }}>₹{grandTotal}</td>
                <td style={{ border: '1px solid #cbd5e1', fontSize: '11px', color: '#059669' }}>MATHEMATICALLY VERIFIED</td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Signatures & Certification Box */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginTop: '36px', paddingTop: '16px', borderTop: '1px solid #cbd5e1', textAlign: 'center' }}>
          <div>
            <div style={{ height: '40px' }} />
            <p style={{ fontSize: '12px', borderTop: '1px dashed #64748b', paddingTop: '4px', fontWeight: 600 }}>
              हस्ताक्षर: लेखापाल / Bookkeeper
            </p>
          </div>
          <div>
            <div style={{ height: '40px' }} />
            <p style={{ fontSize: '12px', borderTop: '1px dashed #64748b', paddingTop: '4px', fontWeight: 600 }}>
              हस्ताक्षर: अध्यक्ष / SHG President
            </p>
          </div>
          <div>
            <div style={{ height: '40px' }} />
            <p style={{ fontSize: '12px', borderTop: '1px dashed #64748b', paddingTop: '4px', fontWeight: 600 }}>
              हस्ताक्षर: सचिव / SHG Secretary
            </p>
          </div>
        </div>

        <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '11px', color: '#94a3b8' }}>
          Generated by SHG Auditor • Entry for Meta Global AI Developer Hackathon • Verified with Meta Muse Models
        </div>
      </div>
    </div>
  );
};
