import React from 'react';
import { Icon } from '@iconify/react';

export default function EmptyState({ 
  icon = 'lucide:info', 
  title = 'Không có dữ liệu', 
  description = 'Không tìm thấy thông tin phù hợp.', 
  className = '',
  style = {}
}) {
  return (
    <div 
      className={`text-center py-5 px-4 border border-light d-flex flex-column align-items-center justify-content-center ${className}`} 
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
          backgroundColor: 'var(--primary-light)',
          color: 'var(--primary)'
        }}
      >
        <Icon icon={icon} width="24" height="24" />
      </div>
      <h5 className="font-display text-main fw-semibold mb-2" style={{ fontSize: '1.05rem' }}>{title}</h5>
      <p className="text-muted-custom mb-0 text-center" style={{ fontSize: '0.8rem', maxWidth: '320px', lineHeight: '1.5' }}>
        {description}
      </p>
    </div>
  );
}
