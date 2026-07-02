import { useState, useEffect } from 'react';
import { Home, Search, ChevronDown, Edit3, HelpCircle } from 'lucide-react';

export const SearchToolbar = ({
  searchTerm,
  setSearchTerm,
  totalWorks,
  statSegments = []
}) => {
  const [queryText, setQueryText] = useState(searchTerm);

  useEffect(() => {
    setQueryText(searchTerm);
  }, [searchTerm]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setSearchTerm(queryText);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      setSearchTerm(queryText);
    }
  };

  const fmt = (n) => new Intl.NumberFormat().format(n || 0);

  return (
    <div className="w-full select-none font-sans">
      {/* 1. Path & Tools row */}
      <div className="bg-gray-50 border-b border-gray-200 px-5 py-2.5 flex flex-col md:flex-row md:items-center md:justify-between space-y-2 md:space-y-0">
        {/* Breadcrumb Path */}
        <div className="flex items-center space-x-2 text-[13px] text-lens-slate-gray">
          <Home className="w-4 h-4 text-gray-500 cursor-pointer hover:text-lens-link-blue" />
          <span className="text-gray-300">/</span>
          <span className="font-bold text-gray-800">{totalWorks.toLocaleString()} Scholarly Works</span>
        </div>

        {/* Action Links */}
        <div className="flex items-center space-x-4 text-[13px] text-lens-link-blue">
          <a href="#" className="flex items-center hover:underline">
            <ChevronDown className="w-3.5 h-3.5 mr-0.5" />
            Hide Query Details
          </a>
          <a href="#" className="flex items-center hover:underline">
            <Edit3 className="w-3.5 h-3.5 mr-0.5" />
            Edit Search
          </a>
          <a href="#" className="hover:underline">
            Search Patents
          </a>
        </div>
      </div>

      {/* 2. Search Edit Input */}
      <form onSubmit={handleSearchSubmit} className="px-5 py-4 border-b border-gray-200 bg-white flex flex-col sm:flex-row items-stretch gap-2">
        <div className="relative flex-grow">
          <input
            type="text"
            placeholder="Explore Science, Technology & Innovation..."
            value={queryText}
            onChange={(e) => setQueryText(e.target.value)}
            onKeyDown={handleKeyPress}
            className="w-full border border-gray-300 rounded-l pl-3 pr-10 py-2 text-[14px] focus:outline-none focus:border-lens-link-blue focus:ring-1 focus:ring-lens-link-blue"
          />
          <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center text-gray-400">
            <HelpCircle className="w-4 h-4 hover:text-lens-link-blue cursor-pointer mr-1.5" />
          </div>
        </div>

        <div className="flex shrink-0">
          <button type="submit" className="bg-lens-link-blue text-white px-5 text-[14px] hover:bg-blue-800 font-semibold rounded-l sm:rounded-none flex items-center justify-center space-x-1.5 cursor-pointer">
            <Search className="w-4 h-4" />
            <span>Search</span>
          </button>
          <button type="button" className="bg-lens-link-blue text-white border-l border-blue-800 px-2.5 hover:bg-blue-800 rounded-r flex items-center justify-center cursor-pointer">
            <ChevronDown className="w-4 h-4" />
          </button>
        </div>
      </form>

      {/* 3. Stat Segment Bar — real Article Records / Open Access / Authors / Topics counts */}
      <div className="bg-white border-b border-[#D8E7F4] px-5 flex flex-wrap select-none">
        {statSegments.map((segment) => (
          <div key={segment.key} className="py-2.5 pr-8 min-w-[130px]">
            <div className="h-[3px] w-9 rounded-full mb-1.5" style={{ backgroundColor: segment.color }} />
            <div className="text-[11.5px] font-semibold text-lens-slate-gray leading-tight mb-0.5">
              {segment.label}
            </div>
            <h2 className="text-[19px] font-bold text-gray-800 leading-none">
              {segment.isLoading ? '...' : fmt(segment.value)}
            </h2>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SearchToolbar;
