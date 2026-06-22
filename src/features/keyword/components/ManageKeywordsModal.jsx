import React from 'react';
import { Modal, Button, Table } from 'react-bootstrap';

const ManageKeywordsModal = ({ show, onHide, watchedKeywords, onRemove, actionLoading }) => {
  return (
    <Modal show={show} onHide={onHide} centered size="lg" backdrop="static">
      <Modal.Header closeButton className="border-bottom-0 pb-0">
        <Modal.Title className="font-display fw-bold">Quản lý Keyword Watch List</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {Array.isArray(watchedKeywords) && watchedKeywords.length > 0 ? (
          <div className="table-responsive">
            <Table hover className="align-middle">
              <thead>
                <tr>
                  <th className="text-muted-custom font-sans fw-medium">Keyword</th>
                  <th className="text-muted-custom font-sans fw-medium text-end">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {watchedKeywords.map((kw, idx) => {
                  const label = typeof kw === 'string' ? kw : kw.keyword || kw.name;
                  const id = typeof kw === 'string' ? kw : kw.id || kw.keywordId;
                  return (
                    <tr key={idx}>
                      <td className="fw-medium text-main">{label}</td>
                      <td className="text-end">
                        <Button 
                          variant="link" 
                          className="text-danger p-0 border-0 text-decoration-none"
                          onClick={() => onRemove(id)}
                          disabled={actionLoading}
                        >
                          <i className="bi bi-trash3"></i> Xóa
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          </div>
        ) : (
          <div className="text-center py-4 text-muted-custom">
            Chưa có keyword nào trong danh sách theo dõi.
          </div>
        )}
      </Modal.Body>
      <Modal.Footer className="border-top-0 pt-0">
        <Button variant="light" className="text-muted-custom border" onClick={onHide}>
          Đóng
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ManageKeywordsModal;
