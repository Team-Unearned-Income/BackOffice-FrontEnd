<template>
  <!-- 공통 처리 확인 모달: BasicConfirm 기반 선언형 (공통 스펙 §4) -->
  <BasicConfirm
    v-model:show="show"
    :title="title"
    :close-label="closeLabel"
    :draggable="false"
    :style="{ width: '440px', maxWidth: '90vw' }"
  >
    <template #content>
      <div class="text-grey-8" style="white-space: pre-line">{{ message }}</div>

      <!-- 경고 문구 (선택) -->
      <div v-if="warning" class="warning-box q-pa-md q-mt-md">{{ warning }}</div>

      <!-- 사유 입력 (필수) -->
      <template v-if="requireReason">
        <div class="text-body2 text-weight-medium q-mt-md q-mb-xs">{{ reasonLabel }}</div>
        <q-input v-model="reason" type="textarea" outlined rows="3" :placeholder="placeholder" />
      </template>
    </template>

    <template #button>
      <q-btn
        :label="confirmLabel"
        class="modal-btn-md text-bold"
        :class="softBgClass"
        :color="confirmColor"
        :outline="!isFilled"
        :unelevated="isFilled"
        :text-color="isFilled ? 'white' : undefined"
        :disable="requireReason && !reason.trim()"
        @click="onConfirm"
      />
    </template>
  </BasicConfirm>
</template>

<script setup>
/**
 * 공통 처리 확인 모달 (정지/비공개/삭제/반려/승인/권한 부여 등)
 * - BasicConfirm을 공통 베이스로 사용하는 선언형 모달 (v-model:show)
 * - 확인 버튼 클릭 시 `confirm` 이벤트 emit (사유 필수면 사유 문자열 전달) → 호출부에서 API 호출/상태 갱신
 * - requireReason : 사유 입력 textarea 노출, 미입력 시 확인 버튼 비활성화
 * - warning       : 앰버 경고 박스 (예: admin 권한 부여)
 * - confirmColor  : 'dark'(채움) / 'red'·'amber'(outline + soft 배경)
 */
import { computed, ref, watch } from 'vue'
import BasicConfirm from './BasicConfirm.vue'

const show = defineModel('show', { type: Boolean, default: false })

const props = defineProps({
  title: { type: String, default: '' },
  message: { type: String, default: '' },
  warning: { type: String, default: '' },
  requireReason: { type: Boolean, default: false },
  reasonLabel: { type: String, default: '사유 (필수)' },
  placeholder: { type: String, default: '사유를 입력해주세요' },
  confirmLabel: { type: String, default: '확인' },
  confirmColor: { type: String, default: 'red' },
  closeLabel: { type: String, default: '취소' }
})

const emit = defineEmits(['confirm'])

const reason = ref('')

/** 모달이 열릴 때 사유 초기화 */
watch(show, (v) => {
  if (v) reason.value = ''
})

const isFilled = computed(() => props.confirmColor === 'dark')
const softBgClass = computed(() => (isFilled.value ? '' : `bg-${props.confirmColor}-1`))

const onConfirm = () => {
  if (props.requireReason && !reason.value.trim()) return
  emit('confirm', props.requireReason ? reason.value.trim() : undefined)
  show.value = false
}
</script>

<style scoped>
.warning-box {
  background: #fff8e1;
  border: 1px solid #ffe082;
  border-radius: 6px;
  color: #8d6e00;
  font-size: 0.85rem;
  line-height: 1.45;
  white-space: pre-line;
}
</style>
