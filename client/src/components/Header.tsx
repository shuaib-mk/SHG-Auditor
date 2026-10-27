import React from 'react';
import { Language, translations } from '../i18n/translations';
import { Globe, Moon, Sun, Award, ShieldCheck } from 'lucide-react';

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

  return (
    <header className="card" style={{ padding: '16px 20px', marginBottom: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '26px' }}>📒</span>
            <h1 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--primary)' }}>
              {t.appTitle}
            </h1>
          </div>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '2px' }}>
            {t.tagline}
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {/* 30-Case Benchmark Button */}
          <button
            onClick={onOpenEvaluation}
            className="btn-secondary"
            title="Run 30-page precision & recall benchmark"
            style={{ fontSize: '13px', padding: '8px 12px' }}
          >
            <Award size={16} color="var(--primary)" />
            <span>Benchmark (30 Tests)</span>
          </button>

          {/* Guardrail Verification Button */}
          <button
            onClick={onOpenGuardrail}
            className="btn-secondary"
            title="Test AI Guardrail refusal filter"
            style={{ fontSize: '13px', padding: '8px 12px' }}
          >
            <ShieldCheck size={16} color="var(--accent)" />
            <span>Guardrails</span>
          </button>

          {/* Language Toggle */}
          <button
            onClick={() => setLang(lang === 'en' ? 'hi' : 'en')}
            className="btn-secondary"
            style={{ fontSize: '13px', padding: '8px 12px', minWidth: '80px' }}
          >
            <Globe size={15} />
            <span>{lang === 'en' ? 'हिन्दी' : 'English'}</span>
          </button>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="btn-secondary"
            style={{ padding: '8px 10px', minHeight: '40px' }}
            aria-label="Toggle Theme"
          >
            {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
          </button>
        </div>
      </div>
    </header>
  );
};
