import React from 'react';
import { Table, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { Icon } from '@iconify/react';

/**
 * Component JournalTableAdmin - Bảng hiển thị danh sách tạp chí phục vụ mục đích quản trị (Admin View).
 * Đáp ứng Issue #76: Hiển thị Title, ISSN, Publisher, Publisher, Last Updated, Status và các nút Action.
 * * @param {Array} journals - Danh sách tạp chí sau khi đã qua bộ lọc search/status
 * @param {number} page - Trang hiện tại (phục vụ tính toán số thứ tự tăng tiến)
 * @param {number} limit - Số lượng dòng trên một trang
 */
export default function JournalTableAdmin({ journals, page = 1, limit = 10 }) {
  const navigate = useNavigate();

  // Trạng thái trống nếu không tìm thấy dữ liệu phù hợp với bộ lọc
  if (!journals || journals.length === 0) {
    return (
      <div className="journal-empty-state text-center py-5 glass-card">
        <Icon icon="lucide:search-x" width="48" className="text-muted-custom mb-3" />
        <h5 className="journal-empty-title fw-bold font-display text-main">Không tìm thấy tạp chí nào</h5>
        <p className="text-muted-custom small mb-0">Hãy thử thay đổi từ khóa tìm kiếm hoặc bộ lọc trạng thái của bạn.</p>
      </div>
    );
  }

  return (
    <div className="journal-table-shell table-responsive shadow-sm rounded-3 overflow-hidden">
      <Table hover className="journal-table align-middle mb-0 text-start bg-white">
        <thead className="border-bottom" style={{ fontSize: '0.75rem', letterSpacing: '0.05em' }}>
          <tr>
            <th className="py-3.5 ps-4" style={{ width: '60px', backgroundColor: '#f8fafc', color: '#64748b' }}>#</th>
            <th className="py-3.5" style={{ backgroundColor: '#f8fafc', color: '#64748b' }}>Journal Title / Publisher</th>
            <th className="py-3.5" style={{ backgroundColor: '#f8fafc', color: '#64748b' }}>ISSN</th>
            <th className="py-3.5" style={{ backgroundColor: '#f8fafc', color: '#64748b' }}>Lĩnh vực / Chuyên ngành</th>
            <th className="py-3.5" style={{ backgroundColor: '#f8fafc', color: '#64748b' }}>Publisher</th>
            <th className="py-3.5" style={{ backgroundColor: '#f8fafc', color: '#64748b' }}>Last Updated</th>
            <th className="py-3.5" style={{ backgroundColor: '#f8fafc', color: '#64748b' }}>Status</th>
            <th className="py-3.5 pe-4 text-end" style={{ width: '140px', backgroundColor: '#f8fafc', color: '#64748b' }}>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {journals.map((journal, index) => {
            // Tính toán số thứ tự hiển thị liên tục theo phân trang hệ thống
            const displayIndex = (page - 1) * limit + index + 1;
            const id = journal.id || journal.journal_id;

            return (
              <tr key={id} className="journal-table-row transition-hover">
                {/* Số thứ tự dòng */}
                <td className="ps-4 fw-medium text-muted-custom">
                  {displayIndex}
                </td>

                {/* Tên tạp chí và nhà xuất bản */}
                <td className="py-3">
                  <div className="fw-bold text-main line-clamp-1">
                    {journal.title || journal.display_name}
                  </div>
                  <div className="text-muted-custom small d-flex align-items-center gap-1 mt-0.5">
                    <Icon icon="lucide:building" width="12" />
                    <span>{journal.publisher || 'Chưa cập nhật nhà xuất bản'}</span>
                  </div>
                </td>

                {/* Mã số định danh ISSN quốc tế */}
                <td className="font-monospace small">
                  <div>P: {journal.issn || '—'}</div>
                  <div className="text-muted-custom">E: {journal.onlineIssn || '—'}</div>
                </td>

                {/* Lĩnh vực và chuyên mục phân loại nghiên cứu */}
                <td>
                  <span className="badge bg-light text-dark border font-sans px-2 py-1">
                    {journal.subjectCategory || 'Phân loại chung'}
                  </span>
                  <div className="small text-muted-custom mt-1 text-truncate" style={{ maxWidth: '180px' }}>
                    {journal.subjectArea || 'Chuyên ngành hẹp'}
                  </div>
                </td>

                {/* Tên giáo sư / tổng biên tập chịu trách nhiệm nội dung */}
                <td className="text-main fw-medium">
                  {journal.publisher || 'Chưa chỉ định'}
                </td>

                {/* Ngày cập nhật dữ liệu cấu trúc gần nhất */}
                <td className="text-muted-custom small font-monospace">
                  {journal.lastUpdated || '—'}
                </td>

                {/* Badge trạng thái hoạt động ứng với các token màu của Design System */}
                <td>
                  <span className={`badge px-2 py-1.5 rounded ${
                    journal.status === 'Active' 
                      ? 'bg-success-subtle text-success' 
                      : 'bg-warning-subtle text-warning'
                  }`}>
                    {journal.status || 'Draft'}
                  </span>
                </td>

                {/* Các nút bấm thao tác phân quyền quản trị điều hướng dữ liệu */}
                <td className="pe-4 text-end">
                  <div className="d-flex justify-content-end gap-1.5">
                    {/* Nút vào quản lý kho cấu trúc Volume và Issue (Màn hình 4) */}
                    <Button 
                      variant="light" 
                      size="sm"
                      className="btn-custom-sm d-inline-flex align-items-center justify-content-center p-2 rounded-2"
                      onClick={() => navigate('/admin/journals/repository')}
                      title="Quản lý Repo Volume & Issue"
                    >
                      <Icon icon="lucide:layers" width="16" className="text-dark" />
                    </Button>
                    
                    {/* Nút vào form chỉnh sửa chi tiết cấu hình Journal (Màn hình 12) */}
                    <Button 
                      variant="outline-dark" 
                      size="sm"
                      className="btn-custom-sm d-inline-flex align-items-center justify-content-center p-2 rounded-2"
                      onClick={() => navigate(`/admin/journals/${id}/edit`)}
                      title="Chỉnh sửa thông tin Tạp chí"
                    >
                      <Icon icon="lucide:edit-3" width="16" />
                    </Button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </Table>
    </div>
  );
}