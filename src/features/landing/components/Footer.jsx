/**
 * File source thuộc hệ thống FE ResearchPulse.
 *
 * File: features\landing\components\Footer.jsx
 */
import { useTranslation } from 'react-i18next';
import Container from 'react-bootstrap/Container';
import Icon from '../../../shared/components/Icon';

export default function Footer() {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();

  const links = [
    { labelKey: 'footerAbout', href: '#' },
    { labelKey: 'footerTerms', href: '#' },
    { labelKey: 'footerPrivacy', href: '#' },
    { labelKey: 'footerContact', href: '#' },
  ];

  return (
    <footer 
      className="py-4"
      style={{
        backgroundColor: 'var(--bg-section)',
        borderTop: '1px solid var(--border)'
      }}
    >
      <Container>
        <div className="d-flex flex-column flex-md-row align-items-center justify-content-between gap-4">
          {/* Brand and Description */}
          <div className="d-flex align-items-center gap-3">
            <div 
              className="d-flex align-items-center justify-content-center rounded-circle"
              style={{
                width: '40px',
                height: '40px',
                backgroundColor: 'var(--text-main)',
                color: 'white'
              }}
            >
              <Icon icon="lucide:line-chart" className="fs-5" />
            </div>
            <div>
              <div className="font-display text-main" style={{ fontWeight: 800, fontSize: '1.25rem' }}>
                ResearchPulse
              </div>
              <div className="text-muted-custom" style={{ fontSize: '0.8rem', maxWidth: '300px' }}>
                {t('footerDesc')}
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="d-flex flex-wrap justify-content-center gap-4">
            {links.map((link) => (
              <a
                key={link.labelKey}
                href={link.href}
                className="text-muted-custom text-decoration-none"
                style={{ fontSize: '0.85rem', transition: 'color 0.2s ease' }}
                onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--primary)')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
              >
                {t(link.labelKey)}
              </a>
            ))}
          </nav>
        </div>

        {/* Copyright */}
        <div 
          className="text-center text-muted-custom mt-4 pt-4" 
          style={{ borderTop: '1px solid var(--border)', fontSize: '0.75rem' }}
        >
          © {currentYear} ResearchPulse. {t('footerRights')}
        </div>
      </Container>
    </footer>
  );
}
