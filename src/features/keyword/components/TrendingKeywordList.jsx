import React from 'react';
import KeywordChip from './KeywordChip';

const TrendingKeywordList = ({ trendingKeywords, loading, onKeywordClick }) => {
  return (
    <div className="glass-card p-4 rounded-4 mb-4">
      <div className="d-flex align-items-center mb-3">
        <h4 className="font-display mb-0 text-main fw-bold">🔥 Top 20 Trending Keywords</h4>
      </div>
      <p className="text-muted-custom small mb-4">Tính trong 30 ngày gần nhất</p>

      {loading ? (
        <div className="d-flex flex-wrap gap-2">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="skeleton-shimmer" style={{ width: `${Math.random() * 80 + 80}px`, height: '32px', borderRadius: '16px' }}></div>
          ))}
        </div>
      ) : Array.isArray(trendingKeywords) && trendingKeywords.length > 0 ? (
        <div className="d-flex flex-wrap">
          {trendingKeywords.map((item, idx) => (
            <KeywordChip 
              key={idx} 
              keyword={item.keyword || item.name} 
              count={item.count || item.score} 
              isTrending={true}
              onClick={() => onKeywordClick && onKeywordClick(item.keyword || item.name)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-4 text-muted-custom">
          Chưa có dữ liệu trending.
        </div>
      )}

      <div className="mt-4 p-3 rounded text-muted-custom small" style={{ backgroundColor: 'var(--bg-chip)', border: '1px solid var(--border)' }}>
        💡 Click vào keyword để theo dõi (★). Các keyword đang watch sẽ hiển thị bài báo mới nhất bên dưới.
      </div>
    </div>
  );
};

export default TrendingKeywordList;
