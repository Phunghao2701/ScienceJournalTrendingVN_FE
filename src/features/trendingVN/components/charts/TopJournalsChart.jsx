/**
 * File: src/features/trendingVN/components/charts/TopJournalsChart.jsx
 *
 * Biểu đồ cột (bar chart) hiển thị Top Journals theo số lượng bài báo.
 * Dùng pure div + inline height%, không dùng chart library.
 * Tối đa hiển thị 8 journals để vừa chart.
 *
 * Dữ liệu từ: GET /api/v1/journal
 * Fields dùng: journal_id, display_name, citation_count, article_count
 *
 * Props:
 * - journals: array    -- Danh sách journal từ API
 * - loading: boolean   -- Đang tải dữ liệu
 */

import Icon from '../../../../shared/components/Icon';
import './TopJournalsChart.css';

export default function TopJournalsChart({ journals = [], loading = false }) {

  // ── Skeleton khi đang tải ─────────────────────────────────────────────────
  if (loading) {
    const skeletonHeights = [100, 68, 55, 82, 45, 72, 38, 60];
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
        <p className="tjc-empty-text">Chưa có dữ liệu tạp chí</p>
      </div>
    );
  }

  // ── Chuẩn bị dữ liệu ─────────────────────────────────────────────────────
  const chartData = journals.slice(0, 8);

  // Lấy giá trị để vẽ bar
  // Ưu tiên: citation_count → article_count → journal_id (proxy tạm)
  const getValue = (j) => {
    if (j.citation_count) return j.citation_count;
    if (j.article_count) return j.article_count;
    return j.journal_id || 1;
  };

  const maxVal = Math.max(...chartData.map(getValue));

  return (
    <div className="tjc-wrapper">

      {/* ── Khu vực các cột bar ─────────────────────────────────── */}
      <div className="tjc-bars-area">
        {chartData.map((journal, i) => {
          const val = getValue(journal);
          const heightPct = Math.max((val / maxVal) * 100, 6);

          return (
            <div
              key={journal.journal_id ? String(journal.journal_id) : String(i)}
              className="tjc-bar-col"
              title={journal.display_name}
            >
              {/* Giá trị trên đỉnh cột */}
              <span className="tjc-bar-value">
                {val.toLocaleString('vi-VN')}
              </span>

              {/* Thân cột */}
              <div
                className="tjc-bar"
                style={{ height: String(heightPct) + '%' }}
              />
            </div>
          );
        })}
      </div>

      {/* ── Labels tên journal bên dưới ─────────────────────────── */}
      <div className="tjc-labels-area">
        {chartData.map((journal, i) => (
          <div key={String(i)} className="tjc-bar-label">
            {journal.display_name
              ? journal.display_name.split(' ').slice(0, 2).join(' ')
              : 'J' + String(i + 1)}
          </div>
        ))}
      </div>

    </div>
  );
}