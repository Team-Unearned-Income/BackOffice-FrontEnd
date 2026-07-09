<template>
  <BasicConfirm
    v-model:show="show"
    :title="isEdit ? '앱 버전 수정' : '앱 버전 추가'"
    close-label="취소"
    :draggable="false"
    :style="{ width: '460px', maxWidth: '90vw' }"
  >
    <template #content>
      <!-- 플랫폼 -->
      <div class="field-label">플랫폼 <span class="text-red">*</span></div>
      <q-select
        v-model="platform"
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

      <!-- 최소 지원 버전 -->
      <div class="field-label">최소 지원 버전 <span class="text-red">*</span></div>
      <q-input v-model="minSupportVersion" dense outlined placeholder="예: 1.8.0" class="q-mb-xs" />
      <div class="text-caption text-grey-6 q-mb-md">이 버전 미만 앱 실행 시 강제 업데이트 팝업 대상이 됩니다.</div>

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

      <!-- 출시일 -->
      <div class="field-label">출시일 <span class="text-red">*</span></div>
      <q-input v-model="releaseDate" dense outlined placeholder="예: 2025-06-01" class="q-mb-md" />

      <!-- 업데이트 메시지 -->
      <div class="field-label">업데이트 메시지</div>
      <q-input
        v-model="message"
        type="textarea"
        outlined
        rows="3"
        placeholder="업데이트 팝업에 노출될 메시지 (선택)"
      />
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
  }
})

const emit = defineEmits(['save'])

const isEdit = computed(() => !!props.versionItem)

const platform = ref('ios')
const version = ref('')
const minSupportVersion = ref('')
const updateType = ref('optional')
const releaseDate = ref('')
const message = ref('')

/** 모달이 열릴 때 props.versionItem 기준으로 폼 초기화 */
const initForm = () => {
  const v = props.versionItem
  platform.value = v?.platform ?? 'ios'
  version.value = v?.version ?? ''
  minSupportVersion.value = v?.minSupportVersion ?? ''
  updateType.value = v?.updateType ?? 'optional'
  releaseDate.value = v?.releaseDate ?? ''
  message.value = v?.message ?? ''
}
watch(show, (v) => {
  if (v) initForm()
})

const isValid = computed(
  () => !!version.value.trim() && !!minSupportVersion.value.trim() && !!releaseDate.value.trim()
)

const onSave = () => {
  if (!isValid.value) return
  emit('save', {
    platform: platform.value,
    version: version.value.trim(),
    minSupportVersion: minSupportVersion.value.trim(),
    updateType: updateType.value,
    releaseDate: releaseDate.value.trim(),
    message: message.value.trim()
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
