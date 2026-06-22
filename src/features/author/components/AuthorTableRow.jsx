/**
 * @file AuthorTableRow.jsx
 * @description Component dòng con của `AuthorTable`.
 */

import { useNavigate } from 'react-router-dom';
import AuthorAvatar from './AuthorAvatar';

export default function AuthorTableRow({ author, index }) {
  const navigate = useNavigate();

  if (!author) return null;

  const id = author.author_id ?? author.id;
  const name = author.display_name ?? author.full_name ?? author.name ?? 'Tác giả';
  const orcid = author.orcid ?? '—';
  const institution1 = author.institution_1 ?? author.affiliation ?? author.institution ?? '—';
  const institution2 = author.institution_2 ?? author.department ?? '';
  const avatarUrl = author.url_image || author.avatar_url || '';
  const institutionText = institution2 ? `${institution1} - ${institution2}` : institution1;
  const hIndex = author.h_index ?? '—';
  const citations = author.citation_count ?? author.citations ?? 0;
  const articlesCount = author.article_count ?? author.papers ?? 0;
  const avatarColor = author.avatar_color ?? '#FF7A33';

  const formatLocalNumber = (num) => {
    if (num == null || isNaN(num)) return '0';
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };

  const handleRowClick = () => {
    if (id) navigate(`/authors/${id}`);
  };

  return (
    <tr onClick={handleRowClick} className="author-table-row align-middle">
      <td className="author-table-index text-center">{index}</td>
      <td>
        <div className="d-flex align-items-center gap-2">
          <AuthorAvatar name={name} url={avatarUrl} size="sm" bgColor={avatarColor} />
          <div className="min-w-0">
            <div className="author-table-name text-truncate">{name}</div>
            {orcid && orcid !== '—' && <div className="author-table-orcid">ORCID: {orcid}</div>}
          </div>
        </div>
      </td>
      <td className="author-table-cell author-table-org text-truncate">{institutionText}</td>
      <td className="author-table-cell">{formatLocalNumber(articlesCount)}</td>
      <td className="author-table-cell">{formatLocalNumber(citations)}</td>
      <td className="author-table-cell author-table-hindex">{hIndex}</td>
      <td>
        <span className="author-table-link">Chi tiết →</span>
      </td>
    </tr>
  );
}
