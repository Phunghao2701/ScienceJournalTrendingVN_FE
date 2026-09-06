import { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Form, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Icon from '../../../shared/components/Icon';
import Header from '../../landing/components/Header';
import useAuthors from '../hooks/useAuthors';
import AuthorLeaderboardTable from '../components/AuthorLeaderboardTable';
import AuthorNavigationTabs from '../components/AuthorNavigationTabs';
import './AuthorLeaderboardPage.css';

export default function AuthorLeaderboardPage() {
  const navigate = useNavigate();
  const { i18n } = useTranslation();
  const isVi = i18n.resolvedLanguage?.startsWith('vi');

  // Localized texts
  const overviewLabel = isVi ? 'Tổng quan' : 'Overview';
  const featuredAuthorsLabel = isVi ? 'Tác giả nổi bật' : 'Featured Authors';
  const leaderboardLabel = isVi ? 'Bảng xếp hạng' : 'Leaderboard';
  const pageTitle = isVi ? 'Bảng xếp hạng tác giả' : 'Author Leaderboard';
  const pageDesc = isVi
    ? 'Các tác giả nổi bật nhất hệ thống được xếp hạng theo số bài báo, citations và tầm ảnh hưởng nghiên cứu.'
    : 'The most prominent authors in the system ranked by publication count, citations, and research impact.';
  const backToListLabel = isVi ? 'Quay lại danh sách tác giả' : 'Back to author list';

  const subjectLabel = isVi ? 'Lĩnh vực:' : 'Subject:';
  const allSubjectsLabel = isVi ? 'Tất cả lĩnh vực' : 'All subject areas';
  const periodLabel = isVi ? 'Thời gian:' : 'Period:';
  const allTimeLabel = isVi ? 'Tất cả thời gian' : 'All time';
  const thisWeekLabel = isVi ? 'Tuần này' : 'This week';
  const thisMonthLabel = isVi ? 'Tháng này' : 'This month';

  const {
    leaderboard,
    loadingLeaderboard,
    errorLeaderboard,
    fetchLeaderboard
  } = useAuthors();

  const [selectedArea, setSelectedArea] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState('all');

  useEffect(() => {
    fetchLeaderboard({
      subject_area: selectedArea,
      period: selectedPeriod
    });
  }, [selectedArea, selectedPeriod, fetchLeaderboard]);

  return (
    <div className="author-leaderboard-page">
      <Header />

      <Container className="pt-4">
        <nav className="author-leaderboard-breadcrumb mb-4" aria-label="breadcrumb">
          <ol className="breadcrumb">
            <li className="breadcrumb-item">
              <span className="author-leaderboard-breadcrumb__link" onClick={() => navigate('/')}>
                {overviewLabel}
              </span>
            </li>
            <li className="breadcrumb-item">
              <span className="author-leaderboard-breadcrumb__link" onClick={() => navigate('/authors')}>
                {featuredAuthorsLabel}
              </span>
            </li>
            <li className="breadcrumb-item active text-primary" aria-current="page">
              {leaderboardLabel}
            </li>
          </ol>
        </nav>

        <section className="author-leaderboard-hero">
          <div className="author-leaderboard-hero__content d-flex flex-column flex-md-row justify-content-between align-items-start gap-3">
            <div>
              <div className="author-leaderboard-eyebrow">
                <Icon icon="lucide:trophy" width="17" />
                <span>Author leaderboard</span>
              </div>
              <h1 className="author-leaderboard-title">{pageTitle}</h1>
              <p className="author-leaderboard-description">
                {pageDesc}
              </p>
            </div>
            <Button
              variant="link"
              onClick={() => navigate('/authors')}
              className="author-leaderboard-back p-0 d-flex align-items-center gap-2"
            >
              <Icon icon="lucide:arrow-left" width="18" />
              <span>{backToListLabel}</span>
            </Button>
          </div>
        </section>

        <AuthorNavigationTabs activeTab="leaderboard" />

        <Card className="author-leaderboard-filter-card">
          <Row className="g-3 align-items-center">
            <Col xs={12} sm={6} md={4}>
              <Form.Group className="d-flex align-items-center gap-2">
                <Form.Label className="author-leaderboard-label m-0 flex-shrink-0">{subjectLabel}</Form.Label>
                <Form.Select
                  size="sm"
                  value={selectedArea}
                  onChange={e => setSelectedArea(e.target.value)}
                  className="author-leaderboard-select"
                >
                  <option value="">{allSubjectsLabel}</option>
                  <option value="Machine Learning">Machine Learning</option>
                  <option value="Computer Vision">Computer Vision</option>
                  <option value="Deep Learning">Deep Learning</option>
                  <option value="Quantum Optics">Quantum Optics</option>
                </Form.Select>
              </Form.Group>
            </Col>

            <Col xs={12} sm={6} md={4}>
              <Form.Group className="d-flex align-items-center gap-2">
                <Form.Label className="author-leaderboard-label m-0 flex-shrink-0">{periodLabel}</Form.Label>
                <Form.Select
                  size="sm"
                  value={selectedPeriod}
                  onChange={e => setSelectedPeriod(e.target.value)}
                  className="author-leaderboard-select"
                >
                  <option value="all">{allTimeLabel}</option>
                  <option value="week">{thisWeekLabel}</option>
                  <option value="month">{thisMonthLabel}</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>
        </Card>

        <AuthorLeaderboardTable
          authors={leaderboard}
          loading={loadingLeaderboard}
          error={errorLeaderboard}
          onRetry={() => fetchLeaderboard({ subject_area: selectedArea, period: selectedPeriod })}
        />
      </Container>
    </div>
  );
}
