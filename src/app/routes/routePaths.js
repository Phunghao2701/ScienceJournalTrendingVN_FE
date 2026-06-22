/**
 * File: app/routes/routePaths.js
 * Danh sách tập trung tất cả các đường dẫn định tuyến (routes) trong hệ thống ResearchPulse.
 * Tránh việc hardcode các chuỗi URL liên kết tĩnh giúp bảo trì và cấu hình dễ dàng hơn.
 */
const ROUTES = {
  // Trang chủ
  HOME:                  "/",

  // Xác thực người dùng
  LOGIN:                 "/login",
  REGISTER:              "/register",
  VERIFY_EMAIL:          "/verify-email",
  FORGOT_PASSWORD:       "/forgot-password",
  RESET_PASSWORD:        "/reset-password",

  // Tổng quan & Bản đồ phân bố địa lý
  DASHBOARD:             "/dashboard",
  GEOGRAPHY:             "/geography",

  // Quản lý Dự án (Project)
  PROJECTS:              "/projects",
  PROJECT_CREATE:        "/projects/create",
  PROJECT_EDIT:          "/projects/:id/edit",
  PROJECT_DETAIL:        "/projects/:id",

  // Tác giả (Author)
  AUTHORS:               "/authors",
  AUTHORS_LEADERBOARD:   "/authors/leaderboard",
  AUTHOR_DETAIL:         "/authors/:id",

  // Quản trị người dùng (Admin)
  ADMIN_USERS:           "/admin/users",
  ADMIN_USERS_CREATE:    "/admin/users/create",
  ADMIN_USERS_EDIT:      "/admin/users/:id/edit",

  // Tuyến đường quản trị bài viết khoa học & Tạp chí (Admin Dashboard, Update Article, Journals Directory...)
  ADMIN_DASHBOARD:       "/admin/dashboard",
  ADMIN_ARTICLES:        "/admin/articles",
  ADMIN_ARTICLE_CREATE:  "/admin/articles/create",
  ADMIN_ARTICLE_EDIT:    "/admin/articles/:id",
  ADMIN_JOURNALS:        "/admin/journals",
  ADMIN_REPOSITORY:      "/admin/journals/repository",
  ADMIN_JOURNAL_ARCHIVE: "/admin/journals/archive",
  ADMIN_JOURNAL_EDIT:    "/admin/journals/:id/edit",

  // Bài báo (Article)
  ARTICLES:              "/articles",
  ARTICLE_SUBMIT:        "/admin/articles/create",
  ARTICLE_DETAIL:        "/articles/:id",
  ARTICLE_VISUAL_DETAIL: "/articles/:id/visual",

  // Hồ sơ cá nhân
  PROFILE:               "/profile",

  // Tìm kiếm & Danh mục tạp chí
  CATALOG:               "/catalog",
  SEARCH:                "/search",
  JOURNALS:              "/journals/:id",

  // Từ khóa (Keyword)
  KEYWORDS:              "/keywords",
  KEYWORD_ARTICLES:      "/keywords/:keywordId/articles",

  // Chủ đề (Topic)
  TOPIC_DETAIL:          "/topics/:topicId",
};

export default ROUTES;