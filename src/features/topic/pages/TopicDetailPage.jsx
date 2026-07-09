/**
 * File source thuộc hệ thống FE ResearchPulse.
 *
 * File: features\topic\pages\TopicDetailPage.jsx
 */
import { useEffect, useMemo, useState } from 'react';
import { Container, Row, Col, Card, Button, Badge, Spinner, Alert } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import { Icon } from '@iconify/react';
import Header from '../../landing/components/Header';
import { getTopicByIdApi, getTopicArticlesApi } from '../api/topic.api';
import AdminPagination from '../../../shared/components/Pagination';
import './TopicDetailPage.css';

const PAGE_SIZE = 10;

const normalizeArticle = (item = {}) => ({
  id: item.article_id,
  title: item.title || 'Untitled article',
  year: item.publication_year,
  doi: item.doi,
  citations: item.citations_count ?? item.citations ?? 0,
});

export default function TopicDetailPage() {
  const navigate = useNavigate();
  const { topicId } = useParams();

  const [topic, setTopic] = useState(null);
  const [articles, setArticles] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: PAGE_SIZE, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    const fetchTopicDetail = async () => {
      setLoading(true);
      setError('');

      try {
        const [topicResponse, articlesResponse] = await Promise.all([
          getTopicByIdApi(topicId),
          getTopicArticlesApi(topicId, { page: 1, limit: PAGE_SIZE }),
        ]);

        const topicData = topicResponse?.data?.data;
        const articlePayload = articlesResponse?.data?.data;

        if (!active) return;

        setTopic(topicData || null);
        setArticles((articlePayload?.articles || []).map(normalizeArticle));
        setPagination({
          page: articlePayload?.pagination?.page || 1,
          limit: articlePayload?.pagination?.limit || PAGE_SIZE,
          total: articlePayload?.pagination?.total || 0,
        });
      } catch (err) {
        if (!active) return;
        setError(err.response?.data?.message || 'Không thể tải thông tin topic.');
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    fetchTopicDetail();

    return () => {
      active = false;
    };
  }, [topicId]);

  const totalPages = useMemo(() => {
    return Math.max(1, Math.ceil((pagination.total || 0) / (pagination.limit || PAGE_SIZE)));
  }, [pagination]);

  const handlePageChange = async (nextPage) => {
    if (nextPage === pagination.page || nextPage < 1 || nextPage > totalPages) return;

    setLoading(true);
    setError('');

    try {
      const response = await getTopicArticlesApi(topicId, { page: nextPage, limit: pagination.limit || PAGE_SIZE });
      const payload = response?.data?.data;
      setArticles((payload?.articles || []).map(normalizeArticle));
      setPagination({
        page: payload?.pagination?.page || nextPage,
        limit: payload?.pagination?.limit || PAGE_SIZE,
        total: payload?.pagination?.total || 0,
      });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể tải danh sách bài báo của topic.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="topic-detail-page grid-bg">
      <Header />

      <Container className="flex-grow-1 pt-4">
        <nav aria-label="breadcrumb" className="topic-detail-breadcrumb mb-4">
          <ol className="breadcrumb">
            <li className="breadcrumb-item">
              <span
                role="button"
                tabIndex={0}
                onClick={() => navigate('/articles')}
                onKeyDown={(e) => e.key === 'Enter' && navigate('/articles')}
                className="topic-detail-breadcrumb__link"
              >
                Bài Báo
              </span>
            </li>
            <li className="breadcrumb-item active text-main fw-semibold" aria-current="page">
              Chủ đề nghiên cứu
            </li>
          </ol>
        </nav>

        <Card className="topic-detail-hero">
          <Card.Body className="topic-detail-hero__body">
            <Row className="g-5 align-items-center">
              <Col lg={8}>
                <div className="topic-detail-eyebrow">
                  <Icon icon="solar:atom-bold-duotone" width="20" />
                  <span>Research Topic</span>
                </div>

                <h1 className="topic-detail-title">
                  {topic?.display_name || 'Đang tải topic...'}
                </h1>

                <p className="topic-detail-description">
                  Khám phá các bài báo thuộc chủ đề này để cập nhật xu hướng nghiên cứu mới nhất, theo dõi những công trình tiêu biểu và đóng góp khoa học trong lĩnh vực.
                </p>
              </Col>

              <Col lg={4}>
                <div className="topic-detail-summary">
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <div className="topic-detail-summary__label">Mã Topic</div>
                    <Badge className="topic-detail-summary__badge">
                      #{topic?.topic_id || topicId}
                    </Badge>
                  </div>

                  <hr className="topic-detail-summary__divider" />

                  <div className="d-flex justify-content-between align-items-center">
                    <div className="topic-detail-summary__label">Tổng số bài báo</div>
                    <div className="topic-detail-summary__value">
                      {(pagination.total || 0).toLocaleString('en-US')}
                    </div>
                  </div>

                  <Button
                    id="topic-view-all-articles"
                    onClick={() => navigate(`/articles?topic_id=${topicId}`)}
                    className="topic-detail-action btn-primary-glow mt-2 w-100 d-flex justify-content-center align-items-center gap-2"
                  >
                    Mở Bộ Lọc Bài Báo <Icon icon="lucide:arrow-right" width="18" />
                  </Button>
                </div>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        <div className="topic-detail-section-heading d-flex align-items-center justify-content-between flex-wrap gap-3">
          <div>
            <h2 className="topic-detail-section-title">Bài báo thuộc topic</h2>
            <p className="topic-detail-section-subtitle">
              Trang {pagination.page} / {totalPages}
            </p>
          </div>
          <Badge className="topic-detail-count-badge">
            {(pagination.total || 0).toLocaleString('en-US')} bài báo
          </Badge>
        </div>

        {error && (
          <Alert variant="danger" className="topic-detail-alert mb-4">
            {error}
          </Alert>
        )}

        {loading ? (
          <div className="d-flex justify-content-center align-items-center py-5">
            <Spinner animation="border" role="status" className="topic-detail-spinner">
              <span className="visually-hidden">Loading...</span>
            </Spinner>
          </div>
        ) : (
          <div className="d-grid gap-3">
            {articles.length === 0 ? (
              <Card className="topic-detail-empty">
                <Card.Body className="p-4 text-center">
                  Chưa có bài báo nào cho topic này.
                </Card.Body>
              </Card>
            ) : (
              articles.map((article) => (
                <Card key={article.id} className="topic-detail-article-card">
                  <Card.Body className="p-4">
                    <div className="d-flex justify-content-between align-items-start gap-3 flex-wrap">
                      <div className="flex-grow-1">
                        <button
                          type="button"
                          className="btn btn-link topic-detail-article-title mb-2"
                          onClick={() => navigate(`/articles/${article.id}/visual`)}
                        >
                          {article.title}
                        </button>

                        <div className="topic-detail-article-meta">
                          <span className="d-inline-flex align-items-center gap-1">
                            <Icon icon="lucide:calendar-range" width="15" />
                            {article.year || 'N/A'}
                          </span>
                          {article.doi && (
                            <a
                              href={article.doi.startsWith('http') ? article.doi : `https://doi.org/${article.doi}`}
                              target="_blank"
                              rel="noreferrer"
                              className="d-inline-flex align-items-center gap-1"
                            >
                              <Icon icon="lucide:link-2" width="15" />
                              DOI
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card.Body>
                </Card>
              ))
            )}
          </div>
        )}

        {articles.length > 0 && totalPages > 1 && (
          <AdminPagination
            totalItems={pagination.total}
            currentPage={pagination.page}
            limit={pagination.limit}
            onPageChange={handlePageChange}
            entityName="bài báo"
          />
        )}
      </Container>
    </div>
  );
}
