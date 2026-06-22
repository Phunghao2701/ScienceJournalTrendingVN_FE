import KeywordInput from '../shared/KeywordInput';

export default function MetadataSection({
  abstract,
  keywords,
  submissionId,
  submissionDate,
  onChangeAbstract,
  onChangeKeywords,
  onChangeSubmissionDate,
}) {
  return (
    <div className="admin-card admin-form-section">
      <h3 className="admin-card__title mb-3">Metadata</h3>

      {/* Abstract - textarea full width */}
      <div className="admin-form-group">
        <label className="admin-form-label" htmlFor="article-abstract">
          Abstract
        </label>
        <textarea
          id="article-abstract"
          className="admin-form-input admin-form-textarea"
          value={abstract}
          onChange={(e) => onChangeAbstract(e.target.value)}
        />
      </div>

      {/* Keywords - tag input có thể thêm/xóa */}
      <div className="admin-form-group">
        <label className="admin-form-label">Keywords</label>
        <KeywordInput keywords={keywords} onChange={onChangeKeywords} />
      </div>

      {/* Submission ID (read-only) + Submission Date - 2 cột trên desktop */}
      <div className="admin-form-row">
        <div className="admin-form-group">
          <label className="admin-form-label" htmlFor="article-submission-id">
            Submission ID
          </label>
          <input
            id="article-submission-id"
            type="text"
            className="admin-form-input"
            value={submissionId}
            readOnly
          />
        </div>

        <div className="admin-form-group">
          <label className="admin-form-label" htmlFor="article-submission-date">
            Submission Date
          </label>
          <input
            id="article-submission-date"
            type="date"
            className="admin-form-input"
            value={submissionDate}
            onChange={(e) => onChangeSubmissionDate(e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}