/**
 * File source thuộc hệ thống FE ResearchPulse.
 *
 * File: features\journal\components\JournalTable.jsx
 */
import { Table, Badge, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { Icon } from '@iconify/react';

export default function JournalTable({ journals, page, limit }) {
  const navigate = useNavigate();

  const getQuartileClassName = (quartile) => {
    const normalized = (quartile || '').toLowerCase();
    if (normalized === 'q1') return 'journal-quartile-badge journal-quartile-badge--q1';
    if (normalized === 'q2') return 'journal-quartile-badge journal-quartile-badge--q2';
    if (normalized === 'q3') return 'journal-quartile-badge journal-quartile-badge--q3';
    if (normalized === 'q4') return 'journal-quartile-badge journal-quartile-badge--q4';
    return 'journal-quartile-badge';
  };

  if (journals.length === 0) {
    return (
      <div className="journal-empty-state">
        <Icon icon="lucide:search-x" width="48" className="text-muted-custom mb-3" />
        <h5 className="journal-empty-title">Không tìm thấy tạp chí nào</h5>
        <p className="text-muted-custom text-xs mb-0">Hãy thử thay đổi từ khóa tìm kiếm hoặc bộ lọc của bạn.</p>
      </div>
    );
  }

  return (
    <div className="journal-table-shell table-responsive shadow-sm">
      <Table hover className="journal-table align-middle mb-0 text-start">
        <thead>
          <tr>
            <th className="journal-table-index-col py-3.5 ps-4">#</th>
            <th className="py-3.5">Tên Journal</th>
            <th className="py-3.5">Publisher</th>
            <th className="py-3.5">Quartile</th>
            <th className="py-3.5">Metric / IF</th>
            <th className="py-3.5">Quốc gia</th>
            <th className="py-3.5">Open Access</th>
            <th className="journal-table-action-col py-3.5 pe-4 text-end">Chi tiết</th>
          </tr>
        </thead>
        <tbody>
          {journals.map((journal, index) => {
            const displayIndex = (page - 1) * limit + index + 1;
            const id = journal.journal_id;

            return (
              <tr key={id} className="journal-table-row" onClick={() => navigate(`/journals/${id}`)}>
                <td className="journal-index ps-4">
                  {displayIndex}
                </td>
                <td className="py-3">
                  <div className="journal-name">
                    {journal.display_name}
                  </div>
                  {journal.issn && (
                    <div className="journal-issn font-monospace">
                      ISSN: {journal.issn}
                    </div>
                  )}
                </td>
                <td className="journal-cell-muted">
                  {journal.publisher || '—'}
                </td>
                <td>
                  <Badge className={getQuartileClassName(journal.quartile)}>
                    {journal.quartile}
                  </Badge>
                </td>
                <td>
                  <div className="d-flex align-items-center gap-1">
                    <span className="journal-metric-value font-monospace">
                      {journal.metric_value}
                    </span>
                    <span className="journal-metric-label">
                      SJR
                    </span>
                  </div>
                </td>
                <td className="journal-cell-muted">
                  {journal.country || '—'}
                </td>
                <td>
                  {journal.is_open_access ? (
                    <Badge className="journal-oa-badge">
                      <Icon icon="lucide:unlock" width="10" />
                      <span>OA</span>
                    </Badge>
                  ) : (
                    <span className="journal-cell-muted font-monospace">—</span>
                  )}
                </td>
                <td className="pe-4 text-end" onClick={(e) => e.stopPropagation()}>
                  <Button
                    variant="link"
                    className="journal-detail-link p-0 d-inline-flex align-items-center gap-1"
                    onClick={() => navigate(`/journals/${id}`)}
                  >
                    <span>Chi tiết</span>
                    <Icon icon="lucide:arrow-right" width="14" />
                  </Button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </Table>
    </div>
  );
}
