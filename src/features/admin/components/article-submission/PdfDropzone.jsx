import { useState, useRef } from 'react';
import { Button, Alert, ProgressBar } from 'react-bootstrap';
import Icon from '../../../../shared/components/Icon';

/**
 * PdfDropzone Component
 * Interactive drag-and-drop zone for uploading PDF manuscripts.
 * 
 * @param {Object} props - Props
 * @param {File} props.selectedFile - Current selected File object
 * @param {function} props.onFileSelect - Callback when valid file is selected
 * @param {function} props.onFileRemove - Callback when selected file is removed
 */
export default function PdfDropzone({
  selectedFile,
  onFileSelect,
  onFileRemove
}) {
  const [isDragActive, setIsDragActive] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  // Maximum allowed file size: 25MB
  const MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024;

  /**
   * Validate file type and size.
   */
  const validateAndProcessFile = (file) => {
    setError('');

    if (!file) return;

    // Validate type (must be PDF)
    if (file.type !== 'application/pdf' && !file.name.endsWith('.pdf')) {
      setError('Only PDF manuscripts are accepted.');
      return;
    }

    // Validate size (max 25MB)
    if (file.size > MAX_FILE_SIZE_BYTES) {
      setError('File size exceeds the 25MB limit. Please upload a compressed version.');
      return;
    }

    // Pass up to parent
    onFileSelect(file);
  };

  /**
   * Handle drag events.
   */
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragActive(true);
    } else if (e.type === 'dragleave') {
      setIsDragActive(false);
    }
  };

  /**
   * Handle drop event.
   */
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndProcessFile(e.dataTransfer.files[0]);
    }
  };

  /**
   * Handle manual input selection change.
   */
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      validateAndProcessFile(e.target.files[0]);
    }
  };

  /**
   * Trigger click on hidden input element.
   */
  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  /**
   * Format bytes to readable string (e.g. KB, MB).
   */
  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = 2;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  return (
    <div className="w-100">
      {error && (
        <Alert variant="danger" className="py-2 px-3 small border-0 mb-3 rounded-3">
          {error}
        </Alert>
      )}

      {/* Hidden native input file */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".pdf,application/pdf"
        className="d-none"
      />

      {!selectedFile ? (
        // Dropzone Area
        <div
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          onClick={triggerFileInput}
          className={`d-flex flex-column align-items-center justify-content-center p-5 rounded-4 premium-dropzone ${isDragActive ? 'drag-active' : ''}`}
        >
          {/* Cloud Upload Icon */}
          <div className="rounded-circle d-flex align-items-center justify-content-center mb-3 premium-dropzone-icon-wrapper">
            <Icon icon="lucide:cloud-upload" width="28" />
          </div>

          <h5 className="fw-bold text-main mb-1.5" style={{ fontFamily: 'var(--font-display)' }}>
            Click to upload or drag and drop
          </h5>
          <p className="text-muted-custom small mb-4">PDF files only (max. 25MB)</p>

          <Button 
            type="button"
            className="px-4 py-2 rounded-pill premium-dropzone-btn"
            onClick={(e) => {
              e.stopPropagation();
              triggerFileInput();
            }}
          >
            Browse Files
          </Button>
        </div>
      ) : (
        // Selected File Display panel
        <div className="p-4 rounded-4 border bg-white">
          <div className="d-flex align-items-center justify-content-between">
            <div className="d-flex align-items-center gap-3">
              {/* PDF Document Icon */}
              <div 
                className="rounded-3 d-flex align-items-center justify-content-center"
                style={{
                  width: '46px',
                  height: '46px',
                  backgroundColor: '#fee2e2',
                  color: '#ef4444'
                }}
              >
                <Icon icon="lucide:file-text" width="24" />
              </div>
              <div>
                <div className="fw-bold text-main text-truncate" style={{ maxWidth: '280px', fontSize: '0.925rem' }}>
                  {selectedFile.name}
                </div>
                <div className="text-muted-custom small">
                  {formatBytes(selectedFile.size)} â€¢ PDF Document
                </div>
              </div>
            </div>

            {/* Remove File button */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onFileRemove();
              }}
              className="btn btn-link p-1.5 text-decoration-none text-muted-custom hover-danger border-0 rounded-circle"
              style={{ width: '36px', height: '36px' }}
              title="Remove File"
            >
              <Icon icon="lucide:trash" width="18" />
            </button>
          </div>

          {/* Submission status */}
          <div className="mt-4 pt-2 border-top">
            <div className="d-flex justify-content-between small text-muted-custom mb-1.5">
              <span>Chưa có API upload PDF article. Đã xóa dữ liệu mock khỏi khu vực này.</span>
              <span className="fw-semibold" style={{ color: 'var(--primary)' }}>N/A</span>
            </div>
            <ProgressBar now={0} style={{ height: '4px', '--bs-progress-bar-bg': 'var(--primary)' }} />
          </div>
        </div>
      )}
    </div>
  );
}
