import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import ROUTES from '../../../app/routes/routePaths';
import { useKeywordTracking } from '../../keyword/hooks/useKeywordTracking';
import KeywordWatchList from '../../keyword/components/KeywordWatchList';
import AddKeywordModal from '../../keyword/components/AddKeywordModal';
import ManageKeywordsModal from '../../keyword/components/ManageKeywordsModal';
import { Icon } from '@iconify/react';


const ProjectDetailPage = () => {
  const { id: projectId } = useParams();
  const navigate = useNavigate();
  const {
    project,
    watchArticles,
    watchedKeywords,
    loading,
    error,
    actionLoading,
    addKeywordWatch,
    removeKeywordWatch
  } = useKeywordTracking(projectId);

  const [activeTab, setActiveTab] = useState('articles'); // 'overview', 'articles', 'keywords'
  const [showAddModal, setShowAddModal] = useState(false);
  const [showManageModal, setShowManageModal] = useState(false);

  if (loading) {
    return (
      <div className="project-detail-page container-fluid py-4 grid-bg min-vh-100 d-flex justify-content-center align-items-center">
        <div className="spinner-border text-primary" role="status"></div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="project-detail-page container-fluid py-4 grid-bg min-vh-100">
        <div className="container mx-auto" style={{ maxWidth: '1000px', marginTop: '20px' }}>
          <div className="alert alert-danger border-0 rounded-4 shadow-sm p-4 d-flex align-items-center gap-3">
            <Icon icon="lucide:alert-triangle" width="24" className="text-danger flex-shrink-0" />
            <div>
              <h6 className="fw-bold mb-1">Không thể tải dự án</h6>
              <p className="mb-0 small">{error || 'Dự án không tồn tại hoặc đã bị xóa.'}</p>
            </div>
            <button className="btn btn-outline-danger btn-sm ms-auto" onClick={() => navigate(ROUTES.PROJECTS)}>Quay lại</button>
          </div>
        </div>
      </div>
    );
  }

  const title = project.title || 'Untitled Project';
  const areaName = project.subject_area?.name || project.subject_area || 'Chưa xác định lĩnh vực';
  const createdAt = project.created_at ? new Date(project.created_at).toLocaleDateString('vi-VN') : 'N/A';
  const keywordCount = watchedKeywords?.length || 0;
  const articleCount = watchArticles?.length || 0;

  return (
    <div className="project-detail-page container-fluid py-4 grid-bg min-vh-100">
      <div className="container mx-auto" style={{ maxWidth: '1200px' }}>
        {/* Breadcrumb */}
        <nav aria-label="breadcrumb" className="mb-4">
          <ol className="breadcrumb mb-2 text-muted-custom small">
            <li className="breadcrumb-item"><Link to={ROUTES.DASHBOARD} className="text-decoration-none text-muted-custom hover-primary">Tổng quan</Link></li>
            <li className="breadcrumb-item"><Link to={ROUTES.PROJECTS} className="text-decoration-none text-muted-custom hover-primary">Dự án theo dõi</Link></li>
            <li className="breadcrumb-item active" aria-current="page">{title}</li>
          </ol>
        </nav>

        {/* Header section (Mockup 3) */}
        <div className="glass-card rounded-4 shadow-sm border p-4 p-md-5 mb-4">
          <div className="d-flex flex-wrap justify-content-between align-items-start gap-3 mb-4">
            <div>
              <div className="d-flex align-items-center gap-2 mb-3">
                <span className="badge rounded-pill text-primary fw-medium" style={{ backgroundColor: 'var(--primary-light)' }}>
                  {areaName}
                </span>
                <span className="text-muted-custom small">Cập nhật lúc: {createdAt}</span>
              </div>
              <h1 className="font-display fw-bold text-main mb-0" style={{ fontSize: '2rem' }}>{title}</h1>
            </div>
            <div className="d-flex gap-2">
              <button 
                className="btn btn-light border fw-medium d-flex align-items-center gap-2 rounded-pill px-3"
                onClick={() => navigate(ROUTES.PROJECT_EDIT.replace(':id', projectId))}
              >
                <Icon icon="lucide:settings" width="16" /> Cấu hình từ khóa
              </button>
              <button 
                className="btn btn-primary btn-primary-glow fw-medium d-flex align-items-center gap-2 rounded-pill px-3"
                onClick={() => setShowAddModal(true)}
              >
                <Icon icon="lucide:search" width="16" /> Tìm trong lĩnh vực
              </button>
            </div>
          </div>

          <div className="row g-4 pt-4 border-top">
            <div className="col-6 col-md-3">
              <div className="text-muted-custom small mb-1 text-uppercase tracking-wider fw-semibold">Từ khóa theo dõi</div>
              <div className="fs-3 fw-bold text-main">{keywordCount}</div>
            </div>
            <div className="col-6 col-md-3">
              <div className="text-muted-custom small mb-1 text-uppercase tracking-wider fw-semibold">Bài báo liên quan</div>
              <div className="fs-3 fw-bold text-main">{articleCount}</div>
            </div>
            <div className="col-6 col-md-3">
              <div className="text-muted-custom small mb-1 text-uppercase tracking-wider fw-semibold">Cảnh báo mới (24H)</div>
              <div className="fs-3 fw-bold text-success d-flex align-items-center gap-1">
                <Icon icon="lucide:bell" width="20" /> 0
              </div>
            </div>
            <div className="col-6 col-md-3">
              <div className="text-muted-custom small mb-1 text-uppercase tracking-wider fw-semibold">Mức độ tăng trưởng</div>
              <div className="fs-3 fw-bold text-primary d-flex align-items-center gap-1">
                <Icon icon="lucide:trending-up" width="24" /> +0.0%
              </div>
            </div>
          </div>
        </div>

        <ul className="nav nav-tabs tab-nav-custom mb-4 border-bottom-0 gap-4" style={{ paddingLeft: '1rem' }}>
          <li className="nav-item">
            <button 
              className={`nav-link bg-transparent px-0 pb-3 fw-medium ${activeTab === 'overview' ? 'active' : 'text-muted-custom'}`}
              onClick={() => setActiveTab('overview')}
            >
              <Icon icon="lucide:bar-chart-2" width="18" className="me-2" /> Tổng quan & Biểu đồ
            </button>
          </li>
          <li className="nav-item">
            <button 
              className={`nav-link bg-transparent px-0 pb-3 fw-medium ${activeTab === 'articles' ? 'active' : 'text-muted-custom'}`}
              onClick={() => setActiveTab('articles')}
            >
              <Icon icon="lucide:file-text" width="18" className="me-2" /> Luồng Bài Báo ({articleCount})
            </button>
          </li>
          <li className="nav-item">
            <button 
              className={`nav-link bg-transparent px-0 pb-3 fw-medium ${activeTab === 'keywords' ? 'active' : 'text-muted-custom'}`}
              onClick={() => setActiveTab('keywords')}
            >
              <Icon icon="lucide:key" width="18" className="me-2" /> Keywords & Giám sát ({keywordCount})
            </button>
          </li>
        </ul>

        {/* Tab Content */}
        <div className="mb-5">
          {activeTab === 'overview' && (
            <div className="glass-card rounded-4 shadow-sm border p-4 text-center py-5 text-muted-custom">
              <Icon icon="lucide:pie-chart" width="48" className="mb-3 opacity-50" />
              <h5 className="text-main fw-bold">Biểu đồ tổng quan</h5>
              <p className="mb-0 small">Tính năng phân tích dữ liệu và biểu đồ đang được cập nhật.</p>
            </div>
          )}

          {activeTab === 'articles' && (
            <div className="glass-card rounded-4 shadow-sm border p-4">
              <div className="mb-4">
                <h5 className="fw-bold text-main mb-1">Luồng bài viết cập nhật</h5>
                <p className="text-muted-custom small mb-0">Danh sách các bài báo khoa học xuất bản gần đây tương thích với watch-list của dự án.</p>
              </div>

              {watchArticles.length === 0 ? (
                <div className="text-center py-5 text-muted-custom">
                  <Icon icon="lucide:file-x" width="48" className="mb-3 opacity-50" />
                  <p className="mb-0">Chưa có bài báo nào khớp với từ khóa của bạn.</p>
                </div>
              ) : (
                <div className="list-group list-group-flush border-top pt-2">
                  {watchArticles.map((article, index) => (
                    <div key={index} className="list-group-item bg-transparent px-0 py-3 border-bottom">
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <span className="text-muted-custom small">{article.journal_name || article.journal?.title || 'Tạp chí khoa học'}</span>
                        <span className="text-muted-custom small">{article.publication_year || new Date(article.publication_date).getFullYear()}</span>
                      </div>
                      <Link to={`/articles/${article.article_id || article.id}/visual`} className="text-decoration-none">
                        <h6 className="fw-bold text-main mb-2 hover-primary lh-base">{article.title}</h6>
                      </Link>
                      <p className="text-muted-custom small mb-2 text-truncate">{article.abstract || 'Không có tóm tắt.'}</p>
                      <div className="d-flex justify-content-between align-items-center">
                        <span className="text-muted-custom small">
                          Tác giả: <strong className="text-main fw-medium">{article.authors?.map(a => a.name).join(', ') || 'N/A'}</strong>
                        </span>
                        <span className="badge bg-light text-muted border fw-normal" style={{ fontSize: '0.7rem' }}>Độ trùng khớp cao</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'keywords' && (
            <div className="glass-card rounded-4 shadow-sm border p-4">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                  <h5 className="fw-bold text-main mb-1">Quản lý Watch-List từ khóa</h5>
                  <p className="text-muted-custom small mb-0">Hệ thống sẽ liên tục quét bài báo mới và gửi thông báo theo các từ khóa này.</p>
                </div>
                <button 
                  className="btn btn-dark btn-dark-solid rounded-pill px-3 py-2 fw-medium d-flex align-items-center gap-2"
                  onClick={() => setShowManageModal(true)}
                >
                  <Icon icon="lucide:edit-2" width="16" /> Chỉnh sửa danh sách
                </button>
              </div>

              <KeywordWatchList 
                watchedKeywords={watchedKeywords} 
                articles={[]} // Not used in this view since we show articles in tab
                loading={loading} 
                onManageClick={() => setShowManageModal(true)}
              />
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <AddKeywordModal 
        show={showAddModal} 
        onHide={() => setShowAddModal(false)} 
        onAdd={addKeywordWatch}
        actionLoading={actionLoading}
      />

      <ManageKeywordsModal
        show={showManageModal}
        onHide={() => setShowManageModal(false)}
        watchedKeywords={watchedKeywords}
        onRemove={removeKeywordWatch}
        actionLoading={actionLoading}
      />
    </div>
  );
};

export default ProjectDetailPage;
