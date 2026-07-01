import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Icon } from '@iconify/react';
import FilterGroup from './FilterGroup';
import JournalSearchFilter from './JournalSearchFilter';

const MIN_YEAR = 1990;
const MAX_YEAR = 2026;

export default function FilterDrawer({ filters, updateFilters, clearFilters, journalOptions = [], topicOptions = [] }) {
  const { t } = useTranslation();
  const [openGroups, setOpenGroups] = useState(['dateRange']);
  const [fromYear, setFromYear] = useState(filters.selectedYear !== 'all' ? filters.selectedYear : '');
  const [selectedJournalLabel, setSelectedJournalLabel] = useState(null);

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
    updateFilters({ year: fromYear || 'all' });
  };

  const handleClearDateRange = () => {
    setFromYear('');
    updateFilters({ year: 'all' });
  };

  const handleToggleOpenAccess = (e) => {
    updateFilters({ access: e.target.checked ? 'open' : 'all' });
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
    { value: 'publication_year-desc', label: t('sortYearDesc') },
    { value: 'publication_year-asc', label: t('sortYearAsc') },
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

      {/* Group 1: Publication Year */}
      <FilterGroup
        title={t('publicationYear')}
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

      {/* Group 3: Journal */}
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

      {/* Group 4: Topic / Research Field */}
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

      {/* Group 5: Sort */}
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
