import React from 'react';
import { Row, Col } from 'react-bootstrap';
import StatCard from '../../dashboard/components/StatCard';

export default function GeographyStatsCards({ 
  countryStats = [], 
  globalRegions = [], 
  regions = [], 
  selectedCountry = null, 
  loading = false,
  pagination = {}
}) {
  // 1. Total Countries
  const totalCountries = pagination.total || countryStats.length || 0;

  // 2. Total Regions (current selected country regions, otherwise global regions)
  const totalRegions = selectedCountry 
    ? regions.length 
    : (globalRegions.length || 0);
  
  const regionsLabel = selectedCountry 
    ? `Khu vực thuộc ${selectedCountry.name}` 
    : 'Tổng số phân vùng toàn cầu';

  // 3. Total Articles (sum of all countries' article counts)
  const totalArticles = countryStats.reduce((sum, c) => sum + (c.article_count || 0), 0);

  // 4. Top Country
  const topCountry = countryStats.length > 0 
    ? countryStats[0] 
    : null;
  const topCountryName = topCountry ? topCountry.name : '—';
  const topCountryCount = topCountry ? `${topCountry.article_count} bài báo` : '';

  const cards = [
    {
      icon: 'lucide:globe',
      accentColor: 'var(--primary)',
      value: totalCountries,
      label: 'Tổng quốc gia',
      growth: null,
    },
    {
      icon: 'lucide:map-pin',
      accentColor: '#6366f1',
      value: totalRegions,
      label: regionsLabel,
      growth: null,
    },
    {
      icon: 'lucide:file-text',
      accentColor: '#0ea5e9',
      value: totalArticles,
      label: 'Tổng sản lượng bài báo',
      growth: null,
    },
    {
      icon: 'lucide:award',
      accentColor: 'var(--q1-color)',
      value: topCountryCount || '—',
      label: `Top: ${topCountryName}`,
      growth: null,
    },
  ];

  return (
    <Row className="g-3 mb-4">
      {cards.map((card, idx) => (
        <Col xs={12} sm={6} lg={3} key={idx}>
          <StatCard 
            icon={card.icon} 
            accentColor={card.accentColor} 
            value={card.value} 
            label={card.label} 
            growth={card.growth} 
            loading={loading} 
          />
        </Col>
      ))}
    </Row>
  );
}
