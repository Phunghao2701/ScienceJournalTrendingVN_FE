import api from "../../../shared/services/api";

/**
 * Cập nhật thông tin hồ sơ của người dùng đăng nhập hiện tại.
 * Gửi yêu cầu PUT đến endpoint '/users/me'.
 * 
 * @param {Object} data - Thông tin cập nhật (first_name, last_name, gender, date_of_birth, url_image, v.v.).
 * @returns {Promise<Object>} Trả về dữ liệu phản hồi từ backend.
 */
export const updateProfile = async (data) => {
  const response = await api.put("/users/me", data);
  return response.data;
};

/**
 * Xóa tài khoản của người dùng đăng nhập hiện tại.
 * Gửi yêu cầu DELETE đến endpoint '/users/me'.
 * 
 * @returns {Promise<Object>} Trả về phản hồi xác nhận từ backend.
 */
export const deleteProfile = async () => {
  const response = await api.delete("/users/me");
  return response.data;
};