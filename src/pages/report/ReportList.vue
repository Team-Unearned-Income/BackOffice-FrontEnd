<template>
  <div class="q-pa-md">
    <div class="text-h5 text-bold q-mb-md">신고 관리</div>
    <div class="text-grey">준비 중입니다.</div>
  </div>
</template>

<script setup>
import { onMounted, inject } from 'vue'
import COMMON from '@/constants/commonConstatns'

const emitter = inject('emitter')

onMounted(() => {
  emitter.emit(COMMON.LOADING.HIDE)
})
</script>
