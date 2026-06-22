/**
 * @file AuthorLeaderboardTable.jsx
 * @description Hiển thị bảng xếp hạng các tác giả hàng đầu trong hệ thống dưới dạng bảng.
 */

import { Table } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import AuthorAvatar from './AuthorAvatar';
import AuthorRankBadge from './AuthorRankBadge';
import LoadingSkeleton from '../../../shared/components/LoadingSkeleton';
import EmptyState from '../../../shared/components/EmptyState';
import ErrorState from '../../../shared/components/ErrorState';

export default function AuthorLeaderboardTable({
  authors = [],
  loading = false,
  error = null,
  onRetry = null,
  limit = null
}) {
  const navigate = useNavigate();

  if (error) {
    return <ErrorState message={error} onRetry={onRetry} />;
  }

  if (!loading && authors.length === 0) {
    return (
      <EmptyState
        title="Chưa có dữ liệu bảng xếp hạng"
        description="Dữ liệu xếp hạng sẽ hiển thị ở đây."
        icon="lucide:trophy"
      />
    );
  }

  const displayList = limit ? authors.slice(0, limit) : authors;

  const formatLocalNumber = (num) => {
    if (num == null) return '0';
    if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`;
    if (num >= 1_000) return `${(num / 1_000).toFixed(1).replace(/\.0$/, '')}K`;
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };

  const handleAuthorClick = (author) => {
    const id = author.author_id ?? author.id;
    if (id) navigate(`/authors/${id}`);
  };

  return (
    <div className="author-leaderboard-table-shell">
      <Table hover responsive className="author-leaderboard-table m-0 align-middle">
        <thead>
          <tr>
            <th className="author-leaderboard-rank-col text-center py-3">Thứ hạng</th>
            <th className="py-3">Tác giả</th>
            <th className="py-3">Lĩnh vực chính</th>
            <th className="py-3">Bài báo</th>
            <th className="py-3">Citations</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            Array.from({ length: limit || 5 }).map((_, idx) => (
              <tr key={idx}>
                <td className="text-center"><LoadingSkeleton width="30px" height="30px" borderRadius="50%" /></td>
                <td>
                  <div className="author-leaderboard-author">
                    <LoadingSkeleton width="32px" height="32px" borderRadius="50%" />
                    <LoadingSkeleton width="120px" height="14px" />
                  </div>
                </td>
                <td><LoadingSkeleton width="80px" height="18px" borderRadius="12px" /></td>
                <td><LoadingSkeleton width="40px" height="14px" /></td>
                <td><LoadingSkeleton width="50px" height="14px" /></td>
              </tr>
            ))
          ) : (
            displayList.filter(Boolean).map((author, idx) => {
              const id = author.author_id ?? author.id;
              const name = author.display_name ?? author.full_name ?? author.author_name ?? author.name ?? 'Unknown';
              const orcid = author.orcid ?? '';
              const field = author.subject_area ?? author.primary_subject_area ?? author.field ?? author.area ?? '—';
              const articles = author.article_count ?? author.papers ?? author.works_count ?? 0;
              const citations = author.citation_count ?? author.citations ?? author.cited_by_count ?? 0;
              const rank = idx + 1;
              const avatarColor = author.avatar_color ?? (rank === 1 ? '#FF7A33' : rank === 2 ? '#6366F1' : rank === 3 ? '#0EA5E9' : '#071A1C');

              return (
                <tr key={id ?? idx} onClick={() => handleAuthorClick(author)} className="author-leaderboard-row">
                  <td className="text-center py-3">
                    <div className="d-flex justify-content-center">
                      <AuthorRankBadge rank={rank} />
                    </div>
                  </td>
                  <td>
                    <div className="author-leaderboard-author">
                      <AuthorAvatar name={name} size="sm" bgColor={avatarColor} />
                      <div>
                        <div className="author-leaderboard-name">{name}</div>
                        {orcid ? <div className="author-leaderboard-orcid">{orcid}</div> : null}
                      </div>
                    </div>
                  </td>
                  <td>
                    {!field || field === '' ? '—' : <span className="author-leaderboard-field-chip">{field}</span>}
                  </td>
                  <td className="author-leaderboard-cell">{formatLocalNumber(articles)}</td>
                  <td className="author-leaderboard-cell author-leaderboard-citations">↑ {formatLocalNumber(citations)}</td>
                </tr>
              );
            })
          )}
        </tbody>
      </Table>
    </div>
  );
}
