/**
 * File source thuộc hệ thống FE ResearchPulse.
 *
 * File: features\journal\components\VolumesTabContent.jsx
 */
import { useState } from 'react';
import { Spinner, Button } from 'react-bootstrap';
import { Icon } from '@iconify/react';
import { useNavigate } from 'react-router-dom';
import LoadingSkeleton from '../../../shared/components/LoadingSkeleton';
import AdminPagination from '../../../shared/components/Pagination';

const MONTH_NAMES = [
  '', 'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4',
  'Tháng 5', 'Tháng 6', 'Tháng 7', 'Tháng 8',
  'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'
];

export default function VolumesTabContent({
  volumes = [],
  issuesByVolume = {},
  issueErrors = {},
  journalId,
  onVolumeExpand,
  loading,
  error = false,
  volumePagination,
  issuePaginationByVolume = {},
  onVolumePageChange,
  onIssuePageChange
}) {
  const navigate = useNavigate();
  const [expandedVolumes, setExpandedVolumes] = useState({});

  /** Toggle accordion mở/đóng volume; trigger lazy load nếu chưa có data */
  const toggleVolume = (volumeId) => {
    const isNowExpanded = !expandedVolumes[volumeId];
    setExpandedVolumes(prev => ({ ...prev, [volumeId]: isNowExpanded }));

    if (isNowExpanded && onVolumeExpand) {
      onVolumeExpand(volumeId);
    }
  };

  /** Điều hướng đến trang bài báo theo issue */
  const handleViewArticles = (e, issueId) => {
    e.stopPropagation();
    const query = new URLSearchParams({ issue_id: issueId });
    if (journalId) query.set('journal_id', journalId);
    navigate(`/articles?${query.toString()}`);
  };

  /** Render shared pagination controls with API pagination metadata. */
  const renderPagination = (pagination, onPageChange, entityName) => {
    const totalItems = pagination?.total || pagination?.total_items || pagination?.totalItems || 0;
    const currentPage = pagination?.page || 1;
    const limit = pagination?.limit || pagination?.page_size || 10;

    if (totalItems <= limit) return null;

    return (
      <AdminPagination
        totalItems={totalItems}
        currentPage={currentPage}
        limit={limit}
        onPageChange={onPageChange}
        entityName={entityName}
      />
    );
  };

  if (loading) {
    return (
      <section className="journal-surface p-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="mb-3 p-3 border-bottom">
            <LoadingSkeleton width="200px" height="24px" className="mb-2" />
            <LoadingSkeleton width="120px" height="16px" />
          </div>
        ))}
      </section>
    );
  }

  if (error) {
    return (
      <section className="journal-surface journal-empty-state">
        <Icon icon="lucide:alert-triangle" width="36" className="text-danger" />
        <p className="mb-0">Không thể tải danh sách volumes. Vui lòng thử lại.</p>
      </section>
    );
  }

  if (!volumes || volumes.length === 0) {
    return (
      <section className="journal-surface journal-empty-state">
        <Icon icon="lucide:folder-x" width="36" />
        <p className="mb-0">Journal này chưa có dữ liệu volume.</p>
      </section>
    );
  }

  return (
    <div className="journal-volume-list">
      {volumes.map((vol) => {
        const volumeId = vol.volume_id || vol.id;
        const volumeYear = vol.publication_year || vol.year;
        const isExpanded = !!expandedVolumes[volumeId];
        const issues = issuesByVolume[volumeId];
        const issueError = issueErrors[volumeId];
        const issuePagination = issuePaginationByVolume[volumeId];

        return (
          <article key={volumeId} className={`journal-volume-card ${isExpanded ? 'is-expanded' : ''}`}>
            <div className="journal-volume-header" onClick={() => toggleVolume(volumeId)}>
              <div className="d-flex align-items-center gap-3 flex-wrap">
                <Icon icon={isExpanded ? 'lucide:folder-open' : 'lucide:folder'} style={{ color: 'var(--text-muted)' }} width="20" />
                <div>
                  <span className="journal-volume-title">Volume {vol.volume_number || 'N/A'}</span>
                  <span className="journal-volume-meta">{volumeYear || 'Chưa cập nhật'}</span>
                  {vol.issue_count !== undefined && vol.issue_count > 0 && (
                    <span className="journal-badge journal-badge--neutral ms-2">
                      {vol.issue_count} issue
                    </span>
                  )}
                </div>
              </div>
              <span className="text-muted-custom d-flex align-items-center">
                <Icon icon={isExpanded ? 'lucide:chevron-up' : 'lucide:chevron-down'} width="18" />
              </span>
            </div>

            {isExpanded && (
              <div className="journal-issue-panel">
                {issues === undefined && !issueError ? (
                  <div className="d-flex align-items-center gap-2 py-3 text-muted-custom">
                    <Spinner animation="border" size="sm" />
                    Đang tải danh sách issue...
                  </div>
                ) : issueError ? (
                  <div className="d-flex align-items-center gap-2 py-3 text-danger">
                    <Icon icon="lucide:alert-triangle" width="16" />
                    Không thể tải danh sách issues. Vui lòng thử lại.
                  </div>
                ) : !issues || issues.length === 0 ? (
                  <div className="text-muted-custom py-3 text-start">
                    <Icon icon="lucide:inbox" width="14" className="me-1" />
                    Volume này chưa có issue.
                  </div>
                ) : (
                  <div className="d-flex flex-column gap-2 py-2">
                    {issues.map((issue) => {
                      const issueId = issue.issue_id || issue.id;
                      const issueYear = issue.publication_year || issue.year;
                      const issueMonth = issue.month ? MONTH_NAMES[issue.month] || `Tháng ${issue.month}` : null;

                      return (
                        <div key={issueId} className="journal-issue-row">
                          <div className="d-flex align-items-center gap-2 flex-wrap">
                            <Icon icon="lucide:file-stack" style={{ color: 'var(--text-muted)' }} width="15" />
                            <span className="journal-issue-title">Issue {issue.issue_number || 'N/A'}</span>
                            {(issueMonth || issueYear) && (
                              <span className="text-muted-custom small">
                                {[issueMonth, issueYear].filter(Boolean).join(' ')}
                              </span>
                            )}
                            {issue.article_count !== undefined && (
                              <span className="journal-badge journal-badge--neutral">
                                {issue.article_count} bài báo
                              </span>
                            )}
                          </div>

                          <Button onClick={(e) => handleViewArticles(e, issueId)} className="journal-text-btn px-3 py-1">
                            Xem bài báo
                            <Icon icon="lucide:arrow-right" width="14" />
                          </Button>
                        </div>
                      );
                    })}
                    {renderPagination(
                      issuePagination,
                      (nextPage) => onIssuePageChange && onIssuePageChange(volumeId, nextPage),
                      'issue'
                    )}
                  </div>
                )}
              </div>
            )}
          </article>
        );
      })}
      {renderPagination(
        volumePagination,
        (nextPage) => onVolumePageChange && onVolumePageChange(nextPage),
        'volume'
      )}
    </div>
  );
}
