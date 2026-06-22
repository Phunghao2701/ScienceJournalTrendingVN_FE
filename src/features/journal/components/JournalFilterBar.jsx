import React from 'react';
import { Row, Col, Form, Button, InputGroup } from 'react-bootstrap';

/**
 * Component JournalFilterBar - Thanh công cụ lọc, tìm kiếm và chuyển đổi giao diện hiển thị.
 * @param {string} search - Từ khóa tìm kiếm hiện tại
 * @param {function} onSearchChange - Hàm callback khi thay đổi từ khóa tìm kiếm
 * @param {string} statusFilter - Trạng thái lọc (Active/Draft/All)
 * @param {function} onStatusChange - Hàm callback khi thay đổi bộ lọc trạng thái
 * @param {string} viewMode - Chế độ hiển thị ('table' hoặc 'card')
 * @param {function} onViewModeChange - Hàm callback khi bấm chuyển đổi chế độ xem
 * @param {function} onOpenAddModal - Hàm mở Modal thêm Tạp chí mới
 */
export default function JournalFilterBar({
  search,
  onSearchChange,
  statusFilter,
  onStatusChange,
  viewMode,
  onViewModeChange,
  onOpenAddModal
}) {
  return (
    <Row className="mb-4 align-items-center g-3">
      {/* Cột 1: Ô tìm kiếm Tạp chí theo Tên hoặc ISSN */}
      <Col xs={12} md={4}>
        <InputGroup>
          <Form.Control
            type="text"
            placeholder="Tìm kiếm theo tên tạp chí hoặc ISSN..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            style={{ backgroundColor: 'var(--bg-chip)', borderColor: 'var(--border)' }}
          />
        </InputGroup>
      </Col>

      {/* Cột 2: Bộ lọc theo trạng thái (Active / Draft) */}
      <Col xs={6} md={3}>
        <Form.Select
          value={statusFilter}
          onChange={(e) => onStatusChange(e.target.value)}
          style={{ backgroundColor: 'var(--bg-chip)', borderColor: 'var(--border)' }}
        >
          <option value="All">Tất cả trạng thái</option>
          <option value="Active">Đang hoạt động (Active)</option>
          <option value="Draft">Bản nháp (Draft)</option>
        </Form.Select>
      </Col>

      {/* Cột 3: Nút Chuyển đổi hiển thị Table / Card và Nút thêm mới */}
      <Col xs={6} md={5} className="d-flex justify-content-md-end align-items-center gap-2">
        {/* Toggle View Mode */}
        <div className="btn-group" role="group">
          <Button
            variant={viewMode === 'table' ? 'dark' : 'light'}
            onClick={() => onViewModeChange('table')}
            className="btn-custom-sm"
          >
            <i className="bi bi-table me-1"></i> Bảng
          </Button>
          <Button
            variant={viewMode === 'card' ? 'dark' : 'light'}
            onClick={() => onViewModeChange('card')}
            className="btn-custom-sm"
          >
            <i className="bi bi-grid-three-up me-1"></i> Thẻ
          </Button>
        </div>

        {/* Nút Tạo Tạp chí Mới (Add Journal) */}
        <Button 
          className="btn-primary-glow d-flex align-items-center gap-1"
          onClick={onOpenAddModal}
        >
          <i className="bi bi-plus-circle"></i> Thêm tạp chí
        </Button>
      </Col>
    </Row>
  );
}