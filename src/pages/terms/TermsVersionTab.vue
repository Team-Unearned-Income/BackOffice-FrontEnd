<template>
  <div>
    <!-- 새 버전 등록 버튼 -->
    <div class="row justify-end q-mb-md">
      <q-btn label="+ 새 버전 등록" color="dark" outline @click="openCreate" />
    </div>

    <!-- 버전 목록 -->
    <PageTable
      class="q-pa-md"
      ref="tableRef"
      v-model="tableModel"
      :row-key="'id'"
      :table-style="{ minHeight: '30vh' }"
      :on-top-options="false"
    >
      <!-- 검색 -->
      <template #filter-section>
        <div class="row q-col-gutter-sm items-center q-pb-md">
          <div class="col-12 col-md-5">
            <TableSearch
              v-model:model-value="searchKeyword"
              placeholder="버전, 요약 검색"
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
        <q-btn
          v-if="slotProps.row.status === 'current'"
          flat
          dense
          no-caps
          color="dark"
          label="수정"
          @click="editVersion(slotProps.row)"
        />
      </template>
    </PageTable>

    <!-- 새 버전 등록 / 수정 폼 -->
    <q-slide-transition>
      <q-card v-if="showForm" flat bordered class="q-pa-md q-mt-md">
        <div class="text-subtitle1 text-bold q-mb-md">{{ editingId ? '버전 수정' : '버전 등록' }}</div>
        <div class="row q-col-gutter-sm q-mb-sm">
          <div class="col-12 col-md-3">
            <div class="field-label">버전명</div>
            <q-input v-model="form.version" dense outlined placeholder="예: v4" />
          </div>
          <div class="col-12 col-md-3">
            <div class="field-label">시행일</div>
            <q-input v-model="form.effectiveDate" dense outlined placeholder="예: 2025.07.01" />
          </div>
          <div class="col-12 col-md-6">
            <div class="field-label">요약</div>
            <q-input v-model="form.summary" dense outlined placeholder="변경 내용 요약" />
          </div>
        </div>
        <q-editor
          v-model="form.body"
          :toolbar="[['bold', 'italic'], ['link']]"
          min-height="120px"
          :placeholder="bodyPlaceholder"
        />
        <div class="row justify-end q-gutter-sm q-mt-md">
          <q-btn label="취소" color="grey-7" outline @click="closeForm" />
          <q-btn
            label="등록"
            color="dark"
            unelevated
            text-color="white"
            :disable="!form.version.trim()"
            @click="submit"
          />
        </div>
      </q-card>
    </q-slide-transition>

    <!-- 내용 보기 모달 -->
    <q-dialog v-model="showView">
      <q-card style="width: 620px; max-width: 90vw">
        <q-card-section class="row items-center justify-between bg-grey-2">
          <div class="text-h6 text-bold">{{ viewing?.version }} 내용</div>
          <q-btn v-close-popup flat round dense icon="close" />
        </q-card-section>
        <q-separator />
        <q-card-section class="terms-body" v-html="viewing?.body" />
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import PageTable from '@/components/table/PageTable.vue'
import TableSearch from '@/components/table/TableSearch.vue'
import { STATUS_META, badgeHtml } from './termsMeta'

const props = defineProps({
  /** 초기 버전 목록 */
  initialVersions: {
    type: Array,
    default: () => []
  },
  bodyPlaceholder: {
    type: String,
    default: '약관 전문을 입력해주세요'
  }
})

/** 로컬 버전 목록 (탭별 독립 관리) */
const versions = ref(props.initialVersions.map((v) => ({ ...v })))

const searchKeyword = ref('')

const tableRef = ref(null)
const tableModel = ref({
  filter: {},
  search: {},
  selected: [],
  filterAndSearchData: {},
  header: [
    { name: 'version', label: '버전', field: 'version', align: 'left', tooltip: false },
    { name: 'effectiveDate', label: '시행일', field: 'effectiveDate', align: 'center', tooltip: false },
    { name: 'summary', label: '요약', field: 'summary', align: 'left', tooltip: false, headerStyle: 'min-width: 14rem' },
    { name: 'status', label: '상태', field: 'status', align: 'center', tooltip: false, format: (v) => badgeHtml(STATUS_META[v]) },
    { name: 'action', label: '액션', field: 'id', align: 'center', tooltip: false, slot: 'action' }
  ],
  rows: [],
  pagination: { page: 1, rowsPerPage: 15, rowsNumber: 0 }
})

const syncRows = () => {
  const kw = searchKeyword.value.trim().toLowerCase()
  const filtered = kw
    ? versions.value.filter(
        (v) => v.version.toLowerCase().includes(kw) || v.summary.toLowerCase().includes(kw)
      )
    : versions.value
  tableModel.value.rows = filtered
  tableModel.value.pagination.rowsNumber = filtered.length
}

const clearSearch = () => {
  searchKeyword.value = ''
  syncRows()
}

/** 등록/수정 폼 */
const showForm = ref(false)
const editingId = ref(null)
const form = ref({ version: '', effectiveDate: '', summary: '', body: '' })

const resetForm = () => {
  form.value = { version: '', effectiveDate: '', summary: '', body: '' }
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

/** 수정: 현행 버전만 가능 */
const editVersion = (row) => {
  editingId.value = row.id
  form.value = {
    version: row.version,
    effectiveDate: row.effectiveDate,
    summary: row.summary,
    body: row.body
  }
  showForm.value = true
}

const submit = () => {
  if (!form.value.version.trim()) return
  if (editingId.value) {
    const target = versions.value.find((v) => v.id === editingId.value)
    if (target) Object.assign(target, { ...form.value })
  } else {
    // 신규 등록: 기존 현행 → 이전, 신규 → 현행
    versions.value.forEach((v) => {
      if (v.status === 'current') v.status = 'previous'
    })
    const newId = Math.max(0, ...versions.value.map((v) => v.id)) + 1
    versions.value.unshift({ id: newId, ...form.value, status: 'current' })
  }
  syncRows()
  closeForm()
}

/** 내용 보기 (이전 버전 포함 모두 가능, 읽기 전용) */
const showView = ref(false)
const viewing = ref(null)
const viewContent = (row) => {
  viewing.value = row
  showView.value = true
}

onMounted(() => {
  syncRows()
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
