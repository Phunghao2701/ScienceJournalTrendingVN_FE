import { useTranslation } from 'react-i18next';
import Icon from '../../../shared/components/Icon';

const STATUS_ICON = {
  success: 'lucide:circle-check',
  partial: 'lucide:circle-alert',
  failed: 'lucide:circle-x',
  error: 'lucide:circle-x',
};

export default function OrcidSourceStatus({ sources = [] }) {
  const { t } = useTranslation();

  if (sources.length === 0) return null;

  return (
    <section className="orcid-scan-section" aria-labelledby="orcid-source-title">
      <div className="orcid-scan-section__heading">
        <div>
          <h2 id="orcid-source-title">{t('orcidScan.sourceTitle')}</h2>
          <p>{t('orcidScan.sourceDescription')}</p>
        </div>
      </div>

      <ul className="orcid-source-list">
        {sources.map((source) => {
          const status = source.status || 'unknown';
          return (
            <li key={source.key} className={`orcid-source orcid-source--${status}`}>
              <Icon
                icon={STATUS_ICON[status] ?? 'lucide:circle-help'}
                width="18"
                aria-hidden="true"
              />
              <div>
                <strong>{source.label}</strong>
                <span>
                  {t(`orcidScan.sourceStatus.${status}`, {
                    defaultValue: t('orcidScan.sourceStatus.unknown'),
                  })}
                  {Number.isFinite(source.count) ? ` · ${source.count}` : ''}
                </span>
                {source.message && <small>{source.message}</small>}
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

