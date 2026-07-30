<template>
  <div class="q-pa-lg">
    <div class="text-h5 text-bold q-mb-md">메일 도메인 관리</div>

    <!-- 탭 (전체 / 학교 / 회사) -->
    <q-tabs
      v-model="typeTab"
      dense
      align="left"
      class="text-grey q-mb-sm"
      active-color="black"
      indicator-color="black"
      narrow-indicator
      @update:model-value="syncRows"
    >
      <q-tab name="all" label="전체" />
      <q-tab name="STUDENT" label="학교" />
      <q-tab name="COMPANY" label="회사" />
    </q-tabs>
    <q-separator class="q-mb-md" />

    <!-- 목록 -->
    <PageTable
      ref="tableRef"
      v-model="tableModel"
      class="q-pa-md"
      :row-key="'id'"
      :table-style="{ minHeight: '40vh' }"
      :on-top-options="false"
    >
      <!-- 검색 / 필터 -->
      <template #filter-section>
        <div class="row justify-between items-center q-pb-md">
          <div class="row q-col-gutter-sm items-center">
            <div class="col-auto" style="min-width: 260px">
              <TableSearch
                v-model:model-value="searchKeyword"
                placeholder="기관명 또는 도메인 검색"
                @select-search-item="syncRows"
                @clear-item="clearSearch"
              />
            </div>
            <div class="col-auto">
              <q-btn label="검색" color="dark" unelevated @click="syncRows" />
            </div>
          </div>
          <div class="col-auto">
            <q-btn label="+ 도메인 추가" color="primary" unelevated @click="openCreate" />
          </div>
        </div>
      </template>

      <template #action="{ slotProps }">
        <q-btn flat dense no-caps color="primary" label="수정" @click="openEdit(slotProps.row)" />
      </template>
    </PageTable>

    <!-- 추가/수정 폼 모달 -->
    <MailDomainFormModal v-model:show="showForm" :domain-item="editingDomain" @save="onFormSave" />
  </div>
</template>

<script setup>
import { inject, onMounted, ref } from 'vue'
import { useQuasar } from 'quasar'
import COMMON from '@/constants/commonConstatns'
import PageTable from '@/components/table/PageTable.vue'
import TableSearch from '@/components/table/TableSearch.vue'
import AlarmDialog from '@/components/dialog/AlarmDialog.vue'
import MailDomainFormModal from './MailDomainFormModal.vue'
import { mailDomainApi } from '@/service/bo/mailDomain'
import { TYPE_META, badgeHtml } from './mailDomainMeta'

const emitter = inject('emitter')
const $q = useQuasar()

const showError = (e) => {
  const message = e?.error?.message || e?.message || '처리 중 오류가 발생했습니다.'
  $q.dialog({ component: AlarmDialog, componentProps: { title: '오류', message } })
}

/** 백엔드는 목록/검색 API가 아니라 전체 조회만 지원해서, 검색/유형 필터는 프론트에서 처리한다. */
const allDomains = ref([])
const typeTab = ref('all')
const searchKeyword = ref('')

const tableRef = ref(null)
const tableModel = ref({
  filter: {},
  search: {},
  selected: [],
  filterAndSearchData: {},
  header: [
    { name: 'name', label: '기관명', field: 'name', align: 'left', tooltip: false },
    { name: 'domain', label: '도메인', field: 'domain', align: 'left', tooltip: false, format: (v) => `<span style="color:#1976d2">${v}</span>` },
    { name: 'type', label: '유형', field: 'type', align: 'center', tooltip: false, format: (v) => badgeHtml(TYPE_META[v]) },
    { name: 'action', label: '액션', field: 'id', align: 'center', tooltip: false, slot: 'action' }
  ],
  rows: [],
  pagination: { page: 1, rowsPerPage: 15, rowsNumber: 0 }
})

const loadDomains = async () => {
  const res = await mailDomainApi.getList()
  allDomains.value = res?.authEmailInfoList ?? []
  syncRows()
}

const fetchDomains = async () => {
  emitter.emit(COMMON.LOADING.SHOW)
  try {
    await loadDomains()
  } catch (e) {
    showError(e)
  } finally {
    emitter.emit(COMMON.LOADING.HIDE)
  }
}

const syncRows = () => {
  const kw = searchKeyword.value.trim().toLowerCase()
  const filtered = allDomains.value.filter((d) => {
    const typeOk = typeTab.value === 'all' || d.type === typeTab.value
    const keywordOk =
      !kw || (d.name || '').toLowerCase().includes(kw) || (d.domain || '').toLowerCase().includes(kw)
    return typeOk && keywordOk
  })
  tableModel.value.rows = filtered
  tableModel.value.pagination.rowsNumber = filtered.length
}

const clearSearch = () => {
  searchKeyword.value = ''
  syncRows()
}

/** 추가/수정 폼 모달 */
const showForm = ref(false)
const editingDomain = ref(null)

const openCreate = () => {
  editingDomain.value = null
  showForm.value = true
}
const openEdit = (row) => {
  editingDomain.value = row
  showForm.value = true
}
const onFormSave = async (data) => {
  const duplicate = allDomains.value.find(
    (d) => d.domain === data.domain && d.id !== editingDomain.value?.id
  )
  if (duplicate) {
    $q.dialog({
      component: AlarmDialog,
      componentProps: { title: '오류', message: `이미 등록된 도메인입니다. (${data.domain})` }
    })
    return
  }

  emitter.emit(COMMON.LOADING.SHOW)
  try {
    if (editingDomain.value) {
      await mailDomainApi.modify({ id: editingDomain.value.id, ...data })
    } else {
      await mailDomainApi.save(data)
    }
    await loadDomains()
  } catch (e) {
    showError(e)
  } finally {
    emitter.emit(COMMON.LOADING.HIDE)
  }
}

onMounted(() => {
  fetchDomains()
})
</script>
