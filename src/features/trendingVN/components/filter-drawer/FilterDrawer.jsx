/**
 * FilterDrawer: left-drawer filter panel for TrendingVNPage (inside the expanded sidebar).
 *
 * File: features/trendingVN/components/filter-drawer/FilterDrawer.jsx
 *
 * Contains 6 collapsible FilterGroup sections:
 *   1. Date Range    -- year_from input (to_year is tracked locally; BE only supports single year)
 *   2. Open Access   -- checkbox toggle for is_open_access
 *   3. Subject Area  -- dropdown from getSubjectAreasApi (fetched here, not in hook)
 *   4. Journal       -- typeahead via JournalSearchFilter
 *   5. Topic         -- click-list from topicOptions prop (loaded by useTrendingFilters)
 *   6. Sort          -- radio group for sortBy-sortOrder combination
 *
 * NOTE: Subject Area filter maps to the `topic` param (not `subject_area_id`) because
 * the /articles endpoint does not expose a subject_area_id filter yet (Phase 3 TODO).
 *
 * Props:
 * - filters: object           -- Current filter state from useArticleList
 * - updateFilters: function   -- Callback(partialUpdate) to apply new filter values
 * - clearFilters: function    -- Callback to reset all filters
 * - journalOptions: array     -- Journal list from useTrendingFilters
 * - topicOptions: array       -- Topic list from useTrendingFilters
 */
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Icon } from '@iconify/react';
import { Alert } from 'react-bootstrap';
import FilterGroup from './FilterGroup';
import JournalSearchFilter from './JournalSearchFilter';
import { getSubjectAreasApi } from '../../api/trending.api';

const MIN_YEAR = 1990;
const MAX_YEAR = 2026;

export default function FilterDrawer({ filters, updateFilters, clearFilters, journalOptions = [], topicOptions = [] }) {
  const { t } = useTranslation();
  const [openGroups, setOpenGroups] = useState(['dateRange']);
  const [subjectAreas, setSubjectAreas] = useState([]);
  const [isSubjectAreasLoading, setIsSubjectAreasLoading] = useState(true);
  const [subjectAreasError, setSubjectAreasError] = useState(null);
  const [fromYear, setFromYear] = useState(filters.selectedYear !== 'all' ? filters.selectedYear : '');
  const [toYear, setToYear] = useState('');
  const [selectedJournalLabel, setSelectedJournalLabel] = useState(null);

  useEffect(() => {
    setIsSubjectAreasLoading(true);
    setSubjectAreasError(null);
    getSubjectAreasApi()
      .then((r) => setSubjectAreas(r?.data?.data || []))
      .catch(() => setSubjectAreasError(t('loadSubjectAreasFailed')))
      .finally(() => setIsSubjectAreasLoading(false));
  }, [t]);

  // Keep local "from year" input in sync when the URL filter is cleared elsewhere (e.g. Clear All chip)
  useEffect(() => {
    if (filters.selectedYear === 'all') {
      setFromYear('');
    }
  }, [filters.selectedYear]);

  const toggleGroup = (key) => {
    setOpenGroups((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]));
  };

  const handleApplyYearRange = () => {
    // BE limitation: GET /api/v1/articles only supports a single publication_year.
    // TODO(Phase 3): extend BE with year_from/year_to and apply both fromYear and toYear.
    updateFilters({ year: fromYear || 'all' });
  };

  const handleClearDateRange = () => {
    setFromYear('');
    setToYear('');
    updateFilters({ year: 'all' });
  };

  const handleToggleOpenAccess = (e) => {
    updateFilters({ access: e.target.checked ? 'open' : 'all' });
  };

  const handleSubjectAreaChange = (e) => {
    // BE limitation: /articles has no dedicated subject_area_id param yet.
    // TODO(Phase 3): replace this topic-param reuse once BE adds subject_area_id filtering.
    updateFilters({ topic: e.target.value || 'all' });
  };

  const handleClearSubjectArea = () => {
    updateFilters({ topic: 'all' });
  };

  const handleTopicSelect = (topicId) => {
    updateFilters({ topic: topicId });
  };

  const handleClearTopic = () => {
    updateFilters({ topic: 'all' });
  };

  const handleJournalSelect = (journal) => {
    setSelectedJournalLabel(journal.display_name);
    updateFilters({ journal: journal.journal_id });
  };

  const handleJournalClear = () => {
    setSelectedJournalLabel(null);
    updateFilters({ journal: 'all' });
  };

  const handleSortOptionChange = (value) => {
    const [sortBy, sortOrder] = value.split('-');
    updateFilters({ sortBy, sortOrder });
  };

  let journalDisplayValue = 'all';
  if (filters.selectedJournal && filters.selectedJournal !== 'all') {
    const matched = journalOptions.find((j) => String(j.journal_id) === String(filters.selectedJournal));
    journalDisplayValue = { display_name: selectedJournalLabel || matched?.display_name || `Journal #${filters.selectedJournal}` };
  }

  const dateRangeActiveCount = filters.selectedYear !== 'all' ? 1 : 0;
  const openAccessActiveCount = filters.selectedAccess === 'open' ? 1 : 0;
  const subjectAreaActiveCount = filters.selectedTopic !== 'all' ? 1 : 0;
  const journalActiveCount = filters.selectedJournal !== 'all' ? 1 : 0;
  const topicActiveCount = filters.selectedTopic !== 'all' ? 1 : 0;
  const sortActiveCount = filters.sortBy !== 'created_at' || filters.sortOrder !== 'desc' ? 1 : 0;

  const hasAnyActiveFilter = dateRangeActiveCount > 0 || openAccessActiveCount > 0
    || journalActiveCount > 0 || topicActiveCount > 0 || sortActiveCount > 0;

  const sortOptions = [
    { value: 'created_at-desc', label: t('sortDateNewest') },
    { value: 'created_at-asc', label: t('sortDateOldest') },
    { value: 'title-asc', label: t('sortTitleAsc') },
    { value: 'title-desc', label: t('sortTitleDesc') },
    { value: 'semantic_citation_count-desc', label: t('sortCitationsMost') },
    { value: 'semantic_citation_count-asc', label: t('sortCitationsLeast') },
  ];
  const currentSortValue = `${filters.sortBy}-${filters.sortOrder}`;

  return (
    <div className="lens-fg-drawer">
      {hasAnyActiveFilter && clearFilters && (
        <button className="lens-fg-clear-all-link" onClick={clearFilters}>
          <Icon icon="lucide:x-circle" width="12" />
          {t('clearAll')}
        </button>
      )}

      {/* Group 1: Date Range */}
      <FilterGroup
        title={t('sbDateRange')}
        icon="lucide:calendar"
        isOpen={openGroups.includes('dateRange')}
        onToggle={() => toggleGroup('dateRange')}
        activeCount={dateRangeActiveCount}
      >
        <div className="lens-fg-year-range">
          <input
            type="number"
            className="lens-fg-year-input"
            placeholder={t('fromYear')}
            min={MIN_YEAR}
            max={MAX_YEAR}
            value={fromYear}
            onChange={(e) => setFromYear(e.target.value)}
          />
          <span className="lens-fg-year-sep">-</span>
          <input
            type="number"
            className="lens-fg-year-input"
            placeholder={t('toYear')}
            min={MIN_YEAR}
            max={MAX_YEAR}
            value={toYear}
            onChange={(e) => setToYear(e.target.value)}
          />
        </div>
        <div className="lens-fg-action-row">
          <button className="lens-fg-apply-btn" onClick={handleApplyYearRange}>
            {t('apply')}
          </button>
          {dateRangeActiveCount > 0 && (
            <button className="lens-fg-clear-btn" onClick={handleClearDateRange} title={t('clearAll')}>
              <Icon icon="lucide:x" width="11" />
            </button>
          )}
        </div>
      </FilterGroup>

      {/* Group 2: Open Access */}
      <FilterGroup
        title={t('sbFlags')}
        icon="lucide:flag"
        isOpen={openGroups.includes('flags')}
        onToggle={() => toggleGroup('flags')}
        activeCount={openAccessActiveCount}
      >
        <label className="lens-fg-checkbox-row">
          <input
            type="checkbox"
            checked={filters.selectedAccess === 'open'}
            onChange={handleToggleOpenAccess}
          />
          <span>{t('openAccessOnly')}</span>
        </label>
      </FilterGroup>

      {/* Group 3: Subject Area */}
      <FilterGroup
        title={t('subjectArea')}
        icon="lucide:layers"
        isOpen={openGroups.includes('subjectArea')}
        onToggle={() => toggleGroup('subjectArea')}
        activeCount={subjectAreaActiveCount}
      >
        {isSubjectAreasLoading && (
          <div className="lens-fg-skeleton-select" />
        )}
        {!isSubjectAreasLoading && subjectAreasError && (
          <Alert variant="danger" className="lens-fg-alert">
            {subjectAreasError}
          </Alert>
        )}
        {!isSubjectAreasLoading && !subjectAreasError && (
          <div className="lens-fg-action-row">
            <select
              className="lens-fg-select"
              value={filters.selectedTopic !== 'all' ? filters.selectedTopic : ''}
              onChange={handleSubjectAreaChange}
            >
              <option value="">{t('selectSubjectArea')}</option>
              {subjectAreas.map((area) => (
                <option key={area.subject_area_id} value={area.subject_area_id}>
                  {area.display_name}
                </option>
              ))}
            </select>
            {subjectAreaActiveCount > 0 && (
              <button className="lens-fg-clear-btn" onClick={handleClearSubjectArea} title={t('clearAll')}>
                <Icon icon="lucide:x" width="11" />
              </button>
            )}
          </div>
        )}
      </FilterGroup>

      {/* Group 4: Journal */}
      <FilterGroup
        title={t('journalLabel')}
        icon="lucide:book"
        isOpen={openGroups.includes('journal')}
        onToggle={() => toggleGroup('journal')}
        activeCount={journalActiveCount}
      >
        <JournalSearchFilter
          selectedJournal={journalDisplayValue}
          onSelect={handleJournalSelect}
          onClear={handleJournalClear}
        />
      </FilterGroup>

      {/* Group 5: Topic / Research Field */}
      <FilterGroup
        title={t('researchTopics')}
        icon="lucide:tag"
        isOpen={openGroups.includes('topic')}
        onToggle={() => toggleGroup('topic')}
        activeCount={topicActiveCount}
      >
        {topicActiveCount > 0 && (
          <button className="lens-fg-clear-link" onClick={handleClearTopic}>
            <Icon icon="lucide:x" width="11" />
            {t('clearAll')}
          </button>
        )}
        <div className="lens-fg-topic-list">
          {topicOptions.map((topic) => {
            const topicId = topic.topic_id || topic.id;
            const isActive = String(filters.selectedTopic) === String(topicId);
            return (
              <div
                key={topicId}
                className={`lens-fg-topic-item ${isActive ? 'lens-fg-topic-item--active' : ''}`}
                onClick={() => handleTopicSelect(topicId)}
              >
                {topic.display_name}
              </div>
            );
          })}
        </div>
      </FilterGroup>

      {/* Group 6: Sort */}
      <FilterGroup
        title={t('sortByLabel')}
        icon="lucide:arrow-up-down"
        isOpen={openGroups.includes('sort')}
        onToggle={() => toggleGroup('sort')}
        activeCount={sortActiveCount}
      >
        <div className="lens-fg-sort-list">
          {sortOptions.map((opt) => (
            <label key={opt.value} className="lens-fg-radio-row">
              <input
                type="radio"
                name="lens-fg-sort"
                checked={currentSortValue === opt.value}
                onChange={() => handleSortOptionChange(opt.value)}
              />
              <span>{opt.label}</span>
            </label>
          ))}
        </div>
      </FilterGroup>
    </div>
  );
}
