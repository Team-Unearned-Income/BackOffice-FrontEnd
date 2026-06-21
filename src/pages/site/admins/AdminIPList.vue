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
  >
    <template #filter-section>
      <div class="form">
        <div class="row">
          <div class="col-1 form-th">사용여부</div>
          <div class="col-4 form-td">
            <q-select
              v-model="tableModel.filter.useYn"
              :options="filterOptions.useYnList"
              class="full-width"
              dense
              hide-bottom-space
              outlined
            />
          </div>
        </div>
        <div class="row">
          <div class="col-1 form-th">등록일</div>
          <div class="col-4 form-td">
            <DoubleDateInput v-model="tableModel.filter.createdDt" />
          </div>
          <div class="col-1 form-th">검색어</div>
          <div class="col-4 form-td" style="display: grid; flex-direction: column">
            <TableSearch
              class="full-width"
              v-model:model-value="tableModel.search.inputFilter"
              placeholder="IP, 내용 대상 조회"
              @clear-item="clearSearchItem"
              @select-search-item="selectSearchItem"
            />
          </div>
        </div>
      </div>
      <!-- TableFilter 영역 -->
      <div class="row justify-between q-py-md">
        <div style="visibility: hidden"></div>
        <div style="display: flex; gap: 1rem">
          <q-btn label="조회" @click="selectSearchItem" />
          <q-btn style="background-color: #169bd5; color: white" label="등록" @click="goRegist" />
        </div>
      </div>
    </template>
  </PageTable>
  <IPRegistModal
    v-model:show="showModal"
    :title="'IP 등록'"
    @update:model-value="async (value) => await onRegist(value)"
  />
</template>

<script>
const getInitialSearch = () => ({
  inputFilter: ''
})

const getInitialFilter = () => ({
  useYn: {},
  createdStartDate: {},
  createdEndDate: {}
})
</script>
<script setup>
import { inject, nextTick, onBeforeMount, onMounted, watch, ref } from 'vue'
import DoubleDateInput from '@/components/input/DoubleDateInput.vue'
import COMMON from '@/constants/commonConstatns.js'
import PageTable from '@/components/table/PageTable.vue'
import TableSearch from '@/components/table/TableSearch.vue'
import FilterUtils from '@/utils/FilterUtils.js'
import TableUtils from '@/utils/TableUtils.js'
import IPRegistModal from '@/components/modal/IPRegistModal.vue'

const emitter = inject('emitter')

const showModal = ref(false)

const filterOptions = ref({
  useYnList: []
})

const tableRef = ref(null)
const tableModel = ref({
  filter: getInitialFilter(),
  search: getInitialSearch(),
  selected: [],
  filterAndSearchData: {},
  header: [
    {
      name: 'useYn',
      label: '사용여부',
      field: 'useYn',
      align: 'center',
      format: (value) => {
        return value === 'Y' ? '사용' : '미사용'
      },
      style: 'width: 5rem'
    },
    {
      name: 'ip',
      label: 'IP',
      field: 'ip',
      align: 'center'
    },
    {
      name: 'content',
      label: '내용',
      field: 'content',
      align: 'center',
      style: 'min-width: 8rem'
    },
    {
      name: 'createdDate',
      label: '등록일',
      field: 'createdDate',
      align: 'center'
    },
    {
      name: 'temp',
      label: '\t',
      field: 'temp',
      align: 'center',
      format: (value, row) =>
        `<button style="width: 3rem" class="delete-btn" data-id="${row.adminIpSeq}">삭제</button>`
    }
  ],
  rows: [],
  pagination: {
    sortBy: '',
    descending: false,
    page: 1 - 1,
    rowsPerPage: 15,
    rowsNumber: 0
  }
})

onBeforeMount(async () => {
  tableModel.value.filter = {
    ...tableModel.value.filter
  }
})

onMounted(async () => {
  emitter.emit(COMMON.LOADING.SHOW)

  await filterSetting()
  await nextTick(async () => {
    await tableRef.value.requestServerInteraction()
  })

  emitter.emit(COMMON.LOADING.HIDE)
})

const refreshData = async () => {
  await filterSetting()
  await nextTick(async () => {
    await tableRef.value.requestServerInteraction()
  })
}

const filterSetting = async () => {
  const filterList = {
    useYnList: [
      {
        dtlCd: 'ALL',
        dtlCdNm: '전체'
      },
      {
        dtlCd: 'Y',
        dtlCdNm: '사용'
      },
      {
        dtlCd: 'N',
        dtlCdNm: '미사용'
      }
    ]
  }

  filterOptions.value = FilterUtils.parseFilterArray(filterList)

  tableModel.value.filter = {
    useYn: filterOptions.value.useYnList[0]
  }
}

const selectSearchItem = () => {
  tableModel.value.pagination.page = 1 - 1

  tableRef.value.requestServerInteraction()
}

const clearSearchItem = () => {
  // inputText 제거 및 Table 초기화
  tableModel.value.search.inputFilter = ''

  tableModel.value.pagination.page = 1 - 1

  tableRef.value.requestServerInteraction()
}

/** TODO: 기획에는 없지만 필요할 기능일듯함 */
const resetTableFilter = () => {
  tableModel.value.filter = {}
}

const onRequest = async (props) => {
  emitter.emit(COMMON.LOADING.SHOW)

  const { page, rowsPerPage } = props.pagination

  const tableRowResponse = await sitemanagementApi.getIpManagementList({
    ...FilterUtils.findSelectOptions(tableModel.value.filter),
    inputFilter: tableModel.value.search.inputFilter,
    createdStartDate: tableModel.value.filter.createdDt?.from,
    createdEndDate: tableModel.value.filter.createdDt?.to,
    page: page - 1,
    size: rowsPerPage
  })

  tableModel.value.rows = TableUtils.renderRow(
    tableRowResponse.data.content,
    tableModel.value.header
  )
  tableModel.value.pagination.page = page
  tableModel.value.pagination.rowsNumber = tableRowResponse.data.totalElements

  nextTick(() => {
    bindDeleteEventListeners()
  })

  emitter.emit(COMMON.LOADING.HIDE)
}

const goRegist = () => {
  showModal.value = true
}

const onRegist = async (data) => {
  await sitemanagementApi.regIpManagement(data)

  await tableRef.value.requestServerInteraction()
}

const bindDeleteEventListeners = async () => {
  const deleteButtons = document.querySelectorAll('.delete-btn')
  deleteButtons.forEach((button) => {
    button.removeEventListener('click', handleDeleteClick) // 기존 이벤트 제거
    button.addEventListener('click', handleDeleteClick) // 새로 이벤트 추가
  })
}

const handleDeleteClick = (event) => {
  const adminIpSeq = event.target.getAttribute('data-id')
  if (adminIpSeq) {
    onDelete(adminIpSeq)
  }
}

const onDelete = async (seq) => {
  await sitemanagementApi.deleteIpManagement(seq)

  await tableRef.value.requestServerInteraction()
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
