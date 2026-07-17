<template>
  <div class="q-pa-lg">
    <div class="text-h5 text-bold q-mb-md">회원 관리</div>

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
              @update:model-value="applySearch"
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
      <MemberDetailPanel
        v-if="selectedMember"
        :member="selectedMember"
        @close="showDetail = false"
        @suspend="onSuspend"
        @grant="onGrant"
        @revoke="onRevoke"
      />
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
import MemberDetailPanel from './MemberDetailPanel.vue'
import { memberApi } from '@/service/bo/member'
import {
  STATUS_META,
  STATUS_UNKNOWN_META,
  APPROVE_META,
  APPROVE_UNKNOWN_META,
  ROLE_META,
  ROLE_UNKNOWN_META,
  STATUS_OPTIONS,
  VERIFY_OPTIONS,
  badgeHtml
} from './memberMeta'

const emitter = inject('emitter')
const $q = useQuasar()

const showError = (e) => {
  const message = e?.error?.message || e?.message || '처리 중 오류가 발생했습니다.'
  $q.dialog({ component: AlarmDialog, componentProps: { title: '오류', message } })
}

const allMembers = ref([])

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
    {
      name: 'createdAt',
      label: '가입일',
      field: 'createdAt',
      align: 'center',
      tooltip: false,
      format: (v) => (v ? dayjs(v).format('YYYY.MM.DD') : '-')
    },
    { name: 'authenticationType', label: '신원인증', field: 'authenticationType', align: 'center', tooltip: false, format: (v) => badgeHtml(APPROVE_META[v] ?? APPROVE_UNKNOWN_META) },
    { name: 'role', label: '권한', field: 'role', align: 'center', tooltip: false, format: (v) => badgeHtml(ROLE_META[v] ?? ROLE_UNKNOWN_META) },
    { name: 'state', label: '상태', field: 'state', align: 'center', tooltip: false, format: (v) => badgeHtml(STATUS_META[v] ?? STATUS_UNKNOWN_META) },
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

const loadMembers = async () => {
  const res = await memberApi.getList({ page: 0, size: 100 })
  allMembers.value = res?.memberInfoList ?? []
  onRequest()
}

const fetchMembers = async () => {
  emitter.emit(COMMON.LOADING.SHOW)
  try {
    await loadMembers()
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

const getFilteredMembers = () => {
  const kw = (tableModel.value.search.inputFilter || '').trim().toLowerCase()
  const { status, verify } = tableModel.value.filter
  return allMembers.value.filter((m) => {
    const keywordOk =
      !kw || (m.name || '').toLowerCase().includes(kw) || (m.email || '').toLowerCase().includes(kw)
    const statusOk = status === 'all' || m.state === status
    const verifyOk = verify === 'all' || m.authenticationType === verify
    return keywordOk && statusOk && verifyOk
  })
}

const onRequest = () => {
  const all = getFilteredMembers()
  const { page, rowsPerPage } = tableModel.value.pagination
  tableModel.value.pagination.rowsNumber = all.length
  const start = (page - 1) * rowsPerPage
  tableModel.value.rows = all.slice(start, start + rowsPerPage)
}

/** 상세 패널 — 목록엔 생년월일/성별/신고횟수/인증이메일이 없어 클릭 시 상세를 다시 조회 */
const showDetail = ref(false)
const selectedMember = ref(null)

const openDetail = async (row) => {
  emitter.emit(COMMON.LOADING.SHOW)
  try {
    const detail = await memberApi.getDetail(row.id)
    selectedMember.value = { id: row.id, ...detail }
    showDetail.value = true
  } catch (e) {
    showError(e)
  } finally {
    emitter.emit(COMMON.LOADING.HIDE)
  }
}

/** 정지 — 정지 해제 API가 없어 되돌릴 수 없음 (모달 사유는 백엔드가 안 받아 저장되지 않음) */
const onSuspend = async () => {
  emitter.emit(COMMON.LOADING.SHOW)
  try {
    await memberApi.suspend(selectedMember.value.id)
    showDetail.value = false
    await loadMembers()
  } catch (e) {
    showError(e)
  } finally {
    emitter.emit(COMMON.LOADING.HIDE)
  }
}

const onGrant = async () => {
  emitter.emit(COMMON.LOADING.SHOW)
  try {
    await memberApi.setAuth(selectedMember.value.id, 'ADMIN')
    showDetail.value = false
    await loadMembers()
  } catch (e) {
    showError(e)
  } finally {
    emitter.emit(COMMON.LOADING.HIDE)
  }
}
const onRevoke = async () => {
  emitter.emit(COMMON.LOADING.SHOW)
  try {
    await memberApi.setAuth(selectedMember.value.id, 'USER')
    showDetail.value = false
    await loadMembers()
  } catch (e) {
    showError(e)
  } finally {
    emitter.emit(COMMON.LOADING.HIDE)
  }
}

onMounted(() => {
  fetchMembers()
})
</script>
