<template>
  <div class="login-wrap flex flex-center">
    <q-card flat bordered class="login-card">
      <div class="text-center q-mb-lg">
        <div class="brand text-h4 text-bold">KNOCK-IN</div>
        <div class="text-subtitle2 text-grey-7 q-mt-xs">백오피스 관리자</div>
        <div
          v-if="envProfile !== 'production'"
          class="dev-banner text-red text-caption text-bold q-mt-sm"
        >
          {{ envProfile === 'development' ? '로컬' : '개발' }} 환경입니다 (접속 주소 확인)
        </div>
      </div>

      <q-banner v-if="errorMessage" dense rounded class="bg-red-1 text-red-9 q-mb-md">
        <template #avatar><q-icon name="error_outline" color="red" /></template>
        {{ errorMessage }}
      </q-banner>

      <div class="column q-gutter-md">
        <q-btn
          unelevated
          no-caps
          class="social-btn kakao"
          icon="chat_bubble"
          label="카카오로 로그인"
          @click="loginWith('kakao')"
        />
        <q-btn
          unelevated
          no-caps
          class="social-btn apple"
          icon="apple"
          label="Apple로 로그인"
          @click="loginWith('apple')"
        />
      </div>

      <div class="text-caption text-grey-6 text-center q-mt-lg">
        ※ admin 권한이 부여된 계정만 접속할 수 있으며, 주요 활동은 로그로 기록됩니다.
      </div>
    </q-card>
  </div>
</template>

<script setup>
import { computed, inject, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import COMMON from '@/constants/commonConstatns.js'
import { USE_MOCK, buildAuthorizeUrl } from './socialLogin.js'

const emitter = inject('emitter')
const route = useRoute()
const router = useRouter()

const envProfile = import.meta.env.MODE // '로컬: development' | '개발: dev'

const ERROR_MESSAGES = {
  forbidden: '관리자(admin) 권한이 없는 계정입니다. 접근이 거부되었습니다.',
  failed: '로그인에 실패했습니다. 잠시 후 다시 시도해 주세요.',
  denied: '로그인이 취소되었습니다.'
}
const errorMessage = computed(() => ERROR_MESSAGES[route.query.error] ?? '')

onMounted(() => {
  emitter.emit(COMMON.LOADING.HIDE)
})

const loginWith = (provider) => {
  if (USE_MOCK) {
    // TODO(백엔드 연동): mock 분기 제거. 실제로는 아래 window.location 리다이렉트만 사용.
    router.push({ name: 'SocialLoginCallback', params: { provider }, query: { code: 'mock-code' } })
    return
  }
  window.location.href = buildAuthorizeUrl(provider)
}
</script>

<style scoped lang="scss">
.login-wrap {
  min-height: 100vh;
  background: #f5f7fb;
}

.login-card {
  width: 360px;
  max-width: 90vw;
  padding: 2.5rem 2rem;
  border-radius: 12px;
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.08);
}

.brand {
  letter-spacing: 2px;
}

.social-btn {
  height: 48px;
  font-size: 15px;
  font-weight: 700;
  border-radius: 8px;

  &.kakao {
    background: #fee500;
    color: #191600;
  }

  &.apple {
    background: #000;
    color: #fff;
  }
}

.dev-banner {
  animation: fadeBlink 2s infinite;
}

@keyframes fadeBlink {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.4;
  }
}
</style>
