<template>
  <BasicConfirm
    v-model:show="showModal"
    :close-label="closeLabel"
    :style="style"
    :title="title"
    :sub-title="tableModel.filter.type.label"
    @hide="hideModal"
  >
    <template #sub-title>
      <span class="text-bold" style="font-size: 1rem; color: gray">
        {{ tableModel.filter.type.label }}
      </span>
    </template>
    <template #content>
      <PageTable
        ref="tableRef"
        v-model.trim="tableModel"
        class="q-py-sm"
        :table-style="{ height: '40vh' }"
        selection="single"
        :row-key="'seq'"
        :virtual-idx="true"
        content-area-class="q-pb-sm"
        @request="onRequest"
      >
        <template #filter-section>
          <div class="form">
            <div class="row">
              <div class="col-1 form-th" v-if="tableModel.filter.type.value !== 'NOTICE'">
                검색 조건
              </div>
              <div class="col-4 form-td" v-if="tableModel.filter.type.value === 'AFFILIATE_CARD'">
                <q-select
                  v-model:model-value="tableModel.filter.affiliateCardType"
                  :options="filterOptions.affiliateCardTypeList"
                  class="full-width"
                  dense
                  hide-bottom-space
                  outlined
                />
              </div>
              <div class="col-4 form-td" v-if="tableModel.filter.type.value === 'PROMOTION'">
                <q-select
                  v-model:model-value="tableModel.filter.cmsYn"
                  :options="filterOptions.cmsYnList"
                  class="full-width"
                  label="구분"
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
                  placeholder="제목을 입력하신 후 엔터를 누르세요"
                  @clear-item="clearSearchItem"
                  @select-search-item="selectSearchItem"
                />
              </div>
            </div>
          </div>
          <div class="row q-py-md justify-between">
            <span class="text-grey">* 현재 게시중인 항목만 표시됩니다.</span>
            <q-btn label="조회" @click="selectSearchItem" />
          </div>
        </template>
      </PageTable>
      <div>
        <q-btn :label="reserveLabel" class="modal-btn-md" color="black" outline @click="onEdit" />
      </div>
    </template>
  </BasicConfirm>
</template>
<script>
const getInitialSearch = () => ({
  inputFilter: ''
})

const getInitialFilter = () => ({
  type: '',
  cmsYn: null,
  affiliateCardType: null
})
</script>
<script setup>
import { inject, onBeforeMount, onMounted, ref, nextTick } from 'vue'
import BasicConfirm from './BasicConfirm.vue'
import COMMON from '@/constants/commonConstatns.js'
import FilterUtils from '@/utils/FilterUtils.js'
import TableUtils from '@/utils/TableUtils.js'
import TableSearch from '@/components/table/TableSearch.vue'
import PageTable from '@/components/table/PageTable.vue'

const emitter = inject('emitter')
const emit = defineEmits(['hide', 'modal-data-model', 'update:model-value'])

const filterOptions = ref({
  affiliateCardTypeList: [],
  cmsYnList: []
})

const props = defineProps({
  title: {
    type: String,
    default: () => ''
  },
  size: {
    type: String,
    default: () => 'sm'
  },
  style: {
    type: Object,
    default: () => {}
  },
  type: {
    type: String,
    default: null
  },
  selection: {
    type: Object,
    default: null
  },
  options: {
    type: Array,
    default: null
  }
})

const showModal = defineModel('show', {
  type: Boolean,
  default: () => false,
  required: true
})

const tableRef = ref(null)
const tableModel = ref({
  filter: getInitialFilter(),
  search: getInitialSearch(),
  selected: [],
  filterAndSearchData: {},
  header: [
    {
      name: 'title',
      label: '제목',
      field: 'title',
      align: 'center',
      headerStyle: 'min-width: 8rem'
    },
    {
      name: 'postDate',
      label: '게시기간',
      field: 'postDate',
      align: 'center'
    },
    {
      name: 'regDate',
      label: '등록일시',
      field: 'regDate',
      align: 'center'
    }
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

const closeLabel = ref('취소')
const reserveLabel = ref('확인')

onBeforeMount(async () => {
  tableModel.value.search = {
    ...tableModel.value.search,
    inputFilter: ''
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
  const data = await ticketApi.getTicketReservationCode().then((res) => res.data)
  const affiliateCardTypeList = FilterUtils.parseFilterArray(data).affiliateCardTypeList

  const cmsYnList = [
    { label: '전체', value: null },
    { label: '일반 프로모션', value: 'Y' },
    { label: '앱 전용 프로모션', value: 'N' }
  ]

  filterOptions.value = {
    affiliateCardTypeList,
    cmsYnList
  }

  tableModel.value.filter = {
    type: props.options.find((item) => item.value === props.type),
    cmsYn: filterOptions.value.cmsYnList[0],
    affiliateCardType: filterOptions.value.affiliateCardTypeList[0]
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

const onRequest = async (props) => {
  emitter.emit(COMMON.LOADING.SHOW)

  const { page, rowsPerPage } = props.pagination

  const response = await sitemanagementApi.getSubmenuList({
    ...FilterUtils.findSelectOptions(tableModel.value.filter),
    inputFilter: tableModel.value.search.inputFilter,
    page: page - 1,
    size: rowsPerPage
  })

  tableModel.value.rows = TableUtils.renderRow(response.data.content, tableModel.value.header)

  tableModel.value.pagination.page = page
  tableModel.value.pagination.rowsNumber = response.data.totalElements

  emitter.emit(COMMON.LOADING.HIDE)
}

const onEdit = async () => {
  if (tableModel.value.selected.length === 0) {
    alert('선택된 항목이 없습니다.')
    return
  }
  emitter.emit(COMMON.LOADING.SHOW)
  emit('update:model-value', tableModel.value.selected[0])

  emitter.emit(COMMON.LOADING.HIDE)
  hide()
}

const hide = () => {
  showModal.value = false
}

const hideModal = () => {
  emit('hide')
}
</script>
