import React, { useEffect, useState } from 'react';
import { Alert, Card } from 'react-bootstrap';
import { useNavigate, useParams, Link } from 'react-router-dom';
import UserAccountForm from '../../components/account/UserAccountForm';
import { getAdminUserById, updateAdminUser } from '../../api/adminUsers.api';
import Icon from '../../../../shared/components/Icon';
import ROUTES from '../../../../app/routes/routePaths';

const getApiErrorMessage = (error, fallback) => {
  if (error.response?.status === 403) {
    return 'Backend từ chối quyền admin: token hiện tại không có role ADMINISTRATOR.';
  }

  return error.response?.data?.message || fallback;
};

const toApiEnum = (value = '') => String(value).trim().toUpperCase().replace(/\s+/g, '_');

const toTitleCaseEnum = (value = '') => {
  return String(value)
    .toLowerCase()
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
};

const buildUpdateUserPayload = (payload) => ({
  ...payload,
  role: toApiEnum(payload.role),
  status: toApiEnum(payload.status),
});

const normalizeUser = (user = {}) => ({
  id: user.id || user.user_id || user.uuid,
  first_name: user.first_name || user.firstName || '',
  last_name: user.last_name || user.lastName || '',
  name:
    user.name ||
    [user.first_name || user.firstName || '', user.last_name || user.lastName || '']
      .filter(Boolean)
      .join(' ')
      .trim(),
  email: user.email || '',
  phone: user.phone || '',
  institution: user.institution || '',
  role: toTitleCaseEnum(user.role || 'RESEARCHER'),
  status: toTitleCaseEnum(user.status || 'ACTIVE'),
  avatar: user.avatar || user.avatar_url || '',
});

/**
 * UpdateUserAccountPage Component
 * Trang cập nhật thông tin tài khoản người dùng có sẵn trên hệ thống (Page 13).
 */
export default function UpdateUserAccountPage() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [userItem, setUserItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingError, setLoadingError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    let isMounted = true;

    const fetchUser = async () => {
      try {
        setLoading(true);
        setLoadingError('');

        const response = await getAdminUserById(id);

        if (!isMounted) return;
        setUserItem(normalizeUser(response.data?.data || {}));
      } catch (error) {
        if (!isMounted) return;
        setUserItem(null);
        setLoadingError(getApiErrorMessage(error, 'Không thể tải thông tin người dùng.'));
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchUser();

    return () => {
      isMounted = false;
    };
  }, [id]);

  /**
   * Cập nhật thông tin người dùng qua API thật.
   */
  const handleFormSubmit = async (payload) => {
    try {
      setSubmitting(true);
      setSubmitError('');
      await updateAdminUser(id, buildUpdateUserPayload(payload));
      alert('Cập nhật thông tin người dùng thành công!');
      navigate(ROUTES.ADMIN_USERS);
    } catch (error) {
      setSubmitError(getApiErrorMessage(error, 'Không thể cập nhật thông tin người dùng.'));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="container-fluid py-4 text-center text-muted-custom">Đang tải thông tin người dùng...</div>;
  }

  if (!userItem) {
    return (
      <div className="container-fluid py-4 text-center">
        <div className="alert alert-danger border-0 rounded-4 p-4 shadow-sm mx-auto" style={{ maxWidth: '600px' }}>
          <Icon icon="lucide:alert-triangle" width="32" className="text-danger mb-2" />
          <h5 className="fw-bold mb-1">Không tìm thấy người dùng</h5>
          <p className="mb-3 small">{loadingError || 'Tài khoản này có thể đã bị xóa hoặc không tồn tại trên hệ thống.'}</p>
          <button onClick={() => navigate(ROUTES.ADMIN_USERS)} className="btn btn-outline-danger btn-sm rounded-pill px-4">
            Quay lại Danh sách
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid py-2">
      <nav aria-label="breadcrumb" className="mb-3">
        <ol className="breadcrumb text-muted-custom small mb-0">
          <li className="breadcrumb-item"><Link to={ROUTES.ADMIN_USERS} className="text-decoration-none text-muted-custom hover-primary">Account</Link></li>
          <li className="breadcrumb-item"><Link to={ROUTES.ADMIN_USERS} className="text-decoration-none text-muted-custom hover-primary">User Directory</Link></li>
          <li className="breadcrumb-item active" aria-current="page">Update User</li>
        </ol>
      </nav>

      <div className="mb-4">
        <h1 className="font-display fw-bold text-main mb-1" style={{ fontSize: '1.8rem' }}>Cập nhật thông tin người dùng</h1>
        <p className="text-muted-custom small mb-0" style={{ maxWidth: '750px' }}>
          Modify profile settings, adjust organizational roles, and update security credentials for this platform contributor.
        </p>
      </div>

      <div className="mx-auto" style={{ maxWidth: '800px' }}>
        <Card className="p-4 p-md-5 rounded-4 border bg-white shadow-sm mb-5">
          {submitError && (
            <Alert variant="danger" className="border-0 rounded-3 small">
              {submitError}
            </Alert>
          )}

          <UserAccountForm 
            isEdit={true}
            initialData={userItem}
            onSubmit={handleFormSubmit}
            onCancel={() => navigate(ROUTES.ADMIN_USERS)}
            submitting={submitting}
          />
        </Card>
      </div>
    </div>
  );
}
