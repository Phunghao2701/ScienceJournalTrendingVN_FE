/**
 * File source thuộc hệ thống FE ResearchPulse.
 *
 * File: features\journal\components\JournalMetadataGrid.jsx
 */
import { Row, Col } from 'react-bootstrap';

export default function JournalMetadataGrid({ journal, loading }) {
  if (loading || !journal) {
    return (
      <section className="journal-surface journal-meta-grid mb-4" aria-label="Đang tải metadata tạp chí">
        <Row className="gy-4">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <Col lg={2} md={4} sm={6} key={i}>
              <div className="skeleton-shimmer mb-2" style={{ width: '60px', height: '14px' }} />
              <div className="skeleton-shimmer" style={{ width: '100px', height: '24px' }} />
            </Col>
          ))}
        </Row>
      </section>
    );
  }

  const {
    issn,
    publisher_name,
    country_name,
    region_name,
    coverage
  } = journal;

  const issnParts = String(issn || '').split(',').map(s => s.trim());
  const displayIssn = issnParts[0] || '';
  const displayEIssn = issnParts[1] || '';

  const metadataItems = [
    { label: 'ISSN', value: displayIssn },
    { label: 'E-ISSN', value: displayEIssn },
    { label: 'Publisher', value: publisher_name },
    { label: 'Quốc gia', value: country_name },
    { label: 'Khu vực', value: region_name },
    { label: 'Coverage', value: coverage }
  ];

  return (
    <section className="journal-surface journal-meta-grid mb-4" aria-label="Thông tin cơ bản tạp chí">
      <Row className="gy-4 text-start">
        {metadataItems.map((item, idx) => (
          <Col lg={2} md={4} xs={6} key={idx}>
            <div className="journal-meta-label">
              {item.label}
            </div>
            <div className="journal-meta-value">
              {item.value !== undefined && item.value !== null && item.value !== '' ? item.value : 'Chưa cập nhật'}
            </div>
          </Col>
        ))}
      </Row>
    </section>
  );
}
