/**
 * File: src/features/trendingVN/components/keywords/KeywordMomentumCloud.jsx
 *
 * Horizontal bar chart kieu bieu do thong ke - Top 7 Keywords.
 * Co truc X voi scale, so hien thi o dau bar, bar day.
 * Hien tai dung index fallback khi article_count = 0.
 * Khi BE co total_citations -> tu dong dung gia tri thuc.
 *
 * Data shape: { keyword_id, display_name, article_count, total_citations? }
 *
 * Props:
 * - keywords: array -- Danh sach keyword tu API
 */

import { useTranslation } from 'react-i18next';
import './KeywordMomentumCloud.css';

const MAX_KEYWORDS = 7;

// ── Lay gia tri de scale bar ──────────────────────────────────────────────────
function getValues(keywords) {
  // Uu tien total_citations (endpoint moi trending/keywords)
  const hasCitations = keywords.some((kw) => (kw.total_citations || 0) > 0);
  if (hasCitations) return keywords.map((kw) => kw.total_citations || 0);

  // Fallback: article_count
  const hasCount = keywords.some((kw) => (kw.article_count || 0) > 0);
  if (hasCount) return keywords.map((kw) => kw.article_count || 0);

  // Fallback cuoi: index weight (thu tu BE sap xep)
  return keywords.map((_, i) => MAX_KEYWORDS - i);
}

// ── Format so tren dau bar ────────────────────────────────────────────────────
function fmtVal(n) {
  if (!n || n === 0) return '';
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
  if (n >= 1000)    return (n / 1000).toFixed(1)    + 'K';
  return String(n);
}

// ── Tinh tick labels cho truc X ──────────────────────────────────────────────
function getXTicks(maxVal) {
  const ticks = [0];
  const step  = Math.ceil(maxVal / 4 / 10) * 10 || 1;
  for (let v = step; v <= maxVal; v += step) ticks.push(v);
  if (ticks[ticks.length - 1] < maxVal) ticks.push(Math.ceil(maxVal / step) * step);
  return ticks;
}

export default function KeywordMomentumCloud({ keywords = [] }) {
  const { t } = useTranslation();

  // ── Empty state ───────────────────────────────────────────────────────────
  if (!keywords.length) {
    return (
      <div className="kmc-empty">
        <p className="kmc-empty-text">{t('noKeywordData')}</p>
      </div>
    );
  }

  // ── Sap xep + lay top 7 ──────────────────────────────────────────────────
  const sorted = [...keywords]
    .sort((a, b) => {
      const bv = b.total_citations || b.article_count || 0;
      const av = a.total_citations || a.article_count || 0;
      return bv - av;
    })
    .slice(0, MAX_KEYWORDS);

  const values      = getValues(sorted);
  const maxVal      = Math.max(...values, 1);
  const xTicks      = getXTicks(maxVal);
  const axisMax     = xTicks[xTicks.length - 1];
  const hasRealData = sorted.some((kw) => (kw.total_citations || kw.article_count || 0) > 0);

  return (
    <div className="kmc-wrapper">

      {/* ── Chart area ───────────────────────────────────────────── */}
      <div className="kmc-chart">

        {/* ── Cac dong bar ─────────────────────────────────────── */}
        <div className="kmc-bars">
          {sorted.map((kw, i) => {
            const val    = values[i];
            const pct    = (val / axisMax) * 100;
            const label  = fmtVal(val);

            return (
              <div key={kw.keyword_id || i} className="kmc-bar-row">

                {/* Ten keyword */}
                <div className="kmc-bar-label" title={kw.display_name}>
                  {kw.display_name}
                </div>

                {/* Bar + so o dau */}
                <div className="kmc-bar-track">
                  <div
                    className="kmc-bar-fill"
                    style={{ width: String(pct) + '%' }}
                  >
                    {hasRealData && label && (
                      <span className="kmc-bar-tip">{label}</span>
                    )}
                  </div>
                </div>

              </div>
            );
          })}
        </div>

        {/* ── Truc X ───────────────────────────────────────────── */}
        <div className="kmc-x-axis">
          {xTicks.map((tick) => (
            <span
              key={tick}
              className="kmc-x-tick"
              style={{ left: String((tick / axisMax) * 100) + '%' }}
            >
              {fmtVal(tick) || '0'}
            </span>
          ))}
        </div>

      </div>

      {/* ── Footer ───────────────────────────────────────────────── */}
      <div className="kmc-footer">
        <span className="kmc-footer-label">{t('totalKeywordsLabel')}</span>
        <span className="kmc-footer-value">{keywords.length.toLocaleString('en-US')}</span>
      </div>

    </div>
  );
}