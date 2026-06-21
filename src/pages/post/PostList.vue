<template>
  <div class="q-pa-lg">
    <div class="text-h5 text-bold q-mb-md">게시글 관리</div>

    <PageTable
      class="q-pa-md"
      ref="tableRef"
      v-model="tableModel"
      :row-key="'id'"
      :table-style="{ minHeight: '45vh' }"
      content-area-class="q-pb-sm"
      @request="onRequest"
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
      <PostDetailPanel
        v-if="selectedPost"
        :post="selectedPost"
        @close="showDetail = false"
        @hide="onHide"
        @republish="onRepublish"
        @remove="onRemove"
      />
    </q-dialog>
  </div>
</template>

<script setup>
import { inject, onMounted, ref } from 'vue'
import COMMON from '@/constants/commonConstatns'
import PageTable from '@/components/table/PageTable.vue'
import TableSearch from '@/components/table/TableSearch.vue'
import PostDetailPanel from './PostDetailPanel.vue'
import { POST_STATUS_META, POST_STATUS_OPTIONS, badgeHtml } from './postMeta'

const emitter = inject('emitter')

/** 목업 게시글 데이터 (API 연동 시 교체) */
const posts = ref([
  { id: 201, title: '신촌역 도보 5분, 풀옵션 원룸', author: '김지수', authorId: 1021, region: '서울 서대문구', moveInLabel: '즉시', status: 'visible', regDate: '2025.06.01', deposit: '1,000', rent: '55만원', views: 128, thumbnail: '' },
  { id: 198, title: '홍대 쉐어하우스, 개인방 있음', author: '박민준', authorId: 1009, region: '서울 마포구', moveInLabel: '협의가능', status: 'visible', regDate: '2025.05.28', deposit: '500', rent: '40만원', views: 86, thumbnail: '' },
  { id: 185, title: '강남구 역삼동 오피스텔', author: '이지은', authorId: 1014, region: '서울 강남구', moveInLabel: '25.05.01', status: 'expired', regDate: '2025.04.22', deposit: '2,000', rent: '80만원', views: 240, thumbnail: '' },
  { id: 180, title: '연남동 빌라 투룸, 2인 모집', author: '최예린', authorId: 1008, region: '서울 마포구', moveInLabel: '25.04.30', status: 'hidden', regDate: '2025.04.18', deposit: '1,500', rent: '70만원', views: 53, thumbnail: '' }
])

const tableRef = ref(null)
const tableModel = ref({
  filter: { status: 'all' },
  search: { inputFilter: '' },
  selected: [],
  filterAndSearchData: {},
  header: [
    { name: 'id', label: 'ID', field: 'id', align: 'left', tooltip: false, format: (v) => `<span>#${v}</span>` },
    { name: 'title', label: '제목', field: 'title', align: 'left', tooltip: false, headerStyle: 'min-width: 12rem' },
    { name: 'author', label: '작성자', field: 'author', align: 'left', tooltip: false },
    { name: 'region', label: '지역', field: 'region', align: 'left', tooltip: false },
    { name: 'moveInLabel', label: '입주가능일', field: 'moveInLabel', align: 'center', tooltip: false },
    { name: 'status', label: '노출상태', field: 'status', align: 'center', tooltip: false, format: (v) => badgeHtml(POST_STATUS_META[v]) },
    { name: 'regDate', label: '등록일', field: 'regDate', align: 'center', tooltip: false, format: (v) => `<span>${v.slice(5)}</span>` },
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

/** 검색/필터 (검색 버튼으로 적용, 1페이지로 초기화) */
const applySearch = () => {
  tableModel.value.pagination.page = 1
  tableRef.value.requestServerInteraction()
}
const clearSearch = () => {
  tableModel.value.search.inputFilter = ''
  tableModel.value.pagination.page = 1
  tableRef.value.requestServerInteraction()
}

const getFilteredPosts = () => {
  const kw = (tableModel.value.search.inputFilter || '').trim().toLowerCase()
  const { status } = tableModel.value.filter
  return posts.value.filter((p) => {
    const keywordOk =
      !kw ||
      p.title.toLowerCase().includes(kw) ||
      p.author.toLowerCase().includes(kw) ||
      p.region.toLowerCase().includes(kw)
    const statusOk = status === 'all' || p.status === status
    return keywordOk && statusOk
  })
}

/** PageTable @request: 목업 필터링 + 페이지네이션 (API 자리) */
const onRequest = () => {
  const all = getFilteredPosts()
  const { page, rowsPerPage } = tableModel.value.pagination
  tableModel.value.pagination.rowsNumber = all.length
  const start = (page - 1) * rowsPerPage
  tableModel.value.rows = all.slice(start, start + rowsPerPage)
}

/** 상세 패널 */
const showDetail = ref(false)
const selectedPost = ref(null)

const openDetail = (row) => {
  selectedPost.value = row
  showDetail.value = true
}

/** 처리 핸들러 — 패널 상태 즉시 갱신 후 목록 재조회 */
const onHide = () => {
  selectedPost.value.status = 'hidden'
  onRequest()
}
const onRepublish = () => {
  selectedPost.value.status = 'visible'
  onRequest()
}
const onRemove = () => {
  const idx = posts.value.findIndex((p) => p.id === selectedPost.value.id)
  if (idx !== -1) posts.value.splice(idx, 1)
  showDetail.value = false
  onRequest()
}

onMounted(() => {
  emitter.emit(COMMON.LOADING.HIDE)
  tableRef.value.requestServerInteraction()
})
</script>
