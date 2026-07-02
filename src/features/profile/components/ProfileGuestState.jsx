export default function ProfileGuestState({ onLogin, onRegister }) {
  return (
    <div className="profile-page">
      <div className="profile-container">
        <div className="page-header">
          <h1>Hồ sơ</h1>
          <p>Quản lý thông tin cá nhân và thiết lập tài khoản của bạn.</p>
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
          <h2 style={{ marginBottom: '16px' }}>Vui lòng đăng nhập</h2>
          <p style={{ color: '#666', marginBottom: '32px', fontSize: '16px' }}>
            Bạn cần đăng nhập để xem và quản lý hồ sơ cá nhân của mình
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
            Đăng nhập
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
            Đăng kí
          </button>
        </div>
      </div>
    </div>
  );
}
