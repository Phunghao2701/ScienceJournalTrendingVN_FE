import React, { useState, useMemo } from 'react';
import { Icon } from '@iconify/react';

export default function GeographyRankingTable({ data = [], loading = false, selectedCountry = null, onSelectCountry }) {
  const [searchTerm, setSearchTerm] = useState('');

  const rankedData = useMemo(() => {
    return [...data]
      .sort((a, b) => (Number(b.article_count) || 0) - (Number(a.article_count) || 0))
      .map((item, index) => ({ ...item, rank: index + 1 }));
  }, [data]);

  const filteredData = useMemo(() => {
    return rankedData.filter(item => 
      item.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [rankedData, searchTerm]);

  return (
    <div className="p-4 journal-dark-card h-100 d-flex flex-column">
      {/* Header */}
      <div className="mb-3">
        <h3 className="font-display fw-bold text-main mb-0" style={{ fontSize: '1.1rem' }}>
          Xếp hạng Quốc gia
        </h3>
      </div>

      {/* Search Bar */}
      <div className="mb-3 geography-search-wrapper">
        <Icon 
          icon="lucide:search" 
          width="14" 
          className="geography-search-icon" 
        />
        <input 
          type="text" 
          placeholder="Tìm quốc gia..." 
          className="w-100 form-control geography-search-input shadow-none" 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Table */}
      <div className="table-responsive flex-grow-1" style={{ overflowY: 'auto', maxHeight: '400px' }}>
        <table className="table table-hover align-middle mb-0 geography-table" style={{ fontSize: '0.85rem' }}>
          <thead style={{ position: 'sticky', top: 0, backgroundColor: 'var(--bg-card)', zIndex: 1 }}>
            <tr>
              <th className="py-2 text-main font-sans fw-bold border-bottom" style={{ width: '60px' }}>Hạng</th>
              <th className="py-2 text-main font-sans fw-bold border-bottom">Quốc gia</th>
              <th className="py-2 text-end text-main font-sans fw-bold border-bottom" style={{ width: '80px' }}>Article</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              [1, 2, 3, 4, 5, 6].map(i => (
                <tr key={i}>
                  <td className="py-3"><div className="skeleton-shimmer" style={{ width: '20px', height: '16px' }} /></td>
                  <td className="py-3"><div className="skeleton-shimmer" style={{ width: '120px', height: '16px' }} /></td>
                  <td className="py-3 text-end"><div className="skeleton-shimmer ms-auto" style={{ width: '40px', height: '16px' }} /></td>
                </tr>
              ))
            ) : filteredData.length === 0 ? (
              <tr>
                <td colSpan="3" className="text-center py-4 text-muted-custom">
                  Không tìm thấy quốc gia phù hợp
                </td>
              </tr>
            ) : (
              filteredData.map((item) => (
                <tr 
                  key={item.zone_id}
                  onClick={() => onSelectCountry?.(item)}
                  className={`geography-ranking-row ${selectedCountry?.zone_id === item.zone_id ? 'is-active' : ''}`}
                >
                  <td className="py-3 text-main fw-bold font-sans">
                    {item.rank}
                  </td>
                  <td className="py-3 text-main fw-semibold font-sans">
                    {item.name || '—'}
                  </td>
                  <td className="py-3 text-end text-main font-sans">
                    {Number(item.article_count || 0).toLocaleString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
