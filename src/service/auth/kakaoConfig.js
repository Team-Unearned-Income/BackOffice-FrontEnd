/**
 * 카카오 로그인 설정 (웹 JS SDK 방식 — admin-auth-handoff.md 채택 방식 A)
 *
 * knock-in-rn `lib/auth/kakao-config.ts` 이식.
 * RN(EXPO_PUBLIC_*) → Vite(VITE_*) 환경변수로 교체.
 *
 * 필요 키 (카카오 개발자 콘솔에서 발급):
 *  - VITE_KAKAO_JS_KEY       : JavaScript 키 (SDK init)
 *  - VITE_KAKAO_REST_API_KEY : REST API 키 (code → 토큰 교환)
 */
export const KAKAO_CONFIG = {
  restApiKey: import.meta.env.VITE_KAKAO_REST_API_KEY ?? '',
  jsKey: import.meta.env.VITE_KAKAO_JS_KEY ?? '',
  webSdkUrl: 'https://t1.kakaocdn.net/kakao_js_sdk/2.7.4/kakao.min.js'
}

export const KAKAO_ENDPOINTS = {
  authorize: 'https://kauth.kakao.com/oauth/authorize',
  token: 'https://kauth.kakao.com/oauth/token',
  profile: 'https://kapi.kakao.com/v2/user/me',
  logout: 'https://kapi.kakao.com/v1/user/logout'
}
