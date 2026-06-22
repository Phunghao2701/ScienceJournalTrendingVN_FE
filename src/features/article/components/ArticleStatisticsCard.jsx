/**
 * File source thuộc hệ thống FE ResearchPulse.
 *
 * File: features\article\components\ArticleStatisticsCard.jsx
 */
import { Card, Row, Col } from 'react-bootstrap';
import { Icon } from '@iconify/react';

export default function ArticleStatisticsCard({ article }) {
  if (!article) return null;

  const safeValue = (value) => (
    value !== undefined && value !== null && String(value).trim() !== '' ? value : '—'
  );

  const citations = article.citations ?? article.citations_count ?? '—';
  const publicationYear = safeValue(article.publication_year);
  const volume = safeValue(article.volume_number || article.volume);
  const issue = safeValue(article.issue_number || article.issue);
  const pages = safeValue(article.pages);
  const doi = safeValue(article.doi);

  const metricCards = [
    { label: 'Năm xuất bản', value: publicationYear, icon: 'lucide:calendar-days' },
    { label: 'Truy cập mở', value: article.is_open_access ? 'Có' : 'Không', icon: 'lucide:unlock' },
    { label: 'Volume', value: volume, icon: 'lucide:layers' },
    { label: 'Issue', value: issue, icon: 'lucide:book-copy' },
  ];

  return (
    <Card 
      className="journal-dark-card border-0 p-4"
      style={{ 
        backgroundColor: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: '16px',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.02)'
      }}
    >
      <h5 className="font-display font-weight-bold text-main mb-3 d-flex align-items-center gap-2 border-bottom border-light pb-2">
        <Icon icon="lucide:bar-chart-3" style={{ color: 'var(--primary)' }} width="20" />
        Thống kê bài báo (Metrics)
      </h5>

      <div className="d-flex flex-column gap-3">
        <div className="p-3 rounded-3 text-center" style={{ backgroundColor: 'var(--bg-section)' }}>
          <div className="text-muted-custom text-xs font-semibold mb-1 uppercase tracking-wider" style={{ fontSize: '0.7rem' }}>
            SỐ LƯỢT TRÍCH DẪN (CITATIONS)
          </div>
          <div className="d-flex align-items-center justify-content-center text-main gap-1.5 fs-3" style={{ fontWeight: 700 }}>
            <Icon icon="lucide:quote" />
            <span>{citations}</span>
          </div>
        </div>

        <Row className="g-2 text-sm text-main">
          {metricCards.map((metric) => (
            <Col xs={6} key={metric.label}>
              <div
                className="py-1 pe-2 rounded-3 border h-100 d-flex flex-column justify-content-center"
                style={{
                  borderColor: 'var(--border)',
                  backgroundColor: 'var(--bg-card)',
                  paddingLeft: '1rem',
                }}
              >
                <div className="text-muted-custom text-xxs font-semibold uppercase" style={{ fontSize: '0.65rem' }}>
                  {metric.label}
                </div>
                <div className="font-weight-bold mt-1 text-xs d-flex align-items-center gap-1" style={{ fontWeight: 700 }}>
                  <Icon icon={metric.icon} style={{ color: 'var(--primary)' }} />
                  <span>{metric.value}</span>
                </div>
              </div>
            </Col>
          ))}
        </Row>

        <div className="border-top border-light pt-3 mt-1">
          <div className="justify-content-between align-items-start text-xs mb-2 gap-3">
            <span className="text-muted-custom">DOI:</span>
            <span className="text-main font-semibold text-end" style={{ fontWeight: 600 }}> {doi}</span>
          </div>
          <div className="d-flex justify-content-between align-items-center text-xs">
            <span className="text-muted-custom">Số trang (Pages):</span>
            <span className="text-main font-semibold" style={{ fontWeight: 600 }}>{pages}</span>
          </div>
        </div>
      </div>
    </Card>
  );
}
