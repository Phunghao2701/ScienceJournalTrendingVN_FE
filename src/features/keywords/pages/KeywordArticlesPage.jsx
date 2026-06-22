/**
 * File source thuộc hệ thống FE ResearchPulse.
 *
 * File: features\keywords\pages\KeywordArticlesPage.jsx
 */
import { Container } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import { Icon } from '@iconify/react';
import Header from '../../landing/components/Header';
import LoadingSkeleton from '../../../shared/components/LoadingSkeleton';
import KeywordArticleList from '../components/KeywordArticleList';
import { useKeywordArticles } from '../hooks/useKeywordArticles';
import './KeywordArticlesPage.css';

/**
 * Trang bài báo theo Keyword.
 * Route: /keywords/:keywordId/articles
 */
export default function KeywordArticlesPage() {
  const { keywordId } = useParams();
  const navigate = useNavigate();

  const {
    keyword,
    articles,
    pagination,
    loadingKeyword,
    loadingArticles,
    keywordError,
    articlesError,
    handlePageChange,
  } = useKeywordArticles(keywordId);

  const handleViewDetail = (articleId) => {
    navigate(`/articles/${articleId}/visual`);
  };

  const handleRetry = () => {
    handlePageChange(1);
  };

  return (
    <div className="grid-bg keyword-articles-page d-flex flex-column">
      <Header />

      <Container className="pb-5 flex-grow-1">
        <nav aria-label="breadcrumb" className="keyword-articles-breadcrumb mb-4">
          <ol className="breadcrumb">
            <li className="breadcrumb-item">
              <span
                role="button"
                tabIndex={0}
                onClick={() => navigate('/keywords')}
                onKeyDown={(e) => e.key === 'Enter' && navigate('/keywords')}
                className="keyword-articles-back-link"
              >
                Keywords
              </span>
            </li>
            <li className="breadcrumb-item active text-main fw-semibold" aria-current="page">Bài báo theo keyword</li>
          </ol>
        </nav>

        <section className="keyword-articles-hero">
          <div className="keyword-articles-hero__content">
            {loadingKeyword ? (
              <>
                <LoadingSkeleton width="200px" height="14px" className="mb-3" />
                <LoadingSkeleton width="400px" height="36px" className="mb-3" />
                <LoadingSkeleton width="280px" height="18px" />
              </>
            ) : keywordError ? (
              <div className="d-flex align-items-center gap-3">
                <Icon icon="lucide:alert-circle" width="28" className="keyword-article-state-icon" />
                <div>
                  <h1 className="keyword-articles-empty-title">Keyword không tìm thấy</h1>
                  <p className="text-muted-custom mb-0">ID: {keywordId}</p>
                </div>
              </div>
            ) : keyword ? (
              <div>
                <div className="keyword-articles-eyebrow">
                  <Icon icon="lucide:tag" width="16" />
                  <span>
                    Research Keyword
                  </span>
                </div>
                <h1 className="keyword-articles-title">
                  {keyword.display_name}
                </h1>
                <p className="keyword-articles-summary">
                  {pagination.total > 0
                    ? <><strong>{pagination.total.toLocaleString()}</strong> bài báo đang được liên kết với keyword này.</>
                    : 'Keyword này hiện chưa có bài báo liên kết trong hệ thống.'}
                </p>
              </div>
            ) : null}
          </div>
        </section>

        <div>
          <div className="keyword-articles-heading">
            <h2 className="keyword-articles-section-title">
              Bài báo liên quan
            </h2>
            <button
              type="button"
              className="btn btn-link btn-sm d-flex align-items-center gap-2 keyword-articles-return"
              onClick={() => navigate('/keywords')}
            >
              <Icon icon="lucide:arrow-left" width="16" />
              Quay lại keywords
            </button>
          </div>

          <KeywordArticleList
            articles={articles}
            loading={loadingArticles}
            error={articlesError}
            pagination={pagination}
            onPageChange={(page) => {
              handlePageChange(page);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onViewDetail={handleViewDetail}
            onRetry={handleRetry}
          />
        </div>
      </Container>
    </div>
  );
}
