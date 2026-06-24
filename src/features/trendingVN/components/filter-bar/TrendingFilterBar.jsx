/**
 * File: src/features/trendingVN/components/filter-bar/TrendingFilterBar.jsx
 *
 * Thanh filter tim kiem cho trang TrendingVN.
 * Layout theo mau: search bar rong + 3 dropdown nho inline + nut Apply / Reset.
 * Pattern draft-vs-applied: chi fetch lai khi bam "Apply".
 *
 * Props:
 * - draftFilters: object       -- Gia tri filter dang soan (chua apply)
 * - subjectAreas: array        -- Danh sach linh vuc cho dropdown
 * - subjectCategories: array   -- Danh sach chuyen nganh cho dropdown
 * - filtersLoading: boolean    -- Dang tai du lieu dropdown
 * - onFilterChange: function   -- Callback khi thay doi filter (key, value)
 * - onApply: function          -- Callback khi bam Apply
 * - onReset: function          -- Callback khi bam Reset
 */

import Icon from '../../../../shared/components/Icon';
import './TrendingFilterBar.css';

export default function TrendingFilterBar({
  draftFilters,
  subjectAreas = [],
  subjectCategories = [],
  filtersLoading = false,
  onFilterChange,
  onApply,
  onReset,
}) {
  return (
    <div className="tfb-bar">

      {/* ── Search bar chinh (flex: 1 chiem phan lon nhat) ────────── */}
      <div className="tfb-search-wrap">
        <Icon icon="lucide:search" className="tfb-search-icon" />
        <input
          type="text"
          className="tfb-search-input"
          placeholder="Search articles..."
          value={draftFilters.search}
          onChange={(e) => onFilterChange('search', e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && onApply()}
        />
        {draftFilters.search && (
          <button
            className="tfb-search-clear"
            onClick={() => onFilterChange('search', '')}
            title="Clear search"
          >
            <Icon icon="lucide:x" width="12" />
          </button>
        )}
      </div>

      {/* ── Dropdown: All Universities ────────────────────────────── */}
      <select
        className="tfb-select"
        value={draftFilters.subject_category_id || ''}
        onChange={(e) => onFilterChange('subject_category_id', e.target.value)}
        disabled={filtersLoading}
        title="Filter by university"
      >
        <option value="">All Universities</option>
        {subjectCategories.map((cat) => (
          <option
            key={cat.subject_category_id || cat.id}
            value={cat.subject_category_id || cat.id}
          >
            {cat.display_name || cat.name}
          </option>
        ))}
      </select>

      {/* ── Dropdown: Year ────────────────────────────────────────── */}
      <select
        className="tfb-select"
        value={draftFilters.year || ''}
        onChange={(e) => onFilterChange('year', e.target.value)}
        title="Filter by year"
      >
        <option value="">Year: All</option>
        <option value="2024">Year: 2024</option>
        <option value="2023">Year: 2023</option>
        <option value="2022">Year: 2022</option>
        <option value="2021">Year: 2021</option>
        <option value="2020">Year: 2020</option>
      </select>

      {/* ── Dropdown: Field ──────────────────────────────────────── */}
      <select
        className="tfb-select"
        value={draftFilters.subject_area_id || ''}
        onChange={(e) => onFilterChange('subject_area_id', e.target.value)}
        disabled={filtersLoading}
        title="Filter by research field"
      >
        <option value="">Field: All</option>
        {subjectAreas.map((area) => (
          <option
            key={area.subject_area_id || area.id}
            value={area.subject_area_id || area.id}
          >
            {area.display_name || area.name}
          </option>
        ))}
        {/* Default options neu chua co du lieu tu API */}
        {subjectAreas.length === 0 && (
          <>
            <option value="cs">Field: Computer Science</option>
            <option value="ai">Field: AI / ML</option>
            <option value="ee">Field: Electrical Engineering</option>
          </>
        )}
      </select>

      {/* ── Nut Apply ─────────────────────────────────────────────── */}
      <button className="tfb-btn-apply" onClick={onApply}>
        <Icon icon="lucide:filter" width="13" />
        Apply
      </button>

      {/* ── Nut Reset ─────────────────────────────────────────────── */}
      <button className="tfb-btn-reset" onClick={onReset}>
        Reset
      </button>

    </div>
  );
}
