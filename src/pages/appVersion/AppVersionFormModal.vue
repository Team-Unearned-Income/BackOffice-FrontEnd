<template>
  <BasicConfirm
    v-model:show="show"
    :title="isEdit ? '버전 수정' : '버전 추가'"
    close-label="취소"
    :draggable="false"
    :style="{ width: '440px', maxWidth: '90vw' }"
  >
    <template #content>
      <!-- 플랫폼 -->
      <div class="field-label">플랫폼 <span class="text-red">*</span></div>
      <q-select
        v-model="platformType"
        :options="PLATFORM_SELECT_OPTIONS"
        dense
        outlined
        emit-value
        map-options
        class="q-mb-md"
      />

      <!-- 버전 -->
      <div class="field-label">버전 <span class="text-red">*</span></div>
      <q-input v-model="version" dense outlined placeholder="예: 2.1.0" class="q-mb-md" />

      <!-- 업데이트 유형 -->
      <div class="field-label">업데이트 유형 <span class="text-red">*</span></div>
      <q-select
        v-model="updateType"
        :options="UPDATE_TYPE_SELECT_OPTIONS"
        dense
        outlined
        emit-value
        map-options
        class="q-mb-md"
      />

      <!-- 최소 지원 버전 -->
      <div class="field-label">최소 지원 버전 <span class="text-red">*</span></div>
      <q-input v-model="minVersion" dense outlined placeholder="예: 1.8.0" class="q-mb-xs" />
      <div class="text-caption text-grey-6">이 버전 미만으로 앱을 실행하면 강제 업데이트 여부에 따라 팝업이 노출됩니다.</div>
    </template>

    <template #button>
      <q-btn
        label="저장"
        class="modal-btn-md text-bold"
        color="dark"
        unelevated
        text-color="white"
        :disable="!isValid"
        @click="onSave"
      />
    </template>
  </BasicConfirm>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import BasicConfirm from '@/components/modal/BasicConfirm.vue'
import { PLATFORM_SELECT_OPTIONS, UPDATE_TYPE_SELECT_OPTIONS } from './appVersionMeta'

const show = defineModel('show', { type: Boolean, default: false })

const props = defineProps({
  /** 수정 시 기존 항목, 추가 시 null */
  versionItem: {
    type: Object,
    default: null
  },
  /** 추가 시 기본 선택될 플랫폼 (현재 탭 기준) */
  defaultPlatform: {
    type: String,
    default: 'IOS'
  }
})

const emit = defineEmits(['save'])

const isEdit = computed(() => !!props.versionItem)

const platformType = ref('IOS')
const version = ref('')
const updateType = ref('SELECT')
const minVersion = ref('')

/** 모달이 열릴 때 props.versionItem 기준으로 폼 초기화 */
const initForm = () => {
  const v = props.versionItem
  platformType.value = v?.platformType ?? props.defaultPlatform
  version.value = v?.version ?? ''
  updateType.value = v?.updateType ?? 'SELECT'
  minVersion.value = v?.minVersion ?? ''
}
watch(show, (v) => {
  if (v) initForm()
})

const isValid = computed(() => !!version.value.trim() && !!minVersion.value.trim())

const onSave = () => {
  if (!isValid.value) return
  emit('save', {
    platformType: platformType.value,
    version: version.value.trim(),
    updateType: updateType.value,
    minVersion: minVersion.value.trim()
  })
  show.value = false
}
</script>

<style scoped>
.field-label {
  font-size: 0.82rem;
  font-weight: 600;
  color: #555;
  margin-bottom: 0.35rem;
}
</style>
