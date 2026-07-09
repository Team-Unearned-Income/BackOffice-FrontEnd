<template>
  <div class="callback-wrap flex flex-center">
    <div class="text-center">
      <q-spinner color="primary" size="40px" />
      <div class="text-subtitle1 text-grey-7 q-mt-md">로그인 처리 중입니다...</div>
    </div>
  </div>
</template>

<script setup>
/**
 * 백엔드 OAuth 로그인 성공 콜백 (/auth/success)
 *
 * 백엔드(스프링 시큐리티)가 카카오 로그인 성공 시 accessToken 쿠키(+세션)를 세팅하고
 * `${client-url}/auth/success` 로 리다이렉트한다. API 인증은 그 쿠키/세션으로 자동 처리되므로
 * (Vite 프록시 + axios withCredentials), 여기선 가능하면 토큰을 auth store 에도 넣고 대시보드로 이동한다.
 * (accessToken 쿠키가 HttpOnly 면 JS로 못 읽지만, API는 쿠키/세션으로 인증되므로 무방)
 */
import { onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const readCookie = (name) => {
  const m = document.cookie.match(new RegExp('(?:^|; )' + name + '=([^;]*)'))
  return m ? decodeURIComponent(m[1]) : ''
}

onMounted(() => {
  const token = route.query.accessToken || route.query.token || readCookie('accessToken')
  if (token) authStore.setToken(String(token))
  router.replace({ name: 'Dashboard' })
})
</script>

<style scoped lang="scss">
.callback-wrap {
  min-height: 100vh;
  background: #f5f7fb;
}
</style>
