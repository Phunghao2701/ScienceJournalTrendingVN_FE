/**
 * File source thuộc hệ thống FE ResearchPulse.
 *
 * File: features\journal\pages\JournalListPage.jsx
 */
import { Container } from 'react-bootstrap';
import { Icon } from '@iconify/react';
import Header from '../../landing/components/Header';
import JournalStatsCards from '../components/JournalStatsCards';
import JournalSearchBar from '../components/JournalSearchBar';
import JournalTable from '../components/JournalTable';
import useJournalList from '../hooks/useJournalList';
import AdminPagination from '../../../shared/components/Pagination';
import './JournalListPage.css';

export default function JournalListPage() {
  const {
    journals,
    pagination,
    isLoading,
    loadingStats,
    error,
    stats,
    searchInput,
    setSearchInput,
    quartile,
    setQuartile,
    isOpenAccess,
    setIsOpenAccess,
    handleSearchSubmit,
    handlePageChange
  } = useJournalList();

  const totalPages = Math.ceil(pagination.total / pagination.limit) || 1;

  // Clear all filters handler
  const handleClearAll = () => {
    setSearchInput('');
    setQuartile('all');
    setIsOpenAccess('all');
    // Force reset page and refetch via hook states indirectly
    window.location.reload();
  };

  return (
    <div className="journal-list-page text-main">
      <Header />

      <Container>
        <nav aria-label="breadcrumb" className="journal-list-breadcrumb mb-4">
          <ol className="breadcrumb">
            <li className="breadcrumb-item">
              <span
                className="journal-list-breadcrumb__link"
                onClick={() => window.location.href = '/'}
              >
                Home
              </span>
            </li>
            <li className="breadcrumb-item active text-primary" aria-current="page">
              Tạp chí
            </li>
          </ol>
        </nav>

        <section className="journal-list-hero">
          <div className="journal-list-hero__content">
            <div className="journal-list-eyebrow">
              <Icon icon="lucide:library" width="17" />
              <span>Journal catalog</span>
            </div>
            <h1 className="journal-list-title">
              Tạp chí
            </h1>
            <p className="journal-list-description">
              Danh sách tạp chí khoa học trong hệ thống ResearchPulse, hỗ trợ lọc theo quartile và trạng thái truy cập mở.
            </p>
          </div>
        </section>

        {/* Statistic Cards */}
        <JournalStatsCards stats={stats} loading={loadingStats} />

        {/* Search & Filter Bar */}
        <JournalSearchBar
          searchInput={searchInput}
          setSearchInput={setSearchInput}
          quartile={quartile}
          setQuartile={setQuartile}
          isOpenAccess={isOpenAccess}
          setIsOpenAccess={setIsOpenAccess}
          onSubmit={handleSearchSubmit}
          onClear={handleClearAll}
        />

        {/* Error State */}
        {error && (
          <div className="journal-alert alert d-flex align-items-center gap-2 mb-4" role="alert">
            <Icon icon="lucide:alert-circle" width="18" />
            <div>{error}</div>
          </div>
        )}

        {/* Table & Loading Skeleton wrapper */}
        {isLoading ? (
          <div className="journal-loading-panel">
            <div className="skeleton-shimmer journal-skeleton-line mb-3" />
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="skeleton-shimmer journal-skeleton-row mb-2" />
            ))}
          </div>
        ) : (
          <>
            {/* Journal Table */}
            <JournalTable 
              journals={journals} 
              page={pagination.page} 
              limit={pagination.limit} 
            />

            {/* Pagination Controls */}
            {journals.length > 0 && totalPages > 1 && (
              <AdminPagination
                totalItems={pagination.total}
                currentPage={pagination.page}
                limit={pagination.limit}
                onPageChange={handlePageChange}
                entityName="tạp chí"
              />
            )}
          </>
        )}
      </Container>
    </div>
  );
}
