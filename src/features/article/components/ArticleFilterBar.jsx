/**
 * File source thuộc hệ thống FE ResearchPulse.
 *
 * File: features\article\components\ArticleFilterBar.jsx
 */
import { useState, useEffect } from 'react';
import { Row, Col, Form, Button } from 'react-bootstrap';
import { Icon } from '@iconify/react';
import ArticleSearchBar from './ArticleSearchBar';
import { searchJournalsApi } from '../../journal/api/journalApi';
import { getTopicsApi } from '../../topic/api/topic.api';

const YEAR_OPTIONS = [
  { value: 'all', label: 'Tất cả năm' },
  { value: '2026', label: '2026' },
  { value: '2025', label: '2025' },
  { value: '2024', label: '2024' },
  { value: '2023', label: '2023' },
  { value: '2022', label: '2022' }
];


const ACCESS_OPTIONS = [
  { value: 'all', label: 'Tất cả trạng thái' },
  { value: 'oa', label: 'Open Access (OA)' }
];

const SORT_OPTIONS = [
  { value: 'created_at-desc', label: 'Mới nhất' },
  { value: 'created_at-asc', label: 'Cũ nhất' },
  { value: 'title-asc', label: 'Tiêu đề A-Z' },
  { value: 'title-desc', label: 'Tiêu đề Z-A' },
  { value: 'publication_year-desc', label: 'Năm xuất bản (Giảm)' },
  { value: 'publication_year-asc', label: 'Năm xuất bản (Tăng)' },
];

export default function ArticleFilterBar({ filters, updateFilters, clearFilters }) {
  const [journalOptions, setJournalOptions] = useState([
    { value: 'all', label: 'Tất cả tạp chí' }
  ]);
  const [topicOptions, setTopicOptions] = useState([
    { value: 'all', label: 'Tất cả chủ đề' }
  ]);
  const [loadingFilters, setLoadingFilters] = useState(false);

  useEffect(() => {
    const fetchFilterOptions = async () => {
      setLoadingFilters(true);
      try {
        const [journalResponse, topicResponse] = await Promise.allSettled([
          searchJournalsApi({ limit: 100 }),
          getTopicsApi({ limit: 100, sort_by: 'display_name', sort_order: 'asc' })
        ]);

        if (journalResponse.status === 'fulfilled' && journalResponse.value?.data?.success && journalResponse.value?.data?.data?.items) {
          const fetchedOptions = journalResponse.value.data.data.items.map(item => ({
            value: String(item.journal_id),
            label: item.display_name
          }));
          fetchedOptions.sort((a, b) => a.label.localeCompare(b.label));
          setJournalOptions([
            { value: 'all', label: 'Tất cả tạp chí' },
            ...fetchedOptions
          ]);
        }

        if (topicResponse.status === 'fulfilled' && topicResponse.value?.data?.success) {
          const topicData = topicResponse.value.data;
          const topicItems = topicData?.data?.topics || topicData?.data?.items || topicData?.data || [];
          const fetchedTopics = topicItems.map((item) => ({
            value: String(item.topic_id || item.id),
            label: item.display_name || item.name || `Topic #${item.topic_id || item.id}`
          })).filter((item) => item.value && item.label);
          setTopicOptions([
            { value: 'all', label: 'Tất cả chủ đề' },
            ...fetchedTopics
          ]);
        }
      } catch (error) {
        console.error('Failed to fetch article filter options:', error);
      } finally {
        setLoadingFilters(false);
      }
    };
    fetchFilterOptions();
  }, []);

  const handleSearchChange = (val) => {
    updateFilters({ search: val });
  };

  const handleSelectChange = (key) => (e) => {
    updateFilters({ [key]: e.target.value });
  };

  const handleSortChange = (e) => {
    const [sortBy, sortOrder] = e.target.value.split('-');
    updateFilters({ sortBy, sortOrder });
  };

  const hasActiveFilters = 
    filters.search !== '' ||
    filters.selectedYear !== 'all' ||
    filters.selectedJournal !== 'all' ||
    filters.selectedTopic !== 'all' ||
    filters.selectedAccess !== 'all' ||
    filters.sortBy !== 'created_at' ||
    filters.sortOrder !== 'desc';

  const currentSortValue = `${filters.sortBy}-${filters.sortOrder}`;

  return (
    <div className="article-filter-panel">
      <Row className="g-3 align-items-center">
        {/* Search Bar */}
        <Col xs={12} lg={4}>
          <ArticleSearchBar 
            initialValue={filters.search} 
            onSearchChange={handleSearchChange} 
          />
        </Col>

        {/* Filters and Sorts */}
        <Col xs={12} lg={8}>
          <div className="d-flex flex-wrap gap-2 justify-content-lg-end">
            
            {/* Lọc theo Năm */}
            <Form.Select
              value={filters.selectedYear}
              onChange={handleSelectChange('year')}
              className="article-form-control py-2 text-xs"
              style={{
                width: '130px',
                borderColor: 'var(--border)',
                fontSize: '0.8rem',
                cursor: 'pointer'
              }}
            >
              {YEAR_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </Form.Select>

            {/* Lọc theo Tạp chí */}
            <Form.Select
              value={filters.selectedJournal}
              onChange={handleSelectChange('journal')}
              className="article-form-control py-2 text-xs"
              style={{
                width: '200px',
                borderColor: 'var(--border)',
                fontSize: '0.8rem',
                cursor: 'pointer'
              }}
            >
              {journalOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </Form.Select>

            {/* Lọc theo Chủ đề */}
            <Form.Select
              value={filters.selectedTopic}
              onChange={handleSelectChange('topic')}
              disabled={loadingFilters}
              className="article-form-control py-2 text-xs"
              style={{
                width: '160px',
                borderColor: 'var(--border)',
                fontSize: '0.8rem',
                cursor: loadingFilters ? 'wait' : 'pointer'
              }}
            >
              {topicOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </Form.Select>

            {/* Lọc theo Open Access */}
            <Form.Select
              value={filters.selectedAccess}
              onChange={handleSelectChange('access')}
              className="article-form-control py-2 text-xs"
              style={{
                width: '140px',
                borderColor: 'var(--border)',
                fontSize: '0.8rem',
                cursor: 'pointer'
              }}
            >
              {ACCESS_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </Form.Select>

            {/* Sắp xếp */}
            <div className="d-flex align-items-center gap-2">
              <span className="text-muted-custom text-xs d-none d-sm-inline" style={{ whiteSpace: 'nowrap', fontSize: '0.75rem' }}>
                Sắp xếp:
              </span>
              <Form.Select
                value={currentSortValue}
                onChange={handleSortChange}
                className="article-form-control py-2 text-xs"
                style={{
                  width: '160px',
                  borderColor: 'var(--border)',
                  fontSize: '0.8rem',
                  cursor: 'pointer'
                }}
              >
                {SORT_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </Form.Select>
            </div>

            {/* Nút Clear Filters */}
            {hasActiveFilters && (
              <Button
                variant="outline-primary"
                onClick={clearFilters}
                className="d-flex align-items-center gap-1 py-2 px-3 text-xs rounded-pill"
                style={{
                  borderColor: 'var(--primary)',
                  color: 'var(--primary)',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  transition: 'all 0.2s'
                }}
              >
                <Icon icon="lucide:rotate-ccw" width="14" />
                <span>Xóa lọc</span>
              </Button>
            )}

          </div>
        </Col>
      </Row>
    </div>
  );
}
