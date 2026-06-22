/**
 * File source thuộc hệ thống FE ResearchPulse.
 *
 * File: features\dashboard\components\DashboardStatCards.jsx
 */
import { Row, Col } from 'react-bootstrap';
import StatCard from './StatCard';

/**
 * DashboardStatCards — renders 4 stat cards in a responsive grid.
 * Desktop: 4 columns | Tablet: 2×2 | Mobile: 1 column
 */
export default function DashboardStatCards({ stats, loading }) {
  const cards = [
    {
      icon: 'lucide:folder-open',
      accentColor: 'var(--primary)',
      value: stats?.projectCount,
      label: 'Projects đang theo dõi',
      growth: null,
      growthLabel: '',
    },
    {
      icon: 'lucide:hash',
      accentColor: '#6366f1',
      value: stats?.keywordCount,
      label: 'Keywords đang watch',
      growth: null,
      growthLabel: '',
    },
    {
      icon: 'lucide:file-text',
      accentColor: '#0ea5e9',
      value: stats?.articleCount,
      label: 'Bài báo trong projects',
      growth: null,
      growthLabel: '',
    },
    {
      icon: 'lucide:book-open',
      accentColor: 'var(--q1-color)',
      value: stats?.journalCount,
      label: 'Journals theo dõi',
      growth: null,
      growthLabel: '',
    },
  ];

  return (
    <Row className="g-3 mb-4">
      {cards.map((card, idx) => (
        <Col xs={6} lg={3} key={idx}>
          <StatCard {...card} loading={loading} />
        </Col>
      ))}
    </Row>
  );
}
