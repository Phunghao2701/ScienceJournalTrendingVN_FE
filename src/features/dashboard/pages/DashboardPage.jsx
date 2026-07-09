/**
 * File source thuộc hệ thống FE ResearchPulse.
 *
 * File: features\dashboard\pages\DashboardPage.jsx
 */
import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Container, Row, Col } from "react-bootstrap";
import { Icon } from "@iconify/react";

import Header from "../../landing/components/Header";
import { useUserStore } from "../../../app/store/userStore";
import useDashboard from "../hooks/useDashboard";

import DashboardStatCards from "../components/DashboardStatCards";
import PublicationTrendChart from "../components/PublicationTrendChart";
import RecentProjectsCard from "../components/RecentProjectsCard";
import TrendingKeywordsCard from "../components/TrendingKeywordsCard";
import QuickAccessGrid from "../components/QuickAccessGrid";
import TopAuthorsTable from "../components/TopAuthorsTable";
import AuthRequiredModal from "../../../shared/components/AuthRequiredModal";

/**
 * DashboardPage — Trang Tổng quan / Dashboard
 * Route: /dashboard
 *
 * Layout:
 *  Header → WelcomeSection → StatCards →
 *  [Chart 70% | RecentProjects 30%] →
 *  [TrendingKeywords | QuickAccess] →
 *  TopAuthorsTable
 */
export default function DashboardPage() {
  const navigate = useNavigate();
  const email = useUserStore((state) => state.email);

  const {
    projects,
    analytics,
    trendingKeywords,
    topAuthors,
    summaryStats,
    loadingProjects,
    loadingAnalytics,
    loadingKeywords,
    loadingAuthors,
    errorProjects,
    errorAnalytics,
    errorKeywords,
    errorAuthors,
    refetchAnalytics,
  } = useDashboard(email);

  // Quick search state
  const [quickSearch, setQuickSearch] = useState("");

  // Auth modal (for "Tạo Project mới" when guest)
  const [showAuthModal, setShowAuthModal] = useState(false);

  const handleQuickSearch = useCallback(
    (e) => {
      if (e.key === "Enter" && quickSearch.trim()) {
        navigate(`/articles?search=${encodeURIComponent(quickSearch.trim())}`);
      }
    },
    [quickSearch, navigate],
  );

  const handleCreateProject = () => {
    if (!email) {
      setShowAuthModal(true);
    } else {
      navigate("/projects/create");
    }
  };

  const handleProjectClick = (project) => {
    const id = project.project_id ?? project.id;
    if (id) navigate(`/projects/${id}`);
  };

  const handleAuthorClick = (author) => {
    const id = author.author_id ?? author.id;
    if (id) navigate(`/authors/${id}`);
  };

  const handleKeywordClick = (keyword) => {
    navigate(`/articles?search=${encodeURIComponent(keyword)}`);
  };

  const firstProjectId = projects[0]?.project_id ?? projects[0]?.id;

  return (
    <div
      className="dashboard-page min-vh-100"
      style={{
        backgroundColor: "var(--bg-main)",
        color: "var(--text-main)",
      }}
    >
      {/* Sticky Navbar */}
      <Header />

      <Container className="py-4">
        {/* ── Quick Search Bar ────────────────────────────────────── */}
        <div className="mb-4">
          <div
            className="d-flex align-items-center gap-2 px-3 py-2 rounded-3"
            style={{
              backgroundColor: "var(--bg-card)",
              border: "1px solid var(--border)",
              maxWidth: 480,
              transition: "border-color 0.2s ease",
            }}
            onFocusCapture={(e) =>
              (e.currentTarget.style.borderColor = "var(--primary)")
            }
            onBlurCapture={(e) =>
              (e.currentTarget.style.borderColor = "var(--border)")
            }
          >
            <Icon
              icon="lucide:search"
              width={16}
              style={{ color: "var(--text-muted)", flexShrink: 0 }}
            />
            <input
              type="text"
              placeholder="Tìm kiếm nhanh..."
              value={quickSearch}
              onChange={(e) => setQuickSearch(e.target.value)}
              onKeyDown={handleQuickSearch}
              className="border-0 bg-transparent text-main w-100"
              style={{ outline: "none", fontSize: "0.85rem" }}
            />
          </div>
        </div>

        {/* ── Welcome Section ─────────────────────────────────────── */}
        <div className="d-flex flex-column flex-sm-row align-items-sm-center justify-content-between gap-3 mb-4">
          <div>
            <h1
              className="font-display fw-bold text-main mb-1"
              style={{
                fontSize: "calc(1.4rem + 0.8vw)",
                letterSpacing: "-0.02em",
              }}
            >
              Chào mừng bạn đến với ResearchPulse! 👋
            </h1>
            <p
              className="text-muted-custom mb-0"
              style={{ fontSize: "0.88rem" }}
            >
              Khám phá xu hướng tạp chí và các bài báo khoa học mới nhất.
            </p>
          </div>
          <button
            className="btn btn-primary-glow d-flex align-items-center gap-2 px-4 py-2 border-0 flex-shrink-0"
            onClick={handleCreateProject}
            style={{
              borderRadius: 10,
              fontWeight: 600,
              fontSize: "0.85rem",
              whiteSpace: "nowrap",
            }}
          >
            <Icon icon="lucide:plus" width={16} />
            Tạo Project mới
          </button>
        </div>

        {/* ── Stat Cards ──────────────────────────────────────────── */}
        <DashboardStatCards stats={summaryStats} loading={loadingProjects} />

        {/* ── Chart + Recent Projects ─────────────────────────────── */}
        <Row className="g-3 mb-3">
          <Col xs={12} lg={8}>
            <PublicationTrendChart
              analytics={analytics}
              loading={loadingAnalytics}
              error={errorAnalytics}
              onRetry={() => firstProjectId && refetchAnalytics(firstProjectId)}
            />
          </Col>
          <Col xs={12} lg={4}>
            <RecentProjectsCard
              projects={projects}
              loading={loadingProjects}
              error={errorProjects}
              onViewAll={() => navigate("/projects")}
              onProjectClick={handleProjectClick}
            />
          </Col>
        </Row>

        {/* ── Trending Keywords + Quick Access ────────────────────── */}
        <Row className="g-3 mb-4">
          <Col xs={12} md={6}>
            <TrendingKeywordsCard
              keywords={trendingKeywords}
              loading={loadingKeywords}
              error={errorKeywords}
              onKeywordClick={handleKeywordClick}
              onViewMore={() => navigate("/articles")}
            />
          </Col>
          <Col xs={12} md={6}>
            <QuickAccessGrid />
          </Col>
        </Row>

        {/* ── Top Authors Table ────────────────────────────────────── */}
        <TopAuthorsTable
          authors={topAuthors}
          loading={loadingAuthors}
          error={errorAuthors}
          onAuthorClick={handleAuthorClick}
          onViewAll={() => navigate("/authors")}
        />
      </Container>

      {/* Auth modal for guests clicking "Tạo Project mới" */}
      <AuthRequiredModal
        show={showAuthModal}
        onHide={() => setShowAuthModal(false)}
      />
    </div>
  );
}
