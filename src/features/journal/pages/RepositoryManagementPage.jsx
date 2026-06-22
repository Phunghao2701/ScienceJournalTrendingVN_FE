import React, { useEffect, useState } from "react";
import { Container, Row, Col, Card, Button, Breadcrumb } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { Icon } from "@iconify/react";
import { useJournalManagement } from "../hooks/useJournalManagement";
import VolumeList from "../components/VolumeList";
import IssueTable from "../components/IssueTable";
import SwitchJournalModal from "../components/modals/SwitchJournalModal";
import CreateVolumeModal from "../components/modals/CreateVolumeModal";
import CreateIssueModal from "../components/modals/CreateIssueModal";

/**
 * Page RepositoryManagementPage - Màn hình điều phối quản lý Tập (Volume) và Số (Issue) tập trung của Admin.
 * Đáp ứng đầy đủ tiêu chí logic liên kết dữ liệu cha - con trên Mock State.
 */
export default function RepositoryManagementPage() {
  const navigate = useNavigate();

  // --- LẤY DỮ LIỆU TỪ ZUSTAND STORE ---
  const {
    currentJournal,
    volumes,
    issues,
    selectedVolume,
    setSelectedVolume,
    fetchInitialData,
  } = useJournalManagement();

  // --- CÁC STATE ĐIỀU KHIỂN ĐÓNG/MỞ MODAL FORM ---
  const [showSwitchModal, setShowSwitchModal] = useState(false);
  const [showVolumeModal, setShowVolumeModal] = useState(false);
  const [showIssueModal, setShowIssueModal] = useState(false);

  // Đảm bảo dữ liệu được nạp vào store đầy đủ khi Admin truy cập trang
  useEffect(() => {
    if (!currentJournal) {
      fetchInitialData();
    }
  }, [currentJournal, fetchInitialData]);

  // --- LỌC DỮ LIỆU CẤU TRÚC PHỤ THUỘC (CASCADING FILTER) ---
  // 1. Lọc ra toàn bộ Volume thuộc về Tạp chí đang active hiện tại (đảm bảo bảo vệ nếu volumes undefined)
  const currentVolumes = (volumes || []).filter(
    (v) => v.journalId === currentJournal?.id,
  );
  // Tự động chọn mặc định Volume đầu tiên trong danh sách nếu Admin chưa click chọn dòng nào cụ thể
  useEffect(() => {
    if (currentVolumes.length > 0 && !selectedVolume) {
      setSelectedVolume(currentVolumes[0].id);
    }
  }, [currentVolumes, selectedVolume, setSelectedVolume]);

  // 2. Lọc ra toàn bộ Issue thuộc về Volume đang được Admin click chọn ở cột bên trái (đảm bảo bảo vệ nếu issues undefined)
  const currentIssues = (issues || []).filter(
    (i) => i.volumeId === selectedVolume,
  );

  return (
    <Container fluid className="py-4 grid-bg">
      {/* THANH ĐIỀU HƯỚNG BREADCRUMB CHUẨN UX */}
      <Breadcrumb className="mb-3 small">
        <Breadcrumb.Item onClick={() => navigate("/admin/journals")}>
          Quản lý Tạp chí
        </Breadcrumb.Item>
        <Breadcrumb.Item active>
          Kho dữ liệu Tập & Số (Repository)
        </Breadcrumb.Item>
      </Breadcrumb>

      {/* KHỐI TIÊU ĐỀ TRANG VÀ THÔNG TIN TẠP CHÍ ĐANG CHỌN */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <span className="text-muted-custom small text-uppercase fw-bold tracking-wider">
            Repository Management
          </span>
          <h1 className="font-display fw-bold text-main mb-1 d-flex align-items-center gap-2 mt-0.5">
            <Icon icon="lucide:database" className="text-warning" />
            {currentJournal ? currentJournal.title : "Đang tải thông tin..."}
          </h1>
          <p className="text-muted-custom small mb-0">
            Mã số ISSN:{" "}
            <span className="font-monospace fw-medium">
              {currentJournal?.issn}
            </span>{" "}
            | Người phụ trách:{" "}
            <span className="fw-medium">{currentJournal?.publisher}</span>
          </p>
        </div>

        {/* Nút bấm mở Switch Journal Modal để đổi nhanh tạp chí cần cấu hình */}
        <Button
          variant="outline-dark"
          className="btn-custom-sm d-flex align-items-center gap-1.5"
          onClick={() => setShowSwitchModal(true)}
        >
          <Icon icon="lucide:refresh-cw" width="14" />
          <span>Đổi Tạp Chí</span>
        </Button>
      </div>

      {/* THẺ TỔNG QUAN THỐNG KÊ NHANH (SUMMARY CARD) */}
      <Row className="g-3 mb-4 text-start">
        <Col xs={12} sm={4}>
          <Card className="border p-3 shadow-none bg-white">
            <div className="text-muted-custom small mb-1">
              Tổng số Volume (Tập)
            </div>
            <h3 className="fw-bold text-main m-0 font-monospace">
              {currentVolumes.length}
            </h3>
          </Card>
        </Col>
        <Col xs={12} sm={4}>
          <Card className="border p-3 shadow-none bg-white">
            <div className="text-muted-custom small mb-1">
              Tổng số Issue phát hành
            </div>
            <h3 className="fw-bold text-main m-0 font-monospace">
              {
                issues.filter((i) =>
                  currentVolumes.map((v) => v.id).includes(i.volumeId),
                ).length
              }
            </h3>
          </Card>
        </Col>
        <Col xs={12} sm={4}>
          <Card className="border p-3 shadow-none bg-white">
            <div className="text-muted-custom small mb-1">
              Trạng thái cấu trúc
            </div>
            <div className="d-flex align-items-center gap-1 mt-1">
              <span className="badge bg-success-subtle text-success rounded">
                Đồng bộ (Mock State)
              </span>
            </div>
          </Card>
        </Col>
      </Row>

      {/* KHU VỰC CHIA ĐÔI GIAO DIỆN CHÍNH (VOLUME BÊN TRÁI - ISSUE BÊN PHẢI) */}
      <Row className="g-4 text-start">
        {/* CỘT BÊN TRÁI: QUẢN LÝ VOLUME */}
        <Col xs={12} lg={4}>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="font-display fw-bold text-main mb-0">
              Danh sách các Tập (Volumes)
            </h5>
            <Button
              variant="dark"
              size="sm"
              className="btn-custom-sm d-flex align-items-center gap-1 px-2.5 py-1.5"
              onClick={() => setShowVolumeModal(true)}
            >
              <Icon icon="lucide:plus" width="14" />
              <span>Tập mới</span>
            </Button>
          </div>
          <VolumeList
            volumes={currentVolumes}
            selectedVolumeId={selectedVolume}
            onSelectVolume={setSelectedVolume}
          />
        </Col>

        {/* CỘT BÊN PHẢI: QUẢN LÝ CÁC ISSUE THUỘC VOLUME ĐƯỢC CHỌN */}
        <Col xs={12} lg={8}>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="font-display fw-bold text-main mb-0">
              Số phát hành (Issues) thuộc Tập đã chọn
            </h5>
            <Button
              className="btn-primary-glow btn-custom-sm d-flex align-items-center gap-1 px-2.5 py-1.5"
              disabled={!selectedVolume} // Khóa nút lại nếu chưa có Volume nào được chọn
              onClick={() => setShowIssueModal(true)}
            >
              <Icon icon="lucide:plus-circle" width="14" />
              <span>Số phát hành mới</span>
            </Button>
          </div>
          <IssueTable issues={currentIssues} />
        </Col>
      </Row>

      {/* TOÀN BỘ HỆ THỐNG MODAL ĐIỀU KHIỂN BIẾN ĐỘNG STATE TẠI TRANG */}
      <SwitchJournalModal
        show={showSwitchModal}
        handleClose={() => setShowSwitchModal(false)}
      />
      <CreateVolumeModal
        show={showVolumeModal}
        handleClose={() => setShowVolumeModal(false)}
      />
      <CreateIssueModal
        show={showIssueModal}
        handleClose={() => setShowIssueModal(false)}
      />
    </Container>
  );
}
