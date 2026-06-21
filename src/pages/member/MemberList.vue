<template>
  <div class="q-pa-lg">
    <div class="text-h5 text-bold q-mb-md">회원 관리</div>

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
          <div class="col-12 col-md-4">
            <TableSearch
              v-model:model-value="tableModel.search.inputFilter"
              placeholder="이름 또는 이메일 검색"
              @select-search-item="applySearch"
              @clear-item="clearSearch"
            />
          </div>
          <div class="col-6 col-md-3">
            <q-select
              v-model="tableModel.filter.status"
              :options="STATUS_OPTIONS"
              dense
              outlined
              emit-value
              map-options
            />
          </div>
          <div class="col-6 col-md-3">
            <q-select
              v-model="tableModel.filter.verify"
              :options="VERIFY_OPTIONS"
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
      <MemberDetailPanel
        v-if="selectedMember"
        :member="selectedMember"
        @close="showDetail = false"
        @suspend="onSuspend"
        @unsuspend="onUnsuspend"
        @grant="onGrant"
        @revoke="onRevoke"
      />
    </q-dialog>
  </div>
</template>

<script setup>
import { inject, onMounted, ref } from 'vue'
import COMMON from '@/constants/commonConstatns'
import PageTable from '@/components/table/PageTable.vue'
import TableSearch from '@/components/table/TableSearch.vue'
import MemberDetailPanel from './MemberDetailPanel.vue'
import {
  STATUS_META,
  VERIFY_META,
  ROLE_META,
  STATUS_OPTIONS,
  VERIFY_OPTIONS,
  badgeHtml
} from './memberMeta'

const emitter = inject('emitter')

/** 목업 회원 데이터 (API 연동 시 교체) */
const members = ref([
  { id: 1015, name: '김종민', email: 'jongmin@korea.ac.kr', joinDate: '2025.05.10', verify: 'school', role: 'admin', status: 'active', birth: '1999.03.11', gender: '남', schoolEmail: 'jongmin@korea.ac.kr', companyEmail: '', reportCount: 0 },
  { id: 1022, name: '이수현', email: 'soohyun@naver.com', joinDate: '2025.05.12', verify: 'none', role: 'user', status: 'active', birth: '2000.07.22', gender: '여', schoolEmail: '', companyEmail: '', reportCount: 0 },
  { id: 1019, name: '박준혁', email: 'junho@gmail.com', joinDate: '2025.04.28', verify: 'none', role: 'user', status: 'suspended', birth: '1998.12.02', gender: '남', schoolEmail: '', companyEmail: '', reportCount: 2 },
  { id: 1008, name: '최예린', email: 'yerin@snu.ac.kr', joinDate: '2025.04.20', verify: 'school', role: 'user', status: 'withdrawn', birth: '2001.06.15', gender: '여', schoolEmail: 'yerin@snu.ac.kr', companyEmail: '', reportCount: 0 },
  { id: 1003, name: '이동훈', email: 'dh@kakao.com', joinDate: '2025.04.18', verify: 'company', role: 'user', status: 'active', birth: '1997.09.30', gender: '남', schoolEmail: '', companyEmail: 'dh@company.com', reportCount: 0 }
])

const tableRef = ref(null)
const tableModel = ref({
  filter: { status: 'all', verify: 'all' },
  search: { inputFilter: '' },
  selected: [],
  filterAndSearchData: {},
  header: [
    { name: 'id', label: '회원 ID', field: 'id', align: 'left', tooltip: false, format: (v) => `<span>#${v}</span>` },
    { name: 'name', label: '이름', field: 'name', align: 'left', tooltip: false },
    { name: 'email', label: '이메일', field: 'email', align: 'left', tooltip: false },
    { name: 'joinDate', label: '가입일', field: 'joinDate', align: 'center', tooltip: false },
    { name: 'verify', label: '신원인증', field: 'verify', align: 'center', tooltip: false, format: (v) => badgeHtml(VERIFY_META[v]) },
    {
      name: 'role',
      label: '권한',
      field: 'role',
      align: 'center',
      tooltip: false,
      format: (v) => (v === 'admin' ? badgeHtml(ROLE_META.admin) : '<span style="color:#616161">user</span>')
    },
    { name: 'status', label: '상태', field: 'status', align: 'center', tooltip: false, format: (v) => badgeHtml(STATUS_META[v]) },
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

const getFilteredMembers = () => {
  const kw = (tableModel.value.search.inputFilter || '').trim().toLowerCase()
  const { status, verify } = tableModel.value.filter
  return members.value.filter((m) => {
    const keywordOk = !kw || m.name.toLowerCase().includes(kw) || m.email.toLowerCase().includes(kw)
    const statusOk = status === 'all' || m.status === status
    const verifyOk = verify === 'all' || m.verify === verify
    return keywordOk && statusOk && verifyOk
  })
}

/** PageTable @request: 목업 필터링 + 페이지네이션 (API 자리) */
const onRequest = () => {
  const all = getFilteredMembers()
  const { page, rowsPerPage } = tableModel.value.pagination
  tableModel.value.pagination.rowsNumber = all.length
  const start = (page - 1) * rowsPerPage
  tableModel.value.rows = all.slice(start, start + rowsPerPage)
}

/** 상세 패널 */
const showDetail = ref(false)
const selectedMember = ref(null)

const openDetail = (row) => {
  selectedMember.value = row
  showDetail.value = true
}

/** 처리 핸들러 — 패널 상태 즉시 갱신 후 목록 재조회 */
const onSuspend = (reason) => {
  selectedMember.value.status = 'suspended'
  selectedMember.value.suspendReason = reason
  onRequest()
}
const onUnsuspend = () => {
  selectedMember.value.status = 'active'
  onRequest()
}
const onGrant = () => {
  selectedMember.value.role = 'admin'
  onRequest()
}
const onRevoke = () => {
  selectedMember.value.role = 'user'
  onRequest()
}

onMounted(() => {
  emitter.emit(COMMON.LOADING.HIDE)
  tableRef.value.requestServerInteraction()
})
</script>
