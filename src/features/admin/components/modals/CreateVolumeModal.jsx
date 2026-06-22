import React, { useState } from 'react';
import { Modal, Button, Form, Row, Col } from 'react-bootstrap';
import { useJournalManagement } from '../../../journal/hooks/useJournalManagement';

/**
 * Component CreateVolumeModal - Cửa sổ Modal bật lên để Admin tạo Tập (Volume) mới.
 * Đáp ứng thiết kế Figma Hình 9.
 */
export default function CreateVolumeModal({ show, handleClose }) {
  const { createVolume } = useJournalManagement();

  // Trạng thái quản lý dữ liệu nhập vào của Form
  const [formData, setFormData] = useState({
    volumeNumber: '',
    publicationYear: '2024',
    frequency: 'Quarterly',
    totalExpectedIssues: '4',
    description: ''
  });

  // Quản lý thông báo hiển thị lỗi validate chữ đỏ
  const [errors, setErrors] = useState({});

  /** Xử lý cập nhật text liên tục khi gõ */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  /** Kiểm tra dữ liệu Form hợp lệ trước khi submit */
  const validateForm = () => {
    const newErrors = {};
    if (!formData.volumeNumber.trim()) {
      newErrors.volumeNumber = 'Volume number is required';
    }
    if (!formData.publicationYear) {
      newErrors.publicationYear = 'Publication year is required';
    }
    if (!formData.totalExpectedIssues || isNaN(formData.totalExpectedIssues) || parseInt(formData.totalExpectedIssues) <= 0) {
      newErrors.totalExpectedIssues = 'Total expected issues must be a positive number';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  /** Xử lý lưu mảng dữ liệu cục bộ */
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    createVolume({
      volumeNumber: formData.volumeNumber,
      publicationYear: parseInt(formData.publicationYear, 10),
      frequency: formData.frequency,
      totalExpectedIssues: parseInt(formData.totalExpectedIssues, 10),
      description: formData.description,
      totalIssues: 0,
      totalArticles: 0
    });

    // Reset sạch form và đóng modal
    setFormData({
      volumeNumber: '',
      publicationYear: '2024',
      frequency: 'Quarterly',
      totalExpectedIssues: '4',
      description: ''
    });
    handleClose();
  };

  return (
    <Modal show={show} onHide={handleClose} centered backdrop="static" className="text-main">
      <Modal.Header closeButton className="border-bottom-0 pb-0">
        <Modal.Title className="font-display fw-bold h5 text-main">Create New Volume</Modal.Title>
      </Modal.Header>

      <Form onSubmit={handleSubmit}>
        <Modal.Body className="py-3 text-start">
          
          {/* Row 1: Volume Number & Publication Year */}
          <Row className="g-3 mb-3">
            <Col xs={12} sm={6}>
              <Form.Group>
                <Form.Label className="fw-medium small text-main">Volume Number <span className="text-danger">*</span></Form.Label>
                <Form.Control
                  type="text"
                  name="volumeNumber"
                  value={formData.volumeNumber}
                  onChange={handleChange}
                  isInvalid={!!errors.volumeNumber}
                  placeholder="e.g., Volume 15"
                />
                <Form.Control.Feedback type="invalid">{errors.volumeNumber}</Form.Control.Feedback>
              </Form.Group>
            </Col>

            <Col xs={12} sm={6}>
              <Form.Group>
                <Form.Label className="fw-medium small text-main">Publication Year <span className="text-danger">*</span></Form.Label>
                <Form.Select
                  name="publicationYear"
                  value={formData.publicationYear}
                  onChange={handleChange}
                  isInvalid={!!errors.publicationYear}
                  style={{ cursor: 'pointer' }}
                >
                  <option value="2026">2026</option>
                  <option value="2025">2025</option>
                  <option value="2024">2024</option>
                  <option value="2023">2023</option>
                  <option value="2022">2022</option>
                  <option value="2021">2021</option>
                </Form.Select>
                <Form.Control.Feedback type="invalid">{errors.publicationYear}</Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>

          {/* Row 2: Frequency & Total Expected Issues */}
          <Row className="g-3 mb-3">
            <Col xs={12} sm={6}>
              <Form.Group>
                <Form.Label className="fw-medium small text-main">Frequency</Form.Label>
                <Form.Select 
                  name="frequency" 
                  value={formData.frequency} 
                  onChange={handleChange}
                  style={{ cursor: 'pointer' }}
                >
                  <option value="Quarterly">Quarterly</option>
                  <option value="Bi-annual">Bi-annual</option>
                  <option value="Annual">Annual</option>
                </Form.Select>
              </Form.Group>
            </Col>

            <Col xs={12} sm={6}>
              <Form.Group>
                <Form.Label className="fw-medium small text-main">Total Expected Issues <span className="text-danger">*</span></Form.Label>
                <Form.Control
                  type="number"
                  name="totalExpectedIssues"
                  value={formData.totalExpectedIssues}
                  onChange={handleChange}
                  isInvalid={!!errors.totalExpectedIssues}
                  placeholder="e.g. 4"
                />
                <Form.Control.Feedback type="invalid">{errors.totalExpectedIssues}</Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>

          {/* Row 3: Description / Internal Notes */}
          <Form.Group className="mb-0">
            <Form.Label className="fw-medium small text-main">Description / Internal Notes</Form.Label>
            <Form.Control
              as="textarea"
              rows={4}
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Enter administrative notes or volume specific objectives..."
            />
          </Form.Group>

        </Modal.Body>
        <Modal.Footer className="border-top-0 pt-0">
          <Button variant="light" onClick={handleClose} className="btn-custom-sm text-main border">
            Cancel
          </Button>
          <Button type="submit" className="btn-primary-glow px-3">
            Create Volume
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}
