<template>
  <div class="q-pa-lg">
    <div class="text-h5 text-bold q-mb-md">생활패턴 관리</div>

    <!-- 목록 -->
    <PageTable
      ref="tableRef"
      v-model="tableModel"
      class="q-pa-md"
      :row-key="'id'"
      :table-style="{ minHeight: '40vh' }"
      :on-top-options="false"
    >
      <!-- 검색 / 필터 -->
      <template #filter-section>
        <div class="row justify-between items-center q-pb-md">
          <div class="row q-col-gutter-sm items-center">
            <div class="col-auto" style="min-width: 260px">
              <TableSearch
                v-model:model-value="searchKeyword"
                placeholder="항목명 검색"
                @select-search-item="syncRows"
                @clear-item="clearSearch"
              />
            </div>
            <div class="col-auto" style="min-width: 160px">
              <q-select
                v-model="typeFilter"
                :options="TYPE_FILTER_OPTIONS"
                dense
                outlined
                emit-value
                map-options
                @update:model-value="syncRows"
              />
            </div>
            <div class="col-auto">
              <q-btn label="검색" color="dark" unelevated @click="syncRows" />
            </div>
          </div>
          <div class="col-auto">
            <q-btn label="+ 생활패턴 추가" color="dark" outline @click="openCreate" />
          </div>
        </div>
      </template>

      <template #action="{ slotProps }">
        <q-btn flat dense no-caps color="primary" label="수정" @click="openEdit(slotProps.row)" />
        <q-btn flat dense no-caps color="red" label="삭제" @click="openDelete(slotProps.row)" />
      </template>
    </PageTable>

    <!-- 추가/수정 폼 모달 -->
    <LifePatternFormModal v-model:show="showForm" :pattern="editingPattern" @save="onFormSave" />

    <!-- 삭제 확인 모달 (Soft Delete: 유저 응답 보존, 앱 비노출) -->
    <ProcessConfirmModal
      v-model:show="showDelete"
      title="항목을 삭제할까요?"
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
import COMMON from '@/constants/commonConstatns'
import PageTable from '@/components/table/PageTable.vue'
import TableSearch from '@/components/table/TableSearch.vue'
import ProcessConfirmModal from '@/components/modal/ProcessConfirmModal.vue'
import AlarmDialog from '@/components/dialog/AlarmDialog.vue'
import LifePatternFormModal from './LifePatternFormModal.vue'
import { lifePatternApi } from '@/service/bo/lifePattern'
import { TYPE_META, TYPE_FILTER_OPTIONS, badgeHtml } from './lifePatternMeta'

const emitter = inject('emitter')
const $q = useQuasar()

const showError = (e) => {
  const message = e?.error?.message || e?.message || '처리 중 오류가 발생했습니다.'
  $q.dialog({ component: AlarmDialog, componentProps: { title: '오류', message } })
}

const allPatterns = ref([])
const typeFilter = ref('all')
const searchKeyword = ref('')

const detailText = (row) =>
  (row.details || [])
    .map((d) => (d.description ? `${d.values}(${d.description})` : d.values))
    .join(' / ')

const tableRef = ref(null)
const tableModel = ref({
  filter: {},
  search: {},
  selected: [],
  filterAndSearchData: {},
  header: [
    { name: 'sort', label: '순서', field: 'sort', align: 'center', tooltip: false },
    { name: 'name', label: '항목명', field: 'name', align: 'left', tooltip: false },
    { name: 'type', label: '유형', field: 'type', align: 'center', tooltip: false, format: (v) => badgeHtml(TYPE_META[v]) },
    { name: 'detail', label: '선택지', field: 'detail', align: 'left', tooltip: false, format: (v, row) => `<span>${detailText(row)}</span>` },
    { name: 'action', label: '액션', field: 'id', align: 'center', tooltip: false, slot: 'action' }
  ],
  rows: [],
  pagination: { page: 1, rowsPerPage: 15, rowsNumber: 0 }
})

const loadPatterns = async () => {
  const res = await lifePatternApi.getList({ page: 0, size: 100 })
  allPatterns.value = res?.patterns ?? []
  syncRows()
}

const fetchPatterns = async () => {
  emitter.emit(COMMON.LOADING.SHOW)
  try {
    await loadPatterns()
  } catch (e) {
    showError(e)
  } finally {
    emitter.emit(COMMON.LOADING.HIDE)
  }
}

const syncRows = () => {
  const kw = searchKeyword.value.trim().toLowerCase()
  const filtered = allPatterns.value.filter((p) => {
    const typeOk = typeFilter.value === 'all' || p.type === typeFilter.value
    const keywordOk = !kw || (p.name || '').toLowerCase().includes(kw)
    return typeOk && keywordOk
  })
  // 우선순위(sort) 오름차순 정렬
  tableModel.value.rows = [...filtered].sort((a, b) => (a.sort ?? 0) - (b.sort ?? 0))
  tableModel.value.pagination.rowsNumber = filtered.length
}

const clearSearch = () => {
  searchKeyword.value = ''
  syncRows()
}

/** 추가/수정 폼 모달 */
const showForm = ref(false)
const editingPattern = ref(null)

const openCreate = () => {
  editingPattern.value = null
  showForm.value = true
}
const openEdit = (row) => {
  editingPattern.value = row
  showForm.value = true
}
const onFormSave = async (data) => {
  emitter.emit(COMMON.LOADING.SHOW)
  try {
    if (editingPattern.value) await lifePatternApi.modify(editingPattern.value.id, data)
    else await lifePatternApi.save(data)
    showForm.value = false
    await loadPatterns()
  } catch (e) {
    showError(e)
  } finally {
    emitter.emit(COMMON.LOADING.HIDE)
  }
}

/** 삭제 확인 모달 */
const showDelete = ref(false)
const deleteTarget = ref(null)
const deleteMessage = computed(() =>
  deleteTarget.value
    ? `"${deleteTarget.value.name}" 항목을 삭제합니다.\n기존 유저 응답 데이터는 유지되며\n앱에서 더 이상 노출되지 않습니다.`
    : ''
)

const openDelete = (row) => {
  deleteTarget.value = row
  showDelete.value = true
}
const onDeleteConfirm = async () => {
  emitter.emit(COMMON.LOADING.SHOW)
  try {
    await lifePatternApi.remove(deleteTarget.value.id)
    await loadPatterns()
  } catch (e) {
    showError(e)
  } finally {
    emitter.emit(COMMON.LOADING.HIDE)
  }
}

onMounted(() => {
  fetchPatterns()
})
</script>
