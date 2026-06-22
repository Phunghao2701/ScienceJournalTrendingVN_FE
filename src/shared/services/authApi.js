// authApi.js
// Tập trung tất cả các API call liên quan đến auth.
// Không viết logic ở đây — chỉ gọi endpoint và trả về response.

import httpClient from '../../../shared/services/httpClient';

const authApi = {
  // Gửi token lên BE để xác thực kích hoạt tài khoản
  // GET /api/v1/auth/verify?token=<activation_token>
  verifyAccount: (token) => {
    return httpClient.get('/auth/verify', { params: { token } });
  },
};

export default authApi;