<template>
  <q-dialog ref="dialogRef" @hide="onDialogHide">
    <q-card class="life-pattern-modal q-pa-lg">
      <!-- 1. 타이틀 -->
      <div class="text-h6 text-bold q-mb-md">{{ isEdit ? '생활패턴 항목 수정' : '생활패턴 항목 추가' }}</div>

      <!-- 2. 유형 -->
      <div class="field-label">유형</div>
      <q-btn-toggle
        v-model="type"
        :options="[
          { label: '슬라이더', value: 'slider' },
          { label: '칩 선택', value: 'chip' }
        ]"
        spread
        no-caps
        unelevated
        toggle-color="dark"
        color="grey-3"
        text-color="grey-8"
        class="q-mb-md full-width"
        @update:model-value="onTypeChange"
      />

      <!-- 3. 항목명 -->
      <div class="field-label">항목명</div>
      <q-input v-model="name" dense outlined placeholder="예: 취침 시간" class="q-mb-md" />

      <!-- 4-slider. 양 끝 레이블 / 단계 수 -->
      <template v-if="type === 'slider'">
        <div class="field-label">양 끝 레이블</div>
        <q-input v-model="minLabel" dense outlined label="최솟값" placeholder="예: 일찍 자요" class="q-mb-sm" />
        <q-input v-model="maxLabel" dense outlined label="최댓값" placeholder="예: 늦게 자요" class="q-mb-md" />

        <div class="field-label">단계 수 <span class="text-grey-6 text-caption">— 앱 슬라이더 스텝 결정</span></div>
        <q-input v-model.number="steps" type="number" dense outlined min="1" class="q-mb-md" />
      </template>

      <!-- 4-chip. 선택지 목록 -->
      <template v-else>
        <div class="field-label">선택지 목록 <span class="text-grey-6 text-caption">— 최소 2개</span></div>
        <div v-for="(opt, i) in options" :key="i" class="row items-center no-wrap q-gutter-sm q-mb-sm">
          <q-input v-model="options[i]" dense outlined class="col" :placeholder="`선택지 ${i + 1}`" />
          <q-btn
            v-if="options.length > 2"
            label="삭제"
            color="red"
            outline
            dense
            class="bg-red-1"
            @click="removeOption(i)"
          />
        </div>
        <q-btn label="+ 선택지 추가" outline color="grey-7" class="full-width q-mb-md" @click="addOption" />
      </template>

      <!-- 5/6. 우선순위 -->
      <div class="field-label">우선순위 <span class="text-grey-6 text-caption">— 낮을수록 앞에 노출</span></div>
      <q-input v-model.number="order" type="number" dense outlined min="1" class="q-mb-md" />

      <!-- 액션 버튼 -->
      <div class="row q-col-gutter-sm">
        <div class="col-6">
          <q-btn label="취소" class="full-width" color="grey-7" outline @click="onDialogCancel" />
        </div>
        <div class="col-6">
          <q-btn
            label="저장"
            class="full-width text-bold"
            color="dark"
            unelevated
            text-color="white"
            :disable="!isValid"
            @click="onSave"
          />
        </div>
      </div>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useDialogPluginComponent } from 'quasar'

const props = defineProps({
  /** 수정 시 기존 항목, 추가 시 null */
  pattern: {
    type: Object,
    default: null
  }
})

defineEmits([...useDialogPluginComponent.emits])

const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } = useDialogPluginComponent()

const isEdit = computed(() => !!props.pattern)

const type = ref(props.pattern?.type ?? 'slider')
const name = ref(props.pattern?.name ?? '')
const minLabel = ref(props.pattern?.minLabel ?? '')
const maxLabel = ref(props.pattern?.maxLabel ?? '')
const steps = ref(props.pattern?.steps ?? 5)
const options = ref(props.pattern?.options?.length ? [...props.pattern.options] : ['', ''])
const order = ref(props.pattern?.order ?? 1)

/** 유형 변경 시 하위 필드 초기화 */
const onTypeChange = () => {
  minLabel.value = ''
  maxLabel.value = ''
  steps.value = 5
  options.value = ['', '']
}

const addOption = () => options.value.push('')
const removeOption = (i) => {
  if (options.value.length > 2) options.value.splice(i, 1)
}

const isValid = computed(() => {
  if (!name.value.trim()) return false
  if (type.value === 'slider') {
    return !!minLabel.value.trim() && !!maxLabel.value.trim() && Number(steps.value) >= 1
  }
  return options.value.map((o) => o.trim()).filter(Boolean).length >= 2
})

const onSave = () => {
  if (!isValid.value) return
  onDialogOK({
    type: type.value,
    name: name.value.trim(),
    visible: props.pattern?.visible ?? true,
    minLabel: type.value === 'slider' ? minLabel.value.trim() : '',
    maxLabel: type.value === 'slider' ? maxLabel.value.trim() : '',
    steps: type.value === 'slider' ? Number(steps.value) : 5,
    options: type.value === 'chip' ? options.value.map((o) => o.trim()).filter(Boolean) : [],
    order: Number(order.value) || 1
  })
}
</script>

<style scoped>
.life-pattern-modal {
  width: 440px;
  max-width: 90vw;
  border-radius: 10px;
}

.field-label {
  font-size: 0.82rem;
  font-weight: 600;
  color: #555;
  margin-bottom: 0.35rem;
}
</style>
