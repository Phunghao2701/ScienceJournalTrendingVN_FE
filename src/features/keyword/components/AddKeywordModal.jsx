import { useState, useEffect } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { Icon } from '@iconify/react';
import { useTranslation } from 'react-i18next';
import { useProjectText } from '../../project/i18n/useProjectText';
import keywordApi from '../../keywords/api/keywordApi';
import { normalizeKeywordListResponse } from '../../keywords/services/keywordService';

const DEFAULT_SUGGESTIONS = [
  { id: 'def-1', display_name: 'Computer Science' },
  { id: 'def-2', display_name: 'Data Science' },
  { id: 'def-3', display_name: 'Artificial Intelligence' },
  { id: 'def-4', display_name: 'Machine Learning' },
  { id: 'def-5', display_name: 'Deep Learning' },
  { id: 'def-6', display_name: 'Big Data' },
  { id: 'def-7', display_name: 'Internet of Things' },
  { id: 'def-8', display_name: 'Blockchain' },
  { id: 'def-9', display_name: 'Cloud Computing' },
  { id: 'def-10', display_name: 'Cybersecurity' },
];

const AddKeywordModal = ({ show, onHide, onAdd, actionLoading }) => {
  const [keyword, setKeyword] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const p = useProjectText();
  const { i18n } = useTranslation();

  const isVi = i18n.resolvedLanguage?.startsWith('vi');
  const searchResultsText = isVi ? 'Kết quả tìm kiếm' : 'Search results';
  const popularKeywordsText = isVi ? 'Gợi ý từ khóa phổ biến' : 'Popular keywords';
  const searchingText = isVi ? 'Đang tìm kiếm...' : 'Searching...';
  const noMatchingKeywordsText = isVi ? 'Không tìm thấy từ khóa khớp. Nhấn "Thêm" để tạo mới.' : 'No matching keywords. Press "Add" to create a new one.';
  const typeToSearchText = isVi ? 'Nhập để tìm kiếm từ khóa...' : 'Type to search keywords...';

  useEffect(() => {
    if (!show) {
      setKeyword('');
      setSuggestions([]);
      setShowDropdown(false);
      return;
    }

    const fetchSuggestions = async () => {
      if (!keyword.trim()) {
        setSuggestions(DEFAULT_SUGGESTIONS);
        setLoadingSuggestions(false);
        return;
      }

      setLoadingSuggestions(true);
      try {
        const response = await keywordApi.getKeywords({
          keyword: keyword.trim(),
          page: 1,
          limit: 15,
        });
        const { items } = normalizeKeywordListResponse(response, 15);
        setSuggestions(items);
      } catch (err) {
        console.error('Error fetching keyword suggestions:', err);
      } finally {
        setLoadingSuggestions(false);
      }
    };

    const delayDebounceFn = setTimeout(() => {
      fetchSuggestions();
    }, keyword.trim() ? 250 : 0);

    return () => clearTimeout(delayDebounceFn);
  }, [keyword, show]);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (!e.target.closest('.keyword-dropdown-container')) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('click', handleOutsideClick);
    return () => document.removeEventListener('click', handleOutsideClick);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!keyword.trim()) return;
    setSubmitError('');
    try {
      await onAdd(keyword.trim());
      setKeyword('');
      onHide();
    } catch (err) {
      setSubmitError(
        err.response?.data?.message
          || err.message
          || p('addKeywordFailed'),
      );
    }
  };

  const handleHide = () => {
    setSubmitError('');
    onHide();
  };

  return (
    <Modal show={show} onHide={handleHide} centered backdrop="static">
      <Modal.Header closeButton className="border-bottom-0 pb-0">
        <Modal.Title className="font-display fw-bold">{p('addWatchedKeyword')}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3 keyword-dropdown-container position-relative">
            <Form.Label className="text-muted-custom small">{p('keyword')}</Form.Label>
            <div className="input-group">
              <Form.Control 
                type="text" 
                placeholder={p('keywordExample')}
                value={keyword}
                onChange={(e) => {
                  setKeyword(e.target.value);
                  setSubmitError('');
                  setShowDropdown(true);
                }}
                onFocus={() => setShowDropdown(true)}
                disabled={actionLoading}
                isInvalid={Boolean(submitError)}
                required
                autoComplete="off"
                autoFocus
              />
              <Button
                type="button"
                variant="outline-secondary"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowDropdown(!showDropdown);
                }}
                disabled={actionLoading}
                className="d-flex align-items-center justify-content-center border-start-0"
                style={{ 
                  borderTopRightRadius: '0.375rem', 
                  borderBottomRightRadius: '0.375rem',
                  borderColor: '#dee2e6',
                  paddingLeft: '12px',
                  paddingRight: '12px'
                }}
                title="Gợi ý từ khóa"
              >
                <Icon icon={showDropdown ? "lucide:chevron-up" : "lucide:chevron-down"} width="16" />
              </Button>
            </div>

            {showDropdown && (
              <div 
                className="position-absolute w-100 bg-white border rounded-3 mt-1 shadow-lg overflow-auto"
                style={{ zIndex: 1050, maxHeight: '200px', top: '100%', left: 0 }}
              >
                <div className="px-3 py-1 bg-light border-bottom text-muted small fw-semibold">
                  {keyword.trim() ? searchResultsText : popularKeywordsText}
                </div>

                {loadingSuggestions ? (
                  <div className="text-center py-3 text-muted-custom small">
                    <span className="spinner-border spinner-border-sm me-2 text-primary" role="status"></span>
                    {searchingText}
                  </div>
                ) : suggestions.length > 0 ? (
                  suggestions.map((s) => (
                    <button
                      key={s.id || s.keyword_id}
                      type="button"
                      className="w-100 text-start btn btn-link text-decoration-none text-main px-3 py-2 border-0 hover:bg-slate-50 d-flex justify-content-between align-items-center transition-colors border-bottom"
                      style={{ borderBottomColor: '#f1f5f9' }}
                      onClick={() => {
                        setKeyword(s.display_name);
                        setShowDropdown(false);
                      }}
                    >
                      <span className="fw-medium text-dark">{s.display_name}</span>
                    </button>
                  ))
                ) : keyword.trim() ? (
                  <div className="text-muted-custom px-3 py-3 small text-center">
                    {noMatchingKeywordsText}
                  </div>
                ) : (
                  <div className="text-muted-custom px-3 py-3 small text-center">
                    {typeToSearchText}
                  </div>
                )}
              </div>
            )}

            <Form.Control.Feedback type="invalid" style={{ display: submitError ? 'block' : 'none' }}>
              {submitError}
            </Form.Control.Feedback>
          </Form.Group>
          <div className="d-flex justify-content-end gap-2 mt-4">
            <Button variant="light" className="text-muted-custom border" onClick={handleHide} disabled={actionLoading}>
              {p('cancel')}
            </Button>
            <Button type="submit" variant="primary" className="btn-primary-glow" disabled={actionLoading || !keyword.trim()}>
              {actionLoading ? p('adding') : p('addKeyword')}
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default AddKeywordModal;
