import { useState, useEffect, useRef } from 'react';
import { Icon } from '@iconify/react';
import { useTranslation } from 'react-i18next';
import { getJournalsApi } from '../../api/trending.api';

export default function JournalSearchFilter({ selectedJournal, onSelect, onClear }) {
  const { t } = useTranslation();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    setIsLoading(true);
    const timer = setTimeout(async () => {
      try {
        const r = await getJournalsApi({ search: query, limit: 10 });
        const items = r?.data?.data?.items || r?.data?.data || [];
        setResults(items);
        setIsOpen(true);
      } catch {
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (journal) => {
    onSelect(journal);
    setQuery('');
    setIsOpen(false);
    setResults([]);
  };

  const handleClear = (e) => {
    e.stopPropagation();
    setQuery('');
    setResults([]);
    setIsOpen(false);
    onClear();
  };

  return (
    <div ref={containerRef} style={{ position: 'relative' }}>
      {selectedJournal && selectedJournal !== 'all' ? (
        <div className="lens-fg-selected-item">
          <span className="lens-fg-selected-label">{selectedJournal.display_name || selectedJournal}</span>
          <button className="lens-fg-clear-btn" onClick={handleClear} title={t('clearAll')}>
            <Icon icon="lucide:x" width="11" />
          </button>
        </div>
      ) : (
        <div className="lens-fg-search-wrap">
          <Icon icon="lucide:search" width="13" className="lens-fg-search-icon" />
          <input
            type="text"
            className="lens-fg-search-input"
            placeholder={t('typeToSearchJournal')}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {isLoading && (
            <Icon icon="lucide:loader-2" width="13" className="lens-fg-search-spinner" />
          )}
        </div>
      )}

      {isOpen && results.length > 0 && (
        <div className="lens-fg-journal-dropdown">
          {results.map((journal) => (
            <div
              key={journal.journal_id}
              className="lens-fg-journal-option"
              onClick={() => handleSelect(journal)}
            >
              <span className="lens-fg-journal-name">{journal.display_name}</span>
              {journal.issn && (
                <span className="lens-fg-journal-issn">{t('issnLabel')}: {journal.issn}</span>
              )}
            </div>
          ))}
        </div>
      )}

      {isOpen && !isLoading && query.length >= 2 && results.length === 0 && (
        <div className="lens-fg-journal-dropdown">
          <div className="lens-fg-journal-empty">{t('noResults')}</div>
        </div>
      )}
    </div>
  );
}
