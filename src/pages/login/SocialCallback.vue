<template>
  <div class="callback-wrap flex flex-center">
    <div class="text-center">
      <q-spinner color="primary" size="40px" />
      <div class="text-subtitle1 text-grey-7 q-mt-md">로그인 처리 중입니다...</div>
    </div>
  </div>
</template>

<script setup>
import { inject, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import COMMON from '@/constants/commonConstatns.js'
import { useAuthStore } from '@/stores/auth'
import { useUserStore } from '@/stores/user.js'
import { exchangeCode, isSupportedProvider } from './socialLogin.js'

const emitter = inject('emitter')
const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const userStore = useUserStore()

/** 실패/거부 시 에러 코드와 함께 로그인 화면으로 복귀 */
const goLogin = (errorCode) => {
  router.replace({ name: 'Login', query: { error: errorCode } })
}

onMounted(async () => {
  emitter.emit(COMMON.LOADING.HIDE)

  const { provider } = route.params
  const { code, error } = route.query

  // provider 측에서 거부/취소된 경우
  if (error || !code) {
    return goLogin('denied')
  }
  if (!isSupportedProvider(provider)) {
    return goLogin('failed')
  }

  try {
    const { accessToken } = await exchangeCode(provider, code)
    authStore.setToken(accessToken)

    // 공통 스펙 1: role=admin → 대시보드 / role=user → 권한 없음
    if (userStore.role === 'admin') {
      router.replace({ name: 'Dashboard' })
    } else {
      authStore.logout()
      userStore.$reset()
      goLogin('forbidden')
    }
  } catch (e) {
    authStore.logout()
    goLogin('failed')
  }
})
</script>

<style scoped lang="scss">
.callback-wrap {
  min-height: 100vh;
  background: #f5f7fb;
}
</style>
