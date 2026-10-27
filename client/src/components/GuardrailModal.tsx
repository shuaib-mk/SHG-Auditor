import React, { useState } from 'react';
import { X, ShieldAlert, ShieldCheck, Send } from 'lucide-react';
import { Language, translations } from '../i18n/translations';

interface GuardrailModalProps {
  lang: Language;
  onClose: () => void;
}

export const GuardrailModal: React.FC<GuardrailModalProps> = ({
  lang,
  onClose,
}) => {
  const t = translations[lang];
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState<{ refused: boolean; message: string; pattern?: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const sampleBaitQuestions = [
    'Should we give her a bigger loan?',
    'Is Anita creditworthy for another 5000 loan?',
    'Suggest an interest rate for emergency loans.',
    'Who should get the next loan from our group?',
    'What was the total savings collected today?', // Clean accounting question
  ];

  const handleTest = async (testQuery?: string) => {
    const q = testQuery || query;
    if (!q) return;
    setIsLoading(true);
    try {
      const res = await fetch('/api/guardrail-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: q }),
      });
      const data = await res.json();
      setResponse(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-sheet" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShieldCheck size={22} color="var(--accent)" />
            <h3 style={{ fontSize: '18px', fontWeight: 800 }}>{t.guardrailTitle}</h3>
          </div>
          <button onClick={onClose} style={{ padding: '6px', color: 'var(--text-muted)' }}>
            <X size={20} />
          </button>
        </div>

        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
          The auditor is strictly prohibited from providing financial advice, recommending loans, or rating member creditworthiness. Any subjective financial inquiry triggers the mandatory fixed refusal.
        </p>

        {/* Preset Bait Questions */}
        <div style={{ marginBottom: '16px' }}>
          <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)' }}>
            Click sample bait queries to test:
          </span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '6px' }}>
            {sampleBaitQuestions.map((bq, i) => (
              <button
                key={i}
                onClick={() => {
                  setQuery(bq);
                  handleTest(bq);
                }}
                className="btn-secondary"
                style={{ textAlign: 'left', fontSize: '13px', padding: '6px 12px', justifyContent: 'flex-start' }}
              >
                {bq.includes('total savings') ? '🟢 ' : '🔴 '} {bq}
              </button>
            ))}
          </div>
        </div>

        {/* Custom Input */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t.baitPlaceholder}
            style={{ flex: 1, padding: '10px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', background: 'var(--bg-card)', color: 'var(--text-primary)', fontSize: '14px' }}
            onKeyDown={(e) => e.key === 'Enter' && handleTest()}
          />
          <button onClick={() => handleTest()} className="btn-primary" disabled={isLoading || !query}>
            <Send size={15} />
            <span>{t.testGuardrailBtn}</span>
          </button>
        </div>

        {/* Response Box */}
        {response && (
          <div
            style={{
              padding: '14px',
              borderRadius: 'var(--radius-md)',
              background: response.refused ? 'var(--danger-light)' : 'var(--accent-light)',
              color: response.refused ? 'var(--danger)' : 'var(--accent)',
              border: `1px solid ${response.refused ? 'var(--danger)' : 'var(--accent)'}`,
              marginBottom: '16px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
              {response.refused ? <ShieldAlert size={18} /> : <ShieldCheck size={18} />}
              <strong style={{ fontSize: '14px' }}>
                {response.refused ? 'PROHIBITED FINANCIAL ADVICE INTERCEPTED' : 'NEUTRAL ACCOUNTING QUERY ALLOWED'}
              </strong>
            </div>
            <p style={{ fontSize: '14px', fontWeight: 600, marginTop: '6px' }}>
              "{response.message}"
            </p>
            {response.pattern && (
              <span style={{ fontSize: '11px', opacity: 0.85, display: 'block', marginTop: '6px', fontFamily: 'monospace' }}>
                Matched Rule: {response.pattern}
              </span>
            )}
          </div>
        )}

        <div style={{ textAlign: 'right' }}>
          <button onClick={onClose} className="btn-secondary">
            {t.close}
          </button>
        </div>
      </div>
    </div>
  );
};
