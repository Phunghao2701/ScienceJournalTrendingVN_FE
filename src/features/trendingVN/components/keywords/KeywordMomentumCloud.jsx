/**
 * KeywordMomentumCloud: horizontal bar chart showing top 7 keywords by citation momentum.
 *
 * File: src/features/trendingVN/components/keywords/KeywordMomentumCloud.jsx
 *
 * Despite the name this renders a statistical bar chart, not a word cloud.
 * Each bar has an X-axis with "nice" tick values (1/2/5 x 10^n scale) and
 * a numeric label at the bar tip when real data is available.
 *
 * Value priority (see getValues):
 *   1. total_citations  -- used when any item has a non-zero value
 *   2. article_count    -- fallback when no citation data
 *   3. index weight     -- last resort when all counts are zero (preserves BE sort order)
 *
 * Data shape per item: { keyword_id, display_name, article_count, total_citations? }
 *
 * Props:
 * - keywords: array -- Keyword list from useTrending hook
 */

import { useTranslation } from 'react-i18next';
import './KeywordMomentumCloud.css';

const MAX_KEYWORDS = 7;

// Return an array of numeric values used to scale bars (one per keyword entry)
function getValues(keywords) {
  // Prefer total_citations (new trending/keywords endpoint)
  const hasCitations = keywords.some((kw) => (kw.total_citations || 0) > 0);
  if (hasCitations) return keywords.map((kw) => kw.total_citations || 0);

  // Fallback: article_count
  const hasCount = keywords.some((kw) => (kw.article_count || 0) > 0);
  if (hasCount) return keywords.map((kw) => kw.article_count || 0);

  // Last resort: use index weight so bars are non-zero (preserves BE sort order)
  return keywords.map((_, i) => MAX_KEYWORDS - i);
}

// Format number for bar tip labels (e.g. 1500000 -> "1.5M", 2300 -> "2.3K")
function fmtVal(n) {
  if (!n || n === 0) return '';
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
  if (n >= 1000)    return (n / 1000).toFixed(1)    + 'K';
  return String(n);
}

// Round a rough step to a "nice" value (1/2/5 x 10^n) so X-axis ticks are round numbers
function getNiceStep(roughStep) {
  const magnitude   = Math.pow(10, Math.floor(Math.log10(roughStep)));
  const residual     = roughStep / magnitude;
  let niceResidual;
  if (residual > 5)      niceResidual = 10;
  else if (residual > 2) niceResidual = 5;
  else if (residual > 1) niceResidual = 2;
  else                   niceResidual = 1;
  return niceResidual * magnitude;
}

// Compute X-axis tick values; axisMax is always >= maxVal so bars never exceed the axis
function getXTicks(maxVal) {
  if (maxVal <= 0) return [0];
  const step = getNiceStep(maxVal / 4) || 1;
  const axisMax = Math.ceil(maxVal / step) * step;
  const ticks = [];
  for (let v = 0; v <= axisMax; v += step) ticks.push(v);
  return ticks;
}

export default function KeywordMomentumCloud({ keywords = [] }) {
  const { t } = useTranslation();

  // -- Empty state --
  if (!keywords.length) {
    return (
      <div className="kmc-empty">
        <p className="kmc-empty-text">{t('noKeywordData')}</p>
      </div>
    );
  }

  // Sort by best available value and take top 7
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

      {/* Chart area */}
      <div className="kmc-chart">

        {/* Bar rows */}
        <div className="kmc-bars">
          {sorted.map((kw, i) => {
            const val    = values[i];
            const pct    = (val / axisMax) * 100;
            const label  = fmtVal(val);

            return (
              <div key={kw.keyword_id || i} className="kmc-bar-row">

                {/* Keyword label */}
                <div className="kmc-bar-label" title={kw.display_name}>
                  {kw.display_name}
                </div>

                {/* Bar fill + value label at tip */}
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

        {/* X-axis tick marks */}
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

      {/* Footer: total keyword count */}
      <div className="kmc-footer">
        <span className="kmc-footer-label">{t('totalKeywordsLabel')}</span>
        <span className="kmc-footer-value">{keywords.length.toLocaleString('en-US')}</span>
      </div>

    </div>
  );
}