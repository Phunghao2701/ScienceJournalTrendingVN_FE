import { Routes, Route } from 'react-router-dom';

import LandingPage from '../../features/landing/pages/LandingPage';
import JournalDetailPage from '../../features/journal/pages/JournalDetailPage';
import CatalogSearchPage from '../../features/catalog/pages/CatalogSearchPage';
import TrendingVNPage from '../../features/trendingVN/pages/TrendingVNPage';
import ArticleDetailPage from '../../features/article/pages/ArticleDetailPage';
import ArticleVisualDetailPage from '../../features/article/pages/ArticleVisualDetailPage';
import DashboardPage from '../../features/dashboard/pages/DashboardPage';

import RegisterPage from '../../features/auth/pages/RegisterPage';
import LoginPage from '../../features/auth/pages/LoginPage';
import ProfilePage from '../../features/profile/pages/ProfilePage';
import VerifyEmailPage from '../../features/auth/pages/VerifyEmailPage';

import ProtectedRoute from './ProtectedRoute';
import AdminRoute from './AdminRoute';
import PublicRoute from './PublicRoute';
import AuthLayoutWithUser from '../layouts/AuthLayoutWithUser';

import ProjectListPage from '../../features/project/pages/ProjectListPage';
import CreateProjectPage from '../../features/project/pages/CreateProjectPage';
import EditProjectPage from '../../features/project/pages/EditProjectPage';
import ProjectDetailPage from '../../features/project/pages/ProjectDetailPage';

import AdminLayout from '../layouts/AdminLayout';
import UserDirectoryPage from '../../features/admin/pages/account/UserDirectoryPage';
import AddNewAccountPage from '../../features/admin/pages/account/AddNewAccountPage';
import UpdateUserAccountPage from '../../features/admin/pages/account/UpdateUserAccountPage';
import SubmitArticlePage from '../../features/admin/pages/article-submission/SubmitArticlePage';

import {
  KeywordListPage,
  KeywordArticlesPage,
} from '../../features/keywords';

import AuthorLeaderboardPage from '../../features/author/pages/AuthorLeaderboardPage';
import AuthorDetailPage from '../../features/author/pages/AuthorDetailPage';
import AuthorListPage from '../../features/author/pages/AuthorListPage';

import TopicDetailPage from '../../features/topic/pages/TopicDetailPage';
import AdminDashboardPage from '../../features/admin/pages/AdminDashboardPage';
import UpdateArticlePage from '../../features/admin/pages/UpdateArticlePage';
import ArticleRepositoryPage from '../../features/admin/pages/ArticleRepositoryPage';

import ForgotPasswordPage from '../../features/auth/pages/ForgotPasswordPage';
import ResetPasswordPage from '../../features/auth/pages/ResetPasswordPage';

import GeographyPage from '../../features/zone/pages/GeographyPage';

import JournalDirectoryPage from '../../features/admin/pages/JournalDirectoryPage';
import RepositoryManagementPage from '../../features/admin/pages/RepositoryManagementPage';
import EditJournalPage from '../../features/admin/pages/EditJournalPage';
import VolumeArchivePage from '../../features/admin/pages/VolumeArchivePage';

// Trang Theo dõi Xu hướng Nghiên cứu (TrendingVN)
import TrendingPage from '../../features/trendingVN/pages/TrendingPage';

/**
 * Nơi khai báo route chính của ứng dụng.
 *
 * Chính sách hiện tại:
 * - Các trang khám phá dữ liệu/bài báo cho phép guest truy cập công khai.
 * - Login/Register sử dụng PublicRoute.
 * - Dashboard yêu cầu đăng nhập.
 */
export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />

      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/authors/leaderboard" element={<AuthorLeaderboardPage />} />
      </Route>

      <Route element={<PublicRoute />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      {/* Routes sử dụng layout chung */}
      <Route element={<AuthLayoutWithUser />}>

        {/* Tuyến đường yêu cầu đăng nhập */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<DashboardPage />} />

          <Route path="/projects" element={<ProjectListPage />} />
          <Route path="/projects/create" element={<CreateProjectPage />} />
          <Route path="/projects/:id/edit" element={<EditProjectPage />} />
          <Route path="/projects/:id" element={<ProjectDetailPage />} />

          <Route path="/authors/leaderboard" element={<AuthorLeaderboardPage />} />

          {/* Admin layouts & pages */}
          <Route element={<AdminRoute />}>
            <Route element={<AdminLayout />}>
              <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
              <Route path="/admin/users" element={<UserDirectoryPage />} />
              <Route path="/admin/users/create" element={<AddNewAccountPage />} />
              <Route path="/admin/users/:id/edit" element={<UpdateUserAccountPage />} />

              <Route path="/admin/articles" element={<ArticleRepositoryPage />} />
              <Route path="/admin/articles/create" element={<SubmitArticlePage />} />
              <Route path="/admin/articles/:id" element={<UpdateArticlePage />} />

              <Route path="/admin/journals" element={<JournalDirectoryPage />} />
              <Route path="/admin/journals/repository" element={<RepositoryManagementPage />} />
              <Route path="/admin/journals/archive" element={<VolumeArchivePage />} />
              <Route path="/admin/journals/:id/edit" element={<EditJournalPage />} />
            </Route>
          </Route>
        </Route>

        {/* Public pages inside layout */}
        <Route path="/search" element={<CatalogSearchPage />} />
        <Route path="/catalog" element={<CatalogSearchPage />} />

        <Route path="/articles" element={<TrendingVNPage />} />
        <Route path="/trending-vn" element={<TrendingVNPage />} />
        <Route path="/articles/:id" element={<ArticleDetailPage />} />
        <Route path="/articles/:id/visual" element={<ArticleVisualDetailPage />} />

        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/verify-email" element={<VerifyEmailPage />} />

        <Route path="/authors" element={<AuthorListPage />} />
        <Route path="/authors/:id" element={<AuthorDetailPage />} />

        <Route path="/journals/:id" element={<JournalDetailPage />} />

        <Route path="/keywords" element={<KeywordListPage />} />
        <Route path="/keywords/:keywordId/articles" element={<KeywordArticlesPage />} />

        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />

        <Route path="/geography" element={<GeographyPage />} />
        <Route path="/topics/:topicId" element={<TopicDetailPage />} />

        {/* Trang Theo dõi Xu hướng Nghiên cứu - public, không cần đăng nhập */}
        <Route path="/trending" element={<TrendingPage />} />

      </Route>

      <Route path="/topics/:topicId" element={<TopicDetailPage />} />

      {/* TODO: route tạm để preview UI không cần login.
          Xóa các route này khi vấn đề đăng nhập đã được xử lý xong. */}
      <Route element={<AdminLayout />}>
        <Route path="/admin-preview" element={<AdminDashboardPage />} />
        <Route path="/admin-preview/articles/:id" element={<UpdateArticlePage />} />
        <Route path="/admin-preview/journals" element={<JournalDirectoryPage />} />
        <Route path="/admin-preview/journals/repository" element={<RepositoryManagementPage />} />
        <Route path="/admin-preview/journals/archive" element={<VolumeArchivePage />} />
        <Route path="/admin-preview/journals/:id/edit" element={<EditJournalPage />} />
      </Route>

      {/* TODO: route tạm để preview TrendingVN không cần login */}
      <Route path="/trending-preview" element={<TrendingPage />} />

      <Route path="*" element={<LandingPage />} />
    </Routes>
  );
}