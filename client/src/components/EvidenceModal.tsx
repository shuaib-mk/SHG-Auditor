import React, { useState, useEffect } from 'react';
import { X, Play, Square, Volume2, FileText, Check } from 'lucide-react';
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

  // Synthesize audio tone to represent voice playback
  const playAudioSnippet = () => {
    try {
      setIsPlaying(true);
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(660, ctx.currentTime + 1.2);

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
      <div className="modal-sheet" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
          <div>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700 }}>
              {t.evidenceTitle}
            </span>
            <h3 style={{ fontSize: '17px', fontWeight: 800 }}>
              {discrepancy.memberName}
            </h3>
          </div>
          <button onClick={onClose} style={{ padding: '6px', color: 'var(--text-muted)' }}>
            <X size={20} />
          </button>
        </div>

        {/* Spoken Voice Box */}
        <div style={{ background: 'var(--primary-light)', borderRadius: 'var(--radius-md)', padding: '14px', marginBottom: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: 800, color: 'var(--primary)' }}>
              🗣️ {t.spokenEvidence}: ₹{discrepancy.spokenValue ?? 'N/A'}
            </span>

            <button
              onClick={isPlaying ? stopAudioSnippet : playAudioSnippet}
              className="btn-touch-primary"
              style={{ width: 'auto', minHeight: '34px', padding: '6px 14px', fontSize: '12px', borderRadius: 'var(--radius-full)' }}
            >
              {isPlaying ? <Square size={13} fill="currentColor" /> : <Play size={13} fill="currentColor" />}
              <span>{isPlaying ? 'Playing...' : t.playAudioSnippet}</span>
            </button>
          </div>

          <p style={{ fontSize: '13px', fontStyle: 'italic', color: 'var(--text-primary)', background: 'var(--bg-card)', padding: '10px', borderRadius: 'var(--radius-sm)', borderLeft: '3px solid var(--primary)' }}>
            "{discrepancy.evidence.transcriptSnippet || 'Member confirmed during discussion.'}"
          </p>
        </div>

        {/* Written Notebook Box */}
        <div style={{ background: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)', padding: '14px', marginBottom: '16px' }}>
          <div style={{ fontSize: '12px', fontWeight: 800, color: 'var(--text-secondary)', marginBottom: '8px' }}>
            ✍️ {t.writtenEvidence}: ₹{discrepancy.writtenValue ?? 'N/A'}
          </div>

          {registerImageUrl ? (
            <div style={{ maxHeight: '120px', overflow: 'hidden', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', background: '#fff' }}>
              <img
                src={registerImageUrl}
                alt="Register snippet"
                style={{ width: '100%', objectFit: 'cover' }}
              />
            </div>
          ) : (
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              Register notebook entry recorded in ledger table.
            </div>
          )}
        </div>

        {/* Quick Resolution Choices */}
        <div style={{ display: 'grid', gridTemplateColumns: discrepancy.spokenValue !== undefined && discrepancy.writtenValue !== undefined ? '1fr 1fr' : '1fr', gap: '8px' }}>
          {discrepancy.spokenValue !== undefined && (
            <button
              onClick={() => {
                onResolve(discrepancy.id, 'RESOLVED_SPOKEN', discrepancy.spokenValue);
                onClose();
              }}
              className="btn-touch-primary"
            >
              <Check size={16} />
              <span>{t.acceptSpoken} (₹{discrepancy.spokenValue})</span>
            </button>
          )}

          {discrepancy.writtenValue !== undefined && (
            <button
              onClick={() => {
                onResolve(discrepancy.id, 'RESOLVED_WRITTEN', discrepancy.writtenValue);
                onClose();
              }}
              className="btn-touch-secondary"
            >
              <span>{t.acceptWritten} (₹{discrepancy.writtenValue})</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
