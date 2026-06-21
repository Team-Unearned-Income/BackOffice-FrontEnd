<template>
  <PagingConfirm
    v-model:show="showModal"
    :title="'지정회원 조회'"
    :show-close-btn="false"
    style="min-width: 80vw; height: 80vh"
    @hide="hideModal"
  >
    <template #content>
      <PageTable
        ref="tableRef"
        v-model="tableModel"
        class="q-px-md"
        :table-style="{ height: '53vh' }"
        :virtual-idx="true"
        content-area-class="q-pb-sm"
        @request="onRequest"
      />
    </template>
  </PagingConfirm>
</template>

<script setup>
import { inject, nextTick, onMounted, ref } from 'vue'
import DateUtils from '@/utils/DateUtils'
import { pushApi } from '@/service/api'
import TableUtils from '@/utils/TableUtils.js'
import { useRoute } from 'vue-router'
import PageTable from '@/components/table/PageTable.vue'
import PagingConfirm from '@/components/modal/PagingConfirm.vue'
import COMMON from '@/constants/commonConstatns.js'

const emitter = inject('emitter')
const emit = defineEmits(['hide'])

const route = useRoute()
const showModal = defineModel('show', {
  type: Boolean,
  default: () => true,
  required: true
})

const props = defineProps({
  tableModel: {
    type: Array,
    default: () => []
  }
})

const selectedModel = ref([])

const tableRef = ref(null)
const tableModel = ref({
  header: [
    {
      name: 'userId',
      label: '고유번호',
      field: 'userId',
      align: 'center',
      headerStyle: 'min-width: 7rem'
    },
    {
      name: 'phoneNumber',
      label: '휴대폰 번호',
      field: 'phoneNumber',
      align: 'center'
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
      format: (value) => (value != null ? `${value}회` : value)
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
    page: 1,
    rowsNumber: 0,
    rowsPerPage: 20
  }
})

onMounted(async () => {
  await nextTick(() => {
    // 초기 호출: 반드시 pagination 정보가 있는 props 객체를 넘겨서 호출
    tableRef.value?.requestServerInteraction({
      pagination: {
        page: tableModel.value.pagination.page ?? 1,
        rowsPerPage: tableModel.value.pagination.rowsPerPage ?? 20
      }
    })
    selectedModel.value = props.tableModel
  })
})

const updateTablePage = (page, pageSize) => {
  const start = (page - 1) * pageSize
  const end = start + pageSize
  tableModel.value.rows = selectedModel.value.slice(start, end)
  tableModel.value.pagination.page = page
  tableModel.value.pagination.rowsPerPage = pageSize
  tableModel.value.pagination.rowsNumber = selectedModel.value.length
}

const onRequest = async (props) => {
  emitter.emit(COMMON.LOADING.SHOW)

  const page = props?.pagination?.page ?? 1
  const size = props?.pagination?.rowsPerPage ?? 20

  if (!route.query.id) {
    updateTablePage(page, size)
    emitter.emit(COMMON.LOADING.HIDE)
    return
  }

  try {
    const response = await pushApi.getSpecifyMemberList(route.query.id, { page: page - 1, size })
    const { content, pageable, totalElements } = response.data
    tableModel.value.rows = TableUtils.renderRow(content, tableModel.value.header)
    tableModel.value.pagination.page = pageable.pageNumber + 1
    tableModel.value.pagination.rowsPerPage = pageable.pageSize
    tableModel.value.pagination.rowsNumber = totalElements

    emit('update:tableModel', tableModel.value.rows)
  } catch (error) {
    tableModel.value.rows = []
    tableModel.value.pagination.rowsNumber = 0
  }

  emitter.emit(COMMON.LOADING.HIDE)
}

const hideModal = () => {
  emit('hide')
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
  margin-top: calc(63vh - 40px);
}
</style>
