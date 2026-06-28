/**
 * File source thuộc hệ thống FE ResearchPulse.
 *
 * File: features\article\components\ArticleTableRow.jsx
 */
import { Button } from 'react-bootstrap';
import { Icon } from '@iconify/react';
import { useNavigate } from 'react-router-dom';

export default function ArticleTableRow({ article, index, onDetailClick, isSelected, onSelect }) {
  const navigate = useNavigate();

  // Helper to assign colors to topics
  const getTopicClassName = (topic) => {
    if (!topic) return '';
    const name = String(topic).toLowerCase();
    if (name.includes('machine learning') || name.includes('ml')) {
      return 'article-topic-badge--ml';
    }
    if (name.includes('computer science') || name.includes('cs')) {
      return 'article-topic-badge--cs';
    }
    if (name.includes('medicine') || name.includes('bio')) {
      return 'article-topic-badge--medicine';
    }
    if (name.includes('physic')) {
      return 'article-topic-badge--physics';
    }
    return 'article-topic-badge--other';
  };

  const topicClassName = getTopicClassName(article.primary_topic);

  // Copy DOI link to clipboard
  const handleCopyDoi = (e, doi) => {
    e.stopPropagation();
    if (!doi) return;
    navigator.clipboard.writeText(doi);
    alert('Đã sao chép mã DOI vào bộ nhớ tạm: ' + doi);
  };

  const handleJournalClick = (e, journalId) => {
    e.stopPropagation();
    if (journalId) {
      navigate(`/journals/${journalId}`);
    }
  };

  return (
    <tr 
      onClick={() => onDetailClick(article.article_id)}
      style={{
        cursor: 'pointer',
        borderBottom: '1px solid var(--border)',
        transition: 'all 0.15s'
      }}
      className="align-middle article-table-row"
    >
      {/* Checkbox Column */}
      <td className="text-center" style={{ width: '45px' }} onClick={(e) => e.stopPropagation()}>
        <input 
          type="checkbox" 
          className="lens-checkbox" 
          style={{ cursor: onSelect ? 'pointer' : 'not-allowed' }}
          checked={isSelected || false}
          disabled={!onSelect}
          onChange={() => onSelect && onSelect(article.article_id)}
        />
      </td>

      {/* Article Title */}
      <td style={{ maxWidth: '400px' }} className="py-3">
        <div 
          className="text-main font-weight-semibold hover:text-primary transition-colors duration-150 text-xs"
          style={{ 
            lineHeight: '1.4', 
            fontWeight: 600,
            overflow: 'hidden',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical'
          }}
        >
          {article.title}
        </div>
        {article.abstract && (
          <div 
            className="text-muted-custom mt-1" 
            style={{ 
              fontWeight: 400,
              fontSize: '0.68rem',
              overflow: 'hidden',
              display: '-webkit-box',
              WebkitLineClamp: 1,
              WebkitBoxOrient: 'vertical'
            }}
          >
            {article.abstract}
          </div>
        )}
      </td>

      {/* Identifiers Column (DOI + ISSN) */}
      <td style={{ width: '180px' }}>
        {article.doi ? (
          <div className="d-flex align-items-center gap-1">
            <Icon icon="lucide:globe" className="text-primary" width="13" />
            <span className="text-muted-custom text-xs font-monospace text-truncate d-block" style={{ maxWidth: '140px' }} title={article.doi}>
              {article.doi}
            </span>
          </div>
        ) : (
          <span className="text-muted text-xs">—</span>
        )}
        {(article.journal_issn || article.journal?.issn) && (
          <div className="d-flex align-items-center gap-1 mt-1">
            <Icon icon="lucide:book-open" className="text-muted" width="13" />
            <span className="text-muted-custom text-xs font-monospace text-truncate d-block" style={{ maxWidth: '140px' }}>
              {article.journal_issn || article.journal?.issn}
            </span>
          </div>
        )}
      </td>

      {/* Topic Badge */}
      <td style={{ width: '140px' }}>
        <span className={`article-topic-badge ${topicClassName}`} style={{ fontSize: '0.68rem', padding: '0.2rem 0.4rem' }}>
          {article.primary_topic || 'Chưa phân loại'}
        </span>
      </td>

      {/* Publication Year */}
      <td className="text-center font-display" style={{ width: '90px', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
        {article.publication_year}
      </td>

      {/* Open Access */}
      <td className="text-center" style={{ width: '90px' }}>
        {article.is_open_access ? (
          <span className="article-oa-badge" style={{ fontSize: '0.68rem', padding: '0.2rem 0.4rem' }}>
            OA
          </span>
        ) : (
          <span className="text-muted-custom text-xs">—</span>
        )}
      </td>

      {/* Journal Column */}
      <td>
        {article.journal_id || article.journal?.journal_id ? (
          <div 
            onClick={(e) => handleJournalClick(e, article.journal_id || article.journal?.journal_id)}
            className="text-main hover:text-primary text-xs text-truncate"
            style={{ textDecoration: 'none', cursor: 'pointer', fontWeight: 500, maxWidth: '180px' }}
            title={article.journal_name || article.journal?.display_name}
          >
            {article.journal_name || article.journal?.display_name || 'Chưa có thông tin journal'}
          </div>
        ) : (
          <span className="text-muted text-xs">Chưa có thông tin journal</span>
        )}
      </td>

      {/* Actions */}
      <td className="text-end pe-3" style={{ width: '100px', whiteSpace: 'nowrap' }}>
        <span
          className="article-action-link d-flex align-items-center justify-content-end gap-0.5"
          style={{ whiteSpace: 'nowrap' }}
        >
          Chi tiết
          <Icon icon="lucide:arrow-right" width="12" />
        </span>
      </td>

    </tr>
  );
}
