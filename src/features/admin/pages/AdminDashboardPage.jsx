import {
  DashboardStatCard,
  PublicationTrendsChart,
  ActivityTimeline,
  VolumeIssueTable,
} from '../components/dashboard';
import useAdminDashboard from '../hooks/useAdminDashboard';

export default function AdminDashboardPage() {
  const {
    selectedYear,
    setSelectedYear,
    statCards,
    summaryLoading,
    summaryError,
    trendItems,
    trendYears,
    trendsLoading,
    trendsError,
    activityItems,
    activityLoading,
    activityError,
    volumeStatusItems,
    volumeLoading,
    volumeError,
    volumePage,
    setVolumePage,
    volumeLimit,
    volumeTotalPages,
    volumeTotalItems,
  } = useAdminDashboard();

  return (
    <>
      <div className="admin-page-header">
        <div className="admin-page-header__copy">
          <p className="admin-page-kicker">Admin Overview</p>
          <h1 className="admin-page-title">Dashboard</h1>
          <p className="admin-page-lede">
            Monitor journals, article flow, review workload, and publication operations from a single research management surface.
          </p>
        </div>
      </div>

      <div className="admin-stat-grid">
        {summaryLoading ? (
          <div className="admin-state-card">
            <span className="admin-state-dot" />
            <span>Đang tải số liệu Dashboard...</span>
          </div>
        ) : summaryError ? (
          <div className="admin-state-card admin-state-card--error">
            <span className="admin-state-dot" />
            <span>{summaryError}</span>
          </div>
        ) : statCards.length === 0 ? (
          <div className="admin-state-card">
            <span className="admin-state-dot" />
            <span>Chưa có dữ liệu tổng quan Dashboard.</span>
          </div>
        ) : (
          statCards.map((stat) => (
            <DashboardStatCard
              key={stat.key}
              label={stat.label}
              value={stat.value}
              icon={stat.icon}
              note={stat.note}
              noteType={stat.noteType}
            />
          ))
        )}
      </div>

      <div className="admin-dashboard-row">
        <PublicationTrendsChart
          data={trendItems}
          years={trendYears}
          selectedYear={selectedYear}
          onChangeYear={setSelectedYear}
          loading={trendsLoading}
          error={trendsError}
        />

        <ActivityTimeline
          items={activityItems}
          loading={activityLoading}
          error={activityError}
        />
      </div>

      <VolumeIssueTable
        items={volumeStatusItems}
        loading={volumeLoading}
        error={volumeError}
        currentPage={volumePage}
        totalPages={volumeTotalPages}
        onPageChange={setVolumePage}
        totalItems={volumeTotalItems}
        limit={volumeLimit}
      />
    </>
  );
}