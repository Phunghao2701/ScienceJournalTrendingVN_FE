/**
 * File source thuộc hệ thống FE ResearchPulse.
 *
 * File: features\dashboard\components\TrendingKeywordsCard.jsx
 */
import { Icon } from '@iconify/react';

/** keyword pill colours cycle */
const PILL_COLORS = [
  { bg: 'rgba(255,122,51,0.1)', color: 'var(--primary)',  border: 'rgba(255,122,51,0.3)' },
  { bg: 'rgba(99,102,241,0.1)', color: '#6366f1',         border: 'rgba(99,102,241,0.3)' },
  { bg: 'rgba(14,165,233,0.1)', color: '#0ea5e9',         border: 'rgba(14,165,233,0.3)' },
  { bg: 'rgba(47,198,70,0.1)',  color: 'var(--q1-color)', border: 'rgba(47,198,70,0.3)' },
  { bg: 'rgba(245,158,11,0.1)', color: '#f59e0b',         border: 'rgba(245,158,11,0.3)' },
];

/**
 * KeywordTag — một keyword pill có growth label
 */
function KeywordTag({ keyword, index, onClick }) {
  const name   = keyword.keyword ?? keyword.name ?? keyword;
  const growth = keyword.growth ?? keyword.count ?? null;
  const c      = PILL_COLORS[index % PILL_COLORS.length];

  return (
    <button
      className="border-0 d-inline-flex align-items-center gap-1 rounded-pill px-3 py-1"
      onClick={() => onClick?.(name)}
      style={{
        backgroundColor: c.bg, color: c.color, border: `1px solid ${c.border}`,
        fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer',
        transition: 'all 0.15s ease',
        letterSpacing: '0.01em',
      }}
      onMouseEnter={e => e.currentTarget.style.opacity = '0.75'}
      onMouseLeave={e => e.currentTarget.style.opacity = '1'}
    >
      <span>{name}</span>
      {growth != null && (
        <span style={{ opacity: 0.7, fontSize: '0.65rem' }}>
          {growth > 0 ? `+${growth > 999 ? (growth/1000).toFixed(1)+'k' : growth}` : growth}
        </span>
      )}
    </button>
  );
}

/**
 * TrendingKeywordsCard — card trending keywords với pills
 */
export default function TrendingKeywordsCard({ keywords, loading, error, onKeywordClick, onViewMore }) {
  return (
    <div
      className="rounded-3 p-4"
      style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}
    >
      {/* Header */}
      <div className="d-flex align-items-center justify-content-between mb-4">
        <div className="d-flex align-items-center gap-2">
          <span className="font-display fw-bold text-main" style={{ fontSize: '0.9rem' }}>
            🔥 Trending Keywords
          </span>
        </div>
        {onViewMore && (
          <button
            className="btn btn-link p-0 text-decoration-none"
            onClick={onViewMore}
            style={{ fontSize: '0.75rem', color: 'var(--primary)' }}
          >
            Xem thêm →
          </button>
        )}
      </div>

      {/* Body */}
      {loading ? (
        <div className="d-flex flex-wrap gap-2">
          {[120, 80, 100, 90, 110, 70, 95].map((w, i) => (
            <div key={i} className="skeleton-shimmer rounded-pill" style={{ width: w, height: 28 }} />
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-4">
          <Icon icon="lucide:alert-circle" width={28} style={{ color: '#ef4444' }} />
          <p className="text-muted-custom mt-2 mb-0" style={{ fontSize: '0.8rem' }}>{error}</p>
        </div>
      ) : keywords.length === 0 ? (
        <div className="text-center py-4">
          <Icon icon="lucide:tag" width={32} style={{ color: 'var(--text-muted)' }} />
          <p className="text-main fw-semibold mt-2 mb-1" style={{ fontSize: '0.85rem' }}>
            Chưa có keyword nào
          </p>
          <p className="text-muted-custom mb-0" style={{ fontSize: '0.75rem' }}>
            Thêm keyword vào project để bắt đầu theo dõi.
          </p>
        </div>
      ) : (
        <div className="d-flex flex-wrap gap-2">
          {keywords.map((kw, i) => (
            <KeywordTag
              key={i}
              keyword={kw}
              index={i}
              onClick={onKeywordClick}
            />
          ))}
        </div>
      )}
    </div>
  );
}
