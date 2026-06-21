<template>
  <PageTable
    ref="tableRef"
    v-model.trim="tableModel"
    :virtual-idx="true"
    :table-style="{
      height: '63vh'
    }"
    content-area-class="q-pb-sm"
    @request="onRequest"
    class="q-pa-md"
    @row-click="goDetail"
  >
    <template #filter-section>
      <div class="form">
        <div class="row">
          <div class="col-1 form-th">상태</div>
          <div class="col-4 form-td">
            <q-select
              v-model="tableModel.filter.groupTicketStatus"
              :options="filterOptions.groupTicketStatusList"
              class="full-width"
              dense
              hide-bottom-space
              outlined
            />
          </div>
        </div>
        <div class="row">
          <div class="col-1 form-th">이용일</div>
          <div class="col-4 form-td">
            <DoubleDateInput v-model="tableModel.filter.useDt" />
          </div>
          <div class="col-1 form-th">검색어</div>
          <div class="col-2 form-td">
            <q-select
              v-model="tableModel.filter.searchCondition"
              :options="filterOptions.groupTicketSearchList"
              class="full-width"
              dense
              hide-bottom-space
              outlined
            />
          </div>
          <div class="col">
            <TableSearch
              v-model:model-value="tableModel.search.inputFilter"
              style="width: 100%"
              placeholder="단체명, 대표장명, 대표자휴대폰, 판매담당자명 대상 조회"
              @clear-item="clearSearchItem"
              @select-search-item="selectSearchItem"
            />
          </div>
        </div>
      </div>
      <div class="row q-py-md justify-end q-gutter-md">
        <q-btn label="excel 다운로드" @click="downloadList" />
        <q-btn label="조회" @click="selectSearchItem" />
      </div>
      <div class="q-py-md" />
    </template>
  </PageTable>
</template>

<script>
const getInitialSearch = () => ({
  inputFilter: ''
})

const getInitialFilter = () => ({
  status: {},
  useDt: {}
})
</script>
<script setup>
import { inject, nextTick, onBeforeMount, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import COMMON from '@/constants/commonConstatns.js'
import PageTable from '@/components/table/PageTable.vue'
import TableSearch from '@/components/table/TableSearch.vue'
import { marketingApi } from '@/service/api'
import FilterUtils from '@/utils/FilterUtils.js'
import DoubleDateInput from '@/components/input/DoubleDateInput.vue'
import TableUtils from '@/utils/TableUtils.js'
import { REGEX } from '@/constants/regualExpression.js'
import axios from 'axios'

const route = useRoute()
const router = useRouter()
const emitter = inject('emitter')

const filterOptions = ref({
  groupTicketStatusList: [],
  groupTicketSearchList: []
})

const tableRef = ref(null)
const tableModel = ref({
  filter: getInitialFilter(),
  search: getInitialSearch(),
  selected: [],
  filterAndSearchData: {},
  header: [
    {
      name: 'status',
      label: '상태',
      field: 'status',
      align: 'center',
      headerStyle: 'min-width: 5rem'
      // format: (value) => setStatusType(value)
    },
    {
      name: 'useDate',
      label: '이용일',
      field: 'useDate',
      align: 'center',
      headerStyle: 'min-width: 5rem'
    },
    {
      name: 'groupName',
      label: '단체명',
      field: 'groupName',
      align: 'center',
      headerStyle: 'min-width: 200px'
    },
    {
      name: 'representativeName',
      label: '대표자명',
      field: 'representativeName',
      align: 'center'
    },
    {
      name: 'representativePhoneNumber',
      label: '대표자휴대폰',
      field: 'representativePhoneNumber',
      align: 'center',
      format: (value) => value.replace(REGEX.PHONE_NUM, '$1-$2-$3')
    },
    {
      name: 'saleManagerName',
      label: '판매담당자명',
      field: 'saleManagerName',
      align: 'center'
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

  await filterSetting()
  //await searchSetting()
  await nextTick(async () => {
    await tableRef.value.requestServerInteraction()
  })

  emitter.emit(COMMON.LOADING.HIDE)
})

const filterSetting = async () => {
  const filterList = await marketingApi.getGroupTicketListCode().then((res) => res.data)
  filterOptions.value = await FilterUtils.parseFilterArray(filterList)

  const query = new URLSearchParams(window.location.search)

  const groupTicketStatus = filterOptions.value.groupTicketStatusList.find(
    (item) => item.value === query.get('groupTicketStatus')
  )
  const searchCondition = filterOptions.value.groupTicketSearchList.find(
    (item) => item.value === query.get('searchCondition')
  )
  const inputFilter = query.get('inputFilter')
  const page = Number(query.get('page'))
  const size = Number(query.get('size'))

  tableModel.value.filter = {
    groupTicketStatus: groupTicketStatus ?? filterOptions.value.groupTicketStatusList[0],
    searchCondition: searchCondition ?? filterOptions.value.groupTicketSearchList[0]
  }
  tableModel.value.search.inputFilter = inputFilter ?? tableModel.value.search.inputFilter
  tableModel.value.pagination.page = page ?? tableModel.value.pagination.page
  tableModel.value.pagination.rowsPerPage = size ?? tableModel.value.pagination.rowsPerPage

  if (query.get('regFrom') && query.get('regTo')) {
    tableModel.value.filter.useDt = {
      from: query.get('regFrom'),
      to: query.get('regTo')
    }
  }
}

const selectSearchItem = async () => {
  // 검색
  tableModel.value.search.searchData = {
    inputFilter: tableModel.value.search.inputFilter
  }

  tableModel.value.pagination.page = 1 - 1
  tableRef.value.requestServerInteraction()
}

const clearSearchItem = () => {
  // inputText 제거 및 Table 초기화
  tableModel.value.search = getInitialSearch()
  tableModel.value.pagination.page = 1
}

// const setStatusType = (value) => {
//   const matchedItem = filterOptions.value.groupTicketStatusList.find((item) => item.label === value)
//   return matchedItem ? matchedItem.label : '발송전'
// }

const downloadList = async () => {
  try {
    emitter.emit(COMMON.LOADING.SHOW)

    const request = {
      ...FilterUtils.findSelectOptions(tableModel.value.filter),
      groupTicketStatus: tableModel.value.filter.groupTicketStatus?.value,
      useStartDate: tableModel.value.filter.useDt?.from,
      useEndDate: tableModel.value.filter.useDt?.to,
      searchCondition: tableModel.value.filter.searchCondition?.value,
      inputFilter: tableModel.value.search.inputFilter,
      // page: tableModel.value.pagination.page - 1,
      size: tableModel.value.pagination.rowsNumber
    }

    const response = await axios.get(
      `${import.meta.env.VITE_API_SERVER}/api/v1/marketing/groupTicket/excel`,
      {
        params: request,
        headers: {
          Authorization: `Bearer ${localStorage.getItem('auth').split('"accessToken":"')[1].split('"')[0]}`
        },
        responseType: 'blob'
      }
    )
    // .then((res) => res.data)

    const blob = new Blob([response.data], {
      type: response.headers['content-type']
    })

    const url = window.URL.createObjectURL(blob)

    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', 'groupTicket_list.xlsx')
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(url)

    emitter.emit(COMMON.LOADING.HIDE)
  } catch (error) {
    console.error('파일 다운로드 중 오류 발생: ', error)
  }
}

const onRequest = async (_props) => {
  emitter.emit(COMMON.LOADING.SHOW)

  const tableRowResponse = await marketingApi.getGroupTicketList({
    ...FilterUtils.findSelectOptions(tableModel.value.filter),
    inputFilter: tableModel.value.search.inputFilter,
    useStartDate: tableModel.value.filter.useDt?.from,
    useEndDate: tableModel.value.filter.useDt?.to,
    page: tableModel.value.pagination.page - 1,
    size: tableModel.value.pagination.rowsPerPage
  })

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
    regDate: tableModel.value.filter.useDt,
    page: tableModel.value.pagination.page,
    size: tableModel.value.pagination.rowsPerPage
  })
  router.replace({ query })

  emitter.emit(COMMON.LOADING.HIDE)
}

const goDetail = (event, target) => {
  router.push({
    name: 'GroupTicketDetail',
    query: { idx: target.idx, groupType: target.groupType }
  })
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
