import React from 'react';
import { Table } from 'react-bootstrap';
import { Icon } from '@iconify/react';
import EmptyState from './EmptyState';
import ErrorState from './ErrorState';

export default function RegionStatsPanel({ 
  regions = [], 
  selectedCountry = null, 
  loading = false, 
  error = null,
  onRetry 
}) {
  if (!selectedCountry) {
    return (
      <EmptyState 
        icon="lucide:map"
        title="Chưa chọn quốc gia"
        description="Chọn một quốc gia từ bảng bên trái để xem thống kê sản lượng chi tiết theo khu vực / thành phố."
        style={{ height: '100%', minHeight: '420px' }}
      />
    );
  }

  if (error) {
    return (
      <ErrorState 
        message={error} 
        onRetry={onRetry} 
        style={{ height: '100%', minHeight: '420px' }}
      />
    );
  }

  return (
    <div 
      className="p-4 journal-dark-card d-flex flex-column h-100"
      style={{ minHeight: '420px' }}
    >
      {/* Panel Header */}
      <div className="mb-4 pb-3 border-bottom border-light">
        <div className="d-flex align-items-center gap-2 mb-1">
          <div 
            className="d-flex align-items-center justify-content-center text-white"
            style={{
              width: '24px',
              height: '24px',
              borderRadius: '6px',
              background: 'var(--btn-dark)',
              fontSize: '0.75rem',
              fontWeight: 700
            }}
          >
            {selectedCountry.code || selectedCountry.iso_code || '??'}
          </div>
          <h2 className="font-display fw-bold text-main mb-0" style={{ fontSize: '1.2rem' }}>
            Khu vực trong {selectedCountry.name}
          </h2>
        </div>
        <p className="text-muted-custom mb-0 text-xs" style={{ fontSize: '0.75rem' }}>
          Sản lượng xuất bản khoa học chi tiết theo từng vùng/thành phố nội bộ
        </p>
      </div>

      {/* Loading Skeleton */}
      {loading ? (
        <div className="d-flex flex-column gap-2.5 flex-grow-1">
          <div className="skeleton-shimmer" style={{ width: '100%', height: '36px', borderRadius: '6px' }} />
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="skeleton-shimmer" style={{ width: '100%', height: '48px', borderRadius: '6px' }} />
          ))}
        </div>
      ) : regions.length === 0 ? (
        <EmptyState 
          icon="lucide:map-pin"
          title="Không có vùng con"
          description={`Không tìm thấy dữ liệu phân vùng nội bộ nào cho ${selectedCountry.name} trong hệ thống.`}
          className="flex-grow-1 border-0 shadow-none"
          style={{ minHeight: '200px' }}
        />
      ) : (
        <div className="table-responsive flex-grow-1" style={{ overflowY: 'auto', maxHeight: '350px' }}>
          <Table hover className="align-middle mb-0 text-start" style={{ fontSize: '0.82rem' }}>
            <thead style={{ backgroundColor: 'var(--bg-chip)', borderBottom: '1px solid var(--border)', position: 'sticky', top: 0, zIndex: 1 }}>
              <tr>
                <th className="py-2 px-3 text-muted-custom font-semibold text-xs text-uppercase" style={{ width: '50px' }}>#</th>
                <th className="py-2 text-muted-custom font-semibold text-xs text-uppercase">Tên Region/City</th>
                <th className="py-2 text-muted-custom font-semibold text-xs text-uppercase" style={{ width: '80px' }}>Mã</th>
                <th className="py-2 pe-3 text-end text-muted-custom font-semibold text-xs text-uppercase" style={{ width: '100px' }}>Bài báo</th>
              </tr>
            </thead>
            <tbody>
              {regions.map((region, index) => (
                <tr key={region.zone_id || region.code} className="transition-all duration-150">
                  <td className="ps-3 text-muted-custom font-monospace" style={{ fontSize: '0.75rem' }}>
                    {index + 1}
                  </td>
                  <td className="py-2.5 fw-medium text-main font-sans">
                    {region.name || '—'}
                  </td>
                  <td className="text-muted-custom font-monospace">
                    {region.code || '—'}
                  </td>
                  <td className="pe-3 text-end text-main fw-bold font-monospace">
                    {Number(region.article_count || 0).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      )}
    </div>
  );
}
