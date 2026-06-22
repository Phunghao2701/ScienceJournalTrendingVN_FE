/**
 * File source thuộc hệ thống FE ResearchPulse.
 *
 * File: features\journal\components\AddToProjectModal.jsx
 */
import { useState, useEffect } from 'react';
import { Modal, Button, Form, Spinner, Alert } from 'react-bootstrap';
import { Icon } from '@iconify/react';
import { getProjectsApi, createProjectApi, getProjectByIdApi, updateProjectApi } from '../../project/api/project.api';

export default function AddToProjectModal({ show, onHide, journalId, onConfirm }) {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  
  // Selection mode: 'select' (choose existing) or 'create' (create new)
  const [mode, setMode] = useState('select');
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [newProjectTitle, setNewProjectTitle] = useState('');

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const res = await getProjectsApi();
      if (res.data?.success && res.data?.data) {
        setProjects(res.data.data);
      } else {
        setProjects([]);
      }
    } catch (err) {
      console.error('Error fetching projects:', err);
      setError('Không thể tải danh sách dự án. Vui lòng thử lại!');
    } finally {
      setLoading(false);
    }
  };

  // Fetch projects on show and reset form state
  useEffect(() => {
    if (!show) return;
    setError(null);
    setSuccess(false);
    setMode('select');
    setSelectedProjectId('');
    setNewProjectTitle('');
    fetchProjects();
  }, [show]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      if (mode === 'create') {
        if (!newProjectTitle.trim()) {
          setError('Vui lòng nhập tên dự án mới');
          setSubmitting(false);
          return;
        }

        // Create new project with current journal ID
        const res = await createProjectApi({
          title: newProjectTitle.trim(),
          journal_ids: [parseInt(journalId, 10)]
        });

        if (res.data?.success) {
          setSuccess(true);
          setTimeout(() => {
            onHide();
            if (onConfirm) onConfirm(res.data.data.project_id); // triggers callback to refresh detail page if necessary
          }, 1500);
        } else {
          setError(res.data?.message || 'Tạo dự án mới thất bại');
        }
      } else {
        if (!selectedProjectId) {
          setError('Vui lòng chọn một dự án');
          setSubmitting(false);
          return;
        }

        // Fetch details of selected project to append journal
        const detailsRes = await getProjectByIdApi(selectedProjectId);
        if (!detailsRes.data?.success || !detailsRes.data?.data) {
          throw new Error('Không thể lấy chi tiết dự án để cập nhật');
        }

        const project = detailsRes.data.data;
        const currentJournalIds = project.journals?.map(j => j.journal_id) || [];
        
        const numericJournalId = parseInt(journalId, 10);
        if (currentJournalIds.includes(numericJournalId)) {
          setError('Tạp chí này đã tồn tại trong dự án đã chọn!');
          setSubmitting(false);
          return;
        }

        // Call update API
        const updateRes = await updateProjectApi(selectedProjectId, {
          title: project.title,
          subject_area: project.subject_area?.subject_area_id || null,
          subject_category_ids: project.subject_categories?.map(c => c.subject_category_id) || [],
          journal_ids: [...currentJournalIds, numericJournalId]
        });

        if (updateRes.data?.success) {
          setSuccess(true);
          setTimeout(() => {
            onHide();
            if (onConfirm) onConfirm(selectedProjectId);
          }, 1500);
        } else {
          setError(updateRes.data?.message || 'Thêm tạp chí vào dự án thất bại');
        }
      }
    } catch (err) {
      console.error('Error adding to project:', err);
      setError(err.response?.data?.message || err.message || 'Đã có lỗi xảy ra');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      show={show}
      onHide={onHide}
      centered
      contentClassName="border-0 text-start text-main rounded-3 shadow"
      style={{ backdropFilter: 'blur(4px)' }}
    >
      <Modal.Header 
        closeButton 
        className="border-0 pb-0"
        style={{ backgroundColor: 'var(--bg-card)' }}
      >
        <Modal.Title className="font-display fw-bold text-main d-flex align-items-center gap-2" style={{ fontSize: '1.25rem' }}>
          <Icon icon="lucide:folder-plus" className="text-primary" width="22" />
          Thêm tạp chí vào Dự án
        </Modal.Title>
      </Modal.Header>

      <Form onSubmit={handleSubmit}>
        <Modal.Body className="py-4" style={{ backgroundColor: 'var(--bg-card)', color: 'var(--text-main)' }}>
          {error && <Alert variant="danger">{error}</Alert>}
          {success && <Alert variant="success">Đã thêm tạp chí vào dự án thành công!</Alert>}

          <Form.Group className="mb-4">
            <Form.Label className="fw-semibold mb-2" style={{ fontSize: '0.9rem' }}>Phương thức</Form.Label>
            <div className="d-flex gap-3">
              <Form.Check
                type="radio"
                label="Chọn dự án đã có"
                name="projectMode"
                id="modeSelect"
                checked={mode === 'select'}
                onChange={() => setMode('select')}
                className="custom-radio"
              />
              <Form.Check
                type="radio"
                label="Tạo dự án mới"
                name="projectMode"
                id="modeCreate"
                checked={mode === 'create'}
                onChange={() => setMode('create')}
                className="custom-radio"
              />
            </div>
          </Form.Group>

          {mode === 'select' ? (
            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold mb-2" style={{ fontSize: '0.9rem' }}>Chọn Dự án của bạn</Form.Label>
              {loading ? (
                <div className="d-flex align-items-center gap-2 py-2 text-muted-custom">
                  <Spinner animation="border" size="sm" />
                  <span>Đang tải danh sách dự án...</span>
                </div>
              ) : projects.length === 0 ? (
                <div className="text-muted-custom py-2" style={{ fontSize: '0.9rem' }}>
                  Bạn chưa có dự án nào. Vui lòng chọn "Tạo dự án mới" để bắt đầu!
                </div>
              ) : (
                <Form.Select
                  value={selectedProjectId}
                  onChange={(e) => setSelectedProjectId(e.target.value)}
                  className="journal-dark-input"
                  style={{
                    backgroundColor: 'var(--bg-main)',
                    color: 'var(--text-main)',
                    borderColor: 'var(--border)',
                    borderRadius: '8px',
                    padding: '0.6rem 1rem'
                  }}
                >
                  <option value="">-- Chọn dự án --</option>
                  {projects.map((p) => (
                    <option key={p.project_id} value={p.project_id}>
                      {p.title}
                    </option>
                  ))}
                </Form.Select>
              )}
            </Form.Group>
          ) : (
            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold mb-2" style={{ fontSize: '0.9rem' }}>Tên Dự án mới</Form.Label>
              <Form.Control
                type="text"
                placeholder="Nhập tiêu đề dự án nghiên cứu..."
                value={newProjectTitle}
                onChange={(e) => setNewProjectTitle(e.target.value)}
                className="journal-dark-input"
                style={{
                  backgroundColor: 'var(--bg-main)',
                  color: 'var(--text-main)',
                  borderColor: 'var(--border)',
                  borderRadius: '8px',
                  padding: '0.6rem 1rem'
                }}
                required
              />
            </Form.Group>
          )}
        </Modal.Body>

        <Modal.Footer className="border-0 pt-0" style={{ backgroundColor: 'var(--bg-card)', gap: '8px' }}>
          <Button 
            variant="outline-secondary" 
            onClick={onHide}
            disabled={submitting}
            style={{ 
              borderRadius: '6px',
              fontSize: '0.9rem',
              fontWeight: 600
            }}
          >
            Hủy
          </Button>

          <Button 
            type="submit"
            disabled={submitting || (mode === 'select' && projects.length === 0)}
            className="btn-primary-glow border-0 text-white d-flex align-items-center gap-1.5"
            style={{ 
              borderRadius: '6px', 
              fontSize: '0.9rem', 
              fontWeight: 600 
            }}
          >
            {submitting && <Spinner animation="border" size="sm" />}
            <span>Xác nhận</span>
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}
