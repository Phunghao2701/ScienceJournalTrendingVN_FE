import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import ROUTES from '../../../app/routes/routePaths';
import useProjects from '../hooks/useProjects';
import { Icon } from '@iconify/react';
import { getSubjectAreasApi, getSubjectCategoriesApi } from '../../catalog/api/catalogApi';
import { searchJournalsApi } from '../../journal/api/journalApi';
import MultiSelectDropdown from '../../../shared/components/Select/MultiSelectDropdown';
import { useProjectText } from '../i18n/useProjectText';

const CreateProjectPage = () => {
  const navigate = useNavigate();
  const { createProject } = useProjects();
  const p = useProjectText();
  
  // Form State
  const [title, setTitle] = useState('');
  const [subjectAreaId, setSubjectAreaId] = useState('');
  const [subjectCategoryIds, setSubjectCategoryIds] = useState([]);
  const [journalIds, setJournalIds] = useState([]);
  
  // API Data State
  const [areas, setAreas] = useState([]);
  const [categories, setCategories] = useState([]);
  const [journals, setJournals] = useState([]);
  
  // Loading States
  const [loading, setLoading] = useState(false);
  const [loadingCatalogs, setLoadingCatalogs] = useState(true);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [error, setError] = useState(null);

  // Initial Data Fetch
  useEffect(() => {
    const fetchCatalogs = async () => {
      setLoadingCatalogs(true);
      try {
        const [areasRes, journalsRes] = await Promise.all([
          getSubjectAreasApi({ limit: 200 }),
          searchJournalsApi({ limit: 200 }) // Load initial batch of journals
        ]);
        
        if (areasRes?.data) {
          const rawAreas = areasRes.data.data || areasRes.data;
          setAreas(Array.isArray(rawAreas) ? rawAreas : (rawAreas?.items || []));
        }
        if (journalsRes?.data) {
          const rawJournals = journalsRes.data.data || journalsRes.data;
          setJournals(Array.isArray(rawJournals) ? rawJournals : (rawJournals?.items || []));
        }
      } catch (err) {
        console.error('Lỗi tải danh mục:', err);
        setError(p('loadCatalogError'));
      } finally {
        setLoadingCatalogs(false);
      }
    };
    fetchCatalogs();
  }, [p]);

  useEffect(() => {
    if (!subjectAreaId) {
      setCategories([]);
      return;
    }

    let cancelled = false;
    const fetchCategories = async () => {
      setLoadingCategories(true);
      try {
        const response = await getSubjectCategoriesApi({
          subject_area_id: subjectAreaId,
          limit: 200,
        });
        const payload = response?.data?.data || response?.data;
        if (!cancelled) {
          setCategories(Array.isArray(payload) ? payload : (payload?.items || []));
        }
      } catch (err) {
        if (!cancelled) {
          setCategories([]);
          setError(err.response?.data?.message || p('loadCategoriesError'));
        }
      } finally {
        if (!cancelled) setLoadingCategories(false);
      }
    };

    fetchCategories();
    return () => {
      cancelled = true;
    };
  }, [subjectAreaId, p]);

  // Format data for MultiSelect
  const categoryOptions = (Array.isArray(categories) ? categories : [])
    .filter(c => c && (!subjectAreaId || String(c.subject_area_id) === String(subjectAreaId)))
    .map(c => ({ value: c.id || c.subject_category_id, label: c.name || c.category_name || c.display_name || '' }));
    
  const journalOptions = (Array.isArray(journals) ? journals : [])
    .filter(j => j && (!subjectAreaId || j.subject_area_id == null || String(j.subject_area_id) === String(subjectAreaId)))
    .map(j => ({ value: j.id || j.journal_id, label: j.name || j.title || j.display_name || '' }));

  // Handle Area Change
  const handleAreaChange = (e) => {
    setSubjectAreaId(e.target.value);
    setSubjectCategoryIds([]);
    setJournalIds([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !subjectAreaId) {
      setError(p('requiredFields'));
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const payload = {
        title: title.trim(),
        subject_area_id: parseInt(subjectAreaId, 10),
        subject_category_ids: subjectCategoryIds.map(id => parseInt(id, 10)),
        journal_ids: journalIds.map(id => parseInt(id, 10))
      };
      
      const createdProject = await createProject(payload);
      if (createdProject) {
        const projectId = createdProject.project_id || createdProject.id;
        navigate(projectId ? ROUTES.PROJECT_DETAIL.replace(':id', projectId) : ROUTES.PROJECTS);
      } else {
        setError(p('createFailed'));
      }
    } catch (err) {
      console.error('Error creating project:', err);
      setError(err.response?.data?.message || err.message || p('createFailed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="project-form-page container-fluid py-4 grid-bg min-vh-100">
      <div className="container mx-auto" style={{ maxWidth: '650px', marginTop: '20px' }}>
        <nav aria-label="breadcrumb" className="mb-4">
          <ol className="breadcrumb mb-2 text-muted-custom small">
            <li className="breadcrumb-item"><Link to={ROUTES.DASHBOARD} className="text-decoration-none text-muted-custom hover-primary">{p('overview')}</Link></li>
            <li className="breadcrumb-item"><Link to={ROUTES.PROJECTS} className="text-decoration-none text-muted-custom hover-primary">{p('projects')}</Link></li>
            <li className="breadcrumb-item active" aria-current="page">{p('createProject')}</li>
          </ol>
        </nav>

        <div className="glass-card p-4 p-md-5 rounded-4 shadow-sm border">
          <div className="mb-4 text-center">
            <h2 className="font-display fw-bold text-main mb-2">{p('newProject')}</h2>
            <p className="text-muted-custom small mb-0">{p('newProjectHint')}</p>
          </div>

          {error && (
            <div className="alert alert-danger border-0 rounded-3 small py-2 d-flex align-items-center gap-2">
              <Icon icon="lucide:alert-circle" width="18" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="projectTitle" className="form-label fw-semibold text-main mb-2 small text-uppercase tracking-wider">
                {p('projectName')} <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                className="form-control form-control-lg journal-dark-input"
                id="projectTitle"
                placeholder={p('projectNameExample')}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={loading}
                autoFocus
                required
                style={{ backgroundColor: 'var(--bg-main)', color: 'var(--text-main)', borderColor: 'var(--border)' }}
              />
            </div>

            <div className="mb-4">
              <label htmlFor="subjectArea" className="form-label fw-semibold text-main mb-2 small text-uppercase tracking-wider">
                {p('primaryArea')} <span className="text-danger">*</span>
              </label>
              <select
                className="form-select form-control-lg journal-dark-input"
                id="subjectArea"
                value={subjectAreaId}
                onChange={handleAreaChange}
                disabled={loadingCatalogs || loading}
                required
                style={{ backgroundColor: 'var(--bg-main)', color: 'var(--text-main)', borderColor: 'var(--border)' }}
              >
                <option value="">{p('selectArea')}</option>
                {areas.map(area => (
                  <option key={area.id || area.subject_area_id} value={area.id || area.subject_area_id}>
                    {area.name || area.area_name || area.display_name}
                  </option>
                ))}
              </select>
              {loadingCatalogs && <div className="form-text mt-2"><span className="spinner-border spinner-border-sm me-2"></span> {p('loadingCatalogs')}</div>}
            </div>

            <div className="mb-4">
              <label className="form-label fw-semibold text-main mb-2 small text-uppercase tracking-wider">
                {p('subjectCategories')}
              </label>
              <MultiSelectDropdown
                options={categoryOptions}
                value={subjectCategoryIds}
                onChange={setSubjectCategoryIds}
                placeholder={!subjectAreaId ? p('selectAreaFirst') : p('selectCategories')}
                disabled={!subjectAreaId || loadingCategories || loading}
                loading={loadingCategories}
                emptyMessage={p('noCategories')}
              />
            </div>

            <div className="mb-5">
              <label className="form-label fw-semibold text-main mb-2 small text-uppercase tracking-wider">
                {p('watchedJournals')}
              </label>
              <MultiSelectDropdown
                options={journalOptions}
                value={journalIds}
                onChange={setJournalIds}
                placeholder={!subjectAreaId ? p('selectAreaFirst') : p('selectJournals')}
                disabled={!subjectAreaId || loadingCatalogs || loading}
              />
              <div className="form-text mt-2 small text-muted-custom">
                {p('keywordAfterCreate')}
              </div>
            </div>

            <div className="d-flex gap-3 justify-content-end pt-3 border-top">
              <button
                type="button"
                className="btn btn-light px-4 py-2 border fw-medium rounded-pill"
                onClick={() => navigate(-1)}
                disabled={loading}
                style={{ color: 'var(--text-muted)' }}
              >
                {p('cancel')}
              </button>
              <button
                type="submit"
                className="btn btn-primary px-4 py-2 btn-primary-glow fw-medium d-flex align-items-center justify-content-center gap-2 rounded-pill"
                disabled={loading || !title.trim() || !subjectAreaId}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                    {p('creating')}
                  </>
                ) : (
                  <>
                    <Icon icon="lucide:check" width="18" />
                    {p('createProject')}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateProjectPage;
