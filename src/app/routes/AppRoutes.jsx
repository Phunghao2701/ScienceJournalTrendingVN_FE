import { Routes, Route } from 'react-router-dom';

// Core feature pages — all paths below are verified to exist in features/
import TrendingVNPage from '../../features/trendingVN/pages/TrendingVNPage';
import ArticleDetailPage from '../../features/article/pages/ArticleDetailPage';
import TrendingArticleDetailPage from '../../features/trendingVN/pages/ArticleDetailPage';
import ArticleVisualDetailPage from '../../features/article/pages/ArticleVisualDetailPage';
import JournalDetailPage from '../../features/journal/pages/JournalDetailPage';

import RegisterPage from '../../features/auth/pages/RegisterPage';
import LoginPage from '../../features/auth/pages/LoginPage';
import ProfilePage from '../../features/profile/pages/ProfilePage';
import VerifyEmailPage from '../../features/auth/pages/VerifyEmailPage';
import ForgotPasswordPage from '../../features/auth/pages/ForgotPasswordPage';
import ResetPasswordPage from '../../features/auth/pages/ResetPasswordPage';

import ProtectedRoute from './ProtectedRoute';
import PublicRoute from './PublicRoute';
import AuthLayoutWithUser from '../layouts/AuthLayoutWithUser';

import AuthorLeaderboardPage from '../../features/author/pages/AuthorLeaderboardPage';
import AuthorDetailPage from '../../features/author/pages/AuthorDetailPage';
import AuthorListPage from '../../features/author/pages/AuthorListPage';

import TopicDetailPage from '../../features/topic/pages/TopicDetailPage';

/**
 * Nơi khai báo route chính của ứng dụng.
 *
 * Chính sách hiện tại:
 * - Các trang khám phá dữ liệu/bài báo cho phép guest truy cập công khai.
 * - Login/Register sử dụng PublicRoute.
 */
export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<TrendingVNPage />} />

      <Route element={<PublicRoute />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      {/* Routes sử dụng layout chung */}
      <Route element={<AuthLayoutWithUser />}>

        {/* 🔐 Tuyến đường yêu cầu bảo mật (Đã đăng nhập) */}
        <Route element={<ProtectedRoute />}>
          <Route path="/authors/leaderboard" element={<AuthorLeaderboardPage />} />
        </Route>

        {/* Public pages inside layout */}
        <Route path="/articles" element={<TrendingVNPage />} />
        <Route path="/trending-vn" element={<TrendingVNPage />} />
        <Route path="/articles/:id" element={<ArticleDetailPage />} />
        <Route path="/trending/articles/:id" element={<TrendingArticleDetailPage />} />
        <Route path="/articles/:id/visual" element={<ArticleVisualDetailPage />} />

        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/verify-email" element={<VerifyEmailPage />} />

        <Route path="/authors" element={<AuthorListPage />} />
        <Route path="/authors/:id" element={<AuthorDetailPage />} />

        <Route path="/journals/:id" element={<JournalDetailPage />} />

        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />

        <Route path="/topics/:topicId" element={<TopicDetailPage />} />
      </Route>

      <Route path="/topics/:topicId" element={<TopicDetailPage />} />

      <Route path="*" element={<TrendingVNPage />} />
    </Routes>
  );
}