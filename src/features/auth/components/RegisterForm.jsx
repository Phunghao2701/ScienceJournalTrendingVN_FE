/**
 * File source thuộc hệ thống FE ResearchPulse.
 *
 * File: features\auth\components\RegisterForm.jsx
 */
import { useState } from 'react';
import { Form, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import ROUTES from '../../../app/routes/routePaths';
import InputField from '../../../shared/components/InputField';
import PasswordInput from './PasswordInput';
import DateInput from './DateInput';
import GenderSelect from './GenderSelect';
import RoleSelect from './RoleSelect';
import CheckboxField from './CheckboxField';
import SubmitButton from './SubmitButton';
import FormErrorMessage from './FormErrorMessage';

export default function RegisterForm({ onSubmit, isLoading, apiError }) {
  const [formData, setFormData] = useState({
    last_name: '',
    first_name: '',
    email: '',
    password: '',
    date_of_birth: '',
    gender: true, // Default to true (Nam)
    role: 'STUDENT', // Default to STUDENT
    terms: false
  });

  const [errors, setErrors] = useState({});

  const validateField = (name, value) => {
    let errorMsg = '';
    
    switch (name) {
      case 'last_name':
        if (!value.trim()) {
          errorMsg = 'Họ không được để trống';
        }
        break;
      case 'first_name':
        if (!value.trim()) {
          errorMsg = 'Tên không được để trống';
        }
        break;
      case 'email':
        if (!value.trim()) {
          errorMsg = 'Email không được để trống';
        } else if (!/\S+@\S+\.\S+/.test(value)) {
          errorMsg = 'Email không đúng định dạng';
        }
        break;
      case 'password':
        if (!value) {
          errorMsg = 'Mật khẩu không được để trống';
        } else if (value.length < 8) {
          errorMsg = 'Mật khẩu phải tối thiểu 8 ký tự';
        }
        break;
      case 'date_of_birth':
        if (!value) {
          errorMsg = 'Ngày sinh không được để trống';
        } else {
          const selectedDate = new Date(value);
          const today = new Date();
          if (selectedDate > today) {
            errorMsg = 'Ngày sinh không được trong tương lai';
          }
        }
        break;
      case 'terms':
        if (!value) {
          errorMsg = 'Bạn phải đồng ý với điều khoản để tiếp tục';
        }
        break;
      default:
        break;
    }

    setErrors(prev => ({
      ...prev,
      [name]: errorMsg
    }));

    return !errorMsg;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const val = type === 'checkbox' ? checked : value;
    
    setFormData(prev => ({
      ...prev,
      [name]: val
    }));

    // Clear error on change
    setErrors(prev => ({
      ...prev,
      [name]: ''
    }));
  };

  const handleBlur = (e) => {
    const { name, value, type, checked } = e.target;
    const val = type === 'checkbox' ? checked : value;
    validateField(name, val);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate all fields
    const fieldsToValidate = [
      'last_name',
      'first_name',
      'email',
      'password',
      'date_of_birth',
      'terms'
    ];

    let isValid = true;
    fieldsToValidate.forEach(field => {
      const fieldValid = validateField(field, formData[field]);
      if (!fieldValid) {
        isValid = false;
      }
    });

    if (!isValid) return;

    // Build payload for API (exclude terms)
    const payload = { ...formData };
    delete payload.terms;
    onSubmit({
      ...payload,
      last_name: payload.last_name.trim(),
      first_name: payload.first_name.trim()
    });
  };

  const termsLabel = (
    <span>
      Tôi đồng ý với{' '}
      <a href="#" className="text-decoration-none" style={{ color: 'var(--primary)', fontWeight: 500 }} onClick={e => e.preventDefault()}>
        Điều khoản dịch vụ
      </a>{' '}
      và{' '}
      <a href="#" className="text-decoration-none" style={{ color: 'var(--primary)', fontWeight: 500 }} onClick={e => e.preventDefault()}>
        Chính sách bảo mật
      </a>
    </span>
  );

  return (
    <Form onSubmit={handleSubmit} noValidate>
      {/* Server API Error Banner */}
      <FormErrorMessage message={apiError} />

      {/* Row: Last Name & First Name (Stacked on mobile, side-by-side on tablet/desktop) */}
      <Row className="g-3">
        <Col xs={12} sm={6}>
          <InputField
            label="Họ"
            name="last_name"
            value={formData.last_name}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="Nguyễn"
            error={errors.last_name}
            required
            disabled={isLoading}
          />
        </Col>
        <Col xs={12} sm={6}>
          <InputField
            label="Tên"
            name="first_name"
            value={formData.first_name}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="Văn A"
            error={errors.first_name}
            required
            disabled={isLoading}
          />
        </Col>
      </Row>

      {/* Email */}
      <InputField
        label="Email"
        name="email"
        type="email"
        value={formData.email}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder="name@email.com"
        error={errors.email}
        icon="lucide:mail"
        required
        disabled={isLoading}
      />

      {/* Password */}
      <PasswordInput
        label="Mật khẩu"
        name="password"
        value={formData.password}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder="Tối thiểu 8 ký tự"
        error={errors.password}
        required
        disabled={isLoading}
      />

      {/* Row: Date of Birth & Gender (Stacked on mobile, side-by-side on tablet/desktop) */}
      <Row className="g-3">
        <Col xs={12} sm={6}>
          <DateInput
            label="Ngày sinh"
            name="date_of_birth"
            value={formData.date_of_birth}
            onChange={handleChange}
            onBlur={handleBlur}
            error={errors.date_of_birth}
            required
            disabled={isLoading}
          />
        </Col>
        <Col xs={12} sm={6}>
          <GenderSelect
            label="Giới tính"
            name="gender"
            value={formData.gender}
            onChange={handleChange}
            error={errors.gender}
            required
            disabled={isLoading}
          />
        </Col>
      </Row>

      {/* Role Selector */}
      <RoleSelect
        label="Vai trò"
        name="role"
        value={formData.role}
        onChange={handleChange}
        error={errors.role}
        required
        disabled={isLoading}
      />

      {/* Terms Checkbox */}
      <CheckboxField
        name="terms"
        checked={formData.terms}
        onChange={handleChange}
        error={errors.terms}
        labelMarkup={termsLabel}
        disabled={isLoading}
      />

      {/* Submit Button */}
      <SubmitButton
        isLoading={isLoading}
        loadingText="Đang tạo tài khoản..."
        label="Tạo tài khoản"
      />

      {/* Link Redirect to Login */}
      <div className="text-center mt-4 text-sm font-medium">
        <span className="text-muted-custom" style={{ color: '#94a3b8 !important' }}>Đã có tài khoản? </span>
        <Link to={ROUTES.LOGIN} className="text-decoration-none" style={{ color: 'var(--primary)', fontWeight: 600 }}>
          Đăng nhập
        </Link>
      </div>
    </Form>
  );
}
