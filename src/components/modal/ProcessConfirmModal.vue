<template>
  <q-dialog ref="dialogRef" @hide="onDialogHide">
    <q-card class="process-confirm-modal q-pa-lg">
      <!-- 처리 내용 안내 -->
      <div class="text-h6 text-bold text-center q-mb-sm">{{ title }}</div>
      <div
        class="text-center text-grey-7"
        :class="requireReason ? 'q-mb-lg' : 'q-mb-md'"
        style="white-space: pre-line"
      >
        {{ message }}
      </div>

      <!-- 경고 문구 (선택) -->
      <div v-if="warning" class="warning-box q-pa-md q-mb-md">{{ warning }}</div>

      <!-- 사유 입력 (필수) -->
      <template v-if="requireReason">
        <div class="text-body2 text-weight-medium q-mb-xs">{{ reasonLabel }}</div>
        <q-input v-model="reason" type="textarea" outlined rows="3" :placeholder="placeholder" />
      </template>

      <!-- 액션 버튼 -->
      <div class="row q-col-gutter-sm q-mt-md">
        <div class="col-6">
          <q-btn label="취소" class="full-width" color="grey-7" outline @click="onDialogCancel" />
        </div>
        <div class="col-6">
          <q-btn
            :label="confirmLabel"
            class="full-width text-bold"
            :class="softBgClass"
            :color="confirmColor"
            :outline="!isFilled"
            :unelevated="isFilled"
            :text-color="isFilled ? 'white' : undefined"
            :disable="requireReason && !reason.trim()"
            @click="onConfirm"
          />
        </div>
      </div>
    </q-card>
  </q-dialog>
</template>

<script setup>
/**
 * 공통 처리 확인 모달 (공통 스펙 §4)
 * 모든 처리 확인 모달은 이 컴포넌트를 사용한다.
 * - requireReason=true : 사유 입력 textarea 노출, 미입력 시 처리 버튼 비활성화, 사유를 onOk 인자로 반환
 * - warning           : 값이 있으면 앰버 경고 박스 노출 (예: admin 권한 부여)
 * - confirmColor='dark': 채워진 버튼(재노출/승인 등), 그 외('red'/'amber' 등): outline + soft 배경
 */
import { computed, ref } from 'vue'
import { useDialogPluginComponent } from 'quasar'

const props = defineProps({
  title: { type: String, default: '' },
  message: { type: String, default: '' },
  warning: { type: String, default: '' },
  requireReason: { type: Boolean, default: false },
  reasonLabel: { type: String, default: '사유 (필수)' },
  placeholder: { type: String, default: '사유를 입력해주세요' },
  confirmLabel: { type: String, default: '확인' },
  confirmColor: { type: String, default: 'red' }
})

defineEmits([...useDialogPluginComponent.emits])

const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } = useDialogPluginComponent()

const reason = ref('')

const isFilled = computed(() => props.confirmColor === 'dark')
const softBgClass = computed(() => (isFilled.value ? '' : `bg-${props.confirmColor}-1`))

const onConfirm = () => {
  if (props.requireReason && !reason.value.trim()) return
  onDialogOK(props.requireReason ? reason.value.trim() : undefined)
}
</script>

<style scoped>
.process-confirm-modal {
  width: 440px;
  max-width: 90vw;
  border-radius: 10px;
}

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
