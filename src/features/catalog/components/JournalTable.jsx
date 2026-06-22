/**
 * File source thuộc hệ thống FE ResearchPulse.
 *
 * File: features\catalog\components\JournalTable.jsx
 */
import { Table } from 'react-bootstrap';
import { Icon } from '@iconify/react';
import { useNavigate } from 'react-router-dom';

export default function JournalTable({ journals = [], followedJournals = {}, onFollow }) {
  const navigate = useNavigate();

  const renderAccessBadge = (journal) => (
    <span className="catalog-badge catalog-access-badge">
      {journal.is_open_access ? 'Open Access' : 'Subscription'}
    </span>
  );

  const getQuartileBadgeClass = (quartile = '') => {
    if (quartile === 'Q1') return 'catalog-badge catalog-badge--q1';
    if (quartile === 'Q2') return 'catalog-badge catalog-badge--q2';
    return 'catalog-badge';
  };

  return (
    <section className="catalog-surface catalog-table-card">
      <div className="table-responsive">
        <Table hover className="catalog-table align-middle mb-0 text-start">
          <thead>
            <tr>
              <th className="px-4 py-3">Journal</th>
              <th className="px-3 py-3">ISSN</th>
              <th className="px-3 py-3">Publisher</th>
              <th className="px-3 py-3">Country</th>
              <th className="px-3 py-3">Quartile</th>
              <th className="px-3 py-3">Metric</th>
              <th className="px-3 py-3">Year</th>
              <th className="px-3 py-3">Access</th>
              <th className="px-4 py-3 text-end">Action</th>
            </tr>
          </thead>
          <tbody>
            {journals.map((journal) => {
              const id = journal.id || journal.journal_id;
              const isFollowed = !!followedJournals[id];

              return (
                <tr key={id} onClick={() => navigate(`/journals/${id}`)}>
                  <td className="px-4 py-3">
                    <div className="catalog-journal-name">{journal.display_name}</div>
                  </td>
                  <td className="px-3 py-3 text-muted-custom catalog-mono">{journal.issn || '—'}</td>
                  <td className="px-3 py-3 text-main">{journal.publisher || '—'}</td>
                  <td className="px-3 py-3 text-main">{journal.country || '—'}</td>
                  <td className="px-3 py-3">
                    {journal.quartile ? (
                      <span className={getQuartileBadgeClass(journal.quartile)}>
                        {journal.quartile}
                      </span>
                    ) : '—'}
                  </td>
                  <td className="px-3 py-3 fw-semibold text-main catalog-mono">{journal.metric_value ?? '—'}</td>
                  <td className="px-3 py-3 text-main">{journal.metric_year || '—'}</td>
                  <td className="px-3 py-3">{renderAccessBadge(journal)}</td>
                  <td className="px-4 py-3 text-end">
                    <div className="d-inline-flex align-items-center">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          onFollow(id);
                        }}
                        className={`catalog-follow-btn ${isFollowed ? 'is-followed' : ''}`}
                      >
                        <Icon icon={isFollowed ? 'lucide:check' : 'lucide:plus'} width="13" />
                        <span>{isFollowed ? 'Đã theo dõi' : 'Theo dõi'}</span>
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      </div>
    </section>
  );
}
