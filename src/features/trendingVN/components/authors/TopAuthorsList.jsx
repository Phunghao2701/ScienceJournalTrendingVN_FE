/**
 * TopAuthorsList: ranked list of the most influential authors.
 *
 * File: src/features/trendingVN/components/authors/TopAuthorsList.jsx
 *
 * Layout per row: rank number | name + university badge | citation bar | score.
 * Score is normalized 0-100 relative to the highest cited_by_count in the list.
 * Bar width is proportional to cited_by_count of the top author.
 *
 * Data: GET /api/v1/author/leaderboard (via useTrending.fetchAuthors)
 * Fields used: author_id, display_name, url_image,
 *              works_count, cited_by_count, h_index, i10_index, final_rank
 *
 * Props:
 * - authors: array    -- Author list from API (up to 5 shown)
 * - loading: boolean  -- Show skeleton while loading
 */

import { useTranslation } from 'react-i18next';
import Icon from '../../../../shared/components/Icon';
import './TopAuthorsList.css';

// Format large numbers compactly (e.g. 1200000 -> "1.2M", 3500 -> "3.5k")
function fmtCount(num) {
  if (!num && num !== 0) return '0';
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
  return String(num);
}

// Normalize cited_by_count to a 0-100 display score relative to the list max
function calcScore(cited, maxCited) {
  if (!maxCited || maxCited === 0) return 0;
  return +((cited / maxCited) * 100).toFixed(1);
}

// Badge colors for university pills, cycling by author index (same palette as TopUniversitiesGrid)
const UNI_BADGE_COLORS = [
  { bg: '#EAF4FF', text: '#1565C0' }, // blue nhat
  { bg: '#EDE9FE', text: '#6D28D9' }, // tim nhat
  { bg: '#D1FAE5', text: '#065F46' }, // xanh la nhat
  { bg: '#FEF3C7', text: '#92400E' }, // vang nhat
  { bg: '#FEE2E2', text: '#991B1B' }, // do nhat
  { bg: '#F0FDF4', text: '#166534' }, // xanh la nhat 2
  { bg: '#E0F2FE', text: '#0369A1' }, // sky nhat
  { bg: '#FDF4FF', text: '#7E22CE' }, // violet nhat
];

// Author avatar: shows url_image if available, otherwise renders initials
function AuthorAvatar({ urlImage, displayName }) {
  const initials = displayName
    ? displayName.split(' ').filter(Boolean).slice(0, 2).map((p) => p[0]).join('').toUpperCase()
    : '?';

  if (urlImage) {
    return (
      <div className="tal-avatar">
        <img src={urlImage} alt={displayName} />
      </div>
    );
  }
  return (
    <div className="tal-avatar">
      <span className="tal-avatar-initials">{initials}</span>
    </div>
  );
}

export default function TopAuthorsList({ authors = [], loading = false }) {
  const { t } = useTranslation();

  // -- Skeleton --
  if (loading) {
    return (
      <div className="tal-skeleton-list">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="tal-skeleton-row skeleton-shimmer" />
        ))}
      </div>
    );
  }

  // -- Empty state --
  if (!authors.length) {
    return (
      <div className="tal-empty">
        <Icon icon="lucide:users" className="tal-empty-icon" />
        <p className="tal-empty-text">No author data available</p>
      </div>
    );
  }

  // Slice to top 5 and find the max cited_by_count for bar scaling
  const listData = authors.slice(0, 5);
  const maxCited = Math.max(...listData.map((a) => a.cited_by_count || 0), 1);

  return (
    <div className="tal-list">
      {listData.map((author, i) => {
        const cited = author.cited_by_count || 0;
        const score = calcScore(cited, maxCited);
        const barPct = (cited / maxCited) * 100;
        const rank = author.rank || author.final_rank || i + 1;

        // University badge: use last_known_institution when available; fall back to initials placeholder
        const uniName = author.last_known_institution || null;
        const uniBadgeText = uniName
          ? uniName.split(' ').filter(Boolean).slice(0, 2).map((p) => p[0]).join('').toUpperCase()
          : 'UNI';
        const uniColor = UNI_BADGE_COLORS[i % UNI_BADGE_COLORS.length];

        return (
          <div
            key={author.author_id ? String(author.author_id) : String(i)}
            className="tal-row"
          >
            {/* Rank number */}
            <span className={'tal-rank' + (i < 3 ? ' tal-rank--top' : '')}>
              {String(rank).padStart(2, '0')}
            </span>

            {/* Author name and university badge */}
            <div className="tal-info">
              <div className="tal-name-row">
                <span className="tal-name" title={author.display_name}>
                  {author.display_name || 'Author ' + String(i + 1)}
                </span>
                <span
                  className="tal-uni-badge"
                  style={{ backgroundColor: uniColor.bg, color: uniColor.text }}
                  title={uniName || t('topUniversitiesTitle')}
                >
                  {uniBadgeText}
                </span>
              </div>

              {/* Citation bar (width proportional to cited_by_count) */}
              <div className="tal-bar-wrapper">
                <div
                  className="tal-bar-fill"
                  style={{ width: String(barPct) + '%' }}
                />
              </div>
            </div>

            {/* Normalized score (right column) */}
            <span className="tal-score">{score}</span>

          </div>
        );
      })}
    </div>
  );
}