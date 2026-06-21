<template>
  <PageTable
  ref="tableRef"
    v-model.trim="tableModel"
    class="q-pa-md"
    :virtual-idx="true"
    :table-style="{ height: '63vh' }"
    content-area-class="q-pb-sm"
    :on-custom-pagination="false"
    :on-top-pagination-options="false"
    @request="onRequest"
    @row-click="goEdit"
    @row-btn-click="goDetail"
  ></PageTable>
</template>

<script>
const getInitialSearch = () => ({
  inputFilter: ''
})

const getInitialFilter = () => ({
  type: '',
  postYn: {},
  createdStartDate: {},
  createdEndDate: {}
})
</script>
<script setup>
import { inject, nextTick, onBeforeMount, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import COMMON from '@/constants/commonConstatns.js'
import PageTable from '@/components/table/PageTable.vue'
import FilterUtils from '@/utils/FilterUtils.js'
import TableUtils from '@/utils/TableUtils.js'

const route = useRoute()
const router = useRouter()
const emitter = inject('emitter')

const tableRef = ref(null)
const tableModel = ref({
  filter: getInitialFilter(),
  search: getInitialSearch(),
  selected: [],
  filterAndSearchData: {},
  header: [
    {
      name: 'titleWithMapping',
      label: '제목',
      field: 'titleWithMapping',
      align: 'center',
      headerStyle: 'min-width: 8rem'
    },
    {
      name: 'contentWithMapping',
      label: '내용',
      field: 'contentWithMapping',
      align: 'center',
      headerStyle: 'min-width: 8rem'
    },
    {
      name: 'sendTime',
      label: '전송시간',
      field: 'sendTime',
      align: 'center',
      format: (value) => {
        const stDate = value < 0 ? "분후" : value === 0 ? "즉시" : "분전"
        return (value===0 ? "" : Math.abs(value)) + stDate
      },
      style: 'white-space: normal'
    },
    {
      name: 'detail',
      label: '발송상세',
      btnLabel: '상세보기',
      align: 'center',
      type: 'pushButton'
    }
  ],
  rows: [],
  pagination: {
    page: 0,
    rowsNumber: 0,
    rowsPerPage: 15
  }
})

onBeforeMount(async () => {
  const { rowsPerPage, page, inputFilter } = route.query

  tableModel.value.search = {
    ...tableModel.value.search,
    inputFilter: inputFilter
  }

  tableModel.value.filter = {
    ...tableModel.value.filter,
    rowsPerPage: rowsPerPage ?? 15,
    page: Number(page ?? 1 - 1)
  }
})

onMounted(async () => {
  emitter.emit(COMMON.LOADING.SHOW)

  await nextTick(async () => {
    await tableRef.value.requestServerInteraction()
  })

  emitter.emit(COMMON.LOADING.HIDE)
})

const selectSearchItem = () => {
  tableModel.value.pagination.page = 1 - 1

  tableRef.value.requestServerInteraction()
}

const onRequest = async (_props) => {
  emitter.emit(COMMON.LOADING.SHOW)

  const tableRowResponse = await pushApi.getPushTemplateList()

  tableModel.value.rows = TableUtils.renderRow(
    tableRowResponse.data,
    tableModel.value.header
  )

  tableModel.value.pagination.rowsNumber = tableRowResponse.data.length

  setShowButton()

  emitter.emit(COMMON.LOADING.HIDE)
}

const setShowButton = () => {
  tableModel.value.rows.forEach((row) => {
    row.showButton = true
  })
}

const goEdit = (event, target) => {
  router.push({ name: 'AutoNotifyEdit', query: { id: target.pushTemplateSeq } })
}

const goDetail = (event, target) => {
  event.preventDefault()

  router.push({ name: 'AutoNotifyDetail', query: { id: target.pushTemplateSeq } })
}
</script>
<style>
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
</style>
