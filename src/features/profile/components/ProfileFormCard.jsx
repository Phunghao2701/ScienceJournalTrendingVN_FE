import { useTranslation } from 'react-i18next';

/**
 * Thẻ form thông tin tài khoản: các trường chỉnh sửa, nút lưu và danger zone.
 */
export default function ProfileFormCard({
  formData,
  setField,
  onSave,
  isSaving,
  onRequestDelete,
  onLogout,
}) {
  const { i18n } = useTranslation();
  const isVi = i18n.resolvedLanguage?.startsWith('vi');

  const cardTitle = isVi ? 'Thông tin tài khoản' : 'Account information';
  const lastNameLabel = isVi ? 'HỌ' : 'LAST NAME';
  const firstNameLabel = isVi ? 'TÊN' : 'FIRST NAME';
  const emailLabel = isVi ? 'ĐỊA CHỈ EMAIL' : 'EMAIL ADDRESS';
  const roleLabel = isVi ? 'VAI TRÒ / CHỨC DANH' : 'ROLE / TITLE';
  const researcherText = isVi ? 'Nhà nghiên cứu' : 'Researcher';
  const genderLabel = isVi ? 'GIỚI TÍNH' : 'GENDER';
  const maleOption = isVi ? 'Nam' : 'Male';
  const femaleOption = isVi ? 'Nữ' : 'Female';
  const dobLabel = isVi ? 'NGÀY SINH' : 'DATE OF BIRTH';
  const logoutText = isVi ? 'Đăng xuất' : 'Log out';
  const savingText = isVi ? 'Đang lưu...' : 'Saving...';
  const saveChangesText = isVi ? 'Lưu thay đổi' : 'Save changes';
  const dangerZoneTitle = isVi ? 'Khu vực nguy hiểm' : 'Danger Zone';
  const dangerZoneDesc = isVi ? 'Hành động này sẽ xóa tài khoản vĩnh viễn.' : 'This action will delete your account permanently.';
  const deleteAccountText = isVi ? 'Xóa tài khoản' : 'Delete account';

  return (
    <div className="profile-card">
      <h2>{cardTitle}</h2>

      <div className="form-grid">
        <div className="form-group">
          <label>{lastNameLabel}</label>
          <input
            type="text"
            value={formData.last_name}
            onChange={(e) => setField('last_name', e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>{firstNameLabel}</label>
          <input
            type="text"
            value={formData.first_name}
            onChange={(e) => setField('first_name', e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>{emailLabel}</label>
          <input type="email" value={formData.email} readOnly className="readonly-input" />
        </div>

        <div className="form-group">
          <label>{roleLabel}</label>
          <input
            type="text"
            value={formData.role || researcherText}
            readOnly
            className="readonly-input"
          />
        </div>

        <div className="form-group">
          <label>{genderLabel}</label>
          <select
            value={formData.gender ? 'male' : 'female'}
            onChange={(e) => setField('gender', e.target.value === 'male')}
          >
            <option value="male">{maleOption}</option>
            <option value="female">{femaleOption}</option>
          </select>
        </div>

        <div className="form-group">
          <label>{dobLabel}</label>
          <input
            type="date"
            value={formData.date_of_birth}
            onChange={(e) => setField('date_of_birth', e.target.value)}
          />
        </div>
      </div>

      <div className="form-group full-width">
        <label>AVATAR URL</label>
        <input
          type="text"
          value={formData.url_image}
          onChange={(e) => setField('url_image', e.target.value)}
          placeholder="https://example.com/avatar.png"
        />
      </div>

      <div className="button-area" style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
        <button type="button" className="logout-card-btn" onClick={onLogout}>
          {logoutText}
        </button>
        <button className="save-btn" onClick={onSave} disabled={isSaving}>
          {isSaving ? savingText : saveChangesText}
        </button>
      </div>

      <div className="danger-zone">
        <h3>{dangerZoneTitle}</h3>
        <p>{dangerZoneDesc}</p>
        <button className="delete-btn" onClick={onRequestDelete}>
          {deleteAccountText}
        </button>
      </div>
    </div>
  );
}
