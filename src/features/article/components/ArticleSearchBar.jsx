/**
 * File source thuộc hệ thống FE ResearchPulse.
 *
 * File: features\article\components\ArticleSearchBar.jsx
 */
import { useState, useEffect, useRef } from 'react';
import { Form, InputGroup } from 'react-bootstrap';
import { Icon } from '@iconify/react';

export default function ArticleSearchBar({ initialValue = '', onSearchChange }) {
  const [value, setValue] = useState(initialValue);
  const onSearchChangeRef = useRef(onSearchChange);

  // Keep callback reference updated
  useEffect(() => {
    onSearchChangeRef.current = onSearchChange;
  }, [onSearchChange]);

  // Sync with initialValue if changed externally (e.g. cleared filters)
  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      onSearchChangeRef.current(value);
    }, 400);

    return () => clearTimeout(timer);
  }, [value]);

  const handleClear = () => {
    setValue('');
  };

  return (
    <Form.Group className="flex-grow-1">
      <InputGroup className="article-search-group">
        <InputGroup.Text 
          className="bg-transparent border-0 pe-2 ps-3 text-muted-custom"
          style={{ color: 'var(--text-muted)' }}
        >
          <Icon icon="lucide:search" width="18" height="18" />
        </InputGroup.Text>
        
        <Form.Control
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Tìm bài báo, DOI, từ khóa..."
          className="bg-transparent border-0 text-main shadow-none py-2.5 text-sm"
          style={{
            fontSize: '0.875rem'
          }}
        />

        {value && (
          <InputGroup.Text 
            className="bg-transparent border-0 ps-0 pe-3 text-muted-custom"
            style={{ cursor: 'pointer' }}
            onClick={handleClear}
          >
            <Icon icon="lucide:x" width="16" height="16" className="text-muted-custom hover:text-dark" />
          </InputGroup.Text>
        )}
      </InputGroup>
    </Form.Group>
  );
}
