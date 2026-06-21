<template>
  <div class="q-pa-lg">
    <div class="text-h5 text-bold q-mb-md">생활패턴 관리</div>

    <!-- 추가 버튼 -->
    <div class="row justify-end q-mb-md">
      <q-btn label="+ 생활패턴 추가" color="dark" outline @click="openCreate" />
    </div>

    <!-- 목록 -->
    <PageTable
      class="q-pa-md"
      ref="tableRef"
      v-model="tableModel"
      :row-key="'id'"
      :table-style="{ minHeight: '40vh' }"
      :on-top-options="false"
    >
      <!-- 검색 / 필터 -->
      <template #filter-section>
        <div class="row q-col-gutter-sm items-center q-pb-md">
          <div class="col-12 col-md-4">
            <TableSearch
              v-model:model-value="searchKeyword"
              placeholder="항목명 검색"
              @select-search-item="syncRows"
              @clear-item="clearSearch"
            />
          </div>
          <div class="col-6 col-md-3">
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
      </template>

      <template #action="{ slotProps }">
        <q-btn flat dense no-caps color="primary" label="수정" @click="openEdit(slotProps.row)" />
        <q-btn flat dense no-caps color="red" label="삭제" @click="confirmDelete(slotProps.row)" />
      </template>
    </PageTable>
  </div>
</template>

<script setup>
import { inject, onMounted, ref } from 'vue'
import { useQuasar } from 'quasar'
import COMMON from '@/constants/commonConstatns'
import PageTable from '@/components/table/PageTable.vue'
import TableSearch from '@/components/table/TableSearch.vue'
import ProcessConfirmModal from '@/components/modal/ProcessConfirmModal.vue'
import LifePatternFormModal from './LifePatternFormModal.vue'
import { TYPE_META, VISIBLE_META, HIDDEN_META, TYPE_FILTER_OPTIONS, badgeHtml } from './lifePatternMeta'

const emitter = inject('emitter')
const $q = useQuasar()

/** 목업 생활패턴 항목 */
const patterns = ref([
  { id: 1, order: 1, name: '취침 시간', type: 'slider', visible: true, minLabel: '일찍 자요', maxLabel: '늦게 자요', steps: 5, options: [] },
  { id: 2, order: 2, name: '청결 민감도', type: 'slider', visible: true, minLabel: '둔감해요', maxLabel: '매우 예민해요', steps: 5, options: [] },
  { id: 3, order: 3, name: '소음 민감도', type: 'slider', visible: true, minLabel: '괜찮아요', maxLabel: '매우 예민해요', steps: 5, options: [] },
  { id: 4, order: 4, name: '실내 흡연', type: 'chip', visible: true, minLabel: '', maxLabel: '', steps: 5, options: ['비흡연', '흡연'] },
  { id: 5, order: 5, name: '반려동물', type: 'chip', visible: false, minLabel: '', maxLabel: '', steps: 5, options: ['없어요', '있어요'] }
])

const typeFilter = ref('all')
const searchKeyword = ref('')

const detailText = (row) =>
  row.type === 'slider'
    ? `${row.minLabel} ↔ ${row.maxLabel} (${row.steps}단계)`
    : row.options.join(' / ')

const tableRef = ref(null)
const tableModel = ref({
  filter: {},
  search: {},
  selected: [],
  filterAndSearchData: {},
  header: [
    { name: 'order', label: '순서', field: 'order', align: 'center', tooltip: false },
    { name: 'name', label: '항목명', field: 'name', align: 'left', tooltip: false },
    { name: 'type', label: '유형', field: 'type', align: 'center', tooltip: false, format: (v) => badgeHtml(TYPE_META[v]) },
    { name: 'visible', label: '노출', field: 'visible', align: 'center', tooltip: false, format: (v) => badgeHtml(v ? VISIBLE_META : HIDDEN_META) },
    { name: 'detail', label: '선택지 / 단계', field: 'detail', align: 'left', tooltip: false, format: (v, row) => `<span>${detailText(row)}</span>` },
    { name: 'action', label: '액션', field: 'id', align: 'center', tooltip: false, slot: 'action' }
  ],
  rows: [],
  pagination: { page: 1, rowsPerPage: 15, rowsNumber: 0 }
})

const syncRows = () => {
  const kw = searchKeyword.value.trim().toLowerCase()
  const filtered = patterns.value.filter((p) => {
    const typeOk = typeFilter.value === 'all' || p.type === typeFilter.value
    const keywordOk = !kw || p.name.toLowerCase().includes(kw)
    return typeOk && keywordOk
  })
  // 우선순위(order) 오름차순 정렬
  tableModel.value.rows = [...filtered].sort((a, b) => a.order - b.order)
  tableModel.value.pagination.rowsNumber = filtered.length
}

const clearSearch = () => {
  searchKeyword.value = ''
  syncRows()
}

/** 추가 */
const openCreate = () => {
  $q.dialog({ component: LifePatternFormModal }).onOk((data) => {
    const newId = Math.max(0, ...patterns.value.map((p) => p.id)) + 1
    patterns.value.push({ id: newId, ...data })
    syncRows()
  })
}

/** 수정 */
const openEdit = (row) => {
  $q.dialog({ component: LifePatternFormModal, componentProps: { pattern: row } }).onOk((data) => {
    const target = patterns.value.find((p) => p.id === row.id)
    if (target) Object.assign(target, data)
    syncRows()
  })
}

/** 삭제 (Soft Delete: 유저 응답 보존, 앱 비노출) */
const confirmDelete = (row) => {
  $q.dialog({
    component: ProcessConfirmModal,
    componentProps: {
      title: '항목을 삭제할까요?',
      message: `"${row.name}" 항목을 삭제합니다.\n기존 유저 응답 데이터는 유지되며\n앱에서 더 이상 노출되지 않습니다.`,
      requireReason: false,
      confirmLabel: '삭제',
      confirmColor: 'red'
    }
  }).onOk(() => {
    patterns.value = patterns.value.filter((p) => p.id !== row.id)
    syncRows()
  })
}

onMounted(() => {
  emitter.emit(COMMON.LOADING.HIDE)
  syncRows()
})
</script>
