import { useState, useCallback } from 'react';
import { useParams, useNavigate, useSearchParams, Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ArticleDetailHeader from '../components/ArticleDetailHeader';
import ArticleSummaryTab from '../components/ArticleSummaryTab';
import AuthorCardPopup from '../components/AuthorCardPopup';
import { useScholarArticleDetail } from '../hooks/useScholarArticleDetail';
import { useAuthStore } from '../../../app/store/authStore';
import { toast } from '../../../shared/utils/toast';
import { toScientificPlainText } from '../../../shared/utils/scientificMath';
import {
  Share2,
  FileText,
  Tags,
  Download,
  BookOpen,
  Bookmark,
  BookmarkCheck,
  X,
  Copy,
  Sparkles
} from 'lucide-react';

// Compact row used for Citing Works / References / Recommended tabs — a lighter
// version of ScholarlyWorkCard since these lists don't need selection/expansion.
function RelatedArticleRow({ article }) {
  return (
    <li className="py-3 border-b border-gray-100 last:border-b-0 select-text">
      <Link
        to={`/trendingvnclone/article/${article.id}`}
        className="text-lens-link-blue hover:underline font-semibold text-[13.6px] select-text"
      >
        {article.title}
      </Link>
      <div className="text-[12px] text-lens-slate-gray mt-1 select-text">
        {article.authors.map((a) => a.name).join(', ') || 'Not listed'}
        {article.journal && <span> — {article.journal}</span>}
        {article.date && <span> ({article.date})</span>}
      </div>
      <div className="text-[11.5px] text-gray-400 mt-0.5 select-text">
        Citations: {article.citingScholarlyWorks}
      </div>
    </li>
  );
}

function RelatedArticleList({ items, isLoading, emptyLabel }) {
  if (isLoading) {
    return (
      <div className="space-y-3 animate-pulse">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-4 bg-gray-200 rounded w-3/4" />
        ))}
      </div>
    );
  }
  if (!items || items.length === 0) {
    return <p className="text-[13.6px] text-gray-400 italic select-none">{emptyLabel}</p>;
  }
  return (
    <ul className="divide-y divide-gray-100">
      {items.map((item) => (
        <RelatedArticleRow key={item.id} article={item} />
      ))}
    </ul>
  );
}

export default function ArticleDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const user = useAuthStore((state) => state.user);

  const {
    article,
    isLoading,
    error,
    refetch,
    isBookmarked,
    isBookmarking,
    handleBookmarkToggle,
    citingWorks,
    citingWorksTotal,
    isCitingWorksLoading,
    references,
    referencesTotal,
    isReferencesLoading,
    recommendedArticles,
    isRecommendedLoading
  } = useScholarArticleDetail(id, user);

  const [activeTab, setActiveTab] = useState('summary');
  const [popupAuthor, setPopupAuthor] = useState(null);
  const [showCitationModal, setShowCitationModal] = useState(false);

  const returnTo = searchParams.get('returnTo');

  const handleBack = () => {
    navigate(returnTo || '/trendingvnclone');
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success('Đã sao chép liên kết bài báo.');
    } catch (err) {
      console.warn('Unable to copy article link:', err);
      toast.error('Không thể sao chép liên kết.');
    }
  };

  const handleBookmarkClick = async () => {
    if (!user) {
      toast.info('Vui lòng đăng nhập để lưu bài báo vào bộ sưu tập.');
      return;
    }
    const ok = await handleBookmarkToggle();
    if (ok) {
      toast.success(isBookmarked ? 'Đã bỏ lưu bài báo.' : 'Đã lưu bài báo vào bộ sưu tập.');
    }
  };

  const generateBibTeX = useCallback(() => {
    if (!article) return '';
    const title = toScientificPlainText(article.title);
    const authorList = article.authors.map((a) => a.name).join(' and ') || 'Unknown';
    return `@article{article_${article.id},
  title={${title}},
  author={${authorList}},
  journal={${article.journal || 'Unknown Journal'}},
  year={${article.date || 'n.d.'}},
  doi={${article.doi || ''}}
}`;
  }, [article]);

  const generateRIS = useCallback(() => {
    if (!article) return '';
    const title = toScientificPlainText(article.title);
    const authorLines = article.authors.map((a) => `AU  - ${a.name}`).join('\n') || 'AU  - Unknown';
    return `TY  - JOUR
T1  - ${title}
${authorLines}
JO  - ${article.journal || 'Unknown Journal'}
PY  - ${article.date || 'n.d.'}
DO  - ${article.doi || ''}
ER  - `;
  }, [article]);

  const handleCopyCitation = async (text, label) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`Đã sao chép trích dẫn ${label}.`);
    } catch (err) {
      console.warn('Unable to copy citation:', err);
      toast.error('Không thể sao chép trích dẫn.');
    }
  };

  const handleDownloadCitation = (content, filename, contentType) => {
    try {
      const blob = new Blob([content], { type: contentType });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.warn('Unable to download citation:', err);
      toast.error('Không thể tải trích dẫn.');
    }
  };

  // ── Loading state ──────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F8FAFD] flex flex-col font-sans antialiased">
        <Header />
        <div className="flex-grow flex items-center justify-center">
          <div className="space-y-6 w-full max-w-4xl p-8 animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-3/4" />
            <div className="h-4 bg-gray-200 rounded w-1/2" />
            <div className="h-4 bg-gray-200 rounded w-1/3" />
            <div className="grid grid-cols-3 gap-4 mt-8">
              <div className="col-span-2 space-y-3">
                <div className="h-4 bg-gray-200 rounded" />
                <div className="h-4 bg-gray-200 rounded" />
                <div className="h-4 bg-gray-200 rounded w-5/6" />
                <div className="h-4 bg-gray-200 rounded w-4/6" />
              </div>
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 rounded" />
                <div className="h-4 bg-gray-200 rounded" />
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // ── Error state ────────────────────────────────────────────────────────────
  if (error || !article) {
    return (
      <div className="min-h-screen bg-[#F8FAFD] flex flex-col font-sans antialiased">
        <Header />
        <div className="flex-grow flex flex-col items-center justify-center gap-4 p-8">
          <p className="text-red-500 font-semibold text-[15px] text-center">
            {error || 'Không tìm thấy bài báo này.'}
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => refetch()}
              className="px-4 py-2 bg-lens-link-blue text-white rounded font-medium hover:bg-blue-800 cursor-pointer"
            >
              Thử lại
            </button>
            <button
              onClick={handleBack}
              className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded font-medium hover:bg-gray-50 cursor-pointer"
            >
              Quay lại kết quả
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // ── Success state ──────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#F8FAFD] flex flex-col font-sans select-none antialiased">
      {/* 1. Global header */}
      <Header />

      {/* 2. Breadcrumb + inline search bar */}
      <ArticleDetailHeader articleId={article.lensId} backTo={returnTo || '/trendingvnclone'} />

      {/* 3. Main content */}
      <main className="flex-grow w-full max-w-[1440px] mx-auto p-4 sm:p-6 space-y-6 select-text">

        {/* Top panel — Title, journal info, metrics, badges */}
        <div className="bg-white border border-[#D8E7F4] rounded shadow-xs p-5 flex flex-col md:flex-row md:items-start md:justify-between gap-4 select-text">
          <div className="space-y-3 flex-grow min-w-0 select-text">

            {/* Title */}
            <h1 className="text-[22px] font-bold text-gray-900 leading-snug tracking-tight hover:text-lens-link-blue cursor-pointer select-text">
              {article.title}
            </h1>

            {/* Subtitle metadata */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[13px] text-lens-slate-gray select-text">
              <span className="font-bold text-gray-800">{article.type || 'Journal Article'}</span>
              {article.journal && (
                <span className="select-text">
                  <span className="text-lens-link-blue font-semibold hover:underline cursor-pointer select-text">
                    {article.journal}
                  </span>
                  {(article.volume || article.issue || article.pages) && ', '}
                  {article.volume && <span>Volume: {article.volume}</span>}
                  {article.issue && <span>, Issue: {article.issue}</span>}
                  {article.pages && <span>, Pages: {article.pages}</span>}
                </span>
              )}
              {article.date && <span className="text-gray-500">{article.date}</span>}
            </div>

            {/* Authors */}
            <div className="text-[13px] text-gray-700 select-text">
              <span className="font-bold text-gray-500 mr-1 select-none">Authors:</span>
              {article.authors.map((author, index) => (
                <span key={author.id ?? author.name} className="select-text">
                  <span
                    className="text-lens-link-blue hover:underline cursor-pointer"
                    onClick={() => setPopupAuthor(author)}
                  >
                    {author.name}
                  </span>
                  {index === 0 && article.institutions && article.institutions.length > 0 && (
                    <sup className="text-[9px] font-extrabold text-gray-400 select-none">1</sup>
                  )}
                  {index < article.authors.length - 1 ? ', ' : ''}
                </span>
              ))}
              {article.authors.length === 0 && (
                <span className="text-gray-400 italic">Not listed</span>
              )}
            </div>

            {/* Metrics */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[13px] text-gray-600 font-semibold select-text">
              <span>Citing Patents: <strong className="text-gray-900">{article.citingPatents}</strong></span>
              <span>Citing Scholarly Works: <strong className="text-gray-900">{article.citingScholarlyWorks}</strong></span>
              <span>
                Reference Count:{' '}
                <span className="text-lens-link-blue hover:underline cursor-pointer font-bold select-text">
                  {article.referenceCount}
                </span>
              </span>
            </div>

            {/* Badges */}
            {article.badges && article.badges.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1.5 select-none">
                <span className="text-[12px] font-bold text-gray-500 mr-1 flex items-center select-none">
                  Additional Info:
                </span>
                {article.badges.map((badge) => (
                  <span
                    key={badge}
                    className="bg-gray-100 text-gray-700 border border-gray-200 font-bold px-2 py-0.5 rounded text-[10px] select-none"
                  >
                    {badge}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Right — Lens ID + registry buttons */}
          <div className="flex flex-col gap-2 shrink-0 md:w-48 bg-gray-50/50 p-3 rounded border border-gray-200 select-none">
            <div className="text-[11.5px] font-bold text-gray-500 uppercase tracking-wide">
              Scholarly Registry
            </div>
            <div className="flex items-center text-[12.8px] font-semibold text-gray-800 bg-white border border-gray-300 rounded px-2.5 py-1.5 hover:bg-gray-50 cursor-pointer shadow-xs">
              <span className="font-mono flex-grow tracking-tight truncate">{article.lensId}</span>
            </div>
            <button
              onClick={handleBookmarkClick}
              disabled={isBookmarking}
              className="flex items-center justify-center gap-1.5 bg-white hover:bg-gray-50 border border-gray-300 text-lens-link-blue text-[12px] font-semibold py-1.5 rounded cursor-pointer disabled:opacity-50"
            >
              {isBookmarked ? <BookmarkCheck className="w-3.5 h-3.5" /> : <Bookmark className="w-3.5 h-3.5" />}
              {isBookmarked ? 'Saved' : 'Save Article'}
            </button>
            <div className="flex items-center space-x-1.5 justify-between">
              <button className="flex-grow bg-white hover:bg-gray-50 border border-gray-300 text-lens-link-blue text-[12px] font-semibold py-1 rounded cursor-pointer text-center">
                LibKey
              </button>
              <button className="flex-grow bg-white hover:bg-gray-50 border border-gray-300 text-lens-link-blue text-[12px] font-semibold py-1 rounded cursor-pointer text-center">
                WorldCat
              </button>
            </div>
          </div>
        </div>

        {/* Tabs area */}
        <div className="space-y-0 select-text">
          {/* Tab navigation header */}
          <div className="border-b border-[#D8E7F4] flex flex-wrap items-center justify-between bg-white px-4 rounded-t select-none shadow-xs">
            <div className="flex space-x-1 pt-2">
              {[
                { key: 'summary', label: 'Summary' },
                { key: 'citing', label: `${citingWorksTotal ?? citingWorks.length} Citing Works` },
                { key: 'references', label: `${referencesTotal ?? article.referenceCount} References` },
                { key: 'recommended', label: 'Recommended' },
                { key: 'collections', label: 'Collections' },
                { key: 'notes', label: 'Notes' }
              ].map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setActiveTab(key)}
                  className={`px-4 py-2.5 text-[13.6px] font-bold border-t-2 border-x transition-colors cursor-pointer ${
                    activeTab === key
                      ? 'border-t-lens-link-blue border-x-[#D8E7F4] bg-[#F8FAFD] text-lens-link-blue'
                      : 'border-t-transparent border-x-transparent text-gray-500 hover:text-gray-800'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Tab action toolbar */}
          <div className="border-b border-[#D8E7F4] bg-white py-2 px-4 flex flex-wrap items-center gap-4 text-[12.8px] text-lens-slate-gray select-none shadow-xs">
            <button onClick={handleShare} className="hover:text-gray-950 flex items-center space-x-1 cursor-pointer">
              <Share2 className="w-3.5 h-3.5" />
              <span>Share Article</span>
            </button>
            <button
              onClick={handleBookmarkClick}
              disabled={isBookmarking}
              className="hover:text-gray-950 flex items-center space-x-1 cursor-pointer disabled:opacity-50"
            >
              {isBookmarked ? <BookmarkCheck className="w-3.5 h-3.5" /> : <Bookmark className="w-3.5 h-3.5" />}
              <span>{isBookmarked ? 'Saved to Collection' : 'Add to Collection'}</span>
            </button>
            <button className="hover:text-gray-950 flex items-center space-x-1 cursor-pointer">
              <FileText className="w-3.5 h-3.5" />
              <span>Make Note</span>
            </button>
            <button className="hover:text-gray-950 flex items-center space-x-1 cursor-pointer">
              <Tags className="w-3.5 h-3.5" />
              <span>Tags</span>
            </button>
            <button
              onClick={() => setShowCitationModal(true)}
              className="hover:text-gray-950 flex items-center space-x-1 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Citation</span>
            </button>
          </div>

          {/* Tab panel content */}
          <div className="w-full select-text min-h-[300px]">
            {activeTab === 'summary' && <ArticleSummaryTab item={article} />}

            {activeTab === 'citing' && (
              <div className="bg-white border border-[#D8E7F4] rounded shadow-xs p-5 select-text leading-relaxed text-gray-700">
                <h3 className="font-bold text-gray-900 border-b border-gray-100 pb-2 mb-3 flex items-center text-[14.5px]">
                  <Sparkles className="w-4 h-4 mr-2 text-lens-link-blue" />
                  <span>Citing Works ({citingWorksTotal ?? citingWorks.length})</span>
                </h3>
                <RelatedArticleList
                  items={citingWorks}
                  isLoading={isCitingWorksLoading}
                  emptyLabel="No scholarly works citing this article were found."
                />
              </div>
            )}

            {activeTab === 'references' && (
              <div className="bg-white border border-[#D8E7F4] rounded shadow-xs p-5 select-text leading-relaxed text-gray-700">
                <h3 className="font-bold text-gray-900 border-b border-gray-100 pb-2 mb-3 flex items-center text-[14.5px]">
                  <BookOpen className="w-4 h-4 mr-2 text-lens-link-blue" />
                  <span>References ({referencesTotal ?? article.referenceCount})</span>
                </h3>
                <RelatedArticleList
                  items={references}
                  isLoading={isReferencesLoading}
                  emptyLabel="No reference records are available for this article yet."
                />
              </div>
            )}

            {activeTab === 'recommended' && (
              <div className="bg-white border border-[#D8E7F4] rounded shadow-xs p-5 select-text leading-relaxed text-gray-700">
                <h3 className="font-bold text-gray-900 border-b border-gray-100 pb-2 mb-3 text-[14.5px]">
                  Recommended Publications
                </h3>
                <RelatedArticleList
                  items={recommendedArticles}
                  isLoading={isRecommendedLoading}
                  emptyLabel="No related publications found for this article's topic."
                />
              </div>
            )}

            {activeTab === 'collections' && (
              <div className="bg-white border border-[#D8E7F4] rounded shadow-xs p-5 select-text leading-relaxed text-gray-700">
                <h3 className="font-bold text-gray-900 border-b border-gray-100 pb-2 mb-3 text-[14.5px]">
                  Collections containing this article
                </h3>
                <p className="text-[13.6px] text-gray-500 italic select-none">
                  This work is not saved in any collections currently.
                </p>
              </div>
            )}

            {activeTab === 'notes' && (
              <div className="bg-white border border-[#D8E7F4] rounded shadow-xs p-5 select-text leading-relaxed text-gray-700">
                <h3 className="font-bold text-gray-900 border-b border-gray-100 pb-2 mb-3 text-[14.5px]">
                  Personal Notes
                </h3>
                <p className="text-[13.6px] text-gray-500 italic select-none">
                  Write personal annotations for this scholarly work to recall key insights.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Author popup */}
      {popupAuthor && (
        <AuthorCardPopup
          authorId={popupAuthor.id}
          authorName={popupAuthor.name}
          isOpen={!!popupAuthor}
          onClose={() => setPopupAuthor(null)}
        />
      )}

      {/* Citation export modal */}
      {showCitationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs select-none">
          <div
            className="relative w-full max-w-[560px] bg-white rounded-lg shadow-2xl border border-gray-200 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100">
              <h3 className="font-bold text-[15px] text-gray-900">Export Citation</h3>
              <button
                onClick={() => setShowCitationModal(false)}
                className="text-gray-400 hover:text-gray-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-5">
              {[
                { label: 'BibTeX Format', generate: generateBibTeX, filename: `citation-${article.id}.bib`, contentType: 'application/x-bibtex' },
                { label: 'RIS Format (EndNote / RefWorks)', generate: generateRIS, filename: `citation-${article.id}.ris`, contentType: 'application/x-research-info-systems' }
              ].map(({ label, generate, filename, contentType }) => (
                <div key={label}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wide">{label}</span>
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleCopyCitation(generate(), label)}
                        className="text-[11.5px] text-lens-link-blue font-semibold hover:underline cursor-pointer flex items-center gap-1"
                      >
                        <Copy className="w-3 h-3" /> Copy
                      </button>
                      <button
                        onClick={() => handleDownloadCitation(generate(), filename, contentType)}
                        className="text-[11.5px] text-lens-link-blue font-semibold hover:underline cursor-pointer flex items-center gap-1"
                      >
                        <Download className="w-3 h-3" /> Download
                      </button>
                    </div>
                  </div>
                  <textarea
                    readOnly
                    value={generate()}
                    rows={5}
                    className="w-full font-mono text-[11.5px] bg-gray-50 border border-gray-200 rounded p-2.5 resize-none"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 4. Footer */}
      <Footer />
    </div>
  );
}
