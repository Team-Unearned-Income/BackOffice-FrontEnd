<template>
  <BasicConfirm
    v-model:show="show"
    :title="isEdit ? '메일 도메인 수정' : '메일 도메인 추가'"
    close-label="취소"
    :draggable="false"
    :style="{ width: '460px', maxWidth: '90vw' }"
  >
    <template #content>
      <!-- 유형 -->
      <div class="field-label">유형 <span class="text-red">*</span></div>
      <q-select
        v-model="type"
        :options="TYPE_SELECT_OPTIONS"
        dense
        outlined
        emit-value
        map-options
        class="q-mb-md"
      />

      <!-- 기관명 -->
      <div class="field-label">기관명 <span class="text-red">*</span></div>
      <q-input v-model="name" dense outlined placeholder="예: 수원대학교" class="q-mb-md" />

      <!-- 도메인 -->
      <div class="field-label">도메인 <span class="text-red">*</span></div>
      <q-input v-model="domain" dense outlined placeholder="예: suwon.ac.kr" class="q-mb-xs" />
      <div class="text-caption text-grey-6 q-mb-md">@ 이후 도메인만 입력 (예: suwon.ac.kr)</div>

      <!-- 상태 -->
      <div class="field-label">상태 <span class="text-red">*</span></div>
      <q-select
        v-model="status"
        :options="STATUS_SELECT_OPTIONS"
        dense
        outlined
        emit-value
        map-options
        class="q-mb-md"
      />

      <!-- 메모 -->
      <div class="field-label">메모</div>
      <q-input v-model="memo" dense outlined placeholder="내부 메모 (선택)" />
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
import { TYPE_SELECT_OPTIONS, STATUS_SELECT_OPTIONS } from './mailDomainMeta'

const show = defineModel('show', { type: Boolean, default: false })

const props = defineProps({
  /** 수정 시 기존 항목, 추가 시 null */
  domainItem: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['save'])

const isEdit = computed(() => !!props.domainItem)

const type = ref('school')
const name = ref('')
const domain = ref('')
const status = ref('active')
const memo = ref('')

/** 모달이 열릴 때 props.domainItem 기준으로 폼 초기화 */
const initForm = () => {
  const d = props.domainItem
  type.value = d?.type ?? 'school'
  name.value = d?.name ?? ''
  domain.value = d?.domain ?? ''
  status.value = d?.status ?? 'active'
  memo.value = d?.memo ?? ''
}
watch(show, (v) => {
  if (v) initForm()
})

const isValid = computed(() => !!name.value.trim() && !!domain.value.trim())

const onSave = () => {
  if (!isValid.value) return
  emit('save', {
    type: type.value,
    name: name.value.trim(),
    domain: domain.value.trim(),
    status: status.value,
    memo: memo.value.trim()
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
