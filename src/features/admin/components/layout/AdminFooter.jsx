import { useTranslation } from 'react-i18next';

export default function AdminFooter() {
  const { t } = useTranslation();
  // Lấy năm hiện tại để hiển thị copyright động, tránh hard-code năm cố định
  const currentYear = new Date().getFullYear();

  return (
    <footer className="admin-footer">
      <span>&copy; {currentYear} ResearchPulse Admin. {t('allRightsReserved')}</span>
      <div className="admin-footer__links">
        <a href="#privacy-policy">{t('privacyPolicy')}</a>
        <a href="#terms-of-service">{t('termsOfService')}</a>
        <a href="#contact-support">{t('contactSupport')}</a>
      </div>
    </footer>
  );
}
