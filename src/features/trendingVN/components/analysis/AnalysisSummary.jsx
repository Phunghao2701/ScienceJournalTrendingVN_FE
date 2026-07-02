import { Badge, Form } from 'react-bootstrap';
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

export default function AnalysisSummary({ summary, window, onYearRangeChange }) {
  const current = window?.current || {};
  const comparison = window?.comparison || {};
  // Sourced from the Analysis endpoint's own window.years — deliberately not the
  // sidebar's analytics.yearDistribution, so this control stays independent of the
  // List/Table filter sidebar.
  const availableYears = window?.years || [];
  const comparisonLabel = comparison.from_year && comparison.to_year
    ? `${comparison.from_year}-${comparison.to_year}`
    : 'Comparison unavailable';

  const handleFromYearChange = (e) => {
    onYearRangeChange?.(e.target.value, current.to_year || '');
  };
  const handleToYearChange = (e) => {
    onYearRangeChange?.(current.from_year || '', e.target.value);
  };

  return (
    <section className="analysis-section">
      <div className="analysis-section-header">
        <div>
          <h2>Analysis summary</h2>
          <p>Vietnamese university scope. Counts reflect the filtered cohort returned by the backend.</p>
        </div>
        <div className="analysis-window-badges">
          <div className="analysis-year-range-picker">
            <span className="analysis-window-label">Current:</span>
            <Form.Select
              size="sm"
              value={current.from_year || ''}
              onChange={handleFromYearChange}
              disabled={availableYears.length === 0}
            >
              <option value="">From</option>
              {availableYears.map((year) => (
                <option key={year} value={year}>{year}</option>
              ))}
            </Form.Select>
            <span>–</span>
            <Form.Select
              size="sm"
              value={current.to_year || ''}
              onChange={handleToYearChange}
              disabled={availableYears.length === 0}
            >
              <option value="">To</option>
              {availableYears.map((year) => (
                <option key={year} value={year}>{year}</option>
              ))}
            </Form.Select>
          </div>
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
