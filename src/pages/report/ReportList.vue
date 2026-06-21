<template>
  <div class="q-pa-lg">
    <div class="text-h5 text-bold q-mb-md">신고 관리</div>

    <!-- 탭 (CodesManagement q-tabs 패턴) -->
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
          <span class="q-tab__label">처리 대기</span>
          <q-badge v-if="pendingCount" color="red" rounded class="q-ml-xs">{{ pendingCount }}</q-badge>
        </div>
      </q-tab>
      <q-tab name="completed" label="처리 완료" />
    </q-tabs>
    <q-separator />

    <q-tab-panels v-model="tab" animated class="bg-transparent">
      <!-- 처리 대기: 좌측 목록 + 우측 인라인 상세 -->
      <q-tab-panel name="pending" class="q-px-none q-pt-md">
        <div class="row q-col-gutter-md">
          <div class="col-12 col-md-5">
            <PageTable
              class="q-pa-md"
              ref="pendingTableRef"
              v-model="pendingTableModel"
              :row-key="'id'"
              :table-style="{ minHeight: '40vh' }"
              :on-top-options="false"
              :on-custom-pagination="false"
              @row-click="(event, row) => selectReport(row)"
            />
          </div>
          <div class="col-12 col-md-7">
            <ReportDetailPanel v-if="selectedReport" :report="selectedReport" @process="onProcess" />
            <q-card v-else flat bordered class="flex flex-center text-grey-6" style="min-height: 40vh">
              신고를 선택하면 상세가 표시됩니다.
            </q-card>
          </div>
        </div>
      </q-tab-panel>

      <!-- 처리 완료: 읽기 전용 전체 테이블 -->
      <q-tab-panel name="completed" class="q-px-none q-pt-md">
        <PageTable
          class="q-pa-md"
          ref="completedTableRef"
          v-model="completedTableModel"
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
import ReportDetailPanel from './ReportDetailPanel.vue'
import { TYPE_META, STATUS_PENDING_META, RESULT_META, badgeHtml } from './reportMeta'

const emitter = inject('emitter')

/** 처리일 표기용 목업 기준일 */
const MOCK_TODAY = '2025.06.08'

/** 목업 데이터 (API 연동 시 교체) */
const pendingReports = ref([
  { id: 102, type: 'post', reporter: '김종민', reporterId: 1021, target: '게시글 #201', receivedDate: '2025.06.07', reason: '허위 정보로 올라온 게시글입니다. 실제 방 사진이 아닌 것 같고 보증금 금액도 시세와 차이가 납니다.' },
  { id: 101, type: 'post', reporter: '이수현', reporterId: 1022, target: '게시글 #198', receivedDate: '2025.06.06', reason: '연락이 안 되고 실제 매물이 아닌 것 같습니다.' },
  { id: 99, type: 'profile', reporter: '박민준', reporterId: 1009, target: '회원 #1033', receivedDate: '2025.06.05', reason: '부적절한 프로필 사진과 욕설이 포함된 소개글입니다.' },
  { id: 95, type: 'post', reporter: '최예린', reporterId: 1008, target: '게시글 #185', receivedDate: '2025.06.04', reason: '중복으로 여러 번 올라온 동일 매물입니다.' }
])

const completedReports = ref([
  { id: 91, type: 'post', reporter: '이수현', result: '비공개 처리', processedDate: '2025.06.06', processor: 'admin' },
  { id: 88, type: 'profile', reporter: '박민준', result: '무혐의', processedDate: '2025.06.04', processor: 'admin' },
  { id: 85, type: 'post', reporter: '최예린', result: '비공개 처리', processedDate: '2025.06.03', processor: 'admin' },
  { id: 81, type: 'profile', reporter: '김종민', result: '회원 정지', processedDate: '2025.05.31', processor: 'admin' }
])

const tab = ref('pending')
const pendingCount = computed(() => pendingReports.value.length)
const selectedReport = ref(null)

/** 처리 대기 테이블 */
const pendingTableRef = ref(null)
const pendingTableModel = ref({
  filter: {},
  search: {},
  selected: [],
  filterAndSearchData: {},
  header: [
    { name: 'type', label: '신고 유형', field: 'type', align: 'left', tooltip: false, format: (v) => badgeHtml(TYPE_META[v]) },
    { name: 'reporter', label: '신고자', field: 'reporter', align: 'left', tooltip: false },
    { name: 'receivedDate', label: '접수일', field: 'receivedDate', align: 'center', tooltip: false },
    { name: 'status', label: '상태', field: 'status', align: 'center', tooltip: false, format: () => badgeHtml(STATUS_PENDING_META) }
  ],
  rows: [],
  pagination: { page: 1, rowsPerPage: 15, rowsNumber: 0 }
})

/** 처리 완료 테이블 */
const completedTableRef = ref(null)
const completedTableModel = ref({
  filter: {},
  search: {},
  selected: [],
  filterAndSearchData: {},
  header: [
    { name: 'id', label: '신고 ID', field: 'id', align: 'left', tooltip: false, format: (v) => `<span>#${String(v).padStart(3, '0')}</span>` },
    { name: 'type', label: '유형', field: 'type', align: 'center', tooltip: false, format: (v) => badgeHtml(TYPE_META[v]) },
    { name: 'reporter', label: '신고자', field: 'reporter', align: 'left', tooltip: false },
    { name: 'result', label: '처리 결과', field: 'result', align: 'center', tooltip: false, format: (v) => badgeHtml(RESULT_META[v]) },
    { name: 'processedDate', label: '처리일', field: 'processedDate', align: 'center', tooltip: false },
    { name: 'processor', label: '처리자', field: 'processor', align: 'center', tooltip: false }
  ],
  rows: [],
  pagination: { page: 1, rowsPerPage: 15, rowsNumber: 0 }
})

/** 목업 행 동기화 (mock이라 server interaction 없이 직접 바인딩) */
const syncTables = () => {
  pendingTableModel.value.rows = pendingReports.value
  pendingTableModel.value.pagination.rowsNumber = pendingReports.value.length
  completedTableModel.value.rows = completedReports.value
  completedTableModel.value.pagination.rowsNumber = completedReports.value.length
}

const selectReport = (row) => {
  selectedReport.value = row
}

/** 처리: 대기 → 완료 이동, 처리자·일시 자동 기록 */
const onProcess = ({ result }) => {
  const r = selectedReport.value
  completedReports.value.unshift({
    id: r.id,
    type: r.type,
    reporter: r.reporter,
    result,
    processedDate: MOCK_TODAY,
    processor: 'admin'
  })
  pendingReports.value = pendingReports.value.filter((p) => p.id !== r.id)
  selectedReport.value = null
  syncTables()
}

onMounted(() => {
  emitter.emit(COMMON.LOADING.HIDE)
  syncTables()
})
</script>
