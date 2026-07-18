<template>
  <div class="q-pa-lg">
    <div class="text-h5 text-bold q-mb-md">게시글 관리</div>

    <PageTable
      ref="tableRef"
      v-model="tableModel"
      class="q-pa-md"
      :row-key="'id'"
      :table-style="{ minHeight: '45vh' }"
      content-area-class="q-pb-sm"
      @row-click="(event, row) => openDetail(row)"
    >
      <!-- 1. 검색 / 필터 -->
      <template #filter-section>
        <div class="row q-col-gutter-sm items-center q-pb-md">
          <div class="col-12 col-md-5">
            <TableSearch
              v-model:model-value="tableModel.search.inputFilter"
              placeholder="제목, 작성자, 지역 검색"
              @select-search-item="applySearch"
              @clear-item="clearSearch"
            />
          </div>
          <div class="col-6 col-md-4">
            <q-select
              v-model="tableModel.filter.status"
              :options="POST_STATUS_OPTIONS"
              dense
              outlined
              emit-value
              map-options
              @update:model-value="applySearch"
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
      <PostDetailPanel v-if="selectedPost" :post="selectedPost" @close="showDetail = false" @remove="onRemove" />
    </q-dialog>
  </div>
</template>

<script setup>
import { inject, onMounted, ref } from 'vue'
import { useQuasar } from 'quasar'
import dayjs from 'dayjs'
import COMMON from '@/constants/commonConstatns'
import PageTable from '@/components/table/PageTable.vue'
import TableSearch from '@/components/table/TableSearch.vue'
import AlarmDialog from '@/components/dialog/AlarmDialog.vue'
import PostDetailPanel from './PostDetailPanel.vue'
import { boardApi } from '@/service/bo/board'
import { POST_STATUS_META, POST_STATUS_OPTIONS, badgeHtml } from './postMeta'

const emitter = inject('emitter')
const $q = useQuasar()

const showError = (e) => {
  const message = e?.error?.message || e?.message || '처리 중 오류가 발생했습니다.'
  $q.dialog({ component: AlarmDialog, componentProps: { title: '오류', message } })
}

const allPosts = ref([])

const tableRef = ref(null)
const tableModel = ref({
  filter: { status: 'all' },
  search: { inputFilter: '' },
  selected: [],
  filterAndSearchData: {},
  header: [
    { name: 'id', label: 'ID', field: 'id', align: 'left', tooltip: false, format: (v) => `<span>#${v}</span>` },
    { name: 'title', label: '제목', field: 'title', align: 'left', tooltip: false, headerStyle: 'min-width: 12rem' },
    { name: 'writer', label: '작성자', field: 'writer', align: 'left', tooltip: false },
    { name: 'region', label: '지역', field: 'region', align: 'left', tooltip: false },
    {
      name: 'comeableDate',
      label: '입주가능일',
      field: 'comeableDate',
      align: 'center',
      tooltip: false,
      format: (v, row) => (row.comeableDateNegotiable ? '협의 가능' : v ? dayjs(v).format('YYYY.MM.DD') : '-')
    },
    { name: 'deleted', label: '노출상태', field: 'deleted', align: 'center', tooltip: false, format: (v) => badgeHtml(POST_STATUS_META[String(v)]) },
    {
      name: 'createdAt',
      label: '등록일',
      field: 'createdAt',
      align: 'center',
      tooltip: false,
      format: (v) => (v ? dayjs(v).format('MM.DD') : '-')
    },
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

const loadPosts = async () => {
  const res = await boardApi.getList({ page: 0, size: 100 })
  allPosts.value = res?.boardInfoList ?? []
  onRequest()
}

const fetchPosts = async () => {
  emitter.emit(COMMON.LOADING.SHOW)
  try {
    await loadPosts()
  } catch (e) {
    showError(e)
  } finally {
    emitter.emit(COMMON.LOADING.HIDE)
  }
}

/** 검색/필터 (검색 버튼으로 적용, 1페이지로 초기화) */
const applySearch = () => {
  tableModel.value.pagination.page = 1
  onRequest()
}
const clearSearch = () => {
  tableModel.value.search.inputFilter = ''
  tableModel.value.pagination.page = 1
  onRequest()
}

const getFilteredPosts = () => {
  const kw = (tableModel.value.search.inputFilter || '').trim().toLowerCase()
  const { status } = tableModel.value.filter
  return allPosts.value.filter((p) => {
    const keywordOk =
      !kw ||
      (p.title || '').toLowerCase().includes(kw) ||
      (p.writer || '').toLowerCase().includes(kw) ||
      (p.region || '').toLowerCase().includes(kw)
    const statusOk = status === 'all' || String(p.deleted) === status
    return keywordOk && statusOk
  })
}

const onRequest = () => {
  const all = getFilteredPosts()
  const { page, rowsPerPage } = tableModel.value.pagination
  tableModel.value.pagination.rowsNumber = all.length
  const start = (page - 1) * rowsPerPage
  tableModel.value.rows = all.slice(start, start + rowsPerPage)
}

/** 상세 패널 — 목록엔 보증금/월세/조회수/썸네일 등이 없어 클릭 시 상세를 다시 조회 */
const showDetail = ref(false)
const selectedPost = ref(null)

const openDetail = async (row) => {
  emitter.emit(COMMON.LOADING.SHOW)
  try {
    const detail = await boardApi.getDetail(row.id)
    selectedPost.value = { id: row.id, ...detail }
    showDetail.value = true
  } catch (e) {
    showError(e)
  } finally {
    emitter.emit(COMMON.LOADING.HIDE)
  }
}

/** 삭제 — soft delete, 재노출/비공개 토글은 백엔드 미지원 */
const onRemove = async (reason) => {
  emitter.emit(COMMON.LOADING.SHOW)
  try {
    await boardApi.remove(selectedPost.value.id, reason)
    showDetail.value = false
    await loadPosts()
  } catch (e) {
    showError(e)
  } finally {
    emitter.emit(COMMON.LOADING.HIDE)
  }
}

onMounted(() => {
  fetchPosts()
})
</script>
