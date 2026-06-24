/**
 * File: src/features/trendingVN/pages/TrendingPage.jsx
 *
 * Trang chính Theo dõi Xu hướng Nghiên cứu (TrendingVN).
 * Dành cho Researcher, Lecturer/Student phân tích xu hướng
 * công bố học thuật: top journals, top topics, top authors,
 * treemap phân bố chủ đề, trend momentum và danh sách bài báo.
 *
 * Layout:
 * 1. Header navbar chung
 * 2. Sidebar filter bên trái
 * 3. Main content:
 *    - Page Header
 *    - Stat Cards (4 số tổng quan)
 *    - Filter Bar
 *    - Row 1: Top Journals + Top Topics
 *    - Row 2: Topics Treemap + Top Authors
 *    - Row 3: Research Trend Momentum (4 cards)
 *    - Articles Table
 *
 * Màu sắc: CSS tokens --t-* theo Design System lens.org (blue #1976D2)
 */

import { useState } from 'react';
import { Spinner, Container, Row, Col } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Icon from '../../../shared/components/Icon';
import Header from '../../landing/components/Header';
import { useAuthStore } from '../../../app/store/authStore';
import useTrending from '../hooks/useTrending';

import {
  TrendingStatCard,
  TrendingFilterBar,
  TrendingBreadcrumb,
  TrendingViewSwitcher,
  TopJournalsChart,
  TrendingArticleTable,
  LensFilterSidebar,
  TopAuthorsList,
  TopicsTreemap,
  TrendMomentumCards,
  TopUniversitiesGrid,
  KeywordMomentumCloud,
} from '../components';

import './TrendingPage.css';

export default function TrendingPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const user = useAuthStore((state) => state.user);

  // ── State: sidebar tab dang mo ('filters' | 'profile' | 'info' | null) ──
  const [activeTab, setActiveTab] = useState(null);

  // ── State: view dang hien thi ('table' | 'list' | 'analysis') ───────────
  const [activeView, setActiveView] = useState('analysis');

  const {
    articles,
    articlesLoading,
    articlesError,
    articlesPagination,
    topics,
    topicsLoading,
    journals,
    journalsLoading,
    authors,
    authorsLoading,
    stats,
    universities,
    keywords,
    subjectAreas,
    subjectCategories,
    filtersLoading,
    draftFilters,
    appliedFilters,
    currentPage,
    handleDraftFilterChange,
    handleApplyFilters,
    handleResetFilters,
    handlePageChange,
    handleSortChange,
  } = useTrending();

  return (
    <div className="trending-root">
      <div className="trending-page-wrapper">

        {/* ── Header navbar chung ────────────────────────────────── */}
        <Header />

        {/* ── Layout: sidebar trai + main content ───────────────── */}
        <div className="trending-layout">

          {/* ── Sidebar trai kieu Lens.org ─────────────────────── */}
          <LensFilterSidebar
            activeTab={activeTab}
            onTabChange={setActiveTab}
            user={user}
            onNavigate={(path) => navigate(path)}
            onSaveQuery={() => {}}
            onExport={() => {}}
            onClearSearch={handleResetFilters}
            onToggleGrouping={() => {}}
            onToggleCustomise={() => {}}
          />

          {/* ── Main content ────────────────────────────────────── */}
          <div className="trending-main-content">

          {/* ── Page Header ───────────────────────────────────── */}
          <div className="trending-page-header">
            <Container fluid="xl">

              {/* Breadcrumb context bar */}
              <TrendingBreadcrumb
                totalPapers={stats.total_articles}
                totalUniversities={universities.length || null}
                yearRange={null}
                onHomeClick={() => navigate('/')}
              />

              {/* Tieu de + mo ta */}
              <h1 className="trending-page-title mb-1">{t('trendingPageTitle')}</h1>
              <p className="trending-page-subtitle">{t('trendingPageSubtitle')}</p>

            </Container>
          </div>

          <Container fluid="xl">

            {/* ── Stat Cards (4 card ngang) ────────────────────── */}
            <Row className="g-3 mb-4">
              <Col xs={12} sm={6} lg={3}>
                <TrendingStatCard
                  label={t('trendingArticlesLabel')}
                  value={stats.total_articles ? stats.total_articles.toLocaleString('en-US') : null}
                  description={t('trendingArticlesDesc')}
                  growthType="neutral"
                />
              </Col>
              <Col xs={12} sm={6} lg={3}>
                <TrendingStatCard
                  label={t('totalCitationsLabel')}
                  value={stats.total_citations ? stats.total_citations.toLocaleString('en-US') : null}
                  description={t('totalCitationsDesc')}
                  growthType="neutral"
                  accentColor="#0891B2"
                />
              </Col>
              <Col xs={12} sm={6} lg={3}>
                <TrendingStatCard
                  label={t('highestGrowthLabel')}
                  value={stats.highest_growth || null}
                  description={t('highestGrowthDesc')}
                  growth={t('highestGrowthBadge')}
                  growthType="tag"
                  accentColor="#16A34A"
                  isTextValue
                />
              </Col>
              <Col xs={12} sm={6} lg={3}>
                <TrendingStatCard
                  label={t('topTrendingFieldLabel')}
                  value={topics.length > 0 ? topics[0].display_name : null}
                  description={t('topTrendingFieldDesc')}
                  growth={topics.length > 0 ? '#1' : null}
                  growthType="rank"
                  accentColor="#7C3AED"
                  isTextValue
                />
              </Col>
            </Row>

            {/* ── Filter Bar + View Switcher ────────────────────── */}
            <TrendingFilterBar
              draftFilters={draftFilters}
              subjectAreas={subjectAreas}
              subjectCategories={subjectCategories}
              filtersLoading={filtersLoading}
              onFilterChange={handleDraftFilterChange}
              onApply={handleApplyFilters}
              onReset={handleResetFilters}
            />

            <TrendingViewSwitcher
              activeView={activeView}
              onViewChange={setActiveView}
            />

            {/* ══ ANALYSIS VIEW: charts, treemap, keywords, momentum ═══ */}
            {activeView === 'analysis' && (
              <>
                {/* ── Row 1: Top Journals + Top Universities ──────── */}
                <Row className="g-3 mb-4">
                  <Col xs={12} lg={6}>
                    <div className="trending-section-card">
                      <div className="d-flex justify-content-between align-items-start">
                        <div>
                          <h2 className="trending-section-title">{t('topJournalsByCitations')}</h2>
                          <p className="trending-section-subtitle">{t('topJournalsSubtitle')}</p>
                        </div>
                        <span className="trending-section-link">{t('topJournalsTrendingBadge')}</span>
                      </div>
                      <hr className="trending-section-divider" />
                      <TopJournalsChart journals={journals} loading={journalsLoading} />
                    </div>
                  </Col>
                  <Col xs={12} lg={6}>
                    <div className="trending-section-card">
                      <div className="d-flex justify-content-between align-items-start">
                        <div>
                          <h2 className="trending-section-title">{t('topUniversitiesTitle')}</h2>
                          <p className="trending-section-subtitle">{t('topUniversitiesSubtitle')}</p>
                        </div>
                        <span className="trending-section-link">{t('topUniversitiesTrendingBadge')}</span>
                      </div>
                      <hr className="trending-section-divider" />
                      <TopUniversitiesGrid universities={universities} loading={authorsLoading} />
                    </div>
                  </Col>
                </Row>

                {/* ── Row 2: Topics Treemap + Top Authors ─────────── */}
                <Row className="g-3 mb-4">
                  <Col xs={12} lg={6}>
                    <div className="trending-section-card">
                      <h2 className="trending-section-title">{t('topArticlesByTopic')}</h2>
                      <p className="trending-section-subtitle">{t('topArticlesTopicSubtitle')}</p>
                      <hr className="trending-section-divider" />
                      <TopicsTreemap topics={topics} loading={topicsLoading} />
                    </div>
                  </Col>
                  <Col xs={12} lg={6}>
                    <div className="trending-section-card">
                      <h2 className="trending-section-title">{t('topAuthorsRanking')}</h2>
                      <p className="trending-section-subtitle">{t('topAuthorsSubtitle')}</p>
                      <hr className="trending-section-divider" />
                      <TopAuthorsList authors={authors} loading={authorsLoading} />
                    </div>
                  </Col>
                </Row>

                {/* ── Row 3: Keyword Cloud + Trend Momentum ──────── */}
                <Row className="g-3 mb-4">
                  <Col xs={12} lg={5}>
                    <div className="trending-section-card">
                      <h2 className="trending-section-title">{t('keywordMomentumTitle')}</h2>
                      <p className="trending-section-subtitle">{t('keywordMomentumSubtitle')}</p>
                      <hr className="trending-section-divider" />
                      <KeywordMomentumCloud keywords={keywords} />
                    </div>
                  </Col>
                  <Col xs={12} lg={7}>
                    <div className="trending-section-card">
                      <h2 className="trending-section-title">{t('researchTrendTitle')}</h2>
                      <p className="trending-section-subtitle">{t('researchTrendSubtitle')}</p>
                      <hr className="trending-section-divider" />
                      <TrendMomentumCards topics={topics} authors={authors} loading={topicsLoading} />
                    </div>
                  </Col>
                </Row>
              </>
            )}

            {/* ══ TABLE / LIST VIEW: article table ════════════════ */}
            {(activeView === 'table' || activeView === 'list') && (
              <div className="trending-section-card mb-4">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h2 className="trending-section-title">{t('articles')}</h2>
                    <p className="trending-section-subtitle mb-0">
                      {articlesLoading
                        ? t('loadingLabel')
                        : articlesPagination.total.toLocaleString('en-US') + ' ' + t('articlesFound')}
                    </p>
                  </div>
                  {articlesLoading && (
                    <Spinner
                      animation="border"
                      size="sm"
                      style={{ color: 'var(--t-primary)' }}
                    />
                  )}
                </div>
                <hr className="trending-section-divider" />
                <TrendingArticleTable
                  articles={articles}
                  loading={articlesLoading}
                  error={articlesError}
                  pagination={articlesPagination}
                  currentPage={currentPage}
                  sortBy={appliedFilters.sortBy}
                  sortOrder={appliedFilters.sortOrder}
                  onSortChange={handleSortChange}
                  onPageChange={handlePageChange}
                />
              </div>
            )}

          </Container>
        </div>

        </div>{/* end trending-layout */}

      </div>
    </div>
  );
}