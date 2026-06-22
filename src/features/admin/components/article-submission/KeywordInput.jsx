import React, { useState } from 'react';
import { Form, Badge } from 'react-bootstrap';
import Icon from '../../../../shared/components/Icon';

/**
 * KeywordInput Component
 * Allows users to add and manage keywords as a tag-list/chip-list.
 * 
 * @param {Object} props - Props
 * @param {Array} props.keywords - Array of string keywords
 * @param {function} props.onChange - Callback triggered on tags list changes
 * @param {string} props.placeholder - Placeholder text when empty
 */
export default function KeywordInput({
  keywords = [],
  onChange,
  placeholder = "Separate by commas or press Enter..."
}) {
  const [inputValue, setInputValue] = useState('');

  /**
   * Add keyword to list from input field.
   */
  const addKeyword = (value) => {
    const trimmed = value.trim();
    if (!trimmed) return;

    // Check for duplicates
    if (!keywords.includes(trimmed)) {
      const updated = [...keywords, trimmed];
      onChange(updated);
    }
    setInputValue('');
  };

  /**
   * Key down listener to catch Enter key.
   */
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addKeyword(inputValue);
    }
  };

  /**
   * Input change listener to check for commas.
   */
  const handleInputChange = (e) => {
    const val = e.target.value;
    if (val.endsWith(',')) {
      // Add keyword if comma is entered
      addKeyword(val.slice(0, -1));
    } else {
      setInputValue(val);
    }
  };

  /**
   * Remove a specific keyword from list.
   */
  const removeKeyword = (idxToRemove) => {
    const updated = keywords.filter((_, idx) => idx !== idxToRemove);
    onChange(updated);
  };

  return (
    <div 
      className="d-flex flex-wrap gap-2 align-items-center p-2 rounded-3" 
      style={{ 
        backgroundColor: '#f1f5f9', 
        border: 'none', 
        minHeight: '46px',
        padding: '0.45rem 1rem' 
      }}
    >
      {/* Render tags */}
      {keywords.map((kw, index) => (
        <Badge 
          key={index} 
          className="rounded-pill d-flex align-items-center gap-1.5 px-2.5 py-1.5 fw-normal text-xs"
          style={{
            backgroundColor: '#ffffff',
            color: 'var(--text-main)',
            border: '1px solid #cbd5e1',
          }}
        >
          <span>{kw}</span>
          <Icon 
            icon="lucide:x" 
            width="13" 
            style={{ cursor: 'pointer' }} 
            className="text-muted hover-danger"
            onClick={() => removeKeyword(index)} 
          />
        </Badge>
      ))}

      {/* Text Input */}
      <input 
        type="text" 
        placeholder={keywords.length === 0 ? placeholder : ''}
        value={inputValue}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onBlur={() => addKeyword(inputValue)}
        className="border-0 bg-transparent flex-grow-1"
        style={{
          outline: 'none',
          fontSize: '0.88rem',
          color: 'var(--text-main)',
          minWidth: '120px',
          padding: '4px'
        }}
      />
    </div>
  );
}
