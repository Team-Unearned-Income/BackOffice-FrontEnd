<template>
  <q-dialog v-model="showModal">
    <PageTable
      ref="tableRef"
      v-model.trim="tableModel"
      class="q-pa-md"
      :type="'scroll'"
      :table-style="{ height: '63vh' }"
      :selection="props.selection"
      :row-key="'userId'"
      :on-custom-pagination="false"
      :on-top-options="true"
      :on-top-pagination-options="false"
      :virtual-idx="true"
      content-area-class="q-pb-sm"
      @request="onRequest"
      @update-rows="onRowsChange"
    >
      <template v-if="props.showFilter" #filter-section>
        <div class="row q-py-md justify-between">
          <div class="text-h5 text-bold">회원검색</div>
          <q-btn v-close-popup dense flat icon="close" round />
        </div>
        <div class="form">
          <div class="row">
            <div class="col-1 form-th">가입일</div>
            <div class="col-4 form-td">
              <DoubleDateInput v-model="tableModel.filter.joinDt" />
            </div>
            <div class="col-1 form-th">최종방문일</div>
            <div class="col-4 form-td">
              <DoubleDateInput v-model="tableModel.filter.visitDt" />
            </div>
          </div>
          <div class="row">
            <div class="col-1 form-th">생일자조회</div>
            <div class="col-4 form-td">
              <q-select
                v-model="tableModel.filter.thisMonthBirthYn"
                :options="filterOptions.thisMonthBirthYnList"
                class="full-width self-start"
                dense
                hide-bottom-space
                outlined
              />
            </div>
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
                    dense
                    class="full-width"
                    hide-bottom-space
                    outlined
                  />
                </div>
                <div class="col-5 form-td">
                  <TableSearch
                    v-model:model-value="tableModel.search.inputFilter"
                    placeholder="휴대폰번호, 닉네임 대상 조회"
                    style="width: 100%"
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
        <div class="row q-py-md justify-end q-gutter-md">
          <q-btn label="마스킹 해제"
            :disable="authStore.isMasking()"
            @click="unMask"
          />
          <q-btn label="조회" @click="selectSearchItem" />
        </div>
      </template>
      <template v-else #filter-section>
        <div class="row q-py-md justify-between">
          <div class="text-h5 text-bold">회원목록</div>
          <q-btn v-close-popup dense flat icon="close" round />
        </div>
      </template>
      <template #bottom>
        <template v-if="props.showBottomButton">
          <div class="row q-py-md justify-between">
            <div class="q-gutter-x-md">
              <q-btn v-close-popup label="취소" />
              <q-btn label="초기화" @click="clearCheckList" />
            </div>
            <q-btn label="확인" @click="onSelectionChange" />
          </div>
        </template>
      </template>
    </PageTable>
  </q-dialog>
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
  joinDt: {
    from: '',
    to: ''
  },
  visitDt: {
    from: '',
    to: ''
  },
  memberSearch: 'ALL',
  marketingAgreeYn: 'ALL',
  marketingPushYn: 'ALL',
  thisMonthBirthYn: 'ALL'
})
</script>

<script setup>
import { inject, nextTick, onBeforeMount, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import COMMON from '@/constants/commonConstatns.js'
import PageTable from '@/components/table/PageTable.vue'
import TableSearch from '@/components/table/TableSearch.vue'
import FilterUtils from '@/utils/FilterUtils.js'
import DoubleDateInput from '@/components/input/DoubleDateInput.vue'
import TableUtils from '@/utils/TableUtils.js'
import { REGEX } from '@/constants/regualExpression.js'
import DateUtils from '@/utils/DateUtils'
import { useAuthStore } from '@/stores/auth.js'
import PasswordCheckModal from '@/components/modal/PasswordCheckModal.vue'
import OtpCheckModal from "@/components/modal/OtpCheckModal.vue";

const route = useRoute()
const emitter = inject('emitter')
const emit = defineEmits(['update:selected'])

/** masking */
const authStore = useAuthStore()
const maskCheck = ref(false)
const showPassModal = ref(false)

const filterOptions = ref({
  memberSearchList: [],
  thisMonthBirthYnList: [],
  marketingAgreeYnList: []
})
const showModal = defineModel('show', {
  type: Boolean,
  default: () => true,
  required: true
})

const props = defineProps({
  type: {
    type: String,
    default: () => 'all'
  },
  selected: {
    type: Array,
    default: () => []
  },
  showFilter: {
    type: Boolean,
    default: () => true
  },
  showBottomButton: {
    type: Boolean,
    default: () => true
  },
  selection: {
    type: String,
    default: () => 'multiple'
  },
  specifyNumber: {
    type: String,
    required: false
  }
})

const lastJoinDate = ref(null)

const tableRef = ref(null)
const tableModel = ref({
  type: 'scroll',
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
      format: (value) => DateUtils.convertStandardDate(value)
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
  oldSelected: [],
  oldRows: [],
  rows: [],
  pagination: {
    page: 0,
    rowsNumber: 0,
    rowsPerPage: 20
  }
})

const filterSetting = async () => {
  const filterList = await pushApi.getPushMemberInfoListCode().then((res) => res.data)
  filterOptions.value = FilterUtils.parseFilterArray(filterList)

  tableModel.value.filter = {
    memberSearch: filterOptions.value.memberSearchList[0],
    thisMonthBirthYn: filterOptions.value.thisMonthBirthYnList[0],
    marketingAgreeYn: filterOptions.value.marketingAgreeYnList[0],
    marketingPushYn: filterOptions.value.marketingPushYnList[0],
    visitDt: DateUtils.convertDateType('2week')
  }
}

const selectSearchItem = async () => {
  // 검색
  tableModel.value.search.searchData = {
    inputFilter: tableModel.value.search.inputFilter
  }
  lastJoinDate.value = null

  tableModel.value.pagination.page = 1 - 1
  tableRef.value.requestServerInteraction()
}

const clearSearchItem = () => {
  // inputText 제거 및 Table 초기화
  tableModel.value.search = getInitialSearch()
  tableModel.value.pagination.page = 1
}

const clearCheckList = () => {
  tableModel.value.selected = []
}

const onSelectionChange = () => {
  emit('update:selected', tableModel.value.selected)
  showModal.value = false
}

const getMemberList = async (tableProps) => {
  const { page, rowsPerPage } = tableProps.pagination

  const tableRowResponse = await pushApi.getPushMemberInfoList({
    ...FilterUtils.findSelectOptions(tableModel.value.filter),
    inputFilter: tableModel.value.search.inputFilter,
    lastJoinDate: lastJoinDate.value,
    joinStartDate: tableModel.value.filter.joinDt?.from,
    joinEndDate: tableModel.value.filter.joinDt?.to,
    lastVisitStartDate: tableModel.value.filter.visitDt?.from,
    lastVisitEndDate: tableModel.value.filter.visitDt?.to,
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

    if (page === 1) {
      tableModel.value.oldRows = [...tableModel.value.rows]
    } else if (tableModel.value.type === 'scroll') {
      tableModel.value.oldRows = [...tableModel.value.oldRows, ...tableModel.value.rows]
      tableModel.value.rows = [...tableModel.value.oldRows]
    }

    tableModel.value.rows.forEach((row) => {
      tableModel.value.oldSelected.forEach((oldRow) => {
        if (row.userId === oldRow) {
          if (
            row.userId === oldRow &&
            !tableModel.value.selected.some((selectedRow) => selectedRow.userId === row.userId)
          ) {
            tableModel.value.selected.push(row)
          }
        }
      })
    })

    tableModel.value.pagination.page = page
    tableModel.value.pagination.rowsNumber = tableRowResponse.data.totalElements
    tableModel.value.rowIndex = 0

    lastJoinDate.value = tableModel.value.rows[tableModel.value.rows.length - 1]?.joinDate
  }
}

const getSpecifyMemberList = async (tableProps) => {
  const { page, rowsPerPage } = tableProps.pagination

  const tableRowResponse = await pushApi.getSpecifyMemberList(
    {
      userList: props.selected
    },
    {
      page: page - 1,
      size: rowsPerPage
    }
  )

  tableModel.value.rows = TableUtils.renderRow(
    tableRowResponse.data.content,
    tableModel.value.header
  )

  if (tableModel.value.type === 'scroll') {
    tableModel.value.oldRows = [...tableModel.value.oldRows, ...tableModel.value.rows]
    tableModel.value.rows = [...tableModel.value.oldRows]
  }

  tableModel.value.rows.forEach((row) => {
    tableModel.value.oldSelected.forEach((oldRow) => {
      if (row.userId === oldRow) {
        tableModel.value.selected.push(row)
      }
    })
  })

  tableModel.value.pagination.page = page
  tableModel.value.pagination.rowsNumber = tableRowResponse.data.totalElements
}
const onRequest = async (tableProps) => {
  emitter.emit(COMMON.LOADING.SHOW)
  if (props.type === 'push') {
    await getSpecifyMemberList(tableProps)
  } else {
    await getMemberList(tableProps)
  }

  emitter.emit(COMMON.LOADING.HIDE)
}

const onRowsChange = (rows) => {
  tableModel.value.rows = [...tableModel.value.oldRows]
}

onBeforeMount(async () => {
  const { rowsPerPage, page, inputFilter } = route.query

  tableModel.value.oldSelected = props.selected

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
  await filterSetting()
  await nextTick(async () => {
    await tableRef.value.requestServerInteraction()
  })
})

const unMask = () => {
  if(maskCheck.value) {
    alert('마스킹이 해제되어있습니다.')
    return
  }
  showPassModal.value = true
}

const maskingCheck = (value) => {
  if(value) {
    console.log("회원검색 새로고침")
    // 검색
    tableModel.value.search.searchData = {
      inputFilter: tableModel.value.search.inputFilter
    }
    lastJoinDate.value = null

    tableModel.value.pagination.page = 1 - 1
    tableRef.value.requestServerInteraction()
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
