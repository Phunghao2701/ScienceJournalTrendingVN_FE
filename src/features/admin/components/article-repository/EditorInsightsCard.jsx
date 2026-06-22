export default function EditorInsightsCard({ insights }) {
  return (
    <div className="admin-card admin-insights-card">
      {/* Header: title + performance label badge (e.g. "Q4 Performance") */}
      <div className="admin-insights-card__header">
        <h3 className="admin-card__title">Editor&apos;s Insights</h3>
        <span className="admin-insights-card__period-badge">{insights.performanceLabel}</span>
      </div>

      {/* Short summary paragraph */}
      <p className="admin-insights-card__summary">{insights.summary}</p>

      {/* 3 mini stats row */}
      <div className="admin-insights-card__stats">
        <div className="admin-insights-stat">
          <span className="admin-insights-stat__label">Avg Review Time</span>
          <span className="admin-insights-stat__value">{insights.avgReviewTime}</span>
          <span className="admin-insights-stat__trend admin-insights-stat__trend--positive">
            {insights.avgReviewTrend}
          </span>
        </div>

        <div className="admin-insights-stat">
          <span className="admin-insights-stat__label">Acceptance Rate</span>
          <span className="admin-insights-stat__value">{insights.acceptanceRate}</span>
          <span className="admin-insights-stat__trend admin-insights-stat__trend--neutral">
            {insights.acceptanceTrend}
          </span>
        </div>

        <div className="admin-insights-stat">
          <span className="admin-insights-stat__label">Active Reviewers</span>
          <span className="admin-insights-stat__value">{insights.activeReviewers}</span>
          <span className="admin-insights-stat__trend admin-insights-stat__trend--positive">
            {insights.reviewersTrend}
          </span>
        </div>
      </div>
    </div>
  );
}