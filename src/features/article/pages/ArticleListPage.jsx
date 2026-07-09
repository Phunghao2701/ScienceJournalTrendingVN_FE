/**
 * File source thuộc hệ thống FE ResearchPulse.
 *
 * File: features\article\pages\ArticleListPage.jsx
 */
import { Container, Modal, Button, Breadcrumb } from 'react-bootstrap';
import { Icon } from '@iconify/react';
import { useNavigate } from 'react-router-dom';
import Header from '../../landing/components/Header';
import useArticleList from '../hooks/useArticleList';
import ArticleStatsCards from '../components/ArticleStatsCards';
import ArticleFilterBar from '../components/ArticleFilterBar';
import ArticleTable from '../components/ArticleTable';
import AdminPagination from '../../../shared/components/Pagination';
import './ArticleListPage.css';

export default function ArticleListPage() {
  const navigate = useNavigate();
  const {
    articles,
    total,
    currentPage,
    totalPages,
    isLoading,
    stats,
    filters,
    updateFilters,
    clearFilters,
    handlePageChange,
    handleDetailClick,
    showAuthModal,
    setShowAuthModal,
    handleAuthRedirect
  } = useArticleList();


  return (
    <div className="article-list-page grid-bg">
      <Header />

      <Container className="article-list-shell pt-4">
        {/* Breadcrumb */}
        <nav aria-label="breadcrumb" className="article-list-breadcrumb mb-4">
          <Breadcrumb className="mb-0 d-flex align-items-center">
            <Breadcrumb.Item
              onClick={() => navigate('/')}
              linkProps={{ style: { cursor: 'pointer' } }}
            >
              Trang chủ
            </Breadcrumb.Item>
            <Breadcrumb.Item active>
              Bài báo
            </Breadcrumb.Item>
          </Breadcrumb>
        </nav>

        {/* Page Header */}
        <section className="article-list-hero" aria-labelledby="article-list-title">
          <div>
            <div className="article-list-eyebrow">
              <Icon icon="lucide:library-big" width="15" height="15" />
              ResearchPulse Articles
            </div>
            <h1 id="article-list-title" className="article-list-title">
              Kho lưu trữ Bài báo Khoa học
            </h1>
            <p className="article-list-description">
              Duyệt qua, tìm kiếm và lọc hàng nghìn bài báo chất lượng cao được lưu trữ trong hệ thống ResearchPulse.
            </p>

            {filters.selectedVolume && (
              <div className="article-list-scope">
                <Icon icon="solar:folder-with-files-bold" width="15" />
                <span>Đang xem bài báo thuộc Volume #{filters.selectedVolume}</span>
              </div>
            )}
            {filters.selectedIssue && (
              <div className="article-list-scope">
                <Icon icon="lucide:layers-3" width="15" />
                <span>Đang xem bài báo thuộc Issue #{filters.selectedIssue}</span>
              </div>
            )}
          </div>

          <aside className="article-list-summary" aria-label="Tổng kết bài báo">
            <div className="article-list-summary__label">Tổng kết quả</div>
            <div className="article-list-summary__value">
              {new Intl.NumberFormat().format(total)}
            </div>
          </aside>
        </section>

        {/* Thẻ thống kê */}
        <ArticleStatsCards stats={stats} isLoading={isLoading} />

        {/* Thanh lọc & Sắp xếp */}
        <ArticleFilterBar
          filters={filters}
          updateFilters={updateFilters}
          clearFilters={clearFilters}
        />

        {/* Kết quả đếm */}
        <div className="d-flex align-items-center justify-content-between mb-3 flex-wrap gap-2">
          <div className="text-muted-custom text-xs">
            Hiển thị <span className="text-main font-weight-bold">{articles.length}</span> trong{' '}
            <span className="text-main font-weight-bold">{total}</span> bài báo khoa học
          </div>
        </div>

        {/* Bảng dữ liệu */}
        <ArticleTable
          articles={articles}
          isLoading={isLoading}
          onDetailClick={handleDetailClick}
          onClearFilters={clearFilters}
        />

        {/* Phân trang */}
        {total > 0 && totalPages > 1 && (
          <AdminPagination
            totalItems={total}
            currentPage={currentPage}
            limit={10}
            onPageChange={handlePageChange}
            entityName="bài báo"
          />
        )}
      </Container>

      {/* Warning Auth Modal */}
      <Modal
        show={showAuthModal}
        onHide={() => setShowAuthModal(false)}
        centered
        contentClassName="border-0 text-main"
        style={{
          '--bs-modal-bg': 'var(--bg-card)',
          '--bs-modal-border-radius': '16px'
        }}
      >
        <Modal.Body className="p-4 text-center">
          <div className="article-modal-icon mb-3">
            <Icon icon="lucide:lock" width="30" height="30" />
          </div>
          <h4 className="font-display font-weight-bold mb-3 text-main">Yêu cầu Đăng nhập</h4>
          <p className="text-muted-custom text-sm mb-4" style={{ lineHeight: '1.6' }}>
            Để xem toàn bộ nội dung chi tiết bài báo, bao gồm tóm tắt học thuật đầy đủ, thông tin các tác giả liên kết và liên kết trích dẫn DOI, vui lòng đăng nhập tài khoản ResearchPulse của bạn.
          </p>
          <div className="d-flex align-items-center justify-content-center gap-3">
            <Button
              variant="outline-secondary"
              onClick={() => setShowAuthModal(false)}
              className="px-4 py-2 text-xs font-semibold rounded-pill text-main border-secondary"
              style={{
                fontSize: '0.85rem'
              }}
            >
              Đóng
            </Button>
            <Button
              className="btn-primary-glow border-0 px-4 py-2 text-xs font-semibold rounded-pill text-white"
              onClick={handleAuthRedirect}
              style={{
                fontSize: '0.85rem'
              }}
            >
              Đăng nhập ngay
            </Button>
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );
}

