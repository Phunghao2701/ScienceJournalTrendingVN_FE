import { useTranslation } from 'react-i18next';

/**
 * AdminFooter Component
 * Renders the page footer aligned at the bottom of administrative content.
 */
export default function AdminFooter() {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();

  return (
    <div 
      className="d-flex flex-column flex-md-row align-items-center justify-content-between px-4 py-3 border-top mt-auto bg-white"
      style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}
    >
      {/* Copyright branding */}
      <div className="mb-2 mb-md-0">
        © {currentYear} ResearchPulse Admin. All rights reserved.
      </div>

      {/* Useful helper links matching the mockup footer */}
      <div className="d-flex gap-4">
        <a href="#privacy" className="text-decoration-none text-muted-custom hover-primary">{t('privacyPolicy')}</a>
        <a href="#terms" className="text-decoration-none text-muted-custom hover-primary">{t('termsOfService')}</a>
        <a href="#docs" className="text-decoration-none text-muted-custom hover-primary">{t('documentation')}</a>
        <a href="#support" className="text-decoration-none text-muted-custom hover-primary">{t('contactSupport')}</a>
      </div>
    </div>
  );
}
