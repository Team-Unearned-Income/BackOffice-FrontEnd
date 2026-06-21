<template>
  <div>home</div>
</template>
<script setup>
import { useLayoutStore } from '@/stores/layout'
import { useRouter } from 'vue-router'
import { onBeforeMount, inject } from 'vue'
import COMMON from '@/constants/commonConstatns'

const emitter = inject('emitter')

const layoutStore = useLayoutStore()

const router = useRouter()

onBeforeMount(() => {
  emitter.emit(COMMON.LOADING.HIDE)
  const first = layoutStore.lnbInfo[0]
  // leaf(단일 페이지) 또는 그룹(하위 메뉴) 모두 대응
  router.push(first.url ?? first.childrenList?.[0]?.url)
})
</script>
