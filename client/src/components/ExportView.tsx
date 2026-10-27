import React from 'react';
import { Download, Printer, ShieldCheck, FileSpreadsheet } from 'lucide-react';
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
      <div className="surface-card" style={{ textAlign: 'center', padding: '36px 16px' }}>
        <p style={{ color: 'var(--text-muted)' }}>
          {lang === 'hi' ? 'कोई हिसाब उपलब्ध नहीं है।' : 'No reconciled meeting ledger available to export.'}
        </p>
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

    report.discrepancies.forEach((d) => {
      if (d.memberName.trim().toLowerCase() === row.memberName.trim().toLowerCase()) {
        const val = d.resolvedValue ?? (d.status === 'RESOLVED_SPOKEN' ? d.spokenValue : d.writtenValue);
        if (val !== undefined) {
          if (d.field === 'savings') {
            savings = val;
            remarksArr.push(`Savings: ₹${val}`);
          } else if (d.field === 'loanRepaid') {
            loanRepaid = val;
            remarksArr.push(`Loan: ₹${val}`);
          } else if (d.field === 'interest') {
            interest = val;
            remarksArr.push(`Interest: ₹${val}`);
          } else if (d.field === 'fine') {
            fine = val;
            remarksArr.push(`Fine: ₹${val}`);
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
      remarks: remarksArr.length > 0 ? remarksArr.join('; ') : 'OK',
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

    rows.push(['TOTAL', 'GRAND TOTAL', grandSavings, grandLoanRepaid, grandInterest, grandFine, grandTotal, 'RECONCILED']);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${registerData.shgName.replace(/\s+/g, '_')}_${registerData.meetingDate}_verified.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div>
      {/* Header Info */}
      <div style={{ marginBottom: '14px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)' }}>
          {t.step4Title}
        </h2>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
          {t.step4Desc}
        </p>
      </div>

      {/* Action Buttons */}
      <div className="surface-card no-print" style={{ padding: '16px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <button onClick={downloadCsv} className="btn-touch-accent">
            <Download size={18} />
            <span>{t.downloadCsv}</span>
          </button>

          <button onClick={handlePrint} className="btn-touch-secondary" style={{ width: '100%' }}>
            <Printer size={18} />
            <span>{t.printVoucher}</span>
          </button>
        </div>
      </div>

      {/* Printable 1-Page Official Voucher Card */}
      <div className="surface-card print-voucher" style={{ padding: '18px', background: '#ffffff', color: '#1c1917' }}>
        <div style={{ textAlign: 'center', borderBottom: '2px solid #1e3a8a', paddingBottom: '10px', marginBottom: '12px' }}>
          <h3 style={{ fontSize: '17px', fontWeight: 800, color: '#1e3a8a', textTransform: 'uppercase' }}>
            {registerData.shgName}
          </h3>
          <p style={{ fontSize: '12px', fontWeight: 600, color: '#44403c' }}>
            {lang === 'hi' ? 'साप्ताहिक बैठक हिसाब वाउचर' : 'WEEKLY MEETING RECONCILIATION VOUCHER'}
          </p>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginTop: '6px', color: '#78716c' }}>
            <span><strong>गाँव/Village:</strong> {registerData.village}</span>
            <span><strong>दिनांक/Date:</strong> {registerData.meetingDate}</span>
          </div>
        </div>

        {/* Totals Summary Chips */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px', marginBottom: '12px', textAlign: 'center' }}>
          <div style={{ background: '#f8fafc', padding: '6px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '10px', color: '#64748b' }}>कुल बचत</div>
            <div style={{ fontSize: '13px', fontWeight: 800, color: '#1e3a8a' }}>₹{grandSavings}</div>
          </div>
          <div style={{ background: '#f8fafc', padding: '6px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '10px', color: '#64748b' }}>ऋण वापसी</div>
            <div style={{ fontSize: '13px', fontWeight: 800, color: '#1e3a8a' }}>₹{grandLoanRepaid}</div>
          </div>
          <div style={{ background: '#ecfdf5', padding: '6px', borderRadius: '6px', border: '1px solid #a7f3d0' }}>
            <div style={{ fontSize: '10px', color: '#047857' }}>महायोग</div>
            <div style={{ fontSize: '14px', fontWeight: 800, color: '#047857' }}>₹{grandTotal}</div>
          </div>
        </div>

        {/* Member Table */}
        <div className="table-container" style={{ marginBottom: '16px' }}>
          <table>
            <thead>
              <tr style={{ background: '#f1f5f9' }}>
                <th>#</th>
                <th>सदस्य / Member</th>
                <th style={{ textAlign: 'right' }}>बचत</th>
                <th style={{ textAlign: 'right' }}>किस्त</th>
                <th style={{ textAlign: 'right' }}>ब्याज</th>
                <th style={{ textAlign: 'right' }}>कुल</th>
              </tr>
            </thead>
            <tbody>
              {finalEntries.map((e, idx) => (
                <tr key={idx}>
                  <td>{idx + 1}</td>
                  <td style={{ fontWeight: 700 }}>{e.memberName}</td>
                  <td style={{ textAlign: 'right' }}>₹{e.savings}</td>
                  <td style={{ textAlign: 'right' }}>₹{e.loanRepaid}</td>
                  <td style={{ textAlign: 'right' }}>₹{e.interest}</td>
                  <td style={{ textAlign: 'right', fontWeight: 800, color: '#1e3a8a' }}>₹{e.total}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr style={{ background: '#e2e8f0', fontWeight: 800 }}>
                <td colSpan={2}>कुल योग</td>
                <td style={{ textAlign: 'right' }}>₹{grandSavings}</td>
                <td style={{ textAlign: 'right' }}>₹{grandLoanRepaid}</td>
                <td style={{ textAlign: 'right' }}>₹{grandInterest}</td>
                <td style={{ textAlign: 'right', color: '#1e3a8a', fontSize: '14px' }}>₹{grandTotal}</td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Signatures */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginTop: '24px', textAlign: 'center', fontSize: '11px' }}>
          <div>
            <div style={{ height: '30px' }} />
            <div style={{ borderTop: '1px dashed #78716c', paddingTop: '4px', fontWeight: 700 }}>लेखापाल</div>
          </div>
          <div>
            <div style={{ height: '30px' }} />
            <div style={{ borderTop: '1px dashed #78716c', paddingTop: '4px', fontWeight: 700 }}>अध्यक्ष</div>
          </div>
          <div>
            <div style={{ height: '30px' }} />
            <div style={{ borderTop: '1px dashed #78716c', paddingTop: '4px', fontWeight: 700 }}>सचिव</div>
          </div>
        </div>
      </div>
    </div>
  );
};
