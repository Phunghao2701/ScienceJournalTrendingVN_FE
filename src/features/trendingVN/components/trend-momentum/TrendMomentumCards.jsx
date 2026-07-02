/**
 * TrendMomentumCards: 4-card "Research Trend Momentum" section matching the Vietnam Research Index design.
 *
 * File: src/features/trendingVN/components/trend-momentum/TrendMomentumCards.jsx
 *
 * Layout per card: colored left border | small uppercase label | large value text | right badge.
 *
 * Cards (uses only real API values -- no fabricated growth percentages):
 *   1. TOP TRENDING TOPIC      -- topics[0].display_name | badge N/A (no time-series growth data from BE)
 *   2. MOST ACTIVE UNIVERSITY  -- university with max papers count (from getUniversityRankingsApi)
 *   3. MOST INFLUENTIAL AUTHOR -- authors[0].display_name | badge shows h_index
 *   4. MOST CITED TOPIC        -- topics[1].display_name | badge N/A (no citation growth API)
 *
 * Props:
 * - topics: array        -- Topic list from useTrending (pre-sorted by score descending)
 * - authors: array       -- Author list from useTrending (pre-sorted by cited_by_count / h_index)
 * - universities: array  -- University list from useTrending; each item: { name, papers, cites }
 * - loading: boolean     -- Show skeleton cards while loading
 */

import { useTranslation } from 'react-i18next';
import Icon from '../../../../shared/components/Icon';
import './TrendMomentumCards.css';

export default function TrendMomentumCards({
  topics = [],
  authors = [],
  universities = [],
  loading = false,
}) {
  const { t } = useTranslation();

  // -- Skeleton --
  if (loading) {
    return (
      <div className="tmc-list">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="tmc-skeleton skeleton-shimmer" />
        ))}
      </div>
    );
  }

  // -- Empty state --
  if (!topics.length && !authors.length) {
    return (
      <div className="tmc-empty">{t('noTrendData')}</div>
    );
  }

  // Extract real data for each card (no fabricated growth formulas)
  const topTopic = topics[0] || null;
  const secondTopic = topics[1] || null;
  const topAuthor = authors[0] || null;

  // Most active university: pick by real paper count, not by BE array order
  const mostActiveUni = universities.length
    ? universities.reduce((best, u) => ((u.papers || 0) > (best.papers || 0) ? u : best), universities[0])
    : null;

  // -- Card definitions --
  const CARDS = [
    {
      label: 'TOP TRENDING TOPIC',
      value: topTopic?.display_name || null,
      badge: null, // No time-series growth data available from BE yet
      badgeVariant: 'tmc-badge--up',
      badgeIcon: 'lucide:trending-up',
      borderColor: '#16A34A',
    },
    {
      label: 'MOST ACTIVE UNIVERSITY',
      value: mostActiveUni?.name || null,
      badge: mostActiveUni?.papers ? mostActiveUni.papers + ' ' + t('totalPapersLabel') : null,
      badgeVariant: 'tmc-badge--neutral',
      badgeIcon: null,
      borderColor: '#1976D2',
    },
    {
      label: 'MOST INFLUENTIAL AUTHOR',
      value: topAuthor?.display_name || null,
      badge: topAuthor?.h_index ? t('hIndexLabel') + ' ' + topAuthor.h_index : null,
      badgeVariant: 'tmc-badge--neutral',
      badgeIcon: null,
      borderColor: '#7C3AED',
    },
    {
      label: 'MOST CITED TOPIC',
      value: secondTopic?.display_name || null,
      badge: null, // No API for real citation growth over time
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
          {/* Left: label + value */}
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

          {/* Right badge: shows real value when available, N/A when no API data */}
          {card.value && card.badge && (
            <div className={'tmc-badge ' + card.badgeVariant}>
              {card.badgeIcon && (
                <Icon icon={card.badgeIcon} width="11" />
              )}
              {card.badge}
            </div>
          )}
          {card.value && !card.badge && (
            <div className="tmc-badge tmc-badge--na" title={t('needApiAggregate')}>
              N/A
            </div>
          )}

        </div>
      ))}
    </div>
  );
}
