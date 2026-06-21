<template>
  <div>
    <!-- FAQ 추가 버튼 -->
    <div class="row justify-end q-mb-md">
      <q-btn label="+ FAQ 추가" color="dark" outline @click="openCreateForm" />
    </div>

    <!-- FAQ 목록 -->
    <PageTable
      class="q-pa-md"
      ref="tableRef"
      v-model="tableModel"
      :row-key="'id'"
      :table-style="{ minHeight: '35vh' }"
      :on-top-options="false"
    >
      <!-- 검색 / 카테고리 필터 -->
      <template #filter-section>
        <div class="row q-col-gutter-sm items-center q-pb-md">
          <div class="col-12 col-md-4">
            <TableSearch
              v-model:model-value="searchKeyword"
              placeholder="질문 검색"
              @select-search-item="syncRows"
              @clear-item="clearSearch"
            />
          </div>
          <div class="col-6 col-md-3">
            <q-select
              v-model="categoryFilter"
              :options="FAQ_CATEGORY_FILTER_OPTIONS"
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
      </template>

      <template #action="{ slotProps }">
        <q-btn flat dense no-caps color="primary" label="수정" @click="editFaq(slotProps.row)" />
        <q-btn flat dense no-caps color="red" label="삭제" @click="deleteFaq(slotProps.row)" />
      </template>
    </PageTable>

    <!-- 작성/수정 폼 -->
    <q-slide-transition>
      <q-card v-if="showForm" flat bordered class="q-pa-md q-mt-md">
        <div class="text-subtitle1 text-bold q-mb-md">{{ editingId ? 'FAQ 수정' : 'FAQ 추가' }}</div>
        <q-select
          v-model="form.category"
          :options="FAQ_CATEGORY_SELECT_OPTIONS"
          dense
          outlined
          emit-value
          map-options
          label="카테고리 선택"
          class="q-mb-sm"
        />
        <q-input
          v-model="form.question"
          dense
          outlined
          placeholder="질문을 입력해주세요"
          class="q-mb-sm"
        />
        <q-input
          v-model="form.answer"
          type="textarea"
          outlined
          rows="4"
          placeholder="답변을 입력해주세요"
        />
        <div class="row justify-end q-gutter-sm q-mt-md">
          <q-btn label="취소" color="grey-7" outline @click="closeForm" />
          <q-btn label="등록" color="dark" unelevated text-color="white" @click="submitFaq" />
        </div>
      </q-card>
    </q-slide-transition>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useQuasar } from 'quasar'
import AlarmDialog from '@/components/dialog/AlarmDialog.vue'
import PageTable from '@/components/table/PageTable.vue'
import TableSearch from '@/components/table/TableSearch.vue'
import {
  FAQ_CATEGORY_META,
  FAQ_CATEGORY_FILTER_OPTIONS,
  FAQ_CATEGORY_SELECT_OPTIONS,
  VISIBILITY_META,
  badgeHtml
} from './supportMeta'

const $q = useQuasar()

/** 목업 FAQ 데이터 */
const faqs = ref([
  { id: 21, category: 'account', question: '학교 이메일 인증 어떻게 하나요?', answer: '신원 인증 메뉴에서 학교 이메일을 입력 후 인증을 요청하세요.', status: 'visible' },
  { id: 20, category: 'matching', question: '게시글은 어떻게 올리나요?', answer: '게시글 작성 버튼을 눌러 매물 정보를 입력하세요.', status: 'visible' },
  { id: 19, category: 'matching', question: '룸메이트 확정은 어떻게 하나요?', answer: '채팅 내 확정 버튼을 양쪽이 누르면 확정됩니다.', status: 'visible' },
  { id: 18, category: 'etc', question: '회원 탈퇴는 어떻게 하나요?', answer: '설정 > 계정 관리에서 탈퇴할 수 있습니다.', status: 'visible' }
])

const categoryFilter = ref('all')
const searchKeyword = ref('')

const tableRef = ref(null)
const tableModel = ref({
  filter: {},
  search: {},
  selected: [],
  filterAndSearchData: {},
  header: [
    { name: 'id', label: 'ID', field: 'id', align: 'left', tooltip: false, format: (v) => `<span>#${v}</span>` },
    { name: 'category', label: '카테고리', field: 'category', align: 'center', tooltip: false, format: (v) => badgeHtml(FAQ_CATEGORY_META[v]) },
    { name: 'question', label: '질문', field: 'question', align: 'left', tooltip: false, headerStyle: 'min-width: 16rem' },
    { name: 'status', label: '상태', field: 'status', align: 'center', tooltip: false, format: (v) => badgeHtml(VISIBILITY_META[v]) },
    { name: 'action', label: '액션', field: 'id', align: 'center', tooltip: false, slot: 'action' }
  ],
  rows: [],
  pagination: { page: 1, rowsPerPage: 15, rowsNumber: 0 }
})

const syncRows = () => {
  const kw = searchKeyword.value.trim().toLowerCase()
  const filtered = faqs.value.filter((f) => {
    const categoryOk = categoryFilter.value === 'all' || f.category === categoryFilter.value
    const keywordOk = !kw || f.question.toLowerCase().includes(kw)
    return categoryOk && keywordOk
  })
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
const form = ref({ category: 'account', question: '', answer: '' })

const resetForm = () => {
  form.value = { category: 'account', question: '', answer: '' }
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

const editFaq = (row) => {
  editingId.value = row.id
  form.value = { category: row.category, question: row.question, answer: row.answer }
  showForm.value = true
}

const deleteFaq = (row) => {
  $q.dialog({
    component: AlarmDialog,
    componentProps: { title: 'FAQ 삭제', message: `"${row.question}" FAQ를 삭제하시겠어요?`, cancel: true }
  }).onOk(() => {
    faqs.value = faqs.value.filter((f) => f.id !== row.id)
    syncRows()
  })
}

const submitFaq = () => {
  if (!form.value.question.trim() || !form.value.answer.trim()) {
    $q.dialog({ component: AlarmDialog, componentProps: { title: '알림', message: '질문과 답변을 모두 입력해주세요.' } })
    return
  }
  if (editingId.value) {
    const target = faqs.value.find((f) => f.id === editingId.value)
    if (target) {
      target.category = form.value.category
      target.question = form.value.question
      target.answer = form.value.answer
    }
  } else {
    const newId = Math.max(0, ...faqs.value.map((f) => f.id)) + 1
    faqs.value.unshift({
      id: newId,
      category: form.value.category,
      question: form.value.question,
      answer: form.value.answer,
      status: 'visible'
    })
  }
  syncRows()
  closeForm()
}

onMounted(() => {
  syncRows()
})
</script>
