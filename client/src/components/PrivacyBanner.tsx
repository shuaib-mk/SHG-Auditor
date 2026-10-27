import React from 'react';
import { ShieldCheck } from 'lucide-react';
import { Language, translations } from '../i18n/translations';

interface PrivacyBannerProps {
  lang: Language;
}

export const PrivacyBanner: React.FC<PrivacyBannerProps> = ({ lang }) => {
  const t = translations[lang];

  return (
    <div
      style={{
        backgroundColor: 'var(--accent-light)',
        color: 'var(--accent)',
        padding: '8px 12px',
        borderRadius: 'var(--radius-md)',
        fontSize: '11px',
        fontWeight: 700,
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        marginBottom: '14px',
        lineHeight: 1.3,
      }}
    >
      <ShieldCheck size={14} style={{ flexShrink: 0 }} />
      <span>{t.privacyShort}</span>
    </div>
  );
};
