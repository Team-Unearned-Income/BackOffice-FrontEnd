<template>
  <div>
    <!-- 공지 작성 버튼 -->
    <div class="row justify-end q-mb-md">
      <q-btn label="+ 공지 작성" color="dark" outline @click="openCreateForm" />
    </div>

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
        <div class="row q-col-gutter-sm items-center q-pb-md">
          <div class="col-12 col-md-4">
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
          v-model="form.content"
          :toolbar="editorToolbar"
          :definitions="editorDefinitions"
          min-height="120px"
          placeholder="공지 내용을 입력해주세요"
        />
        <div class="row items-center justify-between q-mt-md">
          <q-checkbox v-model="form.immediate" label="즉시 노출" />
          <div class="q-gutter-sm">
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
import { computed, onMounted, ref } from 'vue'
import PageTable from '@/components/table/PageTable.vue'
import TableSearch from '@/components/table/TableSearch.vue'
import ProcessConfirmModal from '@/components/modal/ProcessConfirmModal.vue'
import { VISIBILITY_META, badgeHtml } from './supportMeta'

const MOCK_TODAY = '2025.06.08'

/** 목업 공지 데이터 */
const notices = ref([
  { id: 12, title: '[공지] 노크인 서비스 점검 안내 (6/10)', content: '6월 10일 새벽 2시~4시 서비스 점검이 진행됩니다.', regDate: '2025.06.08', status: 'visible' },
  { id: 11, title: '[안내] 신원 인증 기능이 추가됐어요', content: '학교·회사 이메일 인증 기능이 추가되었습니다.', regDate: '2025.06.01', status: 'visible' },
  { id: 10, title: '[이벤트] 룸메이트 매칭 성공 후기 이벤트', content: '후기 작성 시 기프티콘을 드립니다.', regDate: '2025.05.20', status: 'hidden' }
])

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
    { name: 'regDate', label: '등록일', field: 'regDate', align: 'center', tooltip: false },
    { name: 'status', label: '상태', field: 'status', align: 'center', tooltip: false, format: (v) => badgeHtml(VISIBILITY_META[v]) },
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

const syncRows = () => {
  const kw = searchKeyword.value.trim().toLowerCase()
  const filtered = kw
    ? notices.value.filter((n) => n.title.toLowerCase().includes(kw))
    : notices.value
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
const form = ref({ title: '', content: '', immediate: true })

const resetForm = () => {
  form.value = { title: '', content: '', immediate: true }
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

const editNotice = (row) => {
  editingId.value = row.id
  form.value = { title: row.title, content: row.content, immediate: row.status === 'visible' }
  showForm.value = true
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
const onDeleteConfirm = () => {
  notices.value = notices.value.filter((n) => n.id !== deleteTarget.value.id)
  syncRows()
}

const submitNotice = () => {
  if (!form.value.title.trim()) return
  const status = form.value.immediate ? 'visible' : 'hidden'
  if (editingId.value) {
    const target = notices.value.find((n) => n.id === editingId.value)
    if (target) {
      target.title = form.value.title
      target.content = form.value.content
      target.status = status
    }
  } else {
    const newId = Math.max(0, ...notices.value.map((n) => n.id)) + 1
    notices.value.unshift({
      id: newId,
      title: form.value.title,
      content: form.value.content,
      regDate: MOCK_TODAY,
      status
    })
  }
  syncRows()
  closeForm()
}

onMounted(() => {
  syncRows()
})
</script>
