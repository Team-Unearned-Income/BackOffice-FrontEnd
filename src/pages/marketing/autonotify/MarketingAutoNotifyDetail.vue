<template>
  <PageTable
    ref="tableRef"
    v-model.trim="tableModel"
    :virtual-idx="true"
    class="q-pa-md"
    :table-style="{ height: '63vh' }"
    content-area-class="q-pb-sm"
    @request="onRequest"
  >
    <template #bottom>
      <div class="row q-py-md justify-start q-gutter-md">
        <q-btn label="목록" @click="goList" />
      </div>
    </template>
  </PageTable>
</template>

<script setup>
import { inject, nextTick, onBeforeMount, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import COMMON from '@/constants/commonConstatns.js'
import PageTable from '@/components/table/PageTable.vue'
import TableUtils from '@/utils/TableUtils.js'
import { previousQueryUrl } from '@/router'
const route = useRoute()
const router = useRouter()
const emitter = inject('emitter')

const confirmYn = ref({ label: '전체', value: null })

const codeModel = ref({
  sendStatusList: [],
  recipientTypeList: [],
  linkUseYnList: [],
  linkTypeList: [],
  screenNameList: []
})

const tableRef = ref(null)

const tableModel = ref({
  selected: [],
  filterAndSearchData: {},
  header: [
    {
      name: 'sendDate',
      label: '발송일자',
      field: 'sendDate',
      align: 'center'
    },
    {
      name: 'sendEndTime',
      label: '발송시간',
      field: 'sendEndTime',
      align: 'center'
    },
    {
      name: 'sendStatus',
      label: '발송상태',
      field: 'sendStatus',
      align: 'center',
      format: (value) => {
        return codeModel.value.sendStatusList.find((item) => item.value === value)?.label || value
      }
    }
  ],
  rows: [],
  pagination: {
    page: 0,
    rowsPerPage: 15,
    rowsNumber: 0
  }
})

onBeforeMount(async () => {
  const { inputFilter } = route.query

  tableModel.value.search = {
    ...tableModel.value.search,
    inputFilter: inputFilter
  }

  tableModel.value.filter = {
    ...tableModel.value.filter
  }
})

onMounted(async () => {
  emitter.emit(COMMON.LOADING.SHOW)
  await nextTick(async () => {
    await tableRef.value.requestServerInteraction()
  })

  emitter.emit(COMMON.LOADING.HIDE)
})

const onRequest = async (props) => {
  emitter.emit(COMMON.LOADING.SHOW)

  const tableRowResponse = await pushApi.getPushTemplateSendHistory(route.query.id)

  tableModel.value.rows = TableUtils.renderRow(
    tableRowResponse.data.content,
    tableModel.value.header
  )
  tableModel.value.pagination.page = tableRowResponse.data.pageable.pageNumber + 1
  tableModel.value.pagination.rowsPerPage = tableRowResponse.data.pageable.pageSize
  tableModel.value.pagination.rowsNumber = tableRowResponse.data.totalElements

  const query = TableUtils.querySetting({
    filter: tableModel.value.filter,
    inputFilter: tableModel.value.search.inputFilter,
    regDate: tableModel.value.filter.joinDt,
    page: tableModel.value.pagination.page,
    size: tableModel.value.pagination.rowsPerPage
  })
  router.replace({ query })

  emitter.emit(COMMON.LOADING.HIDE)
}

const goList = async () => {
  router.push({ name: 'AutoNotifyList' })
}
</script>
<style scoped>
tbody:empty::before {
  content: '데이터가 없습니다.';
  color: #767778;
  font-size: 0.8rem;
  font-weight: 400;
  line-height: 1.25rem;
  letter-spacing: 0.01786em;
  /* table height와 동일하게 vh적용 */
  margin-top: calc(63vh - 40px);
}

.multiline-text {
  white-space: pre-line;
}
</style>
