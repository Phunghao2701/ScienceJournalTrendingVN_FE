/**
 * File source thuộc hệ thống FE ResearchPulse.
 *
 * File: features\landing\components\Hero.jsx
 */
import { useTranslation } from 'react-i18next';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import Icon from '../../../shared/components/Icon';

export default function Hero() {
  const { t } = useTranslation();

  const stats = [
    { valueKey: 'papersValue', labelKey: 'papersLabel', color: '#000000' },
    { valueKey: 'periodValue', labelKey: 'periodLabel', color: '#000000' },
    { valueKey: 'keywordsValue', labelKey: 'keywordsLabel', color: '#000000' },
    { valueKey: 'freeValue', labelKey: 'freeLabel', color: '#AB7E55' },
  ];

  return (
    <section className="relative min-vh-100 d-flex flex-column justify-content-between pt-5 pb-5 overflow-hidden grid-bg">
      {/* Radial overlay to fade out the grid pattern */}
      <div className="position-absolute w-100 h-100 radial-fade pe-none" style={{ top: 0, left: 0 }} />

      {/* Hero content container */}
      <Container className="position-relative d-flex flex-column justify-content-center align-items-center text-center flex-grow-1 z-3 pt-5">
        
        {/* Animated OpenAlex Badge */}
        <div 
          className="d-inline-flex align-items-center gap-2 px-3 py-2 rounded-pill mb-4"
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.08)',
            border: '1px solid rgba(0, 0, 0, 0.2)',
            color: '#000000',
            fontSize: '0.75rem',
            fontWeight: 600,
            letterSpacing: '0.05em'
          }}
        >
          <Icon icon="lucide:sparkles" className="text-warning animate-pulse" />
          <span>{t('badgeText')}</span>
        </div>

        {/* Main Heading */}
        <h1 
          className="font-display text-main mb-4"
          style={{
            fontWeight: 800,
            fontSize: 'calc(1.8rem + 2.5vw)',
            lineHeight: 1.15,
            maxWidth: '900px',
            letterSpacing: '-0.02em'
          }}
        >
          {t('headingPrefix')}{' '}
          <span className="glow-gradient-text glow-text-cyan font-display">
            {t('headingHighlight')}
          </span>
        </h1>

        {/* Sub Heading */}
        <p 
          className="text-main mb-5 max-w-2xl"
          style={{
            fontSize: 'calc(0.95rem + 0.15vw)',
            lineHeight: 1.6,
            maxWidth: '650px'
          }}
        >
          {t('subheading')}
        </p>

        {/* Action CTA Buttons */}
        <div className="d-flex flex-column flex-sm-row justify-content-center align-items-center gap-3 w-100 w-sm-auto mb-5">
          {/* Start Searching Button */}
          <Button
            href="#search-sandbox"
            className="btn-primary-glow rounded-pill px-5 py-3 d-flex align-items-center justify-content-center gap-2"
            style={{ fontSize: '0.875rem', letterSpacing: '0.03em' }}
          >
            <Icon icon="lucide:rocket" className="fs-5" />
            <span>{t('ctaSearch')}</span>
          </Button>

          {/* View Trends Button */}
<Button
  href="#features"
  variant="outline-secondary"
  className="btn-view-trends rounded-pill px-5 py-3 d-flex align-items-center justify-content-center gap-2"
>
  <Icon icon="lucide:bar-chart-2" className="fs-5 btn-view-trends-icon" />
  <span>{t('ctaTrends')}</span>
</Button>
        </div>
      </Container>

      {/* Stats Counter Row Container */}
      <div className="position-relative w-100 z-3" style={{ borderTop: '1px solid var(--border)' }}>
        <Container className="pt-4 pb-2">
          <Row className="gy-4 gy-md-0 text-center">
            {stats.map((stat, idx) => (
              <Col 
                xs={6} 
                md={3} 
                key={idx}
                className={idx > 0 ? 'border-start-md border-white-10' : ''}
                style={{
                  borderLeft: (idx > 0 && window.innerWidth >= 768) ? '1px solid rgba(255, 255, 255, 0.08)' : 'none'
                }}
              >
                <div className="d-flex flex-column align-items-center justify-content-center">
                  {/* Stat Value */}
                  <span 
                    className="font-display mb-1"
                    style={{
                      fontWeight: 800,
                      fontSize: 'calc(1.3rem + 1vw)',
                      color: stat.color,
                      letterSpacing: '-0.01em'
                    }}
                  >
                    {t(stat.valueKey)}
                  </span>
                  {/* Stat Label */}
                  <span 
                    className="text-muted-custom font-weight-bold"
                    style={{
                      fontSize: '0.65rem',
                      letterSpacing: '0.15em',
                      textTransform: 'uppercase'
                    }}
                  >
                    {t(stat.labelKey)}
                  </span>
                </div>
              </Col>
            ))}
          </Row>
        </Container>
      </div>
    </section>
  );
}
