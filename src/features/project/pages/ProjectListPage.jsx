import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Modal } from 'react-bootstrap';
import ROUTES from '../../../app/routes/routePaths';
import useProjects from '../hooks/useProjects';
import ProjectCard from '../components/ProjectCard';
import EmptyState from '../../../shared/components/EmptyState';
import LoadingSkeleton from '../../../shared/components/LoadingSkeleton';
import { Icon } from '@iconify/react';
import { useProjectText } from '../i18n/useProjectText';

const ProjectListPage = () => {
  const navigate = useNavigate();
  const p = useProjectText();
  const { projects, isLoading, error, fetchProjects, deleteProject } = useProjects();
  const [query, setQuery] = useState('');
  const [projectToDelete, setProjectToDelete] = useState(null);
  const [deleteError, setDeleteError] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const filteredProjects = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase('vi');
    if (!normalizedQuery) return projects;

    return projects.filter((project) => {
      const areaName =
        project.subject_area?.display_name ||
        project.subject_area?.name ||
        project.subject_area_name ||
        project.subject_area ||
        '';
      return `${project.title || ''} ${areaName}`
        .toLocaleLowerCase('vi')
        .includes(normalizedQuery);
    });
  }, [projects, query]);

  const handleDelete = async () => {
    if (!projectToDelete) return;
    const projectId = projectToDelete.project_id || projectToDelete.id;
    setIsDeleting(true);
    setDeleteError('');
    try {
      await deleteProject(projectId);
      setProjectToDelete(null);
    } catch (err) {
      setDeleteError(
        err.response?.data?.message ||
        err.message ||
        p('deleteFailed'),
      );
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="project-list-page container-fluid py-4 grid-bg min-vh-100">
      <div className="container mx-auto" style={{ maxWidth: '1200px', marginTop: '20px' }}>
        {/* Breadcrumb */}
        <nav aria-label="breadcrumb" className="mb-4">
          <ol className="breadcrumb mb-2 text-muted-custom small">
            <li className="breadcrumb-item"><Link to={ROUTES.DASHBOARD} className="text-decoration-none text-muted-custom hover-primary">{p('overview')}</Link></li>
            <li className="breadcrumb-item active" aria-current="page">{p('projects')}</li>
          </ol>
        </nav>

        {/* Page Header */}
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-5">
          <div>
            <h1 className="font-display fw-bold text-main mb-2">{p('myProjects')}</h1>
            <p className="text-muted-custom mb-0">{p('projectsHint')}</p>
          </div>
          <button 
            className="btn btn-primary btn-primary-glow px-4 py-2 fw-medium d-flex align-items-center gap-2 rounded-pill"
            onClick={() => navigate(ROUTES.PROJECT_CREATE)}
          >
            <Icon icon="lucide:plus" width="18" /> {p('createProject')}
          </button>
        </div>

        {/* Filter / Search Bar Placeholder */}
        <div className="d-flex justify-content-between align-items-center mb-4 pb-2 border-bottom">
          <div className="position-relative" style={{ maxWidth: '300px', width: '100%' }}>
            <Icon icon="lucide:search" width="18" className="position-absolute top-50 translate-middle-y text-muted" style={{ left: '12px' }} />
            <input 
              type="text" 
              className="form-control rounded-pill ps-5 bg-white border" 
              placeholder={p('searchProjects')}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              aria-label={p('searchProjects')}
              style={{ fontSize: '0.9rem' }}
            />
          </div>
          <div className="d-flex gap-4 text-muted-custom small">
            <span>{p('totalProjects')}: <strong className="text-main">{projects.length}</strong></span>
            {query.trim() && (
              <span>{p('results')}: <strong className="text-main">{filteredProjects.length}</strong></span>
            )}
          </div>
        </div>

        {/* Content */}
        {error ? (
          <div className="alert alert-danger border-0 rounded-4 shadow-sm p-4 d-flex align-items-center gap-3">
            <Icon icon="lucide:alert-triangle" width="24" className="text-danger flex-shrink-0" />
            <div>
              <h6 className="fw-bold mb-1">{p('unableLoadProjects')}</h6>
              <p className="mb-0 small">{error}</p>
            </div>
            <button className="btn btn-outline-danger btn-sm ms-auto" onClick={fetchProjects}>{p('tryAgain')}</button>
          </div>
        ) : isLoading ? (
          <div className="row g-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="col-12 col-md-6 col-lg-4">
                <div className="card glass-card border-0 shadow-sm rounded-4 p-4 h-100">
                  <LoadingSkeleton height="24px" width="40%" className="mb-3 rounded-pill" />
                  <LoadingSkeleton height="28px" width="80%" className="mb-4 rounded" />
                  <LoadingSkeleton height="16px" width="60%" className="mb-2 rounded" />
                  <LoadingSkeleton height="16px" width="50%" className="mb-4 rounded" />
                  <LoadingSkeleton height="1px" width="100%" className="mb-3 rounded" />
                  <div className="d-flex justify-content-between mt-auto">
                    <LoadingSkeleton height="16px" width="40%" className="rounded" />
                    <LoadingSkeleton height="16px" width="20%" className="rounded" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : projects.length === 0 ? (
          <EmptyState 
            title={p('noProjects')}
            description={p('noProjectsHint')}
            icon="lucide:folder-open" 
            actionLabel={`+ ${p('createProject')}`}
            onAction={() => navigate(ROUTES.PROJECT_CREATE)}
            className="mt-4"
          />
        ) : filteredProjects.length === 0 ? (
          <EmptyState
            title={p('noMatchingProjects')}
            description={`${p('noProjectMatchPrefix')} “${query.trim()}”. ${p('noProjectMatchSuffix')}`}
            icon="lucide:search-x"
            actionLabel={p('clearSearch')}
            onAction={() => setQuery('')}
            className="mt-4"
          />
        ) : (
          <div className="row g-4">
            {filteredProjects.map(project => (
              <div key={project.project_id || project.id} className="col-12 col-md-6 col-lg-4">
                <ProjectCard project={project} onDelete={setProjectToDelete} />
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal
        show={Boolean(projectToDelete)}
        onHide={() => !isDeleting && setProjectToDelete(null)}
        centered
      >
        <Modal.Header closeButton={!isDeleting}>
          <Modal.Title className="fs-5">{p('deleteProject')}?</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className="mb-2">
            <strong>{projectToDelete?.title}</strong>. {p('deleteConfirm')}
          </p>
          <p className="text-muted-custom small mb-0">{p('irreversible')}</p>
          {deleteError && (
            <div className="alert alert-danger mt-3 mb-0" role="alert">
              {deleteError}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <button
            type="button"
            className="btn btn-light border"
            onClick={() => setProjectToDelete(null)}
            disabled={isDeleting}
          >
            {p('keepProject')}
          </button>
          <button
            type="button"
            className="btn btn-danger d-flex align-items-center gap-2"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting && <span className="spinner-border spinner-border-sm" aria-hidden="true" />}
            {p('deleteProject')}
          </button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default ProjectListPage;
