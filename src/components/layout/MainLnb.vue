<template>
  <q-drawer v-model="layoutStore.isShowLnb">
    <q-scroll-area class="bg-dark fit">
      <MainLnbTreeNode v-for="item in lnbItems" :key="item.key" :node="item" @select="onSelect" />
    </q-scroll-area>
  </q-drawer>
</template>

<script setup>
/**
 * Home Layout LNB
 */
import { useLayoutStore } from '@/stores/layout'
import MainLnbTreeNode from './MainLnbTreeNode.vue'
import { onMounted, ref } from 'vue'
import lnbMenu from '@/constants/lnbMenu'

const layoutStore = useLayoutStore()

const lnbItems = ref([])

onMounted(() => {
  // Knock-in BO 로컬 메뉴 구성 (seoulland 백엔드 메뉴 API 대체)
  layoutStore.lnbInfo = lnbMenu
  lnbItems.value = lnbMenu
})

const onSelect = (items) => {
  layoutStore.breadcrumb = [...items]
  layoutStore.selectedMenu = items.pop()
}
</script>
