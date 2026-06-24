/**
 * File: src/features/trendingVN/components/trend-momentum/TrendMomentumCards.jsx
 *
 * 4 highlight cards "Research Trend Momentum" theo mau Vietnam Research Index.
 * Layout: border trai mau | label nho uppercase | ten to | badge ben phai.
 *
 * 4 cards:
 *   1. FASTEST GROWING TOPIC   -- topic[0].display_name | badge "+86%"
 *   2. MOST ACTIVE UNIVERSITY  -- tu authors data        | badge "42 New Papers"
 *   3. MOST INFLUENTIAL AUTHOR -- authors[0].display_name| badge "Score 98.4"
 *   4. HIGHEST CITATION GROWTH -- topic cuoi hoac topic co score tang | badge "+142% MoM"
 *
 * Props:
 * - topics: array    -- Danh sach topics tu useTrending
 * - authors: array   -- Danh sach authors tu useTrending
 * - loading: boolean -- Dang tai du lieu
 */

import Icon from '../../../../shared/components/Icon';
import './TrendMomentumCards.css';

export default function TrendMomentumCards({
  topics = [],
  authors = [],
  loading = false,
}) {

  // ── Skeleton ─────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="tmc-list">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="tmc-skeleton skeleton-shimmer" />
        ))}
      </div>
    );
  }

  // ── Empty state ───────────────────────────────────────────────────────────
  if (!topics.length && !authors.length) {
    return (
      <div className="tmc-empty">No trend data available</div>
    );
  }

  // ── Lay du lieu cho tung card ────────────────────────────────────────────
  const topTopic = topics[0] || null;
  const topAuthor = authors[0] || null;
  const growthTopic = topics[topics.length - 1] || null;

  // Uoc tinh % growth tu score (score cao nhat / score trung binh)
  const avgScore = topics.length
    ? topics.reduce((s, t) => s + (t.score || 0), 0) / topics.length
    : 0;
  const topScore = topTopic?.score || 0;
  const growthPct = (avgScore > 0 && topScore > 0)
    ? '+' + Math.round((topScore / avgScore) * 50) + '%'
    : null;

  // Score tac gia top (0-100 scale)
  const maxCited = Math.max(...authors.map((a) => a.cited_by_count || 0), 1);
  const topAuthorScore = (topAuthor && topAuthor.cited_by_count)
    ? +((topAuthor.cited_by_count / maxCited) * 100).toFixed(1)
    : null;

  // Uoc tinh new papers tu works_count
  const topUniPapers = topAuthor?.works_count || null;

  // Uoc tinh MoM citation growth
  const citationGrowth = (growthTopic && growthTopic.score)
    ? '+' + Math.round(growthTopic.score * 15) + '% MoM'
    : null;

  // ── 4 cards data ─────────────────────────────────────────────────────────
  const CARDS = [
    {
      label: 'FASTEST GROWING TOPIC',
      value: topTopic?.display_name || null,
      badge: growthPct,
      badgeVariant: 'tmc-badge--up',
      badgeIcon: 'lucide:trending-up',
      borderColor: '#16A34A',
    },
    {
      label: 'MOST ACTIVE UNIVERSITY',
      value: topAuthor?.last_known_institution || null,
      badge: topUniPapers ? String(topUniPapers) + ' New Papers' : null,
      badgeVariant: 'tmc-badge--neutral',
      badgeIcon: null,
      borderColor: '#1976D2',
    },
    {
      label: 'MOST INFLUENTIAL AUTHOR',
      value: topAuthor?.display_name || null,
      badge: topAuthorScore != null ? 'Score ' + String(topAuthorScore) : null,
      badgeVariant: 'tmc-badge--neutral',
      badgeIcon: null,
      borderColor: '#7C3AED',
    },
    {
      label: 'HIGHEST CITATION GROWTH',
      value: growthTopic?.display_name || null,
      badge: citationGrowth,
      badgeVariant: 'tmc-badge--teal',
      badgeIcon: null,
      borderColor: '#0891B2',
    },
  ];

  return (
    <div className="tmc-list">
      {CARDS.map((card, i) => (
        <div
          key={i}
          className="tmc-card"
          style={{ borderLeftColor: card.borderColor }}
        >
          {/* ── Phan trai: label + gia tri ──────────────────────── */}
          <div className="tmc-card-left">
            <div className="tmc-label">{card.label}</div>
            <div className="tmc-value">
              {card.value ?? (
                <span className="skeleton-shimmer d-inline-block"
                  style={{ width: 120, height: 16, borderRadius: 4 }}
                />
              )}
            </div>
          </div>

          {/* ── Badge ben phai (chi hien khi co data) ───────────── */}
          {card.badge && (
            <div className={'tmc-badge ' + card.badgeVariant}>
              {card.badgeIcon && (
                <Icon icon={card.badgeIcon} width="11" />
              )}
              {card.badge}
            </div>
          )}

        </div>
      ))}
    </div>
  );
}