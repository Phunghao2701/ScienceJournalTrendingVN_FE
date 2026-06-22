import React, { useState, useEffect, useRef } from 'react';
import { Icon } from '@iconify/react';

/**
 * Custom Multi-select component using Bootstrap styles
 */
export default function MultiSelectDropdown({ 
  options = [], 
  value = [], 
  onChange, 
  placeholder = "Chọn...", 
  disabled = false,
  loading = false,
  searchable = true
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const wrapperRef = useRef(null);

  // Handle outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [wrapperRef]);

  const filteredOptions = (Array.isArray(options) ? options : []).filter(opt => 
    (opt?.label || '').toLowerCase().includes((searchTerm || '').toLowerCase())
  );

  const toggleSelection = (optionValue) => {
    if (value.includes(optionValue)) {
      onChange(value.filter(v => v !== optionValue));
    } else {
      onChange([...value, optionValue]);
    }
  };

  const removeValue = (e, optionValue) => {
    e.stopPropagation();
    onChange(value.filter(v => v !== optionValue));
  };

  // Get selected objects for chips
  const selectedOptions = options.filter(opt => value.includes(opt.value));

  return (
    <div className="position-relative" ref={wrapperRef}>
      <div 
        className={`form-control d-flex flex-wrap align-items-center gap-1 ${disabled ? 'bg-light text-muted' : 'bg-white'}`}
        style={{ minHeight: '48px', cursor: disabled ? 'not-allowed' : 'pointer', borderColor: 'var(--border)' }}
        onClick={() => !disabled && setIsOpen(!isOpen)}
      >
        {selectedOptions.length === 0 && (
          <span className="text-muted">{placeholder}</span>
        )}
        
        {selectedOptions.map(opt => (
          <span 
            key={opt.value} 
            className="badge rounded-pill d-flex align-items-center gap-1 px-2 py-1 fw-normal"
            style={{ backgroundColor: 'var(--bg-section)', color: 'var(--text-main)', border: '1px solid var(--border)' }}
          >
            <span className="text-truncate" style={{ maxWidth: '150px' }}>{opt.label}</span>
            {!disabled && (
              <Icon 
                icon="lucide:x" 
                width="14" 
                className="cursor-pointer hover-danger" 
                onClick={(e) => removeValue(e, opt.value)}
              />
            )}
          </span>
        ))}
        
        <div className="ms-auto d-flex align-items-center gap-2">
          {loading && <span className="spinner-border spinner-border-sm text-primary" role="status"></span>}
          <Icon icon="lucide:chevron-down" width="18" className="text-muted" />
        </div>
      </div>

      {isOpen && (
        <div className="position-absolute w-100 bg-white border rounded-3 shadow-sm mt-1 z-3" style={{ maxHeight: '300px', display: 'flex', flexDirection: 'column' }}>
          {searchable && (
            <div className="p-2 border-bottom">
              <input 
                type="text" 
                className="form-control form-control-sm" 
                placeholder="Tìm kiếm..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          )}
          
          <div className="overflow-auto py-1" style={{ maxHeight: '250px' }}>
            {filteredOptions.length === 0 ? (
              <div className="p-3 text-center text-muted small">Không tìm thấy kết quả</div>
            ) : (
              filteredOptions.map(opt => (
                <div 
                  key={opt.value}
                  className="dropdown-item px-3 py-2 d-flex align-items-center gap-2 cursor-pointer"
                  onClick={() => toggleSelection(opt.value)}
                >
                  <input 
                    type="checkbox" 
                    className="form-check-input mt-0 cursor-pointer" 
                    checked={value.includes(opt.value)}
                    readOnly
                  />
                  <span className="text-truncate" title={opt.label}>{opt.label}</span>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
