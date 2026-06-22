/**
 * @file AuthorCard.jsx
 * @description Component thẻ hiển thị thông tin tóm tắt của một tác giả.
 */

import { useNavigate } from 'react-router-dom';
import { Card } from 'react-bootstrap';
import AuthorAvatar from './AuthorAvatar';

export default function AuthorCard({ author }) {
  const navigate = useNavigate();

  if (!author) return null;

  const id = author.author_id ?? author.id;
  const name = author.display_name ?? author.full_name ?? author.name ?? 'Tác giả';
  const institution1 = author.institution_1 ?? author.affiliation ?? author.institution ?? '—';
  const institution2 = author.institution_2 ?? author.department ?? '';
  const hIndex = author.h_index ?? author.hindex ?? 0;
  const citations = author.citation_count ?? author.citations ?? 0;
  const articlesCount = author.article_count ?? author.papers ?? author.article_count ?? 0;
  const tags = Array.isArray(author.subject_areas)
    ? author.subject_areas
    : author.subject_area
      ? [author.subject_area]
      : [];
  const avatarUrl = author.url_image || author.avatar_url || '';
  const avatarColor = author.avatar_color ?? '#FF7A33';

  const formatLocalNumber = (num) => {
    if (num == null) return '0';
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };

  const handleCardClick = () => {
    if (id) navigate(`/authors/${id}`);
  };

  return (
    <Card onClick={handleCardClick} className="author-card">
      <div className="d-flex align-items-start gap-3 mb-3">
        <AuthorAvatar name={name} url={avatarUrl} size="md" bgColor={avatarColor} className="flex-shrink-0" />
        <div className="flex-grow-1 min-w-0">
          <h3 className="author-card-title m-0 text-truncate">{name}</h3>
          <div className="author-card-institution mt-1 text-truncate">{institution1}</div>
          {institution2 && <div className="author-card-subinstitution mt-0.5 text-truncate">{institution2}</div>}
        </div>
      </div>

      <div className="author-card-metrics">
        <div>
          <div className="author-metric-label">H-index</div>
          <div className="author-metric-value">{hIndex}</div>
        </div>
        <div>
          <div className="author-metric-label">Trích dẫn</div>
          <div className="author-metric-value">{formatLocalNumber(citations)}</div>
        </div>
        <div>
          <div className="author-metric-label">Bài báo</div>
          <div className="author-metric-value">{formatLocalNumber(articlesCount)}</div>
        </div>
      </div>

      <hr className="author-card-divider" />

      <div className="d-flex flex-wrap gap-1.5 mt-1">
        {tags.length === 0 ? (
          <span className="author-tag-empty">Chưa cập nhật lĩnh vực</span>
        ) : (
          tags.map((tag, idx) => (
            <span
              key={idx}
              className="author-tag"
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/catalog?search=${encodeURIComponent(tag)}`);
              }}
            >
              {tag}
            </span>
          ))
        )}
      </div>
    </Card>
  );
}
