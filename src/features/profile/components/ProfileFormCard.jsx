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
  return (
    <div className="profile-card">
      <h2>Thông tin tài khoản</h2>

      <div className="form-grid">
        <div className="form-group">
          <label>HỌ</label>
          <input
            type="text"
            value={formData.last_name}
            onChange={(e) => setField('last_name', e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>TÊN</label>
          <input
            type="text"
            value={formData.first_name}
            onChange={(e) => setField('first_name', e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>ĐỊA CHỈ EMAIL</label>
          <input type="email" value={formData.email} readOnly className="readonly-input" />
        </div>

        <div className="form-group">
          <label>VAI TRÒ / CHỨC DANH</label>
          <input
            type="text"
            value={formData.role || 'Nhà nghiên cứu'}
            readOnly
            className="readonly-input"
          />
        </div>

        <div className="form-group">
          <label>GIỚI TÍNH</label>
          <select
            value={formData.gender ? 'male' : 'female'}
            onChange={(e) => setField('gender', e.target.value === 'male')}
          >
            <option value="male">Nam</option>
            <option value="female">Nữ</option>
          </select>
        </div>

        <div className="form-group">
          <label>NGÀY SINH</label>
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
          Đăng xuất
        </button>
        <button className="save-btn" onClick={onSave} disabled={isSaving}>
          {isSaving ? 'Đang lưu...' : 'Lưu thay đổi'}
        </button>
      </div>

      <div className="danger-zone">
        <h3>Danger Zone</h3>
        <p>Hành động này sẽ xóa tài khoản vĩnh viễn.</p>
        <button className="delete-btn" onClick={onRequestDelete}>
          Xóa tài khoản
        </button>
      </div>
    </div>
  );
}
