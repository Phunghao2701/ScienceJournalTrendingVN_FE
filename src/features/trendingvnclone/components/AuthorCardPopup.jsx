import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { X, User, Filter, Search } from 'lucide-react';
import { getAuthorDetailApi } from '../../author/api/author.api';
import { buildFilterUpdateSearchParams } from '../../trendingVN/utils/trendingViewParams';

export const AuthorCardPopup = ({
  authorId,
  authorName,
  isOpen,
  onClose
}) => {
  const navigate = useNavigate();

  // Real author profile lookup — replaces the old mock ORCID-guessing logic.
  const { data: authorDetail, isLoading } = useQuery({
    queryKey: ['trendingvnclone', 'authorDetail', authorId],
    queryFn: async () => {
      const response = await getAuthorDetailApi(authorId);
      return response?.data?.data || null;
    },
    enabled: isOpen && !!authorId,
    staleTime: 1000 * 60 * 10
  });

  if (!isOpen) return null;

  const displayName = authorDetail?.display_name || authorDetail?.name || authorName || 'Unknown author';
  const orcid = authorDetail?.orcid || '';
  const institution = authorDetail?.last_known_institution || authorDetail?.institution || '';

  const handleViewProfile = () => {
    if (!authorId) return;
    onClose();
    navigate(`/authors/${authorId}`);
  };

  // Adds the author filter to the current search without dropping the rest of the query
  const handleFilterSearch = () => {
    if (!authorId) return;
    onClose();
    const currentParams = new URLSearchParams(window.location.search);
    const nextParams = buildFilterUpdateSearchParams(currentParams, { selectedAuthor: authorId }, currentParams.get('view') || 'list');
    navigate(`/trendingvnclone?${nextParams.toString()}`);
  };

  // Starts a brand new search scoped to just this author (drops other filters)
  const handleNewSearch = () => {
    if (!authorId) return;
    onClose();
    const params = new URLSearchParams();
    params.set('author_id', String(authorId));
    params.set('page', '1');
    navigate(`/trendingvnclone?${params.toString()}`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs select-none">
      {/* Modal Dialog Card */}
      <div
        className="relative w-full max-w-[520px] bg-white rounded-lg shadow-2xl border border-gray-200 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-2.5 right-2.5 z-10 text-gray-400 hover:text-gray-700 bg-white/10 hover:bg-gray-100 rounded-full p-1 transition-colors cursor-pointer"
          title="Close Popup"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Main Author Info Section */}
        <div className="p-5 space-y-5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              {/* Avatar Icon */}
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center border border-gray-200 text-gray-400">
                <User className="w-6 h-6" />
              </div>
              <div>
                <h3
                  className={`font-bold text-[18px] ${authorId ? 'text-lens-link-blue hover:underline cursor-pointer' : 'text-gray-800'}`}
                  onClick={handleViewProfile}
                >
                  {displayName}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  {isLoading ? (
                    <span className="text-[11px] text-gray-400">Loading profile…</span>
                  ) : orcid ? (
                    <>
                      <span className="text-[10px] text-gray-500 font-semibold bg-gray-100 px-1.5 py-0.5 rounded">
                        ORCID
                      </span>
                      <span className="text-[11px] text-gray-600 font-mono">{orcid}</span>
                    </>
                  ) : (
                    <span className="text-[11px] text-gray-400 italic">No ORCID on file</span>
                  )}
                </div>
                {institution && (
                  <div className="text-[11px] text-gray-500 mt-0.5">{institution}</div>
                )}
              </div>
            </div>

            <button
              onClick={handleViewProfile}
              disabled={!authorId}
              className="bg-[#0091FF] hover:bg-[#007EE5] disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold text-[12px] px-4 py-1.5 rounded shadow-sm transition-colors cursor-pointer shrink-0"
            >
              View Profile
            </button>
          </div>

          {/* Action Links Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-gray-100 text-[12.5px]">
            <button
              onClick={handleFilterSearch}
              disabled={!authorId}
              className="flex items-center gap-2 text-gray-700 hover:text-lens-link-blue hover:underline text-left cursor-pointer transition-colors p-2 bg-gray-50 hover:bg-blue-50/50 rounded border border-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Filter className="w-4 h-4 text-gray-400 shrink-0" />
              <span>Filter current search by Author</span>
            </button>
            <button
              onClick={handleNewSearch}
              disabled={!authorId}
              className="flex items-center gap-2 text-gray-700 hover:text-lens-link-blue hover:underline text-left cursor-pointer transition-colors p-2 bg-gray-50 hover:bg-blue-50/50 rounded border border-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Search className="w-4 h-4 text-gray-400 shrink-0" />
              <span>New Search for Author</span>
            </button>
          </div>

          {!authorId && (
            <p className="text-[11px] text-gray-400 italic pt-1">
              This author record has no linked author ID yet, so profile and filter actions are unavailable.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthorCardPopup;
