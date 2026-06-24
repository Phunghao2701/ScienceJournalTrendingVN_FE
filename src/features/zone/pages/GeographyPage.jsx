import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Container, Row, Col, Form } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import useZoneStats from '../hooks/useZoneStats';
import { getCountryArticlesApi } from '../api/zone.api';
import GeographyTerritoryChart from '../components/GeographyTerritoryChart';
import GeographyRankingTable from '../components/GeographyRankingTable';
import GeographyArticleList from '../components/GeographyArticleList';
import Header from '../../landing/components/Header';
import AuthRequiredModal from '../../../shared/components/AuthRequiredModal';
import { useAuthStore } from '../../../app/store/authStore';
import { isAuthenticated as checkAuthSession } from '../../../shared/utils/auth';
import './GeographyPage.css';

export default function GeographyPage() {
  const navigate = useNavigate();
  const isAuthenticatedState = useAuthStore((state) => state.isAuthenticated);

  // Khôi phục phiên đăng nhập từ cookie khi mount component ở route công khai
  useEffect(() => {
    checkAuthSession();
  }, []);

  const {
    countryStats,
    loadingCountries,
    errorCountries,
    fetchCountryStats,
  } = useZoneStats();

  // Selected country state
  const [selectedCountry, setSelectedCountry] = useState(null);

  // State lưu trữ năm xuất bản được chọn để lọc (Mặc định: 'All' - hiển thị tất cả các năm)
  const [selectedYear, setSelectedYear] = useState('All');

  // Articles listing states
  const [articles, setArticles] = useState([]);
  const [loadingArticles, setLoadingArticles] = useState(false);
  const [articlesPage, setArticlesPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalArticles, setTotalArticles] = useState(0);

  // Auth Modal state
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Ref to scroll to articles list
  const articlesRef = useRef(null);

  // Hook tự động gọi lại API để tải thống kê theo quốc gia bất cứ khi nào năm lọc (selectedYear) thay đổi
  useEffect(() => {
    fetchCountryStats({
      limit: 1000,
      year: selectedYear === 'All' ? undefined : selectedYear
    });
  }, [selectedYear, fetchCountryStats]);

  // Hàm phụ trợ dùng để lấy danh sách bài viết thuộc quốc gia đang chọn (có hỗ trợ lọc theo năm)
  const fetchArticles = useCallback(async (countryId, pageNum, yearFilter) => {
    setLoadingArticles(true);
    try {
      const params = { page: pageNum, limit: 10 };
      // Nếu có bộ lọc năm hoạt động, ta sẽ gửi kèm tham số publication_year lên API bài báo
      if (yearFilter && yearFilter !== 'All') {
        params.publication_year = Number(yearFilter);
      }
      const res = await getCountryArticlesApi(countryId, params);
      if (res.data && res.data.success !== false) {
        const resData = res.data.data || {};
        setArticles(resData.articles || resData.items || []);
        if (resData.pagination) {
          setTotalArticles(resData.pagination.total || 0);
          setTotalPages(resData.pagination.total_pages || 1);
        }
      }
    } catch (err) {
      console.error('Lỗi khi lấy danh sách bài báo của quốc gia:', err);
      setArticles([]);
      setTotalArticles(0);
      setTotalPages(1);
    } finally {
      setLoadingArticles(false);
    }
  }, []);

  // Hook tự động kích hoạt tải lại danh sách bài báo khi thay đổi quốc gia được chọn, trang phân trang, hoặc năm được chọn lọc
  useEffect(() => {
    if (selectedCountry) {
      fetchArticles(selectedCountry.zone_id, articlesPage, selectedYear);
    } else {
      setArticles([]);
      setTotalArticles(0);
      setTotalPages(1);
    }
  }, [selectedCountry, articlesPage, selectedYear, fetchArticles]);

  // Handle country row or bar chart click
  const handleSelectCountry = (country) => {
    if (selectedCountry?.zone_id === country.zone_id) {
      // Toggle off
      setSelectedCountry(null);
      setArticlesPage(1);
    } else {
      setSelectedCountry(country);
      setArticlesPage(1);
      // Scroll to articles listing
      setTimeout(() => {
        articlesRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  };

  // Bắt sự kiện click vào bài báo: yêu cầu đăng nhập nếu chưa có phiên hợp lệ
  const handleDetailClick = (id) => {
    if (!isAuthenticatedState) {
      setShowAuthModal(true);
    } else {
      navigate(`/articles/${id}/visual`);
    }
  };

  return (
    <div className="geography-page-wrapper grid-bg">
      <div className="radial-fade position-absolute inset-0" style={{ pointerEvents: 'none', zIndex: 0 }} />
      <Header />
      <Container fluid className="px-4 py-4 position-relative" style={{ zIndex: 1 }}>
        {/* Breadcrumb */}
        <div className="geography-breadcrumb mb-2">
          <span>
            Tổng quan <span className="mx-1">&rsaquo;</span> <span className="geography-breadcrumb-active">Phân bố Địa lý</span>
          </span>
        </div>

        {/* Header */}
        <div className="mb-4 pb-2 d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3">
          <div>
            <h1 className="geography-title">
              Phân bố Tạp chí theo Quốc gia
            </h1>
            <p className="geography-subtitle">
              Xem thống kê số lượng ấn phẩm khoa học và nhà xuất bản phân bố trên toàn thế giới.
            </p>
          </div>

          {/* Year Filter Dropdown */}
          <div className="d-flex align-items-center gap-2" style={{ minWidth: '220px' }}>
            <span className="text-muted-custom fw-semibold text-nowrap" style={{ fontSize: '0.82rem' }}>Năm xuất bản:</span>
            <Form.Select
              value={selectedYear}
              onChange={(e) => {
                setSelectedYear(e.target.value);
                setArticlesPage(1);
              }}
              className="geography-select shadow-sm"
            >
              <option value="All">Tất cả các năm</option>
              {['2026', '2025', '2024', '2023', '2022', '2021', '2020', '2019', '2018', '2017', '2016', '2015'].map(yr => (
                <option key={yr} value={yr}>{yr}</option>
              ))}
            </Form.Select>
          </div>
        </div>

        {/* Error handling for countries */}
        {errorCountries && (
          <div className="alert alert-danger d-flex align-items-center gap-2 mb-4" role="alert">
            <div>
              <strong>Lỗi tải dữ liệu: </strong>
              {errorCountries}
            </div>
            <button
              className="btn btn-sm btn-outline-danger ms-auto"
              onClick={() => fetchCountryStats({ limit: 1000, year: selectedYear === 'All' ? undefined : selectedYear })}
            >
              Thử lại
            </button>
          </div>
        )}

        {/* Main Content Layout */}
        <Row className="g-4">
          {/* Left Column: Chart Area */}
          <Col xs={12} lg={7} xl={8}>
            <GeographyTerritoryChart
              data={countryStats}
              loading={loadingCountries}
              selectedCountry={selectedCountry}
              onSelectCountry={handleSelectCountry}
              selectedYear={selectedYear}
            />
          </Col>

          {/* Right Column: Ranking Table */}
          <Col xs={12} lg={5} xl={4}>
            <GeographyRankingTable
              data={countryStats}
              loading={loadingCountries}
              selectedCountry={selectedCountry}
              onSelectCountry={handleSelectCountry}
            />
          </Col>
        </Row>

        {/* Selected Country Articles List */}
        {selectedCountry && (
          <Row className="mt-4" ref={articlesRef}>
            <Col xs={12}>
              <GeographyArticleList
                articles={articles}
                loading={loadingArticles}
                total={totalArticles}
                page={articlesPage}
                totalPages={totalPages}
                onPageChange={setArticlesPage}
                onDetailClick={handleDetailClick}
                countryName={selectedCountry.name}
              />
            </Col>
          </Row>
        )}
      </Container>

      {/* Login guard modal */}
      <AuthRequiredModal
        show={showAuthModal}
        onHide={() => setShowAuthModal(false)}
      />
    </div>
  );
}
