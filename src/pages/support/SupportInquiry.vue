<template>
  <div>
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
              :options="INQUIRY_TYPE_OPTIONS"
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
import { onMounted, ref } from 'vue'
import PageTable from '@/components/table/PageTable.vue'
import TableSearch from '@/components/table/TableSearch.vue'
import InquiryDetailPanel from './InquiryDetailPanel.vue'
import {
  INQUIRY_TYPE_META,
  INQUIRY_STATUS_META,
  INQUIRY_STATUS_OPTIONS,
  INQUIRY_TYPE_OPTIONS,
  badgeHtml
} from './supportMeta'

const emit = defineEmits(['pending-count'])

/** 목업 1:1 문의 데이터 */
const inquiries = ref([
  { id: 301, member: '김종민', memberId: 1021, type: 'account', title: '학교 이메일 인증 처리 안 됩니다', content: '학교 이메일로 인증 신청을 했는데 3일이 지나도 처리가 안 됩니다. 확인 부탁드립니다.', receivedDate: '2025.06.07', status: 'pending', answer: '' },
  { id: 299, member: '이수현', memberId: 1022, type: 'matching', title: '채팅방에 오류가 발생했어요', content: '채팅방 입장 시 오류가 발생합니다. 확인 부탁드립니다.', receivedDate: '2025.06.06', status: 'pending', answer: '' },
  { id: 294, member: '박민준', memberId: 1009, type: 'bug', title: '앱이 갑자기 종료됩니다', content: '앱 사용 중 자주 종료됩니다.', receivedDate: '2025.06.04', status: 'answered', answer: '확인 결과 일시적 오류였으며 최신 버전에서 해결되었습니다.' },
  { id: 288, member: '최예린', memberId: 1008, type: 'etc', title: '서비스 이용 관련 문의', content: '서비스 이용 방법이 궁금합니다.', receivedDate: '2025.06.02', status: 'answered', answer: '고객센터 FAQ를 참고해주세요.' }
])

const tableRef = ref(null)
const tableModel = ref({
  filter: { status: 'all', type: 'all' },
  search: { inputFilter: '' },
  selected: [],
  filterAndSearchData: {},
  header: [
    { name: 'id', label: '문의 ID', field: 'id', align: 'left', tooltip: false, format: (v) => `<span>#${v}</span>` },
    { name: 'member', label: '회원명', field: 'member', align: 'left', tooltip: false },
    { name: 'type', label: '유형', field: 'type', align: 'center', tooltip: false, format: (v) => badgeHtml(INQUIRY_TYPE_META[v]) },
    { name: 'title', label: '제목', field: 'title', align: 'left', tooltip: false, headerStyle: 'min-width: 12rem' },
    { name: 'receivedDate', label: '접수일', field: 'receivedDate', align: 'center', tooltip: false },
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
  emit('pending-count', inquiries.value.filter((i) => i.status === 'pending').length)
}

const applySearch = () => {
  tableModel.value.pagination.page = 1
  tableRef.value.requestServerInteraction()
}
const clearSearch = () => {
  tableModel.value.search.inputFilter = ''
  tableModel.value.pagination.page = 1
  tableRef.value.requestServerInteraction()
}

const getFiltered = () => {
  const kw = (tableModel.value.search.inputFilter || '').trim().toLowerCase()
  const { status, type } = tableModel.value.filter
  return inquiries.value.filter((i) => {
    const keywordOk = !kw || i.member.toLowerCase().includes(kw) || i.content.toLowerCase().includes(kw)
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
const openDetail = (row) => {
  selectedInquiry.value = row
  showDetail.value = true
}

/** 답변 전송 → 상태 답변완료 전환, 처리자·일시 자동 기록 */
const onAnswer = (text) => {
  selectedInquiry.value.answer = text
  selectedInquiry.value.status = 'answered'
  onRequest()
  emitPendingCount()
}

onMounted(() => {
  tableRef.value.requestServerInteraction()
  emitPendingCount()
})
</script>
