/**
 * File: src/features/trendingVN/components/authors/TopAuthorsList.jsx
 *
 * Bang xep hang tac gia anh huong nhat.
 * Layout theo mau: rank | ten + uni-badge | bar + score so lon.
 * Score hien thi so don gian (VD: 98.4), bar theo ti le.
 *
 * Data: GET /api/v1/author/leaderboard
 * Fields: author_id, display_name, url_image,
 *         works_count, cited_by_count, h_index, i10_index, final_rank
 *
 * Props:
 * - authors: array    -- Danh sach tac gia tu API
 * - loading: boolean  -- Dang tai du lieu
 */

import Icon from '../../../../shared/components/Icon';
import './TopAuthorsList.css';

// ── Format so lon gon ────────────────────────────────────────────────────────
function fmtCount(num) {
  if (!num && num !== 0) return '0';
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
  return String(num);
}

// ── Tinh score hien thi (0-100) tu cited_by_count ───────────────────────────
function calcScore(cited, maxCited) {
  if (!maxCited || maxCited === 0) return 0;
  return +((cited / maxCited) * 100).toFixed(1);
}

// ── Mau badge university theo index (giong TopUniversitiesGrid) ──────────────
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

// ── Avatar tac gia ───────────────────────────────────────────────────────────
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

  // ── Skeleton ─────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="tal-skeleton-list">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="tal-skeleton-row skeleton-shimmer" />
        ))}
      </div>
    );
  }

  // ── Empty state ───────────────────────────────────────────────────────────
  if (!authors.length) {
    return (
      <div className="tal-empty">
        <Icon icon="lucide:users" className="tal-empty-icon" />
        <p className="tal-empty-text">No author data available</p>
      </div>
    );
  }

  // ── Chuan bi du lieu ─────────────────────────────────────────────────────
  const listData = authors.slice(0, 5);
  const maxCited = Math.max(...listData.map((a) => a.cited_by_count || 0), 1);

  return (
    <div className="tal-list">
      {listData.map((author, i) => {
        const cited = author.cited_by_count || 0;
        const score = calcScore(cited, maxCited);
        const barPct = (cited / maxCited) * 100;
        const rank = author.final_rank || i + 1;

        // University badge — dung initials ten tac gia lam placeholder
        // khi BE co field last_known_institution thi thay vao day
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
            {/* ── So thu hang ─────────────────────────────────────── */}
            <span className={'tal-rank' + (i < 3 ? ' tal-rank--top' : '')}>
              {String(rank).padStart(2, '0')}
            </span>

            {/* ── Ten tac gia + uni badge ──────────────────────────── */}
            <div className="tal-info">
              <div className="tal-name-row">
                <span className="tal-name" title={author.display_name}>
                  {author.display_name || 'Author ' + String(i + 1)}
                </span>
                <span
                  className="tal-uni-badge"
                  style={{ backgroundColor: uniColor.bg, color: uniColor.text }}
                  title={uniName || 'University'}
                >
                  {uniBadgeText}
                </span>
              </div>

              {/* Bar hien thi ti le cited_by_count ─────────────────── */}
              <div className="tal-bar-wrapper">
                <div
                  className="tal-bar-fill"
                  style={{ width: String(barPct) + '%' }}
                />
              </div>
            </div>

            {/* ── Score so lon ben phai ────────────────────────────── */}
            <span className="tal-score">{score}</span>

          </div>
        );
      })}
    </div>
  );
}
