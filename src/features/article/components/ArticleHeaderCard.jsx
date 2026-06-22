/**
 * File source thuộc hệ thống FE ResearchPulse.
 *
 * File: features\article\components\ArticleHeaderCard.jsx
 */
import { Card, Badge } from 'react-bootstrap';
import { Icon } from '@iconify/react';
import { useNavigate } from 'react-router-dom';

export default function ArticleHeaderCard({ article }) {
  const navigate = useNavigate();

  if (!article) return null;

  // Extract author info from normalized array
  let authorText = '';
  let mainAuthorInitials = 'A';
  let hasMultipleAuthors = false;
  let additionalCount = 0;

  const authors = Array.isArray(article.authors) ? article.authors : [];
  if (authors.length > 0) {
    const firstAuthor = authors[0];
    authorText = firstAuthor.display_name || firstAuthor.name || 'Tác giả';
    mainAuthorInitials = authorText.charAt(0).toUpperCase();
    if (authors.length > 1) {
      hasMultipleAuthors = true;
      additionalCount = authors.length - 1;
    }
  }

  const handleJournalClick = () => {
    const journalId = article.journal_id;
    if (journalId) {
      navigate(`/journals/${journalId}`);
    }
  };

  return (
    <Card 
      className="journal-dark-card border-0 p-4 mb-4" 
      style={{ 
        backgroundColor: 'var(--bg-card)', 
        border: '1px solid var(--border)',
        borderRadius: '16px',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.02)'
      }}
    >
      {/* Badges row */}
      <div className="d-flex flex-wrap gap-2 mb-3">
        {article.is_open_access && (
          <Badge 
            className="py-1.5 px-2.5 text-xs font-semibold" 
            style={{ 
              borderRadius: '6px', 
              fontSize: '0.75rem',
              backgroundColor: 'rgba(47, 198, 70, 0.12)',
              color: 'var(--q1-color)',
              border: '1px solid rgba(47, 198, 70, 0.3)'
            }}
          >
            Open Access
          </Badge>
        )}
        {article.publication_year && (
          <span 
            className="text-muted-custom border-top border-light" 
          style={{ fontSize: '0.9rem' }}
          >
            Năm xuất bản: {article.publication_year}
          </span>
        )}
      </div>

      {/* Title */}
      <h1 
        className="font-display text-main mb-3" 
        style={{ 
          fontSize: '2rem', 
          lineHeight: '1.3', 
          fontWeight: 700 
        }}
      >
        {article.title}
      </h1>

      {/* Main Author Row */}
      {authorText && (
        <div className="d-flex align-items-center gap-3 mb-4">
          <div 
            className="d-flex align-items-center justify-content-center text-white text-xs font-bold rounded-circle font-display"
            style={{
              width: '36px',
              height: '36px',
              background: 'linear-gradient(135deg, var(--btn-dark) 0%, var(--text-muted) 100%)',
              flexShrink: 0
            }}
          >
            {mainAuthorInitials}
          </div>
          <div>
            <div className="text-sm text-main font-weight-semibold" style={{ fontWeight: 600 }}>
              {authorText}
              {hasMultipleAuthors && (
                <span className="text-muted-custom font-weight-normal text-xs ms-1">
                  và {additionalCount} tác giả khác
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Journal Link */}
      {article.journal_name && (
        <div 
          className="d-flex align-items-center gap-2 text-muted-custom pt-3 border-top border-light" 
          style={{ fontSize: '0.9rem' }}
        >
          <Icon icon="lucide:book-open" style={{ color: 'var(--primary)' }} width="20" />
          <span>Xuất bản trong:</span>
          {article.journal_id ? (
            <span 
              onClick={handleJournalClick}
              className="text-main font-weight-semibold hover:text-dark transition-colors"
              style={{ cursor: 'pointer', fontWeight: 600, textDecoration: 'underline' }}
            >
              {article.journal_name}
            </span>
          ) : (
            <span className="text-main font-weight-semibold" style={{ fontWeight: 600 }}>
              {article.journal_name}
            </span>
          )}
        </div>
      )}
    </Card>
  );
}
