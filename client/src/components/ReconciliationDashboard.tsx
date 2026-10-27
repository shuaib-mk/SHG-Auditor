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
  ShieldAlert,
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
      <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
        <p style={{ color: 'var(--text-muted)' }}>
          Please complete Meeting Audio and Register Photo to run reconciliation.
        </p>
      </div>
    );
  }

  const allResolvedOrClean =
    report.discrepancies.length === 0 ||
    report.discrepancies.every((d) => d.status !== 'PENDING');

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'HIGH':
        return <span className="badge badge-high"><AlertOctagon size={12} /> {t.severityHigh}</span>;
      case 'MEDIUM':
        return <span className="badge badge-medium"><AlertTriangle size={12} /> {t.severityMedium}</span>;
      default:
        return <span className="badge badge-low"><Info size={12} /> {t.severityLow}</span>;
    }
  };

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
      {/* Summary Header Card */}
      <div className="card" style={{ borderLeft: report.discrepancies.length === 0 ? '6px solid var(--accent)' : '6px solid var(--danger)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {report.discrepancies.length === 0 ? (
                <CheckCircle size={24} color="var(--accent)" />
              ) : (
                <ShieldAlert size={24} color="var(--danger)" />
              )}
              <h2 style={{ fontSize: '18px', fontWeight: 800 }}>
                {report.discrepancies.length === 0 ? t.allMatched : t.discrepanciesFound}
              </h2>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>
              Meeting: <strong>{report.shgName}</strong> • Date: {report.meetingDate} • Total Members: {report.summary.totalMembers}
            </p>
          </div>

          <button
            onClick={onProceedToExport}
            className="btn-accent"
            disabled={!allResolvedOrClean}
            style={{ opacity: allResolvedOrClean ? 1 : 0.6 }}
          >
            <span>Proceed to Export</span>
            <ArrowRight size={16} />
          </button>
        </div>

        {/* Totals Comparison Overview */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--border-color)' }}>
          <div style={{ background: 'var(--bg-subtle)', padding: '10px 14px', borderRadius: 'var(--radius-md)' }}>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Total Spoken (Audio)</span>
            <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--primary)' }}>
              ₹{report.summary.totalSpokenCash}
            </div>
          </div>
          <div style={{ background: 'var(--bg-subtle)', padding: '10px 14px', borderRadius: 'var(--radius-md)' }}>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Written in Register</span>
            <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)' }}>
              ₹{report.summary.totalWrittenCash}
            </div>
          </div>
          <div style={{ background: 'var(--bg-subtle)', padding: '10px 14px', borderRadius: 'var(--radius-md)' }}>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Arithmetic True Sum</span>
            <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--accent)' }}>
              ₹{report.summary.totalCalculatedCash}
            </div>
          </div>
          <div style={{ background: 'var(--bg-subtle)', padding: '10px 14px', borderRadius: 'var(--radius-md)' }}>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Flagged Discrepancies</span>
            <div style={{ fontSize: '18px', fontWeight: 800, color: report.summary.discrepancyCount > 0 ? 'var(--danger)' : 'var(--accent)' }}>
              {report.summary.discrepancyCount}
            </div>
          </div>
        </div>
      </div>

      {/* Discrepancies List with Evidence & Resolution Buttons */}
      {report.discrepancies.length > 0 && (
        <div style={{ marginBottom: '24px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '12px' }}>
            Flagged Items Requiring Confirmation ({report.discrepancies.length})
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {report.discrepancies.map((d) => {
              const isResolved = d.status !== 'PENDING';

              return (
                <div
                  key={d.id}
                  className="card"
                  style={{
                    margin: 0,
                    padding: '16px',
                    border: isResolved ? '1px solid var(--accent)' : '1px solid var(--border-color)',
                    background: isResolved ? 'rgba(5, 150, 105, 0.03)' : 'var(--bg-card)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {getSeverityBadge(d.severity)}
                      <strong style={{ fontSize: '15px' }}>{d.memberName}</strong>
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>({d.field})</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {/* Evidence Button */}
                      <button
                        onClick={() => onOpenEvidence(d)}
                        className="btn-secondary"
                        style={{ padding: '6px 12px', fontSize: '12px' }}
                      >
                        <Search size={14} color="var(--primary)" />
                        <span>{t.viewEvidence}</span>
                      </button>

                      {isResolved && (
                        <span className="badge badge-success">
                          <Check size={12} /> {t.resolved} ({d.resolvedValue !== undefined ? `₹${d.resolvedValue}` : d.status})
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Description */}
                  <p style={{ fontSize: '14px', color: 'var(--text-primary)', marginBottom: '12px' }}>
                    {lang === 'hi' && d.descriptionHi ? d.descriptionHi : d.description}
                  </p>

                  {/* Resolution Controls */}
                  {!isResolved ? (
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center', background: 'var(--bg-subtle)', padding: '10px 14px', borderRadius: 'var(--radius-md)' }}>
                      <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)' }}>
                        Action:
                      </span>

                      {d.spokenValue !== undefined && (
                        <button
                          onClick={() => onResolveDiscrepancy(d.id, 'RESOLVED_SPOKEN', d.spokenValue)}
                          className="btn-secondary"
                          style={{ padding: '6px 12px', fontSize: '13px' }}
                        >
                          <span>{t.acceptSpoken} (₹{d.spokenValue})</span>
                        </button>
                      )}

                      {d.writtenValue !== undefined && (
                        <button
                          onClick={() => onResolveDiscrepancy(d.id, 'RESOLVED_WRITTEN', d.writtenValue)}
                          className="btn-secondary"
                          style={{ padding: '6px 12px', fontSize: '13px' }}
                        >
                          <span>{t.acceptWritten} (₹{d.writtenValue})</span>
                        </button>
                      )}

                      {editingId === d.id ? (
                        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                          <input
                            type="number"
                            value={manualInput}
                            onChange={(e) => setManualInput(e.target.value)}
                            style={{ width: '90px', padding: '6px 8px', borderRadius: '4px', border: '1px solid var(--border-color)', fontSize: '13px' }}
                            autoFocus
                          />
                          <button
                            onClick={() => submitManualEdit(d)}
                            className="btn-primary"
                            style={{ padding: '6px 12px', fontSize: '12px', minHeight: '34px' }}
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            className="btn-secondary"
                            style={{ padding: '6px 10px', fontSize: '12px', minHeight: '34px' }}
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => startManualEdit(d)}
                          className="btn-secondary"
                          style={{ padding: '6px 12px', fontSize: '13px' }}
                        >
                          <Edit2 size={13} />
                          <span>{t.manualEdit}</span>
                        </button>
                      )}
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Invariant Mathematical Checks */}
      <div className="card">
        <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '14px' }}>
          {t.invariantChecks}
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '10px' }}>
          {report.invariantChecks.map((inv) => (
            <div
              key={inv.id}
              style={{
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                padding: '12px 14px',
                background: inv.passed ? 'var(--bg-card)' : 'var(--danger-light)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                {inv.passed ? (
                  <CheckCircle size={16} color="var(--accent)" />
                ) : (
                  <AlertOctagon size={16} color="var(--danger)" />
                )}
                <span style={{ fontWeight: 700, fontSize: '14px', color: inv.passed ? 'var(--text-primary)' : 'var(--danger)' }}>
                  {inv.name}
                </span>
              </div>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                {inv.message}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
