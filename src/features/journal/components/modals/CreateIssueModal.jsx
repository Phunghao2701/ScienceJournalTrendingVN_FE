import React, { useState } from 'react';
import { Modal, Button, Form, Row, Col } from 'react-bootstrap';
import { useJournalManagement } from '../../hooks/useJournalManagement';

/**
 * Component CreateIssueModal - Cửa sổ Modal bật lên để Admin thêm Số phát hành (Issue) mới vào Volume đang chọn.
 * Đáp ứng Issue #76: Gồm Issue name, Issue number, Publication year.
 */
export default function CreateIssueModal({ show, handleClose }) {
  const { createIssue } = useJournalManagement();

  // Khởi tạo state cho Form dữ liệu Số phát hành
  const [formData, setFormData] = useState({
    issueName: '',
    issueNumber: '',
    publicationYear: new Date().getFullYear()
  });

  // Quản lý thông báo lỗi validate dữ liệu bắt buộc điền
  const [errors, setErrors] = useState({});

  /** Theo dõi thay đổi chữ trong form */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  /** Hàm thực hiện bắt lỗi dữ liệu bỏ trống */
  const validateForm = () => {
    const newErrors = {};
    if (!formData.issueName.trim()) newErrors.issueName = 'Tên số phát hành không được để trống';
    if (!formData.issueNumber.trim()) newErrors.issueNumber = 'Số hiệu định danh không được trống (Ví dụ: No. 3)';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /** Xử lý nhấn nút Tạo Issue */
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    createIssue({
      issueName: formData.issueName,
      issueNumber: formData.issueNumber,
      publicationYear: parseInt(formData.publicationYear)
    });

    // Clean form và đóng pop-up
    setFormData({
      issueName: '',
      issueNumber: '',
      publicationYear: new Date().getFullYear()
    });
    handleClose();
  };

  return (
    <Modal show={show} onHide={handleClose} centered backdrop="static" className="text-main">
      <Modal.Header closeButton className="border-bottom-0 pb-0">
        <Modal.Title className="font-display fw-bold h5 text-main">Tạo Số Phát Hành Mới (Create New Issue)</Modal.Title>
      </Modal.Header>

      <Form onSubmit={handleSubmit}>
        <Modal.Body className="py-3 text-start">
          
          {/* Tên tiêu đề số / Tên Issue */}
          <Form.Group className="mb-3">
            <Form.Label className="fw-medium small text-main">Tên Issue (Issue name) <span className="text-danger">*</span></Form.Label>
            <Form.Control
              type="text"
              name="issueName"
              value={formData.issueName}
              onChange={handleChange}
              isInvalid={!!errors.issueName}
              placeholder="Ví dụ: Special Issue on Applied Deep Learning hoặc Regular Issue"
            />
            <Form.Control.Feedback type="invalid">{errors.issueName}</Form.Control.Feedback>
          </Form.Group>

          <Row className="g-3 mb-0">
            {/* Số hiệu định vị số (Issue Number) */}
            <Col xs={12} sm={6}>
              <Form.Group>
                <Form.Label className="fw-medium small text-main">Số định danh (Issue number) <span className="text-danger">*</span></Form.Label>
                <Form.Control
                  type="text"
                  name="issueNumber"
                  value={formData.issueNumber}
                  onChange={handleChange}
                  isInvalid={!!errors.issueNumber}
                  placeholder="Ví dụ: No. 1, No. 2, Vol. 3 No. 1..."
                />
                <Form.Control.Feedback type="invalid">{errors.issueNumber}</Form.Control.Feedback>
              </Form.Group>
            </Col>

            {/* Năm phát hành */}
            <Col xs={12} sm={6}>
              <Form.Group>
                <Form.Label className="fw-medium small text-main">Năm phát hành (Publication year)</Form.Label>
                <Form.Control
                  type="number"
                  name="publicationYear"
                  value={formData.publicationYear}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>
          </Row>

        </Modal.Body>
        <Modal.Footer className="border-top-0 pt-0">
          <Button variant="light" onClick={handleClose} className="btn-custom-sm text-main">Hủy bỏ</Button>
          <Button type="submit" className="btn-primary-glow px-3">Tạo Issue</Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}   