import React, { useState } from 'react';
import { Modal, Button, Form, Row, Col } from 'react-bootstrap';
import { useJournalManagement } from '../../hooks/useJournalManagement';

/**
 * Component CreateVolumeModal - Cửa sổ Modal bật lên để Admin tạo Tập (Volume) mới.
 * Đáp ứng Issue #76: Các trường gồm Volume number, Publication year, Frequency, Description.
 */
export default function CreateVolumeModal({ show, handleClose }) {
  const { createVolume } = useJournalManagement();

  // Trạng thái quản lý dữ liệu nhập vào của Form
  const [formData, setFormData] = useState({
    volumeNumber: '',
    publicationYear: new Date().getFullYear(),
    frequency: 'Quarterly',
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
    if (!formData.volumeNumber.trim()) newErrors.volumeNumber = 'Số hiệu Volume không được trống (Ví dụ: Volume 3)';
    if (!formData.publicationYear) newErrors.publicationYear = 'Năm xuất bản không được trống';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /** Xử lý lưu mảng dữ liệu cục bộ */
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    createVolume({
      volumeNumber: formData.volumeNumber,
      publicationYear: parseInt(formData.publicationYear),
      frequency: formData.frequency,
      description: formData.description
    });

    // Reset sạch form và đóng modal
    setFormData({
      volumeNumber: '',
      publicationYear: new Date().getFullYear(),
      frequency: 'Quarterly',
      description: ''
    });
    handleClose();
  };

  return (
    <Modal show={show} onHide={handleClose} centered backdrop="static" className="text-main">
      <Modal.Header closeButton className="border-bottom-0 pb-0">
        <Modal.Title className="font-display fw-bold h5 text-main">Tạo Tập Mới (Create New Volume)</Modal.Title>
      </Modal.Header>

      <Form onSubmit={handleSubmit}>
        <Modal.Body className="py-3 text-start">
          
          {/* Số hiệu Volume */}
          <Form.Group className="mb-3">
            <Form.Label className="fw-medium small text-main">Số Volume (Volume number) <span className="text-danger">*</span></Form.Label>
            <Form.Control
              type="text"
              name="volumeNumber"
              value={formData.volumeNumber}
              onChange={handleChange}
              isInvalid={!!errors.volumeNumber}
              placeholder="Ví dụ: Volume 3, Volume 4..."
            />
            <Form.Control.Feedback type="invalid">{errors.volumeNumber}</Form.Control.Feedback>
          </Form.Group>

          <Row className="g-3 mb-3">
            {/* Năm xuất bản */}
            <Col xs={12} sm={6}>
              <Form.Group>
                <Form.Label className="fw-medium small text-main">Năm xuất bản (Publication year) <span className="text-danger">*</span></Form.Label>
                <Form.Control
                  type="number"
                  name="publicationYear"
                  value={formData.publicationYear}
                  onChange={handleChange}
                  isInvalid={!!errors.publicationYear}
                />
                <Form.Control.Feedback type="invalid">{errors.publicationYear}</Form.Control.Feedback>
              </Form.Group>
            </Col>

            {/* Tần suất ra số */}
            <Col xs={12} sm={6}>
              <Form.Group>
                <Form.Label className="fw-medium small text-main">Tần suất xuất bản (Frequency)</Form.Label>
                <Form.Select name="frequency" value={formData.frequency} onChange={handleChange}>
                  <option value="Quarterly">Hàng quý (Quarterly)</option>
                  <option value="Bi-annual">Nửa năm một lần (Bi-annual)</option>
                  <option value="Annual">Hàng năm (Annual)</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>

          {/* Ghi chú nội bộ */}
          <Form.Group className="mb-0">
            <Form.Label className="fw-medium small text-main">Mô tả / Ghi chú nội bộ (Internal notes)</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Nhập các ghi chú hoặc mô tả ngắn gọn về tập xuất bản này..."
            />
          </Form.Group>

        </Modal.Body>
        <Modal.Footer className="border-top-0 pt-0">
          <Button variant="light" onClick={handleClose} className="btn-custom-sm text-main">Hủy</Button>
          <Button type="submit" className="btn-primary-glow px-3">Tạo Volume</Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}