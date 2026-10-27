import React, { useState } from 'react';
import { Language, translations } from '../i18n/translations';
import { Globe, Settings, Moon, Sun, Award, ShieldCheck, X, Shield } from 'lucide-react';

interface HeaderProps {
  lang: Language;
  setLang: (lang: Language) => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  onOpenEvaluation: () => void;
  onOpenGuardrail: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  lang,
  setLang,
  theme,
  toggleTheme,
  onOpenEvaluation,
  onOpenGuardrail,
}) => {
  const t = translations[lang];
  const [showMenu, setShowMenu] = useState(false);

  return (
    <>
      <header className="app-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '24px' }}>📒</span>
          <div>
            <h1 style={{ fontSize: '17px', fontWeight: 800, color: 'var(--primary)', lineHeight: 1.2 }}>
              {t.appTitle}
            </h1>
            <p style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>
              {t.appSubtitle}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* Quick Bilingual Pill Toggle */}
          <button
            onClick={() => setLang(lang === 'en' ? 'hi' : 'en')}
            className="btn-touch-secondary"
            style={{
              padding: '6px 12px',
              fontSize: '12px',
              minHeight: '36px',
              fontWeight: 700,
              borderRadius: '9999px',
              gap: '4px',
            }}
          >
            <Globe size={14} />
            <span>{lang === 'en' ? 'हिन्दी' : 'English'}</span>
          </button>

          {/* Discreet Auditor Tools & Hackathon Menu */}
          <button
            onClick={() => setShowMenu(true)}
            className="btn-touch-secondary"
            style={{
              padding: '8px',
              minHeight: '36px',
              minWidth: '36px',
              borderRadius: '50%',
            }}
            aria-label="Settings & Tools"
          >
            <Settings size={18} />
          </button>
        </div>
      </header>

      {/* Tools & Settings Bottom Sheet */}
      {showMenu && (
        <div className="modal-overlay" onClick={() => setShowMenu(false)}>
          <div className="modal-sheet" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Settings size={20} color="var(--primary)" />
                <h3 style={{ fontSize: '16px', fontWeight: 800 }}>{t.devTools}</h3>
              </div>
              <button onClick={() => setShowMenu(false)} style={{ padding: '6px', color: 'var(--text-muted)' }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {/* Benchmark Runner */}
              <button
                onClick={() => {
                  setShowMenu(false);
                  onOpenEvaluation();
                }}
                className="btn-touch-secondary"
                style={{ justifyContent: 'flex-start', padding: '12px 16px', borderRadius: 'var(--radius-md)' }}
              >
                <Award size={18} color="var(--primary)" />
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontSize: '14px', fontWeight: 700 }}>Run 30-Page Benchmark</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Measures precision & recall across 30 planted error registers</div>
                </div>
              </button>

              {/* Guardrails Test */}
              <button
                onClick={() => {
                  setShowMenu(false);
                  onOpenGuardrail();
                }}
                className="btn-touch-secondary"
                style={{ justifyContent: 'flex-start', padding: '12px 16px', borderRadius: 'var(--radius-md)' }}
              >
                <ShieldCheck size={18} color="var(--accent)" />
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontSize: '14px', fontWeight: 700 }}>AI Guardrail Refusal Test</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Tests refusal against prohibited financial advice & credit questions</div>
                </div>
              </button>

              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="btn-touch-secondary"
                style={{ justifyContent: 'space-between', padding: '12px 16px', borderRadius: 'var(--radius-md)' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
                  <span style={{ fontSize: '14px', fontWeight: 700 }}>
                    {theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
                  </span>
                </div>
              </button>

              {/* Privacy Summary */}
              <div style={{ padding: '12px', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)', fontSize: '12px', color: 'var(--text-secondary)', display: 'flex', gap: '8px', marginTop: '8px' }}>
                <Shield size={16} color="var(--accent)" style={{ flexShrink: 0, marginTop: '2px' }} />
                <span>{t.privacyShort}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
