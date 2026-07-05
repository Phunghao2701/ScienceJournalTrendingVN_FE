import { useNavigate } from 'react-router-dom';
import { Home, ChevronLeft, HelpCircle, Search, ChevronDown } from 'lucide-react';

/**
 * Breadcrumb + inline search bar shown above the article detail page.
 *
 * @param {Object}  props
 * @param {string}  props.articleId   - Lens-style ID shown in the breadcrumb
 * @param {string}  [props.issnQuery] - Search query to pre-fill in the search input
 * @param {number}  [props.totalResults] - Result count for the back-link label
 */
export default function ArticleDetailHeader({
  articleId,
  issnQuery = '',
  totalResults = 0,
  backTo = '/trendingvnclone'
}) {
  const navigate = useNavigate();

  return (
    <div className="bg-[#F1F5F9] border-b border-[#D8E7F4] select-none font-sans w-full py-2.5 px-4 flex items-center justify-between overflow-x-auto">
      {/* Left breadcrumb */}
      <div className="flex items-center space-x-2 text-[13px] text-gray-700 shrink-0">
        <button
          onClick={() => navigate(backTo)}
          className="text-[#2B54B2] hover:underline flex items-center space-x-1 cursor-pointer"
          title="Back to search"
        >
          <Home className="w-3.5 h-3.5" />
        </button>
        <ChevronLeft className="w-3.5 h-3.5 text-gray-400" />
        <button
          onClick={() => navigate(backTo)}
          className="text-lens-link-blue hover:text-blue-800 hover:underline font-semibold cursor-pointer"
        >
          {totalResults > 0 ? `${totalResults} Scholarly results` : 'Search results'}
        </button>
        <ChevronLeft className="w-3.5 h-3.5 text-gray-400" />
        <span className="text-gray-800 font-bold tracking-tight truncate max-w-[260px]">{articleId}</span>
      </div>

      {/* Right inline search */}
      <div className="flex items-center space-x-2 shrink-0">
        <div className="flex items-center bg-white border border-gray-300 rounded shadow-xs focus-within:ring-1 focus-within:ring-lens-link-blue focus-within:border-lens-link-blue overflow-hidden w-[280px] sm:w-[350px]">
          <input
            type="text"
            defaultValue={issnQuery}
            placeholder="Explore Science, Technology & Innovation..."
            readOnly
            className="flex-grow px-3 py-1.5 text-[13px] text-gray-800 focus:outline-none bg-white"
          />
          <HelpCircle className="w-4 h-4 text-gray-400 mr-2 shrink-0 cursor-pointer hover:text-gray-600" />
        </div>
        <div className="flex items-center shadow-xs">
          <button
            onClick={() => navigate(backTo)}
            className="bg-lens-link-blue hover:bg-blue-800 text-white text-[12.8px] font-bold px-4 py-1.5 rounded-l flex items-center space-x-1 cursor-pointer"
          >
            <Search className="w-3.5 h-3.5" />
            <span>Search</span>
          </button>
          <button className="bg-[#1C3E8A] hover:bg-blue-900 text-white px-2 py-2 rounded-r flex items-center justify-center cursor-pointer border-l border-blue-800">
            <ChevronDown className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
