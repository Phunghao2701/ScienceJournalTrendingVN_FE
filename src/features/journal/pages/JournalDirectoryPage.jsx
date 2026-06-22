import React, { useState, useEffect } from "react";
import { Container, Row } from "react-bootstrap";
import { useJournalManagement } from "../hooks/useJournalManagement";
import JournalFilterBar from "../components/JournalFilterBar";
import JournalTableAdmin from "../components/JournalTableAdmin";
import JournalCardAdmin from "../components/JournalCardAdmin";
import AddJournalModal from "../components/modals/AddJournalModal";

/**
 * Page JournalDirectoryPage - Màn hình chính quản lý thư mục các Tạp chí dành cho Admin.
 * Tuân thủ chuẩn: Lấy dữ liệu từ Hook Store -> Thực hiện Filter cục bộ -> Đổ ra Component hiển thị.
 */
export default function JournalDirectoryPage() {
  // --- 1. LẤY TRẠNG THÁI VÀ HÀM TỪ ZUSTAND STORE ---
  const { journals, fetchInitialData, loading } = useJournalManagement();

  // --- 2. CÁC STATE CỤC BỘ DÙNG CHO PHÂN TRANG VÀ BỘ LỌC UI ---
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [viewMode, setViewMode] = useState("table"); // Mặc định hiển thị dạng bảng (Table view)
  const [showAddModal, setShowAddModal] = useState(false);

  // State phục vụ phân trang hiển thị (giúp tính toán số index # chính xác trong table)
  const [page] = useState(1);
  const [limit] = useState(10);

  // --- 3. ĐỔ DỮ LIỆU BAN ĐẦU KHI MÀN HÌNH ĐƯỢC MỞ (MOUNT) ---
  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  // --- 4. LOGIC XỬ LÝ LỌC TÌM KIẾM DỮ LIỆU (SEARCH & FILTER) ---
  // Logic xử lý an toàn đề phòng journals bị undefined lúc đầu
  const filteredJournals = (journals || []).filter((journal) => {
    const journalTitle = journal.title || journal.display_name || "";
    const journalIssn = journal.issn || "";
    const journalStatus = journal.status || "Draft";

    const matchesSearch =
      journalTitle.toLowerCase().includes(search.toLowerCase()) ||
      journalIssn.includes(search);

    const matchesStatus =
      statusFilter === "All" || journalStatus === statusFilter;

    return matchesSearch && matchesStatus;
  });
  return (
    <Container fluid className="py-4 grid-bg">
      {/* KHỐI TIÊU ĐỀ TRANG QUẢN TRỊ */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="font-display fw-bold text-main mb-1">
            Quản lý Tạp chí
          </h1>
          <p className="text-muted-custom mb-0">
            Hệ thống phân cấp và lưu trữ cấu trúc Journal, Volume và Issue
          </p>
        </div>
      </div>

      {/* THANH BỘ LỌC ĐA NĂNG (TÌM KIẾM, TOGGLE VIEW, NÚT THÊM MỚI) */}
      <JournalFilterBar
        search={search}
        onSearchChange={setSearch}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onOpenAddModal={() => setShowAddModal(true)}
      />

      {/* KHU VỰC RENDER DANH SÁCH THEO TRẠNG THÁI HỆ THỐNG */}
      {loading ? (
        <div className="text-center py-5">
          <div
            className="spinner-border text-warning skeleton-shimmer"
            role="status"
          >
            <span className="visually-hidden">Đang tải dữ liệu...</span>
          </div>
        </div>
      ) : filteredJournals.length === 0 ? (
        <div className="text-center py-5 glass-card">
          <p className="text-muted-custom mb-0">
            Không tìm thấy tạp chí nào phù hợp với bộ lọc hiện tại.
          </p>
        </div>
      ) : viewMode === "table" ? (
        /* CHẾ ĐỘ XEM BẢNG DÀNH CHO ADMIN */
        <div className="glass-card p-0 border-0 shadow-none">
          <JournalTableAdmin
            journals={filteredJournals}
            page={page}
            limit={limit}
          />
        </div>
      ) : (
        /* CHẾ ĐỘ XEM LƯỚI THẺ DÀNH CHO ADMIN */
        <Row className="g-3">
          {filteredJournals.map((j) => (
            <JournalCardAdmin key={j.id || j.journal_id} journal={j} />
          ))}
        </Row>
      )}

      {/* MODAL THÊM TẠP CHÍ MỚI DÀNH CHO ADMIN */}
      <AddJournalModal
        show={showAddModal}
        handleClose={() => setShowAddModal(false)}
      />
    </Container>
  );
}
