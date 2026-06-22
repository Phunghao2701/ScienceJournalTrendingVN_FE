/**
 * - items:       danh sách article của TRANG HIỆN TẠI (đã phân trang).
 * - totalItems:  tổng số article (sau khi filter, trước khi phân trang).
 * - startIndex:  index (1-indexed) của item đầu tiên trong trang hiện tại.
 * - endIndex:    index (1-indexed) của item cuối cùng trong trang hiện tại.
 */
import { useNavigate } from 'react-router-dom';
import Icon from '../../../../shared/components/Icon';
import StatusBadge from '../shared/StatusBadge';

export default function ArticleTable({ items, totalItems, startIndex, endIndex }) {
  const navigate = useNavigate();

  const handleEdit = (articleId) => {
    navigate(`/admin/articles/${articleId}`);
  };

  return (
    <div className="admin-card admin-article-table-card">
      <div className="admin-table-wrapper">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Article Details</th>
              <th>Lead Author</th>
              <th>Journal</th>
              <th>Status</th>
              <th>Submitted</th>
              <th className="admin-table__actions-col">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id}>
                {/* Article Details: title (link cam) + MS ID/pages/citations */}
                <td className="admin-article-cell">
                  <span className="admin-article-cell__title">{item.title}</span>
                  <span className="admin-article-cell__meta">
                    {item.msId} &middot; {item.pages} Pages &middot; {item.citations} Citations
                  </span>
                </td>

                {/* Lead Author: avatar + tên */}
                <td>
                  <div className="admin-author-cell">
                    <img src={item.leadAuthorAvatar} alt={item.leadAuthor} className="admin-author-cell__avatar" />
                    <span>{item.leadAuthor}</span>
                  </div>
                </td>

                <td>{item.journal}</td>

                <td>
                  <StatusBadge status={item.status} />
                </td>

                <td>{item.submittedDate}</td>

                {/* Edit action - điều hướng tới Update Article */}
                <td className="admin-table__actions-col">
                  <button
                    type="button"
                    className="admin-table__icon-btn"
                    aria-label={`Edit ${item.title}`}
                    onClick={() => handleEdit(item.id)}
                  >
                    <Icon icon="lucide:pencil" />
                  </button>
                </td>
              </tr>
            ))}

            {/* Trường hợp filter không khớp item nào */}
            {items.length === 0 && (
              <tr>
                <td colSpan={6} className="admin-table__empty">
                  No articles match the selected filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Tổng số kết quả - hiển thị dưới table, phía trên Pagination */}
      {totalItems > 0 && (
        <p className="admin-article-table-card__summary">
          Showing {startIndex}-{endIndex} of {totalItems} manuscripts
        </p>
      )}
    </div>
  );
}