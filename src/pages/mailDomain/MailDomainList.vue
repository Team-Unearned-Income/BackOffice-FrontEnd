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
      <q-tab name="school" label="학교" />
      <q-tab name="company" label="회사" />
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
            <div class="col-auto" style="min-width: 140px">
              <q-select
                v-model="statusFilter"
                :options="STATUS_FILTER_OPTIONS"
                dense
                outlined
                emit-value
                map-options
                @update:model-value="syncRows"
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
        <q-btn flat dense no-caps color="red" label="삭제" @click="openDelete(slotProps.row)" />
      </template>
    </PageTable>

    <!-- 추가/수정 폼 모달 -->
    <MailDomainFormModal v-model:show="showForm" :domain-item="editingDomain" @save="onFormSave" />

    <!-- 삭제 확인 모달 -->
    <ProcessConfirmModal
      v-model:show="showDelete"
      title="도메인을 삭제할까요?"
      :message="deleteMessage"
      confirm-label="삭제"
      confirm-color="red"
      @confirm="onDeleteConfirm"
    />
  </div>
</template>

<script setup>
import { computed, inject, onMounted, ref } from 'vue'
import { useQuasar } from 'quasar'
import COMMON from '@/constants/commonConstatns'
import PageTable from '@/components/table/PageTable.vue'
import TableSearch from '@/components/table/TableSearch.vue'
import ProcessConfirmModal from '@/components/modal/ProcessConfirmModal.vue'
import AlarmDialog from '@/components/dialog/AlarmDialog.vue'
import MailDomainFormModal from './MailDomainFormModal.vue'
import { TYPE_META, STATUS_META, STATUS_FILTER_OPTIONS, badgeHtml } from './mailDomainMeta'

const emitter = inject('emitter')
const $q = useQuasar()

/** 목업 메일 도메인 데이터 (API 연동 시 교체) */
const domains = ref([
  { id: 1, type: 'school', name: '수원대학교', domain: 'suwon.ac.kr', memberCount: 124, status: 'active', regDate: '2025.01.10', memo: '' },
  { id: 2, type: 'school', name: '한양대학교', domain: 'hanyang.ac.kr', memberCount: 89, status: 'active', regDate: '2025.01.15', memo: '' },
  { id: 3, type: 'company', name: '삼성전자', domain: 'samsung.com', memberCount: 32, status: 'active', regDate: '2025.03.02', memo: '' },
  { id: 4, type: 'company', name: '카카오', domain: 'kakao.com', memberCount: 17, status: 'inactive', regDate: '2025.04.20', memo: '' }
])

const typeTab = ref('all')
const statusFilter = ref('all')
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
    { name: 'memberCount', label: '등록 회원 수', field: 'memberCount', align: 'center', tooltip: false, format: (v) => `${v}명` },
    { name: 'status', label: '상태', field: 'status', align: 'center', tooltip: false, format: (v) => badgeHtml(STATUS_META[v]) },
    { name: 'regDate', label: '등록일', field: 'regDate', align: 'center', tooltip: false },
    { name: 'action', label: '액션', field: 'id', align: 'center', tooltip: false, slot: 'action' }
  ],
  rows: [],
  pagination: { page: 1, rowsPerPage: 15, rowsNumber: 0 }
})

const syncRows = () => {
  const kw = searchKeyword.value.trim().toLowerCase()
  const filtered = domains.value.filter((d) => {
    const typeOk = typeTab.value === 'all' || d.type === typeTab.value
    const statusOk = statusFilter.value === 'all' || d.status === statusFilter.value
    const keywordOk =
      !kw || d.name.toLowerCase().includes(kw) || d.domain.toLowerCase().includes(kw)
    return typeOk && statusOk && keywordOk
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
const onFormSave = (data) => {
  const duplicate = domains.value.find(
    (d) => d.domain === data.domain && d.id !== editingDomain.value?.id
  )
  if (duplicate) {
    $q.dialog({
      component: AlarmDialog,
      componentProps: { title: '오류', message: `이미 등록된 도메인입니다. (${data.domain})` }
    })
    return
  }
  if (editingDomain.value) {
    const target = domains.value.find((d) => d.id === editingDomain.value.id)
    if (target) Object.assign(target, data)
  } else {
    const newId = Math.max(0, ...domains.value.map((d) => d.id)) + 1
    domains.value.unshift({
      id: newId,
      ...data,
      memberCount: 0,
      regDate: new Date().toISOString().slice(0, 10).replace(/-/g, '.')
    })
  }
  syncRows()
}

/** 삭제 확인 모달 */
const showDelete = ref(false)
const deleteTarget = ref(null)
const deleteMessage = computed(() =>
  deleteTarget.value ? `"${deleteTarget.value.name}" (${deleteTarget.value.domain}) 도메인을 삭제하시겠어요?` : ''
)
const openDelete = (row) => {
  deleteTarget.value = row
  showDelete.value = true
}
const onDeleteConfirm = () => {
  domains.value = domains.value.filter((d) => d.id !== deleteTarget.value.id)
  syncRows()
}

onMounted(() => {
  emitter.emit(COMMON.LOADING.HIDE)
  syncRows()
})
</script>
