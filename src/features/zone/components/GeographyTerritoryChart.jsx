import React, { useMemo } from 'react';

// Cấu hình component biểu đồ phân bố địa lý theo quốc gia
// selectedYear: Năm đang chọn để lọc từ dropdown (mặc định là 'All' - hiển thị tất cả các năm)
export default function GeographyTerritoryChart({ data = [], loading = false, selectedCountry = null, onSelectCountry, selectedYear = 'All' }) {
  // Get top 5 countries
  const top5 = useMemo(() => {
    const sorted = [...data].sort((a, b) => (Number(b.article_count) || 0) - (Number(a.article_count) || 0));
    return sorted.slice(0, 5);
  }, [data]);

  // Find max value for height scaling
  const maxVal = useMemo(() => {
    const max = Math.max(...top5.map(item => Number(item.article_count) || 0), 0);
    return max > 0 ? max : 1;
  }, [top5]);

  const gridTicks = useMemo(() => {
    if (maxVal === 1) return [1, 0];
    return [
      maxVal,
      Math.round(maxVal * 0.75),
      Math.round(maxVal * 0.5),
      Math.round(maxVal * 0.25),
      0
    ];
  }, [maxVal]);

  return (
    <div className="p-4 journal-dark-card h-100 d-flex flex-column">
      {/* Header */}
      <div className="d-flex align-items-center justify-content-between mb-4">
        <div>
          <h3 className="font-display fw-bold text-main mb-0" style={{ fontSize: '1.1rem' }}>
            Top 5 Quốc gia có sản lượng Article cao nhất
          </h3>
          <p className="text-muted-custom mb-0 mt-1" style={{ fontSize: '0.8rem' }}>
            Phân bố số lượng bài báo khoa học xuất bản theo lãnh thổ
          </p>
        </div>
        <span 
          className="px-2 py-1 rounded text-muted-custom"
          style={{ fontSize: '0.75rem', backgroundColor: 'var(--bg-chip)', fontWeight: 500, alignSelf: 'flex-start' }}
        >
          {selectedYear === 'All' ? 'Tất cả các năm' : `Thống kê ${selectedYear}`}
        </span>
      </div>

      {loading ? (
        <div className="d-flex flex-column gap-3 justify-content-center flex-grow-1" style={{ minHeight: '280px' }}>
          <div className="d-flex justify-content-between align-items-end flex-grow-1 px-4" style={{ height: '220px' }}>
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="skeleton-shimmer" style={{ width: '40px', height: `${20 * i}%`, borderRadius: '6px 6px 0 0' }} />
            ))}
          </div>
          <div className="d-flex justify-content-between px-4 mt-2">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="skeleton-shimmer" style={{ width: '50px', height: '14px', borderRadius: '3px' }} />
            ))}
          </div>
        </div>
      ) : top5.length === 0 ? (
        <div className="d-flex align-items-center justify-content-center flex-grow-1 text-muted-custom py-5" style={{ minHeight: '280px', fontSize: '0.9rem' }}>
          Không có dữ liệu
        </div>
      ) : (
        <div className="d-flex flex-column flex-grow-1 justify-content-between" style={{ minHeight: '280px' }}>
          {/* Main Chart Row */}
          <div className="position-relative d-flex flex-grow-1 mt-3 mb-2" style={{ height: '240px' }}>
            
            {/* Gridlines Background */}
            <div className="position-absolute w-100 h-100 d-flex flex-column justify-content-between" style={{ pointerEvents: 'none', zIndex: 0 }}>
              {gridTicks.map((tick, index) => (
                <div 
                  key={index} 
                  className="w-100 d-flex align-items-center" 
                  style={{ 
                    borderBottom: index === gridTicks.length - 1 ? '1.5px solid var(--border)' : '1px dashed rgba(0, 0, 0, 0.06)',
                    height: '0px',
                    position: 'relative'
                  }}
                >
                  <span 
                    className="position-absolute text-muted-custom" 
                    style={{ 
                      left: '0px', 
                      transform: 'translateY(-50%)', 
                      fontSize: '0.75rem',
                      fontWeight: 500,
                      backgroundColor: 'var(--bg-card)',
                      paddingRight: '6px',
                      zIndex: 1
                    }}
                  >
                    {tick.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>

            {/* Bars container */}
            <div 
              className="d-flex justify-content-around align-items-end flex-grow-1 w-100" 
              style={{ paddingLeft: '50px', paddingRight: '10px', zIndex: 2, height: '100%' }}
            >
              {top5.map((item, index) => {
                const val = Number(item.article_count) || 0;
                const heightPercent = maxVal > 0 ? (val / maxVal) * 100 : 0;

                return (
                  <div 
                    key={item.zone_id || index}
                    className="d-flex flex-column align-items-center position-relative h-100 justify-content-end bar-container"
                    style={{ width: '15%', minWidth: '45px' }}
                  >
                    {/* Tooltip on hover */}
                    <div 
                      className="geography-chart-tooltip position-absolute text-center"
                      style={{ bottom: `calc(${heightPercent}% + 12px)` }}
                    >
                      {val.toLocaleString()} articles
                    </div>

                    {/* Value label directly above the bar */}
                    <span 
                      className="text-main fw-bold mb-1 geography-chart-value-label"
                      style={{ fontSize: '0.75rem', opacity: 0.95 }}
                    >
                      {val > 0 ? val.toLocaleString() : '0'}
                    </span>

                    {/* The Bar */}
                    <div 
                      onClick={() => onSelectCountry?.(item)}
                      style={{ 
                        width: '100%', 
                        height: `${Math.max(heightPercent, 2)}%`,
                        zIndex: selectedCountry?.zone_id === item.zone_id ? 3 : 1
                      }}
                      className={`geography-chart-bar color-${index % 5} ${selectedCountry?.zone_id === item.zone_id ? 'is-active' : ''}`}
                    />
                  </div>
                );
              })}
            </div>

          </div>

          {/* X-axis Labels Row */}
          <div className="d-flex justify-content-around w-100 border-top pt-2" style={{ paddingLeft: '50px', paddingRight: '10px' }}>
            {top5.map((item, index) => (
              <div 
                key={item.zone_id || index}
                className="text-center d-flex flex-column align-items-center"
                style={{ width: '15%', minWidth: '45px' }}
              >
                {/* Short country code (e.g., GB, US) */}
                <span 
                  className="text-main fw-bold font-sans" 
                  style={{ fontSize: '0.8rem', display: 'block', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', width: '100%' }}
                  title={item.name}
                >
                  {item.code || item.iso_code || item.name?.substring(0, 2).toUpperCase()}
                </span>
                
                {/* Full country name */}
                <span 
                  className="text-muted-custom font-sans" 
                  style={{ fontSize: '0.65rem', display: 'block', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', width: '100%', maxWidth: '70px' }}
                  title={item.name}
                >
                  {item.name || '—'}
                </span>
              </div>
            ))}
          </div>

        </div>
      )}
    </div>
  );
}
