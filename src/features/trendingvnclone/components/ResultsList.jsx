import { useState } from 'react';
import ScholarlyWorkCard from './ScholarlyWorkCard';
import ResultsTable from './ResultsTable';
import { toast } from '../../../shared/utils/toast';
import {
  List,
  Table,
  BarChart,
  ChevronDown,
  Settings,
  Bookmark,
  Share2,
  Download,
  ChevronLeft,
  ChevronRight,
  Info
} from 'lucide-react';

const SAVED_QUERIES_KEY = 'scholar_saved_search_queries';

export const ResultsList = ({
  items,
  totalItems,
  sortBy,
  sortOrder,
  onSortChange,
  currentPage,
  onPageChange,
  pageSize,
  onPageSizeChange,
  isLoading = false,
  viewMode = 'list',
  onViewChange = () => {},
  searchState = {},
  returnTo = ''
}) => {
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [activeTab, setActiveTab] = useState('works');
  const [allExpanded, setAllExpanded] = useState(false);
  const [showCustomise, setShowCustomise] = useState(false);
  const [visibleFields, setVisibleFields] = useState({ authors: true, journal: true, doi: true });

  const handleSelectToggle = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedIds(new Set(items.map((i) => i.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const toggleField = (key) => {
    setVisibleFields((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const isAllSelected = items.length > 0 && selectedIds.size === items.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  // Real Export — downloads the currently loaded page as CSV
  const handleExport = () => {
    if (items.length === 0) {
      toast.warning('There are no scholarly works to export');
      return;
    }
    const csvEscape = (value) => `"${String(value ?? '').replace(/"/g, '""')}"`;
    const headers = ['Title', 'Authors', 'Journal', 'DOI', 'ISSN', 'Citations', 'Publication Year'];
    const rows = [headers.join(',')];
    items.forEach((item) => {
      rows.push([
        csvEscape(item.title),
        csvEscape(item.authors.map((a) => a.name).join('; ')),
        csvEscape(item.journal),
        csvEscape(item.doi),
        csvEscape(item.issn),
        item.citingScholarlyWorks,
        item.date
      ].join(','));
    });

    try {
      const blob = new Blob([rows.join('\n')], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', 'scholarly-works-export.csv');
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success(`Exported ${items.length} scholarly records to CSV`);
    } catch (err) {
      console.error('Unable to export file:', err);
      toast.error('Data export failed');
    }
  };

  // Real Share — copies the current, fully filtered URL (state lives in the URL)
  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied — share this search with others.');
    } catch (err) {
      console.error('Unable to copy link:', err);
      toast.error('Unable to copy link to clipboard');
    }
  };

  // Real Save as Query — persists the current filter state locally
  const handleSaveQuery = () => {
    try {
      const newQuery = {
        id: Date.now(),
        title: searchState?.search?.trim() || 'Untitled scholar query',
        filters: { ...searchState },
        savedAt: new Date().toISOString()
      };
      const existing = JSON.parse(localStorage.getItem(SAVED_QUERIES_KEY) || '[]');
      localStorage.setItem(SAVED_QUERIES_KEY, JSON.stringify([...existing, newQuery]));
      toast.success('Search query saved to your personal Lens library collection.');
    } catch (err) {
      console.error('Unable to save query:', err);
      toast.error('Unable to save query');
    }
  };

  return (
    <div className="flex-grow flex flex-col font-sans select-none w-full lg:w-[743.7px] border-r border-[#D8E7F4] bg-white">
      {/* 1. Results View Tabs Header */}
      <div className="border-b border-[#D8E7F4] flex items-center justify-between px-4 bg-gray-50/50">
        {/* Left Tabs */}
        <div className="flex space-x-1 pt-2">
          <button
            onClick={() => setActiveTab('works')}
            className={`px-4 py-2 text-[13.6px] font-bold border-t-2 border-x transition-colors relative cursor-pointer ${
              activeTab === 'works'
                ? 'border-t-lens-link-blue border-x-[#D8E7F4] bg-white text-lens-link-blue'
                : 'border-t-transparent border-x-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            Scholarly Works ({totalItems})
          </button>
          <button
            onClick={() => setActiveTab('citations')}
            className={`px-4 py-2 text-[13.6px] font-bold border-t-2 border-x transition-colors flex items-center cursor-pointer ${
              activeTab === 'citations'
                ? 'border-t-lens-link-blue border-x-[#D8E7F4] bg-white text-lens-link-blue'
                : 'border-t-transparent border-x-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            Explore Citations
            <ChevronDown className="w-3.5 h-3.5 ml-1 text-gray-400" />
          </button>
        </div>

        {/* Right View Modes */}
        <div className="flex items-center space-x-1.5 border border-[#D8E7F4] rounded-sm bg-white overflow-hidden p-0.5 shadow-sm text-gray-600">
          <button
            onClick={() => onViewChange('table')}
            className={`p-1.5 rounded-xs flex items-center cursor-pointer hover:bg-gray-100 ${
              viewMode === 'table' ? 'bg-[#EBF2FA] text-lens-link-blue font-semibold' : ''
            }`}
            title="Table View"
          >
            <Table className="w-4 h-4" />
          </button>
          <button
            onClick={() => onViewChange('list')}
            className={`p-1.5 rounded-xs flex items-center cursor-pointer hover:bg-gray-100 ${
              viewMode === 'list' ? 'bg-[#EBF2FA] text-lens-link-blue font-semibold' : ''
            }`}
            title="List View"
          >
            <List className="w-4 h-4" />
          </button>
          <button
            onClick={() => onViewChange('analysis')}
            className={`p-1.5 rounded-xs flex items-center cursor-pointer hover:bg-gray-100 ${
              viewMode === 'analysis' ? 'bg-[#EBF2FA] text-lens-link-blue font-semibold' : ''
            }`}
            title="Analysis View"
          >
            <BarChart className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2. Action Toolbar Row */}
      <div className="border-b border-[#D8E7F4] bg-white py-2 px-4 flex flex-wrap items-center justify-between gap-y-2 select-none">
        {/* Left Toolbar actions */}
        <div className="flex flex-wrap items-center gap-4 text-[12.8px] text-lens-slate-gray">
          {/* Checkbox select all wrapper */}
          <label className="flex items-center space-x-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={isAllSelected}
              onChange={(e) => handleSelectAll(e.target.checked)}
              className="rounded border-gray-300 text-lens-link-blue focus:ring-lens-link-blue w-4 h-4 cursor-pointer"
            />
            <span className="font-semibold text-gray-700">
              Select{selectedIds.size > 0 ? ` (${selectedIds.size})` : ''}
            </span>
          </label>

          <button
            onClick={() => setAllExpanded((prev) => !prev)}
            className="hover:text-gray-950 font-medium flex items-center cursor-pointer"
          >
            {allExpanded ? 'Collapse All' : 'Expand All'}
          </button>

          <button
            onClick={() => setShowCustomise((prev) => !prev)}
            className="hover:text-gray-950 flex items-center space-x-1 cursor-pointer"
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Customise List</span>
          </button>

          <button onClick={handleSaveQuery} className="hover:text-gray-950 flex items-center space-x-1 cursor-pointer">
            <Bookmark className="w-3.5 h-3.5" />
            <span>Save as Query</span>
          </button>

          <button onClick={handleShare} className="hover:text-gray-950 flex items-center space-x-1 cursor-pointer">
            <Share2 className="w-3.5 h-3.5" />
            <span>Share</span>
          </button>

          <button onClick={handleExport} className="hover:text-gray-950 flex items-center space-x-1 cursor-pointer">
            <Download className="w-3.5 h-3.5" />
            <span>Export</span>
          </button>

          <div className="flex items-center space-x-1 bg-red-50 text-red-700 border border-red-200 px-2 py-0.5 rounded-sm select-none">
            <span className="font-bold text-[10px]">New</span>
            <span>Analysis Preview</span>
          </div>
        </div>

        {/* Right Sorting options */}
        <div className="flex items-center space-x-1.5 text-[12.8px] text-lens-slate-gray">
          <select
            value={`${sortBy}-${sortOrder}`}
            onChange={(e) => {
              const [nextSortBy, nextSortOrder] = e.target.value.split('-');
              onSortChange(nextSortBy, nextSortOrder);
            }}
            className="border border-gray-300 rounded-sm px-2 py-1 bg-white hover:border-gray-400 font-medium text-gray-800 focus:outline-none focus:ring-1 focus:ring-lens-link-blue cursor-pointer"
          >
            <option value="publication_date-desc">Date Published (newest)</option>
            <option value="publication_date-asc">Date Published (oldest)</option>
            <option value="citation_count-desc">Citation Count (highest)</option>
          </select>
          <Info className="w-4.5 h-4.5 text-gray-400 hover:text-gray-600" />
        </div>
      </div>

      {/* 2b. Customise List panel */}
      {showCustomise && (
        <div className="border-b border-[#D8E7F4] bg-[#F8FAFD] px-4 py-3 animate-in fade-in duration-100">
          <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wide mb-2">
            Customise your results view
          </div>
          <div className="flex flex-wrap gap-4">
            {[
              { key: 'authors', label: 'Authors' },
              { key: 'journal', label: 'Journal' },
              { key: 'doi', label: 'DOI' }
            ].map((col) => (
              <label key={col.key} className="flex items-center space-x-1.5 text-[12.8px] text-gray-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={visibleFields[col.key]}
                  onChange={() => toggleField(col.key)}
                  className="rounded border-gray-300 text-lens-link-blue focus:ring-lens-link-blue w-3.5 h-3.5 cursor-pointer"
                />
                <span className="font-semibold">{col.label}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* 3. Items Mapping */}
      {viewMode === 'table' ? (
        <ResultsTable
          items={items}
          isLoading={isLoading}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSortChange={onSortChange}
          returnTo={returnTo}
        />
      ) : (
        <div className="flex-grow flex flex-col divide-y divide-[#D8E7F4]">
          {isLoading ? (
            Array.from({ length: 5 }).map((_, idx) => (
              <div key={idx} className="p-6 space-y-3 bg-white animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                <div className="flex space-x-2 pt-2">
                  <div className="h-5 bg-gray-200 rounded w-16"></div>
                  <div className="h-5 bg-gray-200 rounded w-16"></div>
                </div>
              </div>
            ))
          ) : items.length > 0 ? (
            items.map((item) => (
              <ScholarlyWorkCard
                key={item.id}
                item={item}
                isSelected={selectedIds.has(item.id)}
                onSelectToggle={handleSelectToggle}
                forceExpanded={allExpanded}
                visibleFields={visibleFields}
                returnTo={returnTo}
              />
            ))
          ) : (
            <div className="p-8 text-center text-[14px] text-gray-500 bg-gray-50/50">
              No scholarly works matching your search queries and sidebar filter selections.
            </div>
          )}
        </div>
      )}

      {/* 4. Pagination Footer Bar */}
      {totalItems > 0 && (
        <div className="border-t border-[#D8E7F4] bg-white py-3 px-4 flex items-center justify-between select-none">
          {/* Results count limit */}
          <div className="flex items-center space-x-1 text-[12.8px] text-lens-slate-gray cursor-pointer">
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(parseInt(e.target.value, 10))}
              className="border border-gray-300 rounded-sm px-2 py-1 bg-white hover:border-gray-400 text-gray-800 font-semibold cursor-pointer focus:outline-none focus:ring-1 focus:ring-lens-link-blue"
            >
              <option value="5">Show 5 Results</option>
              <option value="10">Show 10 Results</option>
              <option value="20">Show 20 Results</option>
            </select>
            <Info className="w-4.5 h-4.5 text-gray-400" />
          </div>

          {/* Numeric pagination links */}
          <div className="flex items-center space-x-1 text-[13.6px] text-lens-slate-gray font-sans">
            <button
              onClick={() => currentPage > 1 && onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className={`p-1.5 rounded-sm hover:bg-gray-100 ${
                currentPage === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 cursor-pointer'
              }`}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {Array.from({ length: totalPages }, (_, idx) => {
              const pageNum = idx + 1;
              const isActive = pageNum === currentPage;
              return (
                <button
                  key={pageNum}
                  onClick={() => onPageChange(pageNum)}
                  className={`px-3 py-1 rounded transition-colors ${
                    isActive
                      ? 'bg-[#EBF2FA] text-lens-link-blue font-bold'
                      : 'hover:bg-gray-100 text-gray-600 font-semibold cursor-pointer'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}

            <button
              onClick={() => currentPage < totalPages && onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`p-1.5 rounded-sm hover:bg-gray-100 ${
                currentPage === totalPages ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 cursor-pointer'
              }`}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResultsList;
