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
              class="q-pa-md"
              ref="pendingTableRef"
              v-model="pendingTableModel"
              :row-key="'id'"
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
          class="q-pa-md"
          ref="approvedTableRef"
          v-model="approvedTableModel"
          :row-key="'id'"
          :table-style="{ minHeight: '40vh' }"
        />
      </q-tab-panel>

      <!-- 반려: 읽기 전용 -->
      <q-tab-panel name="rejected" class="q-px-none q-pt-md">
        <PageTable
          class="q-pa-md"
          ref="rejectedTableRef"
          v-model="rejectedTableModel"
          :row-key="'id'"
          :table-style="{ minHeight: '40vh' }"
        />
      </q-tab-panel>
    </q-tab-panels>
  </div>
</template>

<script setup>
import { computed, inject, onMounted, ref } from 'vue'
import COMMON from '@/constants/commonConstatns'
import PageTable from '@/components/table/PageTable.vue'
import VerificationDetailPanel from './VerificationDetailPanel.vue'
import { TYPE_META, badgeHtml } from './verificationMeta'

const emitter = inject('emitter')

/** 처리일 표기용 목업 기준일 */
const MOCK_TODAY = '2025.06.08'

/** 목업 데이터 (API 연동 시 교체) */
const pendingRequests = ref([
  { id: 1, member: '김종민', memberId: 1021, type: 'school', email: 'jm@korea.ac.kr', requestDate: '2025.06.07', elapsedText: '1일 경과 (D-2)', overdue: true },
  { id: 2, member: '이수현', memberId: 1022, type: 'company', email: 'sh@kakao.com', requestDate: '2025.06.06', elapsedText: '2일 경과 (D-1)', overdue: false },
  { id: 3, member: '최민재', memberId: 1031, type: 'school', email: 'mj@snu.ac.kr', requestDate: '2025.06.05', elapsedText: '3일 경과 (D-0)', overdue: true }
])

const approvedRequests = ref([
  { id: 11, member: '박지현', type: 'school', email: 'jh@yonsei.ac.kr', approvedDate: '2025.06.06', processor: 'admin' },
  { id: 12, member: '이동훈', type: 'company', email: 'dh@kakao.com', approvedDate: '2025.06.05', processor: 'admin' },
  { id: 13, member: '김서연', type: 'school', email: 'sy@kaist.ac.kr', approvedDate: '2025.06.04', processor: 'admin' },
  { id: 14, member: '최민준', type: 'company', email: 'mj@toss.im', approvedDate: '2025.06.03', processor: 'admin' }
])

const rejectedRequests = ref([
  { id: 21, member: '이상민', type: 'school', email: 'sm@gmail.com', reason: '개인 이메일 형식', rejectedDate: '2025.06.05' },
  { id: 22, member: '한지민', type: 'company', email: 'jm@naver.com', reason: '개인 이메일 형식', rejectedDate: '2025.06.04' },
  { id: 23, member: '오현준', type: 'school', email: 'hj@daum.net', reason: '학교 이메일 도메인 아님', rejectedDate: '2025.06.02' }
])

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
    { name: 'member', label: '회원명', field: 'member', align: 'left', tooltip: false },
    { name: 'type', label: '인증 유형', field: 'type', align: 'center', tooltip: false, format: (v) => badgeHtml(TYPE_META[v]) },
    { name: 'email', label: '제출 이메일', field: 'email', align: 'left', tooltip: false },
    { name: 'requestDate', label: '요청일', field: 'requestDate', align: 'center', tooltip: false }
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
    { name: 'member', label: '회원명', field: 'member', align: 'left', tooltip: false },
    { name: 'type', label: '인증 유형', field: 'type', align: 'center', tooltip: false, format: (v) => badgeHtml(TYPE_META[v]) },
    { name: 'email', label: '인증 이메일', field: 'email', align: 'left', tooltip: false },
    { name: 'approvedDate', label: '승인일', field: 'approvedDate', align: 'center', tooltip: false },
    { name: 'processor', label: '처리자', field: 'processor', align: 'center', tooltip: false }
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
    { name: 'member', label: '회원명', field: 'member', align: 'left', tooltip: false },
    { name: 'type', label: '인증 유형', field: 'type', align: 'center', tooltip: false, format: (v) => badgeHtml(TYPE_META[v]) },
    { name: 'email', label: '제출 이메일', field: 'email', align: 'left', tooltip: false },
    { name: 'reason', label: '반려 사유', field: 'reason', align: 'left', tooltip: false },
    { name: 'rejectedDate', label: '반려일', field: 'rejectedDate', align: 'center', tooltip: false }
  ],
  rows: [],
  pagination: { page: 1, rowsPerPage: 15, rowsNumber: 0 }
})

/** 목업 행 동기화 (mock이라 server interaction 없이 직접 바인딩) */
const syncTables = () => {
  pendingTableModel.value.rows = pendingRequests.value
  pendingTableModel.value.pagination.rowsNumber = pendingRequests.value.length
  approvedTableModel.value.rows = approvedRequests.value
  approvedTableModel.value.pagination.rowsNumber = approvedRequests.value.length
  rejectedTableModel.value.rows = rejectedRequests.value
  rejectedTableModel.value.pagination.rowsNumber = rejectedRequests.value.length
}

const selectRequest = (row) => {
  selectedRequest.value = row
}

/** 승인: 대기 → 승인 완료 이동, 처리자·일시 자동 기록 */
const onApprove = () => {
  const r = selectedRequest.value
  approvedRequests.value.unshift({
    id: r.id,
    member: r.member,
    type: r.type,
    email: r.email,
    approvedDate: MOCK_TODAY,
    processor: 'admin'
  })
  pendingRequests.value = pendingRequests.value.filter((p) => p.id !== r.id)
  selectedRequest.value = null
  syncTables()
}

/** 반려: 대기 → 반려 이동, 사유 기록 */
const onReject = (reason) => {
  const r = selectedRequest.value
  rejectedRequests.value.unshift({
    id: r.id,
    member: r.member,
    type: r.type,
    email: r.email,
    reason,
    rejectedDate: MOCK_TODAY
  })
  pendingRequests.value = pendingRequests.value.filter((p) => p.id !== r.id)
  selectedRequest.value = null
  syncTables()
}

onMounted(() => {
  emitter.emit(COMMON.LOADING.HIDE)
  syncTables()
})
</script>
