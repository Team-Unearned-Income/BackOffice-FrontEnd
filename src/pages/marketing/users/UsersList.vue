<template>
  <PageTable
    ref="tableRef"
    v-model.trim="tableModel"
    :virtual-idx="true"
    :table-style="{ height: '63vh' }"
    class="q-pa-md"
    content-area-class="q-pb-sm"
    @request="onRequest"
    @row-click="(event, row) => goDetail(event, row)"
  >
    <template #filter-section>
      <div class="form">
        <div class="row">
          <div class="col-1 form-th">구분</div>
          <div class="col-4 form-td">
            <q-select
              v-model="tableModel.filter.memberType"
              :options="filterOptions.memberTypeList"
              class="full-width"
              dense
              hide-bottom-space
              outlined
            />
          </div>
          <div class="col-1 form-th">최종 방문일</div>
          <div class="col-4 form-td">
            <DoubleDateInput v-model="tableModel.filter.visitDt" />
          </div>
        </div>
        <div class="row">
          <div class="col-1 form-th">가입일</div>
          <div class="col-4 form-td">
            <DoubleDateInput v-model="tableModel.filter.joinDt" />
          </div>
          <div class="col-1 form-th">당월 생일 여부</div>
          <div class="col-5 form-td">
            <div class="full-width form-td">
              <q-select
                v-model="tableModel.filter.thisMonthBirthYn"
                :options="filterOptions.thisMonthBirthYnList"
                class="full-width"
                dense
                hide-bottom-space
                outlined
              />
            </div>
          </div>
        </div>
        <div class="row">
          <div class="col-1 form-th">마케팅동의여부</div>
          <div class="col-4 form-td">
            <q-select
              v-model="tableModel.filter.marketingAgreeYn"
              :options="filterOptions.marketingAgreeYnList"
              class="full-width self-start"
              dense
              hide-bottom-space
              outlined
            />
          </div>

        </div>
        <div class="row">
          <div class="col-1 form-th">검색어</div>
          <div class="col-11 form-td" style="display: grid; flex-direction: column">
            <div class="form-td" style="gap: 0.5rem">
              <div class="col-1 form-td">
                <q-select
                  v-model="tableModel.filter.memberSearch"
                  :options="filterOptions.memberSearchList"
                  class="full-width"
                  dense
                  hide-bottom-space
                  outlined
                />
              </div>
              <div class="col-5 form-td">
                <TableSearch
                  v-model:model-value="tableModel.search.inputFilter"
                  class="full-width"
                  @clear-item="clearSearchItem"
                  @select-search-item="selectSearchItem"
                />
              </div>
              <div class="full-width">
                <span>※ 전화번호 검색 시 전체 전화번호를 입력해야 합니다.</span>
                <br />
                <span>※ 전화번호 검색 시, '-'를 제외한 번호를 검색하세요.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <!-- TableFilter 영역 -->
      <div class="row q-py-md justify-end">
        <div style="display: flex; gap: 1rem">
          <q-btn label="마스킹 해제"
                 v-if="!authStore.isMasking()"
                 @click="unMask"
          />
          <q-btn
            :label="!isDownloading ? 'EXCEL 다운로드' : downloadProgress + ' %'"
            :disable="isDownloading"
            :class="{ 'no-blur': isDownloading }"
            @click="downloadList"
          >
          </q-btn>

          <q-btn
            style="background-color: #169bd5; color: white"
            label="조회"
            @click="selectSearchItem"
          />
        </div>
      </div>
    </template>
  </PageTable>
  <RegistToast
    v-if="maskCheck"
    message="마스킹이 해제제되었습니다!"
    :duration="3000"
    @hidden="
      () => {
        maskCheck = false
      }
    "
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
  memberType: {},
  joinChannelType: {},
  memberSearch: {},
  thisMonthBirthYn: {},
  marketingAgreeYn: {},
  visitDt: {
    from: '',
    to: ''
  }
})
</script>
<script setup>
import { inject, nextTick, onBeforeMount, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import DoubleDateInput from '@/components/input/DoubleDateInput.vue'
import { marketingApi } from '@/service/api'
import COMMON from '@/constants/commonConstatns.js'
import PageTable from '@/components/table/PageTable.vue'
import TableSearch from '@/components/table/TableSearch.vue'
import FilterUtils from '@/utils/FilterUtils.js'
import TableUtils from '@/utils/TableUtils.js'
import DateUtils from '@/utils/DateUtils.js'
import RegistToast from '@/components/dialog/RegistToast.vue'
import { REGEX } from '@/constants/regualExpression.js'
import { useAuthStore } from '@/stores/auth.js'
import PasswordCheckModal from '@/components/modal/PasswordCheckModal.vue'
import DateInput from '@/components/input/DateInput.vue'
import OtpCheckModal from '@/components/modal/OtpCheckModal.vue'

const router = useRouter()
const route = useRoute()
const emitter = inject('emitter')

/** Fake Progress */
const isDownloading = ref(false)
const downloadProgress = ref(0)

/** masking */
const authStore = useAuthStore()
const maskCheck = ref(false)
const showPassModal = ref(false)

const filterOptions = ref({
  memberTypeList: [],
  // joinChannelTypeList: [],
  memberSearchList: [],
  thisMonthBirthYnList: [],
  marketingAgreeYnList: []
})

const tableRef = ref(null)
const tableModel = ref({
  filter: getInitialFilter(),
  search: getInitialSearch(),
  selected: [],
  filterAndSearchData: {},
  header: [
    {
      name: 'userId',
      label: '고유번호',
      field: 'userId',
      align: 'center',
      headerStyle: 'min-width: 7rem'
    },
    {
      name: 'type',
      label: '구분',
      field: 'type',
      align: 'center',
      headerStyle: 'max-width: 2.5rem'
    },
    {
      name: 'phoneNumber',
      label: '휴대폰 번호',
      field: 'phoneNumber',
      align: 'center',
      format: (value) => {
        return !value ? '-' : value.replace(REGEX.PHONE_NUM, '$1-$2-$3')
      }
    },
    {
      name: 'birthDate',
      label: '생년월일',
      field: 'birthDate',
      align: 'center',
      headerStyle: 'max-width: 3rem'
    },
    {
      name: 'gender',
      label: '성별',
      field: 'gender',
      align: 'center',
      headerStyle: 'max-width: 1rem',
      format: (value) => (value === 'MALE' ? '남성' : value === 'FEMALE' ? '여성' : '-')
    },
    {
      name: 'nickName',
      label: '닉네임',
      field: 'nickName',
      align: 'center'
    },
    {
      name: 'joinDate',
      label: '가입일',
      field: 'joinDate',
      align: 'center',
      headerStyle: 'max-width: 4.5rem',
      format: (value) => DateUtils.convertStandardDate(value)
    },
    {
      name: 'recentVisitDate',
      label: '최종 방문일',
      field: 'recentVisitDate',
      align: 'center',
      headerStyle: 'max-width: 4.5rem',
      format: (value) => DateUtils.convertDateFormatNullCheck(value)
    },
    {
      name: 'visitDate',
      label: '방문 횟수',
      field: 'visitDate',
      align: 'center',
      headerStyle: 'max-width: 1rem',
      format: (value, row) => (value != null ? `${value}회` : value)
    },
    {
      name: 'thisMonthBirthYn',
      label: '당월 생일 여부',
      field: 'thisMonthBirthYn',
      align: 'center',
      headerStyle: 'max-width: 3rem',
      format: (value) => (value === 'Y' ? '생일자' : '-')
    },
    {
      name: 'marketingAgreeYn',
      label: '마케팅 활용 동의 여부',
      field: 'marketingAgreeYn',
      align: 'center',
      headerStyle: 'max-width: 4rem',
      format: (value) => (value === 'Y' ? '동의' : '미동의')
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

const refreshData = async () => {
  await filterSetting()
  await nextTick(async () => {
    await tableRef.value.requestServerInteraction()
  })
}

const filterSetting = async () => {
  const filterList = await marketingApi.getMemberListCode().then((res) => res.data)
  filterOptions.value = FilterUtils.parseFilterArray(filterList)

  const query = new URLSearchParams(window.location.search)

  const memberType = filterOptions.value.memberTypeList.find(
    (item) => item.value === query.get('memberType')
  )

  // const joinChannelType = filterOptions.value.joinChannelTypeList.find(
  //   (item) => item.value === query.get('joinChannelType')
  // )

  const thisMonthBirthYn = filterOptions.value.thisMonthBirthYnList.find(
    (item) => item.value === query.get('thisMonthBirthYn')
  )

  const marketingAgreeYn = filterOptions.value.marketingAgreeYnList.find(
    (item) => item.value === query.get('marketingAgreeYn')
  )

  const memberSearch = filterOptions.value.memberSearchList.find(
    (item) => item.value === query.get('memberSearch')
  )

  const inputFilter = query.get('inputFilter')
  const page = Number(query.get('page'))
  const size = Number(query.get('size'))

  tableModel.value.filter = {
    memberType: memberType ?? filterOptions.value.memberTypeList[0],
    // joinChannelType: joinChannelType ?? filterOptions.value.joinChannelTypeList[0],
    memberSearch: memberSearch ?? filterOptions.value.memberSearchList[0],
    thisMonthBirthYn: thisMonthBirthYn ?? filterOptions.value.thisMonthBirthYnList[0],
    marketingAgreeYn: marketingAgreeYn ?? filterOptions.value.marketingAgreeYnList[0]
  }
  tableModel.value.search.inputFilter = inputFilter ?? tableModel.value.search.inputFilter
  tableModel.value.pagination.page = page === 0 ? tableModel.value.pagination.page : page
  tableModel.value.pagination.rowsPerPage = size === 0 ? tableModel.value.pagination.rowsPerPage : size

  if (query.get('joinDtFrom') && query.get('joinDtTo')) {
    tableModel.value.filter.joinDt = {
      from: query.get('joinDtFrom'),
      to: query.get('joinDtTo')
    }
  }
}

const downloadList = async () => {
  unMask()
  if (!authStore.isMasking()) return
  const request = {
    ...FilterUtils.findSelectOptions(tableModel.value.filter),
    inputFilter: tableModel.value.search.inputFilter,
    joinStartDate: tableModel.value.filter.joinDt?.from,
    joinEndDate: tableModel.value.filter.joinDt?.to,
    lastVisitStartDate: tableModel.value.filter.visitDt?.from,
    lastVisitEndDate: tableModel.value.filter.visitDt?.to,
    maskingRemovalYn: authStore.isMasking()
  }

  isDownloading.value = true
  downloadProgress.value = 0

  let progress = 0
  const progressInterval = setInterval(() => {
    if (progress < 99) {
      progress++
      downloadProgress.value = progress
    }
  }, 100)

  await marketingApi
    .downloadMemberExcel(request, { format: 'blob' })
    .then((res) => {
      const contentDisposition = res.headers['content-disposition']
      const filename = contentDisposition?.split('filename=')[1]?.split('\'\'')[1]

      const blobUrl = window.URL.createObjectURL(res.data)
      const link = document.createElement('a')

      link.href = blobUrl
      link.setAttribute('download', filename)
      link.click()
      window.URL.revokeObjectURL(blobUrl)

      clearInterval(progressInterval)
      downloadProgress.value = 100
      isDownloading.value = false
    })
    .catch((err) => {
      console.error('파일 다운로드 중 오류 발생:', err)
      clearInterval(progressInterval)
      downloadProgress.value = 0
      isDownloading.value = false
    })
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

const onRequest = async (_props) => {
  emitter.emit(COMMON.LOADING.SHOW)

  const tableRowResponse = await marketingApi
    .getMemberList({
      ...FilterUtils.findSelectOptions(tableModel.value.filter),
      inputFilter: tableModel.value.search.inputFilter,
      joinStartDate: tableModel.value.filter.joinDt?.from,
      joinEndDate: tableModel.value.filter.joinDt?.to,
      lastVisitStartDate: tableModel.value.filter.visitDt?.from,
      lastVisitEndDate: tableModel.value.filter.visitDt?.to,
      page: tableModel.value.pagination.page - 1,
      size: tableModel.value.pagination.rowsPerPage,
      maskingRemovalYn: authStore.isMasking()
    }).catch((err) => {
      /** 검색결과 없으면 err 문구 처리하던지 백엔드에서 그냥 success로 넘겨줘서 검색결과가 없습니다 보여줄지 선택해서 수정하기 */
      alert(err.message)
      emitter.emit(COMMON.LOADING.HIDE)
      return
    })

  if (tableRowResponse) {
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
      regDate: tableModel.value.filter.joinDt,
      page: tableModel.value.pagination.page,
      size: tableModel.value.pagination.rowsPerPage
    })
    router.replace({ query })
  }

  emitter.emit(COMMON.LOADING.HIDE)
}

const goDetail = (event, row) => {
  event.preventDefault()
  router.push({
    name: 'UsersDetail',
    query: {
      userId: row.userId,
      id: row.id,
      withdrawYn: row.withdrawYn
    }
  })
}

const unMask = () => {
  if (maskCheck.value) {
    alert('마스킹이 해제되어있습니다.')
    return
  }
  if (authStore.isMasking()) return
  showPassModal.value = true
}

const maskingCheck = (value) => {
  if (value) {
    refreshData()
  }
}
</script>
<style lang="scss" scoped>
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

.q-btn.disabled.no-blur {
  opacity: 0.8 !important;
  color: inherit !important;
  filter: none !important;
  pointer-events: none !important;
}
</style>
