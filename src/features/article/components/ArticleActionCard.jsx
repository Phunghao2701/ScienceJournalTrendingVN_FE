/**
 * File source thuộc hệ thống FE ResearchPulse.
 *
 * File: features\article\components\ArticleActionCard.jsx
 */
import { useState } from 'react';
import { Card, Button, Spinner } from 'react-bootstrap';
import { Icon } from '@iconify/react';

export default function ArticleActionCard({ 
  article, 
  isBookmarked, 
  onBookmarkToggle, 
  isBookmarkLoading,
}) {
  const [showCopiedToast, setShowCopiedToast] = useState(false);

  const handleCopyDoi = () => {
    if (!article?.doi) return;
    navigator.clipboard.writeText(article.doi);
    setShowCopiedToast(true);
    setTimeout(() => {
      setShowCopiedToast(false);
    }, 2500);
  };

  const handleOpenSource = () => {
    const url = article?.source_url || article?.doi_url || (article?.doi?.startsWith('http') ? article.doi : article?.doi ? `https://doi.org/${article.doi}` : '');
    if (!url) return;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <Card 
      className="journal-dark-card border-0 p-4 mb-4 position-relative" 
      style={{ 
        backgroundColor: 'var(--bg-card)', 
        border: '1px solid var(--border)',
        borderRadius: '16px',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.02)'
      }}
    >
      <h5 className="font-display font-weight-bold text-main mb-3 d-flex align-items-center gap-2 border-bottom border-light pb-2">
        <Icon icon="lucide:sliders" style={{ color: 'var(--primary)' }} width="20"/>
        Hành động (Actions)
      </h5>

      {/* Floating Copied Message */}
      {showCopiedToast && (
        <div 
          className="position-absolute start-50 translate-middle-x d-flex align-items-center gap-2 px-3 py-2 shadow"
          style={{
            top: '-24px',
            zIndex: 100,
            whiteSpace: 'nowrap',
            animation: 'fadeInUp 0.2s ease-out',
            background: '#f0fdf4',
            borderLeft: '4px solid #22c55e',
            borderRadius: '14px',
            color: '#166534'
          }}
        >
          <Icon icon="solar:check-circle-bold" width="18" style={{ color: '#22c55e', flexShrink: 0 }} />
          <span style={{ fontWeight: 500 }}>Đã sao chép mã DOI!</span>
        </div>
      )}

      <div className="d-flex flex-column gap-3">
        {/* Bookmark Button */}
        <Button
          onClick={onBookmarkToggle}
          disabled={isBookmarkLoading}
          className="w-full d-flex align-items-center justify-content-center gap-2 py-2.5 font-semibold text-sm transition-all"
          style={{
            borderRadius: '8px',
            backgroundColor: isBookmarked ? 'var(--primary-light)' : 'transparent',
            color: isBookmarked ? 'var(--primary)' : 'var(--text-main)',
            border: isBookmarked ? '1px solid var(--primary)' : '1px solid var(--border)',
          }}
          onMouseEnter={(e) => {
            if (!isBookmarked) {
              e.currentTarget.style.borderColor = 'var(--primary)';
              e.currentTarget.style.color = 'var(--primary)';
            }
          }}
          onMouseLeave={(e) => {
            if (!isBookmarked) {
              e.currentTarget.style.borderColor = 'var(--border)';
              e.currentTarget.style.color = 'var(--text-main)';
            }
          }}
        >
          {isBookmarkLoading ? (
            <Spinner animation="border" size="sm" className="text-primary" />
          ) : (
            <Icon 
              icon={isBookmarked ? "lucide:bookmark-check" : "lucide:bookmark"} 
              width="18" 
              className={isBookmarked ? "text-primary" : ""}
            />
          )}
          <span>{isBookmarked ? 'Đã bookmark bài báo' : 'Bookmark bài báo'}</span>
        </Button>

        {/* Copy DOI Button */}
        {article?.doi && (
          <Button
            onClick={handleCopyDoi}
            className="w-full d-flex align-items-center justify-content-center gap-2 py-2.5 font-semibold text-sm transition-all bg-transparent text-main"
            style={{
              borderRadius: '8px',
              border: '1px solid var(--border)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--primary)';
              e.currentTarget.style.color = 'var(--primary)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--border)';
              e.currentTarget.style.color = 'var(--text-main)';
            }}
          >
            <Icon icon="lucide:copy" width="18" />
            <span>Copy mã DOI</span>
          </Button>
        )}

        {/* View Source Button */}
        {article?.doi && (
          <Button
            onClick={handleOpenSource}
            className="w-full d-flex align-items-center justify-content-center gap-2 py-2.5 font-semibold text-sm btn-dark-solid"
            style={{
              borderRadius: '8px'
            }}
          >
            <Icon icon="lucide:external-link" width="18" />
            <span>Xem nguồn bài báo</span>
          </Button>
        )}
      </div>

      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translate(-50%, 10px);
          }
          to {
            opacity: 1;
            transform: translate(-50%, 0);
          }
        }
      `}</style>
    </Card>
  );
}
