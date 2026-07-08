<template>
  <div>
    <!-- 새 약관 등록 -->
    <div class="row justify-end q-mb-md">
      <q-btn label="+ 새 약관 등록" color="dark" outline @click="openCreate" />
    </div>

    <!-- 약관 버전 목록 -->
    <PageTable
      ref="tableRef"
      v-model="tableModel"
      class="q-pa-md"
      :row-key="'id'"
      :table-style="{ minHeight: '30vh' }"
      :on-top-options="false"
    >
      <template #filter-section>
        <div class="row q-col-gutter-sm items-center q-pb-md">
          <div class="col-12 col-md-5">
            <TableSearch
              v-model:model-value="searchKeyword"
              placeholder="제목 검색"
              @select-search-item="syncRows"
              @clear-item="clearSearch"
            />
          </div>
          <div class="col-auto">
            <q-btn label="검색" color="dark" unelevated @click="syncRows" />
          </div>
        </div>
      </template>

      <template #action="{ slotProps }">
        <q-btn flat dense no-caps color="primary" label="내용 보기" @click="viewContent(slotProps.row)" />
        <q-btn flat dense no-caps color="dark" label="수정" @click="editVersion(slotProps.row)" />
        <q-btn flat dense no-caps color="red" label="삭제" @click="openDelete(slotProps.row)" />
      </template>
    </PageTable>

    <!-- 등록 / 수정 폼 -->
    <q-slide-transition>
      <q-card v-if="showForm" flat bordered class="q-pa-md q-mt-md">
        <div class="text-subtitle1 text-bold q-mb-md">{{ editingId ? '약관 수정' : '약관 등록' }}</div>
        <div class="row q-col-gutter-sm q-mb-sm items-center">
          <div class="col-12 col-md-8">
            <div class="field-label">제목</div>
            <q-input v-model="form.title" dense outlined placeholder="약관 제목을 입력해주세요" />
          </div>
          <div class="col-12 col-md-4">
            <div class="field-label">필수 여부</div>
            <q-toggle v-model="form.isRequired" label="필수 동의 항목" />
          </div>
        </div>
        <div class="field-label q-mb-xs">내용</div>
        <q-editor
          v-model="form.contents"
          :toolbar="[['bold', 'italic'], ['link']]"
          min-height="160px"
          placeholder="약관 전문을 입력해주세요"
        />
        <div class="row justify-end q-gutter-sm q-mt-md">
          <q-btn label="취소" color="grey-7" outline @click="closeForm" />
          <template v-if="editingId">
            <q-btn label="임시저장" color="grey-8" outline :disable="!canSubmit" @click="submit('draft')" />
            <q-btn label="게시" color="dark" unelevated text-color="white" :disable="!canSubmit" @click="submit('publish')" />
          </template>
          <q-btn
            v-else
            label="등록"
            color="dark"
            unelevated
            text-color="white"
            :disable="!canSubmit"
            @click="submit('create')"
          />
        </div>
      </q-card>
    </q-slide-transition>

    <!-- 내용 보기 -->
    <q-dialog v-model="showView">
      <q-card style="width: 620px; max-width: 90vw">
        <q-card-section class="row items-center justify-between bg-grey-2 q-px-lg">
          <div class="text-h6 text-bold">{{ viewing?.title }}</div>
          <q-btn v-close-popup flat round dense icon="close" />
        </q-card-section>
        <q-separator />
        <q-card-section class="terms-body q-px-lg">
          <!-- 관리자가 q-editor로 작성한 약관 본문 HTML (BO 내부 신뢰 콘텐츠) -->
          <!-- eslint-disable-next-line vue/no-v-html -->
          <div v-html="viewing?.contents" />
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- 삭제 확인 -->
    <ProcessConfirmModal
      v-model:show="showDelete"
      title="약관 삭제"
      :message="deleteMessage"
      confirm-label="삭제"
      confirm-color="red"
      @confirm="onDeleteConfirm"
    />
  </div>
</template>

<script setup>
import { computed, inject, onMounted, ref } from 'vue'
import { useQuasar } from 'quasar'
import dayjs from 'dayjs'
import PageTable from '@/components/table/PageTable.vue'
import TableSearch from '@/components/table/TableSearch.vue'
import ProcessConfirmModal from '@/components/modal/ProcessConfirmModal.vue'
import AlarmDialog from '@/components/dialog/AlarmDialog.vue'
import COMMON from '@/constants/commonConstatns'
import { termsApi } from '@/service/bo/terms'
import { STATUS_META, badgeHtml } from './termsMeta'

const props = defineProps({
  /** 약관 유형 ID */
  agreementTypeId: {
    type: Number,
    required: true
  },
  typeTitle: {
    type: String,
    default: ''
  }
})

const emitter = inject('emitter')
const $q = useQuasar()

const allTerms = ref([])
const searchKeyword = ref('')

const tableRef = ref(null)
const tableModel = ref({
  filter: {},
  search: {},
  selected: [],
  filterAndSearchData: {},
  header: [
    { name: 'title', label: '제목', field: 'title', align: 'left', tooltip: false, headerStyle: 'min-width: 16rem' },
    {
      name: 'createAt',
      label: '등록일',
      field: 'createAt',
      align: 'center',
      tooltip: false,
      format: (v) => (v ? dayjs(v).format('YYYY.MM.DD') : '-')
    },
    {
      name: 'current',
      label: '상태',
      field: 'current',
      align: 'center',
      tooltip: false,
      format: (v) => badgeHtml(v ? STATUS_META.current : STATUS_META.previous)
    },
    { name: 'action', label: '액션', field: 'id', align: 'center', tooltip: false, slot: 'action' }
  ],
  rows: [],
  pagination: { page: 1, rowsPerPage: 15, rowsNumber: 0 }
})

const showError = (e) => {
  const message = e?.error?.message || e?.message || '처리 중 오류가 발생했습니다.'
  $q.dialog({ component: AlarmDialog, componentProps: { title: '오류', message } })
}

const loadTerms = async () => {
  const res = await termsApi.getList({ agreementTypeId: props.agreementTypeId, page: 0, size: 100 })
  allTerms.value = res?.terms ?? []
  syncRows()
}

const fetchTerms = async () => {
  emitter.emit(COMMON.LOADING.SHOW)
  try {
    await loadTerms()
  } catch (e) {
    showError(e)
  } finally {
    emitter.emit(COMMON.LOADING.HIDE)
  }
}

const syncRows = () => {
  const kw = searchKeyword.value.trim().toLowerCase()
  const filtered = kw
    ? allTerms.value.filter((t) => (t.title || '').toLowerCase().includes(kw))
    : allTerms.value
  tableModel.value.rows = filtered
  tableModel.value.pagination.rowsNumber = filtered.length
}
const clearSearch = () => {
  searchKeyword.value = ''
  syncRows()
}

/* 등록 / 수정 폼 */
const showForm = ref(false)
const editingId = ref(null)
const form = ref({ title: '', contents: '', isRequired: true })
const canSubmit = computed(() => !!form.value.title.trim())

const resetForm = () => {
  form.value = { title: '', contents: '', isRequired: true }
  editingId.value = null
}
const openCreate = () => {
  resetForm()
  showForm.value = true
}
const closeForm = () => {
  showForm.value = false
  resetForm()
}

const editVersion = async (row) => {
  emitter.emit(COMMON.LOADING.SHOW)
  try {
    const detail = await termsApi.getDetail(row.id)
    editingId.value = row.id
    // 상세 응답에 isRequired 가 없어 기본값 true 로 둔다 (필요시 수정)
    form.value = {
      title: detail?.title ?? row.title ?? '',
      contents: detail?.contents ?? '',
      isRequired: true
    }
    showForm.value = true
  } catch (e) {
    showError(e)
  } finally {
    emitter.emit(COMMON.LOADING.HIDE)
  }
}

const submit = async (mode) => {
  if (!canSubmit.value) return
  const body = {
    agreementTypeId: props.agreementTypeId,
    title: form.value.title.trim(),
    contents: form.value.contents,
    isRequired: form.value.isRequired
  }
  emitter.emit(COMMON.LOADING.SHOW)
  try {
    if (mode === 'create') await termsApi.save(body)
    else if (mode === 'draft') await termsApi.saveDraft(editingId.value, body)
    else if (mode === 'publish') await termsApi.publish(editingId.value, body)
    closeForm()
    await loadTerms()
  } catch (e) {
    showError(e)
  } finally {
    emitter.emit(COMMON.LOADING.HIDE)
  }
}

/* 내용 보기 */
const showView = ref(false)
const viewing = ref(null)
const viewContent = async (row) => {
  emitter.emit(COMMON.LOADING.SHOW)
  try {
    const detail = await termsApi.getDetail(row.id)
    viewing.value = { title: detail?.title ?? row.title, contents: detail?.contents ?? '' }
    showView.value = true
  } catch (e) {
    showError(e)
  } finally {
    emitter.emit(COMMON.LOADING.HIDE)
  }
}

/* 삭제 */
const showDelete = ref(false)
const deleteTarget = ref(null)
const deleteMessage = computed(() =>
  deleteTarget.value ? `"${deleteTarget.value.title}" 약관을 삭제하시겠어요?` : ''
)
const openDelete = (row) => {
  deleteTarget.value = row
  showDelete.value = true
}
const onDeleteConfirm = async () => {
  emitter.emit(COMMON.LOADING.SHOW)
  try {
    await termsApi.remove(deleteTarget.value.id)
    await loadTerms()
  } catch (e) {
    showError(e)
  } finally {
    emitter.emit(COMMON.LOADING.HIDE)
  }
}

onMounted(() => {
  fetchTerms()
})
</script>

<style scoped lang="scss">
.field-label {
  font-size: 0.82rem;
  font-weight: 600;
  color: #555;
  margin-bottom: 0.35rem;
}

.terms-body {
  max-height: 60vh;
  overflow: auto;
  line-height: 1.6;
}
</style>
