import '../styles/ProfilePage.css';
import Header from '../../landing/components/Header';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
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
  const { i18n } = useTranslation();
  const isVi = i18n.resolvedLanguage?.startsWith('vi');

  const titleText = isVi ? 'Hồ sơ' : 'Profile';
  const subtitleText = isVi ? 'Quản lý thông tin cá nhân và thiết lập tài khoản của bạn.' : 'Manage your personal information and account settings.';
  const overviewText = isVi ? 'Tổng quan' : 'Overview';
  const profileText = isVi ? 'Hồ sơ cá nhân' : 'Personal profile';
  const successAlert = isVi ? 'Cập nhật thành công' : 'Update successful';
  const failAlert = isVi ? 'Cập nhật thất bại' : 'Update failed';

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
    alert(success ? successAlert : failAlert);
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
              <h1>{titleText}</h1>
              <p>{subtitleText}</p>
            </div>

            <div className="breadcrumb">
              {overviewText}
              <span>&gt;</span>
              {profileText}
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
