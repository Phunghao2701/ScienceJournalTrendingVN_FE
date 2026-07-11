// Các endpoint xác thực mà 401 nghĩa là "sai thông tin đăng nhập / chưa xác thực",
// không phải "phiên đã hết hạn". Interceptor không được thử refresh token cho các
// endpoint này — nếu không, lỗi refresh (vd "Refresh token không được để trống" khi
// user chưa từng đăng nhập) sẽ ghi đè lên thông báo lỗi thật (vd sai mật khẩu).
const AUTH_ENDPOINTS_WITHOUT_REFRESH = ['/auth/login', '/auth/register', '/auth/google', '/auth/refresh'];

export function shouldSkipTokenRefresh(requestUrl) {
  if (!requestUrl) return false;
  return AUTH_ENDPOINTS_WITHOUT_REFRESH.some((path) => requestUrl.includes(path));
}
