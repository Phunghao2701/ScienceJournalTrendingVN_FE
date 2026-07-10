import '../styles/ProfilePage.css';
import Header from '../../landing/components/Header';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useProfileForm from '../hooks/useProfileForm';
import ProfileGuestState from '../components/ProfileGuestState';
import ProfileLoadingState from '../components/ProfileLoadingState';
import ProfileErrorState from '../components/ProfileErrorState';
import ProfileSidebar from '../components/ProfileSidebar';
import ProfileFormCard from '../components/ProfileFormCard';
import DeleteAccountModal from '../components/DeleteAccountModal';

export default function ProfilePage() {
  const navigate = useNavigate();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const {
    user,
    formData,
    setField,
    isLoading,
    isSaving,
    error,
    saveError,
    computedIsAuthenticated,
    fetchProfile,
    handleSave,
    handleDeleteAccount,
    handleLogout,
  } = useProfileForm();

  const onSave = async () => {
    const success = await handleSave();
    alert(success ? 'Cập nhật thành công' : 'Cập nhật thất bại');
  };

  const onDelete = async () => {
    await handleDeleteAccount();
    setShowDeleteModal(false);
  };

  if (isLoading && !user) {
    return (
      <>
        <Header />
        <ProfileLoadingState />
      </>
    );
  }

  if (error) {
    return (
      <>
        <Header />
        <ProfileErrorState error={error} onRetry={fetchProfile} />
      </>
    );
  }

  return (
    <>
      <Header />

      {!computedIsAuthenticated ? (
        <ProfileGuestState
          onLogin={() => navigate('/login')}
          onRegister={() => navigate('/register')}
        />
      ) : (
        <div className="profile-page">
          <div className="profile-container">
            <div className="page-header">
              <h1>Hồ sơ</h1>
              <p>Quản lý thông tin cá nhân và thiết lập tài khoản của bạn.</p>
            </div>

            <div className="breadcrumb">
              Tổng quan
              <span>&gt;</span>
              Hồ sơ cá nhân
            </div>

            {saveError && (
              <div className="error-box" style={{ marginBottom: '20px' }}>
                <p>{saveError}</p>
              </div>
            )}

            <div className="profile-content">
              <ProfileSidebar formData={formData} user={user} onLogout={handleLogout} />
              <ProfileFormCard
                formData={formData}
                setField={setField}
                onSave={onSave}
                isSaving={isSaving}
                onRequestDelete={() => setShowDeleteModal(true)}
                onLogout={handleLogout}
              />
            </div>
          </div>
        </div>
      )}

      {showDeleteModal && computedIsAuthenticated && (
        <DeleteAccountModal
          onCancel={() => setShowDeleteModal(false)}
          onConfirm={onDelete}
        />
      )}
    </>
  );
}
