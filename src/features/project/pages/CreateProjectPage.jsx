import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import ROUTES from '../../../app/routes/routePaths';
import useProjects from '../hooks/useProjects';
import { Icon } from '@iconify/react';
import { getSubjectAreasApi, getSubjectCategoriesApi } from '../../catalog/api/catalogApi';
import { searchJournalsApi } from '../../journal/api/journalApi';
import MultiSelectDropdown from '../../../shared/components/Select/MultiSelectDropdown';

const CreateProjectPage = () => {
  const navigate = useNavigate();
  const { createProject } = useProjects();
  
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
  const [loadingJournals, setLoadingJournals] = useState(false);
  const [error, setError] = useState(null);

  // Initial Data Fetch
  useEffect(() => {
    const fetchCatalogs = async () => {
      setLoadingCatalogs(true);
      try {
        const [areasRes, catsRes, journalsRes] = await Promise.all([
          getSubjectAreasApi(),
          getSubjectCategoriesApi(),
          searchJournalsApi({ limit: 200 }) // Load initial batch of journals
        ]);
        
        if (areasRes?.data) {
          const rawAreas = areasRes.data.data || areasRes.data;
          setAreas(Array.isArray(rawAreas) ? rawAreas : (rawAreas?.items || []));
        }
        if (catsRes?.data) {
          const rawCats = catsRes.data.data || catsRes.data;
          setCategories(Array.isArray(rawCats) ? rawCats : (rawCats?.items || []));
        }
        if (journalsRes?.data) {
          const rawJournals = journalsRes.data.data || journalsRes.data;
          setJournals(Array.isArray(rawJournals) ? rawJournals : (rawJournals?.items || []));
        }
      } catch (err) {
        console.error('Lỗi tải danh mục:', err);
        setError('Không thể tải dữ liệu danh mục. Vui lòng tải lại trang.');
      } finally {
        setLoadingCatalogs(false);
      }
    };
    fetchCatalogs();
  }, []);

  // Format data for MultiSelect
  const categoryOptions = (Array.isArray(categories) ? categories : [])
    .filter(c => c && (!subjectAreaId || String(c.subject_area_id) === String(subjectAreaId)))
    .map(c => ({ value: c.id || c.subject_category_id, label: c.name || c.category_name || c.display_name || '' }));
    
  const journalOptions = (Array.isArray(journals) ? journals : [])
    .filter(j => j && (!subjectAreaId || String(j.subject_area_id) === String(subjectAreaId)))
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
      setError('Vui lòng nhập tên dự án và chọn lĩnh vực nghiên cứu.');
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
      
      const response = await createProject(payload);
      if (response && response.success !== false) {
        const projectId = response.data?.project_id || response.data?.id || response.project_id;
        navigate(projectId ? ROUTES.PROJECT_DETAIL.replace(':id', projectId) : ROUTES.PROJECTS);
      } else {
        setError(response?.message || 'Tạo dự án thất bại');
      }
    } catch (err) {
      console.error('Error creating project:', err);
      setError(err.response?.data?.message || err.message || 'Đã có lỗi xảy ra khi tạo dự án');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="project-form-page container-fluid py-4 grid-bg min-vh-100">
      <div className="container mx-auto" style={{ maxWidth: '650px', marginTop: '20px' }}>
        <nav aria-label="breadcrumb" className="mb-4">
          <ol className="breadcrumb mb-2 text-muted-custom small">
            <li className="breadcrumb-item"><Link to={ROUTES.DASHBOARD} className="text-decoration-none text-muted-custom hover-primary">Tổng quan</Link></li>
            <li className="breadcrumb-item"><Link to={ROUTES.PROJECTS} className="text-decoration-none text-muted-custom hover-primary">Dự án theo dõi</Link></li>
            <li className="breadcrumb-item active" aria-current="page">Tạo dự án mới</li>
          </ol>
        </nav>

        <div className="glass-card p-4 p-md-5 rounded-4 shadow-sm border">
          <div className="mb-4 text-center">
            <h2 className="font-display fw-bold text-main mb-2">Khởi tạo dự án nghiên cứu mới</h2>
            <p className="text-muted-custom small mb-0">Thiết lập không gian làm việc để tự động theo dõi xu hướng, nhận cảnh báo bài viết khoa học và giám sát từ khóa.</p>
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
                Tên Dự án <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                className="form-control form-control-lg journal-dark-input"
                id="projectTitle"
                placeholder="Ví dụ: Nghiên cứu ứng dụng Deep Learning trong Y học"
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
                Lĩnh vực nghiên cứu chính <span className="text-danger">*</span>
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
                <option value="">-- Chọn lĩnh vực nghiên cứu --</option>
                {areas.map(area => (
                  <option key={area.id || area.subject_area_id} value={area.id || area.subject_area_id}>
                    {area.name || area.area_name}
                  </option>
                ))}
              </select>
              {loadingCatalogs && <div className="form-text mt-2"><span className="spinner-border spinner-border-sm me-2"></span> Đang tải danh mục...</div>}
            </div>

            <div className="mb-4">
              <label className="form-label fw-semibold text-main mb-2 small text-uppercase tracking-wider">
                Chuyên ngành (Subject Categories)
              </label>
              <MultiSelectDropdown
                options={categoryOptions}
                value={subjectCategoryIds}
                onChange={setSubjectCategoryIds}
                placeholder={!subjectAreaId ? "Vui lòng chọn lĩnh vực trước..." : "Chọn chuyên ngành..."}
                disabled={!subjectAreaId || loadingCatalogs || loading}
              />
            </div>

            <div className="mb-5">
              <label className="form-label fw-semibold text-main mb-2 small text-uppercase tracking-wider">
                Tạp chí theo dõi (Journals)
              </label>
              <MultiSelectDropdown
                options={journalOptions}
                value={journalIds}
                onChange={setJournalIds}
                placeholder={!subjectAreaId ? "Vui lòng chọn lĩnh vực trước..." : "Chọn tạp chí..."}
                disabled={!subjectAreaId || loadingCatalogs || loading}
              />
              <div className="form-text mt-2 small text-muted-custom">
                Bạn có thể thêm từ khóa theo dõi sau khi tạo dự án xong.
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
                Hủy
              </button>
              <button
                type="submit"
                className="btn btn-primary px-4 py-2 btn-primary-glow fw-medium d-flex align-items-center justify-content-center gap-2 rounded-pill"
                disabled={loading || !title.trim() || !subjectAreaId}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                    Đang tạo...
                  </>
                ) : (
                  <>
                    <Icon icon="lucide:check" width="18" />
                    Tạo dự án
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
