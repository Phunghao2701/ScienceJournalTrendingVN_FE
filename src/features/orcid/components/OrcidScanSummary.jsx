import { useTranslation } from 'react-i18next';
import Icon from '../../../shared/components/Icon';

const SUMMARY_ITEMS = [
  ['discovered', 'lucide:search'],
  ['created', 'lucide:plus-circle'],
  ['filled_missing', 'lucide:file-pen-line'],
  ['already_existed', 'lucide:database'],
  ['failed_to_persist', 'lucide:triangle-alert'],
  ['skipped_deleted', 'lucide:archive-x'],
];

export default function OrcidScanSummary({ summary, isPartial = false }) {
  const { t } = useTranslation();
  const hasPersistenceWarning = (
    Number(summary?.failed_to_persist) > 0
    || Number(summary?.skipped_deleted) > 0
  );

  return (
    <section className="orcid-scan-section" aria-labelledby="orcid-summary-title">
      <div className="orcid-scan-section__heading">
        <div>
          <h2 id="orcid-summary-title">{t('orcidScan.summaryTitle')}</h2>
          <p>{t('orcidScan.summaryDescription')}</p>
        </div>
        <span
          className={`orcid-scan-result-state ${
            isPartial || hasPersistenceWarning
              ? 'orcid-scan-result-state--warning'
              : 'orcid-scan-result-state--success'
          }`}
        >
          <Icon
            icon={isPartial || hasPersistenceWarning ? 'lucide:circle-alert' : 'lucide:circle-check'}
            width="15"
          />
          {isPartial || hasPersistenceWarning
            ? t('orcidScan.partial')
            : t('orcidScan.success')}
        </span>
      </div>

      <dl className="orcid-scan-summary">
        {SUMMARY_ITEMS.map(([key, icon]) => (
          <div
            key={key}
            className={`orcid-scan-summary__item ${
              key === 'failed_to_persist' && Number(summary?.[key]) > 0
                ? 'orcid-scan-summary__item--warning'
                : ''
            }`}
          >
            <dt>
              <Icon icon={icon} width="15" aria-hidden="true" />
              {t(`orcidScan.summary.${key}`)}
            </dt>
            <dd>{Number(summary?.[key] ?? 0).toLocaleString()}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

