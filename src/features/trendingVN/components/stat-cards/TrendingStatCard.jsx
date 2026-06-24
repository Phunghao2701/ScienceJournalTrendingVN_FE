/**
 * File: src/features/trendingVN/components/stat-cards/TrendingStatCard.jsx
 *
 * Stat Card hien thi so lieu tong quan trang TrendingVN.
 * Layout theo mau: label nho tren + badge growth goc phai + so to + desc nho duoi.
 * Hai kieu badge growth:
 *   - Loai text: "+18% up arrow" (growthType: "up" / "down")
 *   - Loai chip nhan: "Article Trend" hoac "#1" (growthType: "tag")
 *
 * Props:
 * - label: string        -- Nhan tren cung (VD: "Trending Articles")
 * - value: string|number -- Gia tri chinh (VD: "128" hoac "AI / ML")
 * - description: string  -- Mo ta phu duoi value (VD: "Dang tang toc ve luong trich dan")
 * - growth: string       -- Noi dung badge (VD: "+18%", "Article Trend", "#1")
 * - growthType: string   -- "up" | "down" | "tag" | "rank" | "neutral"
 * - isTextValue: bool    -- Value la text (VD: ten topic) thay vi so
 * - accentColor: string  -- Mau accent (override default primary)
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
  // ── Render badge growth theo tung kieu ────────────────────────────────────
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
      // Chip nhan: "Article Trend"
      return <span className="tsc-badge tsc-badge--tag">{growth}</span>;
    }
    if (growthType === 'rank') {
      // Chip hang: "#1"
      return <span className="tsc-badge tsc-badge--rank">{growth}</span>;
    }
    // neutral
    return <span className="tsc-badge tsc-badge--neutral">{growth}</span>;
  };

  const valueClass = ['tsc-value', isTextValue ? 'tsc-value--text' : ''].filter(Boolean).join(' ');
  const accentStyle = accentColor ? { backgroundColor: accentColor } : {};

  return (
    <div className="tsc-card">

      {/* ── Accent line tren cung ─────────────────────────────────────── */}
      <div className="tsc-accent" style={accentStyle} />

      {/* ── Header: label trai + badge phai ──────────────────────────── */}
      <div className="tsc-header">
        <span className="tsc-label">{label}</span>
        {renderGrowthBadge()}
      </div>

      {/* ── Gia tri chinh (so lon) ────────────────────────────────────── */}
      <div className={valueClass}>
        {value ?? (
          <span
            className="skeleton-shimmer d-block"
            style={{ width: 80, height: 34, borderRadius: 6 }}
          />
        )}
      </div>

      {/* ── Mo ta phu ─────────────────────────────────────────────────── */}
      {description && (
        <div className="tsc-desc">{description}</div>
      )}

    </div>
  );
}
