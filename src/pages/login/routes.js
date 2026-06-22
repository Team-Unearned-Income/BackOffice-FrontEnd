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
  }
]

export default routes
