/**
 * @file AuthorListPage.jsx
 * @description Trang hiển thị Danh mục Đăng ký Tác giả (`/authors`).
 */

import { useEffect, useRef, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Form, InputGroup, Card, Button } from 'react-bootstrap';
import Icon from '../../../shared/components/Icon';
import Header from '../../landing/components/Header';
import useAuthors from '../hooks/useAuthors';
import AuthorTable from '../components/AuthorTable';
import AuthorCard from '../components/AuthorCard';
import LoadingSkeleton from '../../../shared/components/LoadingSkeleton';
import AuthorNavigationTabs from '../components/AuthorNavigationTabs';
import AdminPagination from '../../../shared/components/Pagination';
import './AuthorListPage.css';

export default function AuthorListPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const {
    authors,
    totalAuthors,
    totalPages,
    subjectAreas,
    loadingAuthors,
    errorAuthors,
    fetchAuthors,
    fetchSubjectAreas
  } = useAuthors();

  const [viewMode] = useState('grid');
  const [subjectAreaDropdownOpen, setSubjectAreaDropdownOpen] = useState(false);
  const subjectAreaMenuRef = useRef(null);

  const searchVal = searchParams.get('search') || '';
  const pageVal = parseInt(searchParams.get('page') || '1', 10);
  const limitVal = parseInt(searchParams.get('limit') || '10', 10);
  const sortVal = searchParams.get('sort') || 'impact';
  const subjectAreaVal = searchParams.get('subject_area') || '';
  const countryVal = searchParams.get('country') || '';
  const [searchInput, setSearchInput] = useState(searchVal);

  useEffect(() => {
    const params = {
      search: searchVal,
      page: pageVal,
      limit: limitVal,
      sort: sortVal,
      subject_area: subjectAreaVal,
      country: countryVal
    };
    const filteredParams = Object.fromEntries(
      Object.entries(params).filter(([, value]) => value !== '')
    );
    fetchAuthors(filteredParams);
  }, [searchVal, pageVal, limitVal, sortVal, subjectAreaVal, countryVal, fetchAuthors]);

  useEffect(() => {
    if (!subjectAreas || subjectAreas.length === 0) {
      fetchSubjectAreas();
    }
  }, [subjectAreas, fetchSubjectAreas]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (subjectAreaMenuRef.current && !subjectAreaMenuRef.current.contains(event.target)) {
        setSubjectAreaDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    const nextParams = new URLSearchParams(searchParams);
    if (searchInput.trim()) nextParams.set('search', searchInput.trim());
    else nextParams.delete('search');
    nextParams.set('page', '1');
    setSearchParams(nextParams);
  };

  const handleFilterChange = (key, value) => {
    const nextParams = new URLSearchParams(searchParams);
    if (value) nextParams.set(key, value);
    else nextParams.delete(key);
    nextParams.set('page', '1');
    setSearchParams(nextParams);
  };

  const handlePageChange = (newPage) => {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set('page', String(newPage));
    setSearchParams(nextParams);
  };

  const totalPagesCount = Math.max(1, totalPages);
  const startIndex = (pageVal - 1) * limitVal + 1;

  const formatLocalNumber = (value) => {
    if (value === null || value === undefined || Number.isNaN(Number(value))) return '0';
    return Number(value).toLocaleString('vi-VN');
  };

  const visibleAuthorsCount = authors.length;
  const featuredAuthorsCount = authors.filter((author) => Number(author.h_index ?? author.hindex ?? 0) >= 30).length;
  const totalWorksCount = authors.reduce((sum, author) => sum + (Number(author.works_count ?? author.article_count ?? 0) || 0), 0);
  const totalCitationCount = authors.reduce((sum, author) => sum + (Number(author.cited_by_count ?? author.citation_count ?? 0) || 0), 0);

  const statCards = [
    { label: 'Tổng tác giả', value: formatLocalNumber(totalAuthors), icon: 'lucide:users', desc: 'Tổng tác giả trong hệ thống' },
    {
      label: 'Tác giả nổi bật',
      value: formatLocalNumber(featuredAuthorsCount || visibleAuthorsCount),
      icon: 'lucide:award',
      desc: visibleAuthorsCount > 0 ? `Trong ${formatLocalNumber(visibleAuthorsCount)} tác giả đang hiển thị` : 'H-index vượt trội (>=30)'
    },
    { label: 'Tổng bài báo', value: formatLocalNumber(totalWorksCount), icon: 'lucide:file-text', desc: 'Tổng bài báo trên trang hiện tại' },
    { label: 'Tổng citations', value: formatLocalNumber(totalCitationCount), icon: 'lucide:quote', desc: 'Tổng citations trên trang hiện tại' }
  ];

  return (
    <div className="author-list-page">
      <Header />

      <Container className="pt-4">
        <nav className="author-list-breadcrumb mb-4" aria-label="breadcrumb">
          <ol className="breadcrumb">
            <li className="breadcrumb-item">
              <span className="author-list-breadcrumb__link" onClick={() => navigate('/')}>
                Tổng quan
              </span>
            </li>
            <li className="breadcrumb-item active text-primary" aria-current="page">
              Tác giả nổi bật
            </li>
          </ol>
        </nav>

        <section className="author-list-hero">
          <div className="author-list-hero__content">
            <div className="author-list-eyebrow">
              <Icon icon="lucide:users-round" width="17" />
              <span>Author registry</span>
            </div>
            <h1 className="author-list-title">Danh sách Nhà khoa học & Tác giả</h1>
            <p className="author-list-description">
              Tra cứu thông tin, chỉ số học thuật h-index, số trích dẫn và các công trình khoa học của các tác giả hàng đầu.
            </p>
          </div>
        </section>

        <AuthorNavigationTabs activeTab="list" />

        <Row className="g-3 mb-4">
          {statCards.map((stat, idx) => (
            <Col xs={12} sm={6} lg={3} key={idx}>
              <Card className="author-stat-card">
                <div className="author-stat-header">
                  <span className="author-stat-label">{stat.label}</span>
                  <Icon className="author-stat-icon" icon={stat.icon} width="16" />
                </div>
                <div className="author-stat-value">{stat.value}</div>
                <div className="author-stat-desc">{stat.desc}</div>
              </Card>
            </Col>
          ))}
        </Row>

        <Card className="author-filter-card">
          <Form onSubmit={handleSearchSubmit}>
            <Row className="g-3 align-items-center">
              <Col xs={12} lg={4}>
                <InputGroup className="author-input-group">
                  <InputGroup.Text className="author-input-addon pe-1">
                    <Icon icon="lucide:search" width="16" />
                  </InputGroup.Text>
                  <Form.Control
                    type="text"
                    placeholder="Tìm theo tên, viện nghiên cứu, từ khóa..."
                    value={searchInput}
                    onChange={e => setSearchInput(e.target.value)}
                    className="author-filter-input"
                  />
                </InputGroup>
              </Col>

              <Col xs={12} sm={6} lg={3}>
                <Form.Group className="position-relative" ref={subjectAreaMenuRef}>
                  <InputGroup className="author-input-group">
                    <Form.Control
                      id="subjectAreaInput"
                      size="sm"
                      type="text"
                      placeholder="Nhập hoặc chọn lĩnh vực"
                      value={subjectAreaVal}
                      onChange={e => {
                        handleFilterChange('subject_area', e.target.value);
                        setSubjectAreaDropdownOpen(true);
                      }}
                      onFocus={() => setSubjectAreaDropdownOpen(true)}
                      className="author-filter-input"
                    />
                    <InputGroup.Text className="author-dropdown-toggle px-3" onClick={() => setSubjectAreaDropdownOpen((prev) => !prev)}>
                      <Icon icon="lucide:chevron-down" width="16" />
                    </InputGroup.Text>
                  </InputGroup>

                  {subjectAreaDropdownOpen && subjectAreas && subjectAreas.length > 0 && (
                    <div className="author-subject-menu">
                      <button
                        type="button"
                        className="author-subject-option author-subject-option--muted px-3 py-2"
                        onClick={() => {
                          handleFilterChange('subject_area', '');
                          setSubjectAreaDropdownOpen(false);
                        }}
                      >
                        Tất cả lĩnh vực
                      </button>
                      {subjectAreas.map((area) => (
                        <button
                          key={area.subject_area_id || area.id || area.display_name}
                          type="button"
                          className="author-subject-option px-3 py-2"
                          onClick={() => {
                            handleFilterChange('subject_area', area.display_name || area.name || '');
                            setSubjectAreaDropdownOpen(false);
                          }}
                        >
                          {area.display_name || area.name || ''}
                        </button>
                      ))}
                    </div>
                  )}
                </Form.Group>
              </Col>

              <Col xs={12} sm={6} lg={1} className="d-flex gap-2">
                <Button type="submit" className="author-filter-submit w-100 py-2">
                  Tìm
                </Button>
              </Col>
            </Row>
          </Form>
        </Card>

        <div className="mb-4">
          {viewMode === 'grid' ? (
            loadingAuthors ? (
              <Row className="g-3">
                {Array.from({ length: limitVal }).map((_, idx) => (
                  <Col xs={12} md={6} key={idx}>
                    <Card className="author-grid-skeleton">
                      <div className="d-flex gap-3 mb-3">
                        <LoadingSkeleton width="48px" height="48px" borderRadius="50%" />
                        <div className="flex-grow-1">
                          <LoadingSkeleton width="60%" height="16px" className="mb-2" />
                          <LoadingSkeleton width="40%" height="12px" />
                        </div>
                      </div>
                      <LoadingSkeleton width="100%" height="32px" className="mb-3" />
                      <LoadingSkeleton width="30%" height="18px" />
                    </Card>
                  </Col>
                ))}
              </Row>
            ) : authors.length === 0 ? (
              <AuthorTable authors={[]} loading={false} error={errorAuthors} onRetry={() => fetchAuthors()} />
            ) : (
              <Row className="g-3">
                {authors.map((author) => (
                  <Col xs={12} md={6} key={author.author_id ?? author.id}>
                    <AuthorCard author={author} />
                  </Col>
                ))}
              </Row>
            )
          ) : (
            <AuthorTable authors={authors} loading={loadingAuthors} error={errorAuthors} onRetry={() => fetchAuthors()} startIndex={startIndex} />
          )}
        </div>

        {authors.length > 0 && totalPagesCount > 1 && (
          <AdminPagination
            totalItems={totalAuthors}
            currentPage={pageVal}
            limit={limitVal}
            onPageChange={handlePageChange}
            entityName="tác giả"
          />
        )}
      </Container>
    </div>
  );
}
