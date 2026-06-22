import React, { useState, useEffect } from 'react';
import { Row, Col, Form, Button, InputGroup } from 'react-bootstrap';
import { Icon } from '@iconify/react';
import { getSubjectAreasApi } from '../../../journal/api/journalApi';

/**
 * Component JournalFilterBar - Thanh công cụ lọc, tìm kiếm và chuyển đổi giao diện hiển thị.
 *
 * @param {string} search - Từ khóa tìm kiếm hiện tại
 * @param {function} onSearchChange - Hàm callback khi thay đổi từ khóa tìm kiếm
 * @param {string} statusFilter - Trạng thái lọc (Active/Draft/All)
 * @param {function} onStatusChange - Hàm callback khi thay đổi bộ lọc trạng thái
 * @param {string} subjectFilter - Bộ lọc chuyên ngành/lĩnh vực (Subject Category)
 * @param {function} onSubjectChange - Hàm callback khi thay đổi bộ lọc chuyên ngành
 * @param {string} viewMode - Chế độ hiển thị ('table' hoặc 'card')
 * @param {function} onViewModeChange - Hàm callback khi bấm chuyển đổi chế độ xem
 * @param {function} onOpenAddModal - Hàm mở Modal thêm Tạp chí mới
 */
export default function JournalFilterBar({
  search,
  onSearchChange,
  statusFilter,
  onStatusChange,
  subjectFilter = 'All',
  onSubjectChange,
  viewMode,
  onViewModeChange,
  onOpenAddModal
}) {
  const [subjectAreas, setSubjectAreas] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let ignore = false;
    const fetchSubjectAreas = async () => {
      setLoading(true);
      try {
        const response = await getSubjectAreasApi({ page: 1, limit: 100 });
        if (ignore) return;
        const items = response.data?.data?.items || response.data?.data || [];
        setSubjectAreas(items);
      } catch (err) {
        console.error('Failed to fetch subject areas for filter:', err);
      } finally {
        if (!ignore) setLoading(false);
      }
    };
    fetchSubjectAreas();
    return () => {
      ignore = true;
    };
  }, []);

  return (
    <div className="bg-white p-4 rounded-3 border mb-4 text-start" style={{ borderColor: 'var(--border)' }}>
      <Row className="align-items-end g-3">
        {/* Search Input */}
        <Col xs={12} md={4}>
          <Form.Group>
            <Form.Label className="fw-medium small text-main text-uppercase mb-2" style={{ letterSpacing: '0.05em' }}>
              Search Journals
            </Form.Label>
            <InputGroup>
              <InputGroup.Text style={{ backgroundColor: 'var(--bg-chip)', borderColor: 'var(--border)' }}>
                <Icon icon="lucide:search" width="16" className="text-muted" />
              </InputGroup.Text>
              <Form.Control
                type="text"
                placeholder="Search by title, ISSN..."
                value={search}
                onChange={(e) => onSearchChange(e.target.value)}
                style={{ backgroundColor: 'var(--bg-chip)', borderColor: 'var(--border)', fontSize: '0.9rem' }}
              />
            </InputGroup>
          </Form.Group>
        </Col>

        {/* Status Filter */}
        <Col xs={12} sm={6} md={2.5}>
          <Form.Group>
            <Form.Label className="fw-medium small text-main text-uppercase mb-2" style={{ letterSpacing: '0.05em' }}>
              Status
            </Form.Label>
            <Form.Select
              value={statusFilter}
              onChange={(e) => onStatusChange(e.target.value)}
              style={{ backgroundColor: 'var(--bg-chip)', borderColor: 'var(--border)', fontSize: '0.9rem', cursor: 'pointer' }}
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Draft">Draft</option>
            </Form.Select>
          </Form.Group>
        </Col>

        {/* Subject Area Filter */}
        <Col xs={12} sm={6} md={2.5}>
          <Form.Group>
            <Form.Label className="fw-medium small text-main text-uppercase mb-2" style={{ letterSpacing: '0.05em' }}>
              Subject Area
            </Form.Label>
            <Form.Select
              value={subjectFilter}
              onChange={(e) => onSubjectChange(e.target.value)}
              style={{ backgroundColor: 'var(--bg-chip)', borderColor: 'var(--border)', fontSize: '0.9rem', cursor: 'pointer' }}
              disabled={loading}
            >
              <option value="All">All Subject Areas</option>
              {subjectAreas.map((area) => {
                const val = area.display_name || area.name;
                return (
                  <option key={area.subject_area_id || area.id || val} value={val}>
                    {val}
                  </option>
                );
              })}
            </Form.Select>
          </Form.Group>
        </Col>

        {/* View Mode & Add Button */}
        <Col xs={12} md={3} className="d-flex justify-content-md-end align-items-center gap-3 mt-md-0">
          {/* View Toggle */}
          <div className="d-flex flex-column align-items-md-end">
            <span className="fw-medium small text-main text-uppercase mb-2 d-none d-md-inline" style={{ letterSpacing: '0.05em' }}>
              View
            </span>
            <div className="btn-group" role="group">
              <Button
                variant="light"
                onClick={() => onViewModeChange('table')}
                className={`btn-custom-sm d-flex align-items-center p-2 rounded-start ${
                  viewMode === 'table' ? 'bg-dark text-white' : 'bg-light text-dark border'
                }`}
                style={{ borderRight: 'none' }}
                title="Table view"
              >
                <Icon icon="lucide:layout-list" width="16" />
              </Button>
              <Button
                variant="light"
                onClick={() => onViewModeChange('card')}
                className={`btn-custom-sm d-flex align-items-center p-2 rounded-end ${
                  viewMode === 'card' ? 'bg-dark text-white' : 'bg-light text-dark border'
                }`}
                style={{ borderLeft: 'none' }}
                title="Card view"
              >
                <Icon icon="lucide:grid" width="16" />
              </Button>
            </div>
          </div>

          {/* Add Journal Button */}
          <div className="d-flex flex-column">
            <span className="mb-2 d-none d-md-inline" style={{ height: '18px' }}></span>
            <Button 
              className="btn-primary-glow d-flex align-items-center gap-1.5 py-2 px-3 text-nowrap"
              onClick={onOpenAddModal}
            >
              <Icon icon="lucide:plus" width="16" />
              <span>Create New Journal</span>
            </Button>
          </div>
        </Col>
      </Row>
    </div>
  );
}
