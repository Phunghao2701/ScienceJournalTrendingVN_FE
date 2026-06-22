/**
 * File source thuộc hệ thống FE ResearchPulse.
 *
 * File: features\article\components\ArticleDetailError.jsx
 */
import { Card, Button } from 'react-bootstrap';
import { Icon } from '@iconify/react';
import { useNavigate } from 'react-router-dom';

export default function ArticleDetailError({ errorMsg, onRetry }) {
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
      <div className="text-danger mb-3 d-inline-flex align-items-center justify-content-center" style={{ fontSize: '3rem' }}>
        <Icon icon="lucide:wifi-off" width="48" height="48" />
      </div>
      <h4 className="font-display fw-bold text-main mb-2">Lỗi tải dữ liệu</h4>
      <p className="text-muted-custom text-sm mb-4" style={{ maxWidth: '480px', margin: '0 auto' }}>
        {errorMsg || 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra lại kết nối mạng hoặc thử lại sau.'}
      </p>
      <div className="d-flex justify-content-center gap-3">
        {onRetry && (
          <Button 
            className="btn-primary-glow border-0 px-4 py-2 font-semibold text-xs rounded-pill text-white"
            onClick={onRetry}
          >
            Thử tải lại
          </Button>
        )}
        <Button 
          variant="outline-secondary"
          className="px-4 py-2 font-semibold text-xs rounded-pill text-main border-secondary"
          onClick={() => navigate('/articles')}
          style={{ backgroundColor: 'transparent' }}
        >
          Về danh sách bài báo
        </Button>
      </div>
    </Card>
  );
}
