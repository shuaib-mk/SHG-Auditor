import React, { useState } from 'react';
import { Camera, Upload, Sparkles, AlertTriangle, Eye, ArrowRight } from 'lucide-react';
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
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: 700 }}>{t.step2}</h2>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
            Muse Spark Vision OCR • Per-Cell Confidence • Fixed SHG Ledger Template
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={loadSampleRegister} className="btn-secondary" disabled={isLoading}>
            <Sparkles size={16} color="var(--primary)" />
            <span>{t.loadSampleRegister}</span>
          </button>
        </div>
      </div>

      {/* Upload Controls */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <label className="btn-primary" style={{ cursor: 'pointer' }}>
          <Upload size={18} />
          <span>{t.uploadFile}</span>
          <input type="file" accept="image/*" onChange={handleFileUpload} style={{ display: 'none' }} />
        </label>
        <label className="btn-secondary" style={{ cursor: 'pointer' }}>
          <Camera size={18} />
          <span>{t.takePhoto}</span>
          <input type="file" accept="image/*" capture="environment" onChange={handleFileUpload} style={{ display: 'none' }} />
        </label>
        {registerImageUrl && (
          <button
            onClick={() => setShowImagePreview(!showImagePreview)}
            className="btn-secondary"
          >
            <Eye size={16} />
            <span>{showImagePreview ? 'Hide Register Photo' : 'Show Register Photo'}</span>
          </button>
        )}
      </div>

      {isLoading && (
        <div style={{ textAlign: 'center', padding: '24px', color: 'var(--primary)', fontWeight: 600 }}>
          ⏳ {t.processingRegister}
        </div>
      )}

      {/* Visual Register Ledger Preview */}
      {showImagePreview && registerImageUrl && (
        <div style={{ marginBottom: '20px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', overflow: 'hidden', textAlign: 'center', background: '#faf8f5', padding: '10px' }}>
          <img
            src={registerImageUrl}
            alt="Handwritten SHG Register"
            style={{ maxWidth: '100%', maxHeight: '340px', objectFit: 'contain', borderRadius: '4px' }}
          />
        </div>
      )}

      {/* Structured OCR Table Preview with Confidence Highlight */}
      {registerData && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertTriangle size={16} color="var(--warning)" />
              <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                {t.lowConfidenceWarning}
              </span>
            </div>
            <button onClick={onProceedToReconcile} className="btn-accent" style={{ padding: '8px 16px', fontSize: '14px' }}>
              <span>{t.runReconcile}</span>
              <ArrowRight size={16} />
            </button>
          </div>

          <div className="table-container">
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
                      <td style={{ color: 'var(--text-muted)' }}>{idx + 1}</td>
                      <td style={{ fontWeight: 600 }}>{row.memberName}</td>

                      {/* Savings Cell */}
                      <td className={isSavingsLow ? 'cell-low-confidence' : ''}>
                        <input
                          type="number"
                          value={row.savings}
                          onChange={(e) => updateCell(idx, 'savings', parseFloat(e.target.value) || 0)}
                          style={{ width: '80px', padding: '4px 6px', border: 'none', background: 'transparent', fontWeight: 'bold' }}
                          title={`Confidence: ${Math.round((row.confidence?.savings ?? 1) * 100)}%`}
                        />
                      </td>

                      {/* Loan Repaid Cell */}
                      <td className={isLoanLow ? 'cell-low-confidence' : ''}>
                        <input
                          type="number"
                          value={row.loanRepaid}
                          onChange={(e) => updateCell(idx, 'loanRepaid', parseFloat(e.target.value) || 0)}
                          style={{ width: '80px', padding: '4px 6px', border: 'none', background: 'transparent', fontWeight: 'bold' }}
                          title={`Confidence: ${Math.round((row.confidence?.loanRepaid ?? 1) * 100)}%`}
                        />
                      </td>

                      {/* Interest Cell */}
                      <td className={isIntLow ? 'cell-low-confidence' : ''}>
                        <input
                          type="number"
                          value={row.interest}
                          onChange={(e) => updateCell(idx, 'interest', parseFloat(e.target.value) || 0)}
                          style={{ width: '70px', padding: '4px 6px', border: 'none', background: 'transparent', fontWeight: 'bold' }}
                          title={`Confidence: ${Math.round((row.confidence?.interest ?? 1) * 100)}%`}
                        />
                      </td>

                      {/* Fine Cell */}
                      <td className={isFineLow ? 'cell-low-confidence' : ''}>
                        <input
                          type="number"
                          value={row.fine}
                          onChange={(e) => updateCell(idx, 'fine', parseFloat(e.target.value) || 0)}
                          style={{ width: '60px', padding: '4px 6px', border: 'none', background: 'transparent', fontWeight: 'bold' }}
                          title={`Confidence: ${Math.round((row.confidence?.fine ?? 1) * 100)}%`}
                        />
                      </td>

                      {/* Row Total */}
                      <td style={{ fontWeight: 800, color: 'var(--primary)' }}>
                        ₹{row.total}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr style={{ background: 'var(--bg-subtle)', fontWeight: 800 }}>
                  <td colSpan={2}>{t.grandTotal} (Register Footer)</td>
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
        </div>
      )}
    </div>
  );
};
