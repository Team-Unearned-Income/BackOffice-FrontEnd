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
          <div class="col-1 form-th">사용여부</div>
          <div class="col-4 form-td">
            <q-select
              v-model="tableModel.filter.adminStatus"
              :options="filterOptions.useYnList"
              class="full-width"
              dense
              hide-bottom-space
              outlined
            />
          </div>
          <div class="col-1 form-th">소속</div>
          <div class="col-4 form-td">
            <q-select
              v-model="tableModel.filter.organization"
              :options="filterOptions.sosokList"
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
            <DoubleDateInput v-model="tableModel.filter.postDt" />
          </div>
          <div class="col-1 form-th">검색어</div>
          <div class="col-4 form-td" style="display: grid; flex-direction: column">
            <div class="col-4 form-td" style="gap: 0.5rem">
              <div class="col-1 form-td">
                <q-select
                  v-model="tableModel.filter.searchCondition"
                  :options="filterOptions.searchKeywordList"
                  class="full-width"
                  dense
                  hide-bottom-space
                  outlined
                />
              </div>
              <div class="form-td full-width">
                <TableSearch
                  v-model:model-value="tableModel.search.inputFilter"
                  class="full-width"
                  @clear-item="clearSearchItem"
                  @select-search-item="selectSearchItem"
                />
              </div>
            </div>
            <span>※ 이름 검색 시 전체 이름을 입력해야 합니다.</span>
          </div>
        </div>
      </div>
      <!-- TableFilter 영역 -->
      <div class="row justify-between q-py-md">
        <div style="visibility: hidden"></div>
        <div style="display: flex; gap: 1rem">
          <q-btn label="조회" @click="selectSearchItem" />
          <q-btn
            style="background-color: #169bd5; color: white"
            label="등록"
            :disable="!isSuperAdmin"
            @click="goRegist"
          />
          <q-tooltip v-if="!isSuperAdmin">마스터 관리자만 등록 가능합니다.</q-tooltip>
        </div>
      </div>
    </template>
  </PageTable>
</template>

<script>
const getInitialSearch = () => ({
  inputFilter: ''
})

const getInitialFilter = () => ({
  adminStatus: {},
  organization: {},
  searchCondition: {},
  createdStartDate: {},
  createdEndDate: {}
})
</script>
<script setup>
import { inject, nextTick, onBeforeMount, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import DoubleDateInput from '@/components/input/DoubleDateInput.vue'
import COMMON from '@/constants/commonConstatns.js'
import PageTable from '@/components/table/PageTable.vue'
import TableSearch from '@/components/table/TableSearch.vue'
import FilterUtils from '@/utils/FilterUtils.js'
import TableUtils from '@/utils/TableUtils.js'
import DateUtils from '@/utils/DateUtils'

const route = useRoute()
const router = useRouter()
const emitter = inject('emitter')

const filterOptions = ref({
  useYnList: [],
  sosokList: [],
  searchKeywordList: []
})

const tableRef = ref(null)
const tableModel = ref({
  filter: getInitialFilter(),
  search: getInitialSearch(),
  selected: [],
  filterAndSearchData: {},
  header: [
    {
      name: 'adminStatus',
      label: '상태',
      field: 'adminStatus',
      align: 'center',
      format: (value) => {
        return value === 'USE' ? '사용' : '미사용'
      }
    },
    {
      name: 'organizationName',
      label: '소속',
      field: 'organizationName',
      align: 'center'
    },
    {
      name: 'adminId',
      label: '아이디',
      field: 'adminId',
      align: 'center'
    },
    {
      name: 'name',
      label: '이름',
      field: 'name',
      align: 'center'
    },
    {
      name: 'loginFailCnt',
      label: '로그인 실패 수',
      field: 'loginFailCnt',
      align: 'center'
    },
    {
      name: 'createdDate',
      label: '등록일시',
      field: 'createdDate',
      align: 'center'
    },
    {
      name: 'ip',
      label: '최근 로그인 IP',
      field: 'ip',
      align: 'center'
    },
    {
      name: 'loginDate',
      label: '최근 로그인 일시',
      field: 'loginDate',
      align: 'center',
      format: (value) => DateUtils.convertStandardDate(value)
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

const isSuperAdmin = ref(false)

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

    isSuperAdmin.value = await authApi.checkSuperAdmin().then((res) => res.data)
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
  const response = await authApi.getAuthCodeList().then((res) => {
    const apiData = res.data
    apiData.useYnList.unshift({
      dtlCd: 'ALL',
      dtlCdNm: '전체'
    })
    apiData.sosokList.unshift({ dtlCd: 'ALL', dtlCdNm: '전체' })

    return apiData
  })
  filterOptions.value = FilterUtils.parseFilterArray(response)

  const query = new URLSearchParams(window.location.search)

  const adminStatus = filterOptions.value.useYnList.find(
    (item) => item.value === query.get('adminStatus')
  )
  const organization = filterOptions.value.sosokList.find(
    (item) => item.value === query.get('organization')
  )
  const searchCondition = filterOptions.value.searchKeywordList.find(
    (item) => item.value === query.get('searchCondition')
  )
  const inputFilter = query.get('inputFilter')
  const page = Number(query.get('page'))
  const size = Number(query.get('size'))

  tableModel.value.filter = {
    adminStatus: adminStatus ?? filterOptions.value.useYnList[0],
    organization: organization ?? filterOptions.value.sosokList[0],
    searchCondition: searchCondition ?? filterOptions.value.searchKeywordList[0]
  }
  tableModel.value.search.inputFilter = inputFilter ?? tableModel.value.search.inputFilter
  tableModel.value.pagination.page = page == 0 ? tableModel.value.pagination.page : page
  tableModel.value.pagination.rowsPerPage =
    size == 0 ? tableModel.value.pagination.rowsPerPage : size

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

  const tableRowResponse = await authApi.getAdminAuthList({
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
  router.push({ name: 'AdminsDetail' })
}

const goDetail = (event, row) => {
  event.preventDefault()

  router.push({ name: 'AdminsDetail', query: { adminSeq: row.adminSeq } })
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
