/**
 * File: src/features/trendingVN/components/breadcrumb/TrendingBreadcrumb.jsx
 *
 * Breadcrumb context bar hien thi phia tren page header.
 * Kieu: Home > 12,842 Papers > 47 Universities > 2020-2026
 * Theo sat giao dien mau Vietnam Research Index.
 *
 * Props:
 * - totalPapers: number   -- Tong so bai bao (VD: 12842)
 * - totalUniversities: number -- Tong so truong DH (VD: 47)
 * - yearRange: string     -- Khoang nam (VD: "2020-2026")
 * - onHomeClick: function -- Callback khi bam icon Home
 */

import Icon from '../../../../shared/components/Icon';
import './TrendingBreadcrumb.css';

// ── Format so co dau phan cach (VD: 12842 -> "12,842") ─────────────────────
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

      {/* ── Home icon ──────────────────────────────────────────────── */}
      <button className="tbc-home-btn" onClick={onHomeClick} title="Home">
        <Icon icon="lucide:home" width="14" />
      </button>

      {/* ── Separator ─────────────────────────────────────────────── */}
      <Icon icon="lucide:chevron-right" width="12" className="tbc-sep" />

      {/* ── Papers count ──────────────────────────────────────────── */}
      <span className="tbc-crumb tbc-crumb--link">
        {fmtNum(totalPapers)} Papers
      </span>

      {/* ── Universities count (chi hien khi co data) ─────────────── */}
      {totalUniversities != null && totalUniversities > 0 && (
        <>
          <Icon icon="lucide:chevron-right" width="12" className="tbc-sep" />
          <span className="tbc-crumb tbc-crumb--link">
            {fmtNum(totalUniversities)} Universities
          </span>
        </>
      )}

      {/* ── Year range (chi hien khi co data) ────────────────────── */}
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