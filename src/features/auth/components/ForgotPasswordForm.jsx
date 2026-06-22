import { useState } from 'react';
import { Form } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import InputField from '../../../shared/components/InputField';
import ROUTES from '../../../app/routes/routePaths';
import SubmitButton from './SubmitButton';
import FormErrorMessage from './FormErrorMessage';

export default function ForgotPasswordForm({ onSubmit, isLoading, apiError }) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  const validateEmail = (val) => {
    if (!val.trim()) {
      return 'Email không được để trống';
    } else if (!/\S+@\S+\.\S+/.test(val)) {
      return 'Email không đúng định dạng';
    }
    return '';
  };

  const handleChange = (e) => {
    setEmail(e.target.value);
    setError('');
  };

  const handleBlur = () => {
    setError(validateEmail(email));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationError = validateEmail(email);
    if (validationError) {
      setError(validationError);
      return;
    }
    onSubmit(email.trim());
  };

  return (
    <Form onSubmit={handleSubmit} noValidate>
      {/* Server API Error Banner */}
      <FormErrorMessage message={apiError} />

      {/* Email Input */}
      <InputField
        label="ĐỊA CHỈ EMAIL"
        name="email"
        type="email"
        value={email}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder="name@email.com"
        error={error}
        icon="lucide:mail"
        required
        disabled={isLoading}
      />

      {/* Submit Button */}
      <div className="mt-4">
        <SubmitButton
          isLoading={isLoading}
          loadingText="Đang gửi yêu cầu..."
          label="Gửi liên kết đặt lại mật khẩu"
        />
      </div>

      {/* Link back to Login */}
      <div className="text-center mt-4 text-sm font-medium">
        <Link to={ROUTES.LOGIN} className="text-decoration-none" style={{ color: 'var(--primary)', fontWeight: 600 }}>
          Quay lại đăng nhập
        </Link>
      </div>
    </Form>
  );
}
