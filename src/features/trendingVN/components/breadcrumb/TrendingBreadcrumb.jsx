/**
 * TrendingBreadcrumb: context bar displayed above the page header.
 *
 * File: src/features/trendingVN/components/breadcrumb/TrendingBreadcrumb.jsx
 *
 * Format: Home > 12,842 Papers > 47 Universities > 2020-2026
 * Matches the Vietnam Research Index reference UI.
 *
 * Props:
 * - totalPapers: number          -- Total article count (e.g. 12842)
 * - totalUniversities: number    -- Total university count; hidden when 0 or null
 * - yearRange: string            -- Year span string (e.g. "2020-2026"); hidden when null
 * - onHomeClick: function        -- Callback when the Home icon is clicked
 */

import Icon from '../../../../shared/components/Icon';
import './TrendingBreadcrumb.css';

// Format number with thousands separator (e.g. 12842 -> "12,842")
function fmtNum(n) {
  if (!n && n !== 0) return '—';
  return Number(n).toLocaleString('en-US');
}

export default function TrendingBreadcrumb({
  totalPapers = 0,
  totalUniversities = null,
  yearRange = null,
  onHomeClick,
}) {
  return (
    <nav className="tbc-bar" aria-label="Breadcrumb context">

      {/* Home icon */}
      <button className="tbc-home-btn" onClick={onHomeClick} title="Home">
        <Icon icon="lucide:home" width="14" />
      </button>

      {/* Separator */}
      <Icon icon="lucide:chevron-right" width="12" className="tbc-sep" />

      {/* Papers count */}
      <span className="tbc-crumb tbc-crumb--link">
        {fmtNum(totalPapers)} Papers
      </span>

      {/* Universities count (only rendered when totalUniversities > 0) */}
      {totalUniversities != null && totalUniversities > 0 && (
        <>
          <Icon icon="lucide:chevron-right" width="12" className="tbc-sep" />
          <span className="tbc-crumb tbc-crumb--link">
            {fmtNum(totalUniversities)} Universities
          </span>
        </>
      )}

      {/* Year range (only rendered when yearRange is non-null) */}
      {yearRange && (
        <>
          <Icon icon="lucide:chevron-right" width="12" className="tbc-sep" />
          <span className="tbc-crumb tbc-crumb--active">
            {yearRange}
          </span>
        </>
      )}

    </nav>
  );
}