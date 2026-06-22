import { ListGroup, Badge, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { Icon } from '@iconify/react';

/**
 * Component VolumeList - Hiển thị danh sách các Tập (Volume) thuộc Tạp chí đang chọn.
 *
 * @param {Array} volumes - Danh sách các Volume đã được lọc theo Journal hiện tại
 * @param {string} selectedVolumeId - ID của Volume đang được chọn để xem Issue
 * @param {function} onSelectVolume - Hàm callback kích hoạt khi Admin bấm chọn một Volume
 */
export default function VolumeList({ volumes, selectedVolumeId, onSelectVolume, volumeStatsById = {} }) {
  const navigate = useNavigate();

  // Dynamic route base path detection
  const isPreview = window.location.pathname.startsWith('/admin-preview');
  const basePath = isPreview ? '/admin-preview' : '/admin';

  // Trạng thái trống nếu Tạp chí này chưa được khởi tạo Volume nào
  if (!volumes || volumes.length === 0) {
    return (
      <div className="text-center py-5 bg-white rounded-3 border" style={{ borderColor: 'var(--border)' }}>
        <Icon icon="lucide:layers-3" width="32" className="text-muted-custom mb-2" />
        <p className="text-muted-custom small mb-0">Chưa có Volume nào được tạo.</p>
      </div>
    );
  }

  // Sort volumes descending by year or number to match Figma (newest at top)
  const sortedVolumes = [...volumes].sort((a, b) => b.publicationYear - a.publicationYear);

  return (
    <div className="d-flex flex-column gap-3 text-start">
      <ListGroup className="shadow-sm rounded-3 overflow-hidden border" style={{ borderColor: 'var(--border)' }}>
        {sortedVolumes.map((vol, index) => {
          const isSelected = vol.id === selectedVolumeId;
          const isNewest = index === 0; // The newest volume is "Current", others are "Archived"
          const volumeStats = volumeStatsById[vol.id] || {};
          const issueCount = volumeStats.issueCount ?? 0;
          const articleCount = volumeStats.articleCount;
          
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
                transition: 'all 0.2s ease',
                cursor: 'pointer'
              }}
            >
              <div>
                <div className="d-flex align-items-center gap-2">
                  <span className={`fw-bold ${isSelected ? 'text-white' : 'text-main'}`}>
                    {vol.volumeNumber} ({vol.publicationYear})
                  </span>
                  
                  {/* Status Badge inside volume card (Current vs Archived) */}
                  <span 
                    className={`badge text-xs px-2 py-0.5 rounded ${
                      isSelected
                        ? 'bg-light text-dark'
                        : isNewest 
                          ? 'bg-warning-subtle text-warning'
                          : 'bg-light text-muted border'
                    }`}
                  >
                    {isNewest ? 'CURRENT' : 'ARCHIVED'}
                  </span>
                </div>
                <small className={isSelected ? 'text-white-50 font-monospace' : 'text-muted-custom font-monospace'}>
                  {issueCount} Issues • {typeof articleCount === 'number'
                    ? `${articleCount} Articles`
                    : 'Chưa có API Article theo issue_id. Đã xóa dữ liệu mock khỏi khu vực này.'}
                </small>
              </div>
              
              <Badge 
                bg={isSelected ? 'light' : 'dark'} 
                text={isSelected ? 'dark' : 'light'}
                className="rounded px-2 py-1"
                style={{ fontSize: '0.75rem' }}
              >
                Select
              </Badge>
            </ListGroup.Item>
          );
        })}
      </ListGroup>

      {/* View All Archive trigger from Figma Screen Page 4 */}
      <Button
        variant="outline-dark"
        className="w-100 py-2 d-flex align-items-center justify-content-center gap-1.5"
        style={{ borderStyle: 'dashed', borderColor: 'var(--border)' }}
        onClick={() => navigate(`${basePath}/volumes`)}
      >
        <Icon icon="lucide:archive" width="16" />
        <span>View All Archive</span>
      </Button>
    </div>
  );
}
