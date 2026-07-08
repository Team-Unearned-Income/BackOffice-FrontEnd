/**
 * 카카오 웹 로그인 (JS SDK) — knock-in-rn `lib/auth/kakao-web-sdk.ts` 이식.
 * RN `Platform` 가드 제거(항상 웹), 환경변수 VITE_* 사용.
 *
 * 흐름:
 *   startKakaoWebLogin()               → Kakao.Auth.authorize (카카오로 전체 리다이렉트)
 *   completeKakaoWebLoginIfPending()   → /kakao-login 복귀 시 code → 카카오 토큰 교환 + 프로필
 *
 * redirectUri = `${origin}/kakao-login` → 카카오 콘솔 Redirect URI 에 등록 필요.
 */
import { KAKAO_CONFIG, KAKAO_ENDPOINTS } from './kakaoConfig'

const STATE_STORAGE_KEY = 'kakaoWebSdk:state'

const getRedirectUri = () => `${window.location.origin}/kakao-login`

let sdkPromise = null

/** 카카오 JS SDK 동적 로드 + init (1회) */
const loadKakaoSdk = () => {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return Promise.reject(new Error('window/document not available'))
  }
  if (!KAKAO_CONFIG.jsKey) {
    return Promise.reject(new Error('VITE_KAKAO_JS_KEY 가 설정되지 않았습니다.'))
  }
  if (window.Kakao && window.Kakao.isInitialized()) {
    return Promise.resolve(window.Kakao)
  }
  if (sdkPromise) return sdkPromise

  sdkPromise = new Promise((resolve, reject) => {
    const finishInit = () => {
      const Kakao = window.Kakao
      if (!Kakao) {
        reject(new Error('Kakao SDK loaded but window.Kakao is missing'))
        return
      }
      if (!Kakao.isInitialized()) Kakao.init(KAKAO_CONFIG.jsKey)
      resolve(Kakao)
    }

    const existing = document.querySelector('script[data-kakao-sdk="true"]')
    if (existing) {
      if (window.Kakao) finishInit()
      else existing.addEventListener('load', finishInit, { once: true })
      return
    }

    const script = document.createElement('script')
    script.src = KAKAO_CONFIG.webSdkUrl
    script.async = true
    script.dataset.kakaoSdk = 'true'
    script.onload = finishInit
    script.onerror = () => reject(new Error('Failed to load Kakao JS SDK'))
    document.head.appendChild(script)
  })

  return sdkPromise
}

/** CSRF 방지용 state 생성 */
const generateState = () => {
  const arr = new Uint8Array(16)
  crypto.getRandomValues(arr)
  return Array.from(arr, (b) => b.toString(16).padStart(2, '0')).join('')
}

/** 로그인 버튼 클릭 → 카카오 인증 페이지로 전체 리다이렉트 */
export async function startKakaoWebLogin() {
  const Kakao = await loadKakaoSdk()
  const state = generateState()
  window.sessionStorage.setItem(STATE_STORAGE_KEY, state)
  Kakao.Auth.authorize({
    redirectUri: getRedirectUri(),
    state,
    scope: 'profile_nickname,profile_image,account_email'
  })
}

/**
 * /kakao-login 복귀 시 처리. code 가 없으면 null 반환.
 * @returns {Promise<{ auth: { access_token, refresh_token }, profile: object } | null>}
 */
export async function completeKakaoWebLoginIfPending() {
  if (typeof window === 'undefined') return null

  const url = new URL(window.location.href)
  const code = url.searchParams.get('code')
  const error = url.searchParams.get('error')
  const returnedState = url.searchParams.get('state')

  if (!code && !error) return null

  // 처리할 code/state 를 URL 에서 제거
  const cleanUrl = `${url.pathname}${url.hash}`
  window.history.replaceState({}, '', cleanUrl)

  if (error) {
    const desc = url.searchParams.get('error_description')
    throw new Error(`Kakao authorize error: ${error}${desc ? ` — ${desc}` : ''}`)
  }

  const expectedState = window.sessionStorage.getItem(STATE_STORAGE_KEY)
  window.sessionStorage.removeItem(STATE_STORAGE_KEY)
  if (!expectedState || expectedState !== returnedState) {
    throw new Error('State mismatch (possible CSRF)')
  }

  if (!KAKAO_CONFIG.restApiKey) {
    throw new Error('VITE_KAKAO_REST_API_KEY 가 필요합니다 (토큰 교환).')
  }

  // code → 카카오 access_token / refresh_token 교환
  const tokenRes = await fetch(KAKAO_ENDPOINTS.token, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: KAKAO_CONFIG.restApiKey,
      redirect_uri: getRedirectUri(),
      code
    }).toString()
  })
  if (!tokenRes.ok) {
    throw new Error(`Token exchange failed (${tokenRes.status}): ${await tokenRes.text()}`)
  }
  const auth = await tokenRes.json()

  // 프로필 조회는 로그인에 필수가 아니다(백엔드가 카카오 토큰으로 처리).
  // 동의항목 미설정 등으로 실패해도 로그인을 막지 않도록 비치명적으로 처리.
  let profile = null
  try {
    const Kakao = await loadKakaoSdk()
    Kakao.Auth.setAccessToken(auth.access_token)
    profile = await Kakao.API.request({ url: '/v2/user/me' })
  } catch (e) {
    console.warn('Kakao profile fetch failed (non-fatal):', e)
  }

  return { auth, profile }
}

/** 카카오 세션 로그아웃 (선택) */
export async function logoutWithKakaoWebSDK() {
  const Kakao = await loadKakaoSdk()
  await new Promise((resolve) => Kakao.Auth.logout(() => resolve()))
}
