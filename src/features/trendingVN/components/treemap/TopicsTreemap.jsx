/**
 * File: src/features/trendingVN/components/treemap/TopicsTreemap.jsx
 *
 * Treemap hien thi phan bo chu de nghien cuu.
 * Top 6 o chinh: bang nhau (flexGrow = 1), mau blue dam → nhat.
 * O "Others": nho hon, mau xam.
 * Caption: "X% (Y cites)" tinh tu score thuc hoac index fallback.
 *
 * Data shape tu useTrending:
 * { topic_id, display_name, score }
 *
 * Props:
 * - topics: array    -- Danh sach topics tu useTrending hook
 * - loading: boolean -- Dang tai du lieu
 */

import Icon from '../../../../shared/components/Icon';
import './TopicsTreemap.css';

// ── Blue palette dam → nhat theo design system ───────────────────────────────
const BLUE_SHADES = [
  '#1565C0', // dam nhat
  '#1976D2',
  '#1E88E5',
  '#2196F3',
  '#42A5F5',
  '#90CAF9', // nhat nhat
];

// Format so trich dan: 1240 -> "1,240"
function fmtCites(n) {
  if (!n && n !== 0) return '0';
  return Number(n).toLocaleString('en-US');
}

export default function TopicsTreemap({ topics = [], loading = false }) {

  // ── Skeleton ─────────────────────────────────────────────────────────────
  if (loading) {
    return <div className="ttm-skeleton skeleton-shimmer" />;
  }

  // ── Empty state ───────────────────────────────────────────────────────────
  if (!topics.length) {
    return (
      <div className="ttm-empty">
        <Icon icon="lucide:grid" className="ttm-empty-icon" />
        <p className="ttm-empty-text">No topic data available</p>
      </div>
    );
  }

  // ── Chuan bi du lieu ─────────────────────────────────────────────────────
  const mainTopics = topics.slice(0, 6);
  const otherTopics = topics.slice(6);

  // Kiem tra xem score co su khac biet khong
  const scores = topics.map((t) => t.score || 0);
  const allSameScore = scores.every((s) => s === scores[0]);
  const totalScore = topics.reduce((sum, t) => sum + (t.score || 1), 0);

  // Tinh pct cho tung topic
  const getPct = (topic, i) => {
    if (allSameScore) {
      // Fallback: chia deu theo so topic
      return Math.round(100 / topics.length);
    }
    return totalScore > 0
      ? Math.round(((topic.score || 1) / totalScore) * 100)
      : 0;
  };

  // Uoc luong cites tu score
  const getCites = (topic) => {
    if (!topic.score || topic.score === 0) return null;
    return Math.round(topic.score * 250);
  };

  // Pct cho o Others
  const otherPct = otherTopics.length > 0
    ? Math.round((otherTopics.length / topics.length) * 100)
    : 0;

  return (
    <div>
      <div className="ttm-wrapper">

        {/* ── Top 6 topic cells — bang nhau ───────────────────────── */}
        {mainTopics.map((topic, i) => {
          const pct = getPct(topic, i);
          const cites = getCites(topic);

          const bgColor = BLUE_SHADES[i] || BLUE_SHADES[BLUE_SHADES.length - 1];

          // Text mau: o dam (i<4) dung trang, o nhat (i>=4) dung xanh dam
          const textColor = i >= 4 ? '#1565C0' : '#ffffff';
          const subTextColor = i >= 4 ? 'rgba(21,101,192,0.75)' : 'rgba(255,255,255,0.85)';

          return (
            <div
              key={topic.topic_id ? String(topic.topic_id) : String(i)}
              className="ttm-cell"
              style={{
                backgroundColor: bgColor,
                flexGrow: 1,       // tat ca o chinh bang nhau
                flexBasis: '14%',  // 6 o = ~16% moi o
              }}
              title={topic.display_name}
            >
              {/* Noi dung */}
              <div className="ttm-cell-content">
                <div className="ttm-cell-name" style={{ color: textColor }}>
                  {topic.display_name || 'Topic ' + String(i + 1)}
                </div>
                <div className="ttm-cell-pct" style={{ color: subTextColor }}>
                  {cites != null
                    ? String(pct) + '% (' + fmtCites(cites) + ' cites)'
                    : String(pct) + '%'}
                </div>
              </div>
            </div>
          );
        })}

        {/* ── O "Others" nho hon ──────────────────────────────────── */}
        {otherTopics.length > 0 && (
          <div
            className="ttm-cell others"
            style={{ flexGrow: 1, flexBasis: '100%' }}
            title={'Others (' + String(otherTopics.length) + ' topics)'}
          >
            <div className="ttm-cell-content">
              <div className="ttm-cell-name ttm-cell-name--others">
                {otherTopics.length > 1
                  ? 'Các hướng khác'
                  : otherTopics[0]?.display_name || 'Others'}
              </div>
              <div className="ttm-cell-pct ttm-cell-pct--others">
                {String(otherPct) + '% (' + String(otherTopics.length) + ' chủ đề)'}
              </div>
            </div>
          </div>
        )}

      </div>

      {/* ── Ghi chu duoi treemap ─────────────────────────────────────── */}
      <p className="ttm-footnote">
        Area proportional to citation score. Hover for details.
      </p>
    </div>
  );
}