<template>
  <div>
    <!-- FAQ 목록 -->
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
                placeholder="질문 검색"
                @select-search-item="syncRows"
                @clear-item="clearSearch"
              />
            </div>
            <div class="col-auto">
              <q-btn label="검색" color="dark" unelevated @click="syncRows" />
            </div>
          </div>
          <div class="col-auto">
            <q-btn label="+ FAQ 추가" color="dark" outline @click="openCreateForm" />
          </div>
        </div>
      </template>

      <template #action="{ slotProps }">
        <q-btn flat dense no-caps color="primary" label="수정" @click="editFaq(slotProps.row)" />
        <q-btn flat dense no-caps color="red" label="삭제" @click="openDelete(slotProps.row)" />
      </template>
    </PageTable>

    <!-- 작성/수정 폼 -->
    <q-slide-transition>
      <q-card v-if="showForm" flat bordered class="q-pa-md q-mt-md">
        <div class="text-subtitle1 text-bold q-mb-md">{{ editingId ? 'FAQ 수정' : 'FAQ 추가' }}</div>
        <q-input
          v-model="form.title"
          dense
          outlined
          placeholder="질문을 입력해주세요"
          class="q-mb-sm"
        />
        <q-input
          v-model="form.contents"
          type="textarea"
          outlined
          rows="4"
          placeholder="답변을 입력해주세요"
          class="q-mb-sm"
        />
        <q-input
          v-model.number="form.sort"
          type="number"
          dense
          outlined
          label="정렬 순서"
          style="max-width: 160px"
        />
        <div class="row justify-end q-gutter-sm q-mt-md">
          <q-btn label="취소" color="grey-7" outline @click="closeForm" />
          <q-btn
            label="등록"
            color="dark"
            unelevated
            text-color="white"
            :disable="!form.title.trim() || !form.contents.trim()"
            @click="submitFaq"
          />
        </div>
      </q-card>
    </q-slide-transition>

    <!-- 삭제 확인 모달 -->
    <ProcessConfirmModal
      v-model:show="showDelete"
      title="FAQ 삭제"
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
import { faqApi } from '@/service/bo/faq'

const emitter = inject('emitter')
const $q = useQuasar()

const allFaqs = ref([])
const searchKeyword = ref('')

const tableRef = ref(null)
const tableModel = ref({
  filter: {},
  search: {},
  selected: [],
  filterAndSearchData: {},
  header: [
    { name: 'id', label: 'ID', field: 'id', align: 'left', tooltip: false, format: (v) => `<span>#${v}</span>` },
    { name: 'title', label: '질문', field: 'title', align: 'left', tooltip: false, headerStyle: 'min-width: 16rem' },
    { name: 'sort', label: '정렬 순서', field: 'sort', align: 'center', tooltip: false },
    { name: 'action', label: '액션', field: 'id', align: 'center', tooltip: false, slot: 'action' }
  ],
  rows: [],
  pagination: { page: 1, rowsPerPage: 15, rowsNumber: 0 }
})

const showError = (e) => {
  const message = e?.error?.message || e?.message || '처리 중 오류가 발생했습니다.'
  $q.dialog({ component: AlarmDialog, componentProps: { title: '오류', message } })
}

const loadFaqs = async () => {
  const res = await faqApi.getList({ page: 0, size: 100 })
  allFaqs.value = res?.faqInfoList ?? []
  syncRows()
}

const fetchFaqs = async () => {
  emitter.emit(COMMON.LOADING.SHOW)
  try {
    await loadFaqs()
  } catch (e) {
    showError(e)
  } finally {
    emitter.emit(COMMON.LOADING.HIDE)
  }
}

const syncRows = () => {
  const kw = searchKeyword.value.trim().toLowerCase()
  const filtered = kw
    ? allFaqs.value.filter((f) => (f.title || '').toLowerCase().includes(kw))
    : allFaqs.value
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
const form = ref({ title: '', contents: '', sort: 1 })

const resetForm = () => {
  form.value = { title: '', contents: '', sort: 1 }
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

const editFaq = async (row) => {
  emitter.emit(COMMON.LOADING.SHOW)
  try {
    const detail = await faqApi.getDetail(row.id)
    editingId.value = row.id
    form.value = {
      title: detail?.title ?? row.title ?? '',
      contents: detail?.contents ?? '',
      sort: detail?.sort ?? row.sort ?? 1
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
  deleteTarget.value ? `"${deleteTarget.value.title}" FAQ를 삭제하시겠어요?` : ''
)
const openDelete = (row) => {
  deleteTarget.value = row
  showDelete.value = true
}
const onDeleteConfirm = async () => {
  emitter.emit(COMMON.LOADING.SHOW)
  try {
    await faqApi.remove(deleteTarget.value.id)
    await loadFaqs()
  } catch (e) {
    showError(e)
  } finally {
    emitter.emit(COMMON.LOADING.HIDE)
  }
}

const submitFaq = async () => {
  if (!form.value.title.trim() || !form.value.contents.trim()) {
    $q.dialog({ component: AlarmDialog, componentProps: { title: '알림', message: '질문과 답변을 모두 입력해주세요.' } })
    return
  }
  const body = {
    title: form.value.title.trim(),
    contents: form.value.contents.trim(),
    sort: form.value.sort
  }
  emitter.emit(COMMON.LOADING.SHOW)
  try {
    if (editingId.value) await faqApi.modify({ id: editingId.value, ...body })
    else await faqApi.save(body)
    closeForm()
    await loadFaqs()
  } catch (e) {
    showError(e)
  } finally {
    emitter.emit(COMMON.LOADING.HIDE)
  }
}

onMounted(() => {
  fetchFaqs()
})
</script>
