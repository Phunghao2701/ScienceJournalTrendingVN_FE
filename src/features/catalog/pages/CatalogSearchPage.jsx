/**
 * File source thuộc hệ thống FE ResearchPulse.
 *
 * File: features\catalog\pages\CatalogSearchPage.jsx
 */
import { Container, Row, Col, Form, Button, InputGroup, Dropdown, Breadcrumb } from 'react-bootstrap';
import { Icon } from '@iconify/react';
import { useNavigate } from 'react-router-dom';
import { useCatalogSearch } from '../hooks/useCatalogSearch';
import FilterPanel from '../components/FilterPanel';
import JournalTable from '../components/JournalTable';
import LoadingSkeleton from '../../../shared/components/LoadingSkeleton';
import AuthRequiredModal from '../../../shared/components/AuthRequiredModal';
import Header from '../../landing/components/Header';
import useAuth from '../../auth/hooks/useAuth';
import AdminPagination from '../../../shared/components/Pagination';
import '../components/CatalogSearch.css';

export default function CatalogSearchPage() {
  const navigate = useNavigate();
  const auth = useAuth();
  const { user } = auth;

  const {
    searchInput,
    setSearchInput,
    subjectAreas,
    subjectCategories,
    loadingFilters,
    journals,
    total,
    loadingJournals,
    error,
    page,
    sort,
    selectedAreas,
    selectedCategories,
    selectedAccess,
    selectedQuartiles,
    selectedYear,
    selectedZone,
    zones,
    isOaDiamond,
    followedJournals,
    showAuthModal,
    setShowAuthModal,
    handleSearchSubmit,
    onAreaSelect,
    onCategorySelect,
    onAccessSelect,
    onQuartileSelect,
    onYearSelect,
    onZoneSelect,
    handleOaDiamondToggle,
    handleClearAll,
    handleSortChange,
    handlePageChange,
    handleFollowJournal,
    fetchJournals
  } = useCatalogSearch(user);

  const pageLimit = 10;
  const totalPages = Math.ceil(total / pageLimit) || 1;

  return (
    <div className="min-vh-100 text-main catalog-search-page">
      {/* Navbar Header */}
      <Header />

      <Container className="catalog-shell pt-4">
        {/* Breadcrumbs */}
        <div aria-label="breadcrumb" className="catalog-breadcrumb">
          <Breadcrumb className="mb-0 custom-breadcrumb d-flex align-items-center">
            <Breadcrumb.Item
              onClick={() => navigate('/')}
              className="d-flex align-items-center"
              linkProps={{ style: { cursor: 'pointer' } }}
            >
              Trang chủ
            </Breadcrumb.Item>
            <Breadcrumb.Item active className="d-flex align-items-center">
              Tìm kiếm
            </Breadcrumb.Item>

          </Breadcrumb>
        </div>

        {/* Page Title & Subtitle */}
        <section className="catalog-hero text-start">
          <h1 className="catalog-title">
            Danh mục & Tìm kiếm
          </h1>
          <p className="catalog-subtitle">
            Tìm kiếm journal, lọc theo lĩnh vực, xem volumes và issues
          </p>
        </section>

        {/* Search Input Panel */}
        <section className="catalog-surface catalog-search-panel text-start">
          <Form onSubmit={handleSearchSubmit}>
            <Row className="g-3">
              <Col xs={12}>
                <InputGroup className="catalog-search-group">
                  <InputGroup.Text className="bg-transparent border-0 pe-0 py-2 ps-3">
                    <Icon icon="lucide:search" width="18" />
                  </InputGroup.Text>
                  <Form.Control
                    placeholder="Tìm journal, tác giả, ISSN..."
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    className="bg-transparent border-0 py-2 px-3 fs-6 catalog-search-input"
                  />
                  <Button
                    type="submit"
                    className="catalog-search-btn"
                  >
                    <Icon icon="lucide:search" width="15" />
                    Tìm kiếm
                  </Button>
                </InputGroup>
              </Col>
            </Row>
          </Form>
        </section>

        {/* Catalog Main Layout */}
        <div className="w-100">
          {/* Horizontal Top Filter Panel */}
          <FilterPanel
            subjectAreas={subjectAreas}
            subjectCategories={subjectCategories}
            selectedAreas={selectedAreas}
            selectedCategories={selectedCategories}
            selectedAccess={selectedAccess}
            selectedQuartiles={selectedQuartiles}
            onAreaSelect={onAreaSelect}
            onCategorySelect={onCategorySelect}
            onAccessSelect={onAccessSelect}
            onQuartileSelect={onQuartileSelect}
            selectedYear={selectedYear}
            selectedZone={selectedZone}
            zones={zones}
            onYearSelect={onYearSelect}
            onZoneSelect={onZoneSelect}
            isOaDiamond={isOaDiamond}
            onOaDiamondToggle={handleOaDiamondToggle}
            onClearAll={handleClearAll}
            loading={loadingFilters}
          />

          {/* Toolbar Panel */}
          <div className="catalog-toolbar d-flex flex-column flex-sm-row align-items-sm-center justify-content-between gap-3 text-start">
            
            {/* Summary Counter text */}
            <div className="text-muted-custom catalog-count">
              {loadingJournals ? (
                <span>Đang tìm kiếm tạp chí...</span>
              ) : (
                <span>
                  Tìm thấy <strong>{total}</strong> journals · Trang <span className="catalog-number">{page}/{totalPages}</span>
                </span>
              )}
            </div>

            {/* Sort Dropdown */}
              <Dropdown align="end">
                <Dropdown.Toggle
                  variant="light"
                  id="sort-dropdown"
                  className="catalog-sort-toggle"
                >
                  <Icon icon="lucide:arrow-up-down" width="14" />
                  <span>
                    {sort === 'metric' && 'Mặc định'}
                    {sort === 'name' && 'Tên A-Z'}
                  </span>
                </Dropdown.Toggle>
                <Dropdown.Menu className="catalog-dropdown-menu">
                  <Dropdown.Item onClick={() => handleSortChange('metric')}>Mặc định</Dropdown.Item>
                  <Dropdown.Item onClick={() => handleSortChange('name')}>Tên A-Z</Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>

          </div>

          {/* Main Result Area */}
          {loadingJournals ? (
            // 3 Skeleton list cards loading placeholder
            <div>
              {[1, 2, 3].map((s) => (
                <section key={s} className="catalog-surface p-4 mb-3 text-start">
                  <LoadingSkeleton width="60%" height="1.4rem" className="mb-3" />
                  <LoadingSkeleton width="45%" height="0.8rem" className="mb-3" />
                  <div className="d-flex align-items-center gap-2 mb-3">
                    <LoadingSkeleton width="50px" height="1.2rem" />
                    <LoadingSkeleton width="100px" height="1.2rem" />
                    <LoadingSkeleton width="120px" height="1.2rem" />
                  </div>
                </section>
              ))}
            </div>
          ) : error && journals.length === 0 ? (
            <section className="catalog-surface catalog-state-card">
              <Icon icon={error?.includes('đăng nhập') ? 'lucide:lock' : 'lucide:alert-triangle'}
                className="catalog-state-icon"
                width="44"
              />
              <h2 className="catalog-state-title">
                {error?.includes('đăng nhập') ? 'Cần đăng nhập để tìm kiếm' : 'Không thể tải dữ liệu tìm kiếm'}
              </h2>
              <p className="text-muted-custom mb-4">{error}</p>
              {error?.includes('đăng nhập') ? (
                <Button onClick={() => window.location.href = '/login'} className="catalog-outline-btn">
                  Đăng nhập
                </Button>
              ) : (
                <Button onClick={() => fetchJournals()} className="catalog-outline-btn">
                  Thử lại
                </Button>
              )}
            </section>
          ) : journals.length === 0 ? (
            // Empty State Card
            <section className="catalog-surface catalog-state-card">
              <Icon icon="lucide:folder-search" className="catalog-state-icon" width="44" />
              <h2 className="catalog-state-title">Không tìm thấy journal phù hợp</h2>
              <p className="text-muted-custom mb-4">Hãy thử thay đổi từ khóa tìm kiếm hoặc đặt lại bộ lọc.</p>
              <Button onClick={handleClearAll} className="catalog-outline-btn">
                Xóa bộ lọc
              </Button>
            </section>
          ) : (
            <JournalTable
              journals={journals}
              followedJournals={followedJournals}
              onFollow={handleFollowJournal}
            />
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && !loadingJournals && (
            <div className="mt-5">
              <AdminPagination
                totalItems={total}
                currentPage={page}
                limit={pageLimit}
                onPageChange={handlePageChange}
                entityName="journals"
              />
            </div>
          )}
        </div>
      </Container>

      {/* Guest Authentication Interception Modal */}
      <AuthRequiredModal
        show={showAuthModal}
        onHide={() => setShowAuthModal(false)}
      />
    </div>
  );
}
