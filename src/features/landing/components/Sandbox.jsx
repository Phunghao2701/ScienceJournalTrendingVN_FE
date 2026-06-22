/**
 * File source thuộc hệ thống FE ResearchPulse.
 *
 * File: features\landing\components\Sandbox.jsx
 */
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import Container from "react-bootstrap/Container";
import Form from "react-bootstrap/Form";
import InputGroup from "react-bootstrap/InputGroup";
import Button from "react-bootstrap/Button";
import Spinner from "react-bootstrap/Spinner";
import Icon from "../../../shared/components/Icon";
import useSandboxSearch from "../hooks/useSandboxSearch";

const typeConfig = {
  JOURNAL: {
    labelKey: "typeJournal",
    icon: "lucide:book-open",
    variant: "primary",
    textColor: "#3b82f6",
    bgColor: "rgba(59, 130, 246, 0.1)",
    borderColor: "rgba(59, 130, 246, 0.2)",
  },
  AUTHOR: {
    labelKey: "typeAuthor",
    icon: "lucide:user",
    variant: "secondary",
    textColor: "#a855f7",
    bgColor: "rgba(168, 85, 247, 0.1)",
    borderColor: "rgba(168, 85, 247, 0.2)",
  },
  ARTICLE: {
    labelKey: "typeArticle",
    icon: "lucide:file-text",
    variant: "success",
    textColor: "#10b981",
    bgColor: "rgba(16, 185, 129, 0.1)",
    borderColor: "rgba(16, 185, 129, 0.2)",
  },
  KEYWORD: {
    labelKey: "typeKeyword",
    icon: "lucide:hash",
    variant: "warning",
    textColor: "#f59e0b",
    bgColor: "rgba(245, 158, 11, 0.1)",
    borderColor: "rgba(245, 158, 11, 0.2)",
  },
  AREA: {
    labelKey: "typeArea",
    icon: "lucide:layers",
    variant: "danger",
    textColor: "#ec4899",
    bgColor: "rgba(236, 72, 153, 0.1)",
    borderColor: "rgba(236, 72, 153, 0.2)",
  },
  CATEGORY: {
    labelKey: "typeCategory",
    icon: "lucide:tag",
    variant: "info",
    textColor: "#6366f1",
    bgColor: "rgba(99, 102, 241, 0.1)",
    borderColor: "rgba(99, 102, 241, 0.2)",
  },
};

const defaultType = {
  labelKey: "search",
  icon: "lucide:help-circle",
  variant: "dark",
  textColor: "#94a3b8",
  bgColor: "rgba(148, 163, 184, 0.1)",
  borderColor: "rgba(148, 163, 184, 0.2)",
};

export default function Sandbox() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const {
    searchValue,
    setSearchValue,
    isLoading,
    searchResult,
    error,
    handleTagClick,
    handleSearchSubmit,
  } = useSandboxSearch();

  const tags = [
    "LLM",
    "RAG",
    "Transformer",
    "Computer Vision",
    "Reinforcement Learning",
  ];

  return (
    <section id="search-sandbox" className="py-5 bg-dark-bg position-relative">
      <Container style={{ maxWidth: "960px" }}>
        {/* Glowing border card container */}
        <div
          className="p-1 rounded-5"
          style={{
            background:
              "linear-gradient(135deg, var(--primary-light) 0%, rgba(255, 255, 255, 0.5) 50%, var(--primary-light) 100%)",
            boxShadow: "0 15px 45px rgba(255, 122, 51, 0.05)",
          }}
        >
          {/* Card Body */}
          <div
            className="rounded-5 py-5 px-4 p-sm-5 text-center position-relative overflow-hidden"
            style={{ backgroundColor: "var(--bg-card)", zIndex: 1 }}
          >
            {/* Header label */}
            <div
              className="d-inline-flex align-items-center gap-2 mb-4 text-xs font-bold tracking-wider text-uppercase"
              style={{ fontSize: "0.75rem", color: "var(--primary)" }}
            >
              <Icon
                icon="lucide:sparkle"
                className="animate-spin-slow"
                style={{ color: "var(--primary)" }}
              />
              <span>{t("sandboxTitle")}</span>
            </div>

            {/* Form */}
            <Form
              onSubmit={handleSearchSubmit}
              className="mx-auto mb-4"
              style={{ maxWidth: "720px" }}
            >
              <InputGroup
                size="lg"
                className="rounded-pill overflow-hidden p-1 align-items-center"
                style={{ backgroundColor: "var(--bg-chip)" }}
              >
                <span
                  className="bg-transparent border-0 px-3 d-flex align-items-center justify-content-center"
                  style={{ color: "var(--text-muted)" }}
                >
                  <Icon icon="lucide:search" className="fs-5" />
                </span>

                <Form.Control
                  type="text"
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  placeholder={t("sandboxPlaceholder")}
                  className="bg-transparent border-0 shadow-none fs-6 py-2.5"
                  style={{
                    color: "var(--text-main)",
                    backgroundColor: "transparent",
                  }}
                />

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="btn-primary-glow rounded-pill px-4 py-2 text-xs font-bold border-0 d-flex align-items-center gap-2 me-1"
                  style={{ fontSize: "0.8rem" }}
                >
                  {isLoading ? (
                    <>
                      <Spinner
                        animation="border"
                        size="sm"
                        role="status"
                        aria-hidden="true"
                      />
                      <span>...</span>
                    </>
                  ) : (
                    <>
                      <span>{t("searchBtn")}</span>
                      <Icon icon="lucide:arrow-right" className="fs-6" />
                    </>
                  )}
                </Button>
              </InputGroup>
            </Form>

            {/* Tag suggestions */}
            <div
              className="d-flex flex-column flex-sm-row align-items-center justify-content-center gap-3 mx-auto"
              style={{ maxWidth: "800px" }}
            >
              <span
                className="text-muted-custom font-bold tracking-wider text-uppercase d-flex align-items-center gap-1"
                style={{ fontSize: "0.7rem" }}
              >
                <Icon icon="lucide:sliders" style={{ fontSize: "0.65rem" }} />
                <span>{t("tryNowLabel")}</span>
              </span>
              <div className="d-flex flex-wrap justify-content-center gap-2">
                {tags.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => handleTagClick(tag)}
                    className="px-3 py-1.5 rounded-pill sandbox-tag text-xs font-semibold btn btn-sm"
                    style={{
                      fontSize: "0.75rem",
                      transition: "all 0.2s ease",
                    }}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Interactive Mock Results */}
            {isLoading && (
              <div
                className="mt-4 mx-auto p-4 rounded-4 d-flex align-items-center justify-content-center gap-2 text-muted-custom"
                style={{
                  maxWidth: "600px",
                  backgroundColor: "var(--bg-chip)",
                  fontSize: "0.85rem",
                }}
              >
                <Icon
                  icon="lucide:database"
                  className="animate-bounce fs-5"
                  style={{ color: "var(--primary)" }}
                />
                <span>Analyzing publications databases...</span>
              </div>
            )}

            {error && (
              <div
                className="mt-4 mx-auto p-4 rounded-4 text-start"
                style={{
                  maxWidth: "600px",
                  backgroundColor: "rgba(220, 53, 69, 0.05)",
                }}
              >
                <div className="d-flex align-items-start gap-3 text-danger">
                  <Icon icon="lucide:alert-circle" className="fs-4 mt-1" />
                  <div>
                    <h5 className="font-bold text-main text-sm m-0">
                      API Error
                    </h5>
                    <p
                      className="text-muted-custom mt-1 mb-0"
                      style={{ fontSize: "0.75rem" }}
                    >
                      {error}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {searchResult && (
              <div
                className="mt-4 mx-auto p-4 rounded-4 text-start"
                style={{
                  maxWidth: "600px",
                  backgroundColor: "var(--bg-card)",
                  boxShadow: "0 8px 32px rgba(0, 0, 0, 0.05)",
                }}
              >
                <div
                  className="d-flex align-items-center justify-content-between mb-3 pb-2"
                  style={{ borderBottom: "1px solid var(--border)" }}
                >
                  <div className="d-flex align-items-center gap-2">
                    <div
                      className="rounded-circle animate-pulse"
                      style={{
                        width: "8px",
                        height: "8px",
                        backgroundColor: searchResult.isRealData
                          ? "#198754"
                          : "#ffc107",
                      }}
                    />
                    <span
                      className="font-bold tracking-wider text-uppercase"
                      style={{
                        fontSize: "0.65rem",
                        color: searchResult.isRealData ? "#198754" : "#ffc107",
                      }}
                    >
                      {searchResult.isRealData
                        ? t("realData")
                        : "Offline Demo Data"}
                    </span>
                  </div>
                  <span
                    className="text-muted-custom"
                    style={{ fontSize: "0.7rem" }}
                  >
                    {searchResult.isRealData
                      ? t("sourceLiveApi")
                      : "Simulated Sandbox"}
                  </span>
                </div>

                <h4
                  className="font-display font-bold text-main mb-3"
                  style={{ fontSize: "1.05rem" }}
                >
                  {t("resultsFor")} "
                  <span style={{ color: "var(--primary)" }}>
                    {searchResult.keyword}
                  </span>
                  "
                </h4>

                {searchResult.items && searchResult.items.length > 0 ? (
                  <div
                    className="d-flex flex-column gap-2 overflow-y-auto pr-1 custom-scrollbar"
                    style={{ maxHeight: "380px" }}
                  >
                    {searchResult.items.map((item, index) => {
                      const cfg = typeConfig[item.type] || defaultType;
                      return (
                        <div
                          key={item.id || index}
                          className="d-flex align-items-center justify-content-between p-3 rounded-3 transition-all"
                          style={{
                            backgroundColor: "var(--bg-chip)",
                            transition: "all 0.2s ease",
                            cursor:
                              item.type === "JOURNAL" ||
                              item.type === "AUTHOR" ||
                              item.type === "ARTICLE" ||
                              item.type === "KEYWORD"
                                ? "pointer"
                                : "default",
                          }}
                          onClick={() => {
                            if (item.type === "JOURNAL") {
                              navigate(`/journals/${item.id}`);
                            }
                            if (item.type === "AUTHOR") {
                              navigate(`/authors/${item.id}`);
                            }
                            if (item.type === "ARTICLE") {
                              navigate(`/articles/${item.id}/visual`);
                            }
                            if (item.type === "KEYWORD") {
                              navigate(`/keywords/${item.id}`);
                            }
                          }}
                          onMouseEnter={(e) => {
                            if (item.type === "JOURNAL") {
                              e.currentTarget.style.backgroundColor =
                                "var(--primary-light)";
                            } else {
                              e.currentTarget.style.backgroundColor =
                                "rgba(255, 122, 51, 0.05)";
                            }
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor =
                              "var(--bg-chip)";
                          }}
                        >
                          <div
                            className="d-flex align-items-center gap-3 text-truncate"
                            style={{ flex: "1 1 auto", minWidth: 0 }}
                          >
                            <div
                              className="p-2 rounded-3 d-flex align-items-center justify-content-center"
                              style={{
                                color: cfg.textColor,
                                backgroundColor: cfg.bgColor,
                              }}
                            >
                              <Icon icon={cfg.icon} className="fs-5" />
                            </div>
                            <span
                              className="font-medium text-main text-sm text-truncate"
                              style={{
                                fontSize: "0.875rem",
                                maxWidth: "360px",
                              }}
                            >
                              {item.name}
                            </span>
                          </div>
                          <span
                            style={{
                              backgroundColor: ["KEYWORD", "AUTHOR", "ARTICLE", "JOURNAL"].includes(item.type)
                                ? cfg.bgColor
                                : "transparent",
                              color: ["KEYWORD", "AUTHOR", "ARTICLE", "JOURNAL"].includes(item.type)
                                ? "#000000"
                                : cfg.textColor,
                              border: ["KEYWORD", "AUTHOR", "ARTICLE", "JOURNAL"].includes(item.type)
                                ? "none"
                                : `1px solid ${cfg.borderColor}`,
                              fontSize: "0.65rem",
                              fontWeight: 700,
                              textTransform: "uppercase",
                              letterSpacing: "0.05em",
                              padding: "0.35em 0.65em",
                              flexShrink: 0,
                            }}
                          >
                            {t(cfg.labelKey)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="d-flex flex-column align-items-center justify-content-center py-5 text-center text-muted-custom">
                    <Icon
                      icon="lucide:search-x"
                      className="fs-1 text-muted-custom mb-2"
                    />
                    <p className="text-sm m-0" style={{ fontSize: "0.85rem" }}>
                      {t("noResults")}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </Container>
    </section>
  );
}
