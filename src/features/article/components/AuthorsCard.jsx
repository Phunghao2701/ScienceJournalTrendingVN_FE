/**
 * File source thuộc hệ thống FE ResearchPulse.
 *
 * File: features\article\components\AuthorsCard.jsx
 */
import { Card } from 'react-bootstrap';
import { Icon } from '@iconify/react';
import { useNavigate } from 'react-router-dom';
import { getInitials, normalizeAuthors } from '../utils/articleFormatters';

export default function AuthorsCard({ authors }) {
  const navigate = useNavigate();
  const parsedAuthors = normalizeAuthors(authors);

  const handleAuthorClick = (author) => {
    if (author.author_id) {
      navigate(`/authors/${author.author_id}`);
      return;
    }
    navigate(`/catalog?search=${encodeURIComponent(author.display_name)}`);
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
      <h5 className="font-display font-weight-bold text-main mb-3 d-flex align-items-center gap-2 border-bottom border-light pb-2">
        <Icon icon="lucide:users" style={{ color: 'var(--primary)' }} width="20"/>
        Nhóm Tác giả (Authors)
      </h5>

      {parsedAuthors.length === 0 ? (
        <span className="text-muted-custom text-sm">Chưa cập nhật thông tin tác giả.</span>
      ) : (
        <div className="d-flex flex-column gap-3">
          {parsedAuthors.map((author, index) => (
            <div 
              key={author.author_id || `${author.display_name}-${index}`} 
              className="d-flex align-items-start gap-3 p-2 rounded-3 hover:bg-light transition-all"
              style={{ transition: 'all 0.2s' }}
            >
              <div 
                className="d-flex align-items-center justify-content-center text-white text-xs font-bold rounded-circle font-display"
                style={{
                  width: '36px',
                  height: '36px',
                  background: 'linear-gradient(135deg, var(--btn-dark) 0%, var(--primary) 100%)',
                  flexShrink: 0
                }}
              >
                {getInitials(author.display_name)}
              </div>

              <div className="flex-grow-1">
                <div 
                  onClick={() => handleAuthorClick(author)}
                  className="text-sm text-main font-weight-semibold hover:text-primary transition-colors"
                  style={{ cursor: 'pointer', fontWeight: 700, textDecoration: 'none' }}
                >
                  {author.display_name}
                </div>
                {author.last_known_institution && (
                  <div className="text-muted-custom text-xs mt-1" style={{ fontSize: '0.75rem' }}>
                    <Icon icon="lucide:building" width="12" className="me-1 opacity-75" />
                    {author.last_known_institution}
                  </div>
                )}
                {author.works_count !== null && author.works_count !== undefined && (
                  <div className="text-muted-custom text-xs mt-1" style={{ fontSize: '0.72rem' }}>
                    <Icon icon="lucide:file-text" width="12" className="me-1 opacity-75" />
                    {Number(author.works_count).toLocaleString('vi-VN')} công trình
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
