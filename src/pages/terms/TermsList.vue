<template>
  <div class="q-pa-lg">
    <div class="row items-center justify-between q-mb-md">
      <div class="text-h5 text-bold">약관 관리</div>
      <div class="row items-center q-gutter-sm">
        <q-btn
          v-if="currentType"
          flat
          dense
          no-caps
          color="dark"
          label="유형명 수정"
          @click="openEditType(currentType)"
        />
        <q-btn
          v-if="currentType"
          flat
          dense
          no-caps
          color="red"
          label="유형 삭제"
          @click="openDeleteType(currentType)"
        />
        <q-btn label="+ 약관 유형 추가" color="dark" outline @click="openAddType" />
      </div>
    </div>

    <!-- 유형 없음 -->
    <q-card v-if="types.length === 0" flat bordered class="q-pa-xl text-center text-grey-6">
      등록된 약관 유형이 없습니다.<br />
      상단 "약관 유형 추가"로 유형(예: 이용약관, 개인정보 처리방침)을 먼저 만들어주세요.
    </q-card>

    <!-- 유형 탭 -->
    <template v-else>
      <q-tabs
        v-model="tab"
        dense
        align="left"
        class="text-grey"
        active-color="black"
        indicator-color="black"
        narrow-indicator
      >
        <q-tab v-for="t in types" :key="t.id" :name="t.id" :label="t.title" />
      </q-tabs>
      <q-separator />

      <q-tab-panels v-model="tab" animated keep-alive class="bg-transparent">
        <q-tab-panel v-for="t in types" :key="t.id" :name="t.id" class="q-px-none q-pt-md">
          <TermsVersionTab :agreement-type-id="t.id" :type-title="t.title" />
        </q-tab-panel>
      </q-tab-panels>
    </template>

    <!-- 유형 추가/수정 다이얼로그 -->
    <q-dialog v-model="showTypeForm">
      <q-card style="width: 420px; max-width: 90vw">
        <q-card-section class="text-h6 text-bold">
          {{ editingType ? '약관 유형 수정' : '약관 유형 추가' }}
        </q-card-section>
        <q-card-section class="q-pt-none">
          <q-input
            v-model="typeTitle"
            dense
            outlined
            autofocus
            placeholder="유형명 (예: 이용약관)"
            @keyup.enter="submitType"
          />
        </q-card-section>
        <q-card-actions align="right" class="q-px-md q-pb-md">
          <q-btn v-close-popup label="취소" color="grey-7" outline />
          <q-btn
            label="저장"
            color="dark"
            unelevated
            text-color="white"
            :disable="!typeTitle.trim()"
            @click="submitType"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- 유형 삭제 확인 -->
    <ProcessConfirmModal
      v-model:show="showTypeDelete"
      title="약관 유형 삭제"
      :message="typeDeleteMessage"
      confirm-label="삭제"
      confirm-color="red"
      @confirm="onDeleteTypeConfirm"
    />
  </div>
</template>

<script setup>
/**
 * 약관 관리 — 약관 유형(termType)을 동적 탭으로 표시, 각 탭은 해당 유형의 약관 버전 목록.
 * (로컬 백엔드 스펙: /bo/type/terms + /bo/terms?agreementTypeId)
 */
import { computed, inject, onMounted, ref } from 'vue'
import { useQuasar } from 'quasar'
import COMMON from '@/constants/commonConstatns'
import ProcessConfirmModal from '@/components/modal/ProcessConfirmModal.vue'
import AlarmDialog from '@/components/dialog/AlarmDialog.vue'
import TermsVersionTab from './TermsVersionTab.vue'
import { termsApi } from '@/service/bo/terms'

const emitter = inject('emitter')
const $q = useQuasar()

const types = ref([])
const tab = ref(null)
const currentType = computed(() => types.value.find((t) => t.id === tab.value) ?? null)

const showError = (e) => {
  const message = e?.error?.message || e?.message || '처리 중 오류가 발생했습니다.'
  $q.dialog({ component: AlarmDialog, componentProps: { title: '오류', message } })
}

const loadTypes = async () => {
  const res = await termsApi.getTypeList()
  types.value = res?.termTypes ?? []
  // 선택 탭 유지, 없으면 첫 번째
  if (!types.value.some((t) => t.id === tab.value)) {
    tab.value = types.value[0]?.id ?? null
  }
}

const fetchTypes = async () => {
  emitter.emit(COMMON.LOADING.SHOW)
  try {
    await loadTypes()
  } catch (e) {
    showError(e)
  } finally {
    emitter.emit(COMMON.LOADING.HIDE)
  }
}

/* 유형 추가/수정 */
const showTypeForm = ref(false)
const editingType = ref(null)
const typeTitle = ref('')

const openAddType = () => {
  editingType.value = null
  typeTitle.value = ''
  showTypeForm.value = true
}
const openEditType = (t) => {
  editingType.value = t
  typeTitle.value = t.title
  showTypeForm.value = true
}
const submitType = async () => {
  const title = typeTitle.value.trim()
  if (!title) return
  emitter.emit(COMMON.LOADING.SHOW)
  try {
    if (editingType.value) await termsApi.modifyType(editingType.value.id, { title })
    else await termsApi.saveType(title)
    showTypeForm.value = false
    await loadTypes()
  } catch (e) {
    showError(e)
  } finally {
    emitter.emit(COMMON.LOADING.HIDE)
  }
}

/* 유형 삭제 */
const showTypeDelete = ref(false)
const deleteTypeTarget = ref(null)
const typeDeleteMessage = computed(() =>
  deleteTypeTarget.value
    ? `"${deleteTypeTarget.value.title}" 유형을 삭제하시겠어요?\n해당 유형의 약관도 함께 영향을 받을 수 있습니다.`
    : ''
)
const openDeleteType = (t) => {
  deleteTypeTarget.value = t
  showTypeDelete.value = true
}
const onDeleteTypeConfirm = async () => {
  emitter.emit(COMMON.LOADING.SHOW)
  try {
    await termsApi.removeType(deleteTypeTarget.value.id)
    await loadTypes()
  } catch (e) {
    showError(e)
  } finally {
    emitter.emit(COMMON.LOADING.HIDE)
  }
}

onMounted(() => {
  fetchTypes()
})
</script>
