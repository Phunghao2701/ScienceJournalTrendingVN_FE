import React from 'react';
import { ListGroup, Badge } from 'react-bootstrap';
import { Icon } from '@iconify/react';

/**
 * Component VolumeList - Hiển thị danh sách các Tập (Volume) thuộc Tạp chí đang chọn.
 * @param {Array} volumes - Danh sách các Volume đã được lọc theo Journal hiện tại
 * @param {string} selectedVolumeId - ID của Volume đang được chọn để xem Issue
 * @param {function} onSelectVolume - Hàm callback kích hoạt khi Admin bấm chọn một Volume
 */
export default function VolumeList({ volumes, selectedVolumeId, onSelectVolume }) {
  
  // Trạng thái trống nếu Tạp chí này chưa được khởi tạo Volume nào
  if (!volumes || volumes.length === 0) {
    return (
      <div className="text-center py-4 bg-light rounded-3 border" style={{ backgroundColor: 'var(--bg-chip)' }}>
        <Icon icon="lucide:layers-3" width="32" className="text-muted-custom mb-2" />
        <p className="text-muted-custom small mb-0">Chưa có Volume nào được tạo.</p>
      </div>
    );
  }

  return (
    <ListGroup className="shadow-sm rounded-3 overflow-hidden">
      {volumes.map((vol) => {
        const isSelected = vol.id === selectedVolumeId;
        return (
          <ListGroup.Item
            key={vol.id}
            action
            active={isSelected}
            onClick={() => onSelectVolume(vol.id)}
            className="d-flex justify-content-between align-items-center py-3 border-start-0 border-end-0"
            style={{
              backgroundColor: isSelected ? 'var(--text-main)' : '#ffffff',
              borderColor: 'var(--border)',
              color: isSelected ? '#ffffff' : 'var(--text-main)',
              transition: 'all 0.2s ease'
            }}
          >
            <div>
              <div className={`fw-bold ${isSelected ? 'text-white' : 'text-main'}`}>
                {vol.volumeNumber}
              </div>
              <small className={isSelected ? 'text-white-50 font-monospace' : 'text-muted-custom font-monospace'}>
                Năm xuất bản: {vol.publicationYear}
              </small>
            </div>
            
            {/* Hiển thị số lượng bài báo (Articles) hoặc Số phát sóng (Issues) đi kèm của tập đó */}
            <Badge 
              bg={isSelected ? 'light' : 'dark'} 
              text={isSelected ? 'dark' : 'light'}
              className="rounded-pill px-2.5 py-1.5"
            >
              {vol.totalIssues || 0} Issues
            </Badge>
          </ListGroup.Item>
        );
      })}
    </ListGroup>
  );
}