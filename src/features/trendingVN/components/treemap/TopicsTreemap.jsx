/**
 * File: src/features/trendingVN/components/treemap/TopicsTreemap.jsx
 *
 * Treemap hien thi Top 6 bai bao noi bat nhat theo citation_count.
 * Moi o = 1 bai bao, size bang nhau (flexGrow = 1), mau blue dam -> nhat.
 * O "Others" = phan con lai, mau xam.
 *
 * Data: articles tu useTrending, duoc sort theo citation_count DESC o FE.
 * Fields su dung: article_id, title, citation_count, publication_year, primary_topic
 *
 * Props:
 * - articles: array    -- Danh sach bai bao tu useTrending hook
 * - loading: boolean   -- Dang tai du lieu
 */

import { useTranslation } from 'react-i18next';
import Icon from '../../../../shared/components/Icon';
import './TopicsTreemap.css';

// ── Blue palette dam → nhat theo design system ───────────────────────────────
const BLUE_SHADES = [
  '#1565C0',
  '#1976D2',
  '#1E88E5',
  '#2196F3',
  '#42A5F5',
  '#90CAF9',
];

// ── Format so citations ───────────────────────────────────────────────────────
function fmtCites(n) {
  if (!n && n !== 0) return '0';
  if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
  return Number(n).toLocaleString('en-US');
}

// ── Rut gon ten bai bao ───────────────────────────────────────────────────────
function shortTitle(title, maxLen = 40) {
  if (!title) return '—';
  return title.length > maxLen ? title.substring(0, maxLen) + '...' : title;
}

const MAX_MAIN = 6;

export default function TopicsTreemap({ articles = [], loading = false }) {
  const { t } = useTranslation();

  // ── Skeleton ─────────────────────────────────────────────────────────────
  if (loading) {
    return <div className="ttm-skeleton skeleton-shimmer" />;
  }

  // ── Empty state ───────────────────────────────────────────────────────────
  if (!articles.length) {
    return (
      <div className="ttm-empty">
        <Icon icon="lucide:grid" className="ttm-empty-icon" />
        <p className="ttm-empty-text">{t('noTopicData')}</p>
      </div>
    );
  }

  // ── Sort theo citation_count DESC, lay top 6 ─────────────────────────────
  const sorted = [...articles]
    .sort((a, b) => (b.citation_count || 0) - (a.citation_count || 0));

  const mainArticles = sorted.slice(0, MAX_MAIN);
  const otherCount   = sorted.length - MAX_MAIN;
  const totalCites   = sorted.reduce((s, a) => s + (a.citation_count || 0), 0);

  return (
    <div>
      <div className="ttm-wrapper">

        {/* ── Top 6 bai bao ───────────────────────────────────────── */}
        {mainArticles.map((article, i) => {
          const cites    = article.citation_count || 0;
          const pct      = totalCites > 0
            ? Math.round((cites / totalCites) * 100)
            : Math.round(100 / sorted.length);

          const bgColor    = BLUE_SHADES[i] || BLUE_SHADES[BLUE_SHADES.length - 1];
          const textColor  = i >= 4 ? '#1565C0' : '#ffffff';
          const subColor   = i >= 4 ? 'rgba(21,101,192,0.75)' : 'rgba(255,255,255,0.85)';

          return (
            <div
              key={article.article_id ? String(article.article_id) : String(i)}
              className="ttm-cell"
              style={{ backgroundColor: bgColor, flexGrow: 1, flexBasis: '14%' }}
              title={article.title}
            >
              <div className="ttm-cell-content">
                <div className="ttm-cell-name" style={{ color: textColor }}>
                  {shortTitle(article.title, 35)}
                </div>
                <div className="ttm-cell-pct" style={{ color: subColor }}>
                  {String(pct) + '% (' + fmtCites(cites) + ' cites)'}
                </div>
              </div>
            </div>
          );
        })}

        {/* ── O "Others" ──────────────────────────────────────────── */}
        {otherCount > 0 && (
          <div
            className="ttm-cell others"
            style={{ flexGrow: 1, flexBasis: '100%' }}
            title={String(otherCount) + ' more articles'}
          >
            <div className="ttm-cell-content">
              <div className="ttm-cell-name ttm-cell-name--others">
                {t('others') || 'Others'}
              </div>
              <div className="ttm-cell-pct ttm-cell-pct--others">
                {String(otherCount) + ' ' + (t('articlesFound') || 'articles')}
              </div>
            </div>
          </div>
        )}

      </div>

      {/* ── Ghi chu duoi treemap ─────────────────────────────────── */}
      <p className="ttm-footnote">{t('areaProportional')}</p>
    </div>
  );
}