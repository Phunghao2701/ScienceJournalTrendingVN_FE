import { Modal, Button, Table } from 'react-bootstrap';
import { useProjectText } from '../../project/i18n/useProjectText';

const ManageKeywordsModal = ({ show, onHide, watchedKeywords, onRemove, actionLoading }) => {
  const p = useProjectText();
  return (
    <Modal show={show} onHide={onHide} centered size="lg" backdrop="static">
      <Modal.Header closeButton className="border-bottom-0 pb-0">
        <Modal.Title className="font-display fw-bold">{p('keywordWatchList')}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {Array.isArray(watchedKeywords) && watchedKeywords.length > 0 ? (
          <div className="table-responsive">
            <Table hover className="align-middle">
              <thead>
                <tr>
                  <th className="text-muted-custom font-sans fw-medium">{p('keyword')}</th>
                  <th className="text-muted-custom font-sans fw-medium text-end">{p('action')}</th>
                </tr>
              </thead>
              <tbody>
                {watchedKeywords.map((kw, idx) => {
                  const label = typeof kw === 'string'
                    ? kw
                    : kw.display_name || kw.keyword || kw.name;
                  const id = typeof kw === 'string'
                    ? kw
                    : kw.keyword_id || kw.id || kw.keywordId;
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
                          <i className="bi bi-trash3"></i> {p('remove')}
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
            {p('noWatchedKeywords')}
          </div>
        )}
      </Modal.Body>
      <Modal.Footer className="border-top-0 pt-0">
        <Button variant="light" className="text-muted-custom border" onClick={onHide}>
          {p('close')}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ManageKeywordsModal;
