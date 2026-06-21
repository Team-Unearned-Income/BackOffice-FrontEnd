<template>
  <div class="q-pa-lg">
    <div class="text-h5 text-bold q-mb-md">고객센터 관리</div>

    <!-- 탭 (1:1 문의 / 공지사항 / FAQ) -->
    <q-tabs
      v-model="tab"
      dense
      align="left"
      class="text-grey"
      active-color="black"
      indicator-color="black"
      narrow-indicator
    >
      <q-tab name="inquiry">
        <div class="row items-center no-wrap">
          <span class="q-tab__label">1:1 문의</span>
          <q-badge v-if="inquiryPendingCount" rounded color="red" class="q-ml-xs">
            {{ inquiryPendingCount }}
          </q-badge>
        </div>
      </q-tab>
      <q-tab name="notice" label="공지사항" />
      <q-tab name="faq" label="FAQ" />
    </q-tabs>
    <q-separator />

    <q-tab-panels v-model="tab" animated keep-alive class="bg-transparent">
      <q-tab-panel name="inquiry" class="q-px-none q-pt-md">
        <SupportInquiry @pending-count="inquiryPendingCount = $event" />
      </q-tab-panel>
      <q-tab-panel name="notice" class="q-px-none q-pt-md">
        <SupportNotice />
      </q-tab-panel>
      <q-tab-panel name="faq" class="q-px-none q-pt-md">
        <SupportFaq />
      </q-tab-panel>
    </q-tab-panels>
  </div>
</template>

<script setup>
import { inject, onMounted, ref } from 'vue'
import COMMON from '@/constants/commonConstatns'
import SupportInquiry from './SupportInquiry.vue'
import SupportNotice from './SupportNotice.vue'
import SupportFaq from './SupportFaq.vue'

const emitter = inject('emitter')

const tab = ref('inquiry')
const inquiryPendingCount = ref(0)

onMounted(() => {
  emitter.emit(COMMON.LOADING.HIDE)
})
</script>
