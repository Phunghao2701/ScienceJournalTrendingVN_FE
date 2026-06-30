import { Badge } from 'react-bootstrap';
import { Icon } from '@iconify/react';

const fmt = (value) => new Intl.NumberFormat().format(Number(value || 0));

const SummaryCard = ({ icon, label, value, hint }) => (
  <div className="analysis-summary-card">
    <div className="analysis-summary-icon">
      <Icon icon={icon} width="16" />
    </div>
    <div>
      <div className="analysis-summary-label">{label}</div>
      <div className="analysis-summary-value">{fmt(value)}</div>
      {hint && <div className="analysis-summary-hint">{hint}</div>}
    </div>
  </div>
);

export default function AnalysisSummary({ summary, window }) {
  const current = window?.current || {};
  const comparison = window?.comparison || {};
  const windowLabel = current.from_year && current.to_year
    ? `${current.from_year}-${current.to_year}`
    : 'Current window';
  const comparisonLabel = comparison.from_year && comparison.to_year
    ? `${comparison.from_year}-${comparison.to_year}`
    : 'Comparison unavailable';

  return (
    <section className="analysis-section">
      <div className="analysis-section-header">
        <div>
          <h2>Analysis summary</h2>
          <p>Vietnamese university scope. Counts reflect the filtered cohort returned by the backend.</p>
        </div>
        <div className="analysis-window-badges">
          <Badge bg="light" text="dark">Current: {windowLabel}</Badge>
          <Badge bg="light" text="dark">Comparison: {comparisonLabel}</Badge>
        </div>
      </div>

      <div className="analysis-summary-grid">
        <SummaryCard icon="lucide:file-text" label="Scholarly works" value={summary.scholarly_works} />
        <SummaryCard icon="lucide:quote" label="Imported citations" value={summary.total_citations} />
        <SummaryCard icon="lucide:book-open" label="Imported references" value={summary.total_references} />
        <SummaryCard icon="lucide:users" label="Authors" value={summary.authors} />
        <SummaryCard icon="lucide:building-2" label="Institutions" value={summary.institutions} />
        <SummaryCard icon="lucide:library" label="Journals" value={summary.journals} />
        <SummaryCard icon="lucide:unlock" label="OA open" value={summary.open_access_works} />
        <SummaryCard icon="lucide:lock" label="OA closed" value={summary.closed_access_works} />
        <SummaryCard icon="lucide:help-circle" label="OA unavailable" value={summary.oa_unavailable_works} />
        <SummaryCard
          icon="lucide:database"
          label="Available citing works"
          value={summary.available_citing_works}
          hint="Local relation rows, not imported total"
        />
        <SummaryCard
          icon="lucide:database-zap"
          label="Available references"
          value={summary.available_references}
          hint="Local relation rows, not imported total"
        />
      </div>
    </section>
  );
}
