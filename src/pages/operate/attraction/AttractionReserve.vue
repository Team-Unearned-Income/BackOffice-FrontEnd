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
      <div class="row justify-between" style="margin-bottom: 1rem">
        <div class="text-h6 text-bold">예매조회</div>
        <q-btn label="검색조건설정" @click="showModal = true" unelevated outline />
      </div>
      <div class="form">
        <div class="row">
          <div class="col-1 form-th">예약여부</div>
          <div class="col-4 form-td">
            <q-select
              v-model="tableModel.filter.reservationYn"
              :options="filterOptions.reservationTypeList"
              class="full-width"
              dense
              hide-bottom-space
              outlined
            />
          </div>
          <div class="col-1 form-th">탑승여부</div>
          <div class="col-4 form-td">
            <q-select
              v-model="tableModel.filter.boardingYn"
              :options="filterOptions.boardingTypeList"
              class="full-width"
              dense
              hide-bottom-space
              outlined
            />
          </div>
        </div>
        <div class="row">
          <div class="col-1 form-th">예약일</div>
          <div class="col-4 form-td">
            <DoubleDateInput v-model="tableModel.filter.reserveDt" />
          </div>
          <div class="col-1 form-th">예약시간대</div>
          <div class="col-4 form-td">
            <q-select
              v-model="tableModel.filter.reservationTimeRange"
              :options="filterOptions.reservationTimeRangeList"
              class="full-width"
              dense
              hide-bottom-space
              outlined
            />
          </div>
        </div>
        <div class="row">
          <div class="col-1 form-th">검색어</div>
          <div
            class="col-11 form-td"
            style="display: flex; flex-direction: row; justify-content: space-between"
          >
            <div class="form-td" style="gap: 1rem">
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
              <div class="col-3 form-td">
                <TableSearch
                  v-model:model-value="tableModel.search.inputFilter"
                  @clear-item="clearSearchItem"
                  @select-search-item="selectSearchItem"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      <!-- TableFilter 영역 -->
      <div class="row justify-end q-py-md">
        <div style="display: flex; gap: 1rem">
          <q-btn label="마스킹 해제"
                 v-if="!authStore.isMasking()"
            @click="unMask"
          />
          <q-btn label="excel 다운로드" @click="downloadList" />
          <q-btn label="조회" @click="selectSearchItem" />
        </div>
      </div>
    </template>
  </PageTable>
  <ReserveSearchEditModal
    v-model:show="showModal"
    :data-model="tableModel.filter"
    :options-model="filterOptions"
    :type="'attraction'"
    :title="'검색조건설정'"
    :reserveDayCode="reserveDayCode"
    @refresh-data="refreshData"
  />
  <OtpCheckModal
    v-model:show="showPassModal"
    :data-model="tableModel.filter"
    :options-model="filterOptions"
    :type="'attraction'"
    :title="'전화번호 선택'"
    @masking-update="maskingCheck"
  />
</template>

<script>
const getInitialSearch = () => ({
  inputFilter: ''
})

const getInitialFilter = () => ({
  type: '',
  reservationYn: {},
  boardingYn: {},
  reserveStartDt: {},
  reserveEndDt: {},
  reservationTimeRange: {},
  searchCondition: {}
})
</script>
<script setup>
import { inject, nextTick, onBeforeMount, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import DoubleDateInput from '@/components/input/DoubleDateInput.vue'
import ReserveSearchEditModal from '@/components/modal/ReserveSearchEditModal.vue'
import COMMON from '@/constants/commonConstatns.js'
import PageTable from '@/components/table/PageTable.vue'
import TableSearch from '@/components/table/TableSearch.vue'
import { useLayoutStore } from '@/stores/layout.js'
import FilterUtils from '@/utils/FilterUtils.js'
import TableUtils from '@/utils/TableUtils.js'
import DateUtils from '@/utils/DateUtils.js'
import { REGEX } from '@/constants/regualExpression.js'
import axios from 'axios'
import PasswordCheckModal from '@/components/modal/PasswordCheckModal.vue'
import { useAuthStore } from '@/stores/auth.js'
import OtpCheckModal from "@/components/modal/OtpCheckModal.vue";

const route = useRoute()
const router = useRouter()
const emitter = inject('emitter')
const layoutStore = useLayoutStore()

/** masking */
const authStore = useAuthStore()
const maskCheck = ref(false)
const showPassModal = ref(false)

const showModal = ref(false)
const filterOptions = ref({
  reservationTypeList: [],
  boardingTypeList: [],
  reservationTimeRangeList: [],
  searchKeywordList: []
})

const tableRef = ref(null)
const tableModel = ref({
  filter: getInitialFilter(),
  search: getInitialSearch(),
  selected: [],
  header: [
    {
      name: 'resvYn',
      label: '예약여부',
      field: 'resvYn',
      align: 'center',
      tooltip: false,
      format: (value) => {
        return value === 'Y' ? '예약' : '예약취소'
      }
    },
    {
      name: 'boardingYn',
      label: '탑승여부',
      field: 'boardingYn',
      align: 'center',
      tooltip: false,
      format: (value) => {
        return value === 'Y' ? '탑승' : '미탑승'
      }
    },
    {
      name: 'attrName',
      label: '어트랙션명',
      field: 'attrName',
      align: 'center',
      tooltip: false
    },
    {
      name: 'nickname',
      label: '예약자 닉네임',
      field: 'nickname',
      align: 'center',
      tooltip: false
    },
    {
      name: 'phoneNumber',
      label: '연락처',
      field: 'phoneNumber',
      align: 'center',
      tooltip: true,
      format: (value) => {
        return value.replace(REGEX.PHONE_NUM, '$1-$2-$3')
      }
    },
    {
      name: 'resvTimeRange',
      label: '예약시간대',
      field: 'resvTimeRange',
      align: 'center',
      tooltip: false
    },
    {
      name: 'resvDate',
      label: '예약일시',
      field: 'resvDate',
      align: 'center',
      tooltip: false
    },
    {
      name: 'boardingDate',
      label: '탑승일시',
      field: 'boardingDate',
      align: 'center',
      tooltip: false
    },
    {
      name: 'resvCancelDate',
      label: '예약취소일시',
      field: 'resvCancelDate',
      align: 'center',
      tooltip: false
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

const reserveDayCode = ref(null)

onBeforeMount(async () => {
  const { rowsPerPage, page } = route.query

  tableModel.value.filter = {
    ...tableModel.value.filter
  }

  tableModel.value.pagination = {
    ...tableModel.value.pagination,
    rowsPerPage: rowsPerPage ?? 15,
    page: Number(page ?? 1 - 1)
  }
})

onMounted(async () => {
  emitter.emit(COMMON.LOADING.SHOW)

  await filterSetting()
  await searchSetting()
  await nextTick(async () => {
    await tableRef.value.requestServerInteraction()
  })

  emitter.emit(COMMON.LOADING.HIDE)
})

const refreshData = async () => {
  await filterSetting()
  await searchSetting()
  await nextTick(async () => {
    await tableRef.value.requestServerInteraction()
  })
}

const filterSetting = async () => {
  const filterList = await operatingApi.getAttractionResvCode().then((res) => res.data)
  filterOptions.value = FilterUtils.parseFilterArray(filterList)
}

const searchSetting = async () => {
  await commonApi
    .adminSearchConditionInfoGet({ adminMenuSeq: layoutStore.selectedMenu.adminMenuSeq })
    .then((res) => {
      const response = res.data.searchCondition

      tableModel.value.filter = {
        ...response,
        reserveDt: DateUtils.convertDateType(response.reserveDt?.type)
      }

      reserveDayCode.value = response.reserveDt?.type
    })
}

const selectSearchItem = () => {
  // 검색
  // tableModel.value.search.inputFilter = {
  //   tableModel.value.search.inputFilter
  // }

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

  const tableRowResponse = await operatingApi.getAttractionResvList({
    ...FilterUtils.findSelectOptions(tableModel.value.filter),
    inputFilter: tableModel.value.search.inputFilter,
    reservationStartDate: tableModel.value.filter.reserveDt?.from,
    reservationEndDate: tableModel.value.filter.reserveDt?.to,
    page: page - 1,
    size: rowsPerPage,
    maskingRemovalYn: authStore.isMasking()
  }).catch((err) => {
    alert(err.message)
    emitter.emit(COMMON.LOADING.HIDE)
    return
  })

  if(tableRowResponse) {
    tableModel.value.rows = TableUtils.renderRow(
      tableRowResponse.data.content,
      tableModel.value.header
    )
    tableModel.value.pagination.page = page
    tableModel.value.pagination.rowsNumber = tableRowResponse.data.totalElements
  }
  emitter.emit(COMMON.LOADING.HIDE)
}

const downloadList = async () => {
  await unMask()
  if(!authStore.isMasking()) return
  emitter.emit(COMMON.LOADING.SHOW)

  const request = {
    ...FilterUtils.findSelectOptions(tableModel.value.filter),
    inputFilter: tableModel.value.search.inputFilter,
    reservationStartDate: tableModel.value.filter.reserveDt?.from,
    reservationEndDate: tableModel.value.filter.reserveDt?.to,
    maskingRemovalYn: authStore.isMasking()
    // page: tableModel.value.pagination.page - 1,
    // size: tableModel.value.pagination.rowsPerPage
  }

  await operatingApi
    .downloadAttractionReservationExcel(request, { format: 'blob' })
    .then((res) => {
      const contentDisposition = res.headers['content-disposition']
      const filename = contentDisposition?.split('filename=')[1].replace(/"/g, '')

      const blobUrl = window.URL.createObjectURL(res.data)

      const link = document.createElement('a')
      link.href = blobUrl

      link.setAttribute('download', filename)
      document.body.appendChild(link)
      link.click()
      window.URL.revokeObjectURL(blobUrl)

      emitter.emit(COMMON.LOADING.HIDE)
    })
    .catch(async err => {
      console.error('파일 다운로드 중 오류 발생: ', err)
    })
}


// watch(
//   () => layoutStore.lnbInfo,
//   (value) => {
//     layoutStore.pageMap.get(route.path)
//     searchSetting(layoutStore.pageMap.get(route.path))
//   })

const unMask = async() => {
  if(maskCheck.value) {
    alert('마스킹이 해제되어있습니다.')
    return
  }
  if(authStore.isMasking()) return
  showPassModal.value = true
}

const maskingCheck = (value) => {
  if(value) {
    refreshData()
  }
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
