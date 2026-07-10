import { Badge, Form } from 'react-bootstrap';
import { Icon } from '@iconify/react';
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation();
  const current = window?.current || {};
  const comparison = window?.comparison || {};
  // Sourced from the Analysis endpoint's own window.years — deliberately not the
  // sidebar's analytics.yearDistribution, so this control stays independent of the
  // List/Table filter sidebar.
  const availableYears = window?.years || [];
  const comparisonLabel = comparison.from_year && comparison.to_year
    ? `${comparison.from_year}-${comparison.to_year}`
    : t('comparisonUnavailable');

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
          <h2>{t('analysisSummary')}</h2>
          <p>{t('analysisScopeDescription')}</p>
        </div>
        <div className="analysis-window-badges">
          <div className="analysis-year-range-picker">
            <span className="analysis-window-label">{t('current')}:</span>
            <Form.Select
              size="sm"
              value={current.from_year || ''}
              onChange={handleFromYearChange}
              disabled={availableYears.length === 0}
            >
              <option value="">{t('from')}</option>
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
              <option value="">{t('to')}</option>
              {availableYears.map((year) => (
                <option key={year} value={year}>{year}</option>
              ))}
            </Form.Select>
          </div>
          <Badge bg="light" text="dark">{t('comparison')}: {comparisonLabel}</Badge>
        </div>
      </div>

      <div className="analysis-summary-grid">
        <SummaryCard icon="lucide:file-text" label={t('scholarlyWorks')} value={summary.scholarly_works} />
        <SummaryCard icon="lucide:quote" label={t('importedCitations')} value={summary.total_citations} />
        <SummaryCard icon="lucide:book-open" label={t('importedReferences')} value={summary.total_references} />
        <SummaryCard icon="lucide:users" label={t('statAuthors')} value={summary.authors} />
        <SummaryCard icon="lucide:building-2" label={t('statInstitutions')} value={summary.institutions} />
        <SummaryCard icon="lucide:library" label={t('statJournals')} value={summary.journals} />
        <SummaryCard icon="lucide:unlock" label={t('oaOpen')} value={summary.open_access_works} />
        <SummaryCard icon="lucide:lock" label={t('oaClosed')} value={summary.closed_access_works} />
        <SummaryCard icon="lucide:help-circle" label={t('oaUnavailable')} value={summary.oa_unavailable_works} />
        <SummaryCard
          icon="lucide:database"
          label={t('availableCitingWorks')}
          value={summary.available_citing_works}
          hint={t('localRelationRowsHint')}
        />
        <SummaryCard
          icon="lucide:database-zap"
          label={t('availableReferences')}
          value={summary.available_references}
          hint={t('localRelationRowsHint')}
        />
      </div>
    </section>
  );
}
