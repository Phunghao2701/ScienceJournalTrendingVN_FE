/**
 * @file AuthorLeaderboardPage.jsx
 * @description Trang hiển thị Bảng xếp hạng Tác giả.
 */

import { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Form, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../shared/components/Icon';
import Header from '../../landing/components/Header';
import useAuthors from '../hooks/useAuthors';
import AuthorLeaderboardTable from '../components/AuthorLeaderboardTable';
import AuthorNavigationTabs from '../components/AuthorNavigationTabs';
import './AuthorLeaderboardPage.css';

export default function AuthorLeaderboardPage() {
  const navigate = useNavigate();

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

      <Container>
        <nav className="author-leaderboard-breadcrumb mb-4" aria-label="breadcrumb">
          <ol className="breadcrumb">
            <li className="breadcrumb-item">
              <span className="author-leaderboard-breadcrumb__link" onClick={() => navigate('/')}>
                Tổng quan
              </span>
            </li>
            <li className="breadcrumb-item">
              <span className="author-leaderboard-breadcrumb__link" onClick={() => navigate('/authors')}>
                Tác giả nổi bật
              </span>
            </li>
            <li className="breadcrumb-item active text-primary" aria-current="page">
              Bảng xếp hạng
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
              <h1 className="author-leaderboard-title">Bảng xếp hạng tác giả</h1>
              <p className="author-leaderboard-description">
                Các tác giả nổi bật nhất hệ thống được xếp hạng theo số bài báo, citations và tầm ảnh hưởng nghiên cứu.
              </p>
            </div>
            <Button
              variant="link"
              onClick={() => navigate('/authors')}
              className="author-leaderboard-back p-0 d-flex align-items-center gap-2"
            >
              <Icon icon="lucide:arrow-left" width="18" />
              <span>Quay lại danh sách tác giả</span>
            </Button>
          </div>
        </section>

        <AuthorNavigationTabs activeTab="leaderboard" />

        <Card className="author-leaderboard-filter-card">
          <Row className="g-3 align-items-center">
            <Col xs={12} sm={6} md={4}>
              <Form.Group className="d-flex align-items-center gap-2">
                <Form.Label className="author-leaderboard-label m-0 flex-shrink-0">Lĩnh vực:</Form.Label>
                <Form.Select
                  size="sm"
                  value={selectedArea}
                  onChange={e => setSelectedArea(e.target.value)}
                  className="author-leaderboard-select"
                >
                  <option value="">Tất cả lĩnh vực</option>
                  <option value="Machine Learning">Machine Learning</option>
                  <option value="Computer Vision">Computer Vision</option>
                  <option value="Deep Learning">Deep Learning</option>
                  <option value="Quantum Optics">Quantum Optics</option>
                </Form.Select>
              </Form.Group>
            </Col>

            <Col xs={12} sm={6} md={4}>
              <Form.Group className="d-flex align-items-center gap-2">
                <Form.Label className="author-leaderboard-label m-0 flex-shrink-0">Thời gian:</Form.Label>
                <Form.Select
                  size="sm"
                  value={selectedPeriod}
                  onChange={e => setSelectedPeriod(e.target.value)}
                  className="author-leaderboard-select"
                >
                  <option value="all">Tất cả thời gian</option>
                  <option value="week">Tuần này</option>
                  <option value="month">Tháng này</option>
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
