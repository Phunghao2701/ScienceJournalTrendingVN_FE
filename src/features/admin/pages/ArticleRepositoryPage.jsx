import { useNavigate } from 'react-router-dom';
import { Icon } from '@iconify/react';
import {
  ArticleFilterBar,
  ArticleTable,
  EditorInsightsCard,
  PeerMatchingPromoCard,
} from '../components/article-repository';
import Pagination from '../../../shared/components/Pagination';
import useAdminArticleRepository from '../hooks/useAdminArticleRepository';
import ROUTES from '../../../app/routes/routePaths';

export default function ArticleRepositoryPage() {
  const navigate = useNavigate();
  const {
    journalFilter,
    statusFilter,
    submittedDateFilter,
    setJournalFilter,
    setStatusFilter,
    setSubmittedDateFilter,
    handleApplyFilters,
    handleClearFilters,
    pageItems,
    insights,
    totalItems,
    loading,
    error,
    currentPage,
    setCurrentPage,
    startIndex,
    endIndex,
    pageSize,
  } = useAdminArticleRepository();

  return (
    <>
      {/* Breadcrumb */}
      <p className="admin-breadcrumb">
        Management / <span className="admin-breadcrumb__current">Manuscripts</span>
      </p>

      {/* Header: title + nút "Submit New Article" */}
      <div className="admin-page-header">
        <div className="admin-page-header__copy">
          <p className="admin-page-kicker">Manuscript Management</p>
          <h1 className="admin-page-title">Article Repository</h1>
          <p className="admin-page-lede">
            Review submitted articles, filter editorial status, and open manuscript records for operational updates.
          </p>
        </div>
        <button
          type="button"
          className="btn-primary-glow admin-btn-consistent d-inline-flex align-items-center gap-1.5"
          onClick={() => navigate(ROUTES.ADMIN_ARTICLE_CREATE)}
        >
          <Icon icon="lucide:plus" width="16" />
          <span>Submit New Article</span>
        </button>
      </div>

      {/* Filter bar - filter theo dữ liệu API đang tải */}
      <ArticleFilterBar
        journal={journalFilter}
        status={statusFilter}
        submittedDate={submittedDateFilter}
        onChangeJournal={setJournalFilter}
        onChangeStatus={setStatusFilter}
        onChangeSubmittedDate={setSubmittedDateFilter}
        onApply={handleApplyFilters}
        onClear={handleClearFilters}
      />

      {loading ? (
        <div className="admin-card text-center py-5 text-muted-custom">Loading articles from API...</div>
      ) : error ? (
        <div className="alert alert-danger border-0 rounded-3 small mb-4">{error}</div>
      ) : (
        <>
          <ArticleTable
            items={pageItems}
            totalItems={totalItems}
            startIndex={pageItems.length === 0 ? 0 : startIndex}
            endIndex={endIndex}
          />

          <Pagination
            totalItems={totalItems}
            currentPage={currentPage}
            limit={pageSize}
            onPageChange={setCurrentPage}
            entityName="articles"
          />
        </>
      )}

      {/* Bottom row: Editor's Insights (trái) + Peer-Matching promo (phải) */}
      <div className="admin-repository-bottom-row">
        <EditorInsightsCard insights={insights} />
        <PeerMatchingPromoCard />
      </div>
    </>
  );
}