import { useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { useProjectText } from '../../project/i18n/useProjectText';

const AddKeywordModal = ({ show, onHide, onAdd, actionLoading }) => {
  const [keyword, setKeyword] = useState('');
  const [submitError, setSubmitError] = useState('');
  const p = useProjectText();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!keyword.trim()) return;
    setSubmitError('');
    try {
      await onAdd(keyword.trim());
      setKeyword('');
      onHide();
    } catch (err) {
      setSubmitError(
        err.response?.data?.message
          || err.message
          || p('addKeywordFailed'),
      );
    }
  };

  const handleHide = () => {
    setSubmitError('');
    onHide();
  };

  return (
    <Modal show={show} onHide={handleHide} centered backdrop="static">
      <Modal.Header closeButton className="border-bottom-0 pb-0">
        <Modal.Title className="font-display fw-bold">{p('addWatchedKeyword')}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label className="text-muted-custom small">{p('keyword')}</Form.Label>
            <Form.Control 
              type="text" 
              placeholder={p('keywordExample')}
              value={keyword}
              onChange={(e) => {
                setKeyword(e.target.value);
                setSubmitError('');
              }}
              disabled={actionLoading}
              isInvalid={Boolean(submitError)}
              required
              autoFocus
            />
            <Form.Control.Feedback type="invalid">
              {submitError}
            </Form.Control.Feedback>
          </Form.Group>
          <div className="d-flex justify-content-end gap-2 mt-4">
            <Button variant="light" className="text-muted-custom border" onClick={handleHide} disabled={actionLoading}>
              {p('cancel')}
            </Button>
            <Button type="submit" variant="primary" className="btn-primary-glow" disabled={actionLoading || !keyword.trim()}>
              {actionLoading ? p('adding') : p('addKeyword')}
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default AddKeywordModal;
