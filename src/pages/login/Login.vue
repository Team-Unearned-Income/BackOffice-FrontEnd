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

      <!-- 개발용 토큰 주입 로그인 (production 미노출) -->
      <div v-if="envProfile !== 'production'" class="dev-login q-mt-lg">
        <q-separator class="q-mb-md" />
        <div class="text-caption text-grey-7 q-mb-xs">개발용 · accessToken 직접 주입</div>
        <q-input
          v-model="devToken"
          type="textarea"
          dense
          outlined
          autogrow
          placeholder="유효한 admin accessToken(JWT) 붙여넣기"
          input-style="max-height: 120px"
        />
        <q-btn
          class="full-width q-mt-sm"
          color="dark"
          unelevated
          no-caps
          label="토큰으로 로그인 (dev)"
          :disable="!devToken.trim()"
          @click="loginWithDevToken"
        />
      </div>

      <div class="text-caption text-grey-6 text-center q-mt-lg">
        ※ admin 권한이 부여된 계정만 접속할 수 있으며, 주요 활동은 로그로 기록됩니다.
      </div>
    </q-card>
  </div>
</template>

<script setup>
import { computed, inject, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import COMMON from '@/constants/commonConstatns.js'
import { useAuthStore } from '@/stores/auth'

const emitter = inject('emitter')
const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const envProfile = import.meta.env.MODE // '로컬: development' | '개발: dev'

const ERROR_MESSAGES = {
  forbidden: '관리자(admin) 권한이 없는 계정입니다. 접근이 거부되었습니다.',
  failed: '로그인에 실패했습니다. 잠시 후 다시 시도해 주세요.',
  denied: '로그인이 취소되었습니다.',
  unsupported: '현재는 카카오 로그인만 지원합니다.'
}
const errorMessage = computed(() => ERROR_MESSAGES[route.query.error] ?? '')

onMounted(() => {
  emitter.emit(COMMON.LOADING.HIDE)
})

/**
 * 백엔드(스프링 시큐리티) OAuth 로그인.
 * 백엔드가 카카오 인증 전체를 서버측(시크릿 포함)에서 처리 → accessToken 쿠키 + 세션 발급 →
 * `${client-url}/auth/success`(기본값 = 이 앱이 뜬 localhost:5173)로 복귀.
 */
const backendOauthUrl = (provider) => {
  const base =
    import.meta.env.VITE_BACKEND_URL || `${window.location.protocol}//${window.location.hostname}:8080`
  return `${base}/oauth2/authorization/${provider}`
}
const loginWith = (provider) => {
  if (provider !== 'kakao') {
    return router.replace({ name: 'Login', query: { error: 'unsupported' } })
  }
  window.location.href = backendOauthUrl('kakao') // 백엔드로 전체 리다이렉트
}

/**
 * 개발용: 유효한 admin accessToken(JWT)을 직접 auth store에 주입해 로그인.
 * (프론트 단독 카카오 로그인이 막혀 있어, 백엔드/실서비스에서 받은 토큰으로 BO 테스트)
 * production 빌드에서는 노출되지 않는다.
 */
const devToken = ref('')
const loginWithDevToken = () => {
  const token = devToken.value.trim()
  if (!token) return
  authStore.setToken(token)
  router.replace({ name: 'Dashboard' })
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
