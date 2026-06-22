import React, { useState } from 'react';
import { Modal, Button, Form, ListGroup } from 'react-bootstrap';
import { Icon } from '@iconify/react';
import { useJournalManagement } from '../../hooks/useJournalManagement';

/**
 * Component SwitchJournalModal - Cửa sổ bật lên phục vụ Admin đổi nhanh Tạp chí đang làm việc.
 */
export default function SwitchJournalModal({ show, handleClose }) {
  const { journals, currentJournal, setCurrentJournal } = useJournalManagement();
  const [searchTerm, setSearchTerm] = useState('');

  // Thực hiện bộ lọc tìm kiếm tạp chí nhanh ngay trên Modal
  const matchedJournals = journals.filter(j => 
    (j.title || j.display_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (j.issn || '').includes(searchTerm)
  );

  return (
    <Modal show={show} onHide={handleClose} centered className="text-main">
      <Modal.Header closeButton className="border-bottom-0 pb-0">
        <Modal.Title className="font-display fw-bold h5 text-main">Chuyển Đổi Tạp Chí Quản Lý</Modal.Title>
      </Modal.Header>
      <Modal.Body className="py-3">
        {/* Ô nhập từ khóa lọc nhanh */}
        <Form.Group className="mb-3">
          <Form.Control
            type="text"
            placeholder="Tìm theo tên tạp chí hoặc mã ISSN..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ backgroundColor: 'var(--bg-chip)', borderColor: 'var(--border)' }}
          />
        </Form.Group>

        {/* Danh sách kết quả hiển thị */}
        <ListGroup className="overflow-y-auto" style={{ maxHeight: '280px' }}>
          {matchedJournals.map((j) => {
            const isCurrent = j.id === currentJournal?.id;
            return (
              <ListGroup.Item
                key={j.id}
                action
                disabled={isCurrent} // Khóa bấm nếu chính là tạp chí đang mở sẵn rồi
                onClick={() => {
                  setCurrentJournal(j.id);
                  setSearchTerm('');
                  handleClose();
                }}
                className="d-flex justify-content-between align-items-center py-2.5 text-start"
              >
                <div className="text-truncate pe-2">
                  <div className="fw-semibold text-main text-truncate">{j.title}</div>
                  <small className="text-muted-custom font-monospace">ISSN: {j.issn}</small>
                </div>
                {isCurrent && (
                  <span className="badge bg-dark-solid text-white text-xs py-1 px-1.5 rounded d-flex align-items-center gap-0.5 flex-shrink-0">
                    <Icon icon="lucide:check" width="10" /> Active
                  </span>
                )}
              </ListGroup.Item>
            );
          })}
        </ListGroup>
      </Modal.Body>
      <Modal.Footer className="border-top-0 pt-0">
        <Button variant="light" size="sm" onClick={handleClose} className="btn-custom-sm text-main">
          Đóng lại
        </Button>
      </Modal.Footer>
    </Modal>
  );
}