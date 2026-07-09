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
              ref="pendingTableRef"
              v-model="pendingTableModel"
              class="q-pa-md"
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
          ref="completedTableRef"
          v-model="completedTableModel"
          class="q-pa-md"
          :row-key="'id'"
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
import ReportDetailPanel from './ReportDetailPanel.vue'
import { reportApi } from '@/service/bo/report'
import { TYPE_META, STATUS_PENDING_META, RESULT_META, RESULT_UNKNOWN_META, badgeHtml } from './reportMeta'

const emitter = inject('emitter')
const $q = useQuasar()

const showError = (e) => {
  const message = e?.error?.message || e?.message || '처리 중 오류가 발생했습니다.'
  $q.dialog({ component: AlarmDialog, componentProps: { title: '오류', message } })
}

const pendingReports = ref([])
const completedReports = ref([])

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
    {
      name: 'createdAt',
      label: '접수일',
      field: 'createdAt',
      align: 'center',
      tooltip: false,
      format: (v) => (v ? dayjs(v).format('YYYY.MM.DD') : '-')
    },
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
    {
      name: 'declarationType',
      label: '처리 결과',
      field: 'declarationType',
      align: 'center',
      tooltip: false,
      format: (v) => badgeHtml(RESULT_META[v] ?? RESULT_UNKNOWN_META)
    },
    {
      name: 'createdAt',
      label: '처리일',
      field: 'createdAt',
      align: 'center',
      tooltip: false,
      format: (v) => (v ? dayjs(v).format('YYYY.MM.DD') : '-')
    }
  ],
  rows: [],
  pagination: { page: 1, rowsPerPage: 15, rowsNumber: 0 }
})

const syncTables = () => {
  pendingTableModel.value.rows = pendingReports.value
  pendingTableModel.value.pagination.rowsNumber = pendingReports.value.length
  completedTableModel.value.rows = completedReports.value
  completedTableModel.value.pagination.rowsNumber = completedReports.value.length
}

const fetchAll = async () => {
  emitter.emit(COMMON.LOADING.SHOW)
  try {
    const [pending, completed] = await Promise.all([
      reportApi.getWaitList({ page: 0, size: 100 }),
      reportApi.getDoneList({ page: 0, size: 100 })
    ])
    pendingReports.value = pending?.reportInfoList ?? []
    completedReports.value = completed?.reportInfoList ?? []
    syncTables()
  } catch (e) {
    showError(e)
  } finally {
    emitter.emit(COMMON.LOADING.HIDE)
  }
}

const selectReport = (row) => {
  selectedReport.value = row
}

/** 처리: action에 맞는 reportApi 메서드 호출 후 목록 갱신 */
const onProcess = async ({ action, reason }) => {
  const r = selectedReport.value
  emitter.emit(COMMON.LOADING.SHOW)
  try {
    if (action === 'hidden') await reportApi.hidden({ id: r.id, type: r.type, reason })
    else if (action === 'suspended') await reportApi.suspended({ id: r.id, type: r.type, reason })
    else await reportApi.noAction({ id: r.id, type: r.type })
    selectedReport.value = null
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
