import { useEffect, useMemo, useState } from 'react';
import { Row, Col, Card, Button } from 'react-bootstrap';
import { Icon } from '@iconify/react';
import { useJournalManagement } from '../../journal/hooks/useJournalManagement';
import { getJournalArticlesApi } from '../../journal/api/journalApi';
import { getAdminJournalRepositorySummary } from '../api/adminDashboard.api';
import VolumeList from '../components/repository/VolumeList';
import IssueTable from '../components/repository/IssueTable';
import SwitchJournalModal from '../components/modals/SwitchJournalModal';
import CreateVolumeModal from '../components/modals/CreateVolumeModal';
import CreateIssueModal from '../components/modals/CreateIssueModal';

/**
 * RepositoryManagementPage - Admin repository coordinator for selected journal volumes and issues.
 */
export default function RepositoryManagementPage() {
  const {
    currentJournal,
    volumes,
    issues,
    selectedVolume,
    setSelectedVolume,
    fetchInitialData,
  } = useJournalManagement();

  const [showSwitchModal, setShowSwitchModal] = useState(false);
  const [showVolumeModal, setShowVolumeModal] = useState(false);
  const [showIssueModal, setShowIssueModal] = useState(false);
  const [repositorySummary, setRepositorySummary] = useState(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summaryError, setSummaryError] = useState('');
  const [articleCountsByIssueId, setArticleCountsByIssueId] = useState({});
  const [volumeStatsById, setVolumeStatsById] = useState({});

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  useEffect(() => {
    let isMounted = true;

    const fetchRepositorySummary = async () => {
      if (!currentJournal?.id) {
        setRepositorySummary(null);
        setSummaryError('');
        return;
      }

      try {
        setSummaryLoading(true);
        setSummaryError('');
        const response = await getAdminJournalRepositorySummary(currentJournal.id);

        if (!isMounted) return;
        setRepositorySummary(response.data?.data || null);
      } catch (error) {
        if (!isMounted) return;
        setRepositorySummary(null);
        setSummaryError(
          error.response?.status === 403
            ? 'Backend từ chối quyền admin: token hiện tại không có role ADMINISTRATOR.'
            : 'Không thể tải thống kê repository từ backend.'
        );
      } finally {
        if (isMounted) setSummaryLoading(false);
      }
    };

    fetchRepositorySummary();

    return () => {
      isMounted = false;
    };
  }, [currentJournal?.id]);

  const currentVolumes = useMemo(
    () => (volumes || []).filter((volume) => volume.journalId === currentJournal?.id),
    [volumes, currentJournal?.id]
  );

  useEffect(() => {
    if (currentVolumes.length > 0 && !selectedVolume) {
      setSelectedVolume(currentVolumes[0].id);
    }
  }, [currentVolumes, selectedVolume, setSelectedVolume]);

  const currentIssues = useMemo(
    () => (issues || []).filter((issue) => (issue.volume_id || issue.volumeId) === selectedVolume),
    [issues, selectedVolume]
  );

  useEffect(() => {
    let isMounted = true;

    const fetchRepositoryVolumeStats = async () => {
      const issuesByVolumeId = currentVolumes.reduce((acc, volume) => {
        acc[volume.id] = (issues || []).filter((issue) => (issue.volume_id || issue.volumeId) === volume.id);
        return acc;
      }, {});

      const allIssues = Object.values(issuesByVolumeId).flat();

      if (!allIssues.length) {
        if (isMounted) {
          setArticleCountsByIssueId({});
          setVolumeStatsById(Object.fromEntries(
            currentVolumes.map((volume) => [volume.id, { issueCount: 0, articleCount: 0 }])
          ));
        }
        return;
      }

      try {
        const countEntries = await Promise.all(
          allIssues.map(async (issue) => {
            const issueId = issue.issue_id || issue.id;
            const response = await getJournalArticlesApi({ issue_id: issueId, page: 1, limit: 1 });
            const payload = response.data?.data;
            const count = payload?.pagination?.total ?? payload?.total ?? (Array.isArray(payload) ? payload.length : 0);
            return [issueId, count];
          })
        );

        if (isMounted) {
          const nextArticleCounts = Object.fromEntries(countEntries);
          setArticleCountsByIssueId(nextArticleCounts);
          setVolumeStatsById(Object.fromEntries(
            currentVolumes.map((volume) => {
              const volumeIssues = issuesByVolumeId[volume.id] || [];
              const articleCount = volumeIssues.reduce((sum, issue) => sum + (nextArticleCounts[issue.issue_id || issue.id] || 0), 0);
              return [volume.id, { issueCount: volumeIssues.length, articleCount }];
            })
          ));
        }
      } catch {
        if (isMounted) {
          setArticleCountsByIssueId({});
          setVolumeStatsById(Object.fromEntries(
            currentVolumes.map((volume) => [
              volume.id,
              {
                issueCount: (issuesByVolumeId[volume.id] || []).length,
                articleCount: undefined,
              },
            ])
          ));
        }
      }
    };

    fetchRepositoryVolumeStats();

    return () => {
      isMounted = false;
    };
  }, [currentVolumes, issues]);

  const totalVolumes = repositorySummary?.total_volumes ?? 0;
  const activeIssues = repositorySummary?.active_issues ?? 0;
  const totalPublications = repositorySummary?.total_publications ?? 0;
  const nextRelease = repositorySummary?.next_release
    ? new Date(repositorySummary.next_release).toLocaleDateString('en-US', {
      month: 'short',
      day: '2-digit',
      year: 'numeric',
    })
    : 'N/A';

  const activeVolObj = currentVolumes.find((volume) => volume.id === selectedVolume);

  return (
    <div className="d-flex flex-column gap-3 text-start">
      <div className="d-flex justify-content-between align-items-center mb-1">
        <div>
          <span className="text-muted-custom small text-uppercase fw-semibold" style={{ letterSpacing: '0.05em' }}>
            Resource Management
          </span>
          <h2 className="font-display fw-bold text-main mb-1">Repository Management</h2>
          <p className="text-muted-custom small mb-0">
            Manage volumes and publication issues for your active journals.
          </p>
        </div>
        <Button
          className="btn-primary-glow d-flex align-items-center gap-1.5 py-2 px-3"
          onClick={() => setShowVolumeModal(true)}
        >
          <Icon icon="lucide:plus" width="16" />
          <span>New Volume</span>
        </Button>
      </div>

      <div className="bg-white p-4 rounded-3 border d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-2" style={{ borderColor: 'var(--border)' }}>
        <div className="d-flex align-items-center gap-3">
          <div className="admin-icon-tile d-none d-sm-flex">
            <Icon icon="lucide:book-open" width="24" />
          </div>
          <div>
            <div className="text-muted-custom text-uppercase small fw-bold" style={{ fontSize: '0.7rem', letterSpacing: '0.05em' }}>
              Select Journal Repository
            </div>
            <h5 className="font-display fw-bold text-main m-0 d-flex align-items-center gap-2">
              {currentJournal ? currentJournal.title : 'No active journal selected'}
              <span className="badge admin-status-badge admin-status-badge--accent text-xs font-sans rounded px-2 py-0.5">
                ACTIVE
              </span>
            </h5>
            <small className="text-muted-custom font-monospace">
              ISSN: {currentJournal?.issn} • Publisher: {currentJournal?.publisher || 'N/A'}
            </small>
          </div>
        </div>
        <Button
          variant="outline-dark"
          className="d-flex align-items-center gap-1.5 py-2 px-3 btn-custom-sm font-sans"
          onClick={() => setShowSwitchModal(true)}
        >
          <Icon icon="lucide:refresh-cw" width="14" />
          <span>Switch Journal</span>
        </Button>
      </div>

      {summaryError && (
        <div className="alert alert-danger border-0 rounded-3 small mb-2">
          {summaryError}
        </div>
      )}

      <Row className="g-3 mb-2">
        <Col xs={12} sm={6} md={3}>
          <Card className="border p-3 shadow-none bg-white rounded-3">
            <div className="d-flex align-items-center justify-content-between mb-2">
              <div className="text-muted-custom small text-uppercase fw-semibold">Total Volumes</div>
              <div className="text-muted bg-light p-1.5 rounded-2 d-flex"><Icon icon="lucide:layers" width="16" /></div>
            </div>
            <h3 className="fw-bold text-main m-0 font-monospace">{summaryLoading ? '...' : totalVolumes}</h3>
          </Card>
        </Col>
        <Col xs={12} sm={6} md={3}>
          <Card className="border p-3 shadow-none bg-white rounded-3">
            <div className="d-flex align-items-center justify-content-between mb-2">
              <div className="text-muted-custom small text-uppercase fw-semibold">Active Issues</div>
              <div className="text-muted bg-light p-1.5 rounded-2 d-flex"><Icon icon="lucide:book-marked" width="16" /></div>
            </div>
            <h3 className="fw-bold text-main m-0 font-monospace">{summaryLoading ? '...' : activeIssues}</h3>
          </Card>
        </Col>
        <Col xs={12} sm={6} md={3}>
          <Card className="border p-3 shadow-none bg-white rounded-3">
            <div className="d-flex align-items-center justify-content-between mb-2">
              <div className="text-muted-custom small text-uppercase fw-semibold">Total Articles</div>
              <div className="text-muted bg-light p-1.5 rounded-2 d-flex"><Icon icon="lucide:file-text" width="16" /></div>
            </div>
            <h3 className="fw-bold text-main m-0 font-monospace">{summaryLoading ? '...' : totalPublications}</h3>
          </Card>
        </Col>
        <Col xs={12} sm={6} md={3}>
          <Card className="border p-3 shadow-none bg-white rounded-3">
            <div className="d-flex align-items-center justify-content-between mb-2">
              <div className="text-muted-custom small text-uppercase fw-semibold">Next Release</div>
              <div className="text-muted bg-light p-1.5 rounded-2 d-flex"><Icon icon="lucide:calendar" width="16" /></div>
            </div>
            <h3 className="fw-bold text-main m-0 font-monospace admin-accent-text" style={{ fontSize: '1.25rem' }}>
              {summaryLoading ? '...' : nextRelease}
            </h3>
          </Card>
        </Col>
      </Row>

      <Row className="g-4 align-items-start">
        <Col xs={12} lg={4}>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="font-display fw-bold text-main mb-0 d-flex align-items-center gap-2">
              Volumes Repository
              <Icon icon="lucide:sliders-horizontal" className="text-muted" width="16" />
            </h5>
          </div>
          <VolumeList
            volumes={currentVolumes}
            selectedVolumeId={selectedVolume}
            onSelectVolume={setSelectedVolume}
            volumeStatsById={volumeStatsById}
          />
        </Col>

        <Col xs={12} lg={8}>
          <div className="bg-white p-4 rounded-3 border" style={{ borderColor: 'var(--border)' }}>
            <div className="d-flex justify-content-between align-items-start border-bottom pb-3 mb-3">
              <div>
                <h5 className="font-display fw-bold text-main mb-1">
                  {activeVolObj ? `${activeVolObj.volumeNumber} Overview` : 'Volume Overview'}
                </h5>
                <small className="text-muted-custom">
                  Published: {activeVolObj?.frequency || 'Quarterly'} • Frequency: Q1, Q2, Q3, Q4
                </small>
              </div>
              <Button
                className="btn-primary-glow btn-custom-sm d-flex align-items-center gap-1 px-3 py-2"
                disabled={!selectedVolume}
                onClick={() => setShowIssueModal(true)}
              >
                <Icon icon="lucide:plus-circle" width="14" />
                <span>Add Issue</span>
              </Button>
            </div>

            <IssueTable issues={currentIssues} articleCountsByIssueId={articleCountsByIssueId} />
          </div>
        </Col>
      </Row>

      <SwitchJournalModal
        show={showSwitchModal}
        handleClose={() => setShowSwitchModal(false)}
      />
      <CreateVolumeModal
        show={showVolumeModal}
        handleClose={() => setShowVolumeModal(false)}
      />
      <CreateIssueModal
        show={showIssueModal}
        handleClose={() => setShowIssueModal(false)}
      />
    </div>
  );
}
