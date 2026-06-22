import React from 'react';
import { Table, Badge } from 'react-bootstrap';
import { Icon } from '@iconify/react';

/**
 * Component IssueTable - Bảng hiển thị toàn bộ các Số phát sóng (Issues) nằm trong một Tập (Volume).
 * @param {Array} issues - Danh sách các Issue đã lọc theo Volume đang chọn
 */
export default function IssueTable({ issues }) {
  
  // Trạng thái hiển thị nếu Admin chưa chọn Volume hoặc Volume được chọn chưa có Issue nào
  if (!issues || issues.length === 0) {
    return (
      <div className="text-center py-5 glass-card border-dashed">
        <Icon icon="lucide:calendar-dashed" width="40" className="text-muted-custom mb-2" />
        <h6 className="text-main fw-bold">Kho lưu trữ số trống</h6>
        <p className="text-muted-custom small mb-0">Tập (Volume) này chưa thiết lập các Số phát sóng (Issues) cụ thể.</p>
      </div>
    );
  }

  return (
    <div className="table-responsive rounded-3 border shadow-sm">
      <Table hover className="align-middle mb-0 text-start bg-white">
        <thead className="border-bottom" style={{ fontSize: '0.75rem', letterSpacing: '0.05em' }}>
          <tr>
            <th className="py-3 ps-4" style={{ width: '80px', backgroundColor: '#f8fafc', color: '#64748b' }}>Số hiệu</th>
            <th className="py-3" style={{ backgroundColor: '#f8fafc', color: '#64748b' }}>Tên chủ đề / Tên Issue</th>
            <th className="py-3" style={{ backgroundColor: '#f8fafc', color: '#64748b' }}>Năm phát hành</th>
            <th className="py-3" style={{ backgroundColor: '#f8fafc', color: '#64748b' }}>Trạng thái phát hành</th>
          </tr>
        </thead>
        <tbody>
          {issues.map((issue) => (
            <tr key={issue.id} className="transition-hover">
              {/* Mã số hoặc thứ tự của Issue (Ví dụ: No. 1, No. 2) */}
              <td className="ps-4 font-monospace fw-bold text-main">
                {issue.issueNumber}
              </td>
              
              {/* Tên tiêu đề nội dung hoặc chủ đề đặc biệt của số phát hành đó */}
              <td className="py-3 fw-medium text-main">
                {issue.issueName}
              </td>
              
              {/* Năm ấn định phát hành số */}
              <td className="text-muted-custom small font-monospace">
                {issue.publicationYear}
              </td>
              
              {/* Badge màu thể hiện trạng thái (Đã xuất bản hoặc Đang lên lịch) theo Design System */}
              <td>
                <span className={`badge px-2.5 py-1.5 rounded ${
                  issue.status === 'Published'
                    ? 'bg-success-subtle text-success'
                    : 'bg-info-subtle text-info'
                }`}>
                  {issue.status === 'Published' ? 'Published' : 'Scheduled'}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
}