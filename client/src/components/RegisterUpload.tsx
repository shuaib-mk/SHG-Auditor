import React, { useState } from 'react';
import { Camera, Upload, Sparkles, AlertTriangle, Eye, ArrowRight, Edit2, Check } from 'lucide-react';
import { Language, translations } from '../i18n/translations';
import { RegisterPageData, RegisterRow } from '../../../shared/types';

interface RegisterUploadProps {
  lang: Language;
  registerData: RegisterPageData | null;
  setRegisterData: (data: RegisterPageData) => void;
  registerImageUrl: string | null;
  setRegisterImageUrl: (url: string | null) => void;
  onProceedToReconcile: () => void;
}

export const RegisterUpload: React.FC<RegisterUploadProps> = ({
  lang,
  registerData,
  setRegisterData,
  registerImageUrl,
  setRegisterImageUrl,
  onProceedToReconcile,
}) => {
  const t = translations[lang];
  const [isLoading, setIsLoading] = useState(false);
  const [showImagePreview, setShowImagePreview] = useState(true);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const objectUrl = URL.createObjectURL(file);
    setRegisterImageUrl(objectUrl);
    await processRegisterImage(file);
  };

  const processRegisterImage = async (file: File) => {
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('image', file);

      const res = await fetch('/api/read-register', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) throw new Error('Vision processing failed');
      const data = await res.json();
      setRegisterData(data.registerData);
    } catch (err) {
      console.error('Error reading register image:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const loadSampleRegister = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/read-register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      const data = await res.json();
      setRegisterData(data.registerData);
      setRegisterImageUrl('/api/seed/register-image.svg');
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const updateCell = (rowIndex: number, field: keyof RegisterRow, value: number) => {
    if (!registerData) return;
    const updatedRows = [...registerData.rows];
    updatedRows[rowIndex] = {
      ...updatedRows[rowIndex],
      [field]: value,
    };

    // Recalculate row total
    const row = updatedRows[rowIndex];
    row.total = row.savings + row.loanRepaid + row.interest + row.fine;

    setRegisterData({
      ...registerData,
      rows: updatedRows,
    });
  };

  return (
    <div>
      {/* Step Header */}
      <div style={{ marginBottom: '14px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)' }}>
          {t.step2Title}
        </h2>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
          {t.step2Desc}
        </p>
      </div>

      {/* Main Upload / Snap Card */}
      <div className="surface-card">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px' }}>
          <label className="btn-touch-primary" style={{ cursor: 'pointer', textAlign: 'center', justifyContent: 'center' }}>
            <Camera size={20} />
            <span>{t.takePhoto}</span>
            <input type="file" accept="image/*" capture="environment" onChange={handleFileUpload} style={{ display: 'none' }} />
          </label>

          <label className="btn-touch-secondary" style={{ cursor: 'pointer', textAlign: 'center', justifyContent: 'center' }}>
            <Upload size={18} />
            <span>{t.uploadFile}</span>
            <input type="file" accept="image/*" onChange={handleFileUpload} style={{ display: 'none' }} />
          </label>
        </div>

        {/* 1-Tap Demo Sample Button */}
        <button
          onClick={loadSampleRegister}
          className="btn-touch-secondary"
          disabled={isLoading}
          style={{ width: '100%', borderRadius: 'var(--radius-full)', background: 'var(--bg-subtle)' }}
        >
          <Sparkles size={16} color="var(--primary)" />
          <span>{t.loadSampleRegister}</span>
        </button>

        {isLoading && (
          <div style={{ textAlign: 'center', padding: '16px 0', color: 'var(--primary)', fontWeight: 700, fontSize: '13px' }}>
            ⏳ {t.processingRegister}
          </div>
        )}
      </div>

      {/* Register Photo Preview */}
      {showImagePreview && registerImageUrl && (
        <div className="surface-card" style={{ padding: '10px', textAlign: 'center' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)' }}>
              {lang === 'hi' ? 'रजिस्टर की फोटो:' : 'Notebook Photo:'}
            </span>
            <button
              onClick={() => setShowImagePreview(!showImagePreview)}
              style={{ fontSize: '12px', color: 'var(--primary)', fontWeight: 600 }}
            >
              {showImagePreview ? (lang === 'hi' ? 'छिपाएं' : 'Hide') : (lang === 'hi' ? 'दिखाएं' : 'Show')}
            </button>
          </div>
          <div style={{ border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', overflow: 'hidden', maxHeight: '200px', background: '#faf8f5' }}>
            <img
              src={registerImageUrl}
              alt="Handwritten SHG Register"
              style={{ width: '100%', height: 'auto', objectFit: 'contain' }}
            />
          </div>
        </div>
      )}

      {/* Structured OCR Table Preview with Confidence Highlight */}
      {registerData && (
        <div style={{ marginBottom: '16px' }}>
          <div style={{ padding: '8px 12px', background: 'var(--saffron-light)', color: 'var(--saffron)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: 700, marginBottom: '12px' }}>
            <AlertTriangle size={14} style={{ flexShrink: 0 }} />
            <span>{t.lowConfidenceWarning}</span>
          </div>

          {/* Mobile-Friendly Horizontal Scroll Table */}
          <div className="table-container" style={{ background: 'var(--bg-card)', marginBottom: '16px' }}>
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>{t.tableMember}</th>
                  <th>{t.tableSavings}</th>
                  <th>{t.tableLoanRepaid}</th>
                  <th>{t.tableInterest}</th>
                  <th>{t.tableFine}</th>
                  <th>{t.tableTotal}</th>
                </tr>
              </thead>
              <tbody>
                {registerData.rows.map((row, idx) => {
                  const isSavingsLow = (row.confidence?.savings ?? 1) < 0.8;
                  const isLoanLow = (row.confidence?.loanRepaid ?? 1) < 0.8;
                  const isIntLow = (row.confidence?.interest ?? 1) < 0.8;
                  const isFineLow = (row.confidence?.fine ?? 1) < 0.8;

                  return (
                    <tr key={idx}>
                      <td style={{ color: 'var(--text-muted)', fontWeight: 600 }}>{idx + 1}</td>
                      <td style={{ fontWeight: 700 }}>{row.memberName}</td>

                      {/* Savings */}
                      <td className={isSavingsLow ? 'cell-low-confidence' : ''}>
                        <input
                          type="number"
                          value={row.savings}
                          onChange={(e) => updateCell(idx, 'savings', parseFloat(e.target.value) || 0)}
                          style={{ width: '65px', padding: '4px', border: 'none', background: 'transparent', fontWeight: 800, fontSize: '13px' }}
                        />
                      </td>

                      {/* Loan Repaid */}
                      <td className={isLoanLow ? 'cell-low-confidence' : ''}>
                        <input
                          type="number"
                          value={row.loanRepaid}
                          onChange={(e) => updateCell(idx, 'loanRepaid', parseFloat(e.target.value) || 0)}
                          style={{ width: '65px', padding: '4px', border: 'none', background: 'transparent', fontWeight: 800, fontSize: '13px' }}
                        />
                      </td>

                      {/* Interest */}
                      <td className={isIntLow ? 'cell-low-confidence' : ''}>
                        <input
                          type="number"
                          value={row.interest}
                          onChange={(e) => updateCell(idx, 'interest', parseFloat(e.target.value) || 0)}
                          style={{ width: '55px', padding: '4px', border: 'none', background: 'transparent', fontWeight: 800, fontSize: '13px' }}
                        />
                      </td>

                      {/* Fine */}
                      <td className={isFineLow ? 'cell-low-confidence' : ''}>
                        <input
                          type="number"
                          value={row.fine}
                          onChange={(e) => updateCell(idx, 'fine', parseFloat(e.target.value) || 0)}
                          style={{ width: '50px', padding: '4px', border: 'none', background: 'transparent', fontWeight: 800, fontSize: '13px' }}
                        />
                      </td>

                      {/* Total */}
                      <td style={{ fontWeight: 800, color: 'var(--primary)', fontSize: '14px' }}>
                        ₹{row.total}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr style={{ background: 'var(--bg-subtle)', fontWeight: 800 }}>
                  <td colSpan={2}>{t.grandTotal}</td>
                  <td>₹{registerData.totals.savings}</td>
                  <td>₹{registerData.totals.loanRepaid}</td>
                  <td>₹{registerData.totals.interest}</td>
                  <td>₹{registerData.totals.fine}</td>
                  <td style={{ color: 'var(--primary)', fontSize: '15px' }}>
                    ₹{registerData.totals.grandTotal}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Big Action Button to Run Reconciliation */}
          <button onClick={onProceedToReconcile} className="btn-touch-accent">
            <span>{t.runReconcile} →</span>
          </button>
        </div>
      )}
    </div>
  );
};
