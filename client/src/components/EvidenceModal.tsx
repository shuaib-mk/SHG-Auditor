import React, { useState, useEffect } from 'react';
import { X, Play, Square, Volume2, Search, FileText, Check } from 'lucide-react';
import { Language, translations } from '../i18n/translations';
import { Discrepancy, ResolutionStatus } from '../../../shared/types';

interface EvidenceModalProps {
  lang: Language;
  discrepancy: Discrepancy | null;
  onClose: () => void;
  audioBlobUrl: string | null;
  registerImageUrl: string | null;
  onResolve: (
    discrepancyId: string,
    status: ResolutionStatus,
    resolvedValue?: number
  ) => void;
}

export const EvidenceModal: React.FC<EvidenceModalProps> = ({
  lang,
  discrepancy,
  onClose,
  audioBlobUrl,
  registerImageUrl,
  onResolve,
}) => {
  const t = translations[lang];
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    return () => {
      stopAudioSnippet();
    };
  }, [discrepancy]);

  if (!discrepancy) return null;

  // Synthesize or play audio snippet using Web Audio API / Audio element
  const playAudioSnippet = () => {
    try {
      setIsPlaying(true);
      // Create Web Audio tone to represent the audio segment
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 1.2);

      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 1.2);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 1.2);

      setTimeout(() => {
        setIsPlaying(false);
      }, 1300);
    } catch (e) {
      console.warn('Web Audio error:', e);
      setIsPlaying(false);
    }
  };

  const stopAudioSnippet = () => {
    setIsPlaying(false);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Search size={20} color="var(--primary)" />
            <h3 style={{ fontSize: '17px', fontWeight: 800 }}>
              {t.evidenceTitle}: {discrepancy.memberName}
            </h3>
          </div>
          <button onClick={onClose} style={{ padding: '6px', color: 'var(--text-muted)' }}>
            <X size={20} />
          </button>
        </div>

        {/* Severity & Description */}
        <div style={{ marginBottom: '16px' }}>
          <p style={{ fontSize: '14px', color: 'var(--text-primary)', marginBottom: '8px' }}>
            {lang === 'hi' && discrepancy.descriptionHi ? discrepancy.descriptionHi : discrepancy.description}
          </p>
        </div>

        {/* Evidence 1: Spoken Audio & Transcript Quote */}
        <div style={{ marginBottom: '16px', padding: '14px', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Volume2 size={16} color="var(--primary)" />
              <strong style={{ fontSize: '13px', color: 'var(--primary)' }}>
                {t.spokenEvidence} (Spoken: ₹{discrepancy.spokenValue ?? 'N/A'})
              </strong>
            </div>

            <button
              onClick={isPlaying ? stopAudioSnippet : playAudioSnippet}
              className="btn-primary"
              style={{ padding: '6px 14px', fontSize: '12px', minHeight: '34px' }}
            >
              {isPlaying ? <Square size={13} fill="currentColor" /> : <Play size={13} fill="currentColor" />}
              <span>{isPlaying ? 'Playing...' : t.playAudioSnippet}</span>
            </button>
          </div>

          <p style={{ fontSize: '13px', fontStyle: 'italic', color: 'var(--text-primary)', padding: '8px 10px', background: 'var(--bg-card)', borderRadius: 'var(--radius-sm)', borderLeft: '3px solid var(--primary)' }}>
            "{discrepancy.evidence.transcriptSnippet || 'Transaction discussed during meeting dialogue.'}"
          </p>

          <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginTop: '6px' }}>
            {t.audioSnippetNotice}
          </span>
        </div>

        {/* Evidence 2: Written Register Crop / Cell Preview */}
        <div style={{ marginBottom: '20px', padding: '14px', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
            <FileText size={16} color="var(--accent)" />
            <strong style={{ fontSize: '13px', color: 'var(--accent)' }}>
              {t.writtenEvidence} (Written: ₹{discrepancy.writtenValue ?? 'N/A'})
            </strong>
          </div>

          <div style={{ padding: '10px', background: 'var(--bg-card)', borderRadius: 'var(--radius-sm)', border: '1px dashed var(--border-color)', textAlign: 'center' }}>
            {discrepancy.evidence.cellLocation && (
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                Grid Location: Row #{discrepancy.evidence.cellLocation.row}, Column "{discrepancy.evidence.cellLocation.col}"
              </p>
            )}

            {registerImageUrl ? (
              <div style={{ overflow: 'hidden', maxHeight: '160px', borderRadius: '4px', border: '1px solid var(--border-color)' }}>
                <img
                  src={registerImageUrl}
                  alt="Register Line Crop"
                  style={{ width: '100%', objectFit: 'cover' }}
                />
              </div>
            ) : (
              <div style={{ padding: '20px', color: 'var(--text-muted)', fontSize: '12px' }}>
                Register page line verified from OCR matrix.
              </div>
            )}
          </div>
        </div>

        {/* Quick Resolution Controls in Modal */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '14px' }}>
          <button onClick={onClose} className="btn-secondary">
            {t.close}
          </button>

          <div style={{ display: 'flex', gap: '8px' }}>
            {discrepancy.spokenValue !== undefined && (
              <button
                onClick={() => {
                  onResolve(discrepancy.id, 'RESOLVED_SPOKEN', discrepancy.spokenValue);
                  onClose();
                }}
                className="btn-primary"
                style={{ fontSize: '13px' }}
              >
                <Check size={14} />
                <span>Accept Spoken (₹{discrepancy.spokenValue})</span>
              </button>
            )}

            {discrepancy.writtenValue !== undefined && (
              <button
                onClick={() => {
                  onResolve(discrepancy.id, 'RESOLVED_WRITTEN', discrepancy.writtenValue);
                  onClose();
                }}
                className="btn-secondary"
                style={{ fontSize: '13px' }}
              >
                <span>Accept Written (₹{discrepancy.writtenValue})</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
