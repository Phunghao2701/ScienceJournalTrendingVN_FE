/**
 * @file AuthorDetailPage.jsx
 * @description Trang chi tiết hiển thị toàn bộ hồ sơ học thuật của một tác giả cụ thể.
 */

import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Button } from 'react-bootstrap';
import Icon from '../../../shared/components/Icon';
import Header from '../../landing/components/Header';
import useAuthors from '../hooks/useAuthors';
import AuthorProfileHeader from '../components/AuthorProfileHeader';
import AuthorAreasBreakdown from '../components/AuthorAreasBreakdown';
import AuthorArticlesSection from '../components/AuthorArticlesSection';
import './AuthorDetailPage.css';

export default function AuthorDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const {
    currentAuthor,
    authorArticles,
    authorBreakdown,
    loadingAuthorDetail,
    loadingArticles,
    loadingAreas,
    errorAuthorDetail,
    errorArticles,
    errorAreas,
    fetchAuthorDetailsFull,
    fetchAuthorDetail,
    fetchAuthorArticles,
    fetchAuthorAreasBreakdown
  } = useAuthors();

  useEffect(() => {
    if (id) {
      fetchAuthorDetailsFull(id);
    }
  }, [id, fetchAuthorDetailsFull]);

  const authorName = currentAuthor?.full_name ?? currentAuthor?.display_name ?? currentAuthor?.name ?? 'Tác giả';

  return (
    <div className="author-detail-page">
      <Header />

      <Container>
        <nav className="author-detail-breadcrumb mb-4" aria-label="breadcrumb">
          <ol className="breadcrumb">
            <li className="breadcrumb-item">
              <span className="author-detail-breadcrumb__link" onClick={() => navigate('/')}>
                Tổng quan
              </span>
            </li>
            <li className="breadcrumb-item">
              <span className="author-detail-breadcrumb__link" onClick={() => navigate('/authors')}>
                Tác giả nổi bật
              </span>
            </li>
            <li className="breadcrumb-item active author-detail-breadcrumb__current" aria-current="page">
              {loadingAuthorDetail ? 'Đang tải...' : authorName}
            </li>
          </ol>
        </nav>

        <section className="author-detail-hero">
          <div className="author-detail-hero__content d-flex flex-column flex-md-row justify-content-between align-items-start gap-3">
            <div>
              <div className="author-detail-eyebrow">
                <Icon icon="lucide:user-round-search" width="17" />
                <span>Author profile</span>
              </div>
              <h1 className="author-detail-title">{loadingAuthorDetail ? 'Hồ sơ tác giả' : authorName}</h1>
              <p className="author-detail-description">
                Hồ sơ học thuật, phân bổ lĩnh vực nghiên cứu và danh sách công trình công bố của tác giả.
              </p>
            </div>
            <Button
              variant="link"
              onClick={() => navigate('/authors')}
              className="author-detail-back p-0 d-flex align-items-center gap-2"
            >
              <Icon icon="lucide:arrow-left" width="16" />
              Quay lại danh sách tác giả
            </Button>
          </div>
        </section>

        <Row className="g-4">
          <Col xs={12} lg={4}>
            <AuthorProfileHeader
              author={currentAuthor}
              loading={loadingAuthorDetail}
              error={errorAuthorDetail}
              onRetry={() => id && fetchAuthorDetail(id)}
            />
          </Col>

          <Col xs={12} lg={8}>
            <div className="d-flex flex-column gap-4">
              <AuthorAreasBreakdown
                breakdown={authorBreakdown}
                loading={loadingAreas}
                error={errorAreas}
                onRetry={() => id && fetchAuthorAreasBreakdown(id)}
              />

              <AuthorArticlesSection
                articles={authorArticles}
                loading={loadingArticles}
                error={errorArticles}
                onRetry={() => id && fetchAuthorArticles(id)}
              />
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
}
