/**
 * File: src/features/trendingVN/components/keywords/KeywordMomentumCloud.jsx
 *
 * Word cloud hien thi top 10 tu khoa noi bat.
 * Layout: 3 hang, hang tren to + dam, hang duoi nho + nhat dan.
 * Size + mau tinh theo article_count thuc.
 * Neu article_count bang nhau -> dung index lam weight fallback.
 *
 * Data shape: { keyword_id, display_name, article_count }
 *
 * Props:
 * - keywords: array -- Danh sach keyword tu API
 */

import './KeywordMomentumCloud.css';

// ── Cau hinh hang hien thi ────────────────────────────────────────────────────
// Moi hang co so luong keyword va font-size rieng
const ROW_CONFIG = [
  { count: 3, fontRem: 1.65, colorClass: 'kmc-word--primary'   }, // hang 1: 3 tu, lon nhat
  { count: 4, fontRem: 1.1,  colorClass: 'kmc-word--secondary' }, // hang 2: 4 tu, trung
  { count: 3, fontRem: 0.78, colorClass: 'kmc-word--muted'     }, // hang 3: 3 tu, nho nhat
];
const MAX_KEYWORDS = 10;

export default function KeywordMomentumCloud({ keywords = [] }) {

  // ── Empty state ───────────────────────────────────────────────────────────
  if (!keywords.length) {
    return (
      <div className="kmc-empty">
        <p className="kmc-empty-text">No keyword data available</p>
      </div>
    );
  }

  // ── Lay top 10, sap xep theo article_count giam dan ─────────────────────
  const sorted = [...keywords]
    .sort((a, b) => (b.article_count || 0) - (a.article_count || 0))
    .slice(0, MAX_KEYWORDS);

  const totalKeywords = keywords.length;

  // ── Chia keyword vao tung hang ───────────────────────────────────────────
  const rows = [];
  let idx = 0;
  for (const rowConf of ROW_CONFIG) {
    const rowItems = sorted.slice(idx, idx + rowConf.count);
    if (rowItems.length > 0) {
      rows.push({ ...rowConf, items: rowItems });
    }
    idx += rowConf.count;
  }

  return (
    <div className="kmc-wrapper">

      {/* ── Word cloud: tung hang ────────────────────────────────── */}
      <div className="kmc-rows">
        {rows.map((row, ri) => (
          <div key={ri} className="kmc-row">
            {row.items.map((kw, ki) => (
              <span
                key={kw.keyword_id || ki}
                className={'kmc-word ' + row.colorClass}
                style={{ fontSize: String(row.fontRem) + 'rem' }}
                title={kw.display_name + (kw.article_count ? ' — ' + String(kw.article_count) + ' articles' : '')}
              >
                {kw.display_name}
              </span>
            ))}
          </div>
        ))}
      </div>

      {/* ── Stats footer ─────────────────────────────────────────── */}
      <div className="kmc-stats-divider" />
      <div className="kmc-stats">
        <div className="kmc-stat-item">
          <span className="kmc-stat-label">TOTAL KEYWORDS</span>
          <span className="kmc-stat-value">{totalKeywords.toLocaleString('en-US')}</span>
        </div>
      </div>

    </div>
  );
}