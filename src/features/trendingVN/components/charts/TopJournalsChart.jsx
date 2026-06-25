/**
 * File: src/features/trendingVN/components/charts/TopJournalsChart.jsx
 *
 * Bar chart hien thi Top Journals theo trich dan.
 * Pure div + CSS, khong dung chart library. Toi da 7 cot.
 * Du lieu tu GET /api/v1/trending-vn/top-journals
 *
 * Fields su dung:
 * - journal_id: string
 * - journal_name: string           -- ten hien thi
 * - total_recent_citations: number -- gia tri chinh de tinh chieu cao cot
 * - recent_articles_count: number  -- so bai bao (hien thi trong tooltip)
 * - top_keywords: array            -- keyword pho bien nhat cua journal do
 * - top_topics: array              -- topic pho bien nhat cua journal do
 *
 * Props:
 * - journals: array    -- Danh sach journal tu useTrending hook
 * - loading: boolean   -- Dang tai du lieu
 * - onViewAll: function -- Callback khi bam "View Top 10 Journals" (optional)
 */

import { useTranslation } from 'react-i18next';
import Icon from '../../../../shared/components/Icon';
import './TopJournalsChart.css';

export default function TopJournalsChart({ journals = [], loading = false, onViewAll }) {
  const { t } = useTranslation();

  // ── Skeleton khi dang tai ────────────────────────────────────────────────
  if (loading) {
    const skeletonHeights = [100, 68, 55, 82, 45, 72, 38];
    return (
      <div className="tjc-skeleton-area">
        {skeletonHeights.map((h, i) => (
          <div
            key={i}
            className="tjc-skeleton-bar skeleton-shimmer"
            style={{ height: String(h) + '%' }}
          />
        ))}
      </div>
    );
  }

  // ── Empty state ───────────────────────────────────────────────────────────
  if (!journals.length) {
    return (
      <div className="tjc-empty">
        <Icon icon="lucide:bar-chart-2" className="tjc-empty-icon" />
        <p className="tjc-empty-text">{t('noJournalData')}</p>
      </div>
    );
  }

  // ── Chuan bi du lieu ─────────────────────────────────────────────────────
  const chartData = journals.slice(0, 7);

  // Uu tien total_recent_citations (endpoint moi), fallback article_count (endpoint cu)
  const getValue = (j) =>
    j.total_recent_citations ?? j.citation_count ?? j.article_count ?? 1;

  // Lay ten journal: endpoint moi dung journal_name, endpoint cu dung display_name
  const getName = (j) => j.journal_name || j.display_name || '—';

  const maxVal = Math.max(...chartData.map(getValue), 1);

  // Format so tren dinh cot
  const fmtVal = (n) => {
    if (n >= 1000) return (n / 1000).toFixed(1).replace('.0', '') + 'K';
    return String(n);
  };

  // Viet tat ten journal (toi da 2 tu)
  const shortLabel = (name) => {
    if (!name) return '—';
    const parts = name.split(' ').filter(Boolean);
    if (parts.length === 1) return parts[0].substring(0, 8);
    return parts.slice(0, 2).join(' ');
  };

  // Tooltip: ten day du + so bai bao + trich dan
  const getTooltip = (j) => {
    const name = getName(j);
    const cites = getValue(j);
    const articles = j.recent_articles_count ?? j.article_count;
    let tip = name;
    if (cites)    tip += ` — ${fmtVal(cites)} citations`;
    if (articles) tip += ` | ${articles} articles`;
    return tip;
  };

  return (
    <div className="tjc-wrapper">

      {/* ── Khu vuc cac cot bar ─────────────────────────────────── */}
      <div className="tjc-bars-area">
        {chartData.map((journal, i) => {
          const val       = getValue(journal);
          const heightPct = Math.max((val / maxVal) * 100, 6);

          return (
            <div
              key={journal.journal_id ? String(journal.journal_id) : String(i)}
              className="tjc-bar-col"
              title={getTooltip(journal)}
            >
              {/* So tren dinh cot */}
              <span className="tjc-bar-value">{fmtVal(val)}</span>

              {/* Than cot */}
              <div
                className="tjc-bar"
                style={{ height: String(heightPct) + '%' }}
              />
            </div>
          );
        })}
      </div>

      {/* ── Labels ten journal phia duoi ────────────────────────── */}
      <div className="tjc-labels-area">
        {chartData.map((journal, i) => (
          <div key={String(i)} className="tjc-bar-label">
            {shortLabel(getName(journal))}
          </div>
        ))}
      </div>

      {/* ── Footer link ──────────────────────────────────────────── */}
      <div className="tjc-footer">
        <button className="tjc-view-all-btn" onClick={onViewAll}>
          {t('viewTop10Journals')}
        </button>
      </div>

    </div>
  );
}