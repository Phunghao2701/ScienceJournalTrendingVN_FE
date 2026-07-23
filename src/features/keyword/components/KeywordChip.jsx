const KeywordChip = ({ keyword, count, icon, onClick, isTrending = false, isActive = false }) => {
  return (
    <button
      type="button"
      className={`d-inline-flex align-items-center gap-2 px-3 py-1 me-2 mb-2 rounded-pill ${
        isTrending || !isActive ? 'text-main bg-white border' : 'btn-dark-solid border border-dark'
      }`}
      style={{ 
        cursor: onClick ? 'pointer' : 'default', 
        backgroundColor: isTrending ? 'var(--bg-chip)' : undefined,
      }}
      onClick={onClick}
      aria-pressed={onClick ? isActive : undefined}
    >
      <span className="fw-medium">{keyword}</span>
      {count != null && <span className="text-muted-custom small">{count}</span>}
      {icon && <span className="ms-1">{icon}</span>}
    </button>
  );
};

export default KeywordChip;
