import { Icon } from '@iconify/react';
import { formatCount, formatGrowth } from '../utils/formatNumber';

/**
 * StatCard — hiển thị một thống kê đơn với icon, số liệu, label và growth indicator.
 * Reusable: có thể dùng ở Journal/Article/Project/Geography pages.
 *
 * @param {string}  icon       - Iconify icon string
 * @param {string}  accentColor - CSS color for top border & value
 * @param {number|string} value
 * @param {string}  label
 * @param {number}  growth     - numeric delta (positive/negative/0)
 * @param {string}  growthLabel - e.g. "tuần này", "tháng này"
 * @param {boolean} loading
 */
export default function StatCard({ icon, accentColor = 'var(--primary)', value, label, growth, growthLabel = 'tuần này', loading = false }) {
  const isPositive = growth > 0;
  const isNeutral  = growth === 0 || growth == null;

  return (
    <div
      className="position-relative p-4 rounded-3 h-100"
      style={{
        backgroundColor: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderTop: `3px solid ${accentColor}`,
        transition: 'box-shadow 0.2s ease',
      }}
      onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.06)'}
      onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
    >
      {loading ? (
        <div>
          <div className="skeleton-shimmer rounded mb-3" style={{ width: 40, height: 40 }} />
          <div className="skeleton-shimmer rounded mb-2" style={{ width: '60%', height: 28 }} />
          <div className="skeleton-shimmer rounded mb-2" style={{ width: '80%', height: 14 }} />
          <div className="skeleton-shimmer rounded" style={{ width: '50%', height: 12 }} />
        </div>
      ) : (
        <>
          {/* Icon */}
          <div
            className="d-flex align-items-center justify-content-center mb-3"
            style={{
              width: 40, height: 40, borderRadius: 10,
              backgroundColor: `${accentColor}18`,
              color: accentColor,
            }}
          >
            <Icon icon={icon} width={20} height={20} />
          </div>

          {/* Value */}
          <div
            className="font-display mb-1"
            style={{ fontSize: 'calc(1.4rem + 0.6vw)', fontWeight: 800, color: accentColor, letterSpacing: '-0.02em' }}
          >
            {formatCount(value)}
          </div>

          {/* Label */}
          <div className="text-muted-custom mb-2" style={{ fontSize: '0.78rem', fontWeight: 500 }}>
            {label}
          </div>

          {/* Growth indicator */}
          {growth !== undefined && (
            <div
              className="d-flex align-items-center gap-1"
              style={{
                fontSize: '0.72rem',
                fontWeight: 600,
                color: isNeutral ? 'var(--text-muted)' : isPositive ? '#2FC646' : '#e53935',
              }}
            >
              <Icon
                icon={isNeutral ? 'lucide:minus' : isPositive ? 'lucide:trending-up' : 'lucide:trending-down'}
                width={12}
              />
              <span>
                {isNeutral ? 'Không đổi' : `${formatGrowth(growth)} ${growthLabel}`}
              </span>
            </div>
          )}
        </>
      )}
    </div>
  );
}
