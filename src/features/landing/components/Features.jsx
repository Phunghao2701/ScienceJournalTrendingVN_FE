/**
 * File source thuộc hệ thống FE ResearchPulse.
 *
 * File: features\landing\components\Features.jsx
 */
import { useTranslation } from 'react-i18next';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Card from 'react-bootstrap/Card';
import Icon from '../../../shared/components/Icon';

/**
 * Reusable Feature Card Component
 */
function FeatureCard({ icon, title, description }) {
  return (
    <Card 
      className="glass-card rounded-4 p-4 h-100 text-start position-relative overflow-hidden"
      style={{
        backgroundColor: 'var(--bg-card)',
        borderColor: 'var(--border)',
        transition: 'all 0.3s ease'
      }}
    >
      {/* Icon Wrapper */}
      <div 
        className="d-flex align-items-center justify-content-center mb-4"
        style={{
          width: '48px',
          height: '48px',
          borderRadius: '12px',
          backgroundColor: 'var(--primary-light)',
          border: '1px solid var(--border)',
          color: 'var(--primary)',
          transition: 'all 0.3s ease'
        }}
      >
        <Icon icon={icon} className="fs-4" />
      </div>

      {/* Card Content */}
      <Card.Title 
        className="font-display text-main mb-2" 
        style={{ fontWeight: 700, fontSize: '1.1rem', letterSpacing: '0.01em' }}
      >
        {title}
      </Card.Title>
      <Card.Text 
        className="text-muted-custom leading-relaxed mb-0" 
        style={{ fontSize: '0.85rem', lineHeight: 1.6 }}
      >
        {description}
      </Card.Text>
    </Card>
  );
}

export default function Features() {
  const { t } = useTranslation();

  const featureList = [
    {
      icon: 'lucide:search',
      color: 'text-cyan-400',
      titleKey: 'feature1Title',
      descKey: 'feature1Desc',
    },
    {
      icon: 'lucide:trending-up',
      color: 'text-blue-400',
      titleKey: 'feature2Title',
      descKey: 'feature2Desc',
    },
    {
      icon: 'lucide:bell',
      color: 'text-amber-400',
      titleKey: 'feature3Title',
      descKey: 'feature3Desc',
    },
    {
      icon: 'lucide:folder',
      color: 'text-emerald-400',
      titleKey: 'feature4Title',
      descKey: 'feature4Desc',
    },
    {
      icon: 'lucide:file-text',
      color: 'text-indigo-400',
      titleKey: 'feature5Title',
      descKey: 'feature5Desc',
    },
    {
      icon: 'lucide:gift',
      color: 'text-purple-400',
      titleKey: 'feature6Title',
      descKey: 'feature6Desc',
    },
  ];

  return (
    <section 
      id="features" 
      className="py-5 relative" 
      style={{ 
        backgroundColor: 'var(--bg-main)', 
        overflow: 'hidden',
        borderTop: '1px solid var(--border)',
        borderBottom: '1px solid var(--border)'
      }}
    >
      {/* Subtle glowing lights behind features */}
      <div 
        className="position-absolute pointer-events-none"
        style={{
          top: '20%',
          left: '10%',
          width: '300px',
          height: '300px',
          backgroundColor: 'rgba(255, 122, 51, 0.03)',
          borderRadius: '50%',
          filter: 'blur(100px)'
        }}
      />
      <div 
        className="position-absolute pointer-events-none"
        style={{
          bottom: '20%',
          right: '10%',
          width: '300px',
          height: '300px',
          backgroundColor: 'rgba(199, 238, 255, 0.2)',
          borderRadius: '50%',
          filter: 'blur(100px)'
        }}
      />

      <Container className="position-relative z-3 py-5">
        
        {/* Section Header */}
        <div className="text-center mb-5">
          <div className="d-inline-flex align-items-center gap-2 mb-2 text-xs font-bold tracking-wider text-uppercase" style={{ fontSize: '0.75rem', color: 'var(--primary)' }}>
            <span style={{ width: '24px', height: '1px', backgroundColor: 'var(--primary)' }} />
            <span>{t('featuresSubtitle')}</span>
          </div>
          <h2 
            className="font-display text-main" 
            style={{ fontWeight: 800, fontSize: 'calc(1.5rem + 1.2vw)', letterSpacing: '-0.01em' }}
          >
            {t('featuresTitle')}
          </h2>
          <p className="text-secondary fs-6 mx-auto mb-0" style={{ color: '#adb5bd', maxWidth: '36rem' }}>
            {t('featuresDesc')}
          </p>
        </div>

        {/* Grid of Feature Cards */}
        <Row className="g-4">
          {featureList.map((feature, index) => (
            <Col xs={12} md={6} lg={4} key={index}>
              <FeatureCard
                icon={feature.icon}
                title={t(feature.titleKey)}
                description={t(feature.descKey)}
              />
            </Col>
          ))}
        </Row>

      </Container>
    </section>
  );
}
