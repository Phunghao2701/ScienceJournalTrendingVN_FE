/**
 * @file AuthorProfileHeader.jsx
 * @description Thẻ thông tin hồ sơ bên cột trái hiển thị siêu dữ liệu chính cho tác giả được chọn.
 */

import { Card, Row, Col } from 'react-bootstrap';
import Icon from '../../../shared/components/Icon';
import AuthorAvatar from './AuthorAvatar';

export default function AuthorProfileHeader({ author, loading = false }) {
  if (loading) {
    return (
      <Card className="author-profile-card author-profile-skeleton">
        <div className="d-flex justify-content-center mb-3">
          <div className="skeleton-shimmer rounded-circle author-profile-skeleton-avatar" />
        </div>
        <div className="skeleton-shimmer rounded mx-auto mb-2 w-60 h-22" />
        <div className="skeleton-shimmer rounded mx-auto mb-2 w-50 h-16" />
        <div className="skeleton-shimmer rounded mx-auto mb-4 w-40 h-14" />
        <div className="skeleton-shimmer rounded mx-auto mb-3 w-80 h-36" />
        <div className="skeleton-shimmer rounded mx-auto w-100 h-60" />
      </Card>
    );
  }

  if (!author) return null;

  const name = author.full_name ?? author.display_name ?? author.name ?? 'Tác giả';
  const institution1 = author.institution_1 ?? author.last_known_institution ?? author.institution ?? '—';
  const institution2 = author.institution_2 ?? author.department ?? '';
  const email = author.email ?? '';
  const hIndex = author.h_index ?? author.hindex ?? 0;
  const citations = author.citation_count ?? author.cited_by_count ?? author.citations ?? 0;
  const articlesCount = author.article_count ?? author.works_count ?? author.papers ?? 0;
  const avatarColor = author.avatar_color ?? '#FF7A33';

  const formatLocalNumber = (num) => {
    if (num == null) return '0';
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };

  return (
    <Card className="author-profile-card">
      <div className="d-flex justify-content-center mb-3">
        <AuthorAvatar name={name} size="xl" bgColor={avatarColor} />
      </div>

      <h2 className="author-profile-name">{name}</h2>
      <div className="author-profile-affiliation-primary">{institution1}</div>
      {institution2 && <div className="author-profile-affiliation-secondary">{institution2}</div>}

      <div className="author-profile-orcid">
        ORCID: <strong>{author.orcid || 'Chưa cập nhật'}</strong>
      </div>

      {email && (
        <div className="d-flex justify-content-center">
          <div className="author-profile-email">
            <Icon icon="lucide:mail" width="12" className="opacity-75" />
            <span className="text-truncate">{email}</span>
          </div>
        </div>
      )}

      <p className="author-profile-bio">{author.bio || 'Chưa cập nhật thông tin tiểu sử.'}</p>

      <div className="author-profile-metrics">
        <Row className="g-0 align-items-center">
          <Col xs={4} className="author-profile-metric">
            <div className="author-profile-metric-label">H-index</div>
            <div className="author-profile-metric-value">{hIndex}</div>
          </Col>
          <Col xs={4} className="author-profile-metric">
            <div className="author-profile-metric-label">Trích dẫn</div>
            <div className="author-profile-metric-value">{formatLocalNumber(citations)}</div>
          </Col>
          <Col xs={4} className="author-profile-metric">
            <div className="author-profile-metric-label">Bài báo</div>
            <div className="author-profile-metric-value">{formatLocalNumber(articlesCount)}</div>
          </Col>
        </Row>
      </div>

      <div className="d-flex flex-column gap-2 mt-2">
        {author.homepage && (
          <a href={author.homepage} target="_blank" rel="noopener noreferrer" className="author-profile-link">
            <Icon icon="lucide:globe" width="14" />
            Trang cá nhân (Homepage)
          </a>
        )}
        <button
          onClick={() => document.getElementById('articles-section')?.scrollIntoView({ behavior: 'smooth' })}
          className="author-profile-button"
        >
          <Icon icon="lucide:file-text" width="14" />
          Xem công trình công bố
        </button>
      </div>
    </Card>
  );
}
