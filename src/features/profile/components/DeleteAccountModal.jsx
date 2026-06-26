export default function DeleteAccountModal({ onCancel, onConfirm }) {
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>Xác nhận xóa tài khoản</h3>
        <p>
          Bạn có chắc muốn xóa tài khoản này không? Hành động này không thể
          hoàn tác.
        </p>
        <div className="modal-actions">
          <button className="cancel-btn" onClick={onCancel}>
            Hủy
          </button>
          <button className="delete-confirm-btn" onClick={onConfirm}>
            Xóa tài khoản
          </button>
        </div>
      </div>
    </div>
  );
}
