<template>
  <div class="q-pa-lg">
    <div class="text-h5 text-bold q-mb-md">앱 버전 관리</div>

    <!-- 탭 (전체 / iOS / Android) -->
    <q-tabs
      v-model="platformTab"
      dense
      align="left"
      class="text-grey q-mb-sm"
      active-color="black"
      indicator-color="black"
      narrow-indicator
      @update:model-value="syncRows"
    >
      <q-tab name="all" label="전체" />
      <q-tab name="ios" label="iOS" />
      <q-tab name="android" label="Android" />
    </q-tabs>
    <q-separator class="q-mb-md" />

    <!-- 목록 -->
    <PageTable
      ref="tableRef"
      v-model="tableModel"
      class="q-pa-md"
      :row-key="'id'"
      :table-style="{ minHeight: '35vh' }"
      :on-top-options="false"
    >
      <!-- 필터 -->
      <template #filter-section>
        <div class="row justify-between items-center q-pb-md">
          <div class="row q-col-gutter-sm items-center">
            <div class="col-auto" style="min-width: 150px">
              <q-select
                v-model="platformFilter"
                :options="PLATFORM_FILTER_OPTIONS"
                dense
                outlined
                emit-value
                map-options
                @update:model-value="syncRows"
              />
            </div>
            <div class="col-auto" style="min-width: 150px">
              <q-select
                v-model="updateTypeFilter"
                :options="UPDATE_TYPE_FILTER_OPTIONS"
                dense
                outlined
                emit-value
                map-options
                @update:model-value="syncRows"
              />
            </div>
          </div>
          <div class="col-auto">
            <q-btn label="+ 버전 추가" color="primary" unelevated @click="openCreate" />
          </div>
        </div>
      </template>

      <template #action="{ slotProps }">
        <q-btn flat dense no-caps color="primary" label="수정" @click="openEdit(slotProps.row)" />
      </template>

      <template #bottom>
        <div class="info-banner row items-start no-wrap q-mx-md q-mb-md">
          <q-icon name="info" size="18px" class="q-mr-sm q-mt-xs" />
          <span>강제 업데이트 설정 시, 최소 지원 버전 미만 앱 실행 시 업데이트 강제 팝업이 노출됩니다.</span>
        </div>
      </template>
    </PageTable>

    <!-- 추가/수정 폼 모달 -->
    <AppVersionFormModal v-model:show="showForm" :version-item="editingVersion" @save="onFormSave" />
  </div>
</template>

<script setup>
import { inject, onMounted, ref } from 'vue'
import COMMON from '@/constants/commonConstatns'
import PageTable from '@/components/table/PageTable.vue'
import AppVersionFormModal from './AppVersionFormModal.vue'
import {
  PLATFORM_META,
  UPDATE_TYPE_META,
  LATEST_META,
  PLATFORM_FILTER_OPTIONS,
  UPDATE_TYPE_FILTER_OPTIONS,
  badgeHtml
} from './appVersionMeta'

const emitter = inject('emitter')

/** 플랫폼별 버전 목록 — 백엔드에 대응 API가 없어 화면 내에서만 관리(목업). 더미 초기 데이터는 제거함 */
const versions = ref([])

const platformTab = ref('all')
const platformFilter = ref('all')
const updateTypeFilter = ref('all')

/** 플랫폼별 최신 출시일 버전에 '최신' 뱃지 부여 */
const latestIdsByPlatform = () => {
  const latest = {}
  versions.value.forEach((v) => {
    const cur = latest[v.platform]
    if (!cur || v.releaseDate > cur.releaseDate) latest[v.platform] = v
  })
  return new Set(Object.values(latest).map((v) => v.id))
}

const tableRef = ref(null)
const tableModel = ref({
  filter: {},
  search: {},
  selected: [],
  filterAndSearchData: {},
  header: [
    {
      name: 'version',
      label: '버전',
      field: 'version',
      align: 'left',
      tooltip: false,
      format: (v, row) => (row.isLatest ? `${v} ${badgeHtml(LATEST_META)}` : v)
    },
    { name: 'platform', label: '플랫폼', field: 'platform', align: 'center', tooltip: false, format: (v) => badgeHtml(PLATFORM_META[v]) },
    { name: 'updateType', label: '업데이트 유형', field: 'updateType', align: 'center', tooltip: false, format: (v) => badgeHtml(UPDATE_TYPE_META[v]) },
    { name: 'minSupportVersion', label: '최소 지원', field: 'minSupportVersion', align: 'center', tooltip: false },
    { name: 'releaseDate', label: '출시일', field: 'releaseDate', align: 'center', tooltip: false, format: (v) => v.replace(/-/g, '.') },
    { name: 'action', label: '액션', field: 'id', align: 'center', tooltip: false, slot: 'action' }
  ],
  rows: [],
  pagination: { page: 1, rowsPerPage: 15, rowsNumber: 0 }
})

const syncRows = () => {
  const latestIds = latestIdsByPlatform()
  const filtered = versions.value
    .filter((v) => {
      const platformOk =
        (platformTab.value === 'all' || v.platform === platformTab.value) &&
        (platformFilter.value === 'all' || v.platform === platformFilter.value)
      const typeOk = updateTypeFilter.value === 'all' || v.updateType === updateTypeFilter.value
      return platformOk && typeOk
    })
    .map((v) => ({ ...v, isLatest: latestIds.has(v.id) }))
    .sort((a, b) => (a.releaseDate < b.releaseDate ? 1 : -1))
  tableModel.value.rows = filtered
  tableModel.value.pagination.rowsNumber = filtered.length
}

/** 추가/수정 폼 모달 (버전은 삭제 불가 — 이력 보존, 수정만 가능) */
const showForm = ref(false)
const editingVersion = ref(null)

const openCreate = () => {
  editingVersion.value = null
  showForm.value = true
}
const openEdit = (row) => {
  editingVersion.value = row
  showForm.value = true
}
const onFormSave = (data) => {
  if (editingVersion.value) {
    const target = versions.value.find((v) => v.id === editingVersion.value.id)
    if (target) Object.assign(target, data)
  } else {
    const newId = Math.max(0, ...versions.value.map((v) => v.id)) + 1
    versions.value.push({ id: newId, ...data })
  }
  syncRows()
}

onMounted(() => {
  emitter.emit(COMMON.LOADING.HIDE)
  syncRows()
})
</script>

<style scoped>
.info-banner {
  background: #ede7f6;
  border: 1px solid #d1c4e9;
  border-radius: 6px;
  color: #4527a0;
  font-size: 0.82rem;
  line-height: 1.4;
  padding: 0.6rem 0.85rem;
}
</style>
