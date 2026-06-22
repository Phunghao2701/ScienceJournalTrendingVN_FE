/**
 * File source thuộc hệ thống FE ResearchPulse.
 *
 * File: features\landing\components\FooterCTA.jsx
 */
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import Container from 'react-bootstrap/Container';
import Button from 'react-bootstrap/Button';
import Icon from '../../../shared/components/Icon';

export default function FooterCTA() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleCreateAccount = () => {
    navigate('/login');
  };

  return (
    <section 
      id="footer-cta" 
      className="py-5 position-relative overflow-hidden text-center"
      style={{
        backgroundColor: 'var(--bg-main)',
        borderTop: '1px solid var(--border)'
      }}
    >
      {/* Background Spotlight glow effect */}
      <div 
        className="position-absolute pointer-events-none"
        style={{
          bottom: '-200px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '500px',
          height: '300px',
          background: 'radial-gradient(circle, var(--primary-light) 0%, rgba(199, 238, 255, 0) 70%)',
          borderRadius: '50%',
          filter: 'blur(80px)'
        }}
      />
      
      <Container className="py-5 position-relative z-3">
        
        {/* Main Heading */}
        <h2 
          className="font-display text-main mb-3" 
          style={{ fontWeight: 800, fontSize: 'calc(1.5rem + 1.8vw)', letterSpacing: '-0.02em', lineHeight: 1.2 }}
        >
          {t('ctaHeading')}
        </h2>
        
        {/* Sub Heading */}
        <p 
          className="text-muted-custom mx-auto mb-5 leading-relaxed"
          style={{ fontSize: 'calc(0.9rem + 0.1vw)', maxWidth: '600px', lineHeight: 1.6 }}
        >
          {t('ctaSubheading')}
        </p>

        {/* Buttons */}
        <div className="d-flex flex-column flex-sm-row justify-content-center align-items-center gap-3 w-100 w-sm-auto">
          {/* Try Searching Now Button */}
          <Button
            href="#search-sandbox"
            variant="outline-secondary"
            className="btn-view-trends w-100 w-sm-auto rounded-pill px-5 py-3 d-flex align-items-center justify-content-center gap-2"
            style={{ fontSize: '0.875rem', fontWeight: 600 }}
          >
            <Icon icon="lucide:search" className="btn-view-trends-icon fs-5" />
            <span>{t('ctaTryNowBtn')}</span>
          </Button>

          {/* Create Free Account Button */}
          <Button
            onClick={handleCreateAccount}
            className="btn-primary-glow w-100 w-sm-auto rounded-pill px-5 py-3 d-flex align-items-center justify-content-center gap-2 border-0"
            style={{ fontSize: '0.875rem', fontWeight: 700 }}
          >
            <Icon icon="lucide:user-plus" className="fs-5" />
            <span>{t('ctaCreateAccountBtn')}</span>
          </Button>
        </div>

      </Container>
    </section>
  );
}
