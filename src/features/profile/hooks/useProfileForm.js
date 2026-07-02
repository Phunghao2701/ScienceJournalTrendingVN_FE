import { useState, useEffect, useMemo, useCallback } from 'react';
import useAuth from '../../auth/hooks/useAuth';
import { isAuthenticated as isAuthenticatedUtil } from '../../../shared/utils/auth';

/**
 * Quản lý form state cho trang hồ sơ cá nhân.
 * Đọc user từ useAuth, đồng bộ vào form, và delegate save/delete
 * về useAuth (nơi đã có logic gọi api và cập nhật store).
 */
export default function useProfileForm() {
  const {
    user,
    isAuthenticated,
    fetchProfile,
    updateProfile,
    deleteAccount,
    isLoading,
    error,
  } = useAuth();

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    role: '',
    gender: true,
    date_of_birth: '',
    url_image: '',
  });

  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);

  const computedIsAuthenticated = useMemo(() => {
    return !!(user || isAuthenticated);
  }, [isAuthenticated, user]);

  // Sync user data into form whenever user changes.
  useEffect(() => {
    if (!user) return;
    setFormData({
      first_name: user.first_name || '',
      last_name: user.last_name || '',
      email: user.email || '',
      role: user.role || '',
      gender: user.gender ?? true,
      date_of_birth: (() => {
        const v = user.date_of_birth;
        if (!v) return '';
        if (typeof v === 'string') return v.includes('T') ? v.slice(0, 10) : v;
        if (v instanceof Date) return v.toISOString().slice(0, 10);
        return String(v);
      })(),
      url_image: user.url_image || '',
    });
  }, [user]);

  // Fetch profile on mount if authenticated (including late hydration).
  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      const shouldFetch = computedIsAuthenticated || (await isAuthenticatedUtil());
      if (!cancelled && shouldFetch) {
        try { await fetchProfile(); } catch { /* error handled by useAuth */ }
      }
    };
    run();
    return () => { cancelled = true; };
  }, [computedIsAuthenticated, fetchProfile]);

  /**
   * Update a single form field.
   */
  const setField = useCallback((field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }, []);

  /**
   * Save profile changes to backend.
   * @returns {Promise<boolean>} true on success.
   */
  const handleSave = useCallback(async () => {
    setIsSaving(true);
    setSaveError(null);
    try {
      await updateProfile({
        first_name: formData.first_name,
        last_name: formData.last_name,
        gender: formData.gender,
        date_of_birth: formData.date_of_birth,
        url_image: formData.url_image,
      });
      return true;
    } catch (err) {
      setSaveError(err.response?.data?.message || err.message || 'Cập nhật thất bại');
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [formData, updateProfile]);

  /**
   * Delete the current user account and redirect.
   * The navigation is handled inside useAuth.deleteAccount.
   */
  const handleDeleteAccount = useCallback(async () => {
    try {
      await deleteAccount();
    } catch (err) {
      setSaveError(err.response?.data?.message || err.message || 'Xóa tài khoản thất bại');
    }
  }, [deleteAccount]);

  return {
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
  };
}
