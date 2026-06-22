import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, ListGroup } from 'react-bootstrap';
import { Icon } from '@iconify/react';
import { useJournalManagement } from '../../../journal/hooks/useJournalManagement';

/**
 * Component SwitchJournalModal - Cửa sổ bật lên phục vụ Admin đổi nhanh Tạp chí đang làm việc.
 * Thiết kế khớp 100% với Figma Hình 4.
 */
export default function SwitchJournalModal({ show, handleClose }) {
  const { journals, currentJournal, setCurrentJournal } = useJournalManagement();
  const [searchTerm, setSearchTerm] = useState('');
  const [tempSelectedId, setTempSelectedId] = useState(null);

  // Sync tempSelectedId when currentJournal changes or modal opens
  useEffect(() => {
    if (currentJournal) {
      setTempSelectedId(currentJournal.id);
    }
  }, [currentJournal, show]);

  // Thực hiện bộ lọc tìm kiếm tạp chí nhanh ngay trên Modal
  const matchedJournals = (journals || []).filter(j => 
    (j.title || j.display_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (j.issn || '').includes(searchTerm)
  );

  const handleConfirmSelect = () => {
    if (tempSelectedId) {
      setCurrentJournal(tempSelectedId);
      setSearchTerm('');
      handleClose();
    }
  };

  return (
    <Modal show={show} onHide={handleClose} centered className="text-main">
      <Modal.Header closeButton className="border-bottom-0 pb-0">
        <div>
          <Modal.Title className="font-display fw-bold h4 text-main mb-1">Switch Journal</Modal.Title>
          <small className="text-muted-custom">
            Select which repository context you wish to manage.
          </small>
        </div>
      </Modal.Header>
      
      <Modal.Body className="py-3 text-start">
        {/* Ô nhập từ khóa lọc nhanh */}
        <Form.Group className="mb-3">
          <div className="input-group">
            <span className="input-group-text bg-light border-end-0">
              <Icon icon="lucide:search" className="text-muted" width="16" />
            </span>
            <Form.Control
              type="text"
              placeholder="Filter journals by name or ISSN..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border-start-0"
              style={{ backgroundColor: '#ffffff', borderColor: 'var(--border)' }}
            />
          </div>
        </Form.Group>

        {/* Danh sách kết quả hiển thị */}
        <ListGroup className="overflow-y-auto gap-2" style={{ maxHeight: '320px', paddingRight: '4px' }}>
          {matchedJournals.map((j) => {
            const isCurrent = j.id === currentJournal?.id;
            const isTempSelected = j.id === tempSelectedId;
            return (
              <ListGroup.Item
                key={j.id}
                onClick={() => setTempSelectedId(j.id)}
                className="admin-switch-journal-item rounded-3"
                style={{
                  border: isTempSelected ? '2px solid var(--primary)' : '1px solid var(--border)',
                  margin: isTempSelected ? '-1px' : '0',
                  backgroundColor: '#ffffff',
                  transition: 'all 0.15s ease',
                  cursor: 'pointer',
                }}
              >
                <div className="admin-switch-journal-item__main">
                  <div className="admin-switch-journal-item__icon">
                    <Icon icon="lucide:book" width="18" />
                  </div>
                  <div className="admin-switch-journal-item__content">
                    <div className="admin-switch-journal-item__title-row">
                      <span className="fw-bold text-main">{j.title}</span>
                      {isCurrent && (
                        <span className="badge admin-status-badge admin-status-badge--warning text-uppercase text-xs font-semibold px-2 py-0.5 rounded-pill">
                          Current
                        </span>
                      )}
                    </div>
                    <small className="text-muted-custom small d-block mt-0.5">
                      {j.subjectCategory || 'General Science'} • ISSN: {j.issn}
                    </small>
                  </div>
                </div>

                <div className="admin-switch-journal-item__side">
                  <span className={`badge px-2 py-1.5 rounded-pill text-uppercase text-xs ${
                    j.status === 'Active'
                      ? 'admin-status-badge admin-status-badge--accent'
                      : 'admin-status-badge admin-status-badge--muted'
                  }`}>
                    {j.status || 'Draft'}
                  </span>
                </div>
              </ListGroup.Item>
            );
          })}
          {matchedJournals.length === 0 && (
            <div className="text-center py-4 text-muted-custom">
              No journals match your filter criteria.
            </div>
          )}
        </ListGroup>
      </Modal.Body>

      <Modal.Footer className="border-top-0 pt-0 d-flex justify-content-end align-items-center gap-3">
        <Button 
          variant="link" 
          onClick={handleClose} 
          className="text-decoration-none text-muted-custom fw-semibold font-sans py-2 px-3"
          style={{ fontSize: '0.9rem' }}
        >
          Cancel
        </Button>
        <Button 
          onClick={handleConfirmSelect} 
          className="btn-primary-glow font-sans py-2 px-4"
          disabled={!tempSelectedId}
        >
          Select Journal
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
