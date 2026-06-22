/**
 * File source thuộc hệ thống FE ResearchPulse.
 *
 * File: features\article\components\LoginRequiredModal.jsx
 */
import { Modal, Button } from 'react-bootstrap';
import { Icon } from '@iconify/react';
import { useNavigate } from 'react-router-dom';

export default function LoginRequiredModal({ show, onHide }) {
  const navigate = useNavigate();

  const handleLogin = () => {
    onHide();
    navigate('/login');
  };

  const handleRegister = () => {
    onHide();
    navigate('/register');
  };

  return (
    <Modal
      show={show}
      onHide={onHide}
      centered
      contentClassName="border-0 shadow-lg"
      style={{ backdropFilter: 'blur(4px)' }}
    >
      <div 
        className="p-4 text-center rounded-3 bg-white"
        style={{
          border: '1px solid var(--border)'
        }}
      >
        {/* Header Icon */}
        <div 
          className="d-inline-flex align-items-center justify-content-center mb-3" 
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            backgroundColor: 'var(--primary-light)',
            border: '1px solid rgba(255, 122, 51, 0.2)'
          }}
        >
          <Icon icon="lucide:lock" className="text-primary" width="30" />
        </div>

        {/* Modal Title */}
        <h4 className="font-display fw-bold text-main mb-2">Đăng nhập để lưu bài báo</h4>
        
        {/* Modal Content */}
        <p className="text-muted-custom text-sm mb-4 leading-relaxed" style={{ fontSize: '0.9rem' }}>
          Bạn cần đăng nhập tài khoản ResearchPulse để sử dụng tính năng bookmark bài báo khoa học này.
        </p>

        {/* Buttons Grid */}
        <div className="d-flex flex-column gap-2">
          <Button
            className="w-full btn-primary-glow border-0 py-2 font-semibold text-sm rounded-pill text-white"
            onClick={handleLogin}
          >
            Đăng nhập ngay
          </Button>
          
          <Button
            variant="outline-secondary"
            className="w-full py-2 font-semibold text-sm text-main rounded-pill border-secondary"
            onClick={handleRegister}
            style={{ backgroundColor: 'transparent' }}
          >
            Đăng ký tài khoản
          </Button>

          <Button
            variant="link"
            className="w-full text-muted-custom hover:text-dark text-xs mt-1 p-0 text-decoration-none font-semibold"
            onClick={onHide}
          >
            Đóng cửa sổ
          </Button>
        </div>
      </div>
    </Modal>
  );
}
