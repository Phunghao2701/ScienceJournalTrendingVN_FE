import React, { useState } from 'react';
import { Modal, Button, Form, Row, Col } from 'react-bootstrap';
import { useJournalManagement } from '../../../journal/hooks/useJournalManagement';

/**
 * Component CreateIssueModal - Cửa sổ Modal bật lên để Admin thêm Số phát hành (Issue) mới vào Volume đang chọn.
 * Khớp hoàn toàn với thiết kế Figma Hình 7.
 */
export default function CreateIssueModal({ show, handleClose }) {
  const { createIssue } = useJournalManagement();

  // Khởi tạo state cho Form dữ liệu Số phát hành
  const [formData, setFormData] = useState({
    issueName: '',
    issueNumber: '1',
    publicationYear: '2024'
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
    if (!formData.issueName.trim()) {
      newErrors.issueName = 'Tên issue không được để trống';
    }
    if (!formData.issueNumber.toString().trim()) {
      newErrors.issueNumber = 'Số issue không được để trống';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /** Xử lý nhấn nút Tạo Issue */
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    // Convert issue number to format "No. X" if it is just a number
    let formattedNumber = formData.issueNumber;
    if (!isNaN(formData.issueNumber)) {
      formattedNumber = `No. ${formData.issueNumber}`;
    }

    createIssue({
      issueName: formData.issueName,
      issueNumber: formattedNumber,
      publicationYear: parseInt(formData.publicationYear, 10),
      status: 'Scheduled'
    });

    // Clean form và đóng pop-up
    setFormData({
      issueName: '',
      issueNumber: '1',
      publicationYear: '2024'
    });
    handleClose();
  };

  return (
    <Modal show={show} onHide={handleClose} centered backdrop="static" className="text-main">
      <Modal.Header closeButton className="border-bottom-0 pb-0">
        <Modal.Title className="font-display fw-bold h5 text-main">Tạo Issue Mới</Modal.Title>
      </Modal.Header>

      <Form onSubmit={handleSubmit}>
        <Modal.Body className="py-3 text-start">
          <p className="text-muted-custom small mb-3">
            Điền thông tin chi tiết để bắt đầu một số xuất bản mới.
          </p>
          
          {/* Tên Issue */}
          <Form.Group className="mb-3">
            <Form.Label className="fw-medium small text-main">Tên Issue <span className="text-danger">*</span></Form.Label>
            <Form.Control
              type="text"
              name="issueName"
              value={formData.issueName}
              onChange={handleChange}
              isInvalid={!!errors.issueName}
              placeholder="Ví dụ: Special Edition on AI"
            />
            <Form.Control.Feedback type="invalid">{errors.issueName}</Form.Control.Feedback>
          </Form.Group>

          <Row className="g-3 mb-0">
            {/* Số Issue */}
            <Col xs={12} sm={6}>
              <Form.Group>
                <Form.Label className="fw-medium small text-main">Số Issue <span className="text-danger">*</span></Form.Label>
                <Form.Control
                  type="number"
                  name="issueNumber"
                  value={formData.issueNumber}
                  onChange={handleChange}
                  isInvalid={!!errors.issueNumber}
                  placeholder="Ví dụ: 1"
                />
                <Form.Control.Feedback type="invalid">{errors.issueNumber}</Form.Control.Feedback>
              </Form.Group>
            </Col>

            {/* Năm xuất bản */}
            <Col xs={12} sm={6}>
              <Form.Group>
                <Form.Label className="fw-medium small text-main">Năm xuất bản</Form.Label>
                <Form.Control
                  type="number"
                  name="publicationYear"
                  value={formData.publicationYear}
                  onChange={handleChange}
                  placeholder="2024"
                />
              </Form.Group>
            </Col>
          </Row>

        </Modal.Body>
        <Modal.Footer className="border-top-0 pt-0">
          <Button variant="light" onClick={handleClose} className="btn-custom-sm text-main border">
            Hủy
          </Button>
          <Button type="submit" className="btn-primary-glow px-3">
            Tạo Issue
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}
