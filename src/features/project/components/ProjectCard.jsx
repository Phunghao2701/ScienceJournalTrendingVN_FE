import React from 'react';
import { Link } from 'react-router-dom';
import { Icon } from '@iconify/react';


const ProjectCard = ({ project, onDelete }) => {
  const handleDelete = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (window.confirm('Bạn có chắc muốn xóa dự án này? Hành động này không thể hoàn tác.')) {
      onDelete(project.project_id || project.id);
    }
  };

  const title = project.title || 'Untitled Project';
  const areaName = project.subject_area?.name || project.subject_area || 'Chưa xác định lĩnh vực';
  const createdAt = project.created_at ? new Date(project.created_at).toLocaleDateString('vi-VN') : 'N/A';
  
  // Try to find counts
  const keywordCount = project.keywords_count || project.watch_keywords?.length || 0;
  const journalCount = project.journals_count || project.journal_ids?.length || 0;

  return (
    <Link to={`/projects/${project.project_id || project.id}`} className="text-decoration-none">
      <div className="card glass-card h-100 border-0 shadow-sm rounded-4 overflow-hidden" style={{ transition: 'all 0.2s ease-in-out' }}>
        <div className="card-body p-4 d-flex flex-column">
          <div className="d-flex justify-content-between align-items-start mb-3">
            <span className="badge rounded-pill text-primary fw-medium" style={{ backgroundColor: 'var(--primary-light)' }}>
              {areaName}
            </span>
            <button 
              className="btn btn-sm btn-link text-muted p-0 ms-2 hover-danger" 
              onClick={handleDelete}
              title="Xóa dự án"
            >
              <Icon icon="lucide:trash-2" width="18" />
            </button>
          </div>
          
          <h5 className="card-title font-display fw-bold text-main mb-3" style={{ fontSize: '1.25rem' }}>
            {title}
          </h5>
          
          <div className="mt-auto">
            {keywordCount > 0 && (
              <div className="mb-2">
                <span className="text-muted-custom small d-block mb-1">Từ khóa theo dõi ({keywordCount}):</span>
                <div className="d-flex flex-wrap gap-1">
                  {project.watch_keywords?.slice(0, 3).map((kw, idx) => (
                    <span key={idx} className="badge bg-light text-muted border fw-normal" style={{ fontSize: '0.75rem' }}>
                      {kw.keyword || kw}
                    </span>
                  ))}
                  {keywordCount > 3 && (
                    <span className="badge bg-light text-muted border fw-normal" style={{ fontSize: '0.75rem' }}>
                      +{keywordCount - 3}
                    </span>
                  )}
                </div>
              </div>
            )}

            <hr className="my-3 opacity-10" />
            
            <div className="d-flex justify-content-between align-items-center mt-2">
              <span className="text-muted-custom small">
                Cập nhật: {createdAt}
              </span>
              <span className="text-primary small fw-medium d-flex align-items-center gap-1">
                Chi tiết <Icon icon="lucide:arrow-right" width="14" />
              </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ProjectCard;
