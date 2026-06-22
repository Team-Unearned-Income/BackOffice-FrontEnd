/**
 * Knock-in BO 소셜 로그인 (카카오 / 애플)
 *
 * 정책(공통 스펙 1): 앱과 동일한 카카오/애플 소셜 로그인. 별도 ID/PW 없음.
 * 로그인 성공 후 서버가 내려준 JWT 의 role 로 분기 → admin: 대시보드 / user: 권한 없음.
 *
 * 흐름 (OAuth Authorization Code):
 *   1) Login.vue 에서 provider 인증 URL 로 전체 리다이렉트 (buildAuthorizeUrl)
 *   2) provider 가 /login/callback/:provider 로 code 와 함께 리다이렉트
 *   3) SocialCallback.vue 에서 exchangeCode 로 백엔드에 code 전달 → accessToken(JWT) 수신
 *   4) authStore.setToken → userStore.role 로 분기
 *
 * TODO(백엔드 연동):
 *   - USE_MOCK 를 false 로 변경
 *   - .env 에 VITE_KAKAO_CLIENT_ID / VITE_APPLE_CLIENT_ID 설정
 *   - exchangeCode 의 백엔드 엔드포인트 경로/응답 형식 확정
 *   - provider 콘솔에 buildRedirectUri 값(redirect URI) 등록
 */

/** 백엔드/제공자 키 연동 전까지 mock 으로 동작. 연동 시 false 로 변경. */
export const USE_MOCK = true

/** mock 로그인 시 부여할 역할. 'user' 로 바꾸면 권한 없음(에러) 분기를 확인할 수 있다. */
const MOCK_ROLE = 'admin'

const PROVIDERS = {
  kakao: {
    label: '카카오',
    authorizeUrl: 'https://kauth.kakao.com/oauth/authorize',
    clientId: import.meta.env.VITE_KAKAO_CLIENT_ID,
    scope: 'account_email'
  },
  apple: {
    label: 'Apple',
    authorizeUrl: 'https://appleid.apple.com/auth/authorize',
    clientId: import.meta.env.VITE_APPLE_CLIENT_ID,
    scope: 'name email',
    responseMode: 'form_post'
  }
}

/** 지원하는 로그인 수단인지 */
export const isSupportedProvider = (provider) =>
  Object.prototype.hasOwnProperty.call(PROVIDERS, provider)

/** provider 콜백 redirect URI (provider 콘솔에 등록되어야 함) */
export const buildRedirectUri = (provider) =>
  `${window.location.origin}/login/callback/${provider}`

/** provider 인증 페이지 URL */
export const buildAuthorizeUrl = (provider) => {
  const cfg = PROVIDERS[provider]
  if (!cfg) throw new Error(`지원하지 않는 로그인 수단: ${provider}`)

  const params = new URLSearchParams({
    client_id: cfg.clientId ?? '',
    redirect_uri: buildRedirectUri(provider),
    response_type: 'code',
    scope: cfg.scope ?? ''
  })
  if (cfg.responseMode) params.set('response_mode', cfg.responseMode)

  return `${cfg.authorizeUrl}?${params.toString()}`
}

/**
 * provider 가 돌려준 code 를 백엔드에 전달하고 accessToken(JWT) 을 받는다.
 * @param {string} provider 'kakao' | 'apple'
 * @param {string} code     provider authorization code
 * @returns {Promise<{ accessToken: string }>}
 */
export const exchangeCode = async (provider, code) => {
  if (USE_MOCK) {
    // TODO(백엔드 연동): 아래 mock 블록 제거
    return {
      accessToken: makeMockJwt({
        role: MOCK_ROLE,
        adminId: `${PROVIDERS[provider]?.label ?? ''} 관리자`,
        userId: 1,
        userName: '관리자'
      })
    }
  }

  // TODO(백엔드 연동): 실제 교환 엔드포인트로 교체
  const res = await fetch(`/api/admin/auth/${provider}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code, redirectUri: buildRedirectUri(provider) })
  })
  if (!res.ok) throw new Error('소셜 로그인 교환 실패')

  // 백엔드 응답 형식에 맞춰 조정 (Authorization 헤더 또는 body.accessToken)
  const accessToken = res.headers.get('authorization') || (await res.json()).accessToken
  if (!accessToken) throw new Error('accessToken 누락')
  return { accessToken }
}

/** dev mock JWT (서명 없음 / jwt-decode 는 payload 만 base64 디코드한다) */
const makeMockJwt = (payload) => {
  const b64url = (obj) =>
    btoa(unescape(encodeURIComponent(JSON.stringify(obj))))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '')
  return `${b64url({ alg: 'none', typ: 'JWT' })}.${b64url(payload)}.`
}
