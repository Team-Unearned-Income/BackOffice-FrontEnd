<template>
  <PageTable
    ref="tableRef"
    v-model.trim="tableModel"
    :virtual-idx="true"
    :table-style="{ height: '63vh' }"
    content-area-class="q-pb-sm"
    class="q-pa-md"
    @request="onRequest"
  >
      <template #filter-section>
        <div class="row justify-between" style="margin-bottom: 1rem">
          <div class="text-h6 text-bold">예매조회</div>
        </div>
        <q-form ref="groupTicketRef">
          <div class="form">
            <div class="row">
              <div class="col-1 form-th">이용일</div>
              <div class="col-4 form-td">
                <DoubleDateInput
                  v-model="useDt"
                  :rules="[(val) => val && val[0] && val[1] ? true : '이용일을 입력해주세요.']"
                />
              </div>
            </div>
          </div>
        </q-form>

        <!-- TableFilter 영역 -->
        <div class="row justify-between q-pt-lg">
          <div style="display: flex; gap: 1rem; margin-bottom: 10px;">
            <q-btn label="목록" @click="router.push({ name: 'GroupTicket' })" />
          </div>
          <div>
            <q-btn style="background-color: #169bd5; color: white" label="QR발급" @click="onRegist" />
          </div>
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

<script setup>
import { inject, nextTick, onBeforeMount, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { previousQueryUrl } from '@/router'
import COMMON from '@/constants/commonConstatns.js'
import PageTable from '@/components/table/PageTable.vue'
import FilterUtils from '@/utils/FilterUtils.js'
import DoubleDateInput from '@/components/input/DoubleDateInput.vue'
import TableUtils from '@/utils/TableUtils.js'
import RegistToast from '@/components/dialog/RegistToast.vue'


const route = useRoute()
const router = useRouter()
const emitter = inject('emitter')
const showToast = ref(false)
const tableRef = ref(null)
const useDt = ref({
  from: null,
  to: null
})
const groupTicketRef = ref(null)
const tableModel = ref({
  selected: [],
  header: [
    {
      name: 'useDate',
      label: '이용일',
      field: 'useDateRange',
      align: 'center',
      format: (value, row) => {
      return row.useStartDate !== null && row.useEndDate.length !== 0
        ? `${row.useStartDate} ~ ${row.useEndDate}`
        : value
      },
      style: 'white-space: normal'
    },
    {
      name: 'createdAt',
      label: '등록일',
      field: 'createdAt',
      align: 'center'
    }
  ],
  rows: [],
  pagination: {
    sortBy: '',
    descending: false,
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

  await nextTick(async () => {
    await tableRef.value.requestServerInteraction()
  })

  emitter.emit(COMMON.LOADING.HIDE)
})

const onRegist = async () => {
  if (!(await groupTicketRef.value.validate())) return
  await marketingApi.createGroupTicketNewQrCode({
    ...FilterUtils.findSelectOptions(tableModel.value.filter),
    useStartDate: useDt.value?.from,
    useEndDate: useDt.value?.to,
  })
   showToast.value = true
   setTimeout(() => {
       router.replace(previousQueryUrl.value ?? { name: 'GroupTicket' })
     }, 1000)
}

const onRequest = async (_props) => {
  emitter.emit(COMMON.LOADING.SHOW)

  const today = new Date()

  const tableRowResponse = await marketingApi.getGroupTicketNewList({
    ...FilterUtils.findSelectOptions(tableModel.value.filter),
    useStartDate: new Date(new Date().setMonth(today.getMonth() - 1))
           .toLocaleDateString('en-CA')
           .slice(0, 10),
     useEndDate: today.toLocaleDateString('en-CA').slice(0, 10),
    page: tableModel.value.pagination.page - 1,
    size: tableModel.value.pagination.rowsPerPage
  })

  tableModel.value.rows = TableUtils.renderRow(
    tableRowResponse.data.content,
    tableModel.value.header
  )
  tableModel.value.pagination.page = tableRowResponse.data.pageable.pageNumber + 1
  tableModel.value.pagination.rowsPerPage = tableRowResponse.data.pageable.pageSize
  tableModel.value.pagination.rowsNumber = tableRowResponse.data.totalElements

  emitter.emit(COMMON.LOADING.HIDE)
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
