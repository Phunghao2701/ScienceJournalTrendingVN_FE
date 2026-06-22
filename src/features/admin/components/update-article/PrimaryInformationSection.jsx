/**
 * - title / leadAuthor / journal: giá trị hiện tại của từng field.
 * - journalOptions:               danh sách journal cho <select>.
 * - onChangeTitle / onChangeLeadAuthor / onChangeJournal: handler cập nhật state.
 */
export default function PrimaryInformationSection({
  title,
  leadAuthor,
  journal,
  journalOptions,
  onChangeTitle,
  onChangeLeadAuthor,
  onChangeJournal,
}) {
  return (
    <div className="admin-card admin-form-section">
      <h3 className="admin-card__title mb-3">Primary Information</h3>

      {/* Article Title - full width */}
      <div className="admin-form-group">
        <label className="admin-form-label" htmlFor="article-title">
          Article Title
        </label>
        <input
          id="article-title"
          type="text"
          className="admin-form-input"
          value={title}
          onChange={(e) => onChangeTitle(e.target.value)}
        />
      </div>

      {/* Lead Author + Journal - 2 cột trên desktop */}
      <div className="admin-form-row">
        <div className="admin-form-group">
          <label className="admin-form-label" htmlFor="article-lead-author">
            Lead Author
          </label>
          <input
            id="article-lead-author"
            type="text"
            className="admin-form-input"
            value={leadAuthor}
            onChange={(e) => onChangeLeadAuthor(e.target.value)}
          />
        </div>

        <div className="admin-form-group">
          <label className="admin-form-label" htmlFor="article-journal">
            Journal
          </label>
          <select
            id="article-journal"
            className="admin-form-input admin-form-select"
            value={journal}
            onChange={(e) => onChangeJournal(e.target.value)}
          >
            {journalOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}