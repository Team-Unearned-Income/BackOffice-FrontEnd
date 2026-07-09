<template>
  <div class="q-pa-lg">
    <div class="text-h5 text-bold q-mb-md">신원 인증 관리</div>

    <!-- 탭 (검토 대기 / 승인 완료 / 반려) -->
    <q-tabs
      v-model="tab"
      dense
      align="left"
      class="text-grey"
      active-color="black"
      indicator-color="black"
      narrow-indicator
    >
      <q-tab name="pending">
        <div class="row items-center no-wrap">
          <span class="q-tab__label">검토 대기</span>
          <q-badge v-if="pendingCount" rounded color="amber-3" text-color="amber-9" class="q-ml-xs">
            {{ pendingCount }}
          </q-badge>
        </div>
      </q-tab>
      <q-tab name="approved" label="승인 완료" />
      <q-tab name="rejected" label="반려" />
    </q-tabs>
    <q-separator />

    <q-tab-panels v-model="tab" animated class="bg-transparent">
      <!-- 검토 대기: 좌측 목록 + 우측 인라인 상세 -->
      <q-tab-panel name="pending" class="q-px-none q-pt-md">
        <div class="row q-col-gutter-md">
          <div class="col-12 col-md-6">
            <PageTable
              ref="pendingTableRef"
              v-model="pendingTableModel"
              class="q-pa-md"
              :row-key="'email'"
              :table-style="{ minHeight: '40vh' }"
              :on-top-options="false"
              :on-custom-pagination="false"
              @row-click="(event, row) => selectRequest(row)"
            />
          </div>
          <div class="col-12 col-md-6">
            <VerificationDetailPanel
              v-if="selectedRequest"
              :request="selectedRequest"
              @approve="onApprove"
              @reject="onReject"
            />
            <q-card v-else flat bordered class="flex flex-center text-grey-6" style="min-height: 40vh">
              인증 요청을 선택하면 상세가 표시됩니다.
            </q-card>
          </div>
        </div>
      </q-tab-panel>

      <!-- 승인 완료: 읽기 전용 -->
      <q-tab-panel name="approved" class="q-px-none q-pt-md">
        <PageTable
          ref="approvedTableRef"
          v-model="approvedTableModel"
          class="q-pa-md"
          :row-key="'email'"
          :table-style="{ minHeight: '40vh' }"
        />
      </q-tab-panel>

      <!-- 반려: 읽기 전용 -->
      <q-tab-panel name="rejected" class="q-px-none q-pt-md">
        <PageTable
          ref="rejectedTableRef"
          v-model="rejectedTableModel"
          class="q-pa-md"
          :row-key="'email'"
          :table-style="{ minHeight: '40vh' }"
        />
      </q-tab-panel>
    </q-tab-panels>
  </div>
</template>

<script setup>
import { computed, inject, onMounted, ref } from 'vue'
import { useQuasar } from 'quasar'
import dayjs from 'dayjs'
import COMMON from '@/constants/commonConstatns'
import PageTable from '@/components/table/PageTable.vue'
import AlarmDialog from '@/components/dialog/AlarmDialog.vue'
import VerificationDetailPanel from './VerificationDetailPanel.vue'
import { verificationApi } from '@/service/bo/verification'
import { TYPE_META, badgeHtml } from './verificationMeta'

const emitter = inject('emitter')
const $q = useQuasar()

/** 처리 기한: 요청일로부터 3일 (공통 스펙 §6) */
const DEADLINE_DAYS = 3

const showError = (e) => {
  const message = e?.error?.message || e?.message || '처리 중 오류가 발생했습니다.'
  $q.dialog({ component: AlarmDialog, componentProps: { title: '오류', message } })
}

const pendingRequests = ref([])
const approvedRequests = ref([])
const rejectedRequests = ref([])

const tab = ref('pending')
const pendingCount = computed(() => pendingRequests.value.length)
const selectedRequest = ref(null)

/** 검토 대기 테이블 */
const pendingTableRef = ref(null)
const pendingTableModel = ref({
  filter: {},
  search: {},
  selected: [],
  filterAndSearchData: {},
  header: [
    { name: 'name', label: '회원명', field: 'name', align: 'left', tooltip: false },
    { name: 'type', label: '인증 유형', field: 'type', align: 'center', tooltip: false, format: (v) => badgeHtml(TYPE_META[v]) },
    { name: 'email', label: '제출 이메일', field: 'email', align: 'left', tooltip: false },
    {
      name: 'createAt',
      label: '요청일',
      field: 'createAt',
      align: 'center',
      tooltip: false,
      format: (v) => (v ? dayjs(v).format('YYYY.MM.DD') : '-')
    }
  ],
  rows: [],
  pagination: { page: 1, rowsPerPage: 15, rowsNumber: 0 }
})

/** 승인 완료 테이블 */
const approvedTableRef = ref(null)
const approvedTableModel = ref({
  filter: {},
  search: {},
  selected: [],
  filterAndSearchData: {},
  header: [
    { name: 'name', label: '회원명', field: 'name', align: 'left', tooltip: false },
    { name: 'type', label: '인증 유형', field: 'type', align: 'center', tooltip: false, format: (v) => badgeHtml(TYPE_META[v]) },
    { name: 'email', label: '인증 이메일', field: 'email', align: 'left', tooltip: false },
    {
      name: 'createAt',
      label: '승인일',
      field: 'createAt',
      align: 'center',
      tooltip: false,
      format: (v) => (v ? dayjs(v).format('YYYY.MM.DD') : '-')
    },
    { name: 'accepter', label: '처리자', field: 'accepter', align: 'center', tooltip: false }
  ],
  rows: [],
  pagination: { page: 1, rowsPerPage: 15, rowsNumber: 0 }
})

/** 반려 테이블 */
const rejectedTableRef = ref(null)
const rejectedTableModel = ref({
  filter: {},
  search: {},
  selected: [],
  filterAndSearchData: {},
  header: [
    { name: 'name', label: '회원명', field: 'name', align: 'left', tooltip: false },
    { name: 'type', label: '인증 유형', field: 'type', align: 'center', tooltip: false, format: (v) => badgeHtml(TYPE_META[v]) },
    { name: 'email', label: '제출 이메일', field: 'email', align: 'left', tooltip: false },
    { name: 'description', label: '반려 사유', field: 'description', align: 'left', tooltip: false },
    {
      name: 'createAt',
      label: '반려일',
      field: 'createAt',
      align: 'center',
      tooltip: false,
      format: (v) => (v ? dayjs(v).format('YYYY.MM.DD') : '-')
    }
  ],
  rows: [],
  pagination: { page: 1, rowsPerPage: 15, rowsNumber: 0 }
})

/** 요청일 기준 경과일 / D-day 계산 (상세 API가 아닌 목록의 createAt으로 클라이언트 계산) */
const withElapsed = (row) => {
  const elapsedDays = row.createAt ? dayjs().startOf('day').diff(dayjs(row.createAt).startOf('day'), 'day') : 0
  const remaining = DEADLINE_DAYS - elapsedDays
  return {
    ...row,
    elapsedText: remaining > 0 ? `${elapsedDays}일 경과 (D-${remaining})` : `${elapsedDays}일 경과 (기한 초과)`,
    overdue: remaining <= 0
  }
}

const syncTables = () => {
  pendingTableModel.value.rows = pendingRequests.value
  pendingTableModel.value.pagination.rowsNumber = pendingRequests.value.length
  approvedTableModel.value.rows = approvedRequests.value
  approvedTableModel.value.pagination.rowsNumber = approvedRequests.value.length
  rejectedTableModel.value.rows = rejectedRequests.value
  rejectedTableModel.value.pagination.rowsNumber = rejectedRequests.value.length
}

const fetchAll = async () => {
  emitter.emit(COMMON.LOADING.SHOW)
  try {
    const [pending, approved, rejected] = await Promise.all([
      verificationApi.getWaitList({ page: 0, size: 100 }),
      verificationApi.getApproveList({ page: 0, size: 100 }),
      verificationApi.getCancelList({ page: 0, size: 100 })
    ])
    pendingRequests.value = (pending?.employeeAuth ?? []).map(withElapsed)
    approvedRequests.value = approved?.employeeAuth ?? []
    rejectedRequests.value = rejected?.employeeAuth ?? []
    syncTables()
  } catch (e) {
    showError(e)
  } finally {
    emitter.emit(COMMON.LOADING.HIDE)
  }
}

const selectRequest = (row) => {
  selectedRequest.value = row
}

/** 승인 처리 — 백엔드 응답에 id가 없어(검토 대기 목록 DTO 이슈) row.id가 undefined일 수 있음 */
const onApprove = async () => {
  const r = selectedRequest.value
  emitter.emit(COMMON.LOADING.SHOW)
  try {
    await verificationApi.approve(r.id)
    selectedRequest.value = null
    await fetchAll()
  } catch (e) {
    showError(e)
  } finally {
    emitter.emit(COMMON.LOADING.HIDE)
  }
}

/**
 * 반려 처리 — 위와 동일하게 id 이슈 영향 받음
 * 반려 사유는 모달에서 입력받지만 `PATCH .../wait/{id}/cancel`이 별도 body를 받지 않아 백엔드로 전달되지 않음
 */
const onReject = async () => {
  const r = selectedRequest.value
  emitter.emit(COMMON.LOADING.SHOW)
  try {
    await verificationApi.reject(r.id)
    selectedRequest.value = null
    await fetchAll()
  } catch (e) {
    showError(e)
  } finally {
    emitter.emit(COMMON.LOADING.HIDE)
  }
}

onMounted(() => {
  fetchAll()
})
</script>
