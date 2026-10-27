import React from 'react';
import { Shield } from 'lucide-react';
import { Language, translations } from '../i18n/translations';

interface PrivacyBannerProps {
  lang: Language;
}

export const PrivacyBanner: React.FC<PrivacyBannerProps> = ({ lang }) => {
  const t = translations[lang];

  return (
    <div
      style={{
        backgroundColor: 'var(--primary-light)',
        color: 'var(--primary)',
        padding: '10px 16px',
        borderRadius: 'var(--radius-md)',
        fontSize: '12px',
        fontWeight: 600,
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        marginBottom: '16px',
      }}
    >
      <Shield size={16} style={{ flexShrink: 0 }} />
      <span>{t.privacyNotice}</span>
    </div>
  );
};
