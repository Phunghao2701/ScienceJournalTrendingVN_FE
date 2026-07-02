/**
 * TrendingFilterBar: search + inline filter controls for TrendingPage (the analysis view).
 *
 * File: src/features/trendingVN/components/filter-bar/TrendingFilterBar.jsx
 *
 * Layout: wide search input + 3 small dropdowns (university, year, field) + Apply / Reset.
 * Uses the draft-vs-applied pattern: new values are staged in draftFilters and
 * only trigger a re-fetch when the user clicks "Apply" (or presses Enter in search).
 *
 * Props:
 * - draftFilters: object       -- Staged filter values (not yet applied)
 * - subjectAreas: array        -- Research field options for the Field dropdown
 * - subjectCategories: array   -- University/category options for the Universities dropdown
 * - filtersLoading: boolean    -- Disables dropdowns while options are loading
 * - onFilterChange: function   -- Callback(key, value) called on every input change
 * - onApply: function          -- Callback triggered by Apply button or Enter key
 * - onReset: function          -- Callback to clear all filters back to defaults
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

      {/* Search bar (flex: 1, takes majority of width) */}
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

      {/* Dropdown: Universities */}
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

      {/* Dropdown: Year */}
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

      {/* Dropdown: Research Field */}
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
        {/* Hardcoded fallbacks shown only when the subject-areas API returns nothing */}
        {subjectAreas.length === 0 && (
          <>
            <option value="cs">Field: Computer Science</option>
            <option value="ai">Field: AI / ML</option>
            <option value="ee">Field: Electrical Engineering</option>
          </>
        )}
      </select>

      {/* Apply button */}
      <button className="tfb-btn-apply" onClick={onApply}>
        <Icon icon="lucide:filter" width="13" />
        Apply
      </button>

      {/* Reset button */}
      <button className="tfb-btn-reset" onClick={onReset}>
        Reset
      </button>

    </div>
  );
}
