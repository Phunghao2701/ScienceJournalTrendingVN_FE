import React from 'react';
import { Outlet } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import AdminHeader from './AdminHeader';
import AdminFooter from './AdminFooter';
import '../../features/admin/admin.css';

/**
 * AdminLayout
 * Layout chính cho khu vực quản trị viên (Admin).
 * Hỗ trợ cả cơ chế lồng route của react-router-dom (Outlet) và cơ chế bọc component con (children).
 */
export default function AdminLayout({ children }) {
  return (
    <div className="admin-layout">
      {/* Sidebar điều hướng cố định bên trái */}
      <AdminSidebar />

      {/* Vùng nội dung chính bên phải */}
      <div className="admin-main">
        {/* Header trên cùng */}
        <AdminHeader />

        {/* Nội dung trang hiển thị ở giữa */}
        <main className="admin-content">
          {children || <Outlet />}
        </main>

        {/* Footer dưới cùng */}
        <AdminFooter />
      </div>
    </div>
  );
}

