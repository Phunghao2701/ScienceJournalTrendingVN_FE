/**
 * ResearchPulse FE source file.
 *
 * File: features\article\components\ArticleTableRow.jsx
 */
import { Button } from 'react-bootstrap';
import { Icon } from '@iconify/react';
import { useNavigate } from 'react-router-dom';
import ScientificMathText from '../../../shared/components/ScientificMathText';
import { toScientificPlainText } from '../../../shared/utils/scientificMath';

export default function ArticleTableRow({ article, index, onDetailClick }) {
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
    alert('Copied DOI to clipboard: ' + doi);
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
      {/* Index */}
      <td className="text-muted-custom ps-3 font-display" style={{ width: '40px', fontSize: '0.8rem' }}>
        {index + 1}
      </td>

      {/* Article Title */}
      <td style={{ maxWidth: '400px' }} className="py-3">
        <div 
          className="text-main font-weight-semibold hover:text-primary transition-colors duration-150 text-sm"
          style={{ 
            lineHeight: '1.4', 
            fontWeight: 600,
            overflow: 'hidden',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical'
          }}
        >
          <ScientificMathText title={article.title_plain || toScientificPlainText(article.title)}>
            {article.title}
          </ScientificMathText>
        </div>
        {article.abstract && (
          <div 
            className="text-muted-custom mt-1 text-xs" 
            style={{ 
              fontWeight: 400,
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

      {/* Journal Name */}
      <td style={{ maxWidth: '180px' }}>
        {article.journal_id || article.journal?.journal_id ? (
          <div 
            onClick={(e) => handleJournalClick(e, article.journal_id || article.journal?.journal_id)}
            className="text-main hover:text-primary text-sm text-truncate"
            style={{ textDecoration: 'none', cursor: 'pointer', fontWeight: 500 }}
            title={article.journal_name || article.journal?.display_name}
          >
            {article.journal_name || article.journal?.display_name || 'Journal information unavailable'}
          </div>
        ) : (
          <span className="text-muted text-xs">Journal information unavailable</span>
        )}
      </td>

      {/* Publication Year */}
      <td className="text-center font-display" style={{ width: '80px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
        {article.publication_year}
      </td>

      {/* DOI */}
      <td style={{ maxWidth: '160px' }}>
        {article.doi ? (
          <div className="d-flex align-items-center gap-1.5">
            <span className="text-muted-custom text-xs text-truncate font-display" style={{ fontSize: '0.75rem' }}>
              {article.doi}
            </span>
            <Button 
              variant="link" 
              className="p-0 text-muted-custom hover:text-dark d-flex align-items-center"
              onClick={(e) => handleCopyDoi(e, article.doi)}
              title="Copy DOI"
            >
              <Icon icon="lucide:copy" width="12" />
            </Button>
          </div>
        ) : (
          <span className="text-muted text-xs">-</span>
        )}
      </td>

      {/* Topic Badge */}
      <td style={{ width: '130px' }}>
        <span className={`article-topic-badge ${topicClassName}`}>
          {article.primary_topic || 'Unclassified'}
        </span>
      </td>

      {/* Open Access */}
      <td className="text-center" style={{ width: '80px' }}>
        {article.is_open_access ? (
          <span className="article-oa-badge">
            OA
          </span>
        ) : (
          <span className="text-muted-custom text-xs">-</span>
        )}
      </td>

      {/* Actions */}
      <td className="text-end pe-3" style={{ width: '80px' }}>
        <span
          className="article-action-link d-flex align-items-center justify-content-end gap-0.5"
        >
          Details
          <Icon icon="lucide:arrow-right" width="12" />
        </span>
      </td>
    </tr>
  );
}
