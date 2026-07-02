import { useState, useEffect, useRef } from 'react';
import { Icon } from '@iconify/react';

/**
 * Single-value combobox: type directly in the box to filter options,
 * or click the chevron to open/close the full list. Sibling of
 * MultiSelectDropdown, adapted for a scalar value instead of an array.
 */
export default function SearchableSelect({
  options = [],
  value = '',
  onChange,
  placeholder = 'Select...',
  size = 'sm',
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const wrapperRef = useRef(null);

  const selectedOption = options.find(opt => String(opt.value) === String(value));
  const selectedLabel = selectedOption ? selectedOption.label : '';

  useEffect(() => {
    setInputValue(selectedLabel);
  }, [selectedLabel]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
        setInputValue(selectedLabel);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [selectedLabel]);

  const filteredOptions = options.filter(opt =>
    (opt.label || '').toLowerCase().includes((inputValue || '').toLowerCase())
  );

  const handleSelect = (opt) => {
    onChange(opt.value);
    setInputValue(opt.label);
    setIsOpen(false);
  };

  const handleClear = (e) => {
    e.stopPropagation();
    onChange('');
    setInputValue('');
  };

  return (
    <div className="position-relative" ref={wrapperRef}>
      <div className="d-flex align-items-center" style={{ position: 'relative' }}>
        <input
          type="text"
          className={`form-control ${size ? `form-control-${size}` : ''}`}
          style={{ paddingRight: value ? '46px' : '26px' }}
          placeholder={placeholder}
          value={inputValue}
          onFocus={() => setIsOpen(true)}
          onChange={(e) => { setInputValue(e.target.value); setIsOpen(true); }}
        />
        <div className="d-flex align-items-center gap-1" style={{ position: 'absolute', right: '8px' }}>
          {value !== '' && value !== 'all' && (
            <Icon icon="lucide:x" width="14" className="text-muted" style={{ cursor: 'pointer' }} onClick={handleClear} />
          )}
          <Icon
            icon="lucide:chevron-down"
            width="16"
            className="text-muted"
            style={{ cursor: 'pointer' }}
            onClick={(e) => { e.stopPropagation(); setIsOpen(prev => !prev); }}
          />
        </div>
      </div>

      {isOpen && (
        <div
          className="position-absolute w-100 bg-white border rounded shadow-sm mt-1"
          style={{ maxHeight: '220px', overflowY: 'auto', zIndex: 20 }}
        >
          {filteredOptions.length === 0 ? (
            <div className="p-2 text-center text-muted small">No results</div>
          ) : (
            filteredOptions.map(opt => (
              <div
                key={opt.value}
                className="px-3 py-2 small text-truncate"
                style={{
                  cursor: 'pointer',
                  backgroundColor: String(opt.value) === String(value) ? 'var(--bg-section)' : 'transparent',
                }}
                onClick={() => handleSelect(opt)}
              >
                {opt.label}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
