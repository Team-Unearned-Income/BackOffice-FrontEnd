<template>
  <q-header>
    <q-toolbar class="home-layout__gnb bg-black q-py-sm">
      <q-btn round @click="isShowLnb = !isShowLnb">
        <q-icon name="menu" />
      </q-btn>
      <div
        class="text-h5 text-bold text-white q-mx-sm cursor-pointer"
        style="flex-shrink: 0; letter-spacing: 1px"
        @click="$router.push({ name: 'Home' })"
      >
        KNOCK-IN
      </div>

      <div v-if="envProfile === 'dev'" class="dev-banner text-red text-h6 text-bold q-mt-sm">
        개발 페이지입니다!!!!! (접속 주소 확인하세요)
      </div>

      <div class="row items-center justify-end" style="flex-grow: 1">
        <div class="text-bold">{{ userStore.adminId }}님</div>
        <q-btn size="md" icon="logout" @click="onClickLogout" />
      </div>
    </q-toolbar>
  </q-header>
</template>
<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { useUserStore } from '@/stores/user.js'
import AlarmDialog from '@/components/dialog/AlarmDialog.vue'
import { storeToRefs } from 'pinia'
import { useLayoutStore } from '@/stores/layout'

const $q = useQuasar()
const router = useRouter()
const layoutStore = useLayoutStore()
const { isShowLnb } = storeToRefs(useLayoutStore())
const userStore = useUserStore()

const envProfile = import.meta.env.MODE // 현재 환경 '로컬 : development' | '개발 : dev'

onMounted(async () => {})

const onClickLogout = () => {
  $q.dialog({
    component: AlarmDialog,
    componentProps: {
      title: '알림',
      message: '로그아웃 하시겠습니까?',
      cancel: true
    }
  }).onOk(() => {
    /** TODO: auth에 logout 구성 or B/E에서 구성한 logout 호출 */
    localStorage.removeItem('auth')
    layoutStore.resetStore()

    router.push({ name: 'Login' })
  })
}
</script>
<style scoped lang="scss">
.home-layout__gnb {
  height: 60px;
}

.main-header-left {
  display: flex;

  & img {
    width: 100%;
    height: 100%;
    max-height: 50px;
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
    opacity: 0;
  }
}
</style>
