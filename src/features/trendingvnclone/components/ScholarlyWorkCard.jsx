import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AuthorCardPopup } from './AuthorCardPopup';
import {
  ChevronDown,
  Unlock,
  FileText,
  Building,
  DollarSign,
  FolderOpen,
  ExternalLink
} from 'lucide-react';

export const ScholarlyWorkCard = ({
  item,
  isSelected,
  onSelectToggle,
  forceExpanded = false,
  visibleFields = { authors: true, journal: true, doi: true },
  returnTo = ''
}) => {
  const [expandedLocal, setExpandedLocal] = useState(false);
  const expanded = forceExpanded || expandedLocal;
  const toggleExpanded = () => setExpandedLocal((prev) => !prev);
  const [popupAuthor, setPopupAuthor] = useState(null);

  // Helper to choose badge colors based on label
  const getBadgeStyle = (label) => {
    switch (label) {
      case 'Open Access':
        return 'bg-green-600 text-white';
      case 'Abstract':
        return 'bg-lens-badge-blue text-white';
      case 'Affiliation':
        return 'bg-lens-badge-orange text-white';
      case 'Funding':
        return 'bg-purple-600 text-white';
      case 'Collection':
        return 'bg-amber-600 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const getBadgeIcon = (label) => {
    switch (label) {
      case 'Open Access':
        return <Unlock className="w-2.5 h-2.5 mr-0.5 inline" />;
      case 'Abstract':
        return <FileText className="w-2.5 h-2.5 mr-0.5 inline" />;
      case 'Affiliation':
        return <Building className="w-2.5 h-2.5 mr-0.5 inline" />;
      case 'Funding':
        return <DollarSign className="w-2.5 h-2.5 mr-0.5 inline" />;
      case 'Collection':
        return <FolderOpen className="w-2.5 h-2.5 mr-0.5 inline" />;
      default:
        return null;
    }
  };

  return (
    <div
      className={`border-b border-[#D8E7F4] flex flex-col font-sans transition-colors relative duration-75 ${
        isSelected ? 'bg-[#EBF2FA]' : 'bg-[#F8FAFD] hover:bg-slate-50'
      }`}
    >
      {/* Absolute Left Row Tools Container (width approx 50px) */}
      <div className="absolute left-4 top-4 flex flex-col items-center space-y-3 z-10 w-6 select-none">
        {/* Row Checkbox */}
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => onSelectToggle(item.id)}
          className="rounded border-gray-300 text-lens-link-blue focus:ring-lens-link-blue cursor-pointer w-4 h-4"
        />

        {/* Expand Trigger Icon Button */}
        <button
          onClick={toggleExpanded}
          className="text-lens-link-blue hover:text-blue-800 transition-transform cursor-pointer"
          title="Toggle Details"
        >
          <div
            className={`w-5 h-5 rounded-full flex items-center justify-center transition-transform duration-100 ${
              expanded ? 'rotate-180 text-blue-800' : ''
            }`}
          >
            <ChevronDown className="w-4 h-4 stroke-[3px]" />
          </div>
        </button>
      </div>

      {/* Main card info area (pl-14 offset to accommodate absolute checkbox column) */}
      <div className="pl-14 pr-4 py-3 select-text">
        {/* Title Link → Cloned article detail page */}
        <Link to={`/trendingvnclone/article/${item.id}${returnTo ? `?returnTo=${encodeURIComponent(returnTo)}` : ''}`}>
          <h1 className="text-[17px] font-semibold text-gray-900 leading-snug hover:text-lens-link-blue cursor-pointer mb-2.5 hover:underline decoration-1 select-text">
            {item.title}
          </h1>
        </Link>

        {/* Metadata Details Horizontal List */}
        <ul className="flex flex-wrap items-center text-[12.8px] text-lens-slate-gray gap-x-4 gap-y-1.5 leading-relaxed select-text">
          {/* 1. Publication Type */}
          <li className="font-bold text-gray-800">{item.type}</li>

          {/* 2. Journal/Source Info */}
          {visibleFields.journal && item.journal && (
            <li className="text-[13px]">
              <span className="text-lens-link-blue hover:underline cursor-pointer font-medium select-text">
                {item.journal}
              </span>
              {(item.volume || item.issue || item.pages) && ', '}
              {item.volume && (
                <span className="select-text">
                  <strong>Volume:</strong> {item.volume}
                </span>
              )}
              {item.issue && (
                <span className="select-text">
                  , <strong>Issue:</strong> {item.issue}
                </span>
              )}
              {item.pages && (
                <span className="select-text">
                  , <strong>Pages:</strong> {item.pages}
                </span>
              )}
              {item.date && (
                <span className="ml-1.5 text-gray-500 font-normal select-text">
                  {item.date}
                </span>
              )}
            </li>
          )}

          {/* 3. Authors */}
          {visibleFields.authors && item.authors.length > 0 && (
            <li className="w-full mt-0.5 select-text">
              <strong>Authors:</strong>{' '}
              {item.authors.map((author, index) => (
                <span key={author.id ?? author.name} className="select-text">
                  <span
                    className="text-lens-link-blue hover:underline cursor-pointer"
                    onClick={() => setPopupAuthor(author)}
                  >
                    {author.name}
                  </span>
                  {index < item.authors.length - 1 ? ', ' : ''}
                </span>
              ))}
            </li>
          )}

          {/* 4. Citing Counts & Citations */}
          <li>
            <strong>Citing Patents:</strong> {item.citingPatents}
          </li>
          <li>
            <strong>Citing Scholarly Works:</strong> {item.citingScholarlyWorks}
          </li>
          <li>
            <strong>Reference Count:</strong>{' '}
            <span className="text-lens-link-blue hover:underline cursor-pointer">
              {item.referenceCount}
            </span>
          </li>

          {/* 5. Lens ID Badge */}
          <li className="inline-flex items-center text-[12px] bg-gray-200/70 border border-gray-300/80 px-1.5 py-0.5 rounded text-gray-800 select-text">
            <span className="font-semibold text-[10px] mr-1 text-gray-500">LENS ID</span>
            <span>{item.lensId}</span>
          </li>

          {/* 6. DOI Link */}
          {visibleFields.doi && item.doi && (
          <li className="inline-flex items-center space-x-2 w-full mt-0.5 select-text">
            <a
              href={item.doiUrl || `https://doi.org/${item.doi}`}
              target="_blank"
              rel="noreferrer"
              className="text-lens-link-blue hover:underline cursor-pointer flex items-center select-text"
            >
              <ExternalLink className="w-3.5 h-3.5 mr-1" />
              {item.doi}
            </a>
            <span className="text-gray-300">|</span>
            <span className="text-lens-link-blue hover:underline cursor-pointer font-medium">
              LibKey
            </span>
            <span className="text-gray-300">|</span>
            <span className="text-lens-link-blue hover:underline cursor-pointer font-medium">
              WorldCat
            </span>
          </li>
          )}

          {/* 7. Action Badges Row */}
          <li className="w-full mt-1.5 flex flex-wrap items-center gap-1.5 select-none">
            <span className="text-[12px] font-bold text-gray-600 mr-1 select-none">
              Additional Info:
            </span>
            {item.badges.map((badge) => (
              <button
                key={badge}
                type="button"
                onClick={() => {
                  if (badge === 'Abstract' || badge === 'Affiliation') {
                    toggleExpanded();
                  }
                }}
                className={`text-[10px] px-2 py-0.5 font-bold rounded flex items-center select-none cursor-pointer transition-all hover:opacity-90 active:scale-95 ${getBadgeStyle(
                  badge
                )}`}
              >
                {getBadgeIcon(badge)}
                {badge}
              </button>
            ))}
          </li>
        </ul>
      </div>

      {/* Expanded drawer sheet */}
      {expanded && (
        <div className="pl-14 pr-5 pb-5 pt-2 border-t border-[#E1E8ED] bg-white text-[13.6px] leading-relaxed animate-in fade-in slide-in-from-top-1 duration-150 select-text">
          {item.abstractText && (
            <div className="mb-4 select-text">
              <h3 className="font-bold text-gray-900 border-b border-gray-100 pb-1 mb-2 flex items-center">
                <FileText className="w-4 h-4 mr-1 text-lens-link-blue" /> Abstract
              </h3>
              <p className="text-gray-700 font-normal leading-relaxed text-justify select-text">
                {item.abstractText}
              </p>
            </div>
          )}

          {item.institutions && item.institutions.length > 0 && (
            <div className="select-text">
              <h3 className="font-bold text-gray-900 border-b border-gray-100 pb-1 mb-2 flex items-center">
                <Building className="w-4 h-4 mr-1 text-lens-link-blue" /> Affiliations
              </h3>
              <ul className="list-disc list-inside space-y-1.5 text-gray-600 select-text">
                {item.institutions.map((inst, index) => (
                  <li key={index} className="text-[13px] leading-tight select-text">
                    <span className="text-gray-700 font-medium select-text">{inst}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {popupAuthor && (
        <AuthorCardPopup
          authorId={popupAuthor.id}
          authorName={popupAuthor.name}
          isOpen={!!popupAuthor}
          onClose={() => setPopupAuthor(null)}
        />
      )}
    </div>
  );
};

export default ScholarlyWorkCard;
