import { Link } from 'react-router-dom';
import { Icon } from '@iconify/react';
import { useProjectText } from '../i18n/useProjectText';


const ProjectCard = ({ project, onDelete }) => {
  const p = useProjectText();
  const handleDelete = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onDelete(project);
  };

  const title = project.title || p('untitledProject');
  const areaName =
    project.subject_area?.display_name ||
    project.subject_area?.name ||
    project.subject_area_name ||
    (typeof project.subject_area === 'string' ? project.subject_area : null) ||
    p('unspecifiedArea');
  const createdAt = project.created_at ? new Date(project.created_at).toLocaleDateString() : 'N/A';
  
  // Try to find counts
  const keywordCount = project.keywords_count || project.watch_keywords?.length || 0;
  const journalCount =
    project.journals_count ||
    project.journals?.length ||
    project.journal_ids?.length ||
    0;

  return (
    <Link to={`/projects/${project.project_id || project.id}`} className="text-decoration-none">
      <article className="card glass-card project-card h-100 border-0 shadow-sm rounded-4 overflow-hidden">
        <div className="card-body p-4 d-flex flex-column">
          <div className="d-flex justify-content-between align-items-start mb-3">
            <span className="badge rounded-pill text-primary fw-medium" style={{ backgroundColor: 'var(--primary-light)' }}>
              {areaName}
            </span>
            <button 
              className="btn btn-sm btn-link text-muted p-0 ms-2 hover-danger" 
              onClick={handleDelete}
              title={p('deleteProject')}
              aria-label={`${p('deleteProject')} ${title}`}
            >
              <Icon icon="lucide:trash-2" width="18" />
            </button>
          </div>
          
          <h5 className="card-title font-display fw-bold text-main mb-3" style={{ fontSize: '1.25rem' }}>
            {title}
          </h5>
          
          <div className="mt-auto">
            <div className="d-flex gap-3 text-muted-custom small mb-3">
              <span className="d-flex align-items-center gap-1">
                <Icon icon="lucide:book-open" width="15" />
                {journalCount} {p('journals')}
              </span>
              <span className="d-flex align-items-center gap-1">
                <Icon icon="lucide:key-round" width="15" />
                {keywordCount} {p('keywords')}
              </span>
            </div>
            {keywordCount > 0 && (
              <div className="mb-2">
                <span className="text-muted-custom small d-block mb-1">{p('watchedKeywords')} ({keywordCount}):</span>
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
                {p('updated')}: {createdAt}
              </span>
              <span className="text-primary small fw-medium d-flex align-items-center gap-1">
                {p('viewDetails')} <Icon icon="lucide:arrow-right" width="14" />
              </span>
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
};

export default ProjectCard;
