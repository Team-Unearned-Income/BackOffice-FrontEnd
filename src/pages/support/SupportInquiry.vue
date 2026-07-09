<template>
  <div>
    <PageTable
      ref="tableRef"
      v-model="tableModel"
      class="q-pa-md"
      :row-key="'id'"
      :table-style="{ minHeight: '45vh' }"
      content-area-class="q-pb-sm"
      @request="onRequest"
      @row-click="(event, row) => openDetail(row)"
    >
      <!-- 검색 / 필터 -->
      <template #filter-section>
        <div class="row q-col-gutter-sm items-center q-pb-md">
          <div class="col-12 col-md-4">
            <TableSearch
              v-model:model-value="tableModel.search.inputFilter"
              placeholder="회원명, 문의 내용 검색"
              @select-search-item="applySearch"
              @clear-item="clearSearch"
            />
          </div>
          <div class="col-6 col-md-3">
            <q-select
              v-model="tableModel.filter.status"
              :options="INQUIRY_STATUS_OPTIONS"
              dense
              outlined
              emit-value
              map-options
            />
          </div>
          <div class="col-6 col-md-3">
            <q-select
              v-model="tableModel.filter.type"
              :options="typeOptions"
              dense
              outlined
              emit-value
              map-options
            />
          </div>
          <div class="col-auto">
            <q-btn label="검색" color="dark" unelevated @click="applySearch" />
          </div>
        </div>
      </template>
    </PageTable>

    <!-- 상세 패널 (우측 슬라이드) -->
    <q-dialog v-model="showDetail" position="right">
      <InquiryDetailPanel
        v-if="selectedInquiry"
        :inquiry="selectedInquiry"
        @close="showDetail = false"
        @answer="onAnswer"
      />
    </q-dialog>
  </div>
</template>

<script setup>
import { computed, inject, onMounted, ref } from 'vue'
import { useQuasar } from 'quasar'
import dayjs from 'dayjs'
import PageTable from '@/components/table/PageTable.vue'
import TableSearch from '@/components/table/TableSearch.vue'
import InquiryDetailPanel from './InquiryDetailPanel.vue'
import AlarmDialog from '@/components/dialog/AlarmDialog.vue'
import COMMON from '@/constants/commonConstatns'
import { inquiryApi } from '@/service/bo/inquiry'
import { INQUIRY_STATUS_META, INQUIRY_STATUS_OPTIONS, badgeHtml, typeBadgeHtml } from './supportMeta'

const emit = defineEmits(['pending-count'])

const emitter = inject('emitter')
const $q = useQuasar()

const showError = (e) => {
  const message = e?.error?.message || e?.message || '처리 중 오류가 발생했습니다.'
  $q.dialog({ component: AlarmDialog, componentProps: { title: '오류', message } })
}

const allInquiries = ref([])
const categories = ref([])
const typeOptions = computed(() => [
  { label: '유형 전체', value: 'all' },
  ...categories.value.map((c) => ({ label: c.name, value: c.name }))
])

const tableRef = ref(null)
const tableModel = ref({
  filter: { status: 'all', type: 'all' },
  search: { inputFilter: '' },
  selected: [],
  filterAndSearchData: {},
  header: [
    { name: 'id', label: '문의 ID', field: 'id', align: 'left', tooltip: false, format: (v) => `<span>#${v}</span>` },
    { name: 'writer', label: '회원명', field: 'writer', align: 'left', tooltip: false },
    { name: 'type', label: '유형', field: 'type', align: 'center', tooltip: false, format: (v) => typeBadgeHtml(v) },
    { name: 'title', label: '제목', field: 'title', align: 'left', tooltip: false, headerStyle: 'min-width: 12rem' },
    {
      name: 'createAt',
      label: '접수일',
      field: 'createAt',
      align: 'center',
      tooltip: false,
      format: (v) => (v ? dayjs(v).format('YYYY.MM.DD') : '-')
    },
    { name: 'status', label: '상태', field: 'status', align: 'center', tooltip: false, format: (v) => badgeHtml(INQUIRY_STATUS_META[v]) },
    {
      name: 'action',
      label: '액션',
      field: 'action',
      align: 'center',
      tooltip: false,
      format: () => '<span style="color:#1976d2;cursor:pointer;text-decoration:underline">상세 보기</span>'
    }
  ],
  rows: [],
  pagination: { page: 1, rowsPerPage: 15, rowsNumber: 0 }
})

const emitPendingCount = () => {
  emit('pending-count', allInquiries.value.filter((i) => i.status === '답변 대기중').length)
}

const loadCategories = async () => {
  const res = await inquiryApi.getCategoryList()
  categories.value = res?.inquirieCategorys ?? []
}

const loadInquiries = async () => {
  const res = await inquiryApi.getList({ page: 0, size: 100 })
  allInquiries.value = res?.inquiries ?? []
  onRequest()
  emitPendingCount()
}

const fetchInquiries = async () => {
  emitter.emit(COMMON.LOADING.SHOW)
  try {
    await Promise.all([loadCategories(), loadInquiries()])
  } catch (e) {
    showError(e)
  } finally {
    emitter.emit(COMMON.LOADING.HIDE)
  }
}

const applySearch = () => {
  tableModel.value.pagination.page = 1
  onRequest()
}
const clearSearch = () => {
  tableModel.value.search.inputFilter = ''
  tableModel.value.pagination.page = 1
  onRequest()
}

const getFiltered = () => {
  const kw = (tableModel.value.search.inputFilter || '').trim().toLowerCase()
  const { status, type } = tableModel.value.filter
  return allInquiries.value.filter((i) => {
    const keywordOk =
      !kw || (i.writer || '').toLowerCase().includes(kw) || (i.title || '').toLowerCase().includes(kw)
    const statusOk = status === 'all' || i.status === status
    const typeOk = type === 'all' || i.type === type
    return keywordOk && statusOk && typeOk
  })
}

const onRequest = () => {
  const all = getFiltered()
  const { page, rowsPerPage } = tableModel.value.pagination
  tableModel.value.pagination.rowsNumber = all.length
  const start = (page - 1) * rowsPerPage
  tableModel.value.rows = all.slice(start, start + rowsPerPage)
}

/** 상세 패널 */
const showDetail = ref(false)
const selectedInquiry = ref(null)
const openDetail = async (row) => {
  emitter.emit(COMMON.LOADING.SHOW)
  try {
    const detail = await inquiryApi.getDetail(row.id)
    selectedInquiry.value = detail?.inquirie ?? null
    showDetail.value = true
  } catch (e) {
    showError(e)
  } finally {
    emitter.emit(COMMON.LOADING.HIDE)
  }
}

/** 답변 전송 → 상태 답변완료 전환, 처리자·일시 자동 기록 */
const onAnswer = async (text) => {
  emitter.emit(COMMON.LOADING.SHOW)
  try {
    await inquiryApi.reply({ inquirieId: selectedInquiry.value.id, contents: text })
    const detail = await inquiryApi.getDetail(selectedInquiry.value.id)
    selectedInquiry.value = detail?.inquirie ?? null
    await loadInquiries()
  } catch (e) {
    showError(e)
  } finally {
    emitter.emit(COMMON.LOADING.HIDE)
  }
}

onMounted(() => {
  fetchInquiries()
})
</script>
