/**
 * File source thuộc hệ thống FE ResearchPulse.
 *
 * File: features\keywords\components\KeywordSearchBar.jsx
 */
import { useState, useEffect } from 'react';
import { InputGroup, Form, Button } from 'react-bootstrap';
import { Icon } from '@iconify/react';

/**
 * Thanh tìm kiếm keyword với nút submit và reset.
 *
 * @param {Object} props
 * @param {string} props.value - Giá trị keyword hiện tại.
 * @param {Function} props.onSearch - Callback khi submit search.
 * @param {Function} props.onClear - Callback khi reset search.
 */
export default function KeywordSearchBar({ value = '', onSearch, onClear }) {
  const [input, setInput] = useState(value);

  // Sync local input when parent resets via onClear or external value change
  useEffect(() => {
    setInput(value);
  }, [value]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSearch) onSearch(input.trim());
  };

  const handleClear = () => {
    setInput('');
    if (onClear) onClear();
  };

  return (
    <Form onSubmit={handleSubmit}>
      <InputGroup className="keyword-search-group">
        <InputGroup.Text className="keyword-search-addon">
          <Icon icon="lucide:search" width="18" />
        </InputGroup.Text>
        <Form.Control
          type="text"
          placeholder="Tìm keyword..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="keyword-search-input"
        />
        {input && (
          <Button
            variant="link"
            onClick={handleClear}
            className="keyword-search-clear"
          >
            <Icon icon="lucide:x" width="16" />
          </Button>
        )}
        <Button
          type="submit"
          className="keyword-search-submit"
        >
          Tìm kiếm
        </Button>
      </InputGroup>
    </Form>
  );
}
