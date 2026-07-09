<template>
  <div>
    <!-- 공지 목록 -->
    <PageTable
      class="q-pa-md"
      ref="tableRef"
      v-model="tableModel"
      :row-key="'id'"
      :table-style="{ minHeight: '35vh' }"
      :on-top-options="false"
    >
      <template #filter-section>
        <div class="row justify-between items-center q-pb-md">
          <div class="row q-col-gutter-sm items-center">
            <div class="col-auto" style="min-width: 260px">
              <TableSearch
                v-model:model-value="searchKeyword"
                placeholder="제목 검색"
                @select-search-item="syncRows"
                @clear-item="clearSearch"
              />
            </div>
            <div class="col-auto">
              <q-btn label="검색" color="dark" unelevated @click="syncRows" />
            </div>
          </div>
          <div class="col-auto">
            <q-btn label="+ 공지 작성" color="dark" outline @click="openCreateForm" />
          </div>
        </div>
      </template>

      <template #action="{ slotProps }">
        <q-btn flat dense no-caps color="primary" label="수정" @click="editNotice(slotProps.row)" />
        <q-btn flat dense no-caps color="red" label="삭제" @click="openDelete(slotProps.row)" />
      </template>
    </PageTable>

    <!-- 작성/수정 폼 -->
    <q-slide-transition>
      <q-card v-if="showForm" flat bordered class="q-pa-md q-mt-md">
        <div class="text-subtitle1 text-bold q-mb-md">{{ editingId ? '공지 수정' : '공지 작성' }}</div>
        <q-input
          v-model="form.title"
          dense
          outlined
          placeholder="공지 제목을 입력해주세요"
          class="q-mb-sm"
        />
        <q-editor
          v-model="form.contents"
          :toolbar="editorToolbar"
          :definitions="editorDefinitions"
          min-height="120px"
          placeholder="공지 내용을 입력해주세요"
        />
        <div class="row justify-end q-gutter-sm q-mt-md">
          <q-btn label="취소" color="grey-7" outline @click="closeForm" />
          <q-btn
            label="등록"
            color="dark"
            unelevated
            text-color="white"
            :disable="!form.title.trim()"
            @click="submitNotice"
          />
        </div>
      </q-card>
    </q-slide-transition>

    <!-- 삭제 확인 모달 -->
    <ProcessConfirmModal
      v-model:show="showDelete"
      title="공지 삭제"
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
import dayjs from 'dayjs'
import PageTable from '@/components/table/PageTable.vue'
import TableSearch from '@/components/table/TableSearch.vue'
import ProcessConfirmModal from '@/components/modal/ProcessConfirmModal.vue'
import AlarmDialog from '@/components/dialog/AlarmDialog.vue'
import COMMON from '@/constants/commonConstatns'
import { noticeApi } from '@/service/bo/notice'

const emitter = inject('emitter')
const $q = useQuasar()

const allNotices = ref([])
const searchKeyword = ref('')

const tableRef = ref(null)
const tableModel = ref({
  filter: {},
  search: {},
  selected: [],
  filterAndSearchData: {},
  header: [
    { name: 'id', label: 'ID', field: 'id', align: 'left', tooltip: false, format: (v) => `<span>#${v}</span>` },
    { name: 'title', label: '제목', field: 'title', align: 'left', tooltip: false, headerStyle: 'min-width: 16rem' },
    { name: 'writer', label: '작성자', field: 'writer', align: 'center', tooltip: false },
    {
      name: 'createAt',
      label: '등록일',
      field: 'createAt',
      align: 'center',
      tooltip: false,
      format: (v) => (v ? dayjs(v).format('YYYY.MM.DD') : '-')
    },
    { name: 'action', label: '액션', field: 'id', align: 'center', tooltip: false, slot: 'action' }
  ],
  rows: [],
  pagination: { page: 1, rowsPerPage: 15, rowsNumber: 0 }
})

/** q-editor 최소 툴바 (이미지는 mock no-op) */
const editorToolbar = [['bold', 'italic'], ['link'], ['insertImg']]
const editorDefinitions = {
  insertImg: {
    tip: '이미지',
    label: '이미지',
    icon: 'image',
    handler: () => {
      // mock: 이미지 업로드 API 연동 후 구현
    }
  }
}

const showError = (e) => {
  const message = e?.error?.message || e?.message || '처리 중 오류가 발생했습니다.'
  $q.dialog({ component: AlarmDialog, componentProps: { title: '오류', message } })
}

const loadNotices = async () => {
  const res = await noticeApi.getList({ page: 0, size: 100 })
  allNotices.value = res?.notices ?? []
  syncRows()
}

const fetchNotices = async () => {
  emitter.emit(COMMON.LOADING.SHOW)
  try {
    await loadNotices()
  } catch (e) {
    showError(e)
  } finally {
    emitter.emit(COMMON.LOADING.HIDE)
  }
}

const syncRows = () => {
  const kw = searchKeyword.value.trim().toLowerCase()
  const filtered = kw
    ? allNotices.value.filter((n) => (n.title || '').toLowerCase().includes(kw))
    : allNotices.value
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
const form = ref({ title: '', contents: '' })

const resetForm = () => {
  form.value = { title: '', contents: '' }
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

const editNotice = async (row) => {
  emitter.emit(COMMON.LOADING.SHOW)
  try {
    const detail = await noticeApi.getDetail(row.id)
    editingId.value = row.id
    form.value = {
      title: detail?.notice?.title ?? row.title ?? '',
      contents: detail?.notice?.contents ?? ''
    }
    showForm.value = true
  } catch (e) {
    showError(e)
  } finally {
    emitter.emit(COMMON.LOADING.HIDE)
  }
}

/** 삭제 확인 모달 */
const showDelete = ref(false)
const deleteTarget = ref(null)
const deleteMessage = computed(() =>
  deleteTarget.value ? `"${deleteTarget.value.title}" 공지를 삭제하시겠어요?` : ''
)
const openDelete = (row) => {
  deleteTarget.value = row
  showDelete.value = true
}
const onDeleteConfirm = async () => {
  emitter.emit(COMMON.LOADING.SHOW)
  try {
    await noticeApi.remove(deleteTarget.value.id)
    await loadNotices()
  } catch (e) {
    showError(e)
  } finally {
    emitter.emit(COMMON.LOADING.HIDE)
  }
}

const submitNotice = async () => {
  if (!form.value.title.trim()) return
  const body = {
    title: form.value.title.trim(),
    contents: form.value.contents
  }
  emitter.emit(COMMON.LOADING.SHOW)
  try {
    if (editingId.value) await noticeApi.modify(editingId.value, body)
    else await noticeApi.save(body)
    closeForm()
    await loadNotices()
  } catch (e) {
    showError(e)
  } finally {
    emitter.emit(COMMON.LOADING.HIDE)
  }
}

onMounted(() => {
  fetchNotices()
})
</script>
