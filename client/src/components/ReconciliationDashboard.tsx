import React, { useState } from 'react';
import {
  CheckCircle,
  AlertOctagon,
  AlertTriangle,
  Info,
  Search,
  Check,
  Edit2,
  ArrowRight,
  Volume2,
  ShieldCheck,
} from 'lucide-react';
import { Language, translations } from '../i18n/translations';
import {
  ReconciliationReport,
  Discrepancy,
  InvariantCheck,
  ResolutionStatus,
} from '../../../shared/types';

interface ReconciliationDashboardProps {
  lang: Language;
  report: ReconciliationReport | null;
  onOpenEvidence: (discrepancy: Discrepancy) => void;
  onResolveDiscrepancy: (
    discrepancyId: string,
    status: ResolutionStatus,
    resolvedValue?: number
  ) => void;
  onProceedToExport: () => void;
}

export const ReconciliationDashboard: React.FC<ReconciliationDashboardProps> = ({
  lang,
  report,
  onOpenEvidence,
  onResolveDiscrepancy,
  onProceedToExport,
}) => {
  const t = translations[lang];
  const [editingId, setEditingId] = useState<string | null>(null);
  const [manualInput, setManualInput] = useState<string>('');

  if (!report) {
    return (
      <div className="surface-card" style={{ textAlign: 'center', padding: '36px 16px' }}>
        <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
          {lang === 'hi'
            ? 'कृपया पहले बैठक की आवाज़ और रजिस्टर फोटो अपलोड करें।'
            : 'Please complete Meeting Audio and Register Photo to check accounts.'}
        </p>
      </div>
    );
  }

  const allResolvedOrClean =
    report.discrepancies.length === 0 ||
    report.discrepancies.every((d) => d.status !== 'PENDING');

  const startManualEdit = (d: Discrepancy) => {
    setEditingId(d.id);
    setManualInput(String(d.spokenValue ?? d.writtenValue ?? 0));
  };

  const submitManualEdit = (d: Discrepancy) => {
    const val = parseFloat(manualInput) || 0;
    onResolveDiscrepancy(d.id, 'RESOLVED_MANUAL', val);
    setEditingId(null);
  };

  return (
    <div>
      {/* Header Status Card */}
      <div
        className="surface-card"
        style={{
          borderLeft:
            report.discrepancies.length === 0
              ? '6px solid var(--accent)'
              : '6px solid var(--saffron)',
          padding: '16px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
          {report.discrepancies.length === 0 ? (
            <CheckCircle size={26} color="var(--accent)" style={{ flexShrink: 0, marginTop: '2px' }} />
          ) : (
            <AlertTriangle size={26} color="var(--saffron)" style={{ flexShrink: 0, marginTop: '2px' }} />
          )}
          <div>
            <h2 style={{ fontSize: '17px', fontWeight: 800, color: 'var(--text-primary)' }}>
              {report.discrepancies.length === 0 ? t.allMatched : t.discrepanciesFound}
            </h2>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
              {report.discrepancies.length === 0 ? t.allMatchedDesc : t.discrepanciesDesc}
            </p>
          </div>
        </div>

        {/* Quick Summary Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '8px',
            marginTop: '14px',
            paddingTop: '12px',
            borderTop: '1px solid var(--border-color)',
            textAlign: 'center',
          }}
        >
          <div style={{ background: 'var(--bg-subtle)', padding: '8px 4px', borderRadius: 'var(--radius-sm)' }}>
            <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 700 }}>
              {lang === 'hi' ? 'बोला गया' : 'Spoken'}
            </span>
            <div style={{ fontSize: '15px', fontWeight: 800, color: 'var(--primary)' }}>
              ₹{report.summary.totalSpokenCash}
            </div>
          </div>

          <div style={{ background: 'var(--bg-subtle)', padding: '8px 4px', borderRadius: 'var(--radius-sm)' }}>
            <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 700 }}>
              {lang === 'hi' ? 'रजिस्टर' : 'In Book'}
            </span>
            <div style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-primary)' }}>
              ₹{report.summary.totalWrittenCash}
            </div>
          </div>

          <div style={{ background: 'var(--bg-subtle)', padding: '8px 4px', borderRadius: 'var(--radius-sm)' }}>
            <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 700 }}>
              {lang === 'hi' ? 'अंतर' : 'Flags'}
            </span>
            <div
              style={{
                fontSize: '15px',
                fontWeight: 800,
                color: report.summary.discrepancyCount > 0 ? 'var(--saffron)' : 'var(--accent)',
              }}
            >
              {report.summary.discrepancyCount}
            </div>
          </div>
        </div>
      </div>

      {/* Flagged Items to Resolve */}
      {report.discrepancies.length > 0 && (
        <div style={{ marginBottom: '16px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 800, marginBottom: '10px' }}>
            {lang === 'hi' ? 'कृपया जांचें और निर्णय लें:' : 'Review Differences:'}
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {report.discrepancies.map((d) => {
              const isResolved = d.status !== 'PENDING';

              return (
                <div
                  key={d.id}
                  className="surface-card"
                  style={{
                    margin: 0,
                    padding: '14px',
                    border: isResolved ? '1.5px solid var(--accent)' : '1px solid var(--border-color)',
                  }}
                >
                  {/* Card Title & Evidence Button */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div className="avatar-badge" style={{ width: '28px', height: '28px', fontSize: '12px' }}>
                        {d.memberName ? d.memberName[0] : '#'}
                      </div>
                      <strong style={{ fontSize: '14px' }}>{d.memberName}</strong>
                    </div>

                    <button
                      onClick={() => onOpenEvidence(d)}
                      className="btn-touch-secondary"
                      style={{ padding: '4px 10px', fontSize: '11px', minHeight: '30px', borderRadius: 'var(--radius-full)' }}
                    >
                      <Volume2 size={13} color="var(--primary)" />
                      <span>{t.viewEvidence}</span>
                    </button>
                  </div>

                  {/* Plain Language Explanation */}
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '10px' }}>
                    {lang === 'hi' && d.descriptionHi ? d.descriptionHi : d.description}
                  </p>

                  {/* Side-by-Side Comparison */}
                  <div className="compare-container">
                    <div className="compare-box">
                      <div className="compare-box-label">{lang === 'hi' ? 'कहा गया' : 'Said'}</div>
                      <div className="compare-box-value" style={{ color: 'var(--primary)' }}>
                        {d.spokenValue !== undefined ? `₹${d.spokenValue}` : '—'}
                      </div>
                    </div>

                    <div className="compare-box">
                      <div className="compare-box-label">{lang === 'hi' ? 'रजिस्टर' : 'Book'}</div>
                      <div className="compare-box-value" style={{ color: 'var(--text-primary)' }}>
                        {d.writtenValue !== undefined ? `₹${d.writtenValue}` : '—'}
                      </div>
                    </div>
                  </div>

                  {/* Decision Controls */}
                  {!isResolved ? (
                    <div style={{ display: 'grid', gridTemplateColumns: d.spokenValue !== undefined && d.writtenValue !== undefined ? '1fr 1fr' : '1fr', gap: '8px', marginTop: '10px' }}>
                      {d.spokenValue !== undefined && (
                        <button
                          onClick={() => onResolveDiscrepancy(d.id, 'RESOLVED_SPOKEN', d.spokenValue)}
                          className="btn-touch-primary"
                          style={{ minHeight: '44px', fontSize: '13px', padding: '8px 12px' }}
                        >
                          <Check size={14} />
                          <span>{t.acceptSpoken} (₹{d.spokenValue})</span>
                        </button>
                      )}

                      {d.writtenValue !== undefined && (
                        <button
                          onClick={() => onResolveDiscrepancy(d.id, 'RESOLVED_WRITTEN', d.writtenValue)}
                          className="btn-touch-secondary"
                          style={{ minHeight: '44px', fontSize: '13px', padding: '8px 12px' }}
                        >
                          <span>{t.acceptWritten} (₹{d.writtenValue})</span>
                        </button>
                      )}
                    </div>
                  ) : (
                    <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span className="pill-badge pill-badge-green" style={{ fontSize: '12px' }}>
                        <Check size={12} /> {t.resolved}: ₹{d.resolvedValue ?? (d.status === 'RESOLVED_SPOKEN' ? d.spokenValue : d.writtenValue)}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Arithmetic Invariants Summary */}
      <div className="surface-card">
        <h3 style={{ fontSize: '14px', fontWeight: 800, marginBottom: '8px' }}>
          {t.invariantChecks}
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {report.invariantChecks.map((inv) => (
            <div
              key={inv.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '6px 10px',
                background: 'var(--bg-subtle)',
                borderRadius: 'var(--radius-sm)',
                fontSize: '12px',
              }}
            >
              <span style={{ fontWeight: 600 }}>{inv.name}</span>
              <span style={{ color: inv.passed ? 'var(--accent)' : 'var(--danger)', fontWeight: 700 }}>
                {inv.passed ? '✓ Pass' : `Mismatch (₹${inv.difference})`}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Big Action Button to Proceed to Final Export */}
      <div style={{ marginTop: '16px' }}>
        <button
          onClick={onProceedToExport}
          className="btn-touch-accent"
          disabled={!allResolvedOrClean}
          style={{ opacity: allResolvedOrClean ? 1 : 0.6 }}
        >
          <span>{lang === 'hi' ? 'अगला: पक्का पर्चा देखें →' : 'Next: View Final Voucher →'}</span>
        </button>
      </div>
    </div>
  );
};
