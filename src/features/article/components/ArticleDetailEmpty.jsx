/**
 * File source thuộc hệ thống FE ResearchPulse.
 *
 * File: features\article\components\ArticleDetailEmpty.jsx
 */
import { Card, Button } from 'react-bootstrap';
import { Icon } from '@iconify/react';
import { useNavigate } from 'react-router-dom';

export default function ArticleDetailEmpty({ articleId }) {
  const navigate = useNavigate();

  return (
    <Card 
      className="journal-dark-card border-0 p-5 text-center" 
      style={{ 
        backgroundColor: 'var(--bg-card)', 
        border: '1px solid var(--border)', 
        borderRadius: '16px',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.02)'
      }}
    >
      <div className="text-warning mb-3 d-inline-flex align-items-center justify-content-center" style={{ fontSize: '3rem' }}>
        <Icon icon="lucide:alert-circle" width="48" height="48" />
      </div>
      <h4 className="font-display fw-bold text-main mb-2">Không tìm thấy bài báo</h4>
      <p className="text-muted-custom text-sm mb-4" style={{ maxWidth: '480px', margin: '0 auto' }}>
        Bài báo với mã số ID <strong>{articleId}</strong> không tồn tại hoặc đã bị xóa khỏi hệ thống cơ sở dữ liệu Scientific Journal.
      </p>
      <div className="d-flex justify-content-center gap-3">
        <Button 
          variant="outline-secondary"
          className="px-4 py-2 font-semibold text-xs rounded-pill text-main border-secondary"
          onClick={() => navigate('/dashboard')}
          style={{ backgroundColor: 'transparent' }}
        >
          Về Dashboard
        </Button>
        <Button 
          className="btn-primary-glow border-0 px-4 py-2 font-semibold text-xs rounded-pill text-white"
          onClick={() => navigate('/articles')}
        >
          Xem danh sách bài báo
        </Button>
      </div>
    </Card>
  );
}
