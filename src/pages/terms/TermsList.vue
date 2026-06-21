<template>
  <div class="q-pa-lg">
    <div class="text-h5 text-bold q-mb-md">약관 관리</div>

    <!-- 탭 (이용약관 / 개인정보 처리방침) -->
    <q-tabs
      v-model="tab"
      dense
      align="left"
      class="text-grey"
      active-color="black"
      indicator-color="black"
      narrow-indicator
    >
      <q-tab name="service" label="이용약관" />
      <q-tab name="privacy" label="개인정보 처리방침" />
    </q-tabs>
    <q-separator />

    <q-tab-panels v-model="tab" animated keep-alive class="bg-transparent">
      <q-tab-panel name="service" class="q-px-none q-pt-md">
        <TermsVersionTab :initial-versions="serviceVersions" body-placeholder="약관 전문을 입력해주세요" />
      </q-tab-panel>
      <q-tab-panel name="privacy" class="q-px-none q-pt-md">
        <TermsVersionTab
          :initial-versions="privacyVersions"
          body-placeholder="개인정보 처리방침 전문을 입력해주세요"
        />
      </q-tab-panel>
    </q-tab-panels>
  </div>
</template>

<script setup>
import { inject, onMounted, ref } from 'vue'
import COMMON from '@/constants/commonConstatns'
import TermsVersionTab from './TermsVersionTab.vue'

const emitter = inject('emitter')

const tab = ref('service')

/** 목업: 이용약관 버전 (API 연동 시 교체) */
const serviceVersions = [
  { id: 3, version: 'v3', effectiveDate: '2025.06.01', summary: '개인정보 수집 항목 업데이트', status: 'current', body: '<p>이용약관 v3 전문입니다.</p>' },
  { id: 2, version: 'v2', effectiveDate: '2025.03.01', summary: '마케팅 정보 수신 동의 항목 추가', status: 'previous', body: '<p>이용약관 v2 전문입니다.</p>' },
  { id: 1, version: 'v1', effectiveDate: '2025.01.01', summary: '최초 서비스 출시 약관', status: 'previous', body: '<p>이용약관 v1 전문입니다.</p>' }
]

/** 목업: 개인정보 처리방침 버전 */
const privacyVersions = [
  { id: 2, version: 'v2', effectiveDate: '2025.06.01', summary: '수집 항목 및 보유 기간 업데이트', status: 'current', body: '<p>개인정보 처리방침 v2 전문입니다.</p>' },
  { id: 1, version: 'v1', effectiveDate: '2025.01.01', summary: '최초 서비스 출시 개인정보 처리방침', status: 'previous', body: '<p>개인정보 처리방침 v1 전문입니다.</p>' }
]

onMounted(() => {
  emitter.emit(COMMON.LOADING.HIDE)
})
</script>
