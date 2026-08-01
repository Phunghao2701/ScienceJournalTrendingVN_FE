import { useTranslation } from 'react-i18next';

export default function DeleteAccountModal({ onCancel, onConfirm }) {
  const { i18n } = useTranslation();
  const isVi = i18n.resolvedLanguage?.startsWith('vi');

  const titleText = isVi ? 'Xác nhận xóa tài khoản' : 'Confirm account deletion';
  const confirmText = isVi 
    ? 'Bạn có chắc muốn xóa tài khoản này không? Hành động này không thể hoàn tác.' 
    : 'Are you sure you want to delete this account? This action cannot be undone.';
  const cancelBtnText = isVi ? 'Hủy' : 'Cancel';
  const deleteBtnText = isVi ? 'Xóa tài khoản' : 'Delete account';

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>{titleText}</h3>
        <p>{confirmText}</p>
        <div className="modal-actions">
          <button className="cancel-btn" onClick={onCancel}>
            {cancelBtnText}
          </button>
          <button className="delete-confirm-btn" onClick={onConfirm}>
            {deleteBtnText}
          </button>
        </div>
      </div>
    </div>
  );
}
