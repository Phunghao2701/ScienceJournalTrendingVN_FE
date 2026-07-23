import KeywordChip from './KeywordChip';
import { useProjectText } from '../../project/i18n/useProjectText';

const TrendingKeywordList = ({ trendingKeywords, loading, onKeywordClick }) => {
  const p = useProjectText();
  return (
    <div className="glass-card p-4 rounded-4 mb-4">
      <div className="d-flex align-items-center mb-3">
        <h4 className="font-display mb-0 text-main fw-bold">🔥 {p('topTrendingKeywords')}</h4>
      </div>
      <p className="text-muted-custom small mb-4">{p('trendingPeriod')}</p>

      {loading ? (
        <div className="d-flex flex-wrap gap-2">
          {[84, 126, 98, 142, 112, 88, 134, 104, 120, 92].map((width, i) => (
            <div key={i} className="skeleton-shimmer" style={{ width: `${width}px`, height: '32px', borderRadius: '16px' }}></div>
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
          {p('noTrending')}
        </div>
      )}

      <div className="mt-4 p-3 rounded text-muted-custom small" style={{ backgroundColor: 'var(--bg-chip)', border: '1px solid var(--border)' }}>
        {p('trendingHint')}
      </div>
    </div>
  );
};

export default TrendingKeywordList;
