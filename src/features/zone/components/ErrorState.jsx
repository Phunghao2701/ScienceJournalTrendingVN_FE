import React from 'react';
import { Icon } from '@iconify/react';

export default function ErrorState({ 
  message = 'Đã xảy ra lỗi khi tải dữ liệu.', 
  onRetry, 
  className = '',
  style = {} 
}) {
  return (
    <div 
      className={`text-center py-5 px-4 border border-danger border-opacity-10 d-flex flex-column align-items-center justify-content-center ${className}`} 
      style={{ 
        backgroundColor: 'var(--bg-card)', 
        borderRadius: '16px',
        minHeight: '220px',
        ...style
      }}
    >
      <div 
        className="d-flex align-items-center justify-content-center mb-3"
        style={{
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          backgroundColor: '#fee2e2',
          color: '#ef4444'
        }}
      >
        <Icon icon="lucide:alert-circle" width="24" height="24" />
      </div>
      <h5 className="font-display text-main fw-semibold mb-2" style={{ fontSize: '1.05rem' }}>Đã xảy ra lỗi</h5>
      <p className="text-muted-custom mb-3 text-center" style={{ fontSize: '0.8rem', maxWidth: '320px', lineHeight: '1.5' }}>
        {message}
      </p>
      {onRetry && (
        <button 
          className="btn btn-sm btn-dark-solid d-inline-flex align-items-center gap-1.5 px-3 py-1.5"
          onClick={onRetry}
          style={{ fontSize: '0.78rem', borderRadius: '8px' }}
        >
          <Icon icon="lucide:refresh-cw" width="14" />
          <span>Thử lại</span>
        </button>
      )}
    </div>
  );
}
