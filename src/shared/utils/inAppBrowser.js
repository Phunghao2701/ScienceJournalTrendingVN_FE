// Google chặn cứng OAuth sign-in ("403: disallowed_user_agent") khi request đến từ
// trình duyệt nhúng trong app khác (Messenger, Facebook, Instagram, TikTok, ...).
// Không có cách nào để app "vượt" chặn này — chỉ có thể phát hiện trước và hướng dẫn
// người dùng mở bằng trình duyệt thật (Safari/Chrome).
const IN_APP_BROWSER_PATTERNS = [
  /FBAN|FBAV|FB_IAB/i,   // Facebook & Messenger (iOS: FBAN/MessengerForiOS, Android: FB_IAB)
  /Instagram/i,
  /Line\//i,
  /MicroMessenger/i,     // WeChat
  /TikTok|BytedanceWebview/i,
  /Twitter/i,
  /; ?wv\)/i,             // Generic Android WebView marker
];

export function isInAppBrowser(userAgent = (typeof navigator !== 'undefined' ? navigator.userAgent : '')) {
  if (!userAgent) return false;
  return IN_APP_BROWSER_PATTERNS.some((pattern) => pattern.test(userAgent));
}
