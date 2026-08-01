<template>
  <div class="forbidden-wrap column items-center justify-center bg-dark">
    <div class="row items-center q-py-xl">
      <q-icon name="lock" color="primary" size="60px" class="q-mr-md" />
      <span class="text-primary text-bold text-h3">권한이 필요합니다</span>
    </div>
    <div class="text-grey-4 text-subtitle1 q-mb-xl">관리자(admin) 권한이 없는 계정입니다. 접근이 거부되었습니다.</div>
    <q-btn color="primary" label="로그인 페이지로 돌아가기" @click="backToLogin" />
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const backToLogin = () => {
  authStore.logout()
  router.replace({ name: 'Login' })
}
</script>

<style scoped lang="scss">
.forbidden-wrap {
  min-height: 100vh;
}
</style>
