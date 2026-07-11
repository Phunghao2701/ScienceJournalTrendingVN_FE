import { useMemo, useState } from 'react';
import { Button, ButtonGroup, Table } from 'react-bootstrap';
import { formatGrowthRate, formatTrendingScore } from '../../utils/paperVnAnalysis';
import { useTranslation } from 'react-i18next';

const ENTITY_TYPES = [
  { key: 'institutions', labelKey: 'statInstitutions', filter: 'institution_id' },
  { key: 'authors', labelKey: 'statAuthors', filter: 'author_id' },
  { key: 'journals', labelKey: 'statJournals', filter: 'journal_id' },
  { key: 'topics', labelKey: 'statTopics', filter: 'topic_id' },
  { key: 'keywords', labelKey: 'colKeywords', filter: 'keyword_id' },
];

const fmt = (value) => new Intl.NumberFormat().format(Number(value || 0));

export default function AnalysisEntityPanel({ top, growth, onEntityClick }) {
  const { t } = useTranslation();
  const [entityType, setEntityType] = useState('institutions');
  const [mode, setMode] = useState('top');
  const activeMeta = ENTITY_TYPES.find((item) => item.key === entityType) || ENTITY_TYPES[0];
  const rows = useMemo(() => {
    const source = mode === 'top' ? top : growth;
    return source?.[entityType] || [];
  }, [entityType, growth, mode, top]);

  const handleEntityClick = (row) => {
    if (!row.entity_id) return;
    onEntityClick?.(activeMeta.filter, row.entity_id);
  };

  return (
    <section className="analysis-section">
      <div className="analysis-section-header">
        <div>
          <h2>{t('entityRankings')}</h2>
          <p>{t('entityRankingsDescription')}</p>
        </div>
        <ButtonGroup size="sm" className="analysis-mode-toggle">
          <Button variant={mode === 'top' ? 'primary' : 'outline-secondary'} onClick={() => setMode('top')}>{t('top')}</Button>
          <Button variant={mode === 'growth' ? 'primary' : 'outline-secondary'} onClick={() => setMode('growth')}>{t('growth')}</Button>
        </ButtonGroup>
      </div>

      <div className="analysis-entity-tabs">
        {ENTITY_TYPES.map((item) => (
          <button
            type="button"
            key={item.key}
            className={item.key === entityType ? 'active' : ''}
            onClick={() => setEntityType(item.key)}
          >
            {t(item.labelKey)}
          </button>
        ))}
      </div>

      {rows.length === 0 ? (
        <div className="analysis-empty">{t('noArticlesFound')}</div>
      ) : (
        <Table responsive hover className="analysis-table mb-0">
          <thead>
            <tr>
              <th>{t('rank')}</th>
              <th>{t('name')}</th>
              <th className="text-end">{t('current')}</th>
              <th className="text-end">{t('previous')}</th>
              <th className="text-end">{t('growth')}</th>
              <th className="text-end">{t('rate')}</th>
              {mode === 'growth' && <th className="text-end">{t('trendingScore')}</th>}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => {
              const canClick = Boolean(row.entity_id);
              return (
                <tr key={`${row.entity_id || row.display_name}-${index}`}>
                  <td>{row.rank || index + 1}</td>
                  <td>
                    {canClick ? (
                      <button type="button" className="analysis-link-button" onClick={() => handleEntityClick(row)}>
                        {row.display_name}
                      </button>
                    ) : (
                      <span>{row.display_name}</span>
                    )}
                  </td>
                  <td className="text-end">{fmt(row.current_count)}</td>
                  <td className="text-end">{fmt(row.previous_count)}</td>
                  <td className="text-end">{fmt(row.absolute_growth)}</td>
                  <td className="text-end">{formatGrowthRate(row.growth_rate)}</td>
                  {mode === 'growth' && <td className="text-end">{formatTrendingScore(row.trending_score)}</td>}
                </tr>
              );
            })}
          </tbody>
        </Table>
      )}
    </section>
  );
}
