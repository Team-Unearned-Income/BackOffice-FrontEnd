<template>
  <PageTable
    ref="tableRef"
    v-model.trim="tableModel"
    :virtual-idx="true"
    :table-style="{ height: '63vh' }"
    content-area-class="q-pb-sm"
    class="q-pa-md"
    @request="onRequest"
    @row-click="(event, row) => goDetail(event, row)"
  >
    <template #filter-section>
      <div class="form">
        <div class="row">
          <div class="col-1 form-th">게시상태</div>
          <div class="col-4 form-td">
            <q-select
              v-model="tableModel.filter.postYn"
              :options="filterOptions.postYnList"
              class="full-width"
              dense
              hide-bottom-space
              outlined
            />
          </div>
          <div class="col-5 form-td"></div>
        </div>
        <div class="row">
          <div class="col-1 form-th">등록일</div>
          <div class="col-4 form-td">
            <DoubleDateInput v-model="tableModel.filter.postDt" />
          </div>
          <div class="col-1 form-th">검색어</div>
          <div class="col-5 form-td">
            <TableSearch
              v-model:model-value="tableModel.search.inputFilter"
              class="full-width"
              placeholder="제목을 입력하신 후 엔터를 누르세요."
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
          <q-btn label="배너순서관리" @click="showModal = true" />
          <q-btn label="조회" @click="selectSearchItem" />
          <q-btn style="background-color: #169bd5; color: white" label="등록" @click="goRegist" />
        </div>
      </div>
    </template>
  </PageTable>
  <BannerOrderEditModal
    v-model:show="showModal"
    type="MAIN_VISUAL"
    title="배너순서관리"
    @update:show="tableRef.requestServerInteraction()"
  />
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
import DoubleDateInput from '@/components/input/DoubleDateInput.vue'
import { sitemanagementApi } from '@/service/api'
import COMMON from '@/constants/commonConstatns.js'
import PageTable from '@/components/table/PageTable.vue'
import TableSearch from '@/components/table/TableSearch.vue'
import FilterUtils from '@/utils/FilterUtils.js'
import TableUtils from '@/utils/TableUtils.js'
import BannerOrderEditModal from '@/components/modal/BannerOrderEditModal.vue'

const route = useRoute()
const router = useRouter()
const emitter = inject('emitter')
const showModal = ref(false)

const filterOptions = ref({
  postYnList: []
})

const tableRef = ref(null)
const tableModel = ref({
  filter: getInitialFilter(),
  search: getInitialSearch(),
  selected: [],
  filterAndSearchData: {},
  header: [
    {
      name: 'postYn',
      label: '게시상태',
      field: 'postYn',
      align: 'center',
      format: (value) => {
        return value === 'Y' ? '게시' : '미게시'
      },
      headerStyle: 'max-width: 3rem'
    },
    {
      name: 'title',
      label: '제목',
      field: 'title',
      align: 'center',
      headerStyle: 'min-width: 8rem'
    },
    {
      name: 'postDate',
      label: '게시기간',
      field: 'postDate',
      align: 'center',
      style: 'white-space: normal'
    },
    {
      name: 'createdDate',
      label: '등록일시',
      field: 'createdDate',
      align: 'center'
    }
    // {
    //   name: 'orderSeq',
    //   label: '순서',
    //   field: 'orderSeq',
    //   align: 'center',
    //   headerStyle: 'max-width: 20px',
    //   swap: true
    // }
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
  const postYnList = {
    postYnList: [
      {
        dtlCd: 'ALL',
        dtlCdNm: '전체'
      },
      {
        dtlCd: 'Y',
        dtlCdNm: '게시'
      },
      {
        dtlCd: 'N',
        dtlCdNm: '미게시'
      }
    ]
  }

  filterOptions.value = FilterUtils.parseFilterArray(postYnList)

  const query = new URLSearchParams(window.location.search)

  const postYn = filterOptions.value.postYnList.find((item) => item.value === query.get('postYn'))
  const inputFilter = query.get('inputFilter')
  const page = Number(query.get('page'))
  const size = Number(query.get('size'))

  tableModel.value.filter = {
    postYn: postYn ?? filterOptions.value.postYnList[0]
  }
  tableModel.value.search.inputFilter = inputFilter ?? tableModel.value.search.inputFilter
  tableModel.value.pagination.page = page === 0 ? tableModel.value.pagination.page : page
  tableModel.value.pagination.rowsPerPage = size === 0 ? tableModel.value.pagination.rowsPerPage : size

  if (query.get('regFrom') && query.get('regTo')) {
    tableModel.value.filter.postDt = {
      from: query.get('regFrom'),
      to: query.get('regTo')
    }
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

const onRequest = async (_props) => {
  emitter.emit(COMMON.LOADING.SHOW)

  const tableRowResponse = await sitemanagementApi.getMainVisualList({
    ...FilterUtils.findSelectOptions(tableModel.value.filter),
    inputFilter: tableModel.value.search.inputFilter,
    createdStartDate: tableModel.value.filter.postDt?.from,
    createdEndDate: tableModel.value.filter.postDt?.to,
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
    regDate: tableModel.value.filter.postDt,
    page: tableModel.value.pagination.page,
    size: tableModel.value.pagination.rowsPerPage
  })
  router.replace({ query })

  emitter.emit(COMMON.LOADING.HIDE)
}

const goRegist = () => {
  router.push({ name: 'MainVisualsDetail' })
}

const goDetail = (event, row) => {
  event.preventDefault()

  router.push({ name: 'MainVisualsDetail', query: { bannerSeq: row.bannerMainSeq } })
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
