/**
 * - show:       điều khiển hiển thị modal (state ở page cha).
 * - onClose:    đóng modal không xóa (nút "Cancel" hoặc click ra ngoài).
 * - onConfirm:  xác nhận xóa (nút "Delete Article").
 * - articleTitle: tên bài báo - hiển thị trong nội dung cảnh báo để
 *                  admin chắc chắn đang xóa đúng bài.
 */
import { Modal } from 'react-bootstrap';
import Icon from '../../../../shared/components/Icon';

export default function DeleteArticleModal({ show, onClose, onConfirm, articleTitle }) {
  return (
    <Modal show={show} onHide={onClose} centered>
      <Modal.Body className="admin-delete-modal">
        {/* Icon cảnh báo tròn, nền đỏ nhạt */}
        <div className="admin-delete-modal__icon">
          <Icon icon="lucide:alert-triangle" />
        </div>

        <h3 className="admin-delete-modal__title">Delete this article?</h3>
        <p className="admin-delete-modal__description">
          This will permanently delete <strong>&ldquo;{articleTitle}&rdquo;</strong> and all
          associated manuscript files. This action cannot be undone.
        </p>

        {/* Action buttons - Cancel (outline) bên trái, Delete (danger, filled) bên phải */}
        <div className="admin-delete-modal__actions">
          <button type="button" className="admin-btn admin-btn--outline" onClick={onClose}>
            Cancel
          </button>
          <button type="button" className="admin-btn admin-btn--danger-solid" onClick={onConfirm}>
            Delete Article
          </button>
        </div>
      </Modal.Body>
    </Modal>
  );
}