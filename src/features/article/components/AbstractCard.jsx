/**
 * File source thuộc hệ thống FE ResearchPulse.
 *
 * File: features\article\components\AbstractCard.jsx
 */
import { useState } from 'react';
import { Card, Button } from 'react-bootstrap';
import { Icon } from '@iconify/react';

export default function AbstractCard({ abstract }) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const content = abstract || 'Không có tóm tắt cho bài báo này.';
  const isLong = content.length > 400;
  
  const displayContent = isLong && !isExpanded 
    ? `${content.substring(0, 400)}...` 
    : content;

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
      <h5 className="font-display font-weight-bold text-main mb-3 d-flex align-items-center gap-2">
        <Icon icon="lucide:align-left" style={{ color: 'var(--primary)' }} width="20" />
        Tóm tắt bài báo (Abstract)
      </h5>
      <p 
        className="text-main p-3 rounded-3 mb-0" 
        style={{ 
          fontSize: '0.95rem',
          lineHeight: '1.7', 
          backgroundColor: 'var(--bg-section)',
          borderLeft: '4px solid var(--primary)',
          whiteSpace: 'pre-line'
        }}
      >
        {displayContent}
      </p>

      {isLong && (
        <div className="d-flex justify-content-start mt-2">
          <Button
            variant="link"
            className="text-main hover:text-dark p-0 text-decoration-none d-flex align-items-center gap-1 mt-2 font-semibold"
            style={{ fontSize: '0.875rem', fontWeight: 600 }}
            onClick={() => setIsExpanded(!isExpanded)}
          >
            <span>{isExpanded ? 'Thu gọn' : 'Xem thêm'}</span>
            <Icon 
              icon={isExpanded ? "lucide:chevron-up" : "lucide:chevron-down"} 
              width="16" 
            />
          </Button>
        </div>
      )}
    </Card>
  );
}
