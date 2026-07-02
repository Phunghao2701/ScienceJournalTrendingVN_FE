import { useState } from 'react';
import {
  Filter,
  BarChart2,
  List,
  Info,
  MoreHorizontal,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  Calendar,
  User,
  Building,
  Landmark,
  Newspaper,
  Lock,
  X
} from 'lucide-react';

// Maps a filter category id to the flat filter field it controls. This mirrors
// trendingVN's filter state shape (selectedAuthor, selectedInstitution, ...) so both
// features build the exact same backend params from the exact same field names.
const CATEGORY_FIELD_MAP = {
  author: 'selectedAuthor',
  institution: 'selectedInstitution',
  journal: 'selectedJournal',
  publisher: 'selectedPublisher',
  subjectMatter: 'selectedTopic'
};

const DATE_RANGE_OPTIONS = {
  'Last 12 Months': { start: '2025', end: '2026' },
  'Last 3 Years': { start: '2024', end: '2026' },
  'Last 5 Years': { start: '2022', end: '2026' },
  'Custom Range...': { start: '2016', end: '2026' }
};

export const FilterSidebar = ({
  selectedFilters,
  onFilterToggle,
  activeItems,
  dynamicOptions = {},
  analytics = null,
  onOpenAnalysis = () => {},
  onClearFilters = () => {}
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [activeTab, setActiveTab] = useState('filter');
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  // Accordion expanded states — only categories backed by a real API filter
  const [expandedCategories, setExpandedCategories] = useState({
    dateRange: true,
    author: true,
    institution: false,
    journal: false,
    publisher: false,
    subjectMatter: false,
    openAccess: true
  });

  const toggleCategory = (id) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Only categories that map to a real API filter param (see useScholarSearch/useScholarAnalytics)
  const categories = [
    {
      id: 'dateRange',
      name: 'Date Range',
      icon: Calendar,
      options: Object.keys(DATE_RANGE_OPTIONS)
    },
    {
      id: 'author',
      name: 'Author',
      icon: User,
      options: dynamicOptions.authorOptions && dynamicOptions.authorOptions.length > 0
        ? dynamicOptions.authorOptions
        : []
    },
    {
      id: 'institution',
      name: 'Institution',
      icon: Building,
      options: dynamicOptions.institutionOptions && dynamicOptions.institutionOptions.length > 0
        ? dynamicOptions.institutionOptions
        : []
    },
    {
      id: 'journal',
      name: 'Journal',
      icon: Newspaper,
      options: dynamicOptions.journalOptions && dynamicOptions.journalOptions.length > 0
        ? dynamicOptions.journalOptions
        : []
    },
    {
      id: 'publisher',
      name: 'Publisher',
      icon: Landmark,
      options: dynamicOptions.publisherOptions && dynamicOptions.publisherOptions.length > 0
        ? dynamicOptions.publisherOptions
        : []
    },
    {
      id: 'subjectMatter',
      name: 'Subject Matter',
      icon: List,
      options: dynamicOptions.topicOptions && dynamicOptions.topicOptions.length > 0
        ? dynamicOptions.topicOptions
        : []
    },
    {
      id: 'openAccess',
      name: 'Open Access',
      icon: Lock,
      options: ['Open Access']
    }
  ];

  // Dynamic filter count generator
  const getOptionCount = (categoryId, opt) => {
    const optId = typeof opt === 'object' && opt !== null ? opt.id : opt;
    const optName = typeof opt === 'object' && opt !== null ? opt.name : opt;

    if (analytics) {
      if (categoryId === 'author') {
        const found = analytics.topAuthors?.find((a) => String(a.id) === String(optId));
        return found ? found.count : 0;
      }
      if (categoryId === 'institution') {
        const found = analytics.topInstitutions?.find((i) => String(i.id) === String(optId));
        return found ? found.count : 0;
      }
      if (categoryId === 'journal') {
        const found = analytics.topPublishers?.find(
          (j) => String(j.id) === String(optId) || j.name.toLowerCase() === optName.toLowerCase()
        );
        return found ? found.count : 0;
      }
      if (categoryId === 'publisher') {
        const found = analytics.topPublishers?.find((p) => String(p.id) === String(optId));
        return found ? found.count : 0;
      }
      if (categoryId === 'subjectMatter') {
        const found = analytics.topTopics?.find((t) => String(t.id) === String(optId));
        return found ? found.count : 0;
      }
      if (categoryId === 'openAccess') {
        const found = analytics.accessDistribution?.find((a) => a.key === 'oa' || a.key === 'open');
        return found ? found.count : 0;
      }
    }

    switch (categoryId) {
      case 'dateRange': {
        const range = DATE_RANGE_OPTIONS[optName];
        if (!range) return 0;
        return activeItems.filter((item) => {
          const match = item.date.match(/\d{4}/);
          if (!match) return false;
          const yr = parseInt(match[0], 10);
          return yr >= Number(range.start) && yr <= Number(range.end);
        }).length;
      }

      case 'author':
        return activeItems.filter((item) => item.authors.some((a) => a.name === optName)).length;

      case 'institution':
        return activeItems.filter((item) =>
          item.institutions?.some(
            (inst) => inst.toLowerCase().includes(optName.toLowerCase()) || optName.toLowerCase().includes(inst.toLowerCase())
          )
        ).length;

      case 'journal':
        return activeItems.filter((item) => item.journal?.toLowerCase() === optName.toLowerCase()).length;

      case 'publisher':
        return activeItems.filter((item) => item.publisher?.toLowerCase() === optName.toLowerCase()).length;

      case 'subjectMatter':
        return activeItems.filter((item) =>
          item.fieldsOfStudy?.some(
            (fos) => fos.toLowerCase().includes(optName.toLowerCase()) || optName.toLowerCase().includes(fos.toLowerCase())
          )
        ).length;

      case 'openAccess':
        return activeItems.filter((item) => item.badges.includes('Open Access')).length;

      default:
        return 0;
    }
  };

  const isOptionChecked = (categoryId, opt) => {
    const optId = typeof opt === 'object' && opt !== null ? opt.id : opt;

    if (categoryId === 'dateRange') {
      const range = DATE_RANGE_OPTIONS[opt];
      return (
        !!range &&
        String(selectedFilters.fromYear) === range.start &&
        String(selectedFilters.toYear) === range.end
      );
    }

    if (categoryId === 'openAccess') {
      return selectedFilters.selectedAccess === 'oa';
    }

    const field = CATEGORY_FIELD_MAP[categoryId];
    if (!field) return false;
    return selectedFilters[field] && selectedFilters[field] !== 'all' && String(selectedFilters[field]) === String(optId);
  };

  // Toggle function for narrow rail tabs
  const handleTabClick = (tabId) => {
    if (!isExpanded) {
      setActiveTab(tabId);
      setIsExpanded(true);
    } else if (activeTab === tabId) {
      setIsExpanded(false);
    } else {
      setActiveTab(tabId);
    }
  };

  // Helper component to render filters accordion
  const renderFilterPanel = (isMobile = false) => (
    <div className={`flex flex-col bg-white h-full select-none ${isMobile ? 'w-full' : 'w-[250px]'}`}>
      {/* Category Heading */}
      <div className="border-b border-[#D8E7F4] py-3.5 px-4 flex items-center bg-white justify-between font-sans">
        <h2 className="text-[13px] font-extrabold text-[#4A5568] tracking-wider flex items-center">
          FILTERS
          <Info className="w-3.5 h-3.5 ml-1.5 text-amber-500 stroke-[2.5] cursor-pointer" />
        </h2>
        {isMobile && (
          <button onClick={() => setMobileDrawerOpen(false)} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Accordion Categories list */}
      <div className="flex-grow overflow-y-auto font-sans divide-y divide-gray-100">
        {categories.map((category) => {
          const isExpandedCat = !!expandedCategories[category.id];
          const Icon = category.icon;
          return (
            <div key={category.id} className="border-b border-gray-100">
              {/* Header Toggle */}
              <button
                onClick={() => toggleCategory(category.id)}
                className="w-full flex items-center justify-between py-3.5 px-4 hover:bg-[#F3F7FA]/30 text-left font-sans text-gray-700 transition-colors cursor-pointer"
              >
                <div className="flex items-center space-x-2.5">
                  <Icon className="w-4.5 h-4.5 text-[#6B7280] stroke-[1.8]" />
                  <span className="text-[12.8px] font-semibold text-[#1F2937]">{category.name}</span>
                </div>
                {isExpandedCat ? (
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                )}
              </button>

              {/* Options Content Checklist */}
              {isExpandedCat && (
                <div className="px-6 pb-3 pt-1 space-y-2 animate-in fade-in duration-100 bg-gray-50/20">
                  {category.options.length === 0 && (
                    <p className="text-[12px] text-gray-400 italic py-1">No options available.</p>
                  )}
                  {category.options.map((opt) => {
                    const optId = typeof opt === 'object' && opt !== null ? opt.id : opt;
                    const optLabel = typeof opt === 'object' && opt !== null ? opt.name : opt;
                    const checked = isOptionChecked(category.id, opt);
                    const count = getOptionCount(category.id, opt);
                    const isDynamic = ['author', 'institution', 'journal', 'publisher', 'subjectMatter'].includes(category.id);
                    const isDisabled = !isDynamic && count === 0 && !checked;

                    return (
                      <label
                        key={optId}
                        className={`flex items-start space-x-2 text-[12.8px] text-gray-700 cursor-pointer select-none py-0.5 ${
                          isDisabled ? 'opacity-40 cursor-not-allowed' : ''
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          disabled={isDisabled}
                          onChange={() => onFilterToggle(category.id, optId)}
                          className="mt-0.5 rounded border-gray-300 text-lens-link-blue focus:ring-lens-link-blue w-3.5 h-3.5 cursor-pointer"
                        />
                        <span className="font-semibold text-gray-700">
                          {optLabel}{' '}
                          {count !== null && count !== undefined && (
                            <span className="text-gray-400 font-normal">({count})</span>
                          )}
                        </span>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderAnalyzePanel = () => (
    <div className="flex flex-col bg-white h-full w-[250px]">
      <div className="border-b border-[#D8E7F4] py-3.5 px-4 bg-white font-sans">
        <h2 className="text-[13px] font-extrabold text-[#4A5568] tracking-wider flex items-center">
          ANALYZE
          <BarChart2 className="w-3.5 h-3.5 ml-1.5 text-lens-link-blue" />
        </h2>
      </div>
      <div className="p-4 space-y-4 font-sans text-gray-700">
        <p className="text-[12.8px] leading-relaxed">
          Jump into the full Analysis dashboard for the current search:
        </p>
        <div className="space-y-2">
          <button
            type="button"
            onClick={() => onOpenAnalysis('institutions')}
            className="w-full text-left p-2 border border-gray-150 rounded bg-gray-50 text-[12px] font-semibold text-gray-800 hover:bg-gray-100 cursor-pointer"
          >
            Institution Co-Authorship
          </button>
          <button
            type="button"
            onClick={() => onOpenAnalysis('topics')}
            className="w-full text-left p-2 border border-gray-150 rounded bg-gray-50 text-[12px] font-semibold text-gray-800 hover:bg-gray-100 cursor-pointer"
          >
            Subject Matter Mapping
          </button>
          <button
            type="button"
            onClick={() => onOpenAnalysis('summary')}
            className="w-full text-left p-2 border border-gray-150 rounded bg-gray-50 text-[12px] font-semibold text-gray-800 hover:bg-gray-100 cursor-pointer"
          >
            Open Access Citation Ratio
          </button>
        </div>
      </div>
    </div>
  );

  const renderListPanel = () => (
    <div className="flex flex-col bg-white h-full w-[250px]">
      <div className="border-b border-[#D8E7F4] py-3.5 px-4 bg-white font-sans">
        <h2 className="text-[13px] font-extrabold text-[#4A5568] tracking-wider flex items-center">
          SAVED LISTS
          <List className="w-3.5 h-3.5 ml-1.5 text-lens-link-blue" />
        </h2>
      </div>
      <div className="p-4 space-y-4 font-sans text-gray-700">
        <p className="text-[12.8px] leading-relaxed">
          Manage saved collections and lists:
        </p>
        <div className="p-3 border border-[#D8E7F4] rounded bg-[#EBF2FA]/40">
          <h4 className="font-bold text-[12.8px] text-lens-link-blue truncate">
            Scholar Search Results
          </h4>
          <span className="text-[11px] text-gray-500 font-semibold">
            {activeItems.length} publications saved
          </span>
        </div>
      </div>
    </div>
  );

  const renderInfoPanel = () => (
    <div className="flex flex-col bg-white h-full w-[250px]">
      <div className="border-b border-[#D8E7F4] py-3.5 px-4 bg-white font-sans">
        <h2 className="text-[13px] font-extrabold text-[#4A5568] tracking-wider flex items-center">
          QUERY INFO
          <Info className="w-3.5 h-3.5 ml-1.5 text-lens-link-blue" />
        </h2>
      </div>
      <div className="p-4 space-y-3 font-sans text-gray-700 text-[12.8px]">
        <div>
          <span className="font-bold text-gray-500 block uppercase text-[10px]">Data Source</span>
          <span className="font-semibold text-gray-800">Lens.org Scholar database</span>
        </div>
        <div>
          <span className="font-bold text-gray-500 block uppercase text-[10px]">Active Filters</span>
          {(() => {
            const activeCount =
              Object.values(CATEGORY_FIELD_MAP).filter((field) => selectedFilters[field] && selectedFilters[field] !== 'all').length +
              (selectedFilters.selectedAccess === 'oa' ? 1 : 0) +
              (selectedFilters.fromYear ? 1 : 0);
            return activeCount > 0 ? (
              <button
                type="button"
                onClick={onClearFilters}
                className="font-semibold text-lens-link-blue hover:underline cursor-pointer"
                title="Clear all active filters"
              >
                {activeCount} active options — clear all
              </button>
            ) : (
              <span className="font-semibold text-gray-800">0 active options</span>
            );
          })()}
        </div>
        <div>
          <span className="font-bold text-gray-500 block uppercase text-[10px]">Matched Records</span>
          <span className="font-semibold text-gray-800">{activeItems.length} works</span>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* DESKTOP COLLAPSIBLE SIDEBAR VIEW */}
      <div className="hidden lg:flex shrink-0 select-none h-full border-r border-[#D8E7F4]">
        {/* Left vertical tab icon rail (50px wide) */}
        <aside className="w-[50px] bg-[#F3F7FA] border-r border-[#D8E7F4] flex flex-col items-center py-4 space-y-5">
          {/* Blue Circular Toggle Arrow Button */}
          <button
            onClick={() => setIsExpanded((prev) => !prev)}
            className="w-7 h-7 rounded-full bg-lens-link-blue hover:bg-blue-800 text-white flex items-center justify-center cursor-pointer shadow-xs transition-transform hover:scale-105 active:scale-95"
            aria-label={isExpanded ? 'Collapse sidebar' : 'Expand sidebar'}
          >
            {isExpanded ? (
              <ChevronLeft className="w-4 h-4 stroke-[2.5]" />
            ) : (
              <ChevronRight className="w-4 h-4 stroke-[2.5]" />
            )}
          </button>

          {/* Tab Selection Icons */}
          {[
            { id: 'filter', icon: Filter, title: 'Filters' },
            { id: 'analyze', icon: BarChart2, title: 'Analyze' },
            { id: 'list', icon: List, title: 'Lists' },
            { id: 'info', icon: Info, title: 'Info' }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id && isExpanded;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab.id)}
                title={tab.title}
                className={`relative p-2 rounded transition-colors group cursor-pointer ${
                  isActive ? 'text-lens-link-blue bg-white shadow-xs' : 'text-gray-500 hover:text-gray-800'
                }`}
              >
                {isActive && (
                  <div className="absolute left-0 top-1/4 h-1/2 w-[3px] bg-lens-link-blue rounded-r" />
                )}
                <Icon className="w-5 h-5" />
              </button>
            );
          })}

          <div className="flex-grow" />

          {/* Three dots menu at bottom */}
          <button className="text-gray-400 hover:text-gray-600 cursor-pointer">
            <MoreHorizontal className="w-5 h-5" />
          </button>
        </aside>

        {/* Dynamic Slide-out Content Panel */}
        <div
          className={`flex flex-col bg-white h-full select-none transition-all duration-300 overflow-hidden ${
            isExpanded ? 'w-[250px]' : 'w-0'
          }`}
        >
          {activeTab === 'filter' && renderFilterPanel(false)}
          {activeTab === 'analyze' && renderAnalyzePanel()}
          {activeTab === 'list' && renderListPanel()}
          {activeTab === 'info' && renderInfoPanel()}
        </div>
      </div>

      {/* MOBILE/TABLET DRAWER */}
      <div className="lg:hidden">
        {/* Floating action button */}
        <button
          onClick={() => setMobileDrawerOpen(true)}
          className="fixed bottom-6 left-6 z-40 bg-lens-link-blue hover:bg-blue-800 text-white rounded-full p-4 shadow-xl flex items-center justify-center cursor-pointer transition-transform duration-100 hover:scale-105"
          aria-label="Open Filters"
        >
          <Filter className="w-6 h-6 mr-1" />
          <span className="text-[13px] font-bold pr-1">Filters</span>
        </button>

        {/* Backdrop modal */}
        {mobileDrawerOpen && (
          <div className="fixed inset-0 z-50 flex animate-in fade-in duration-200">
            <div
              className="absolute inset-0 bg-black/40 backdrop-blur-xs"
              onClick={() => setMobileDrawerOpen(false)}
            />
            <div className="relative z-55 w-[290px] h-full max-w-[80vw] bg-white shadow-2xl flex flex-col animate-in slide-in-from-left duration-200">
              {renderFilterPanel(true)}
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default FilterSidebar;
