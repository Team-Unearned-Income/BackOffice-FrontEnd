<template>
  <div class="q-pa-lg">
    <div class="text-h5 text-bold q-mb-md">앱 버전 관리</div>

    <!-- 실서버 연동 영역 — 백엔드는 플랫폼 구분 없이 "현재 앱 버전 문자열 1개"만 관리함.
         아래 탭/테이블은 여전히 목업이라 혼동 방지를 위해 별도 카드로 분리. -->
    <q-card flat bordered class="q-pa-md q-mb-lg">
      <div class="row items-center justify-between">
        <div>
          <div class="text-caption text-grey-7">실제 서버에 등록된 앱 버전 (연동됨)</div>
          <div v-if="!editingServerVersion" class="text-h6 text-bold">
            {{ serverVersion?.version ?? '-' }}
            <span v-if="serverVersion?.id" class="text-caption text-grey-6">(#{{ serverVersion.id }})</span>
          </div>
          <q-input
            v-else
            v-model="serverVersionInput"
            dense
            outlined
            placeholder="예: 2.1.0"
            style="width: 200px"
            class="q-mt-xs"
          />
        </div>
        <div>
          <template v-if="editingServerVersion">
            <q-btn label="취소" color="grey-7" outline dense class="q-mr-sm" @click="editingServerVersion = false" />
            <q-btn
              label="저장"
              color="dark"
              unelevated
              text-color="white"
              dense
              :disable="!serverVersionInput.trim()"
              @click="onSaveServerVersion"
            />
          </template>
          <q-btn v-else label="수정" color="primary" outline dense @click="openEditServerVersion" />
        </div>
      </div>
      <div class="text-caption text-grey-6 q-mt-sm">
        백엔드에 플랫폼 구분·강제/선택 업데이트·최소 지원 버전 등의 필드가 없어 버전 문자열만 연동됩니다.
        아래 목록/탭은 여전히 목업 데이터입니다.
      </div>
    </q-card>

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
import { useQuasar } from 'quasar'
import COMMON from '@/constants/commonConstatns'
import PageTable from '@/components/table/PageTable.vue'
import AlarmDialog from '@/components/dialog/AlarmDialog.vue'
import AppVersionFormModal from './AppVersionFormModal.vue'
import { appVersionApi } from '@/service/bo/appVersion'
import {
  PLATFORM_META,
  UPDATE_TYPE_META,
  LATEST_META,
  PLATFORM_FILTER_OPTIONS,
  UPDATE_TYPE_FILTER_OPTIONS,
  badgeHtml
} from './appVersionMeta'

const emitter = inject('emitter')
const $q = useQuasar()

const showError = (e) => {
  const message = e?.error?.message || e?.message || '처리 중 오류가 발생했습니다.'
  $q.dialog({ component: AlarmDialog, componentProps: { title: '오류', message } })
}

/** 실서버 앱 버전 (연동됨) */
const serverVersion = ref(null)
const editingServerVersion = ref(false)
const serverVersionInput = ref('')

const loadServerVersion = async () => {
  try {
    serverVersion.value = await appVersionApi.getCurrent()
  } catch (e) {
    showError(e)
  }
}

const openEditServerVersion = () => {
  serverVersionInput.value = serverVersion.value?.version ?? ''
  editingServerVersion.value = true
}

const onSaveServerVersion = async () => {
  const version = serverVersionInput.value.trim()
  if (!version) return
  emitter.emit(COMMON.LOADING.SHOW)
  try {
    if (serverVersion.value?.id) await appVersionApi.modify({ id: serverVersion.value.id, version })
    else await appVersionApi.save({ version })
    editingServerVersion.value = false
    await loadServerVersion()
  } catch (e) {
    showError(e)
  } finally {
    emitter.emit(COMMON.LOADING.HIDE)
  }
}

/** 목업 앱 버전 데이터 (API 연동 시 교체) */
const versions = ref([
  { id: 1, platform: 'ios', version: '2.1.0', minSupportVersion: '1.8.0', updateType: 'optional', releaseDate: '2025-06-01', message: '' },
  { id: 2, platform: 'ios', version: '2.0.5', minSupportVersion: '1.8.0', updateType: 'force', releaseDate: '2025-05-10', message: '' },
  { id: 3, platform: 'android', version: '2.1.0', minSupportVersion: '1.9.0', updateType: 'force', releaseDate: '2025-06-01', message: '' },
  { id: 4, platform: 'android', version: '2.0.3', minSupportVersion: '1.7.0', updateType: 'optional', releaseDate: '2025-04-15', message: '' }
])

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
  loadServerVersion()
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
