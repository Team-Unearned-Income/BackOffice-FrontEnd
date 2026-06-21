<template>
  <PageTable
    ref="tableRef"
    v-model.trim="tableModel"
    :virtual-idx="true"
    :table-style="{
      height: '63vh'
    }"
    content-area-class="q-pb-sm"
    class="q-pa-md"
    @request="onRequest"
    @row-click="goDetail"
  >
    <template #filter-section>
      <div class="form">
        <div class="row">
          <div class="col-1 form-th">게시여부</div>
          <div class="col-4 form-td">
            <q-select
              v-model="tableModel.filter.postYn"
              :options="filterOptions.postTypeList"
              class="full-width"
              dense
              hide-bottom-space
              outlined
            />
          </div>
          <div class="col-1 form-th">예약 운영여부</div>
          <div class="col-4 form-td">
            <q-select
              v-model="tableModel.filter.lunarpass"
              :options="filterOptions.bookingStatusList"
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
            <DoubleDateInput v-model="tableModel.filter.regDt" />
          </div>
          <div class="col-1 form-th">검색어</div>
          <div class="col-4 form-td">
            <TableSearch
              v-model:model-value="tableModel.search.inputFilter"
              style="width: 100%"
              placeholder="공연명을 입력 하신 후 엔터를 누르세요."
              @clear-item="clearSearchItem"
              @select-search-item="selectSearchItem"
            />
          </div>
        </div>
      </div>
      <div class="row q-py-md justify-end">
        <q-btn label="조회" @click="selectSearchItem" />
      </div>
    </template>
  </PageTable>
</template>

<script>
const getInitialSearch = () => ({
  inputFilter: ''
})

const getInitialFilter = () => ({
  type: '',
  postYn: {},
  lunarpass: {}
})
</script>
<script setup>
import { inject, nextTick, onBeforeMount, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import COMMON from '@/constants/commonConstatns.js'
import PageTable from '@/components/table/PageTable.vue'
import TableSearch from '@/components/table/TableSearch.vue'
import FilterUtils from '@/utils/FilterUtils.js'
import DoubleDateInput from '@/components/input/DoubleDateInput.vue'
import { useLayoutStore } from '@/stores/layout.js'
import TableUtils from '@/utils/TableUtils.js'

const route = useRoute()
const router = useRouter()
const emitter = inject('emitter')
const layoutStore = useLayoutStore()

const filterOptions = ref({
  /** q-select options 예시 */
  bookingStatusList: [],
  postTypeList: []
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
      label: '게시여부',
      field: 'postYn',
      align: 'center',
      slot: 'postYn',
      format: (value) => {
        return value === 'Y' ? '게시' : '미게시'
      }
    },
    {
      name: 'lunarpass',
      label: '공연예약',
      field: 'lunarpass',
      align: 'center',
      format: (value) => {
        return (
          filterOptions.value.bookingStatusList.find((item) => item.value === value)?.label || value
        )
      }
    },
    {
      name: 'titleKor',
      label: '공연명',
      field: 'titleKor',
      align: 'center',
      style: 'min-width: 8rem'
    },
    {
      name: 'zone',
      label: '지역',
      field: 'zone',
      align: 'center'
    },
    {
      name: 'etcLocationName',
      label: '장소',
      field: 'etcLocationName',
      align: 'center'
    },
    {
      name: 'postDate',
      label: '게시기간',
      field: 'postDate',
      align: 'center'
    },
    {
      name: 'regDate',
      label: '등록일',
      field: 'regDate',
      align: 'center'
    },
    {
      name: 'usernm',
      label: '등록자',
      field: 'usernm',
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
  const filterList = await showeventApi.getShowEventCode().then((res) => res.data)
  filterOptions.value = await FilterUtils.parseFilterArray(filterList)

  const query = new URLSearchParams(window.location.search)

  const postYn = filterOptions.value.postTypeList.find((item) => item.value === query.get('postYn'))
  const lunarpass = filterOptions.value.bookingStatusList.find(
    (item) => item.value === query.get('lunarpass')
  )
  const inputFilter = query.get('inputFilter')
  const page = Number(query.get('page'))
  const size = Number(query.get('size'))

  tableModel.value.filter = {
    postYn: postYn ?? filterOptions.value.postTypeList[0],
    lunarpass: lunarpass ?? filterOptions.value.bookingStatusList[0]
  }
  tableModel.value.search.inputFilter = inputFilter ?? tableModel.value.search.inputFilter
  tableModel.value.pagination.page = page ?? tableModel.value.pagination.page
  tableModel.value.pagination.rowsPerPage = size ?? tableModel.value.pagination.rowsPerPage

  if (query.get('regFrom') && query.get('regTo')) {
    tableModel.value.filter.regDt = {
      from: query.get('regFrom'),
      to: query.get('regTo')
    }
  }
}

const searchSetting = async () => {
  await commonApi
    .adminSearchConditionInfoGet({ adminMenuSeq: layoutStore.selectedMenu.adminMenuSeq })
    .then((res) => {
      const response = res.data.searchCondition
      tableModel.value.search = {
        ...response
      }
      if (response.regDt) tableModel.value.filter.regDt = response.regDt
      if (response.postYn) tableModel.value.filter.postYn = response.postYn
      if (response.lunarpass) tableModel.value.filter.lunarpass = response.lunarpass
    })
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

/** TODO: 기획에는 없지만 필요할 기능일듯함 */
const resetTableFilter = () => {
  tableModel.value.filter = {}
}

const onRequest = async (_props) => {
  emitter.emit(COMMON.LOADING.SHOW)

  const tableRowResponse = await showeventApi.showEventListInfoGet({
    ...FilterUtils.findSelectOptions(tableModel.value.filter),
    inputFilter: tableModel.value.search.inputFilter,
    regStartDate: tableModel.value.filter.regDt?.from,
    regEndDate: tableModel.value.filter.regDt?.to,
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
    regDate: tableModel.value.filter.regDt,
    page: tableModel.value.pagination.page,
    size: tableModel.value.pagination.rowsPerPage
  })
  router.replace({ query })

  emitter.emit(COMMON.LOADING.HIDE)
}

const operateHours = () => {
  /** TODO: 운영시간 일괄변경 팝업 노출 */
}

const onRegist = () => {
  /** TODO: 등록 API 로직 처리 */
}

const goDetail = (event, target) => {
  router.push({ name: 'ShowManageDetail', query: { idx: target.idx } })
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
