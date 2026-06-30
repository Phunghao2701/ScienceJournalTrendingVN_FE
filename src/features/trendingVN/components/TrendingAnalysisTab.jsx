/**
 * File: src/features/trendingVN/components/TrendingAnalysisTab.jsx
 *
 * Content rendered inside the "Analysis" tab of TrendingVNPage.
 * Reuses the same charts/stat-cards previously shown on the standalone
 * /trending page (TrendingPage.jsx), now embedded as a tab instead of
 * a separate route so users don't lose article-list context.
 */
import { Container, Row, Col } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import useTrending from '../hooks/useTrending';
import {
  TrendingStatCard,
  TopJournalsChart,
  TopAuthorsList,
  TopicsTreemap,
  TrendMomentumCards,
  TopUniversitiesGrid,
  KeywordMomentumCloud,
} from './index';
import '../pages/TrendingPage.css';

export default function TrendingAnalysisTab() {
  const { t } = useTranslation();

  const {
    articles,
    articlesLoading,
    topics,
    topicsLoading,
    journals,
    journalsLoading,
    authors,
    authorsLoading,
    stats,
    universities,
    keywords,
    trendingArticles,
    trendingArticlesLoading,
  } = useTrending();

  return (
    <Container fluid="xl" className="px-0">
      {/* Stat Cards */}
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

      {/* Row 1: Top Journals + Top Universities */}
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

      {/* Row 2: Topics Treemap + Top Authors */}
      <Row className="g-3 mb-4">
        <Col xs={12} lg={6}>
          <div className="trending-section-card">
            <h2 className="trending-section-title">{t('topArticlesByTopic')}</h2>
            <p className="trending-section-subtitle">{t('topArticlesTopicSubtitle')}</p>
            <hr className="trending-section-divider" />
            <TopicsTreemap
              articles={trendingArticles.length > 0 ? trendingArticles : articles}
              loading={trendingArticlesLoading || articlesLoading}
            />
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

      {/* Row 3: Keyword Cloud + Trend Momentum */}
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
    </Container>
  );
}
