<template>
  <PageTable
    ref="tableRef"
    v-model.trim="tableModel"
    class="q-pa-md"
    :selection="'multiple'"
    :row-key="'pushInfoSeq'"
    :virtual-idx="true"
    :table-style="{ height: '63vh' }"
    content-area-class="q-pb-sm"
    @request="onRequest"
    @row-click="goEdit"
    @row-btn-click="goDetail"
  >
    <template #filter-section>
      <div class="form">
        <div class="row items-center q-gutter-sm">
          <!-- 포함한 단어 (label) -->
          <div class="col-1 form-th">포함한 단어</div>

          <!-- 체크박스들 -->
          <div class="col-auto">
            <q-checkbox v-model="tableModel.search.useTitle" label="제목" dense />
          </div>

          <div class="col-auto">
            <q-checkbox v-model="tableModel.search.useContent" label="내용" dense />
          </div>

          <!-- 검색어 입력창 -->
          <div class="col-4">
            <q-input
              v-model.trim="tableModel.search.keyword"
              placeholder="검색어를 입력하세요. (최대 30자)"
              dense
              outlined
              full-width
              maxlength="30"
            />
          </div>
        </div>
        <div class="row">
          <div class="col-1 form-th">발송상태</div>
          <div class="col-4 form-td">
            <q-select
              v-model="tableModel.filter.sendStatus"
              :options="filterOptions.sendStatusList"
              class="full-width"
              dense
              hide-bottom-space
              outlined
            />
          </div>
          <div class="col-1 form-th">수신대상자</div>
          <div class="col-4 form-td">
            <q-select
              v-model="tableModel.filter.recipientType"
              :options="filterOptions.recipientTypeList"
              class="full-width"
              dense
              hide-bottom-space
              outlined
            />
          </div>
        </div>
        <div class="row">
          <div class="col-1 form-th">마케팅 광고 여부</div>
          <div class="col-4 form-td">
            <q-select
              v-model="tableModel.filter.marketingYn"
              :options="filterOptions.marketingYnList"
              class="full-width"
              dense
              hide-bottom-space
              outlined
            />
          </div>
          <div class="col-1 form-th">발송주기</div>
          <div class="col-4 form-td">
            <q-select
              v-model="tableModel.filter.sendCycleType"
              :options="filterOptions.sendCycleTypeList"
              class="full-width"
              dense
              hide-bottom-space
              outlined
            />
          </div>
        </div>
        <div class="row">
          <div class="col-1 form-th">발송일</div>
          <div class="col-4 form-td">
            <DoubleDateInput v-model="tableModel.filter.sendDt" />
          </div>
          <div class="col-1 form-th">등록일</div>
          <div class="col-4 form-td">
            <DoubleDateInput v-model="tableModel.filter.regDt" />
          </div>
        </div>
      </div>
      <div class="row q-py-md justify-end q-gutter-md">
        <q-btn v-if="!authStore.isMasking()" label="마스킹 해제" @click="unMask" />
        <q-btn label="조회" @click="selectSearchItem" />
        <q-btn style="background-color: #169bd5; color: white" label="등록" @click="goReg" />
      </div>
      <!--      <div class="q-py-md" />-->
      <div class="row q-mb-sm" style="gap: 0.5rem">
        <div>
          <q-btn label="삭제" class="full-width" @click="onDelete" />
        </div>
      </div>
    </template>
  </PageTable>
  <OtpCheckModal
    v-model:show="showPassModal"
    :data-model="tableModel.filter"
    :options-model="filterOptions"
    :type="'attraction'"
    :title="'전화번호 선택'"
  />
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
  inputFilter: '',
  useTitle: false,
  useContent: false,
  keyword: ''
})

const getInitialFilter = () => ({
  sendStatus: {},
  sendCycleType: {},
  marketingYn: {},
  recipientType: {},
  sendDt: {},
  regDt: {},
  maskingYn: false,
  maskingPassword: ''
})
</script>
<script setup>
import { inject, nextTick, onBeforeMount, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import COMMON from '@/constants/commonConstatns.js'
import PageTable from '@/components/table/PageTable.vue'
import TableSearch from '@/components/table/TableSearch.vue'
import { operatingApi, pushApi, sitemanagementApi } from '@/service/api'
import FilterUtils from '@/utils/FilterUtils.js'
import DoubleDateInput from '@/components/input/DoubleDateInput.vue'
import TableUtils from '@/utils/TableUtils.js'
import { ary } from 'lodash-es'
import PasswordCheckModal from '@/components/modal/PasswordCheckModal.vue'
import { useAuthStore } from '@/stores/auth.js'
import RegistToast from '@/components/dialog/RegistToast.vue'
import OtpCheckModal from '@/components/modal/OtpCheckModal.vue'

const route = useRoute()
const router = useRouter()
const emitter = inject('emitter')

/** masking */
const authStore = useAuthStore()
const maskCheck = ref(false)
const showPassModal = ref(false)

const showToast = ref(false)
const toastMessage = ref('')
const toastStatus = ref('success')

const filterOptions = ref({
  sendStatusList: [],
  recipientTypeList: [],
  marketingYnList: [
    { label: '전체', value: null },
    { label: 'Y', value: 'Y' },
    { label: 'N', value: 'N' }
  ]
})

const tableRef = ref(null)
const tableModel = ref({
  filter: getInitialFilter(),
  search: getInitialSearch(),
  selected: [],
  filterAndSearchData: {},
  header: [
    {
      name: 'sendStatus',
      label: '발송상태',
      field: 'sendStatus',
      align: 'center',
      format: (value) => {
        const status =
          filterOptions.value.sendStatusList.find((item) => item.value === value)?.label || value
        return status !== '-' ? status : '대기'
      }
    },
    {
      name: 'recipientTypeName',
      label: '수신대상자',
      field: 'recipientTypeName',
      align: 'center'
    },
    {
      name: 'title',
      label: '제목',
      field: 'title',
      align: 'center',
      headerStyle: 'min-width: 150px'
    },
    {
      name: 'sendCycleType',
      label: '발송주기',
      field: 'sendCycleType',
      align: 'center',
      format: (value) => {
        const status =
          filterOptions.value.sendCycleTypeList.find((item) => item.value === value)?.label || value
        return status !== '-' ? status : 'N'
      }
    },
    {
      name: 'sendDate',
      label: '발송일시',
      field: 'sendDate',
      align: 'center',
      headerStyle: 'min-width: 100px'
    },
    {
      name: 'regDate',
      label: '등록일',
      field: 'regDate',
      align: 'center'
    },
    {
      name: 'regAdminName',
      label: '등록자',
      field: 'regAdminName',
      align: 'center'
    },
    {
      name: 'marketingYn',
      label: '마케팅 광고 여부',
      field: 'marketingYn',
      align: 'center',
      format: (value) => {
        const status =
          filterOptions.value.sendStatusList.find((item) => item.value === value)?.label || value
        return status !== '-' ? status : 'N'
      },
      headerStyle: 'max-width: 8rem'
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

  await filterSetting()
  //await searchSetting()
  await nextTick(async () => {
    await tableRef.value.requestServerInteraction()
  })

  emitter.emit(COMMON.LOADING.HIDE)
})

const filterSetting = async () => {
  const filterList = await pushApi.getPushInfoListCode().then((res) => res.data)
  filterOptions.value = FilterUtils.parseFilterArray(filterList)
  filterOptions.value.marketingYnList = [
    { label: '전체', value: 'ALL' },
    { label: 'Y', value: 'Y' },
    { label: 'N', value: 'N' }
  ]

  const query = new URLSearchParams(window.location.search)

  const sendStatus = filterOptions.value.sendStatusList.find(
    (item) => item.value === query.get('sendStatus')
  )
  const recipientType = filterOptions.value.recipientTypeList.find(
    (item) => item.value === query.get('recipientType')
  )
  const marketingYn = filterOptions.value.marketingYnList.find(
    (item) => item.value === query.get('marketingYn')
  )
  const sendCycleType = filterOptions.value.sendCycleTypeList.find(
    (item) => item.value === query.get('sendCycleType')
  )
  const inputFilter = query.get('inputFilter')
  const page = Number(query.get('page'))
  const size = Number(query.get('size'))

  tableModel.value.filter = {
    sendStatus: sendStatus ?? filterOptions.value.sendStatusList[0],
    recipientType: recipientType ?? filterOptions.value.recipientTypeList[0],
    marketingYn: marketingYn ?? filterOptions.value.marketingYnList[0],
    sendCycleType: sendCycleType ?? filterOptions.value.sendCycleTypeList[0],
    maskingYn: false,
    maskingPassword: ''
  }
  tableModel.value.search.inputFilter = inputFilter ?? tableModel.value.search.inputFilter
  tableModel.value.pagination.page = page === 0 ? tableModel.value.pagination.page : page
  tableModel.value.pagination.rowsPerPage =
    size === 0 ? tableModel.value.pagination.rowsPerPage : size

  if (query.get('regFrom') && query.get('regTo')) {
    tableModel.value.filter.regDt = {
      from: query.get('regFrom'),
      to: query.get('regTo')
    }
  }

  if (query.get('sendFrom') && query.get('sendTo')) {
    tableModel.value.filter.sendDt = {
      from: query.get('sendFrom'),
      to: query.get('sendTo')
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

const onRequest = async (_props) => {
  emitter.emit(COMMON.LOADING.SHOW)

  const searchParams = {
    ...FilterUtils.findSelectOptions(tableModel.value.filter),
    inputFilter: tableModel.value.search.inputFilter,
    regStartDate: tableModel.value.filter.regDt?.from,
    regEndDate: tableModel.value.filter.regDt?.to,
    sendStartDate: tableModel.value.filter.sendDt?.from,
    sendEndDate: tableModel.value.filter.sendDt?.to,
    page: tableModel.value.pagination.page - 1,
    size: tableModel.value.pagination.rowsPerPage
  }

  if (tableModel.value.search.useTitle) {
    searchParams.title = tableModel.value.search.keyword
  }
  if (tableModel.value.search.useContent) {
    searchParams.content = tableModel.value.search.keyword
  }

  const tableRowResponse = await pushApi.getPushInfoList(searchParams)

  tableModel.value.rows = TableUtils.renderRow(
    tableRowResponse.data.content,
    tableModel.value.header
  )
  tableModel.value.pagination.page = tableRowResponse.data.pageable.pageNumber + 1
  tableModel.value.pagination.rowsPerPage = tableRowResponse.data.pageable.pageSize
  tableModel.value.pagination.rowsNumber = tableRowResponse.data.totalElements
  setShowButton()

  const query = TableUtils.querySetting({
    filter: tableModel.value.filter,
    inputFilter: tableModel.value.search.inputFilter,
    regDate: tableModel.value.filter.regDt,
    sendDate: tableModel.value.filter.sendDt,
    page: tableModel.value.pagination.page,
    size: tableModel.value.pagination.rowsPerPage
  })
  router.replace({ query })

  emitter.emit(COMMON.LOADING.HIDE)
}

const setShowButton = () => {
  tableModel.value.rows.forEach((row) => {
    if (
      row.sendStatus === 'SCHEDULE' ||
      row.sendStatus === 'COMPLETE' ||
      row.sendStatus === 'CANCEL'
    ) {
      if (row.recipientType !== 'VISITOR') {
        row.showButton = true
      } else {
        row.showButton = false
      }
    } else row.showButton = false
  })
}

const goReg = () => {
  if (tableModel.value.filter.maskingYn === true) {
    if (tableModel.value.filter.maskingPassword === '') {
      alert('비밀번호 입력부탁드립니다.')
      return
    }
    sitemanagementApi
      .verifyAdminPassword({
        nowPassword: tableModel.value.filter.maskingPassword
      })
      .then((res) => {
        res.data ? goRegAlarm() : alert('현재 비밀번호가 일치하지 않습니다.')
      })
      .catch((err) => {
        alert(err.message)
      })
  } else {
    goRegAlarm()
  }
}

const goRegAlarm = () => {
  router.push({
    name: 'AlarmEdit',
    state: {
      maskingYn: tableModel.value.filter.maskingYn,
      maskingPassword: tableModel.value.filter.maskingPassword
    }
  })
}

const goEdit = (event, target) => {
  if (tableModel.value.filter.maskingYn === true) {
    if (tableModel.value.filter.maskingPassword === '') {
      alert('비밀번호 입력부탁드립니다.')
      return
    }
    sitemanagementApi
      .verifyAdminPassword({
        nowPassword: tableModel.value.filter.maskingPassword
      })
      .then((res) => {
        res.data ? goAlarmEdit(target) : alert('현재 비밀번호가 일치하지 않습니다.')
      })
      .catch((err) => {
        alert(err.message)
        return
      })
  } else {
    goAlarmEdit(target)
  }
}

const goAlarmEdit = (target) => {
  router.push({
    name: 'AlarmEdit',
    query: { id: target.pushInfoSeq },
    state: {
      maskingYn: tableModel.value.filter.maskingYn,
      maskingPassword: tableModel.value.filter.maskingPassword
    }
  })
}

const goDetail = (event, target) => {
  if (tableModel.value.filter.maskingYn === true) {
    if (tableModel.value.filter.maskingPassword === '') {
      alert('비밀번호 입력부탁드립니다.')
      return
    }
    sitemanagementApi
      .verifyAdminPassword({
        nowPassword: tableModel.value.filter.maskingPassword
      })
      .then((res) => {
        res.data ? goAlarmDetail(target) : alert('현재 비밀번호가 일치하지 않습니다.')
      })
      .catch((err) => {
        alert(err.message)
        return
      })
  } else {
    goAlarmDetail(target)
  }
}

const goAlarmDetail = (target) => {
  router.push({
    name: 'AlarmDetail',
    query: { id: target.pushInfoSeq },
    state: {
      maskingYn: tableModel.value.filter.maskingYn,
      maskingPassword: tableModel.value.filter.maskingPassword
    }
  })
}

const unMask = () => {
  if (maskCheck.value) {
    alert('마스킹이 해제되어있습니다.')
    return
  }
  showPassModal.value = true
}

const onDelete = async () => {
  // 다건 삭제 처리
  const confirmChange = confirm('선택한 데이터를 일괄 삭제하시겠습니까?')

  if (confirmChange) {
    if (tableModel.value.selected.length === 0) {
      alert('선택된 항목이 없습니다.')
      return
    }
    // 값 복사
    const data = []

    tableModel.value.selected.forEach((item) => {
      const updatedItem = { pushInfoSeq: item.pushInfoSeq }
      data.push(updatedItem)
    })

    await pushApi
      .deletePushInfoList(data)
      .then(async (res) => {
        toastMessage.value = '삭제 완료되었습니다!'
        toastStatus.value = 'success'
        showToast.value = true

        // 체크박스 선택 초기화
        tableModel.value.selected = []

        // 삭제 후 첫 페이지로 초기화
        await tableRef.value.requestServerInteraction({
          pagination: {
            page: tableModel.value.pagination.page > 0 ? tableModel.value.pagination.page : 1, // 0이면 강제 1로 설정
            rowsPerPage: tableModel.value.pagination.rowsPerPage
          }
        })
      })
      .catch((err) => {
        toastMessage.value = '삭제 실패했습니다!(에러코드:' + err.code + ')'
        toastStatus.value = 'failed'
        showToast.value = true
      })
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
