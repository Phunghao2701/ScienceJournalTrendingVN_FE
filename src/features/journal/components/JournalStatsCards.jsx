/**
 * File source thuộc hệ thống FE ResearchPulse.
 *
 * File: features\journal\components\JournalStatsCards.jsx
 */
import { Row, Col, Card } from 'react-bootstrap';
import { Icon } from '@iconify/react';

export default function JournalStatsCards({ stats, loading }) {
  const cardData = [
    {
      title: 'Tổng journals',
      value: stats.totalJournals.toLocaleString('vi-VN'),
      icon: 'lucide:book-open'
    },
    {
      title: 'Q1 Journals',
      value: stats.q1Journals.toLocaleString('vi-VN'),
      icon: 'lucide:award'
    },
    {
      title: 'Quốc gia',
      value: stats.totalCountries.toLocaleString('vi-VN'),
      icon: 'lucide:globe'
    },
    {
      title: 'Open Access',
      value: stats.openAccessJournals.toLocaleString('vi-VN'),
      icon: 'lucide:unlock'
    }
  ];

  if (loading) {
    return (
      <Row className="g-4 mb-4">
        {[1, 2, 3, 4].map((i) => (
          <Col lg={3} md={6} xs={12} key={i}>
            <Card className="journal-stats-skeleton">
              <div className="skeleton-shimmer journal-stats-skeleton-label mb-2" />
              <div className="skeleton-shimmer journal-stats-skeleton-value" />
            </Card>
          </Col>
        ))}
      </Row>
    );
  }

  return (
    <Row className="g-4 mb-4">
      {cardData.map((item, idx) => (
        <Col lg={3} md={6} xs={12} key={idx}>
          <Card className="journal-stats-card">
            <Card.Body className="p-4 d-flex align-items-center justify-content-between">
              <div>
                <span className="journal-stats-label d-block mb-1">
                  {item.title}
                </span>
                <span className="journal-stats-value">
                  {item.value}
                </span>
              </div>
              <div className="journal-stats-icon d-flex align-items-center justify-content-center">
                <Icon icon={item.icon} width="22" />
              </div>
            </Card.Body>
          </Card>
        </Col>
      ))}
    </Row>
  );
}
