/**
 * 인증 API (BO) — 카카오 SDK 로그인 / 로그아웃
 *
 * knock-in-rn `lib/api/auth.ts` 의 socialLoginSdk / logout 이식.
 * 기존 axios 인스턴스(`@/common/library/axios`)를 재사용하며,
 * 성공 인터셉터가 반환하는 래퍼 `{ status, data, error }` 에서 payload(data)만 꺼낸다.
 */
import api from '@/common/library/axios'

const unwrap = (res) => res?.data

export const authApi = {
  /**
   * 소셜 로그인 (SDK 방식) — POST /sdk/oauth2/authorization/{provider}
   * @param {'kakao'|'apple'} provider
   * @param {{ access_token: string, refresh_token: string }} authObj
   * @returns {Promise<{ accessToken: string, basicInfo: boolean, preferenceInfo: boolean }>}
   */
  socialLoginSdk: (provider, authObj) =>
    api.post(`/sdk/oauth2/authorization/${provider}`, { authObj }).then(unwrap),

  /**
   * 로그아웃 — POST /auth/logout
   * @param {string} accessToken
   * @returns {Promise<{ updatedAt: string }>}
   */
  logout: (accessToken) => api.post('/auth/logout', { accessToken }).then(unwrap)
}

export default authApi
