<template>
  <q-layout view="hHh LpR lfr" container class="fullscreen">
    <main-header />
    <main-lnb />
    <q-page-container>
      <q-page class="fit scroll-y">
        <router-view v-if="layoutStore.lnbInfo.length > 0"  />
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script setup>
import MainHeader from '@/components/layout/MainHeader.vue'
import MainLnb from '@/components/layout/MainLnb.vue'
import { useLayoutStore } from '@/stores/layout.js'

const layoutStore = useLayoutStore()
</script>
