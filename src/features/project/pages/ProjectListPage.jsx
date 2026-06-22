import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ROUTES from '../../../app/routes/routePaths';
import useProjects from '../hooks/useProjects';
import ProjectCard from '../components/ProjectCard';
import EmptyState from '../../../shared/components/EmptyState';
import LoadingSkeleton from '../../../shared/components/LoadingSkeleton';
import { Icon } from '@iconify/react';

const ProjectListPage = () => {
  const navigate = useNavigate();
  const { projects, isLoading, error, fetchProjects, deleteProject } = useProjects();

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const handleDelete = async (id) => {
    try {
      await deleteProject(id);
    } catch (err) {
      alert(err.message || 'Không thể xóa dự án');
    }
  };

  return (
    <div className="container-fluid py-4 grid-bg min-vh-100">
      <div className="container mx-auto" style={{ maxWidth: '1200px', marginTop: '20px' }}>
        {/* Breadcrumb */}
        <nav aria-label="breadcrumb" className="mb-4">
          <ol className="breadcrumb mb-2 text-muted-custom small">
            <li className="breadcrumb-item"><Link to={ROUTES.DASHBOARD} className="text-decoration-none text-muted-custom hover-primary">Tổng quan</Link></li>
            <li className="breadcrumb-item active" aria-current="page">Dự án theo dõi</li>
          </ol>
        </nav>

        {/* Page Header */}
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-5">
          <div>
            <h1 className="font-display fw-bold text-main mb-2">Dự án Nghiên cứu của tôi</h1>
            <p className="text-muted-custom mb-0">Quản lý các keyword watch-lists, phân tích xu hướng xuất bản và giám sát bài báo khoa học.</p>
          </div>
          <button 
            className="btn btn-primary btn-primary-glow px-4 py-2 fw-medium d-flex align-items-center gap-2 rounded-pill"
            onClick={() => navigate(ROUTES.PROJECT_CREATE)}
          >
            <Icon icon="lucide:plus" width="18" /> Tạo dự án mới
          </button>
        </div>

        {/* Filter / Search Bar Placeholder */}
        <div className="d-flex justify-content-between align-items-center mb-4 pb-2 border-bottom">
          <div className="position-relative" style={{ maxWidth: '300px', width: '100%' }}>
            <Icon icon="lucide:search" width="18" className="position-absolute top-50 translate-middle-y text-muted" style={{ left: '12px' }} />
            <input 
              type="text" 
              className="form-control rounded-pill ps-5 bg-white border" 
              placeholder="Tìm kiếm dự án..." 
              style={{ fontSize: '0.9rem' }}
            />
          </div>
          <div className="d-flex gap-4 text-muted-custom small">
            <span>Tổng số dự án: <strong className="text-main">{projects.length}</strong></span>
            <span>Đang hoạt động: <strong className="text-success">{projects.length}</strong></span>
          </div>
        </div>

        {/* Content */}
        {error ? (
          <div className="alert alert-danger border-0 rounded-4 shadow-sm p-4 d-flex align-items-center gap-3">
            <Icon icon="lucide:alert-triangle" width="24" className="text-danger flex-shrink-0" />
            <div>
              <h6 className="fw-bold mb-1">Lỗi tải dữ liệu</h6>
              <p className="mb-0 small">{error}</p>
            </div>
            <button className="btn btn-outline-danger btn-sm ms-auto" onClick={fetchProjects}>Thử lại</button>
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
            title="Bạn chưa có dự án nào" 
            description="Tạo dự án đầu tiên để bắt đầu theo dõi từ khóa và cập nhật bài báo khoa học." 
            icon="lucide:folder-open" 
            actionLabel="+ Tạo dự án mới"
            onAction={() => navigate(ROUTES.PROJECT_CREATE)}
            className="mt-4"
          />
        ) : (
          <div className="row g-4">
            {projects.map(project => (
              <div key={project.project_id || project.id} className="col-12 col-md-6 col-lg-4">
                <ProjectCard project={project} onDelete={handleDelete} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectListPage;
