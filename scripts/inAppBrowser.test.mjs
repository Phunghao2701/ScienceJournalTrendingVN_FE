import assert from 'node:assert/strict';
import { isInAppBrowser } from '../src/shared/utils/inAppBrowser.js';

const MESSENGER_IOS_UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 [FBAN/MessengerForiOS;FBAV/478.0.0.0.0;FBBV/123456;FBDV/iPhone15,2]';
const FACEBOOK_ANDROID_UA = 'Mozilla/5.0 (Linux; Android 14; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/120.0.0.0 Mobile Safari/537.36 [FB_IAB/FB4A;FBAV/470.0.0.0]';
const INSTAGRAM_UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Instagram 300.0.0.0.0';
const GENERIC_ANDROID_WEBVIEW_UA = 'Mozilla/5.0 (Linux; Android 13; SM-G991B Build/TP1A.220624.014; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/120.0.0.0 Mobile Safari/537.36';
const SAFARI_IOS_UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1';
const CHROME_DESKTOP_UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36';

assert.equal(isInAppBrowser(MESSENGER_IOS_UA), true, 'Messenger iOS webview should be detected');
assert.equal(isInAppBrowser(FACEBOOK_ANDROID_UA), true, 'Facebook Android webview should be detected');
assert.equal(isInAppBrowser(INSTAGRAM_UA), true, 'Instagram webview should be detected');
assert.equal(isInAppBrowser(GENERIC_ANDROID_WEBVIEW_UA), true, 'Generic Android "wv" webview should be detected');
assert.equal(isInAppBrowser(SAFARI_IOS_UA), false, 'Real Safari should not be flagged');
assert.equal(isInAppBrowser(CHROME_DESKTOP_UA), false, 'Real desktop Chrome should not be flagged');
assert.equal(isInAppBrowser(''), false, 'Empty user agent should not be flagged');
assert.equal(isInAppBrowser(undefined), false, 'Missing user agent should not be flagged');

console.log('inAppBrowser.test.mjs: all assertions passed');
