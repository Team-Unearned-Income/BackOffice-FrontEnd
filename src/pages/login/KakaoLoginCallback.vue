<template>
  <div class="callback-wrap flex flex-center">
    <div class="text-center">
      <q-spinner color="primary" size="40px" />
      <div class="text-subtitle1 text-grey-7 q-mt-md">카카오 로그인 처리 중입니다...</div>
    </div>
  </div>
</template>

<script setup>
/**
 * 카카오 로그인 콜백 (/kakao-login)
 *
 * 카카오 인증 후 code 를 받아 처리:
 *   completeKakaoWebLoginIfPending() → code→카카오 토큰 교환
 *   → authApi.socialLoginSdk() → 우리 서비스 accessToken 수신
 *   → auth store 저장 → role(admin) 판별 → 대시보드/거부
 */
import { inject, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import COMMON from '@/constants/commonConstatns.js'
import { useAuthStore } from '@/stores/auth'
import { useUserStore } from '@/stores/user.js'
import { completeKakaoWebLoginIfPending } from '@/service/auth/kakaoWebSdk'
import { authApi } from '@/service/auth'

const emitter = inject('emitter')
const router = useRouter()
const authStore = useAuthStore()
const userStore = useUserStore()

const goLogin = (errorCode) =>
  router.replace({ name: 'Login', query: errorCode ? { error: errorCode } : {} })

onMounted(async () => {
  try {
    const result = await completeKakaoWebLoginIfPending()
    // 처리할 로그인 없음(직접 진입 등) → 로그인 화면
    if (!result) return goLogin()

    const data = await authApi.socialLoginSdk('kakao', {
      access_token: result.auth.access_token,
      refresh_token: result.auth.refresh_token
    })
    if (!data?.accessToken) throw new Error('accessToken 누락')
    authStore.setToken(data.accessToken)

    // 공통 스펙 1: role=admin 만 접근.
    // LoginData 에는 role 이 없어 JWT claim 으로 판별하고, claim 이 없으면
    // 백엔드가 admin API 를 403 으로 최종 차단한다 (handoff §9).
    const role = userStore.role
    if (role && role !== 'admin') {
      authStore.logout()
      userStore.$reset()
      return goLogin('forbidden')
    }

    router.replace({ name: 'Dashboard' })
  } catch (e) {
    authStore.logout()
    goLogin('failed')
  } finally {
    emitter.emit(COMMON.LOADING.HIDE)
  }
})
</script>

<style scoped lang="scss">
.callback-wrap {
  min-height: 100vh;
  background: #f5f7fb;
}
</style>
