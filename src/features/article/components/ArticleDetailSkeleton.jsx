/**
 * File source thuộc hệ thống FE ResearchPulse.
 *
 * File: features\article\components\ArticleDetailSkeleton.jsx
 */
import { Row, Col, Card } from 'react-bootstrap';
import LoadingSkeleton from '../../../shared/components/LoadingSkeleton';

export default function ArticleDetailSkeleton() {
  return (
    <Row className="g-4">
      {/* Left Main Column */}
      <Col xs={12} lg={8}>
        {/* Header Card Skeleton */}
        <Card 
          className="journal-dark-card border-0 p-4 mb-4" 
          style={{ 
            backgroundColor: 'var(--bg-card)', 
            border: '1px solid var(--border)',
            borderRadius: '16px'
          }}
        >
          <div className="d-flex gap-2 mb-3">
            <LoadingSkeleton width="60px" height="20px" borderRadius="6px" />
            <LoadingSkeleton width="100px" height="20px" borderRadius="6px" />
          </div>
          <LoadingSkeleton width="90%" height="36px" className="mb-3" />
          <LoadingSkeleton width="70%" height="36px" className="mb-4" />
          <div className="d-flex align-items-center gap-3">
            <LoadingSkeleton width="36px" height="36px" borderRadius="50%" />
            <LoadingSkeleton width="200px" height="18px" />
          </div>
        </Card>

        {/* Abstract Card Skeleton */}
        <Card 
          className="journal-dark-card border-0 p-4 mb-4" 
          style={{ 
            backgroundColor: 'var(--bg-card)', 
            border: '1px solid var(--border)',
            borderRadius: '16px'
          }}
        >
          <LoadingSkeleton width="180px" height="24px" className="mb-3" />
          <LoadingSkeleton width="100%" height="100px" borderRadius="8px" />
        </Card>

        {/* Keywords Card Skeleton */}
        <Card 
          className="journal-dark-card border-0 p-4 mb-4" 
          style={{ 
            backgroundColor: 'var(--bg-card)', 
            border: '1px solid var(--border)',
            borderRadius: '16px'
          }}
        >
          <LoadingSkeleton width="220px" height="24px" className="mb-3" />
          <div className="d-flex flex-wrap gap-2">
            <LoadingSkeleton width="80px" height="28px" borderRadius="8px" />
            <LoadingSkeleton width="120px" height="28px" borderRadius="8px" />
            <LoadingSkeleton width="100px" height="28px" borderRadius="8px" />
            <LoadingSkeleton width="90px" height="28px" borderRadius="8px" />
          </div>
        </Card>

        {/* Authors Card Skeleton */}
        <Card 
          className="journal-dark-card border-0 p-4 mb-4" 
          style={{ 
            backgroundColor: 'var(--bg-card)', 
            border: '1px solid var(--border)',
            borderRadius: '16px'
          }}
        >
          <LoadingSkeleton width="200px" height="24px" className="mb-3" />
          <div className="d-flex flex-column gap-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="d-flex align-items-center gap-3">
                <LoadingSkeleton width="32px" height="32px" borderRadius="50%" />
                <div className="flex-grow-1">
                  <LoadingSkeleton width="150px" height="16px" className="mb-1" />
                  <LoadingSkeleton width="220px" height="12px" />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </Col>

      {/* Right Sidebar Column */}
      <Col xs={12} lg={4}>
        {/* Actions Card Skeleton */}
        <Card 
          className="journal-dark-card border-0 p-4 mb-4" 
          style={{ 
            backgroundColor: 'var(--bg-card)', 
            border: '1px solid var(--border)',
            borderRadius: '16px'
          }}
        >
          <LoadingSkeleton width="150px" height="24px" className="mb-3" />
          <div className="d-flex flex-column gap-3">
            <LoadingSkeleton width="100%" height="40px" borderRadius="8px" />
            <LoadingSkeleton width="100%" height="40px" borderRadius="8px" />
            <LoadingSkeleton width="100%" height="40px" borderRadius="8px" />
          </div>
        </Card>

        {/* Statistics Card Skeleton */}
        <Card 
          className="journal-dark-card border-0 p-4" 
          style={{ 
            backgroundColor: 'var(--bg-card)', 
            border: '1px solid var(--border)',
            borderRadius: '16px'
          }}
        >
          <LoadingSkeleton width="180px" height="24px" className="mb-3" />
          <LoadingSkeleton width="100%" height="70px" borderRadius="8px" className="mb-3" />
          <Row className="g-2 mb-3">
            {[1, 2, 3, 4].map(i => (
              <Col xs={6} key={i}>
                <LoadingSkeleton width="100%" height="50px" borderRadius="8px" />
              </Col>
            ))}
          </Row>
          <div className="d-flex flex-column gap-2">
            <LoadingSkeleton width="100%" height="16px" />
            <LoadingSkeleton width="100%" height="16px" />
          </div>
        </Card>
      </Col>
    </Row>
  );
}
