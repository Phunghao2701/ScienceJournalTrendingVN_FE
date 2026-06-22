/**
 * File source thuộc hệ thống FE ResearchPulse.
 *
 * File: features\keywords\components\KeywordSortDropdown.jsx
 */
import { Dropdown } from 'react-bootstrap';
import { Icon } from '@iconify/react';

/**
 * Dropdown sắp xếp danh sách keyword.
 */
export default function KeywordSortDropdown({ sortBy, sortOrder, onChange }) {
  const keywordSortOptions = [
    {
      label: 'Phổ biến nhất',
      value: 'article_count_desc',
      sortBy: 'article_count',
      sortOrder: 'desc',
    },
    {
      label: 'Tên A-Z',
      value: 'display_name_asc',
      sortBy: 'display_name',
      sortOrder: 'asc',
    },
    {
      label: 'Tên Z-A',
      value: 'display_name_desc',
      sortBy: 'display_name',
      sortOrder: 'desc',
    },
  ];

  const active = keywordSortOptions.find((option) => option.sortBy === sortBy && option.sortOrder === sortOrder) || keywordSortOptions[0];

  return (
    <Dropdown align="end">
      <Dropdown.Toggle
        id="keyword-sort-dropdown"
        className="keyword-sort-toggle"
      >
        <span className="d-inline-flex align-items-center gap-2">
          <Icon icon="lucide:arrow-up-down" width="16" />
          {active.label}
        </span>
      </Dropdown.Toggle>

      <Dropdown.Menu className="keyword-sort-menu">
        {keywordSortOptions.map((option) => (
          <Dropdown.Item
            key={option.value}
            id={`keyword-sort-${option.value}`}
            active={option.value === active.value}
            onClick={() => onChange && onChange(option.sortBy, option.sortOrder)}
          >
            {option.label}
          </Dropdown.Item>
        ))}
      </Dropdown.Menu>
    </Dropdown>
  );
}
