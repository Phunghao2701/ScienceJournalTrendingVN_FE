/**
 * TopTopicsList: ranked list of the top research topics by score.
 *
 * File: src/features/trendingVN/components/topics/TopTopicsList.jsx
 *
 * Each row shows: rank number | topic name | progress bar | score value.
 * Maximum 10 topics rendered; topics array should be pre-sorted score DESC.
 *
 * Data source: GET /api/v1/topics?sort_by=score&sort_order=desc
 * Fields used: topic_id, display_name, score
 *
 * Props:
 * - topics: array    -- Topic list from API (pre-sorted score descending)
 * - loading: boolean -- Show skeleton while loading
 */

import Icon from '../../../../shared/components/Icon';
import './TopTopicsList.css';

export default function TopTopicsList({ topics = [], loading = false }) {

  // -- Skeleton --
  if (loading) {
    return (
      <div className="ttl-skeleton-list">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="ttl-skeleton-row skeleton-shimmer" />
        ))}
      </div>
    );
  }

  // -- Empty state --
  if (!topics.length) {
    return (
      <div className="ttl-empty">
        <Icon icon="lucide:layers" className="ttl-empty-icon" />
        <p className="ttl-empty-text">Chưa có dữ liệu chủ đề nghiên cứu</p>
      </div>
    );
  }

  // -- Prepare list data --
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

            {/* Rank number */}
            <span className={rankClass}>{i + 1}</span>

            {/* Topic name */}
            <span className="ttl-name" title={topic.display_name}>
              {topic.display_name || 'Topic ' + String(topic.topic_id)}
            </span>

            {/* Progress bar (width proportional to score relative to max) */}
            <div className="ttl-bar-wrapper">
              <div
                className="ttl-bar-fill"
                style={{ width: String(progressPct) + '%' }}
              />
            </div>

            {/* Score value */}
            <span className="ttl-score">
              {score ? Number(score).toFixed(1) : '—'}
            </span>

          </div>
        );
      })}
    </div>
  );
}