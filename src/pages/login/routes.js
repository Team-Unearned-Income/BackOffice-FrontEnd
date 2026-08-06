// 소셜 로그인은 LNB/헤더가 없는 단독 화면 → 절대 경로로 최상위에 등록
const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('./Login.vue')
  },
  {
    // 카카오/애플 OAuth 콜백 (provider 콘솔의 redirect URI: /login/callback/:provider)
    path: '/login/callback/:provider',
    name: 'SocialLoginCallback',
    component: () => import('./SocialCallback.vue')
  },
  {
    // 카카오 웹 JS SDK 로그인 콜백 (카카오 콘솔 Redirect URI: /kakao-login) — 방식 A(미사용)
    path: '/kakao-login',
    name: 'KakaoLoginCallback',
    component: () => import('./KakaoLoginCallback.vue')
  },
  {
    // 백엔드 OAuth 로그인 성공 복귀 (백엔드 app.client-success-url = ${client-url}/auth/success)
    path: '/auth/success',
    name: 'AuthSuccess',
    component: () => import('./KakaoSuccess.vue')
  }
]

export default routes
