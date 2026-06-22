import React from 'react';
import KeywordChip from './KeywordChip';
import KeywordRelatedArticleList from './KeywordRelatedArticleList';

const KeywordWatchList = ({ watchedKeywords, articles, loading, onManageClick }) => {
  return (
    <div className="glass-card p-4 rounded-4">
      <div className="d-flex align-items-center justify-content-between mb-4">
        <h4 className="font-display mb-0 text-main fw-bold">
          <span className="text-warning me-2">★</span> 
          Keywords đang theo dõi ({Array.isArray(watchedKeywords) ? watchedKeywords.length : 0})
        </h4>
        <button className="btn btn-sm text-muted-custom border" onClick={onManageClick}>
          Quản lý
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
            const label = typeof kw === 'string' ? kw : kw.keyword || kw.name;
            return (
               <KeywordChip 
                 key={idx} 
                 keyword={label} 
                 icon={<span className="ms-1">★</span>} 
               />
            );
          })}
        </div>
      ) : (
        <div className="text-center py-3 text-muted-custom mb-4">
          Bạn chưa theo dõi keyword nào trong project này.
        </div>
      )}

      <div className="mt-4">
        <p className="text-muted-custom small mb-3">Bài báo mới nhất theo keyword đang watch:</p>
        <KeywordRelatedArticleList articles={articles} loading={loading} />
      </div>
    </div>
  );
};

export default KeywordWatchList;
