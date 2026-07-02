import { useState } from 'react';
import { FileText, Users, Building, Tag, ExternalLink, Bookmark, Hash } from 'lucide-react';
import AuthorCardPopup from './AuthorCardPopup';

/**
 * Summary tab panel shown on the article detail page.
 * Displays abstract, authors, institutions, fields/keywords, and identifiers.
 *
 * @param {Object} props
 * @param {Object} props.item - Normalised card-item from mapArticleToCardItem
 */
export default function ArticleSummaryTab({ item }) {
  const [popupAuthor, setPopupAuthor] = useState(null);

  // Support multi-paragraph abstracts separated by double newline
  const abstractParagraphs = item.abstractText ? item.abstractText.split('\n\n') : [];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full font-sans py-4 select-text">
      {/* COL 1 — Abstract (5 cols) */}
      <div className="lg:col-span-5 space-y-5 select-text">
        <div className="bg-white border border-[#D8E7F4] rounded shadow-xs p-5 select-text">
          <h3 className="font-bold text-gray-900 border-b border-gray-100 pb-2 mb-3 flex items-center text-[14.5px]">
            <FileText className="w-4 h-4 mr-2 text-lens-link-blue" />
            <span>Abstract</span>
          </h3>
          <div className="space-y-4 text-[13.6px] leading-relaxed text-gray-700 text-justify select-text">
            {abstractParagraphs.map((para, index) => (
              <p key={index} className="select-text">{para}</p>
            ))}
            {abstractParagraphs.length === 0 && (
              <p className="text-gray-400 italic select-none">No abstract text is available for this work.</p>
            )}
          </div>
        </div>
      </div>

      {/* COL 2 — Authors / Institutions / Keywords / Identifiers (4 cols) */}
      <div className="lg:col-span-4 space-y-4 select-text">
        {/* Authors */}
        <div className="bg-white border border-[#D8E7F4] rounded shadow-xs p-5 select-text">
          <h3 className="font-bold text-gray-900 border-b border-gray-100 pb-2 mb-3 flex items-center text-[14.5px]">
            <Users className="w-4 h-4 mr-2 text-lens-link-blue" />
            <span>Authors</span>
          </h3>
          <ul className="space-y-1 text-[13.2px] select-text">
            {item.authors.map((author, idx) => (
              <li
                key={author.id ?? idx}
                className="text-lens-link-blue hover:underline cursor-pointer select-text"
                onClick={() => setPopupAuthor(author)}
              >
                {author.name}
                {idx === 0 && item.institutions && item.institutions.length > 0 && (
                  <sup className="text-[10px] ml-0.5 text-gray-500 font-bold select-none">1</sup>
                )}
              </li>
            ))}
            {item.authors.length === 0 && (
              <li className="text-gray-400 italic select-none">No authors listed.</li>
            )}
          </ul>
        </div>

        {/* Institutions */}
        {item.institutions && item.institutions.length > 0 && (
          <div className="bg-white border border-[#D8E7F4] rounded shadow-xs p-5 select-text">
            <h3 className="font-bold text-gray-900 border-b border-gray-100 pb-2 mb-3 flex items-center text-[14.5px]">
              <Building className="w-4 h-4 mr-2 text-lens-link-blue" />
              <span>Institutions</span>
            </h3>
            <ol className="list-decimal list-inside space-y-1.5 text-[13px] text-gray-700 select-text">
              {item.institutions.map((inst, index) => (
                <li key={index} className="select-text">
                  <span className="font-semibold select-text">{inst}</span>
                </li>
              ))}
            </ol>
          </div>
        )}

        {/* Fields of Study & Keywords */}
        {((item.fieldsOfStudy && item.fieldsOfStudy.length > 0) ||
          (item.keywords && item.keywords.length > 0)) && (
          <div className="bg-white border border-[#D8E7F4] rounded shadow-xs p-5 select-text">
            {item.fieldsOfStudy && item.fieldsOfStudy.length > 0 && (
              <div className="mb-4 select-text">
                <h4 className="font-bold text-gray-900 mb-2 text-[13px] flex items-center">
                  <Bookmark className="w-3.5 h-3.5 mr-1.5 text-lens-link-blue" />
                  <span>Field of Study</span>
                </h4>
                <div className="flex flex-wrap gap-1.5 select-text">
                  {item.fieldsOfStudy.map((field) => (
                    <span
                      key={field}
                      className="bg-blue-50 text-lens-link-blue border border-blue-150 px-2 py-0.5 rounded-sm text-[11px] font-semibold select-text"
                    >
                      {field}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {item.keywords && item.keywords.length > 0 && (
              <div className="select-text">
                <h4 className="font-bold text-gray-900 mb-2 text-[13px] flex items-center">
                  <Tag className="w-3.5 h-3.5 mr-1.5 text-lens-link-blue" />
                  <span>Keywords</span>
                </h4>
                <div className="flex flex-wrap gap-1.5 select-text">
                  {item.keywords.map((kw) => (
                    <span
                      key={kw}
                      className="bg-slate-100 text-slate-700 border border-slate-200 px-2 py-0.5 rounded-sm text-[11px] font-semibold select-text"
                    >
                      {kw}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Identifiers */}
        <div className="bg-white border border-[#D8E7F4] rounded shadow-xs p-5 select-text">
          <h3 className="font-bold text-gray-900 border-b border-gray-100 pb-2 mb-3 flex items-center text-[14.5px]">
            <Hash className="w-4 h-4 mr-2 text-lens-link-blue" />
            <span>Identifiers</span>
          </h3>
          <div className="space-y-3 text-[12.8px] text-gray-700 select-text">
            <div className="flex items-center justify-between select-text">
              <span className="font-bold text-gray-500 text-[11px]">LENS ID</span>
              <span className="font-mono text-gray-900 select-text">{item.lensId}</span>
            </div>
            {item.doi && (
              <div className="flex items-center justify-between select-text">
                <span className="font-bold text-gray-500 text-[11px]">DOI</span>
                <a
                  href={`https://doi.org/${item.doi}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-lens-link-blue hover:underline font-medium select-text"
                >
                  {item.doi}
                </a>
              </div>
            )}
            {item.linksToOtherSources && item.linksToOtherSources.length > 0 && (
              <div className="pt-2 border-t border-gray-100 select-text">
                <h4 className="font-bold text-gray-900 mb-1.5 text-[12px] flex items-center">
                  <ExternalLink className="w-3.5 h-3.5 mr-1.5 text-lens-link-blue" />
                  <span>Links to other sources</span>
                </h4>
                <ul className="space-y-1">
                  {item.linksToOtherSources.map((linkUrl) => (
                    <li key={linkUrl} className="select-text">
                      <a
                        href={`https://${linkUrl}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-lens-link-blue hover:underline select-text"
                      >
                        {linkUrl}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* COL 3 — Right sidebar publication info (3 cols) */}
      <div className="lg:col-span-3 select-text">
        <div className="bg-[#F8FAFD] border border-[#D8E7F4] rounded shadow-xs p-4 space-y-4 text-[13px] leading-relaxed text-gray-700 select-text">
          {item.journal && (
            <div className="select-text">
              <h4 className="font-bold text-gray-800 text-[11.5px] uppercase tracking-wider mb-1">
                Publication Location
              </h4>
              <p className="font-medium text-gray-900 select-text">
                In: <span className="text-lens-link-blue hover:underline cursor-pointer select-text">{item.journal}</span>
                {item.issue && `, Issue: ${item.issue}`}
                {item.volume && `, Volume: ${item.volume}`}
                {item.pages && `, Page: ${item.pages}`}
              </p>
            </div>
          )}

          <div className="select-text">
            <h4 className="font-bold text-gray-800 text-[11.5px] uppercase tracking-wider mb-1">
              Dates
            </h4>
            <p className="select-text"><strong>Published:</strong> {item.date}</p>
            <p className="select-text"><strong>E-Published:</strong> {item.date}</p>
          </div>

          <div className="select-text">
            <h4 className="font-bold text-gray-800 text-[11.5px] uppercase tracking-wider mb-1">
              Publication Info
            </h4>
            <p className="select-text">{item.type || 'Journal Article'}</p>
          </div>

          {item.publisher && (
            <div className="select-text">
              <h4 className="font-bold text-gray-800 text-[11.5px] uppercase tracking-wider mb-1">
                Publisher
              </h4>
              <p className="text-gray-900 font-semibold select-text">{item.publisher}</p>
            </div>
          )}

          {item.issn && (
            <div className="select-text">
              <h4 className="font-bold text-gray-800 text-[11.5px] uppercase tracking-wider mb-1">
                Source ISSN
              </h4>
              <p className="font-mono text-gray-900 select-text">{item.issn}</p>
            </div>
          )}
        </div>
      </div>

      {/* Author popup */}
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
}
