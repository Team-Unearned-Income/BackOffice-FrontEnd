<template>
  <PageTable
    ref="tableRef"
    v-model.trim="tableModel"
    :table-style="{ height: '63vh' }"
    :selection="tabRef !== 'card' ? 'multiple' : 'none'"
    :virtual-idx="true"
    :row-key="tabRef === 'cmsPromotion' ? 'saleIdx' : 'promotionSeq'"
    :type="'topFix'"
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
              :options="filterOptions.postYnList"
              class="full-width"
              dense
              hide-bottom-space
              outlined
            />
          </div>
          <div class="col-1 form-th">구분</div>
          <div class="col-4 form-td justify-between" style="gap: 0.5rem">
            <q-select
              v-model="tableModel.filter.ticketReservationType"
              :options="filterOptions.ticketReservationTypeList"
              class="full-width"
              dense
              hide-bottom-space
              outlined
              disable
            />
            <q-select
              v-if="tableModel.filter.ticketReservationType.value === 'PROMOTION'"
              v-model="tableModel.filter.promotionBenefit"
              :options="filterOptions.promotionBenefitList"
              class="full-width"
              dense
              hide-bottom-space
              outlined
            />
            <q-select
              v-else
              v-model="tableModel.filter.affiliateCardType"
              :options="filterOptions.affiliateCardTypeList"
              class="full-width"
              dense
              hide-bottom-space
              outlined
              :disable="tableModel.filter.ticketReservationType.value === 'ALL'"
            />
          </div>
        </div>
        <div v-if="tabRef === 'cmsPromotion'" class="row">
          <div class="col-1 form-th">게시기간</div>
          <div class="col-4 form-td">
            <!-- <DoubleDateInput v-model="tableModel.filter.postDt" /> -->
            <DateInput
              v-model="tableModel.filter.postStartDt"
              style="margin-right: 0.5rem"
            />
            ~
            <DateInput
              v-model="tableModel.filter.postEndDt"
              style="margin-left: 0.3rem;margin-right: 0.5rem"
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
        <div class="row">
          <div class="col-1 form-th">검색어</div>
          <div class="col-4 form-td">
            <TableSearch
              v-model:model-value="tableModel.search.inputFilter"
              class="full-width"
              :placeholder="'제목을 입력하시고 엔터를 누르세요'"
              @clear-item="clearSearchItem"
              @select-search-item="selectSearchItem"
            />
          </div>
        </div>
      </div>
      <!-- TableFilter 영역 -->
      <div class="row justify-between q-py-md">
        <div>
          <p style="margin: 0">
            * '일반 프로모션' 탭 : 홈페이지CMS에서 원천정보를 관리하고, 앱 노출
            여부/상단고정/썸네일만 조정 가능합니다.
          </p>
          <p style="margin: 0">- '게시상태' : 홈페이지 노출여부</p>
          <p style="margin: 0">
            * 앱 전용 프로모션 : 홈페이지CMS에서 관리되지 않고, 앱 전용으로만 관리될 프로모션
            입니다.
          </p>
          <p style="margin: 0">* 프로모션 상단고정 체크 > 상단고정관리 버튼 > 확인시 반영됩니다.</p>
        </div>
        <div>
          <div class="row" style="gap: 1rem">
            <q-btn
              v-show="tabRef === 'appPromotion'"
              label="프로모션 등록"
              @click="router.push({ name: 'PromotionDetail' })"
            />
            <q-btn v-show="tabRef !== 'card'" label="상단고정관리" @click="showModal = true" />
            <q-btn
              label="조회"
              style="background-color: #169bd5; color: white"
              @click="selectSearchItem"
            />
          </div>
        </div>
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
          <q-tab :name="'cmsPromotion'" :label="'일반 프로모션'" />
          <q-tab :name="'appPromotion'" :label="'앱 전용 프로모션'" />
          <q-tab :name="'card'" :label="'제휴카드'" />
        </q-tabs>
      </div>
    </template>
  </PageTable>
  <TopPromotionEditModal
    v-model:show="showModal"
    :data-model="tableModel.selected"
    title="상단고정관리"
    @update:model-value="
      async (data) => {
        await onRegistTopPromotion(data)
      }
    "
  />
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
  type: '',
  postYn: {},
  appPostYn: {},
  cmsYn: {},
  ticketReservationType: {},
  promotionBenefit: {},
  affiliateCardType: {},
  postStartDt: {},
  postEndDt: {}
})
</script>
<script setup>
import { useRouter } from 'vue-router'
import { inject, nextTick, onBeforeMount, onMounted, ref, watch } from 'vue'
import DateInput from '@/components/input/DateInput.vue'
import { ticketApi } from '@/service/api'
import COMMON from '@/constants/commonConstatns.js'
import PageTable from '@/components/table/PageTable.vue'
import TableSearch from '@/components/table/TableSearch.vue'
import FilterUtils from '@/utils/FilterUtils.js'
import TableUtils from '@/utils/TableUtils.js'
import TopPromotionEditModal from '@/components/modal/TopPromotionEditModal.vue'
import {
  userScreenHeader,
  cmsPromotionHeader,
  appPromotionHeader,
  cardHeader
} from '@/pages/marketing/promotion/HeaderList'
import RegistToast from "@/components/dialog/RegistToast.vue";

const router = useRouter()
const emitter = inject('emitter')

/** Toast 관련 */
const showToast = ref(false)
const toastMessage = ref(null)
const toastStatus = ref('success')

const showModal = ref(false)
const isReady = ref(false)

const filterOptions = ref({
  postYnList: [],
  appPostYnList: [],
  ticketReservationTypeList: [],
  promotionBenefitList: [],
  affiliateCardTypeList: []
})

const tableRef = ref(null)
const tabRef = ref(null)

const header = ref(userScreenHeader)

const tableModel = ref({
  filter: getInitialFilter(),
  search: getInitialSearch(),
  selected: [],
  filterAndSearchData: {},
  header: header,
  rows: [],
  pagination: {
    sortBy: '',
    descending: false,
    page: 1 - 1,
    rowsPerPage: 15,
    rowsNumber: 0
  }
})

let previousLength = 0 // 이전 길이를 추적할 변수

watch(
  () => tableModel.value.selected,
  async (newValue, _oldValue) => {
    if (isReady.value && newValue.length > previousLength) {
      // 배열 길이가 늘어난 경우만 실행
      previousLength = newValue.length // 현재 길이를 업데이트

      // 마지막으로 들어온 요소 처리
      if (tableModel.value.filter.cmsYn.value !== 'Y') return

      const idx = newValue[newValue.length - 1]?.saleIdx
      if (!idx) return

      const response = await ticketApi.getPromotionRegYnCheck(idx).then((res) => res.data)

      if (!response) {
        alert('프로모션 상세 수정 후 상단고정할 수 있습니다.')
        newValue.pop() // API 결과가 false인 경우 마지막 요소 제거
        previousLength-- // 길이 추적 변수 업데이트
      }
    } else {
      // 길이가 줄어들면 길이 추적 변수만 업데이트
      previousLength = newValue.length
    }
  },
  { immediate: true, deep: true }
)

onBeforeMount(async () => {
  tableModel.value.filter = {
    ...tableModel.value.filter
  }
})

onMounted(async () => {
  emitter.emit(COMMON.LOADING.SHOW)

  await filterSetting()
  await nextTick(async () => {
    await selectSetting()
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
  tabRef.value = 'userScreen'
  const filterList = await ticketApi.getTicketReservationCode().then((res) => res.data)
  filterOptions.value = FilterUtils.parseFilterArray(filterList)
  filterOptions.value.ticketReservationTypeList.shift()

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
  const postYn = filterOptions.value.postYnList.find((item) => item.value === query.get('postYn'))
  const appPostYn = filterOptions.value.appPostYnList.find((item) => item.value === query.get('appPostYn'))
  const ticketReservationType = filterOptions.value.ticketReservationTypeList.find(
    (item) => item.value === query.get('ticketReservationType')
  )
  const promotionBenefit = filterOptions.value.promotionBenefitList.find(
    (item) => item.value === query.get('promotionBenefit')
  )
  const affiliateCardType = filterOptions.value.affiliateCardTypeList.find(
    (item) => item.value === query.get('affiliateCardType')
  )
  const inputFilter = query.get('inputFilter')
  const page = Number(query.get('page'))
  const size = Number(query.get('size'))

  tableModel.value.filter = {
    cmsYn: cmsYn ?? filterOptions.value.cmsYnList[0],
    postYn: postYn ?? filterOptions.value.postYnList[0],
    ticketReservationType:
      ticketReservationType ?? filterOptions.value.ticketReservationTypeList[0],
    promotionBenefit: promotionBenefit ?? filterOptions.value.promotionBenefitList[0],
    affiliateCardType: affiliateCardType ?? filterOptions.value.affiliateCardTypeList[0]
  }
  tableModel.value.search.inputFilter = inputFilter ?? tableModel.value.search.inputFilter
  tableModel.value.pagination.page = page ?? tableModel.value.pagination.page
  tableModel.value.pagination.rowsPerPage = size ?? tableModel.value.pagination.rowsPerPage

  if (query.get('postFrom')) {
    tableModel.value.filter.postStartDt = query.get('postFrom')
  }
  if (query.get('postTo')) {
    tableModel.value.filter.postEndDt = query.get('postTo')
  }

  if (query.get('tab')) {
    tabRef.value = query.get('tab')
    if (tabRef.value === 'userScreen') {
      header.value = userScreenHeader
    } else if (tabRef.value === 'cmsPromotion') {
      tableModel.value.filter = {
        ...tableModel.value.filter,
        appPostYn: appPostYn ?? filterOptions.value.appPostYnList[0]
      }
      header.value = cmsPromotionHeader
    } else if (tabRef.value === 'appPromotion') {
      header.value = appPromotionHeader
    } else header.value = cardHeader
  }
}

const handleFilter = async () => {
  if (tabRef.value === 'userScreen') {
    tableModel.value.filter = {
      cmsYn: filterOptions.value.cmsYnList[0],
      postYn: filterOptions.value.postYnList[0],
      ticketReservationType: filterOptions.value.ticketReservationTypeList[0],
      promotionBenefit: filterOptions.value.promotionBenefitList[0],
      affiliateCardType: filterOptions.value.affiliateCardTypeList[0]
    }
    header.value = userScreenHeader
  } else if (tabRef.value === 'cmsPromotion') {
    tableModel.value.filter = {
      cmsYn: filterOptions.value.cmsYnList[1],
      postYn: filterOptions.value.postYnList[0],
      appPostYn: filterOptions.value.appPostYnList[0],
      ticketReservationType: filterOptions.value.ticketReservationTypeList[0],
      promotionBenefit: filterOptions.value.promotionBenefitList[0],
      affiliateCardType: filterOptions.value.affiliateCardTypeList[0]
    }
    header.value = cmsPromotionHeader
  } else if (tabRef.value === 'appPromotion') {
    tableModel.value.filter = {
      cmsYn: filterOptions.value.cmsYnList[2],
      postYn: filterOptions.value.postYnList[0],
      ticketReservationType: filterOptions.value.ticketReservationTypeList[0],
      promotionBenefit: filterOptions.value.promotionBenefitList[0],
      affiliateCardType: filterOptions.value.affiliateCardTypeList[0]
    }
    header.value = appPromotionHeader
  } else {
    tableModel.value.filter = {
      cmsYn: filterOptions.value.cmsYnList[1],
      postYn: filterOptions.value.postYnList[0],
      ticketReservationType: filterOptions.value.ticketReservationTypeList[1],
      promotionBenefit: filterOptions.value.promotionBenefitList[0],
      affiliateCardType: filterOptions.value.affiliateCardTypeList[0]
    }
    header.value = cardHeader
  }
  tableModel.value.search.inputFilter = ''
  tableModel.value.pagination.page = 1
  tableModel.value.pagination.rowsPerPage = 15

  await tableRef.value.requestServerInteraction()
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

const selectSetting = async () => {
  const topList = await ticketApi.getTopPromotionAffiliateList().then((res) => res.data)
  topList.forEach((row) => {
    tableModel.value.selected.push(row)
  })
}

/** TODO: 기획에는 없지만 필요할 기능일듯함 */
const resetTableFilter = () => {
  tableModel.value.filter = {}
}

const onRequest = async (_props) => {
  emitter.emit(COMMON.LOADING.SHOW)
  let tableRowResponse

  if (tabRef.value === 'userScreen') {
    tableRowResponse = await ticketApi.getPromotionUserAppList({
      ...FilterUtils.findSelectOptions(tableModel.value.filter),
      inputFilter: tableModel.value.search.inputFilter,
      postStartDate: tableModel.value.filter.postStartDt,
      postEndDate: tableModel.value.filter.postEndDt,
      page: tableModel.value.pagination.page - 1,
      size: tableModel.value.pagination.rowsPerPage
    })
  } else {
    tableRowResponse = await ticketApi.getPromotionAffiliateList({
      ...FilterUtils.findSelectOptions(tableModel.value.filter),
      inputFilter: tableModel.value.search.inputFilter,
      postStartDate: tableModel.value.filter.postStartDt,
      postEndDate: tableModel.value.filter.postEndDt,
      page: tableModel.value.pagination.page - 1,
      size: tableModel.value.pagination.rowsPerPage
    })
  }
  isReady.value = true

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
    postDate: tableModel.value.filter.postDt,
    tab: tabRef.value,
    page: tableModel.value.pagination.page,
    size: tableModel.value.pagination.rowsPerPage
  })

  router.replace({ query })

  emitter.emit(COMMON.LOADING.HIDE)
}

const onRequestAppPostUpdate = async (row, name) => {
  // 일반 프로모션의 경우만 이 함수 사용
  const formData = new FormData()
  formData.append(
    'request',
    new Blob([JSON.stringify({ appPostYn: row.appPostYn })], { type: 'application/json' })
  )
  formData.append('thumbnailFile', new Blob(['']))

  if (tabRef.value === 'userScreen') {
    if (name === 'appHomePostYn') {
      await ticketApi.updatePromotionAppHomePostYn(row.promotionSeq, { appHomePostYn: row.appHomePostYn })
    } else {
      await ticketApi.updatePromotionPostOff(row.promotionSeq, { appPostYn: row.appPostYn })
        .then(async () => await tableRef.value.requestServerInteraction())
    }
  } else {
    await ticketApi.updatePromotionAppPostYn(row.saleIdx, { appPostYn: row.appPostYn })
      .then(async (res) =>{
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

const onRegistTopPromotion = async (data) => {
  const topRequest = []

  data.forEach((row) => {
    topRequest.push({
      promotionSeq: row.promotionSeq,
      sn: Number(row.sn)
    })
  })

  await ticketApi.setTopPromotionAffiliate(topRequest)

  tableModel.value.selected = []

  await selectSetting()
  await tableRef.value.requestServerInteraction()
}

const goDetail = (event, target) => {
  router.push({
    name: 'PromotionDetail',
    state: {
      data: {
        cmsYn: target.saleIdx ? 'Y' : 'N',
        idx: target.saleIdx ?? target.promotionSeq
      }
    }
  })
}

const onChangeOrder = async () => {
  const seqList = tableModel.value.rows.map((row) =>
    row.type === 'promotion' ? row.promotionSeq : row.noticeSeq
  )
  await ticketApi.updatePromotionUserAppOrder({
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
