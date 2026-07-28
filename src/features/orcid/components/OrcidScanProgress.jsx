import { useTranslation } from 'react-i18next';
import Icon from '../../../shared/components/Icon';

export default function OrcidScanProgress({ job }) {
  const { t } = useTranslation();
  const progress = Math.max(0, Math.min(100, Number(job?.progress ?? 0) || 0));

  return (
    <section
      className="orcid-scan-progress"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="orcid-scan-progress__icon" aria-hidden="true">
        <Icon icon="lucide:refresh-cw" width="22" />
      </div>
      <div className="orcid-scan-progress__content">
        <h2>{t('orcidScan.progressTitle')}</h2>
        <p>{t('orcidScan.progressDescription')}</p>
        <div
          className="orcid-scan-progress__track"
          role="progressbar"
          aria-label={t('orcidScan.progressTitle')}
          aria-valuemin="0"
          aria-valuemax="100"
          aria-valuenow={progress}
        >
          <span
            className="orcid-scan-progress__value"
            style={{ width: `${progress}%` }}
          />
        </div>
        <strong className="orcid-scan-progress__percentage">{progress}%</strong>
      </div>
    </section>
  );
}
