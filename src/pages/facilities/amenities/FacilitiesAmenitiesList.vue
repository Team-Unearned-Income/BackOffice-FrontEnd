<template>
  <PageTable
    ref="tableRef"
    v-model.trim="tableModel"
    :virtual-idx="true"
    :table-style="{ height: '63vh' }"
    content-area-class="q-pb-sm"
    class="q-pa-md"
    @request="onRequest"
    @row-click="goDetail"
  >
    <template #filter-section>
      <div class="form">
        <div class="row">
          <div class="col-1 form-th">구분</div>
          <div class="col-4 form-td">
            <q-select
              v-model="tableModel.filter.amenitiesType"
              :options="filterOptions.amenitiesTypeList"
              class="full-width"
              dense
              hide-bottom-space
              outlined
            />
          </div>
          <div class="col-1 form-th">지역</div>
          <div class="col-4 form-td">
            <q-select
              v-model="tableModel.filter.locationCode"
              :options="filterOptions.locationCodeList"
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
              placeholder="시설명을 입력 하신 후 엔터를 누르세요."
              style="width: 100%"
              @clear-item="clearSearchItem"
              @select-search-item="selectSearchItem"
            />
          </div>
        </div>
      </div>
      <div class="row q-py-md justify-end">
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
  amenitiesType: {},
  locationCode: {}
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
import TableUtils from '@/utils/TableUtils.js'

const route = useRoute()
const router = useRouter()
const emitter = inject('emitter')

const filterOptions = ref({
  /** q-select options 예시 */
  foodShoppingTypeList: [],
  locationCodeList: []
})

const tableRef = ref(null)
const tableModel = ref({
  filter: getInitialFilter(),
  search: getInitialSearch(),
  selected: [],
  filterAndSearchData: {},
  header: [
    {
      name: 'type',
      label: '구분',
      field: 'type',
      align: 'center'
    },
    {
      name: 'zone',
      label: '지역',
      field: 'zone',
      align: 'center'
    },
    {
      name: 'facilitiesNm',
      label: '시설명',
      field: 'facilitiesNm',
      align: 'center',
      headerStyle: 'min-width: 70px'
    },
    {
      name: 'regDt',
      label: '등록일',
      field: 'regDt',
      align: 'center'
    },
    {
      name: 'regNm',
      label: '등록자',
      field: 'regNm',
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
  await nextTick(async () => {
    await tableRef.value.requestServerInteraction()
  })

  emitter.emit(COMMON.LOADING.HIDE)
})

const filterSetting = async () => {
  const filterList = await facilitiesApi.amenitiesListCodeGet().then((res) => res.data)
  filterOptions.value = FilterUtils.parseFilterArray(filterList)

  const query = new URLSearchParams(window.location.search)

  const amenitiesType = filterOptions.value.amenitiesTypeList.find(
    (item) => item.value === query.get('amenitiesType')
  )
  const locationCode = filterOptions.value.locationCodeList.find(
    (item) => item.value === query.get('locationCode')
  )
  const inputFilter = query.get('inputFilter')
  const page = Number(query.get('page'))
  const size = Number(query.get('size'))

  tableModel.value.filter = {
    amenitiesType: amenitiesType ?? filterOptions.value.amenitiesTypeList[0],
    locationCode: locationCode ?? filterOptions.value.locationCodeList[0]
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

  const tableRowResponse = await facilitiesApi.getAmenitiesList({
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

const goDetail = (event, target) => {
  router.push({ name: 'FacilitiesAmenitiesDetail', query: { idx: target.idx } })
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
