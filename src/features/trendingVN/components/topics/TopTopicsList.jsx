/**
 * File: src/features/trendingVN/components/topics/TopTopicsList.jsx
 *
 * Component hiển thị danh sách Top Chủ đề Nghiên cứu nổi bật (ranked list).
 * Mỗi dòng gồm: số thứ tự, tên topic, thanh progress và điểm score.
 * Hiển thị tối đa 10 topics, xếp hạng theo score từ cao xuống thấp.
 *
 * Dữ liệu từ: GET /api/v1/topics?sort_by=score&sort_order=desc
 * Fields dùng: topic_id, display_name, score
 *
 * Props:
 * - topics: array    -- Danh sách topic từ API
 * - loading: boolean -- Đang tải dữ liệu
 */

import Icon from '../../../../shared/components/Icon';
import './TopTopicsList.css';

export default function TopTopicsList({ topics = [], loading = false }) {

  // ── Skeleton khi đang tải ─────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="ttl-skeleton-list">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="ttl-skeleton-row skeleton-shimmer" />
        ))}
      </div>
    );
  }

  // ── Empty state ───────────────────────────────────────────────────────────
  if (!topics.length) {
    return (
      <div className="ttl-empty">
        <Icon icon="lucide:layers" className="ttl-empty-icon" />
        <p className="ttl-empty-text">Chưa có dữ liệu chủ đề nghiên cứu</p>
      </div>
    );
  }

  // ── Chuẩn bị dữ liệu ─────────────────────────────────────────────────────
  const listData = topics.slice(0, 10);
  const maxScore = Math.max(...listData.map((t) => t.score || 1));

  return (
    <div>
      {listData.map((topic, i) => {
        const score = topic.score || 0;
        const progressPct = maxScore > 0 ? (score / maxScore) * 100 : 0;
        const rankClass = 'ttl-rank' + (i < 3 ? ' top-three' : '');

        return (
          <div key={topic.topic_id ? String(topic.topic_id) : String(i)} className="ttl-row">

            {/* ── Số thứ tự ───────────────────────────────────────── */}
            <span className={rankClass}>{i + 1}</span>

            {/* ── Tên topic ───────────────────────────────────────── */}
            <span className="ttl-name" title={topic.display_name}>
              {topic.display_name || 'Topic ' + String(topic.topic_id)}
            </span>

            {/* ── Thanh progress ──────────────────────────────────── */}
            <div className="ttl-bar-wrapper">
              <div
                className="ttl-bar-fill"
                style={{ width: String(progressPct) + '%' }}
              />
            </div>

            {/* ── Điểm score ──────────────────────────────────────── */}
            <span className="ttl-score">
              {score ? Number(score).toFixed(1) : '—'}
            </span>

          </div>
        );
      })}
    </div>
  );
}