import { useState, useEffect } from 'react';
import { Row, Col, Form, Button } from 'react-bootstrap';
import Icon from '../../../../shared/components/Icon';
import { SYSTEM_ROLES } from '../../../../shared/constants/systemConstants';

const getUserInitial = (name = '', email = '') => {
  const source = String(name || email || 'U').trim();
  return source.charAt(0).toUpperCase() || 'U';
};

/**
 * UserAccountForm Component
 * Unified form for adding new user accounts or updating profile details.
 * Styled in high-fidelity to match the mockup.
 */
export default function UserAccountForm({
  initialData = {},
  isEdit = false,
  onSubmit,
  onCancel,
  submitting = false
}) {
  // Form fields states
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [institution, setInstitution] = useState('');
  const [role, setRole] = useState(isEdit ? 'RESEARCHER' : '');
  const [status, setStatus] = useState('Active'); // Active, Inactive
  
  // Passwords states
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Validation / status feedback
  const [error, setError] = useState('');

  // Load initialData if editing
  useEffect(() => {
    if (isEdit && initialData) {
      setFirstName(initialData.first_name || '');
      setLastName(initialData.last_name || '');
      setFullName(initialData.name || '');
      setEmail(initialData.email || '');
      setPhone(initialData.phone || '');
      setInstitution(initialData.institution || '');
      setRole(initialData.role || 'RESEARCHER');
      setStatus(initialData.status || 'Active');
    }
  }, [isEdit, initialData]);

  /**
   * Handle form submit with client-side validation.
   */
  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    // Common validations
    if (!email.trim() || !role) {
      setError('Vui lòng điền đầy đủ các trường thông tin bắt buộc.');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Địa chỉ email không hợp lệ.');
      return;
    }

    // Name validations
    if (isEdit) {
      if (!fullName.trim()) {
        setError('Họ và tên là bắt buộc.');
        return;
      }
    } else {
      if (!firstName.trim() || !lastName.trim()) {
        setError('Họ và Tên là bắt buộc.');
        return;
      }
    }

    // Password validation (only if added or if new password was keyed during edit)
    if (!isEdit || newPassword || confirmPassword) {
      if (!isEdit && !newPassword) {
        setError('Mật khẩu là bắt buộc.');
        return;
      }

      if (newPassword.length < 8) {
        setError('Mật khẩu phải chứa ít nhất 8 ký tự.');
        return;
      }

      if (newPassword !== confirmPassword) {
        setError('Mật khẩu xác nhận không khớp.');
        return;
      }
    }

    // Construct request payload
    const payload = {
      email: email.trim(),
      phone: phone.trim(),
      institution: institution.trim(),
      role,
      status
    };

    if (isEdit) {
      const names = fullName.trim().split(' ');
      payload.first_name = names[0] || '';
      payload.last_name = names.slice(1).join(' ') || '';
      payload.name = fullName.trim();
      if (newPassword) {
        payload.password = newPassword;
      }
    } else {
      payload.first_name = firstName.trim();
      payload.last_name = lastName.trim();
      payload.name = `${firstName.trim()} ${lastName.trim()}`;
      payload.password = newPassword;
    }

    // Bubble up to parent
    onSubmit(payload);
  };

  const displayName = isEdit ? fullName : `${firstName} ${lastName}`.trim();
  const avatarInitial = getUserInitial(displayName, email);

  return (
    <Form onSubmit={handleSubmit} className="d-flex flex-column gap-4">
      {error && (
        <div className="alert alert-danger py-2.5 px-3.5 small border-0 rounded-3">
          {error}
        </div>
      )}

      {/* Profile identity section */}
      {isEdit && (
        <div className="d-flex align-items-center gap-4 py-3 border-bottom">
          <div 
            className="rounded-4 d-flex align-items-center justify-content-center text-white fw-bold flex-shrink-0"
            style={{
              width: '80px',
              height: '80px',
              background: 'linear-gradient(135deg, #fb923c 0%, #ea580c 100%)',
              fontSize: '2rem',
              boxShadow: '0 12px 24px rgba(234, 88, 12, 0.18)'
            }}
            aria-label={`Avatar chữ cái đầu của ${displayName || email || 'người dùng'}`}
          >
            {avatarInitial}
          </div>
          <div>
            <div className="fw-bold text-main mb-1" style={{ fontSize: '1rem' }}>{fullName || 'Chưa có tên người dùng'}</div>
            <div className="text-muted-custom small mb-0">Hiển thị avatar bằng chữ cái đầu của người dùng.</div>
          </div>
        </div>
      )}

      {/* Section 1: Personal Information */}
      <div>
        <h6 className="fw-bold d-flex align-items-center gap-2 mb-3.5 tracking-wider text-uppercase" style={{ fontSize: '0.85rem', color: '#ea580c', letterSpacing: '0.03em' }}>
          <Icon icon="lucide:user" width="16" style={{ color: '#ea580c' }} />
          THÔNG TIN CÁ NHÂN
        </h6>
        
        <Row className="g-3">
          {isEdit ? (
            // Full Name input for edit screen
            <Col xs={12} md={6}>
              <Form.Group controlId="fullName">
                <Form.Label className="account-form-label">
                  Họ và tên <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Ví dụ: Nguyễn Văn A"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  className="account-form-input"
                />
              </Form.Group>
            </Col>
          ) : (
            // First/Last Name inputs for add screen (mockup 50% each)
            <>
              <Col xs={12} md={6}>
                <Form.Group controlId="firstName">
                  <Form.Label className="account-form-label">
                    Họ <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Ví dụ: Nguyễn"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                    className="account-form-input"
                  />
                </Form.Group>
              </Col>
              <Col xs={12} md={6}>
                <Form.Group controlId="lastName">
                  <Form.Label className="account-form-label">
                    Tên <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Ví dụ: Văn A"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                    className="account-form-input"
                  />
                </Form.Group>
              </Col>
            </>
          )}

          {/* Email field */}
          <Col xs={12} md={6}>
            <Form.Group controlId="emailAddress">
              <Form.Label className="account-form-label">
                Địa chỉ Email <span className="text-danger">*</span>
              </Form.Label>
              <Form.Control
                type="email"
                placeholder="name@university.edu.vn"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="account-form-input"
              />
            </Form.Group>
          </Col>

          {/* Phone field */}
          <Col xs={12} md={6}>
            <Form.Group controlId="phoneNumber">
              <Form.Label className="account-form-label">
                Số điện thoại
              </Form.Label>
              <Form.Control
                type="text"
                placeholder="090 123 4567"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="account-form-input"
              />
            </Form.Group>
          </Col>

          {/* Institution field (Only visible on Edit Profile) */}
          {isEdit && (
            <Col xs={12} md={6}>
              <Form.Group controlId="institution">
                <Form.Label className="account-form-label">
                  Đơn vị / Trường đại học
                </Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Oxford University Press"
                  value={institution}
                  onChange={(e) => setInstitution(e.target.value)}
                  className="account-form-input"
                />
              </Form.Group>
            </Col>
          )}
        </Row>
      </div>

      {/* Section 2: Role & Status */}
      <div className="py-3 border-top">
        <h6 className="fw-bold d-flex align-items-center gap-2 mb-3.5 tracking-wider text-uppercase" style={{ fontSize: '0.85rem', color: '#ea580c', letterSpacing: '0.03em' }}>
          <Icon icon="lucide:shield" width="16" style={{ color: '#ea580c' }} />
          VAI TRÒ & TRẠNG THÁI
        </h6>

        <Row className="g-3 align-items-center">
          {/* Role select */}
          <Col xs={12} md={6}>
            <Form.Group controlId="platformRole">
              <Form.Label className="account-form-label">
                Vai trò trên nền tảng <span className="text-danger">*</span>
              </Form.Label>
              <Form.Select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="account-form-input"
                style={{ cursor: 'pointer' }}
                required
              >
                <option value="" disabled hidden>Chọn vai trò...</option>
                {SYSTEM_ROLES.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>

          {/* Status switch toggle container - mockup high fidelity styling */}
          <Col xs={12} md={6}>
            <div 
              className="d-flex align-items-center justify-content-between px-3 rounded-3" 
              style={{ 
                height: '46px', 
                backgroundColor: '#f1f5f9',
                marginTop: '28px' // Align vertical alignment with label spacing
              }}
            >
              <span className="small fw-semibold text-muted-custom" style={{ fontSize: '0.85rem' }}>Trạng thái tài khoản</span>
              <div className="d-flex align-items-center gap-2.5 orange-switch-toggle">
                <Form.Check 
                  type="switch"
                  id="status-toggle"
                  checked={status === 'Active'}
                  onChange={(e) => setStatus(e.target.checked ? 'Active' : 'Inactive')}
                />
                <span className="small fw-bold text-main" style={{ fontSize: '0.85rem' }}>{status === 'Active' ? 'Hoạt động' : 'Vô hiệu hóa'}</span>
              </div>
            </div>
          </Col>
        </Row>
      </div>

      {/* Section 3: Identity & Password */}
      <div className="py-3 border-top">
        <h6 className="fw-bold d-flex align-items-center gap-2 mb-3.5 tracking-wider text-uppercase" style={{ fontSize: '0.85rem', color: '#ea580c', letterSpacing: '0.03em' }}>
          <Icon icon="lucide:lock" width="16" style={{ color: '#ea580c' }} />
          THÔNG TIN ĐĂNG NHẬP
        </h6>
        
        <Row className="g-3">
          {/* Current Password - Only required for updating existing profile */}
          {isEdit && (
            <Col xs={12} md={4}>
              <Form.Group controlId="currentPassword">
                <Form.Label className="account-form-label">
                  Mật khẩu hiện tại
                </Form.Label>
                <Form.Control
                  type="password"
                  placeholder="••••••••"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="account-form-input"
                />
              </Form.Group>
            </Col>
          )}

          {/* New Password field */}
          <Col xs={12} md={isEdit ? 4 : 6}>
            <Form.Group controlId="newPassword">
              <Form.Label className="account-form-label">
                {isEdit ? 'Mật khẩu mới' : 'Mật khẩu mới *'}
              </Form.Label>
              <Form.Control
                type="password"
                placeholder="........"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required={!isEdit}
                className="account-form-input"
              />
            </Form.Group>
          </Col>

          {/* Confirm password field */}
          <Col xs={12} md={isEdit ? 4 : 6}>
            <Form.Group controlId="confirmPassword">
              <Form.Label className="account-form-label">
                {isEdit ? 'Xác nhận mật khẩu' : 'Xác nhận mật khẩu *'}
              </Form.Label>
              <Form.Control
                type="password"
                placeholder="........"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required={!isEdit}
                className="account-form-input"
              />
            </Form.Group>
          </Col>
        </Row>

        {/* Password complexity helper note */}
        <div className="form-text text-muted-custom mt-2.5 small" style={{ fontSize: '0.78rem' }}>
          Mật khẩu phải chứa ít nhất 8 ký tự, bao gồm cả chữ hoa, chữ thường và chữ số.
        </div>
      </div>

      {/* Form Action buttons */}
      <div className="d-flex justify-content-end gap-3 pt-3.5 border-top">
        <Button 
          type="button" 
          onClick={onCancel}
          className="bg-transparent border rounded-pill px-4 py-2 text-muted-custom fw-semibold"
          style={{ borderColor: '#cbd5e1', color: '#64748b', fontSize: '0.88rem' }}
        >
          Hủy
        </Button>
        
        <Button 
          type="submit" 
          className="btn-primary-glow border-0 rounded-pill px-4 py-2 d-flex align-items-center gap-2"
          style={{ fontSize: '0.88rem' }}
          disabled={submitting}
        >
          {submitting ? (
            <>
              <Icon icon="lucide:loader-2" width="16" />
              <span>Đang xử lý...</span>
            </>
          ) : isEdit ? (
            <>
              <Icon icon="lucide:save" width="16" />
              <span>Lưu thay đổi</span>
            </>
          ) : (
            <>
              <Icon icon="lucide:user-plus" width="16" />
              <span>Thêm tài khoản</span>
            </>
          )}
        </Button>
      </div>
    </Form>
  );
}
