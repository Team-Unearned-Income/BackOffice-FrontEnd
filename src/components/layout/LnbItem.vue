<template>
  <q-item
    v-for='item in lnbItems'
    :key='item.parentAdminMenuId'
    :active='isActive(item)'
    :class="isActive ? 'text-bold' : ''"
    :to='item.url'
    class='text-subtitle2'
    @click='onItemClick(item)'
  >
    <q-item-section>{{ item.menuName }}</q-item-section>
  </q-item>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const isActive = (item) => {
  // item.id 값이 특정 조건에 따라 active 여부를 반환
  // 예시: 현재 URL이 item.url과 일치하면 active
  return window.location.pathname === item.url
}

const onItemClick = (item) => {
  console.log('클릭된 항목:', item)
  router.push(item.url)
}

const lnbItems = defineModel('lnbItems', {
  type: Array,
  required: true,
  default: () => []
})

</script>
