import React from 'react';
import { Modal, Form } from 'react-bootstrap';
import { Icon } from '@iconify/react';
import { useTranslation } from 'react-i18next';

export default function TrendingExportModal({
  show,
  onHide,
  onSubmit,
  exportDocCount,
  setExportDocCount,
  articlesCount,
  exportFormat,
  setExportFormat,
  exportFields,
  setExportFields,
  exportFileName,
  setExportFileName,
}) {
  const { t } = useTranslation();

  return (
    <Modal
      show={show}
      onHide={onHide}
      centered
      size="lg"
      className="tvn-modal"
    >
      <Modal.Header>
        <Modal.Title>{t("export")}</Modal.Title>
        <button
          className="tvn-modal-close-btn"
          onClick={onHide}
        >
          x
        </button>
      </Modal.Header>
      <Form onSubmit={onSubmit}>
        <Modal.Body>
          <div className="export-split-layout">
            {/* Left pane: export settings */}
            <div className="export-left-pane">
              <Form.Group className="mb-2" controlId="exportDocCountInput">
                <Form.Label>Export current page</Form.Label>
                <Form.Select
                  value={exportDocCount}
                  onChange={(e) => setExportDocCount(Number(e.target.value))}
                  className="form-control"
                >
                  <option value={10}>10</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </Form.Select>
                <span
                  className="text-muted d-block mt-1 mb-2"
                  style={{ fontSize: "0.68rem" }}
                >
                  Export is limited to the {articlesCount} article(s) loaded
                  on this page.
                </span>
              </Form.Group>

              <Form.Group className="mb-2" controlId="exportFormatInput">
                <Form.Label>{t("exportFileFormat")}</Form.Label>
                <Form.Select
                  value={exportFormat}
                  onChange={(e) => setExportFormat(e.target.value)}
                  className="form-control"
                >
                  <option value="CSV">CSV</option>
                  <option value="JSON">JSON</option>
                </Form.Select>
                <span
                  className="text-muted d-block mt-1 mb-2"
                  style={{ fontSize: "0.68rem" }}
                >
                  {t("selectJsonLines")}
                </span>
              </Form.Group>

              <div className="export-fields-header">
                <span className="form-label mb-0">
                  {t("exportFieldsLabel")}
                </span>
                <div className="export-fields-icons">
                  <button
                    type="button"
                    className="export-fields-icon-btn text-success"
                    onClick={() =>
                      setExportFields({
                        title: true,
                        authors: true,
                        journal: true,
                        doi: true,
                        issn: true,
                        keywords: true,
                        citations: true,
                        year: true,
                      })
                    }
                    title={t("selectAll", "Select All")}
                  >
                    <Icon icon="lucide:check-circle-2" width="16" />
                  </button>
                  <button
                    type="button"
                    className="export-fields-icon-btn text-danger"
                    onClick={() =>
                      setExportFields({
                        title: false,
                        authors: false,
                        journal: false,
                        doi: false,
                        issn: false,
                        keywords: false,
                        citations: false,
                        year: false,
                      })
                    }
                    title={t("deselectAll", "Deselect All")}
                  >
                    <Icon icon="lucide:minus-circle" width="16" />
                  </button>
                </div>
              </div>

              <div className="export-fields-grid">
                <Form.Check
                  type="checkbox"
                  id="field-title"
                  label={t("colArticle")}
                  checked={exportFields.title}
                  onChange={(e) =>
                    setExportFields((prev) => ({
                      ...prev,
                      title: e.target.checked,
                    }))
                  }
                  className="export-field-check"
                />
                <Form.Check
                  type="checkbox"
                  id="field-authors"
                  label={t("colAuthors")}
                  checked={exportFields.authors}
                  onChange={(e) =>
                    setExportFields((prev) => ({
                      ...prev,
                      authors: e.target.checked,
                    }))
                  }
                  className="export-field-check"
                />
                <Form.Check
                  type="checkbox"
                  id="field-journal"
                  label={t("colJournal")}
                  checked={exportFields.journal}
                  onChange={(e) =>
                    setExportFields((prev) => ({
                      ...prev,
                      journal: e.target.checked,
                    }))
                  }
                  className="export-field-check"
                />
                <Form.Check
                  type="checkbox"
                  id="field-doi"
                  label={t("colDoi")}
                  checked={exportFields.doi}
                  onChange={(e) =>
                    setExportFields((prev) => ({
                      ...prev,
                      doi: e.target.checked,
                    }))
                  }
                  className="export-field-check"
                />
                <Form.Check
                  type="checkbox"
                  id="field-issn"
                  label={t("colIssn")}
                  checked={exportFields.issn}
                  onChange={(e) =>
                    setExportFields((prev) => ({
                      ...prev,
                      issn: e.target.checked,
                    }))
                  }
                  className="export-field-check"
                />
                <Form.Check
                  type="checkbox"
                  id="field-keywords"
                  label={t("colKeywords")}
                  checked={exportFields.keywords}
                  onChange={(e) =>
                    setExportFields((prev) => ({
                      ...prev,
                      keywords: e.target.checked,
                    }))
                  }
                  className="export-field-check"
                />
                <Form.Check
                  type="checkbox"
                  id="field-citations"
                  label={t("citedByLabel")}
                  checked={exportFields.citations}
                  onChange={(e) =>
                    setExportFields((prev) => ({
                      ...prev,
                      citations: e.target.checked,
                    }))
                  }
                  className="export-field-check"
                />
                <Form.Check
                  type="checkbox"
                  id="field-year"
                  label={t("yearLabel")}
                  checked={exportFields.year}
                  onChange={(e) =>
                    setExportFields((prev) => ({
                      ...prev,
                      year: e.target.checked,
                    }))
                  }
                  className="export-field-check"
                />
              </div>

              <Form.Group className="mt-2" controlId="exportFileNameInput">
                <Form.Label>{t("exportFileNameLabel")}</Form.Label>
                <Form.Control
                  type="text"
                  value={exportFileName}
                  onChange={(e) => setExportFileName(e.target.value)}
                  placeholder="articles-export"
                />
              </Form.Group>
            </div>

            {/* Right pane: export scope summary */}
            <div className="export-right-pane">
              <h6>Paper VN discovery data</h6>
              <p>
                Exports include only the currently loaded article rows and
                selected fields.
              </p>
              <div className="btn-enabled-lens">
                <Icon icon="lucide:check-circle" width="14" />
                Scope: Vietnamese universities
              </div>
            </div>
          </div>
        </Modal.Body>
        <div className="modal-footer border-top-0 d-flex justify-content-end gap-2 p-3 pt-0">
          <button
            type="button"
            className="tvn-modal-btn-cancel"
            onClick={onHide}
          >
            {t("cancel")}
          </button>
          <button type="submit" className="tvn-modal-btn-save">
            {t("export")}
          </button>
        </div>
      </Form>
    </Modal>
  );
}
