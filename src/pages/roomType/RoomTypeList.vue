<template>
  <div class="q-pa-lg">
    <div class="text-h5 text-bold q-mb-md">방 유형 관리</div>

    <!-- 목록 -->
    <PageTable
      ref="tableRef"
      v-model="tableModel"
      class="q-pa-md"
      :row-key="'id'"
      :table-style="{ minHeight: '35vh' }"
      :on-top-options="false"
    >
      <!-- 검색 -->
      <template #filter-section>
        <div class="row justify-between items-center q-pb-md">
          <div class="row q-col-gutter-sm items-center">
            <div class="col-auto" style="min-width: 260px">
              <TableSearch
                v-model:model-value="searchKeyword"
                placeholder="이름 검색"
                @select-search-item="syncRows"
                @clear-item="clearSearch"
              />
            </div>
            <div class="col-auto">
              <q-btn label="검색" color="dark" unelevated @click="syncRows" />
            </div>
          </div>
          <div class="col-auto">
            <q-btn label="+ 방 유형 추가" color="dark" outline @click="openCreateForm" />
          </div>
        </div>
      </template>

      <template #action="{ slotProps }">
        <q-btn flat dense no-caps color="primary" label="수정" @click="editRoomType(slotProps.row)" />
        <q-btn flat dense no-caps color="red" label="삭제" @click="openDelete(slotProps.row)" />
      </template>
    </PageTable>

    <!-- 추가/수정 폼 -->
    <q-slide-transition>
      <q-card v-if="showForm" flat bordered class="q-pa-md q-mt-md">
        <div class="text-subtitle1 text-bold q-mb-md">{{ editingId ? '방 유형 수정' : '방 유형 추가' }}</div>
        <q-input
          v-model="form.name"
          dense
          outlined
          placeholder="예: 원룸, 오피스텔, 아파트"
          class="q-mb-sm"
        />
        <div class="row justify-end q-gutter-sm q-mt-md">
          <q-btn label="취소" color="grey-7" outline @click="closeForm" />
          <q-btn
            label="등록"
            color="dark"
            unelevated
            text-color="white"
            :disable="!form.name.trim()"
            @click="submitRoomType"
          />
        </div>
      </q-card>
    </q-slide-transition>

    <!-- 삭제 확인 모달 -->
    <ProcessConfirmModal
      v-model:show="showDelete"
      title="방 유형 삭제"
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
import PageTable from '@/components/table/PageTable.vue'
import TableSearch from '@/components/table/TableSearch.vue'
import ProcessConfirmModal from '@/components/modal/ProcessConfirmModal.vue'
import AlarmDialog from '@/components/dialog/AlarmDialog.vue'
import COMMON from '@/constants/commonConstatns'
import { roomTypeApi } from '@/service/bo/roomType'

const emitter = inject('emitter')
const $q = useQuasar()

const showError = (e) => {
  const message = e?.error?.message || e?.message || '처리 중 오류가 발생했습니다.'
  $q.dialog({ component: AlarmDialog, componentProps: { title: '오류', message } })
}

const allRoomTypes = ref([])
const searchKeyword = ref('')

const tableRef = ref(null)
const tableModel = ref({
  filter: {},
  search: {},
  selected: [],
  filterAndSearchData: {},
  header: [
    { name: 'id', label: 'ID', field: 'id', align: 'left', tooltip: false, format: (v) => `<span>#${v}</span>` },
    { name: 'name', label: '이름', field: 'name', align: 'left', tooltip: false, headerStyle: 'min-width: 16rem' },
    { name: 'action', label: '액션', field: 'id', align: 'center', tooltip: false, slot: 'action' }
  ],
  rows: [],
  pagination: { page: 1, rowsPerPage: 15, rowsNumber: 0 }
})

const loadRoomTypes = async () => {
  const res = await roomTypeApi.getList({ page: 0, size: 100 })
  allRoomTypes.value = res?.roomType ?? []
  syncRows()
}

const fetchRoomTypes = async () => {
  emitter.emit(COMMON.LOADING.SHOW)
  try {
    await loadRoomTypes()
  } catch (e) {
    showError(e)
  } finally {
    emitter.emit(COMMON.LOADING.HIDE)
  }
}

const syncRows = () => {
  const kw = searchKeyword.value.trim().toLowerCase()
  const filtered = kw
    ? allRoomTypes.value.filter((r) => (r.name || '').toLowerCase().includes(kw))
    : allRoomTypes.value
  tableModel.value.rows = filtered
  tableModel.value.pagination.rowsNumber = filtered.length
}

const clearSearch = () => {
  searchKeyword.value = ''
  syncRows()
}

/** 작성/수정 폼 */
const showForm = ref(false)
const editingId = ref(null)
const form = ref({ name: '' })

const resetForm = () => {
  form.value = { name: '' }
  editingId.value = null
}

const openCreateForm = () => {
  resetForm()
  showForm.value = true
}

const closeForm = () => {
  showForm.value = false
  resetForm()
}

const editRoomType = (row) => {
  editingId.value = row.id
  form.value = { name: row.name }
  showForm.value = true
}

/** 삭제 확인 모달 */
const showDelete = ref(false)
const deleteTarget = ref(null)
const deleteMessage = computed(() =>
  deleteTarget.value ? `"${deleteTarget.value.name}" 방 유형을 삭제하시겠어요?` : ''
)
const openDelete = (row) => {
  deleteTarget.value = row
  showDelete.value = true
}
const onDeleteConfirm = async () => {
  emitter.emit(COMMON.LOADING.SHOW)
  try {
    await roomTypeApi.remove(deleteTarget.value.id)
    await loadRoomTypes()
  } catch (e) {
    showError(e)
  } finally {
    emitter.emit(COMMON.LOADING.HIDE)
  }
}

const submitRoomType = async () => {
  if (!form.value.name.trim()) return
  const body = { name: form.value.name.trim() }
  emitter.emit(COMMON.LOADING.SHOW)
  try {
    if (editingId.value) await roomTypeApi.modify(editingId.value, body)
    else await roomTypeApi.save(body)
    closeForm()
    await loadRoomTypes()
  } catch (e) {
    showError(e)
  } finally {
    emitter.emit(COMMON.LOADING.HIDE)
  }
}

onMounted(() => {
  fetchRoomTypes()
})
</script>
