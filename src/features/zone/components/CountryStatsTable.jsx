import React, { useState, useMemo } from 'react';
import { Table, InputGroup, Form } from 'react-bootstrap';
import { Icon } from '@iconify/react';
import AdminPagination from '../../../shared/components/Pagination';

export default function CountryStatsTable({ 
  countries = [], 
  selectedCountry = null, 
  onSelectCountry 
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortKey, setSortKey] = useState('article_count'); // 'name' or 'article_count'
  const [sortOrder, setSortOrder] = useState('desc'); // 'asc' or 'desc'
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Filter countries by search term
  const filteredCountries = useMemo(() => {
    return countries.filter(c => 
      c.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.iso_code?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [countries, searchTerm]);

  // Sort countries
  const sortedCountries = useMemo(() => {
    const sorted = [...filteredCountries];
    sorted.sort((a, b) => {
      let valA = a[sortKey];
      let valB = b[sortKey];

      if (sortKey === 'article_count') {
        valA = Number(valA) || 0;
        valB = Number(valB) || 0;
      } else {
        valA = String(valA || '').toLowerCase();
        valB = String(valB || '').toLowerCase();
      }

      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
    return sorted;
  }, [filteredCountries, sortKey, sortOrder]);

  // Reset page when search term changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // Pagination calculations
  const totalPages = Math.ceil(sortedCountries.length / itemsPerPage) || 1;
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (safeCurrentPage - 1) * itemsPerPage;
  const paginatedCountries = sortedCountries.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const toggleSort = (key) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortOrder('desc'); // Default to descending for numbers, or ascending for names can be adjusted
    }
  };

  return (
    <div 
      className="p-4 journal-dark-card d-flex flex-column h-100"
      style={{ minHeight: '520px' }}
    >
      {/* Table Header / Action Section */}
      <div className="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center gap-3 mb-4">
        <div>
          <h2 className="font-display fw-bold text-main mb-1" style={{ fontSize: '1.2rem' }}>
            Thống kê theo quốc gia
          </h2>
          <p className="text-muted-custom mb-0" style={{ fontSize: '0.75rem' }}>
            Danh sách các quốc gia cùng tổng số lượng bài báo khoa học đã xuất bản
          </p>
        </div>
      </div>

      {/* Search Input */}
      <div className="mb-3">
        <InputGroup 
          className="px-3 py-1 rounded-3"
          style={{
            backgroundColor: 'var(--bg-chip)',
            border: '1px solid var(--border)',
            transition: 'border-color 0.2s ease',
          }}
        >
          <InputGroup.Text className="bg-transparent border-0 p-0 me-2">
            <Icon icon="lucide:search" width="16" style={{ color: 'var(--text-muted)' }} />
          </InputGroup.Text>
          <Form.Control
            type="text"
            placeholder="Tìm kiếm quốc gia..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border-0 bg-transparent text-main w-100 p-1"
            style={{ outline: 'none', fontSize: '0.82rem', boxShadow: 'none' }}
          />
          {searchTerm && (
            <button 
              className="bg-transparent border-0 p-0 text-muted-custom hover:text-main"
              onClick={() => setSearchTerm('')}
            >
              <Icon icon="lucide:x" width="16" />
            </button>
          )}
        </InputGroup>
      </div>

      {/* Table */}
      <div className="table-responsive flex-grow-1" style={{ overflowX: 'auto' }}>
        <Table hover className="align-middle mb-0 text-start" style={{ minWidth: '400px', fontSize: '0.85rem' }}>
          <thead style={{ backgroundColor: 'var(--bg-chip)', borderBottom: '1px solid var(--border)' }}>
            <tr>
              <th className="py-2.5 ps-3 text-muted-custom font-semibold text-xs text-uppercase" style={{ width: '50px' }}>
                #
              </th>
              <th 
                className="py-2.5 text-muted-custom font-semibold text-xs text-uppercase cursor-pointer select-none"
                onClick={() => toggleSort('name')}
                style={{ cursor: 'pointer' }}
              >
                <div className="d-flex align-items-center gap-1">
                  <span>Quốc gia</span>
                  <Icon 
                    icon={sortKey === 'name' ? (sortOrder === 'asc' ? 'lucide:arrow-up' : 'lucide:arrow-down') : 'lucide:arrow-up-down'} 
                    width="12" 
                    className="text-muted"
                  />
                </div>
              </th>
              <th className="py-2.5 text-muted-custom font-semibold text-xs text-uppercase" style={{ width: '70px' }}>
                Mã
              </th>
              <th 
                className="py-2.5 text-muted-custom font-semibold text-xs text-uppercase cursor-pointer select-none"
                onClick={() => toggleSort('article_count')}
                style={{ cursor: 'pointer' }}
              >
                <div className="d-flex align-items-center gap-1">
                  <span>Bài báo</span>
                  <Icon 
                    icon={sortKey === 'article_count' ? (sortOrder === 'asc' ? 'lucide:arrow-up' : 'lucide:arrow-down') : 'lucide:arrow-up-down'} 
                    width="12" 
                    className="text-muted"
                  />
                </div>
              </th>
              <th className="py-2.5 pe-3 text-end text-muted-custom font-semibold text-xs text-uppercase" style={{ width: '100px' }}>
                Chi tiết
              </th>
            </tr>
          </thead>
          <tbody>
            {paginatedCountries.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center py-5 text-muted-custom">
                  Không tìm thấy quốc gia phù hợp
                </td>
              </tr>
            ) : (
              paginatedCountries.map((country, index) => {
                const globalIndex = startIndex + index + 1;
                const isSelected = selectedCountry?.code === country.code;
                
                return (
                  <tr 
                    key={country.zone_id || country.code} 
                    className="transition-all duration-150" 
                    style={{ 
                      cursor: 'pointer',
                      backgroundColor: isSelected ? 'var(--primary-light)' : 'transparent',
                      fontWeight: isSelected ? 600 : 400
                    }} 
                    onClick={() => onSelectCountry(country)}
                  >
                    <td className="ps-3 text-muted-custom font-monospace" style={{ fontSize: '0.8rem' }}>
                      {globalIndex}
                    </td>
                    <td className="py-2.5 font-display text-main">
                      {country.name || '—'}
                    </td>
                    <td className="text-muted-custom font-monospace">
                      {country.code || country.iso_code || '—'}
                    </td>
                    <td className="text-main fw-bold font-monospace">
                      {Number(country.article_count || 0).toLocaleString()}
                    </td>
                    <td className="pe-3 text-end">
                      <button
                        className="btn btn-link text-primary p-0 text-decoration-none d-inline-flex align-items-center gap-1 hover:translate-x-1"
                        style={{ fontSize: '0.78rem', transition: 'all 0.15s ease' }}
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectCountry(country);
                        }}
                      >
                        <span>Xem region</span>
                        <Icon icon="lucide:chevron-right" width="14" />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </Table>
      </div>

      {/* Pagination Controls */}
      {sortedCountries.length > 0 && totalPages > 1 && (
        <div className="mt-3 pt-3 border-top border-light">
          <AdminPagination
            totalItems={sortedCountries.length}
            currentPage={safeCurrentPage}
            limit={itemsPerPage}
            onPageChange={handlePageChange}
            entityName="quốc gia"
          />
        </div>
      )}
    </div>
  );
}
