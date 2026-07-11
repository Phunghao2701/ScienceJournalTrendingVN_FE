/**
 * PaginationControls — low-level numbered pagination bar.
 *
 * Shared across admin and public pages. Renders Previous / page-numbers /
 * Next with collapsible ellipsis for large page counts.
 *
 * UX note: clicking the … ellipsis reveals a small input so the user can
 * jump directly to any page hidden in the collapsed range (same pattern
 * used by Ant Design, MUI, and Notion).
 *
 * Props:
 *   currentPage  {number}   Active page, 1-indexed.
 *   totalPages   {number}   Total number of pages.
 *   onPageChange {function} Called with the new page number when user navigates.
 */
import { useState, useRef, useEffect } from 'react';
import Icon from './Icon';

/**
 * Build the list of items to render in the pagination bar.
 * Each item is either a page number or the string 'ellipsis-left' / 'ellipsis-right'
 * to represent collapsed page ranges. Using distinct ellipsis keys avoids React
 * key collisions when both sides collapse simultaneously.
 *
 * Window size: always shows the current page ± PAGE_WINDOW pages on each side,
 * plus page 1 and the last page as anchors. Most production sites (Google,
 * Amazon, PubMed) use a window of 2.
 */
const PAGE_WINDOW = 2; // pages shown on each side of the current page

function buildPageItems(currentPage, totalPages) {
  const items = [];

  for (let page = 1; page <= totalPages; page += 1) {
    const isEdge = page === 1 || page === totalPages;
    const isNearCurrent = Math.abs(page - currentPage) <= PAGE_WINDOW;

    if (isEdge || isNearCurrent) {
      items.push(page);
    } else if (items[items.length - 1] !== 'ellipsis-left' && items[items.length - 1] !== 'ellipsis-right') {
      // Distinguish left vs right ellipsis so each has a stable, unique key
      const ellipsisKey = page < currentPage ? 'ellipsis-left' : 'ellipsis-right';
      items.push(ellipsisKey);
    }
  }

  return items;
}

/** Returns the CSS class string for a page button. */
function pageButtonClass(page, currentPage) {
  const base = 'admin-pagination__btn';
  return page === currentPage ? `${base} ${base}--active` : base;
}

/**
 * EllipsisJumper — renders the … placeholder.
 *
 * Clicking it toggles into an <input> mode so the user can type
 * any page number and jump directly to it.
 *
 * - Enter  → navigate to the typed page (if valid)
 * - Escape → revert to ellipsis without navigating
 * - Blur   → revert to ellipsis without navigating
 *
 * Props:
 *   totalPages   {number}   Upper bound for validation.
 *   onPageChange {function} Called with the target page number.
 */
function EllipsisJumper({ totalPages, onPageChange }) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState('');
  const inputRef = useRef(null);

  // Auto-focus the input whenever it appears
  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editing]);

  /** Validate and navigate, then close the input. */
  function commit() {
    const page = parseInt(value, 10);
    if (!Number.isNaN(page) && page >= 1 && page <= totalPages) {
      onPageChange(page);
    }
    setEditing(false);
    setValue('');
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') {
      commit();
    } else if (e.key === 'Escape') {
      // Discard without navigating
      setEditing(false);
      setValue('');
    }
  }

  if (editing) {
    return (
      <input
        ref={inputRef}
        type="number"
        className="admin-pagination__jumper-input"
        value={value}
        min={1}
        max={totalPages}
        placeholder="…"
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={() => {
          // Blur without Enter → discard
          setEditing(false);
          setValue('');
        }}
        aria-label={`Jump to page (1–${totalPages})`}
      />
    );
  }

  return (
    <button
      type="button"
      className="admin-pagination__ellipsis"
      onClick={() => setEditing(true)}
      title="Click to jump to a page"
      aria-label="Jump to page"
    >
      &hellip;
    </button>
  );
}

export default function PaginationControls({ currentPage, totalPages, onPageChange }) {
  // Nothing to paginate — render nothing
  if (totalPages <= 1) return null;

  const pageItems = buildPageItems(currentPage, totalPages);

  return (
    <nav className="admin-pagination" aria-label="Pagination navigation">
      {/* ← Previous button */}
      <button
        type="button"
        className="admin-pagination__btn admin-pagination__btn--nav"
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
        aria-label="Previous page"
      >
        <Icon icon="lucide:chevron-left" />
      </button>

      {/* Page number buttons and clickable ellipsis jumpers */}
      {pageItems.map((item) =>
        item === 'ellipsis-left' || item === 'ellipsis-right' ? (
          <EllipsisJumper
            key={item}
            totalPages={totalPages}
            onPageChange={onPageChange}
          />
        ) : (
          <button
            key={item}
            type="button"
            className={pageButtonClass(item, currentPage)}
            onClick={() => onPageChange(item)}
            aria-current={item === currentPage ? 'page' : undefined}
            aria-label={`Page ${item}`}
          >
            {item}
          </button>
        )
      )}

      {/* → Next button */}
      <button
        type="button"
        className="admin-pagination__btn admin-pagination__btn--nav"
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
        aria-label="Next page"
      >
        <Icon icon="lucide:chevron-right" />
      </button>
    </nav>
  );
}

