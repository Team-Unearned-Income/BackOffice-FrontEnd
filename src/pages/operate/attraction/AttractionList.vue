<template>
  <PageTable
    ref="tableRef"
    v-model.trim="tableModel"
    :table-style="{
      minHeight: '63vh'
    }"
    content-area-class="q-pb-sm"
    @request="onRequest"
    class="q-pa-md"
    :selection="'multiple'"
    :row-key="'attrIdx'"
    :virtual-idx="true"
    @row-click="(event, row) => goDetail(event, row)"
    :on-custom-pagination="false"
    :on-top-pagination-options="false"
  >
    <template #filter-section>
      <div class="form">
        <div class="row">
          <div class="col-1 form-th">운영여부</div>
          <div class="col-4 form-td">
            <q-select
              v-model="tableModel.filter.operatingYn"
              :options="filterOptions.operatingStatusList"
              class="full-width"
              dense
              hide-bottom-space
              outlined
            />
          </div>
          <div class="col-1 form-th">루나패스</div>
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
          <div class="col-1 form-th">대기상태</div>
          <div class="col-4 form-td">
            <q-select
              v-model="tableModel.filter.waitingStatus"
              :options="filterOptions.waitingStatusList"
              class="full-width"
              dense
              hide-bottom-space
              outlined
            />
          </div>
          <div class="col-1 form-th">검색어</div>
          <div class="col-4 form-td">
            <TableSearch
              v-model:model-value="tableModel.search.inputFilter"
              class="full-width"
              placeholder="어트랙션명을 입력 하신 후 엔터를 누르세요."
              @clear-item="clearSearchItem"
              @select-search-item="selectSearchItem"
            />
          </div>
        </div>
        <div class="row">
          <div class="col-1 form-th">체험시설 여부</div>
          <div class="col-4 form-td">
            <q-select
              v-model="tableModel.filter.experienceFacilityYn"
              :options="filterOptions.experienceFacilityYnList"
              class="full-width"
              dense
              hide-bottom-space
              outlined
            />
          </div>
        </div>
      </div>
      <div class="row q-py-md justify-end">
        <q-btn label="조회" @click="selectSearchItem" />
      </div>
      <q-separator class="q-my-md" />
      <div class="text-bold q-mb-md">선택한 항목 일괄수정</div>
      <div class="form-td q-mb-sm" style="max-width: 33.5rem">
        <DoubleTimeInput
          ref="timeInputRef"
          @update:model-value="
            (value) => {
              updateTime.startTime = value.startTime
              updateTime.endTime = value.endTime
            }
          "
        />
      </div>
      <div class="row q-mb-sm" style="gap: 0.5rem">
        <div style="width: 8rem">
          <q-select
            v-model="bottomFilter.operatingStatus"
            :options="updateFilterOptions.operatingStatusList"
            dense
            hide-bottom-space
            label="운영여부"
            outlined
          />
        </div>
        <div style="width: 8rem">
          <q-select
            v-model="bottomFilter.waitingStatus"
            :options="updateFilterOptions.waitingStatusList"
            dense
            hide-bottom-space
            label="대기상태"
            outlined
          />
        </div>
        <div style="width: 8rem">
          <q-select
            v-model="bottomFilter.bookingStatus"
            :options="updateFilterOptions.bookingStatusList"
            dense
            hide-bottom-space
            label="루나패스"
            outlined
          />
        </div>
        <div>
          <q-btn label="저장" @click="onRegist" class="full-width" />
        </div>
      </div>
    </template>
    <!-- <template #bottom> </template> -->
  </PageTable>
  <!-- <OperatingTimeModal
    v-model:show="showModal"
    :title="'운영시간 일괄변경'"
    @update:model-value="
      (value) => {
        updateTime.startTime = value.operatingStartTime
        updateTime.endTime = value.operatingEndTime
      }
    "
  /> -->
  <RegistToast
    v-if="showToast"
    :message="toastMessage"
    :status="toastStatus"
    :duration="3000"
    @hidden="
      () => {
        showToast = false
      }
    "
  />
</template>

<script>
const getInitialSearch = () => ({
  inputFilter: ''
})

const getInitialFilter = () => ({
  type: '',
  operatingYn: {},
  lunarpass: {},
  waitingStatus: {},
  experienceFacilityYn: {}
})
</script>
<script setup>
import { inject, nextTick, onBeforeMount, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import COMMON from '@/constants/commonConstatns.js'
import PageTable from '@/components/table/PageTable.vue'
import TableSearch from '@/components/table/TableSearch.vue'
import { operatingApi } from '@/service/api'
import FilterUtils from '@/utils/FilterUtils.js'
import TableUtils from '@/utils/TableUtils.js'
// import OperatingTimeModal from '@/components/modal/OperatingTimeModal.vue'
import DoubleTimeInput from '@/components/input/DoubleTimeInput.vue'
import RegistToast from '@/components/dialog/RegistToast.vue'

const route = useRoute()
const router = useRouter()
const emitter = inject('emitter')
const showModal = ref(false)

const showToast = ref(false)
const toastMessage = ref('')
const toastStatus = ref(false)

const filterOptions = ref({
  operatingStatusList: [],
  bookingStatusList: [],
  waitingStatusList: [],
  experienceFacilityYnList: []
})

const updateFilterOptions = ref({
  ...filterOptions.value
})

const bottomFilter = ref({
  operatingStatus: null,
  bookingStatus: null,
  waitingStatus: null
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
      tooltip: false,
      format: (value) => {
        return value === 'Y' ? '게시' : '미게시'
      }
    },
    {
      name: 'nameKor',
      label: '어트랙션명',
      field: 'nameKor',
      align: 'center',
      tooltip: false,
      headerStyle: 'min-width: 10rem',
      format: (value, obj) => {
        const labels = [
          obj.experienceFacilityYn === 'Y' && labelTemplate('체험시설', '#0946FF'),
          obj.kidsYn === 'Y' && labelTemplate('키즈전용', '#2e2d2d')
        ]
          .filter(Boolean)
          .join('')

        return labels + value
      }
    },
    {
      name: 'operatingTime',
      label: '운영시간',
      field: 'operatingTime',
      align: 'center',
      tooltip: false,
      headerStyle: 'min-width: 70px'
    },
    {
      name: 'operatingStatus',
      label: '운영여부',
      field: 'operatingStatus',
      tooltip: false,
      align: 'center'
    },
    {
      name: 'bookingStatus',
      label: '루나패스',
      field: 'bookingStatus',
      tooltip: false,
      align: 'center',
      format: (value, obj) => (obj.experienceFacilityYn === 'Y' ? '-' : value)
    },
    {
      name: 'waitingStatus',
      label: '대기상태',
      field: 'waitingStatus',
      tooltip: false,
      align: 'center',
      format: (value, obj) => (obj.experienceFacilityYn === 'Y' ? '-' : value)
    },
    {
      name: 'maxTeam',
      label: '정원(팀/30\')',
      field: 'maxTeam',
      tooltip: false,
      align: 'center'
    }
    // {
    //   name: 'orderSeq',
    //   label: '순서',
    //   field: 'orderSeq',
    //   align: 'center',
    //   tooltip: false,
    //   headerStyle: 'max-width: 20px',
    //   swap: true
    // }
  ],
  rows: [],
  pagination: {
    // sortBy: '',
    // descending: false,
    page: 1 - 1,
    rowsPerPage: 15,
    rowsNumber: 0
  }
})

const timeInputRef = ref(null)
const updateTime = ref({
  startTime: null,
  endTime: null
})

// td 안에 label이 필요할 떄 사용
const labelTemplate = (label, color) => `
  <span style="display: inline-flex; align-items: center; justify-content: center; line-height: 0.7rem; border: 1px solid ${color}; font-size: 0.7rem; color: ${color}; padding: 0.2rem; margin-right: 0.2rem">
    ${label}
  </span>
`

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

  await filterSetting()
  await nextTick(async () => {
    await tableRef.value.requestServerInteraction()
  })

  emitter.emit(COMMON.LOADING.HIDE)
})

const filterSetting = async () => {
  const filterList = await operatingApi.getAttractionCode().then((res) => res.data)
  filterOptions.value = FilterUtils.parseFilterArray(filterList)

  const query = new URLSearchParams(window.location.search)
  const operatingYn = filterOptions.value.operatingStatusList.find(
    (item) => item.value === query.get('operatingYn')
  )
  const lunarpass = filterOptions.value.bookingStatusList.find(
    (item) => item.value === query.get('lunarpass')
  )
  const waitingStatus = filterOptions.value.waitingStatusList.find(
    (item) => item.value === query.get('waitingStatus')
  )
  const experienceFacilityYn = filterOptions.value.experienceFacilityYnList.find(
    (item) => item.value === query.get('experienceFacilityYn')
  )

  tableModel.value.filter = {
    operatingYn: operatingYn ?? filterOptions.value.operatingStatusList[0],
    lunarpass: lunarpass ?? filterOptions.value.bookingStatusList[0],
    waitingStatus: waitingStatus ?? filterOptions.value.waitingStatusList[0],
    experienceFacilityYn: experienceFacilityYn ?? filterOptions.value.experienceFacilityYnList[0]
  }

  updateFilterOptions.value = JSON.parse(JSON.stringify(filterOptions.value))

  Object.keys(updateFilterOptions.value).forEach((key) => {
    updateFilterOptions.value[key].shift() // 첫 번째 요소 제거
    updateFilterOptions.value[key].unshift({ label: '선택하세요', value: null })
  })

  bottomFilter.value = {
    operatingStatus: updateFilterOptions.value.operatingStatusList[0],
    bookingStatus: updateFilterOptions.value.bookingStatusList[0],
    waitingStatus: updateFilterOptions.value.waitingStatusList[0]
  }
}

const selectSearchItem = async () => {
  // 검색
  tableModel.value.search.searchData = {
    inputFilter: tableModel.value.search.inputFilter
  }

  tableModel.value.pagination.page = 1 - 1

  await tableRef.value.requestServerInteraction()
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

  const tableRowResponse = await operatingApi.getAttractionList({
    ...FilterUtils.findSelectOptions(tableModel.value.filter),
    inputFilter: tableModel.value.search.inputFilter
    // page: page - 1,
    // size: rowsPerPage
  })

  if (tableRowResponse.success) {
    tableModel.value.rows = TableUtils.renderRow(tableRowResponse.data, tableModel.value.header)
    tableModel.value.pagination.rowsNumber = tableRowResponse.data.length
  } else {
    console.log('어트랙션 목록을 조회하는데 실패했습니다.')
  }

  const query = TableUtils.querySetting({
    filter: tableModel.value.filter,
    inputFilter: tableModel.value.search.inputFilter,
    page: null,
    size: null
  })
  router.replace({ query })

  emitter.emit(COMMON.LOADING.HIDE)
}

const onRegist = async () => {
  // 요소들 수정 로직
  const confirmChange = confirm('선택한 데이터를 일괄 변경하시겠습니까?')

  const nonNullEntries = Object.entries(bottomFilter.value).filter(([key, value]) => value !== null)

  if (confirmChange) {
    if (tableModel.value.selected.length === 0) {
      alert('선택된 항목이 없습니다.')
      return
    }
    // 값 복사
    const data = []

    tableModel.value.selected.forEach((item) => {
      const updatedItem = { attrIdx: item.attrIdx }

      nonNullEntries.forEach(([key, value]) => {
        updatedItem[key] = key === 'maxTeam' ? Number(value) : value.value
      })

      updatedItem.operatingStartTime = updateTime.value.startTime ?? null
      updatedItem.operatingEndTime = updateTime.value.endTime ?? null

      data.push(updatedItem)
    })

    await operatingApi
      .updateAttractionList(data)
      .then(async (res) => {
        toastMessage.value = '조회되었습니다!'
        toastStatus.value = 'success'
        showToast.value = true

        // 일괄변경 필터 초기화
        tableModel.value.selected = []
        bottomFilter.value = {
          operatingStatus: updateFilterOptions.value.operatingStatusList[0],
          bookingStatus: updateFilterOptions.value.bookingStatusList[0],
          waitingStatus: updateFilterOptions.value.waitingStatusList[0]
        }

        Object.keys(updateTime.value).forEach((key) => {
          updateTime.value[key] = null
        })
        timeInputRef.value.resetTime()

        await tableRef.value.requestServerInteraction()
      })
      .catch((err) => {
        toastMessage.value = tableModel.value.selected.every(
          (item) => item.experienceFacilityYn === 'Y'
        )
          ? '체험시설의 경우 운영여부만 수정 가능합니다'
          : err.message
        toastStatus.value = 'failed'
        showToast.value = true
      })
  }
}

const goDetail = (event, row) => {
  event.preventDefault()
  router.push({ name: 'AttractionDetail', query: { attrIdx: row.attrIdx } })
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
