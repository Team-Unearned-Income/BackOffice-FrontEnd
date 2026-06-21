<template>
  <div class="admin_wrap flex column">
    <q-form ref="loginRef">
      <div class="flex justify-center">
        <q-img :src="seoullandAppLogo" style="width: 20%; border-radius: 10px" />
      </div>
      <div class="text-center">
        <h6 class="text-bold">서울랜드 앱 관리자 페이지</h6>
        <div
          v-if="envProfile === 'development'"
          class="dev-banner text-red text-h6 text-bold q-mt-sm"
        >
          로컬 페이지입니다!!!!! (접속 주소 확인하세요)
        </div>
        <div v-if="envProfile === 'dev'" class="dev-banner text-red text-h6 text-bold q-mt-sm">
          개발 페이지입니다!!!!! (접속 주소 확인하세요)
        </div>
      </div>
      <div class="login_page">
        <div>
          <q-input v-model="model.id" placeholder="아이디" autocomplete="userId" />
        </div>
        <div>
          <q-input
            v-model="model.pw"
            type="password"
            placeholder="비밀번호"
            autocomplete="password"
            @keyup.enter="onLogin"
          />
        </div>
        <div class="q-py-lg">
          ※ 인가된 관리자만 접속 가능하며, 중요 활동의 경우 로그로 기록됩니다.
        </div>
        <div class="flex justify-center">
          <q-btn label="로그인" @click="onLogin" />
        </div>
      </div>
    </q-form>
  </div>
</template>
<script setup>
import { inject, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import COMMON from '@/constants/commonConstatns.js'
import seoullandAppLogo from '@/assets/images/seoulland_app_logo.png'

const emitter = inject('emitter')

const router = useRouter()
const loginRef = ref(null)
const model = ref({
  id: '',
  pw: ''
})

const envProfile = import.meta.env.MODE // 현재 환경 '로컬 : development' | '개발 : dev'

onMounted(() => {
  emitter.emit(COMMON.LOADING.HIDE)
  console.log('Login Page')
})

const onLogin = async () => {
  return await authApi
    .oauthLogin({ id: model.value.id, pw: model.value.pw })
    .then(() => {
      router.replace({ name: 'Home' })
    })
    .catch((err) => {
      // alert(err.message)
      throw new Error(err)
    })
}

const loginBlock = () => {
  // loginBlock api 호출
}
</script>
<style lang="scss">
.admin_wrap {
  background: #f5f7fb;
  display: flex;
  width: 100%;
  min-height: 100vh;
  align-items: center;
  justify-content: center;
}

.login_page {
  padding: 2rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.dev-banner {
  animation: fadeBlink 2.5s infinite;
}

@keyframes fadeBlink {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0;
  }
}
</style>
