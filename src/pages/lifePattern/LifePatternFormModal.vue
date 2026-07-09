<template>
  <BasicConfirm
    v-model:show="show"
    :title="isEdit ? '생활패턴 항목 수정' : '생활패턴 항목 추가'"
    close-label="취소"
    :draggable="false"
    :style="{ width: '460px', maxWidth: '90vw' }"
  >
    <template #content>
      <!-- 유형 -->
      <div class="field-label">유형</div>
      <q-select
        v-model="type"
        :options="TYPE_SELECT_OPTIONS"
        dense
        outlined
        emit-value
        map-options
        class="q-mb-md"
      />

      <!-- 항목명 -->
      <div class="field-label">항목명</div>
      <q-input v-model="name" dense outlined placeholder="예: 취침 시간" class="q-mb-md" />

      <!-- 우선순위 -->
      <div class="field-label">우선순위 <span class="text-grey-6 text-caption">— 낮을수록 앞에 노출</span></div>
      <q-input v-model.number="sort" type="number" dense outlined min="1" class="q-mb-md" />

      <!-- 선택지/값 목록 -->
      <div class="field-label">선택지 <span class="text-grey-6 text-caption">— 최소 1개</span></div>
      <div v-for="(d, i) in details" :key="i" class="row items-center no-wrap q-gutter-sm q-mb-sm">
        <q-input v-model="d.values" dense outlined class="col-4" :placeholder="`값 ${i + 1}`" />
        <q-input v-model="d.description" dense outlined class="col" placeholder="설명 (선택)" />
        <q-btn
          v-if="details.length > 1"
          label="삭제"
          color="red"
          outline
          dense
          class="bg-red-1"
          @click="removeDetail(i)"
        />
      </div>
      <q-btn label="+ 선택지 추가" outline color="grey-7" class="full-width" @click="addDetail" />
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
import { TYPE_SELECT_OPTIONS } from './lifePatternMeta'

const show = defineModel('show', { type: Boolean, default: false })

const props = defineProps({
  /** 수정 시 기존 항목({ id, name, type, sort, details }), 추가 시 null */
  pattern: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['save'])

const isEdit = computed(() => !!props.pattern)

const type = ref('SCALE')
const name = ref('')
const sort = ref(1)
const details = ref([{ values: '', description: '' }])

/** 모달이 열릴 때 props.pattern 기준으로 폼 초기화 */
const initForm = () => {
  const p = props.pattern
  type.value = p?.type ?? 'SCALE'
  name.value = p?.name ?? ''
  sort.value = p?.sort ?? 1
  details.value = p?.details?.length
    ? p.details.map((d) => ({ values: d.values ?? '', description: d.description ?? '' }))
    : [{ values: '', description: '' }]
}
watch(show, (v) => {
  if (v) initForm()
})

const addDetail = () => details.value.push({ values: '', description: '' })
const removeDetail = (i) => {
  if (details.value.length > 1) details.value.splice(i, 1)
}

const isValid = computed(() => {
  if (!name.value.trim()) return false
  return details.value.some((d) => d.values.trim())
})

const onSave = () => {
  if (!isValid.value) return
  emit('save', {
    name: name.value.trim(),
    type: type.value,
    sort: Number(sort.value) || 1,
    details: details.value
      .map((d) => ({ values: d.values.trim(), description: d.description.trim() }))
      .filter((d) => d.values)
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
