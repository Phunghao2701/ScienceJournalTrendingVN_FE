/**
 * TopJournalsChart: pure CSS/div bar chart for the top 7 journals by citations.
 *
 * File: src/features/trendingVN/components/charts/TopJournalsChart.jsx
 *
 * No charting library — bars are plain divs sized by percentage height.
 * Maximum 7 bars rendered (first 7 items in the journals array).
 * Data source: GET /api/v1/trending-vn/top-journals (via useTrending.fetchJournals)
 *
 * Fields used per journal item:
 * - journal_id: string                   -- React key
 * - journal_name: string                 -- Display label (falls back to display_name)
 * - total_recent_citations: number       -- Primary bar value (falls back to article_count)
 * - recent_articles_count: number        -- Shown in the hover tooltip
 * - top_keywords, top_topics: array      -- Available for future tooltip enhancement
 *
 * Props:
 * - journals: array      -- Journal list from useTrending hook
 * - loading: boolean     -- Show skeleton bars while loading
 * - onViewAll: function  -- Callback for the "View Top 10 Journals" footer link (optional)
 */

import { useTranslation } from 'react-i18next';
import Icon from '../../../../shared/components/Icon';
import './TopJournalsChart.css';

export default function TopJournalsChart({ journals = [], loading = false, onViewAll }) {
  const { t } = useTranslation();

  // -- Skeleton --
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

  // -- Empty state --
  if (!journals.length) {
    return (
      <div className="tjc-empty">
        <Icon icon="lucide:bar-chart-2" className="tjc-empty-icon" />
        <p className="tjc-empty-text">{t('noJournalData')}</p>
      </div>
    );
  }

  // -- Prepare chart data --
  const chartData = journals.slice(0, 7);

  // Prefer total_recent_citations (new endpoint); fall back to article_count (legacy endpoint)
  const getValue = (j) =>
    j.total_recent_citations ?? j.citation_count ?? j.article_count ?? 1;

  // New endpoint uses journal_name; legacy endpoint uses display_name
  const getName = (j) => j.journal_name || j.display_name || '—';

  const maxVal = Math.max(...chartData.map(getValue), 1);

  // Format number shown above each bar
  const fmtVal = (n) => {
    if (n >= 1000) return (n / 1000).toFixed(1).replace('.0', '') + 'K';
    return String(n);
  };

  // Abbreviate journal name for the x-axis label (max 2 words)
  const shortLabel = (name) => {
    if (!name) return '—';
    const parts = name.split(' ').filter(Boolean);
    if (parts.length === 1) return parts[0].substring(0, 8);
    return parts.slice(0, 2).join(' ');
  };

  // Tooltip: full journal name + article count + citation count
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

      {/* -- Bar columns area -- */}
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
              {/* Value label above bar */}
              <span className="tjc-bar-value">{fmtVal(val)}</span>

              {/* Bar fill */}
              <div
                className="tjc-bar"
                style={{ height: String(heightPct) + '%' }}
              />
            </div>
          );
        })}
      </div>

      {/* -- Journal name labels below bars -- */}
      <div className="tjc-labels-area">
        {chartData.map((journal, i) => (
          <div key={String(i)} className="tjc-bar-label">
            {shortLabel(getName(journal))}
          </div>
        ))}
      </div>

      {/* -- Footer -- */}
      <div className="tjc-footer">
        <button className="tjc-view-all-btn" onClick={onViewAll}>
          {t('viewTop10Journals')}
        </button>
      </div>

    </div>
  );
}