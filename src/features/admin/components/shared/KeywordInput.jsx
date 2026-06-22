import { useState } from 'react';
import Icon from '../../../../shared/components/Icon';

export default function KeywordInput({ keywords, onChange, placeholder = 'Add keywords separated by commas...' }) {
  // Giá trị đang gõ trong input, chưa được "chốt" thành tag
  const [draftValue, setDraftValue] = useState('');

  // Thêm 1 keyword mới vào danh sách (bỏ qua nếu rỗng hoặc đã tồn tại)
  const addKeyword = (rawValue) => {
    const value = rawValue.trim();
    if (!value) return;
    if (keywords.includes(value)) return; // tránh trùng keyword
    onChange([...keywords, value]);
  };

  // Xóa 1 keyword theo index
  const removeKeyword = (index) => {
    onChange(keywords.filter((_, i) => i !== index));
  };

  // Xử lý khi gõ: nếu gặp dấu phẩy -> tách thành keyword ngay,
  // phần còn lại giữ lại trong input.
  const handleChange = (e) => {
    const value = e.target.value;
    if (value.includes(',')) {
      const parts = value.split(',');
      // Tất cả phần trước dấu phẩy cuối -> thêm thành keyword
      parts.slice(0, -1).forEach((part) => addKeyword(part));
      // Phần sau dấu phẩy cuối -> giữ lại trong input
      setDraftValue(parts[parts.length - 1]);
    } else {
      setDraftValue(value);
    }
  };

  // Nhấn Enter -> thêm keyword đang gõ và clear input.
  // Nhấn Backspace khi input rỗng -> xóa tag cuối cùng (UX quen thuộc).
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addKeyword(draftValue);
      setDraftValue('');
    } else if (e.key === 'Backspace' && draftValue === '' && keywords.length > 0) {
      removeKeyword(keywords.length - 1);
    }
  };

  return (
    <div className="admin-keyword-input">
      {/* Danh sách tag keyword đã thêm */}
      {keywords.length > 0 && (
        <div className="admin-keyword-input__tags">
          {keywords.map((keyword, index) => (
            <span key={`${keyword}-${index}`} className="admin-keyword-tag">
              {keyword}
              <button
                type="button"
                className="admin-keyword-tag__remove"
                aria-label={`Remove keyword ${keyword}`}
                onClick={() => removeKeyword(index)}
              >
                <Icon icon="lucide:x" />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Input để gõ keyword mới */}
      <input
        type="text"
        className="admin-form-input"
        placeholder={placeholder}
        value={draftValue}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        // Khi blur (rời khỏi input) mà còn text chưa chốt -> thêm luôn keyword đó
        onBlur={() => {
          if (draftValue.trim()) {
            addKeyword(draftValue);
            setDraftValue('');
          }
        }}
      />
    </div>
  );
}