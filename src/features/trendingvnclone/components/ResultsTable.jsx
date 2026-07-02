import { Link } from 'react-router-dom';
import { ArrowUp, ArrowDown } from 'lucide-react';

const SortIcon = ({ field, sortBy, sortOrder }) => {
  if (sortBy !== field) return null;
  return sortOrder === 'asc' ? <ArrowUp className="w-3 h-3 inline ml-0.5" /> : <ArrowDown className="w-3 h-3 inline ml-0.5" />;
};

export const ResultsTable = ({
  items = [],
  isLoading = false,
  sortBy,
  sortOrder,
  onSortChange,
  returnTo = ''
}) => {
  const toggleSort = (field) => {
    if (sortBy === field) {
      onSortChange(field, sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      onSortChange(field, 'desc');
    }
  };

  return (
    <div className="flex-grow overflow-x-auto bg-white">
      <table className="w-full text-[12.8px] text-gray-700">
        <thead>
          <tr className="border-b border-[#D8E7F4] bg-gray-50/60 text-left text-[11px] font-bold text-gray-500 uppercase select-none">
            <th className="py-2.5 px-4">Title</th>
            <th className="py-2.5 px-4">Authors</th>
            <th className="py-2.5 px-4">Journal</th>
            <th
              className="py-2.5 px-4 cursor-pointer hover:text-gray-800"
              onClick={() => toggleSort('publication_date')}
            >
              Year <SortIcon field="publication_date" sortBy={sortBy} sortOrder={sortOrder} />
            </th>
            <th
              className="py-2.5 px-4 text-right cursor-pointer hover:text-gray-800"
              onClick={() => toggleSort('citation_count')}
            >
              Citations <SortIcon field="citation_count" sortBy={sortBy} sortOrder={sortOrder} />
            </th>
            <th className="py-2.5 px-4">DOI</th>
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            Array.from({ length: 8 }).map((_, idx) => (
              <tr key={idx} className="border-b border-gray-100 animate-pulse">
                <td className="py-3 px-4" colSpan={6}>
                  <div className="h-3 bg-gray-200 rounded w-2/3" />
                </td>
              </tr>
            ))
          ) : items.length === 0 ? (
            <tr>
              <td colSpan={6} className="py-10 text-center text-[13px] text-gray-500 bg-gray-50/50">
                No scholarly works matching your search queries and sidebar filter selections.
              </td>
            </tr>
          ) : (
            items.map((item) => (
              <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50/60">
                <td className="py-2.5 px-4 max-w-[320px] align-top">
                  <Link
                    to={`/trendingvnclone/article/${item.id}${returnTo ? `?returnTo=${encodeURIComponent(returnTo)}` : ''}`}
                    className="text-lens-link-blue hover:underline font-medium line-clamp-2"
                  >
                    {item.title}
                  </Link>
                </td>
                <td className="py-2.5 px-4 max-w-[220px] truncate align-top" title={item.authors.map((a) => a.name).join(', ')}>
                  {item.authors.map((a) => a.name).join(', ') || '—'}
                </td>
                <td className="py-2.5 px-4 max-w-[200px] truncate align-top">{item.journal || '—'}</td>
                <td className="py-2.5 px-4 align-top">{item.date || '—'}</td>
                <td className="py-2.5 px-4 text-right font-semibold text-gray-900 align-top">{item.citingScholarlyWorks}</td>
                <td className="py-2.5 px-4 font-mono text-[11.5px] text-gray-500 max-w-[160px] truncate align-top">
                  {item.doi || '—'}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ResultsTable;
