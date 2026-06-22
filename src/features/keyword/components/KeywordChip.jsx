import React from 'react';

const KeywordChip = ({ keyword, count, icon, onClick, isTrending = false }) => {
  return (
    <div 
      className={`d-inline-flex align-items-center gap-2 px-3 py-1 me-2 mb-2 rounded-pill ${isTrending ? 'text-main' : 'btn-dark-solid'}`}
      style={{ 
        cursor: onClick ? 'pointer' : 'default', 
        backgroundColor: isTrending ? 'var(--bg-chip)' : '',
        border: isTrending ? '1px solid var(--border)' : 'none' 
      }}
      onClick={onClick}
    >
      <span className="fw-medium">{keyword}</span>
      {count && <span className="text-muted-custom small">+{count}</span>}
      {icon && <span className="ms-1">{icon}</span>}
    </div>
  );
};

export default KeywordChip;
