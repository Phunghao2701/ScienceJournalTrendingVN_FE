/**
 * TrendingStatCard: summary metric card for the TrendingVN stats bar.
 *
 * File: src/features/trendingVN/components/stat-cards/TrendingStatCard.jsx
 *
 * Layout: small label (top-left) + growth badge (top-right) + large value + small description.
 * Growth badge has five variants controlled by growthType:
 *   - "up"      -- "+18%" with an up-arrow icon (green)
 *   - "down"    -- "-5%" with a down-arrow icon (red)
 *   - "tag"     -- plain chip label (e.g. "Article Trend")
 *   - "rank"    -- rank chip (e.g. "#1")
 *   - "neutral" -- muted chip (default)
 *
 * Props:
 * - label: string        -- Top label (e.g. "Trending Articles")
 * - value: string|number -- Main display value (e.g. "128" or "AI / ML")
 * - description: string  -- Secondary text below the value
 * - growth: string       -- Badge content (e.g. "+18%", "Article Trend", "#1")
 * - growthType: string   -- Badge style variant (see above)
 * - isTextValue: bool    -- True when value is a topic name rather than a number
 * - accentColor: string  -- CSS color string to override the default accent line color
 */

import Icon from '../../../../shared/components/Icon';
import './TrendingStatCard.css';

export default function TrendingStatCard({
  label,
  value,
  description,
  growth,
  growthType = 'neutral',
  isTextValue = false,
  accentColor,
}) {
  // Render the growth badge based on growthType variant
  const renderGrowthBadge = () => {
    if (!growth) return null;

    if (growthType === 'up') {
      return (
        <span className="tsc-badge tsc-badge--up">
          <Icon icon="lucide:trending-up" width="11" />
          {growth}
        </span>
      );
    }
    if (growthType === 'down') {
      return (
        <span className="tsc-badge tsc-badge--down">
          <Icon icon="lucide:trending-down" width="11" />
          {growth}
        </span>
      );
    }
    if (growthType === 'tag') {
      // Label chip (e.g. "Article Trend")
      return <span className="tsc-badge tsc-badge--tag">{growth}</span>;
    }
    if (growthType === 'rank') {
      // Rank chip (e.g. "#1")
      return <span className="tsc-badge tsc-badge--rank">{growth}</span>;
    }
    // neutral
    return <span className="tsc-badge tsc-badge--neutral">{growth}</span>;
  };

  const valueClass = ['tsc-value', isTextValue ? 'tsc-value--text' : ''].filter(Boolean).join(' ');
  const accentStyle = accentColor ? { backgroundColor: accentColor } : {};

  return (
    <div className="tsc-card">

      {/* Colored accent line at the top of the card */}
      <div className="tsc-accent" style={accentStyle} />

      {/* Header row: label (left) + growth badge (right) */}
      <div className="tsc-header">
        <span className="tsc-label">{label}</span>
        {renderGrowthBadge()}
      </div>

      {/* Main value (large number or text); shows a skeleton shimmer while undefined */}
      <div className={valueClass}>
        {value ?? (
          <span
            className="skeleton-shimmer d-block"
            style={{ width: 80, height: 34, borderRadius: 6 }}
          />
        )}
      </div>

      {/* Secondary description text */}
      {description && (
        <div className="tsc-desc">{description}</div>
      )}

    </div>
  );
}
