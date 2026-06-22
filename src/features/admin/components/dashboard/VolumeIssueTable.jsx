/**
 * - Hiển thị bảng "Volume & Issue Overview" ở cuối Admin Dashboard,
 *   gồm cột Volume, Total Issues, Publication Date, Status, Progress, Actions.
 * - Có nút "Export CSV" gọi API backend để tải file CSV thật.
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../../shared/components/Icon';
import StatusBadge from '../shared/StatusBadge';
import AdminProgressBar from '../layout/AdminProgressBar';
import Pagination from '../../../../shared/components/Pagination';
import { exportAdminVolumeIssueStatusCsv } from '../../api/adminDashboard.api';

export default function VolumeIssueTable({
  items = [],
  loading = false,
  error = '',
  currentPage = 1,
  onPageChange,
  totalItems = 0,
  limit = 5,

}) {
  const navigate = useNavigate();
  const isPreview = window.location.pathname.startsWith('/admin-preview');
  const basePath = isPreview ? '/admin-preview' : '/admin';
  const safeItems = Array.isArray(items) ? items : [];
  const [exporting, setExporting] = useState(false);

  const handleExportCsv = async () => {
    try {
      setExporting(true);
      const response = await exportAdminVolumeIssueStatusCsv();
      const blob = new Blob([response.data], { type: 'text/csv;charset=utf-8;' });
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.setAttribute('download', 'volume-issue-status.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);
    } catch (downloadError) {
      alert(downloadError.response?.status === 403
        ? 'Backend từ chối quyền admin: token hiện tại không có role ADMINISTRATOR.'
        : 'Không thể tải file CSV từ backend.');
    } finally {
      setExporting(false);
    }
  };

  const handleOpenRepository = () => {
    navigate(`${basePath}/journals/repository`);
  };

  return (
    <div className="admin-card admin-volume-card">
      {/* Header card: tiêu đề bên trái, nút Export CSV bên phải */}
      <div className="admin-volume-card__header">
        <h3 className="admin-card__title">Volume &amp; Issue Overview</h3>
        <button type="button" className="admin-export-btn" onClick={handleExportCsv} disabled={loading || exporting}>
          <Icon icon={exporting ? 'lucide:loader-2' : 'lucide:download'} />
          <span>{exporting ? 'Exporting...' : 'Export CSV'}</span>
        </button>
      </div>

      {loading ? (
        <p className="admin-muted-text mb-0">Đang tải Volume & Issue Overview...</p>
      ) : error ? (
        <p className="admin-error-text mb-0">{error}</p>
      ) : safeItems.length === 0 ? (
        <p className="admin-muted-text mb-0">Chưa có dữ liệu Volume & Issue Overview.</p>
      ) : (
        <>
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Volume</th>
                  <th>Total Issues</th>
                  <th>Publication Date</th>
                  <th>Status</th>
                  <th>Progress</th>
                  <th className="admin-table__actions-col">Actions</th>
                </tr>
              </thead>
              <tbody>
                {safeItems.map((item) => (
                  <tr
                    key={item.id}
                    className="admin-clickable-row"
                    onClick={handleOpenRepository}
                    tabIndex={0}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        handleOpenRepository();
                      }
                    }}
                  >
                    <td className="admin-table__cell-strong">{item.volume}</td>
                    <td>{item.totalIssues}</td>
                    <td>{item.publicationDate}</td>
                    <td>
                      <StatusBadge status={item.status} />
                    </td>
                    <td>
                      <AdminProgressBar percentage={item.progress} />
                    </td>
                    <td className="admin-table__actions-col">
                      <button
                        type="button"
                        className="admin-table__icon-btn"
                        aria-label="Open volume repository"
                        onClick={(event) => {
                          event.stopPropagation();
                          handleOpenRepository();
                        }}
                      >
                        <Icon icon="lucide:arrow-up-right" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Pagination
            totalItems={totalItems}
            currentPage={currentPage}
            limit={limit}
            onPageChange={onPageChange}
            entityName="volumes"
          />
        </>
      )}
    </div>
  );
}