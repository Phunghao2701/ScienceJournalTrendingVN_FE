/**
 * File source thuộc hệ thống FE ResearchPulse.
 *
 * File: features\journal\pages\JournalDetailPage.jsx
 */
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Breadcrumb, Button } from 'react-bootstrap';
import { Icon } from '@iconify/react';

// Shared Layout Header
import Header from '../../landing/components/Header';

// Auth Hook
import useAuth from '../../auth/hooks/useAuth';

// Feature Components & Hooks
import { useJournalDetail } from '../hooks/useJournalDetail';
import JournalHero from '../components/JournalHero';
import JournalMetadataGrid from '../components/JournalMetadataGrid';
import JournalTabs from '../components/JournalTabs';
import RankingTabContent from '../components/RankingTabContent';
import VolumesTabContent from '../components/VolumesTabContent';
import ArticlesTabContent from '../components/ArticlesTabContent';
import AuthRequiredModal from '../../../shared/components/AuthRequiredModal';
import AddToProjectModal from '../components/AddToProjectModal';
import '../components/JournalDetail.css';

export default function JournalDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const auth = useAuth();
  const currentUser = auth?.user;

  const {
    journal,
    rankingHistory,
    volumes,
    issuesByVolume,
    issueErrors,
    volumePagination,
    issuePaginationByVolume,
    recentArticles,
    activeTab,
    setActiveTab,
    loadingJournal,
    loadingRanking,
    loadingVolumes,
    loadingArticles,
    volumesError,
    notFound,
    showAuthModal,
    setShowAuthModal,
    showProjectModal,
    setShowProjectModal,
    isFollowing,
    isAddingToProject,
    handleFollow,
    handleAddToProject,
    fetchIssuesForVolume,
    handleVolumePageChange,
    handleIssuePageChange
  } = useJournalDetail(id, currentUser);

  // Fallback for not found or empty ID
  if (notFound) {
    return (
      <div className="grid-bg min-vh-100 d-flex flex-column text-main">
        <Header />
        <Container className="flex-grow-1 d-flex flex-column justify-content-center align-items-center py-5">
          <div className="journal-dark-card p-5 text-center" style={{ maxWidth: '500px' }}>
            <Icon icon="lucide:alert-circle" className="text-danger mb-4" width="64" />
            <h2 className="font-display fw-bold text-main mb-3">Không tìm thấy Tạp chí</h2>
            <p className="text-muted-custom mb-4">
              Tạp chí bạn đang tìm kiếm không tồn tại hoặc dữ liệu chưa được cập nhật trong hệ thống.
            </p>
            <Button 
              className="btn-primary-glow border-0 px-4 py-2 text-white" 
              onClick={() => navigate('/')}
              style={{ borderRadius: '6px' }}
            >
              Quay lại Trang chủ
            </Button>
          </div>
        </Container>
      </div>
    );
  }

  return (
    <div className="grid-bg min-vh-100 text-main pb-5 journal-detail-page">
      {/* Top Navbar */}
      <Header />

      {/* Main Container */}
      <Container className="pt-5 mt-5 journal-detail-shell">
        
        {/* Custom Breadcrumb Nav */}
        <div aria-label="breadcrumb" className="journal-breadcrumb">
          <Breadcrumb className="mb-0 custom-breadcrumb d-flex align-items-center">
            <Breadcrumb.Item
              onClick={() => navigate('/')}
              className="d-flex align-items-center"
              linkProps={{ style: { cursor: 'pointer', fontSize: '0.85rem', lineHeight: 1, color: 'var(--text-muted)', textDecoration: 'none' } }}
            >
              Trang chủ
            </Breadcrumb.Item>
            <Breadcrumb.Item
              onClick={() => navigate('/search')}
              className="d-flex align-items-center"
              linkProps={{ style: { cursor: 'pointer', fontSize: '0.85rem', lineHeight: 1, color: 'var(--text-muted)', textDecoration: 'none' } }}
            >
              Tìm kiếm
            </Breadcrumb.Item>
            <Breadcrumb.Item 
              active 
              className="d-flex align-items-center"
              style={{ fontSize: '0.85rem', color: 'var(--text-main)', fontWeight: 500 }}
            >
              {loadingJournal ? 'Đang tải...' : journal?.display_name}
            </Breadcrumb.Item>
          </Breadcrumb>
        </div>

        {/* Hero Section */}
        <JournalHero 
          journal={journal}
          isFollowing={isFollowing}
          isAddingToProject={isAddingToProject}
          onFollow={handleFollow}
          onAddToProject={() => handleAddToProject()}
          loading={loadingJournal}
        />

        {/* Grid Metadata metrics */}
        <JournalMetadataGrid 
          journal={journal} 
          loading={loadingJournal} 
        />

        {/* Tab Controls */}
        <JournalTabs 
          activeTab={activeTab} 
          onTabChange={setActiveTab} 
        />

        {/* Tab Contents */}
        <div className="journal-tab-panel">
          {activeTab === 'ranking' && (
            <RankingTabContent 
              rankingHistory={rankingHistory} 
              metricName={journal?.metric_name || 'Impact Factor'}
              loading={loadingRanking}
            />
          )}

          {activeTab === 'volumes' && (
            <VolumesTabContent 
              volumes={volumes} 
              issuesByVolume={issuesByVolume}
              issueErrors={issueErrors}
              journalId={id}
              onVolumeExpand={fetchIssuesForVolume}
              loading={loadingVolumes}
              error={volumesError}
              volumePagination={volumePagination}
              issuePaginationByVolume={issuePaginationByVolume}
              onVolumePageChange={handleVolumePageChange}
              onIssuePageChange={handleIssuePageChange}
            />
          )}

          {activeTab === 'articles' && (
            <ArticlesTabContent 
              recentArticles={recentArticles} 
              loading={loadingArticles}
              onArticleClick={(artId) => navigate(`/articles/${artId}/visual`)}
            />
          )}
        </div>
      </Container>

      {/* Guest warning auth modal */}
      <AuthRequiredModal 
        show={showAuthModal} 
        onHide={() => setShowAuthModal(false)} 
      />

      {/* Project selection modal */}
      <AddToProjectModal
        show={showProjectModal}
        onHide={() => setShowProjectModal(false)}
        journalId={id}
        onConfirm={handleAddToProject}
      />
    </div>
  );
}
