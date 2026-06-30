/**
 * File: src/features/trendingVN/components/trend-momentum/TrendMomentumCards.jsx
 *
 * 4 highlight cards "Research Trend Momentum" theo mau Vietnam Research Index.
 * Layout: border trai mau | label nho uppercase | ten to | badge ben phai.
 *
 * 4 cards (chi dung gia tri that tu API, khong fabricate % tang truong):
 *   1. TOP TRENDING TOPIC      -- topics[0].display_name | badge N/A (BE chua co data tang truong theo thoi gian)
 *   2. MOST ACTIVE UNIVERSITY  -- universities[].papers cao nhat (du lieu that tu getUniversityRankingsApi)
 *   3. MOST INFLUENTIAL AUTHOR -- authors[0].display_name | badge h_index (du lieu that)
 *   4. MOST CITED TOPIC        -- topics[1].display_name | badge N/A (khong co citation growth that)
 *
 * Props:
 * - topics: array        -- Danh sach topics tu useTrending (da sort theo score giam dan)
 * - authors: array       -- Danh sach authors tu useTrending (da sort theo cited_by_count/h_index)
 * - universities: array  -- Danh sach universities tu useTrending, item: { name, papers, cites }
 * - loading: boolean     -- Dang tai du lieu
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
      <div className="tmc-empty">{t('noTrendData')}</div>
    );
  }

  // ── Lay du lieu that cho tung card (khong fabricate cong thuc gia) ───────
  const topTopic = topics[0] || null;
  const secondTopic = topics[1] || null;
  const topAuthor = authors[0] || null;

  // University hoat dong nhieu nhat: chon theo so bai bao that (papers), khong dua vao thu tu BE tra ve
  const mostActiveUni = universities.length
    ? universities.reduce((best, u) => ((u.papers || 0) > (best.papers || 0) ? u : best), universities[0])
    : null;

  // ── 4 cards data ─────────────────────────────────────────────────────────
  const CARDS = [
    {
      label: 'TOP TRENDING TOPIC',
      value: topTopic?.display_name || null,
      badge: null, // BE chua co du lieu so sanh theo thoi gian de tinh % tang truong that
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
      badge: null, // Khong co API tinh citation growth that theo thoi gian
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

          {/* ── Badge ben phai: hien thi that, hoac N/A neu chua co API ───── */}
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
