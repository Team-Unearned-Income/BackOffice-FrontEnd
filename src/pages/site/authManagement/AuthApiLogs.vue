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
      <div class="form">
        <div class="row">
          <div class="col-1 form-th">일시</div>
          <div class="col-4 form-td">
            <DoubleDateInput v-model="tableModel.filter.loginDt" />
          </div>
          <div class="col-1 form-th">검색어</div>
          <div class="col-4 form-td" style="display: grid; flex-direction: column">
            <div class="col-4 form-td" style="gap: 0.5rem">
              <div class="col-1 form-td">
                <q-select
                  v-model="tableModel.filter.searchCondition"
                  :options="filterOptions.searchAuthKeywordList"
                  class="full-width"
                  dense
                  hide-bottom-space
                  outlined
                />
              </div>
              <div class="form-td full-width">
                <TableSearch
                  class="full-width"
                  v-model:model-value="tableModel.search.inputFilter"
                  @clear-item="clearSearchItem"
                  @select-search-item="selectSearchItem"
                />
              </div>
            </div>
            <!-- <span>※ 이름 검색 시 전체 이름을 입력해야 합니다.</span> -->
          </div>
        </div>
      </div>
      <!-- TableFilter 영역 -->
      <div class="row justify-between q-py-md">
        <div style="visibility: hidden"></div>
        <div style="display: flex; gap: 1rem">
          <q-btn label="마스킹 해제"
                 @click="unMask"
                 v-if="!authStore.isMasking()"
          />
          <q-btn label="조회" @click="selectSearchItem" />
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
    @masking-update="maskingCheck"
  />
</template>

<script>
const getInitialSearch = () => ({
  inputFilter: ''
})

const getInitialFilter = () => ({
  searchCondition: {},
  createdStartDate: {},
  createdEndDate: {}
})
</script>
<script setup>
import { inject, nextTick, onBeforeMount, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import DoubleDateInput from '@/components/input/DoubleDateInput.vue'
import { authApi, sitemanagementApi } from '@/service/api'
import COMMON from '@/constants/commonConstatns.js'
import PageTable from '@/components/table/PageTable.vue'
import TableSearch from '@/components/table/TableSearch.vue'
import FilterUtils from '@/utils/FilterUtils.js'
import TableUtils from '@/utils/TableUtils.js'
import { useAuthStore } from '@/stores/auth.js'
import OtpCheckModal from "@/components/modal/OtpCheckModal.vue";

const emitter = inject('emitter')

const maskCheck = ref(false)
const authStore = useAuthStore()
const showPassModal = ref(false)

const filterOptions = ref({
  useYnList: [],
  searchAuthKeywordList: []
})

const tableRef = ref(null)
const tableModel = ref({
  filter: getInitialFilter(),
  search: getInitialSearch(),
  selected: [],
  filterAndSearchData: {},
  header: [
    {
      name: 'adminId',
      label: '아이디',
      field: 'adminId',
      align: 'center'
    },
    {
      name: 'phone',
      label: '전화번호',
      field: 'phone',
      align: 'center'
    },
    {
      name: 'methodName',
      label: '구분',
      field: 'methodName',
      align: 'center',
    },
    {
      name: 'ip',
      label: 'IP',
      field: 'ip',
      align: 'center',
    },
    {
      name: 'date',
      label: '일시',
      field: 'date',
      align: 'center'
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
  const response = await authApi.getAuthCodeList().then((res) => {
    const apiData = res.data
    return apiData
  })

  filterOptions.value = FilterUtils.parseFilterArray(response)

  tableModel.value.filter = {
    searchCondition: filterOptions.value.searchAuthKeywordList[0]
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

const onRequest = async (props) => {
  emitter.emit(COMMON.LOADING.SHOW)

  const { page, rowsPerPage } = props.pagination

  const tableRowResponse = await sitemanagementApi.getPrivacyLogs({
    ...FilterUtils.findSelectOptions(tableModel.value.filter),
    inputFilter: tableModel.value.search.inputFilter,
    loginStartDate: tableModel.value.filter.loginDt?.from,
    loginEndDate: tableModel.value.filter.loginDt?.to,
    maskingRemovalYn: authStore.isMasking(),
    page: page - 1,
    size: rowsPerPage,
  })

  tableModel.value.rows = TableUtils.renderRow(
    tableRowResponse.data.content,
    tableModel.value.header
  )
  tableModel.value.pagination.page = page
  tableModel.value.pagination.rowsNumber = tableRowResponse.data.totalElements

  emitter.emit(COMMON.LOADING.HIDE)
}

const unMask = () => {
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
