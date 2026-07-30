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
      <q-tab v-for="opt in PLATFORM_TAB_OPTIONS" :key="opt.name" :name="opt.name" :label="opt.label" />
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
      <template #filter-section>
        <div class="row justify-end q-pb-md">
          <q-btn label="+ 버전 추가" color="primary" unelevated @click="openCreate" />
        </div>
      </template>

      <template #action="{ slotProps }">
        <q-btn flat dense no-caps color="primary" label="수정" @click="openEdit(slotProps.row)" />
      </template>
    </PageTable>

    <div class="info-banner row items-start no-wrap q-mt-md">
      <q-icon name="info" size="18px" class="q-mr-sm q-mt-xs" />
      <span>강제 업데이트 설정 시, 최소 지원 버전 미만 앱 실행 시 업데이트 강제 팝업이 노출됩니다.</span>
    </div>

    <!-- 추가/수정 폼 모달 -->
    <AppVersionFormModal
      v-model:show="showForm"
      :version-item="editingVersion"
      :default-platform="defaultPlatformForCreate"
      @save="onFormSave"
    />
  </div>
</template>

<script setup>
import { inject, onMounted, ref } from 'vue'
import { useQuasar } from 'quasar'
import dayjs from 'dayjs'
import COMMON from '@/constants/commonConstatns'
import PageTable from '@/components/table/PageTable.vue'
import AlarmDialog from '@/components/dialog/AlarmDialog.vue'
import AppVersionFormModal from './AppVersionFormModal.vue'
import { appVersionApi } from '@/service/bo/appVersion'
import { PLATFORM_META, PLATFORM_TAB_OPTIONS, UPDATE_TYPE_META, badgeHtml, latestBadgeHtml } from './appVersionMeta'

const emitter = inject('emitter')
const $q = useQuasar()

const showError = (e) => {
  const message = e?.error?.message || e?.message || '처리 중 오류가 발생했습니다.'
  $q.dialog({ component: AlarmDialog, componentProps: { title: '오류', message } })
}

/** 백엔드가 검색/필터 파라미터 없이 페이지네이션만 지원해서, 탭 필터는 프론트에서 처리한다. */
const allVersions = ref([])
const platformTab = ref('all')

/** 플랫폼별 최신(가장 최근 등록) 버전 id — 백엔드가 createdAt desc로 내려주므로 플랫폼별 첫 항목이 최신이다. */
const latestIdByPlatform = ref(new Set())
const computeLatestIds = () => {
  const seen = new Set()
  const latestIds = new Set()
  for (const v of allVersions.value) {
    if (!seen.has(v.platformType)) {
      seen.add(v.platformType)
      latestIds.add(v.id)
    }
  }
  latestIdByPlatform.value = latestIds
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
      headerStyle: 'min-width: 10rem',
      format: (v, row) => `${v}${latestIdByPlatform.value.has(row.id) ? latestBadgeHtml() : ''}`
    },
    { name: 'platformType', label: '플랫폼', field: 'platformType', align: 'center', tooltip: false, format: (v) => badgeHtml(PLATFORM_META[v]) },
    { name: 'updateType', label: '업데이트 유형', field: 'updateType', align: 'center', tooltip: false, format: (v) => badgeHtml(UPDATE_TYPE_META[v]) },
    { name: 'minVersion', label: '최소 지원', field: 'minVersion', align: 'center', tooltip: false },
    { name: 'createdAt', label: '출시일', field: 'createdAt', align: 'center', tooltip: false, format: (v) => (v ? dayjs(v).format('YYYY.MM.DD') : '-') },
    { name: 'action', label: '액션', field: 'id', align: 'center', tooltip: false, slot: 'action' }
  ],
  rows: [],
  pagination: { page: 1, rowsPerPage: 15, rowsNumber: 0 }
})

const loadVersions = async () => {
  const res = await appVersionApi.getList({ page: 0, size: 100 })
  allVersions.value = res?.versionInfo ?? []
  computeLatestIds()
  syncRows()
}

const fetchVersions = async () => {
  emitter.emit(COMMON.LOADING.SHOW)
  try {
    await loadVersions()
  } catch (e) {
    showError(e)
  } finally {
    emitter.emit(COMMON.LOADING.HIDE)
  }
}

const syncRows = () => {
  const filtered =
    platformTab.value === 'all'
      ? allVersions.value
      : allVersions.value.filter((v) => v.platformType === platformTab.value)
  tableModel.value.rows = filtered
  tableModel.value.pagination.rowsNumber = filtered.length
}

/** 추가/수정 폼 모달 */
const showForm = ref(false)
const editingVersion = ref(null)
const defaultPlatformForCreate = ref('IOS')

const openCreate = () => {
  editingVersion.value = null
  defaultPlatformForCreate.value = platformTab.value === 'all' ? 'IOS' : platformTab.value
  showForm.value = true
}
const openEdit = (row) => {
  editingVersion.value = row
  showForm.value = true
}
const onFormSave = async (data) => {
  emitter.emit(COMMON.LOADING.SHOW)
  try {
    if (editingVersion.value) {
      await appVersionApi.modify({ id: editingVersion.value.id, ...data })
    } else {
      await appVersionApi.save(data)
    }
    await loadVersions()
  } catch (e) {
    showError(e)
  } finally {
    emitter.emit(COMMON.LOADING.HIDE)
  }
}

onMounted(() => {
  fetchVersions()
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
  max-width: 620px;
}
</style>
