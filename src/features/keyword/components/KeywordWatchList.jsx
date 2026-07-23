import { useState } from 'react';
import KeywordChip from './KeywordChip';
import KeywordRelatedArticleList from './KeywordRelatedArticleList';
import { useProjectText } from '../../project/i18n/useProjectText';

const KeywordWatchList = ({ watchedKeywords, articles, loading, onManageClick }) => {
  const [selectedKeyword, setSelectedKeyword] = useState(null);
  const [keywordArticlePage, setKeywordArticlePage] = useState(1);
  const p = useProjectText();

  const getKeywordLabel = (keyword) => (
    typeof keyword === 'string'
      ? keyword
      : keyword.display_name || keyword.keyword || keyword.name
  );

  const getArticlesByKeyword = (keywordLabel) => {
    const normalizedLabel = keywordLabel?.trim().toLocaleLowerCase();
    return (Array.isArray(articles) ? articles : []).filter((article) => {
      const matchedKeywords = article.matched_keywords
        || (article.matched_keyword ? [article.matched_keyword] : []);
      return matchedKeywords.some(
        (matchedKeyword) => matchedKeyword?.trim().toLocaleLowerCase() === normalizedLabel,
      );
    });
  };

  const keywordLabels = Array.isArray(watchedKeywords)
    ? watchedKeywords.map(getKeywordLabel).filter(Boolean)
    : [];
  const activeKeyword = keywordLabels.includes(selectedKeyword)
    ? selectedKeyword
    : keywordLabels[0];
  const activeKeywordArticles = activeKeyword
    ? getArticlesByKeyword(activeKeyword)
    : [];
  const keywordArticlePageSize = 20;
  const keywordArticleTotalPages = Math.max(
    1,
    Math.ceil(activeKeywordArticles.length / keywordArticlePageSize),
  );
  const visibleKeywordArticles = activeKeywordArticles.slice(
    (keywordArticlePage - 1) * keywordArticlePageSize,
    keywordArticlePage * keywordArticlePageSize,
  );

  return (
    <div className="glass-card p-4 rounded-4">
      <div className="d-flex align-items-center justify-content-between mb-4">
        <h4 className="font-display mb-0 text-main fw-bold">
          <span className="text-warning me-2">★</span> 
          {p('watchedKeywords')} ({Array.isArray(watchedKeywords) ? watchedKeywords.length : 0})
        </h4>
        <button className="btn btn-sm text-muted-custom border" onClick={onManageClick}>
          {p('manage')}
        </button>
      </div>

      {loading ? (
        <div className="mb-4 d-flex gap-2">
           {[...Array(3)].map((_, i) => (
             <div key={i} className="skeleton-shimmer" style={{ width: '100px', height: '32px', borderRadius: '16px' }}></div>
           ))}
        </div>
      ) : Array.isArray(watchedKeywords) && watchedKeywords.length > 0 ? (
        <div className="mb-4">
          {watchedKeywords.map((kw, idx) => {
            const label = typeof kw === 'string'
              ? kw
              : kw.display_name || kw.keyword || kw.name;
            return (
               <KeywordChip 
                 key={idx} 
                 keyword={label} 
                 icon={<span className="ms-1">★</span>}
                 onClick={() => {
                   setSelectedKeyword(label);
                   setKeywordArticlePage(1);
                 }}
                 isActive={activeKeyword === label}
               />
            );
          })}
        </div>
      ) : (
        <div className="text-center py-3 text-muted-custom mb-4">
          {p('noWatchedKeywords')}
        </div>
      )}

      <div className="mt-4">
        <p className="text-muted-custom small mb-3">{p('latestByKeyword')}</p>
        {loading ? (
          <KeywordRelatedArticleList articles={[]} loading />
        ) : activeKeyword ? (
          <section
            className="border rounded-3 p-3 p-md-4 bg-white"
            aria-labelledby="active-keyword-articles"
          >
            <div className="d-flex align-items-center justify-content-between gap-3 mb-3 pb-3 border-bottom">
              <h5
                id="active-keyword-articles"
                className="font-display fw-bold text-main mb-0"
              >
                {activeKeyword}
              </h5>
              <span className="badge bg-light text-main border fw-medium">
                {activeKeywordArticles.length} {p('articles')}
              </span>
            </div>
            <KeywordRelatedArticleList
              key={activeKeyword}
              articles={visibleKeywordArticles}
              loading={false}
              filterKeyword={activeKeyword}
            />
            {keywordArticleTotalPages > 1 && (
              <nav className="d-flex align-items-center justify-content-between gap-3 mt-3" aria-label="Keyword article pagination">
                <button
                  type="button"
                  className="btn btn-outline-secondary btn-sm"
                  disabled={keywordArticlePage === 1}
                  onClick={() => setKeywordArticlePage((page) => Math.max(1, page - 1))}
                >
                  {p('previous')}
                </button>
                <span className="text-muted-custom small">
                  {p('page')} {keywordArticlePage}/{keywordArticleTotalPages}
                </span>
                <button
                  type="button"
                  className="btn btn-outline-primary btn-sm"
                  disabled={keywordArticlePage === keywordArticleTotalPages}
                  onClick={() => setKeywordArticlePage((page) => Math.min(keywordArticleTotalPages, page + 1))}
                >
                  {p('next')}
                </button>
              </nav>
            )}
          </section>
        ) : (
          <KeywordRelatedArticleList articles={[]} loading={false} />
        )}
      </div>
    </div>
  );
};

export default KeywordWatchList;
