import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import PublicRoute from "./PublicRoute";
import AuthLayoutWithUser from "../layouts/AuthLayoutWithUser";
import ProjectWorkspaceLayout from "../../features/project/layouts/ProjectWorkspaceLayout";
import PageLoadingBar from "../../shared/components/PageLoadingBar";
import ScientificMathProvider from "../../shared/components/ScientificMathProvider";

// Route-level code splitting
const TrendingVNPage = lazy(() => import("../../features/trendingVN/pages/TrendingVNPage"));
const ArticleDetailPage = lazy(() => import("../../features/article/pages/ArticleDetailPage"));
const TrendingArticleDetailPage = lazy(() => import("../../features/trendingVN/pages/ArticleDetailPage"));
const InstitutionDetailPage = lazy(() => import("../../features/institution/pages/InstitutionDetailPage"));

const RegisterPage = lazy(() => import("../../features/auth/pages/RegisterPage"));
const LoginPage = lazy(() => import("../../features/auth/pages/LoginPage"));
const ProfilePage = lazy(() => import("../../features/profile/pages/ProfilePage"));
const VerifyEmailPage = lazy(() => import("../../features/auth/pages/VerifyEmailPage"));
const ForgotPasswordPage = lazy(() => import("../../features/auth/pages/ForgotPasswordPage"));
const ResetPasswordPage = lazy(() => import("../../features/auth/pages/ResetPasswordPage"));

const AuthorDetailPage = lazy(() => import("../../features/author/pages/AuthorDetailPage"));
const AuthorListPage = lazy(() => import("../../features/author/pages/AuthorListPage"));
const OrcidScanPage = lazy(() => import("../../features/orcid/pages/OrcidScanPage"));
const BookmarksPage = lazy(() => import("../../features/bookmark/pages/BookmarksPage"));

// Projects features
const ProjectListPage = lazy(() => import("../../features/project/pages/ProjectListPage"));
const CreateProjectPage = lazy(() => import("../../features/project/pages/CreateProjectPage"));
const EditProjectPage = lazy(() => import("../../features/project/pages/EditProjectPage"));
const ProjectDetailPage = lazy(() => import("../../features/project/pages/ProjectDetailPage"));

/**
 * Nơi khai báo route chính của ứng dụng với Route-level Code Splitting và Lazy MathJax.
 */
export default function AppRoutes() {
  return (
    <Suspense fallback={<PageLoadingBar />}>
      <Routes>
        <Route
          path="/"
          element={
            <ScientificMathProvider>
              <TrendingVNPage />
            </ScientificMathProvider>
          }
        />

        <Route element={<PublicRoute />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>

        {/* Routes sử dụng layout chung */}
        <Route element={<AuthLayoutWithUser />}>
          {/* 🔐 Tuyến đường yêu cầu bảo mật (Đã đăng nhập) */}
          <Route element={<ProtectedRoute />}>
            <Route path="/scan-orcid" element={<OrcidScanPage />} />
            <Route
              path="/bookmarks"
              element={
                <ScientificMathProvider>
                  <BookmarksPage />
                </ScientificMathProvider>
              }
            />
            <Route element={<ProjectWorkspaceLayout />}>
              <Route path="/projects" element={<ProjectListPage />} />
              <Route path="/projects/create" element={<CreateProjectPage />} />
              <Route path="/projects/:id/edit" element={<EditProjectPage />} />
              <Route path="/projects/:id" element={<ProjectDetailPage />} />
            </Route>
          </Route>

          {/* Public pages inside layout */}
          <Route
            path="/articles"
            element={
              <ScientificMathProvider>
                <TrendingVNPage />
              </ScientificMathProvider>
            }
          />
          <Route
            path="/trending-vn"
            element={
              <ScientificMathProvider>
                <TrendingVNPage />
              </ScientificMathProvider>
            }
          />
          <Route
            path="/articles/:id"
            element={
              <ScientificMathProvider>
                <ArticleDetailPage />
              </ScientificMathProvider>
            }
          />
          <Route
            path="/trending/articles/:id"
            element={
              <ScientificMathProvider>
                <TrendingArticleDetailPage />
              </ScientificMathProvider>
            }
          />

          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/verify-email" element={<VerifyEmailPage />} />

          <Route path="/authors" element={<AuthorListPage />} />
          <Route
            path="/authors/:id"
            element={
              <ScientificMathProvider>
                <AuthorDetailPage />
              </ScientificMathProvider>
            }
          />

          <Route path="/institutions/:id" element={<InstitutionDetailPage />} />

          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
        </Route>

        <Route
          path="*"
          element={
            <ScientificMathProvider>
              <TrendingVNPage />
            </ScientificMathProvider>
          }
        />
      </Routes>
    </Suspense>
  );
}
