/**
 * Low-level numbered pagination controls shared across admin and public pages.
 *
 * - currentPage: current page number (1-indexed)
 * - totalPages: total number of pages
 * - onPageChange: called when user clicks a page, Previous, or Next
 */
import Icon from './Icon';

// Build visible items as page numbers or a single ellipsis between distant ranges.
function buildPageItems(currentPage, totalPages) {
  const items = [];

  for (let page = 1; page <= totalPages; page += 1) {
    const isEdge = page === 1 || page === totalPages;
    const isNearCurrent = Math.abs(page - currentPage) <= 1;

    if (isEdge || isNearCurrent) {
      items.push(page);
    } else if (items[items.length - 1] !== 'ellipsis') {
      items.push('ellipsis');
    }
  }

  return items;
}

export default function PaginationControls({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  const pageItems = buildPageItems(currentPage, totalPages);

  return (
    <nav className="admin-pagination" aria-label="Pagination">
      <button
        type="button"
        className="admin-pagination__btn"
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
        aria-label="Previous page"
      >
        <Icon icon="lucide:chevron-left" />
      </button>

      {pageItems.map((item, index) =>
        item === 'ellipsis' ? (
          <span key={`ellipsis-${index}`} className="admin-pagination__ellipsis">
            ...
          </span>
        ) : (
          <button
            key={item}
            type="button"
            className={`admin-pagination__btn${item === currentPage ? ' admin-pagination__btn--active' : ''}`}
            onClick={() => onPageChange(item)}
          >
            {item}
          </button>
        )
      )}

      <button
        type="button"
        className="admin-pagination__btn"
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
        aria-label="Next page"
      >
        <Icon icon="lucide:chevron-right" />
      </button>
    </nav>
  );
}
