/**
 * File source thuộc hệ thống FE ResearchPulse.
 *
 * File: features\landing\components\Header.jsx
 */
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useLocation } from "react-router-dom";
import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import NavDropdown from "react-bootstrap/NavDropdown";
import Button from "react-bootstrap/Button";
import Offcanvas from "react-bootstrap/Offcanvas";
import Dropdown from "react-bootstrap/Dropdown";
import Icon from "../../../shared/components/Icon";
import useAuth from "../../auth/hooks/useAuth";
import { useUserStore } from "../../../app/store/userStore";
import ROUTES from "../../../app/routes/routePaths";

export default function Header() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const pathname = location.pathname;
  const auth = useAuth?.() ?? { logout: () => {} };
  const { logout } = auth;
  const email = useUserStore((state) => state.email);
  const userRole = auth.user?.role;
  const accountManagementRoute = userRole === 'ADMINISTRATOR' ? ROUTES.ADMIN_USERS : ROUTES.PROFILE;
  const language = i18n.language || "vi";

  const [isScrolled, setIsScrolled] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const changeLanguage = (lang) => {
    i18n.changeLanguage(lang);
    localStorage.setItem("researchpulse_lang", lang);
  };

  const handleAuthLogin = () => {
    navigate(ROUTES.LOGIN);
  };
  const handleAuthRegister = () => {
    navigate(ROUTES.REGISTER);
  };

  return (
    <>
      <Navbar
        expand="md"
        fixed="top"
        className={`transition-all duration-300 py-3 ${
          isScrolled ? "sticky-scrolled" : "bg-transparent"
        }`}
        style={{
          borderBottom: isScrolled ? "none" : "1px solid var(--border)",
          background: isScrolled ? "var(--bg-card)" : "transparent",
          backdropFilter: isScrolled ? "blur(12px)" : "none",
        }}
      >
        <Container>
          {/* Logo Brand */}
          <Navbar.Brand
            onClick={() => navigate(ROUTES.HOME)}
            className="d-flex align-items-center text-main font-weight-bold"
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 800,
              cursor: "pointer",
            }}
          >
            <div
              className="d-flex align-items-center justify-content-center me-2"
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "8px",
                background: "var(--btn-dark)",
                boxShadow: "0 0 10px rgba(7, 26, 28, 0.15)",
              }}
            >
              <Icon icon="lucide:activity" className="text-white text-sm" />
            </div>
            ResearchPulse
          </Navbar.Brand>

          {/* Hamburger toggle for mobile */}
          <Navbar.Toggle
            aria-controls="basic-navbar-nav"
            onClick={() => setShowMobileMenu(true)}
            className="border-0 bg-transparent text-main p-0"
          >
            <Icon icon="lucide:menu" className="fs-3 text-main" />
          </Navbar.Toggle>

          {/* Desktop Navigation Link Items */}
          <Navbar.Collapse
            id="basic-navbar-nav"
            className="d-none d-md-flex justify-content-between align-items-center w-full"
          >
            <Nav className="mx-auto align-items-center" style={{ gap: "4px" }}>
              {/* Tổng quan */}
              <Nav.Link
                onClick={() => navigate(ROUTES.DASHBOARD)}
                className="px-3 py-1 text-sm font-semibold d-flex align-items-center gap-1"
                style={{
                  borderRadius: '6px',
                  backgroundColor: (pathname === ROUTES.DASHBOARD || pathname === ROUTES.GEOGRAPHY) ? 'var(--primary-light)' : 'transparent',
                  color: (pathname === ROUTES.DASHBOARD || pathname === ROUTES.GEOGRAPHY) ? 'var(--primary)' : 'var(--text-muted)',
                  border: (pathname === ROUTES.DASHBOARD || pathname === ROUTES.GEOGRAPHY) ? '1px solid var(--border)' : '1px solid transparent',
                  transition: 'all 0.2s',
                  fontWeight: (pathname === ROUTES.DASHBOARD || pathname === ROUTES.GEOGRAPHY) ? 700 : 500,
                }}
              >
                <Icon icon="lucide:layout-dashboard" width="14" />
                Tổng quan
              </Nav.Link>

              {/* Dự án */}
              <Nav.Link
                onClick={() => navigate(ROUTES.PROJECTS)}
                className="px-3 py-1 text-sm font-semibold d-flex align-items-center gap-1"
                style={{
                  borderRadius: "6px",
                  backgroundColor:
                    pathname.startsWith(ROUTES.PROJECTS)
                      ? "var(--primary-light)"
                      : "transparent",
                  color:
                    pathname.startsWith(ROUTES.PROJECTS)
                      ? "var(--primary)"
                      : "var(--text-muted)",
                  border:
                    pathname.startsWith(ROUTES.PROJECTS)
                      ? "1px solid var(--border)"
                      : "1px solid transparent",
                  transition: "all 0.2s",
                  fontWeight: pathname.startsWith(ROUTES.PROJECTS) ? 700 : 500,
                }}
              >
                <Icon icon="lucide:folder" width="14" />
                Dự án
              </Nav.Link>
              {/* Tìm kiếm */}
              <Nav.Link
                onClick={() => navigate(ROUTES.CATALOG)}
                className="px-3 py-1 text-sm font-semibold d-flex align-items-center gap-1"
                style={{
                  borderRadius: "6px",
                  backgroundColor:
                    pathname.startsWith(ROUTES.CATALOG) ||
                    pathname.startsWith(ROUTES.SEARCH)
                      ? "var(--primary-light)"
                      : "transparent",
                  color:
                    pathname.startsWith(ROUTES.CATALOG) ||
                    pathname.startsWith(ROUTES.SEARCH)
                      ? "var(--primary)"
                      : "var(--text-muted)",
                  border:
                    pathname.startsWith(ROUTES.CATALOG) ||
                    pathname.startsWith(ROUTES.SEARCH)
                      ? "1px solid var(--border)"
                      : "1px solid transparent",
                  transition: "all 0.2s",
                  fontWeight:
                    pathname.startsWith(ROUTES.CATALOG) ||
                    pathname.startsWith(ROUTES.SEARCH)
                      ? 700
                      : 500,
                }}
              >
                <Icon icon="lucide:search" width="14" />
                {t("search")}
              </Nav.Link>

              {/* Bài báo */}
              <Nav.Link
                onClick={() => navigate(ROUTES.ARTICLES)}
                className="px-3 py-1 text-sm font-semibold d-flex align-items-center gap-1"
                style={{
                  borderRadius: "6px",
                  backgroundColor: pathname.startsWith(ROUTES.ARTICLES)
                    ? "var(--primary-light)"
                    : "transparent",
                  color: pathname.startsWith(ROUTES.ARTICLES)
                    ? "var(--primary)"
                    : "var(--text-muted)",
                  border: pathname.startsWith(ROUTES.ARTICLES)
                    ? "1px solid var(--border)"
                    : "1px solid transparent",
                  transition: "all 0.2s",
                  fontWeight: pathname.startsWith(ROUTES.ARTICLES) ? 700 : 500,
                }}
              >
                <Icon icon="lucide:file-text" width="14" />
                Bài báo
              </Nav.Link>

              {/* Tác Giả */}
              <Nav.Link
                onClick={() => navigate(ROUTES.AUTHORS)}
                className="px-3 py-1 text-sm font-semibold d-flex align-items-center gap-1"
                style={{
                  borderRadius: "6px",
                  backgroundColor:
                    pathname.startsWith(ROUTES.AUTHORS) ? "var(--primary-light)" : "transparent",
                  color:
                    pathname.startsWith(ROUTES.AUTHORS) ? "var(--primary)" : "var(--text-muted)",
                  border: pathname.startsWith(ROUTES.AUTHORS)
                    ? "1px solid var(--border)"
                    : "1px solid transparent",
                  transition: "all 0.2s",
                  fontWeight: pathname.startsWith(ROUTES.AUTHORS) ? 700 : 500,
                }}
              >
                <Icon icon="lucide:file-text" width="14" />
                Tác Giả
              </Nav.Link>

            </Nav>

            <div className="d-flex align-items-center gap-3">
              {/* (Compact) Language selector moved to the far right below */}

              {/* Theme Toggle Sun/Moon Icon */}
              <div
                className="text-muted-custom hover:text-main"
                style={{ cursor: "pointer" }}
                onClick={() =>
                  alert("Đang áp dụng giao diện sáng của ResearchPulse")
                }
              >
                <Icon icon="lucide:sun" width="18" className="text-warning" />
              </div>

              {/* Notification icon */}
              {email && (
                <div
                  className="text-muted-custom hover:text-main position-relative"
                  style={{ cursor: "pointer" }}
                >
                  <Icon icon="lucide:bell" width="18" />
                  <span className="position-absolute top-0 start-100 translate-middle p-1 bg-danger border border-light rounded-circle">
                    <span className="visually-hidden">New alerts</span>
                  </span>
                </div>
              )}

              {/* User Authentication Display/Buttons */}
              {email ? (
                <Dropdown align="end">
                  <Dropdown.Toggle
                    as="div"
                    className="d-flex align-items-center justify-content-center text-white"
                    style={{
                      width: "32px",
                      height: "32px",
                      borderRadius: "50%",
                      background: "var(--primary)",
                      boxShadow: "0 0 8px rgba(255, 122, 51, 0.2)",
                      cursor: "pointer",
                      transition: "transform 0.15s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "scale(1.05)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "scale(1)";
                    }}
                  >
                    <Icon icon="lucide:user" width="16" />
                  </Dropdown.Toggle>

                  <Dropdown.Menu
                    className="border-0 shadow-sm mt-2"
                    style={{
                      minWidth: "180px",
                      "--bs-dropdown-link-active-bg": "rgba(0, 0, 0, 0.06)",
                      "--bs-dropdown-link-active-color": "var(--text-main)",
                      "--bs-dropdown-link-hover-bg": "rgba(0, 0, 0, 0.04)",
                      "--bs-dropdown-link-hover-color": "var(--text-main)",
                    }}
                  >
                    <div className="px-3 py-2 text-xs font-bold text-main border-bottom pb-2 mb-1">
                      Người dùng
                      <div
                        className="text-muted-custom font-normal mt-0.5 text-truncate"
                        style={{ fontSize: "10px", color: "var(--text-muted)" }}
                      >
                        {email}
                      </div>
                    </div>
                    <Dropdown.Item
                      onClick={() => navigate(ROUTES.DASHBOARD)}
                      className="d-flex align-items-center gap-2 text-xs py-2 text-main"
                    >
                      <Icon
                        icon="lucide:layout-dashboard"
                        width="14"
                        className="text-muted-custom"
                      />
                      <span>Bảng điều khiển</span>
                    </Dropdown.Item>
                    <Dropdown.Item
                      onClick={() => navigate(accountManagementRoute)}
                      className="d-flex align-items-center gap-2 text-xs py-2 text-main"
                    >
                      <Icon
                        icon="lucide:users"
                        width="14"
                        className="text-muted-custom"
                      />
                      <span>Quản trị tài khoản</span>
                    </Dropdown.Item>
                    <Dropdown.Item
                      onClick={logout}
                      className="d-flex align-items-center gap-2 text-xs py-2 text-danger"
                    >
                      <Icon icon="lucide:log-out" width="14" />
                      <span>Đăng xuất</span>
                    </Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              ) : (
                <>
                  <Button
                    variant="link"
                    className="text-muted-custom hover:text-main text-xs font-semibold text-decoration-none"
                    onClick={handleAuthLogin}
                  >
                    {t("signIn")}
                  </Button>
                  <Button
                    className="btn-primary-glow rounded-pill px-4 py-2 text-xs font-bold"
                    onClick={handleAuthRegister}
                  >
                    {t("signUp")}
                  </Button>
                </>
              )}
              {/* Compact language icon on the far right */}
              <NavDropdown
                title={
                  <Icon
                    icon="lucide:globe"
                    width="18"
                    className="text-muted-custom"
                  />
                }
                id="language-nav-compact"
                align="end"
                className="bg-transparent border-0"
              >
                <NavDropdown.Item
                  onClick={() => changeLanguage("vi")}
                  className={`d-flex align-items-center justify-content-between text-xs py-2 ${
                    language.startsWith("vi") ? "text-primary" : "text-dark"
                  }`}
                >
                  <span>Tiếng Việt</span>
                  {language.startsWith("vi") && (
                    <Icon
                      icon="lucide:check"
                      className="text-primary text-xs ms-2"
                    />
                  )}
                </NavDropdown.Item>
                <NavDropdown.Item
                  onClick={() => changeLanguage("en")}
                  className={`d-flex align-items-center justify-content-between text-xs py-2 ${
                    language.startsWith("en") ? "text-primary" : "text-dark"
                  }`}
                >
                  <span>English</span>
                  {language.startsWith("en") && (
                    <Icon
                      icon="lucide:check"
                      className="text-primary text-xs ms-2"
                    />
                  )}
                </NavDropdown.Item>
              </NavDropdown>
            </div>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      {/* Mobile Menu Drawer (Offcanvas) */}
      <Offcanvas
        show={showMobileMenu}
        onHide={() => setShowMobileMenu(false)}
        placement="end"
        className="bg-white text-dark border-start border-light"
        style={{
          width: "280px",
          backgroundColor: "var(--bg-card)",
          color: "var(--text-main)",
        }}
      >
        <Offcanvas.Header
          closeButton
          closeVariant="dark"
          className="border-bottom border-light py-4"
        >
          <Offcanvas.Title
            className="d-flex align-items-center text-main"
            style={{ fontFamily: "var(--font-display)", fontWeight: 800 }}
          >
            <div
              className="d-flex align-items-center justify-content-center me-2"
              style={{
                width: "28px",
                height: "28px",
                borderRadius: "6px",
                background: "var(--btn-dark)",
              }}
            >
              <Icon icon="lucide:activity" className="text-white text-xs" />
            </div>
            ResearchPulse
          </Offcanvas.Title>
        </Offcanvas.Header>

        <Offcanvas.Body className="d-flex flex-column justify-content-between py-4">
          <Nav className="flex-column gap-3 mb-4">
            <Nav.Link
              onClick={() => {
                setShowMobileMenu(false);
                navigate(ROUTES.DASHBOARD);
              }}
              className="text-muted-custom hover:text-main py-2 text-sm font-semibold border-bottom border-light"
            >
              Tổng quan
            </Nav.Link>
            <Nav.Link
              onClick={() => {
                setShowMobileMenu(false);
                navigate(ROUTES.PROJECTS);
              }}
              className="text-muted-custom hover:text-main py-2 text-sm font-semibold border-bottom border-light"
              style={{
                color: pathname.startsWith(ROUTES.PROJECTS)
                  ? "var(--primary)"
                  : "var(--text-muted)",
                fontWeight: pathname.startsWith(ROUTES.PROJECTS) ? 700 : 600,
              }}
            >
              Dự án
            </Nav.Link>
            <Nav.Link
              onClick={() => {
                setShowMobileMenu(false);
                navigate(ROUTES.CATALOG);
              }}
              className="text-muted-custom hover:text-main py-2 text-sm font-semibold border-bottom border-light"
            >
              {t("search")}
            </Nav.Link>
            <Nav.Link
              onClick={() => {
                setShowMobileMenu(false);
                navigate(ROUTES.ARTICLES);
              }}
              className="text-muted-custom hover:text-main py-2 text-sm font-semibold border-bottom border-light"
              style={{
                color: pathname.startsWith(ROUTES.ARTICLES)
                  ? "var(--primary)"
                  : "var(--text-muted)",
                fontWeight: pathname.startsWith(ROUTES.ARTICLES) ? 700 : 600,
              }}
            >
              Bài báo
            </Nav.Link>
          </Nav>

          <div className="d-flex flex-column gap-3">
            {/* Mobile Language Switches */}
            <div className="d-flex align-items-center justify-content-center gap-4 py-2 border-top border-bottom border-light mb-2">
              <Button
                variant="link"
                onClick={() => changeLanguage("vi")}
                className={`text-decoration-none text-xs font-bold p-0 ${
                  language.startsWith("vi")
                    ? "text-primary"
                    : "text-muted-custom"
                }`}
              >
                Tiếng Việt
              </Button>
              <span className="text-muted-custom">|</span>
              <Button
                variant="link"
                onClick={() => changeLanguage("en")}
                className={`text-decoration-none text-xs font-bold p-0 ${
                  language.startsWith("en")
                    ? "text-primary"
                    : "text-muted-custom"
                }`}
              >
                English
              </Button>
            </div>

            {/* Mobile Auth options */}
            {email ? (
              <div className="d-flex flex-column gap-3">
                <Button
                  variant="outline-primary"
                  className="w-100 rounded-pill py-2.5 text-xs font-bold"
                  onClick={() => {
                    setShowMobileMenu(false);
                    navigate(ROUTES.DASHBOARD);
                  }}
                >
                  <Icon icon="lucide:layout-dashboard" className="me-1" />
                  {language.startsWith("vi")
                    ? "Bảng điều khiển"
                    : "Go to Dashboard"}
                </Button>
                <div
                  className="d-flex align-items-center justify-content-center gap-2 p-2.5 rounded-3 border"
                  style={{ background: "#f8fafc" }}
                >
                  <div
                    className="d-flex align-items-center justify-content-center text-white"
                    style={{
                      width: "28px",
                      height: "28px",
                      borderRadius: "50%",
                      background: "var(--primary)",
                      boxShadow: "0 0 6px rgba(255, 122, 51, 0.15)",
                    }}
                  >
                    <Icon icon="lucide:user" width="14" />
                  </div>
                  <div className="text-start">
                    <div
                      className="text-xs text-main font-bold"
                      style={{ lineHeight: "1.2" }}
                    >
                      Người dùng
                    </div>
                    <div
                      className="text-xxs text-muted"
                      style={{ fontSize: "9px", marginTop: "1px" }}
                    >
                      {email}
                    </div>
                  </div>
                </div>
                <Button
                  variant="outline-danger"
                  className="w-100 rounded-pill py-2 text-xs font-bold"
                  onClick={() => {
                    logout();
                    setShowMobileMenu(false);
                  }}
                >
                  {language.startsWith("vi") ? "Đăng xuất" : "Sign Out"}
                </Button>
              </div>
            ) : (
              <div className="d-flex flex-column gap-2">
                <Button
                  variant="outline-secondary"
                  className="w-100 rounded-pill py-2.5 text-xs text-main border-secondary hover:bg-light"
                  onClick={() => {
                    setShowMobileMenu(false);
                    handleAuthLogin();
                  }}
                >
                  {t("signIn")}
                </Button>
                <Button
                  className="btn-primary-glow w-100 rounded-pill py-2.5 text-xs font-bold"
                  onClick={() => {
                    setShowMobileMenu(false);
                    handleAuthRegister();
                  }}
                >
                  {t("signUp")}
                </Button>
              </div>
            )}
          </div>
        </Offcanvas.Body>
      </Offcanvas>
    </>
  );
}
