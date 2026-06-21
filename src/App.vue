<template>
  <LoadingBar :showing='loadingFlag' />

  <router-view></router-view>
</template>

<script setup>
import LoadingBar from '@/components/layout/LoadingBar.vue'
import { computed, inject, onBeforeMount, ref } from 'vue'
import COMMON from '@/constants/commonConstatns.js'
import * as uuid from 'uuid'

const emitter = inject('emitter')

//로딩 모달 변수
const loadingFlagIds = ref([])
const DEFAULT_INTERVAL_TIME = 10 * 1000
const loadingFlag = computed(() => loadingFlagIds.value.length > 0)

onBeforeMount(() => {
    emitter.on(COMMON.LOADING.SHOW, (interval = DEFAULT_INTERVAL_TIME) => {
      const id = uuid.v4()
      loadingFlagIds.value.push(id)

      //로딩바가 무한으로 도는거 방지
      setTimeout(() => {
        if (loadingFlagIds.value.length > 0) {
          loadingFlagIds.value.pop()
        }
      }, interval)
    })
    emitter.on(COMMON.LOADING.HIDE, () => {
      if (loadingFlagIds.value.length > 0) {
        loadingFlagIds.value.pop()
      }
    })
    // 로딩바 강제 완전 제거(show > hide 순차 실행 처리 불가한 경우 실행)
    emitter.on(COMMON.LOADING.CLEAR, () => {
      if (loadingFlagIds.value.length > 0) {
        loadingFlagIds.value = []
      }
    })
  }
)
</script>

