import { useTranslation } from 'react-i18next';

export default function ProfileGuestState({ onLogin, onRegister }) {
  const { i18n } = useTranslation();
  const isVi = i18n.resolvedLanguage?.startsWith('vi');

  const titleText = isVi ? 'Hồ sơ' : 'Profile';
  const subtitleText = isVi ? 'Quản lý thông tin cá nhân và thiết lập tài khoản của bạn.' : 'Manage your personal information and account settings.';
  const pleaseLoginText = isVi ? 'Vui lòng đăng nhập' : 'Please log in';
  const needLoginText = isVi ? 'Bạn cần đăng nhập để xem và quản lý hồ sơ cá nhân của mình' : 'You need to log in to view and manage your personal profile';
  const loginText = isVi ? 'Đăng nhập' : 'Log in';
  const registerText = isVi ? 'Đăng ký' : 'Sign up';

  return (
    <div className="profile-page">
      <div className="profile-container">
        <div className="page-header">
          <h1>{titleText}</h1>
          <p>{subtitleText}</p>
        </div>

        <div
          style={{
            background: 'white',
            borderRadius: '20px',
            padding: '60px 40px',
            textAlign: 'center',
            marginTop: '40px',
            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.06)',
          }}
        >
          <h2 style={{ marginBottom: '16px' }}>{pleaseLoginText}</h2>
          <p style={{ color: '#666', marginBottom: '32px', fontSize: '16px' }}>
            {needLoginText}
          </p>
          <button
            onClick={onLogin}
            style={{
              background: '#ff7a30',
              color: 'white',
              border: 'none',
              padding: '12px 32px',
              borderRadius: '10px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              marginRight: '12px',
            }}
          >
            {loginText}
          </button>
          <button
            onClick={onRegister}
            style={{
              background: 'transparent',
              color: '#ff7a30',
              border: '2px solid #ff7a30',
              padding: '10px 30px',
              borderRadius: '10px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
            }}
          >
            {registerText}
          </button>
        </div>
      </div>
    </div>
  );
}
