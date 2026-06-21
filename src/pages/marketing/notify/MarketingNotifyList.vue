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
    @update-checkbox="onRequestAppPostUpdate"
    @update-order="onChangeOrder"
  >
    <template #filter-section>
      <div class="form">
        <div class="row">
          <div class="col-1 form-th">게시상태</div>
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
          <div class="col-1 form-th">공지상태</div>
          <div class="col-4 form-td">
            <q-select
              v-model="tableModel.filter.noticeYn"
              :options="filterOptions.postTypeList"
              class="full-width"
              dense
              hide-bottom-space
              outlined
            />
          </div>
        </div>
        <div v-if="tabRef === 'cmsNotice'" class="row">
          <div class="col-1 form-th">등록일</div>
          <div class="col-4 form-td">
            <DateInput
              v-model="tableModel.filter.regStartDate"
            />
            <p style="margin: 0 10px;">~</p>
            <DateInput
              v-model="tableModel.filter.regEndDate"
            />
          </div>
          <div class="col-1 form-th">앱 노출</div>
          <div class="col-4 form-td">
            <q-select
              v-model="tableModel.filter.appPostYn"
              :options="filterOptions.appPostYnList"
              class="full-width"
              dense
              hide-bottom-space
              outlined
            />
          </div>
        </div>
        <div v-else class="row">
          <div class="col-1 form-th">등록일</div>
          <div class="col-4 form-td">
            <DateInput
              v-model="tableModel.filter.regStartDate"
            />
            <p style="margin: 0 10px;">~</p>
            <DateInput
              v-model="tableModel.filter.regEndDate"
            />
          </div>
          <div class="col-1 form-th">검색어</div>
          <div class="col-4 form-td">
            <TableSearch
              v-model:model-value="tableModel.search.inputFilter"
              style="width: 100%"
              placeholder="제목을 입력 하신 후 엔터를 누르세요."
              @clear-item="clearSearchItem"
              @select-search-item="selectSearchItem"
            />
          </div>
        </div>
      </div>
      <div class="row q-py-md justify-end q-gutter-md">
        <q-btn label="조회" @click="selectSearchItem" />
        <q-btn label="등록" @click="createNotify" />
      </div>
      <div class="row" style="border-bottom: 1px solid #dbdbdb">
        <q-tabs
          v-model="tabRef"
          dense
          class="text-grey"
          active-color="black"
          indicator-color="black"
          narrow-indicator
          @update:model-value="handleFilter"
        >
          <q-tab :name="'userScreen'" :label="'사용자 화면'" />
          <q-tab :name="'cmsNotice'" :label="'일반 공지사항'" />
          <q-tab :name="'appNotice'" :label="'앱 전용 공지사항'" />
        </q-tabs>
      </div>
    </template>
  </PageTable>
  <RegistToast
    v-if="showToast"
    :message="toastMessage"
    :duration="3000"
    :status="toastStatus"
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
  postYn: {},
  noticeYn: {},
  appPostYn: {},
  cmsYn: {},
  regEndDate: '',
  regStartDate: ''
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
import TableUtils from '@/utils/TableUtils.js'
import { userScreenNoticeHeader, cmsNoticeHeader, appNoticeHeader } from './HeaderList'
import DateInput from '@/components/input/DateInput.vue'
import RegistToast from "@/components/dialog/RegistToast.vue";

const route = useRoute()
const router = useRouter()
const emitter = inject('emitter')

/** Toast 관련 */
const showToast = ref(false)
const toastMessage = ref(null)
const toastStatus = ref('success')

const filterOptions = ref({
  postTypeList: [],
  cmsYnList: [],
  appPostYnList: []
})

const tableRef = ref(null)
const header = ref(userScreenNoticeHeader)

const tabRef = ref(null)

const tableModel = ref({
  filter: getInitialFilter(),
  search: getInitialSearch(),
  selected: [],
  filterAndSearchData: {},
  header: header,
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
  tabRef.value = 'userScreen'
  const filterList = await marketingApi.getNoticeCode().then((res) => res.data)
  filterOptions.value = FilterUtils.parseFilterArray(filterList)

  filterOptions.value.cmsYnList = [
    {
      label: 'userScreen',
      value: 'ALL'
    },
    {
      label: 'cms',
      value: 'Y'
    },
    {
      label: 'app',
      value: 'N'
    }
  ]

  const query = new URLSearchParams(window.location.search)

  const cmsYn = filterOptions.value.cmsYnList.find((item) => item.value === query.get('cmsYn'))
  const postYn = filterOptions.value.postTypeList.find((item) => item.value === query.get('postYn'))
  const noticeYn = filterOptions.value.postTypeList.find(
    (item) => item.value === query.get('noticeYn')
  )
  const appPostYn = filterOptions.value.appPostYnList.find((item) => item.value === query.get('appPostYn'))
  const inputFilter = query.get('inputFilter')
  const page = Number(query.get('page'))
  const size = Number(query.get('size'))

  tableModel.value.filter = {
    cmsYn: cmsYn ?? filterOptions.value.cmsYnList[0],
    postYn: postYn ?? filterOptions.value.postTypeList[0],
    noticeYn: noticeYn ?? filterOptions.value.postTypeList[0]
  }

  tableModel.value.search.inputFilter = inputFilter ?? tableModel.value.search.inputFilter
  tableModel.value.pagination.page = page ?? tableModel.value.pagination.page
  tableModel.value.pagination.rowsPerPage = size ?? tableModel.value.pagination.rowsPerPage

  if (query.get('regStartDate') && query.get('regEndDate')) {
    tableModel.value.filter.regDt = {
      from: query.get('regStartDate'),
      to: query.get('regEndDate')
    }
  }

  if (query.get('tab')) {
    tabRef.value = query.get('tab')
    if (tabRef.value === 'userScreen') {
      header.value = userScreenNoticeHeader
    } else if (tabRef.value === 'cmsNotice') {
      tableModel.value.filter = {
        ...tableModel.value.filter,
        appPostYn: appPostYn ?? filterOptions.value.appPostYnList[0]
      }
      header.value = cmsNoticeHeader
    } else if (tabRef.value === 'appNotice') {
      header.value = appNoticeHeader
    }
  }
}

const handleFilter = async () => {
  tableModel.value.filter = {
    cmsYn:
      tabRef.value === 'userScreen'
        ? filterOptions.value.cmsYnList[0]
        : tabRef.value === 'cmsNotice'
          ? filterOptions.value.cmsYnList[1] : filterOptions.value.cmsYnList[2],
    postYn: filterOptions.value.postTypeList[0],
    noticeYn: filterOptions.value.postTypeList[0]
  }

  if (tabRef.value === 'userScreen') {
    header.value = userScreenNoticeHeader
  } else if (tabRef.value === 'cmsNotice') {
    tableModel.value.filter = {
      ...tableModel.value.filter,
      appPostYn: filterOptions.value.appPostYnList[0]
    }
    header.value = cmsNoticeHeader
  } else if (tabRef.value === 'appNotice') {
    header.value = appNoticeHeader
  }

  tableModel.value.search.inputFilter = ''
  tableModel.value.pagination.page = 1
  tableModel.value.pagination.rowsPerPage = 15

  await tableRef.value.requestServerInteraction()
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
  let tableRowResponse

  if (tabRef.value === 'userScreen') {
    tableRowResponse = await marketingApi.getNoticeUserAppList({
      ...FilterUtils.findSelectOptions(tableModel.value.filter),
      inputFilter: tableModel.value.search.inputFilter,
      regStartDate: tableModel.value.filter.regStartDate,
      regEndDate: tableModel.value.filter.regEndDate,
      page: tableModel.value.pagination.page - 1,
      size: tableModel.value.pagination.rowsPerPage
    })
  } else {
    tableRowResponse = await marketingApi.getNoticeList({
      ...FilterUtils.findSelectOptions(tableModel.value.filter),
      inputFilter: tableModel.value.search.inputFilter,
      regStartDate: tableModel.value.filter.regStartDate,
      regEndDate: tableModel.value.filter.regEndDate,
      page: tableModel.value.pagination.page - 1,
      size: tableModel.value.pagination.rowsPerPage
    })
  }

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
    tab: tabRef.value,
    page: tableModel.value.pagination.page,
    size: tableModel.value.pagination.rowsPerPage
  })

  router.replace({ query })

  emitter.emit(COMMON.LOADING.HIDE)
}

const onRequestAppPostUpdate = async (row) => {
  if (tabRef.value === 'userScreen') {
    await marketingApi.updateNoticePostOff(row.noticeSeq, { appPostYn: row.appPostYn })
      .then(async (res) => {
        if (res.success) {
          await tableRef.value.requestServerInteraction()
          toastMessage.value = '수정이 완료되었습니다!'
          toastStatus.value = 'success'
          showToast.value = true
        }
      })
      .catch((err) => {
        toastMessage.value = err.message
        toastStatus.value = 'failed'
        showToast.value = true
      })
  } else {
    await marketingApi.updateNoticeAppPostYn(row.noticeSeq, { appPostYn: row.appPostYn })
      .then(async (res) => {
        if (res.success) {
          await tableRef.value.requestServerInteraction()
          toastMessage.value = '수정이 완료되었습니다!'
          toastStatus.value = 'success'
          showToast.value = true
        }
      })
      .catch((err) => {
        toastMessage.value = err.message
        toastStatus.value = 'failed'
        showToast.value = true
      })
  }
}

const createNotify = () => {
  router.push({ name: 'NotifyDetail' })
}

const goDetail = (event, target) => {
  router.push({
    name: 'NotifyDetail',
    query: { idx: target.cmsYn === 'Y' && target.bbsIdx ? target.bbsIdx : target.noticeSeq, cmsYn: target.cmsYn ?? 'Y' }
  })
}

const onChangeOrder = async () => {
  const seqList = tableModel.value.rows.map((row) => row.noticeSeq)
  await marketingApi.updateNoticeUserAppOrder({
    pageNumber: tableModel.value.pagination.page,
    pageSize: tableModel.value.pagination.rowsPerPage,
    seqList
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
