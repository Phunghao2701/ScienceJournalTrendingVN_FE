import ManuscriptFileItem from '../shared/ManuscriptFileItem';

export default function ManuscriptFilesSection({ files }) {
  return (
    <div className="admin-card admin-form-section">
      <h3 className="admin-card__title mb-3">Manuscript Files</h3>

      <div className="admin-file-list">
        {files.map((file) => (
          <ManuscriptFileItem
            key={file.id}
            name={file.name}
            type={file.type}
            size={file.size}
            uploadedAt={file.uploadedAt}
          />
        ))}
      </div>
    </div>
  );
}