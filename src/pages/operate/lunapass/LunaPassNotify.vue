<template>
  <PageTable
    ref="tableRef"
    v-model.trim="tableModel"
    :table-style="{
      height: '63vh'
    }"
    content-area-class="q-pb-sm"
    :selection="'multiple'"
    :row-key="'operatingDate'"
    @request="onRequest"
    class="q-pa-md"
    :on-top-options="false"
    :on-custom-pagination="false"
  >
    <template #filter-section>
      <div class="form">
        <div class="row">
          <div class="col-1 form-th">기간</div>
          <div class="col-4 form-td" style="gap: 0.5rem">
            <q-select
              v-model="tableModel.filter.year"
              :options="filterOptions.yearList"
              class="full-width"
              dense
              hide-bottom-space
              outlined
              @update:model-value="setMonthList"
            />
            <q-select
              v-model="tableModel.filter.month"
              :options="filterOptions.monthList"
              class="full-width"
              dense
              hide-bottom-space
              outlined
            />
          </div>
          <div class="col-1 form-th">구분</div>
          <div class="col-2 form-td">
            <q-select
              v-model="tableModel.filter.operatingYn"
              :options="filterOptions.operatingList"
              class="full-width"
              dense
              hide-bottom-space
              outlined
            />
          </div>
          <div class="col-2 form-td">
            <q-btn label="조회" @click="getNotify" />
          </div>
        </div>
      </div>
      <div class="text-bold q-my-md q-mb-md">선택한 항목 일괄수정</div>
      <div class="row q-mb-sm">
        <div class="col-1">
          <q-select
            v-model="tableModel.rows.type"
            :options="updateFilterOptions.typeList"
            :label="'선택하세요'"
            class="full-width"
            :disable="!tableModel.selected.length"
            dense
            hide-bottom-space
            outlined
            @update:model-value="(type) => selectTypeChange(type)"
          />
        </div>
      </div>
      <div class="q-py-md"></div>
    </template>
    <template #gubun="{ slotProps }">
      <!-- 오픈형태 -->
      <q-select
        v-model="slotProps.row.gubunName"
        :options="filterOptions.openTypeList"
        class="full-width"
        dense
        hide-bottom-space
        outlined
        disable
      />
    </template>
    <template #type="{ slotProps }">
      <!-- 구분 -->
      <q-select
        v-model="slotProps.row.typeNm"
        :options="filterOptions.typeList"
        class="full-width"
        dense
        hide-bottom-space
        outlined
        @update:model-value="handleTypeChange(slotProps.row)"
      />
    </template>
    <template #notice="{ slotProps }">
      <q-input
        v-model.trim="slotProps.row.notice"
        placeholder="공지사항 입력하세요."
        dense
        outlined
        :rules="[noticeText]"
        :style="
          typeof noticeText(slotProps.row.notice) !== 'string'
            ? 'padding-bottom: 0'
            : 'padding-bottom: 20px'
        "
      />
    </template>
    <template #bottom>
      <div class="row justify-end">
        <q-btn label="등록" @click="onRegist" />
      </div>
    </template>
  </PageTable>
  <RegistToast
    v-if="showToast"
    message="등록이 완료되었습니다!"
    :duration="3000"
    @hidden="
      () => {
        showToast = false
      }
    "
  />
</template>

<script>
const getInitialSearch = () => ({})
const getInitialFilter = () => ({
  year: '',
  month: '',
  operatingYn: ''
})
</script>
<script setup>
import { inject, nextTick, onBeforeMount, onMounted, ref } from 'vue'
import COMMON from '@/constants/commonConstatns.js'
import PageTable from '@/components/table/PageTable.vue'
import FilterUtils from '@/utils/FilterUtils.js'
import DateUtils from '@/utils/DateUtils.js'
import { operatingApi } from '@/service/api'
import RegistToast from '@/components/dialog/RegistToast.vue'

const emitter = inject('emitter')
const showToast = ref(false)
const filterOptions = ref({
  yearList: [],
  monthList: [],
  operatingList: [],
  typeList: [],
  openTypeList: []
})

const updateFilterOptions = ref({
  ...filterOptions.value
})

const tableRef = ref(null)
const tableModel = ref({
  filter: getInitialFilter(),
  search: getInitialSearch(),
  selected: [],
  filterAndSearchData: {},
  header: [
    {
      name: 'operatingDate',
      label: '일자',
      field: 'operatingDate',
      align: 'center',
      style: (val) => (val.day === '일' || val.day === '토' ? 'color: #FF0000' : ''),
      tooltip: false,
      headerStyle: 'width: 10rem'
    },
    {
      name: 'day',
      label: '요일',
      field: 'day',
      align: 'center',
      format: (val) => val + '요일',
      style: (val) => (val.day === '일' || val.day === '토' ? 'color: #FF0000' : ''),
      tooltip: false,
      headerStyle: 'width: 10rem'
    },
    {
      name: 'gubunName',
      label: '오픈형태',
      field: 'gubunName',
      align: 'center',
      slot: 'gubun',
      tooltip: false,
      headerStyle: 'width: 10rem'
    },
    {
      name: 'type',
      label: '구분',
      field: 'type',
      align: 'center',
      slot: 'type',
      tooltip: false,
      headerStyle: 'width: 10rem'
    },
    {
      name: 'notice',
      label: '공지사항',
      field: 'notice',
      align: 'center',
      slot: 'notice',
      tooltip: false
    }
  ],
  rows: [],
  pagination: {
    rowsNumber: 0
  }
})

const formattedDataList = ref([])
const isNoticeOk = ref(true)

const operatingNotice = ref(null)
const notOperatingNotice = ref(null)

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

const setMonthList = (year) => {
  const currentYear = new Date().getFullYear()
  if (year.value !== currentYear.toString()) {
    let monthList
    if (Number(year.value) === 2021) {
      // 최초데이터는 2021.03
      monthList = Array.from({ length: 10 }, (_, i) => ({
        label: `${i + 3}월`,
        value: `${i + 3}`
      }))
    } else {
      monthList = Array.from({ length: 12 }, (_, i) => ({
        label: `${i + 1}월`,
        value: `${i + 1}`
      }))
    }
    filterOptions.value.monthList = monthList
    tableModel.value.filter.month = monthList[0]
  } else {
    const monthList = Array.from({ length: 12 }, (_, i) => ({
      label: `${i + 1}월`,
      value: `${i + 1}`
    }))
    filterOptions.value.monthList = monthList
    tableModel.value.filter.month = monthList[0]
  }
}

const filterSetting = async () => {
  const isDecember = new Date().getMonth() === 11 // 12월은 getMonth() 값이 11
  const currentYear = new Date().getFullYear()
  const startYear = 2021
  const endYear = isDecember ? currentYear + 1 : currentYear
  const codeResponse = await operatingApi.lunarpassCodeListGet().then((res) => res.data)

  const filterList = {
    yearList: Array.from({ length: endYear - startYear + 1 }, (_, i) => ({
      dtlCdNm: `${endYear - i}년`,
      dtlCd: `${endYear - i}`
    })),
    monthList: Array.from({ length: 12 }, (_, i) => ({
      dtlCdNm: `${i + 1}월`,
      dtlCd: `${i + 1}`
    })),
    operatingList: [
      { dtlCdNm: '전체', dtlCd: 'ALL' },
      { dtlCdNm: '운영', dtlCd: 'Y' },
      { dtlCdNm: '미운영', dtlCd: 'N' }
    ],
    typeList: [
      { dtlCdNm: '운영', dtlCd: 'Y' },
      { dtlCdNm: '미운영', dtlCd: 'N' }
    ],
    openTypeList: codeResponse.openTypeList
  }

  filterOptions.value = FilterUtils.parseFilterArray(filterList)

  codeResponse.lunarpassNoticeTypeList.forEach((item) => {
    if (item.dtlCd === 'OPERATING') operatingNotice.value = item.dtlCdNm
    else if (item.dtlCd === 'NOT_OPERATING') notOperatingNotice.value = item.dtlCdNm
  })

  tableModel.value.filter.year = filterOptions.value.yearList.find(
    (item) => Number(item.value) === currentYear
  )

  tableModel.value.filter.month = filterOptions.value.monthList.find(
    (item) => Number(item.value) === DateUtils.getMonth()
  )
  tableModel.value.filter.operatingYn = filterOptions.value.operatingList[0]

  updateFilterOptions.value = JSON.parse(JSON.stringify(filterOptions.value))

  Object.keys(updateFilterOptions.value).forEach((key) => {
    updateFilterOptions.value[key].unshift({ label: '선택하세요', value: null })
    updateFilterOptions.value[key].shift() // 첫 번째 요소 제거
  })
}

/** TODO: 기획에는 없지만 필요할 기능일듯함 */
const resetTableFilter = () => {
  tableModel.value.filter = {}
  tableModel.value.filterAndSearchData = { ...tableModel.value.search.searchData }
}

const onRequest = async (props) => {
  emitter.emit(COMMON.LOADING.SHOW)

  const simplifiedData = Object.fromEntries(
    Object.entries(tableModel.value.filter)
      .filter(([_, item]) => item.value)
      .map(([key, item]) => [key, item.value])
  )

  const tableRowResponse = await operatingApi.operatingInfoGet({
    ...simplifiedData
  })

  tableModel.value.rows = tableRowResponse.data

  emitter.emit(COMMON.LOADING.HIDE)
}

const getNotify = async () => {
  await tableRef.value.requestServerInteraction()
}

const selectTypeChange = (type) => {
  tableModel.value.selected.forEach((selectedRow) => {
    const targetRow = tableModel.value.rows.find(row => row.operatingDate === selectedRow.operatingDate)
    if (targetRow) {
      targetRow.type = type.value
      targetRow.typeNm = type.label
      targetRow.notice = targetRow.type === 'Y' ? operatingNotice.value : notOperatingNotice.value
    }
  })
}

const handleTypeChange = (row) => {
  tableModel.value.rows.forEach((data, operatingDate) => {
    if (data.operatingDate === row.operatingDate) {
      tableModel.value.rows[operatingDate].type = row.typeNm.value
      tableModel.value.rows[operatingDate].typeNm = row.typeNm.label
      tableModel.value.rows[operatingDate].notice =
        tableModel.value.rows[operatingDate].type === 'Y' ? operatingNotice.value : notOperatingNotice.value
    }
  })
}

const noticeText = (notice) => {
  if (!notice) return true

  isNoticeOk.value = true
  const trimmedLength = notice.replace(/\s+/g, '').length
  if (trimmedLength > 20) {
    isNoticeOk.value = false
    return '공백 제외 20자까지만 입력 가능합니다.'
  } else {
    return true
  }
}

const onRegist = async () => {
  if (!isNoticeOk.value) {
    const problemList = []
    tableModel.value.rows.forEach((value) => {
      const trimmedLength = String(value.notice).replace(/\s+/g, '').length
      if (trimmedLength > 20) problemList.push(value.operatingDate)
    })

    alert(`[${problemList}]의 공지사항이 20자 이상입니다!\n수정 후 다시 시도해주세요.`)
    return
  }

  setRequestData()

  await operatingApi.updateOperatingInfo(formattedDataList.value)
  await tableRef.value.requestServerInteraction()

  showToast.value = true
}

const setRequestData = () => {
  formattedDataList.value = []

  tableModel.value.rows.forEach((value) => {
    const type = value.type !== null ? (value.type === 'Y' ? 'OPERATING' : 'NOT_OPERATING') : null

    formattedDataList.value.push({
      date: value.operatingDate,
      type: type,
      notice: value.notice
    })
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
