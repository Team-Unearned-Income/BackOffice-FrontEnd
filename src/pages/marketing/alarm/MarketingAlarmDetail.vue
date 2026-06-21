<template>
  <PageTable
    ref="tableRef"
    :virtual-idx="true"
    v-model.trim="tableModel"
    class="q-pa-md"
    :table-style="{
      height: '63vh'
    }"
    content-area-class="q-pb-sm"
    @request="onRequest"
  >
    <template #filter-section>
      <div class="form">
        <div class="row">
          <div class="col-1 form-th">발송상태</div>
          <div class="col">{{ detailDataModel.sendStatus }}</div>
        </div>
        <div class="row">
          <div class="col-1 form-th">제목</div>
          <div class="col">{{ detailDataModel.title }}</div>
        </div>
        <div class="row">
          <div class="col-1 form-th">내용</div>
          <div class="col">
            <div class="multiline-text">{{ detailDataModel.description }}</div>
          </div>
        </div>
        <div class="row">
          <div class="col-1 form-th">수신대상자</div>
          <div class="col">{{ detailDataModel.recipientType }}</div>
        </div>
        <div class="row">
          <div class="col-1 form-th">마케팅 광고 여부</div>
          <div class="col">{{ detailDataModel.marketingYn }}</div>
        </div>
        <div class="row">
          <div class="col-1 form-th">발송일시</div>
          <div class="col">{{ detailDataModel.sendDateTime }}</div>
        </div>
        <div class="row">
          <div class="col-1 form-th">발송상세</div>
          <div class="col">{{ detailDataModel.sendDetail }}</div>
        </div>
      </div>
<!--      <div class="q-py-md" />-->
      <!-- TableFilter 영역 -->
      <div class="row q-py-md justify-end">
        <div style="display: flex; gap: 1rem">
          <q-btn
            :label="!isDownloading ? 'EXCEL 다운로드' : downloadProgress + ' %'"
            :disable="isDownloading"
            :class="{ 'no-blur': isDownloading }"
            @click="downloadList"
          >
          </q-btn>
        </div>
      </div>
    </template>

    <template #top-right>
      <q-select
        v-model="confirmYn"
        :display-value="`${confirmYn.label}`"
        :options="[
          { label: '전체', value: null },
          { label: '확인', value: 'Y' },
          { label: '미확인', value: 'N' }
        ]"
        @update:model-value="onRequest({ pagination: tableModel.pagination })"
        dense
      />
    </template>
    <template #bottom>
      <div class="row q-py-md justify-start q-gutter-md">
        <q-btn label="목록" @click="goList" />
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
</template>

<script>
const getInitialSearch = () => ({
  inputFilter: ''
})

const getInitialFilter = () => ({
  postYn: {}
})
</script>
<script setup>
import { inject, nextTick, onBeforeMount, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import COMMON from '@/constants/commonConstatns.js'
import PageTable from '@/components/table/PageTable.vue'
import { pushApi } from '@/service/api'
import { REGEX } from '@/constants/regualExpression'
import FilterUtils from '@/utils/FilterUtils.js'
import TableUtils from '@/utils/TableUtils.js'
import { previousQueryUrl } from '@/router'
import { useAuthStore } from '@/stores/auth.js'
import axios from "axios";
import PasswordCheckModal from "@/components/modal/PasswordCheckModal.vue";
import OtpCheckModal from "@/components/modal/OtpCheckModal.vue";

const route = useRoute()
const router = useRouter()
const emitter = inject('emitter')

/** masking*/
const authStore = useAuthStore()

/** 마스킹 해제, 엑셀 다운로드 시 검증 */
const isPassValid = ref(false)

/* 엑셀 다운로드용 비밀번호 검증 모달 */
const showPassModal = ref(false)

/** Fake Progress */
const isDownloading = ref(false)
const downloadProgress = ref(0)

/* PasswordCheckModal 초기화에 필요 */
const filterOptions = ref({})

const confirmYn = ref({ label: '전체', value: null })

const detailDataModel = ref({
  sendStatus: '',
  title: '',
  content: '',
  recipientType: '',
  sendDateTime: '',
  marketingYn: '',
  totalRecipient: 0,
  totalConfirm: 0,
  totalUnConfirm: 0
})

const codeModel = ref({
  sendStatusList: [],
  recipientTypeList: [],
  linkUseYnList: [],
  linkTypeList: [],
  screenNameList: []
})

const tableRef = ref(null)
const tableModel = ref({
  search: getInitialSearch(),
  selected: [],
  filterAndSearchData: {},
  header: [
  {
      name: 'sendDate',
      label: '발송일자',
      field: 'sendDate',
      align: 'center'
    },
    {
      name: 'sendStatus',
      label: '발송상태',
      field: 'sendStatus',
      align: 'center',
      format: (value) => {
        return codeModel.value.sendStatusList.find((item) => item.value === value)?.label || value
      }
    },
    {
      name: 'nickName',
      label: '수신자 닉네임',
      field: 'nickName',
      align: 'center'
    },
    {
      name: 'phoneNumber',
      label: '연락처',
      field: 'phoneNumber',
      align: 'center',
      format: (value) => {
        return value.replace(REGEX.PHONE_NUM, '$1-$2-$3')
      }
    },
    {
      name: 'receivedDate',
      label: '실 발송일시',
      field: 'receivedDate',
      align: 'center'
    },
    {
      name: 'confirmYn',
      label: '확인여부',
      field: 'confirmYn',
      align: 'center',
      format: (value) => {
        return value === 'Y' ? '확인' : '미확인'
      }
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

const codeSetting = async () => {
  const codeList = await pushApi.getPushInfoEditCode().then((res) => res.data)
  codeModel.value = await FilterUtils.parseFilterArray(codeList)
}

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
  await codeSetting()
  await detailSetting()
  await nextTick(async () => {
    await tableRef.value.requestServerInteraction()
  })

  emitter.emit(COMMON.LOADING.HIDE)
})

const refreshData = async () => {
  await nextTick(async () => {
    await tableRef.value.requestServerInteraction()
  })
}

const goList = async () => {
  router.push(previousQueryUrl.value ?? { name: 'AlarmList' })
}

const detailSetting = async () => {
  await pushApi.getPushInfoDetail(route.query.id).then(
    (res) =>
      (detailDataModel.value = {
        sendStatus: res.data.sendStatus,
        title: res.data.title,
        description: res.data.content,
        recipientType: res.data.recipientType,
        sendDateTime: res.data.sendDateTime,
        totalRecipient: res.data.totalRecipientCount,
        totalConfirm: res.data.totalConfirmCount,
        totalUnConfirm: res.data.totalUnconfirmCount,
        sendDetail: res.data.sendDetail,
        marketingYn: res.data.marketingYn
      })
  )
}

const downloadList = async () => {
  passValidCheckRequired()
  const pushId = route.query.id
  const confirmValue = confirmYn.value?.value ?? null

  console.log('엑셀 다운로드 요청:', { pushId, confirmValue })

  isDownloading.value = true
  downloadProgress.value = 0

  let progress = 0
  const progressInterval = setInterval(() => {
    if (progress < 99) {
      progress++
      downloadProgress.value = progress
    }
  }, 100)

  await pushApi
  .getPushInfoDetailUserExcel(pushId, confirmValue, { format: 'blob' })
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

  // try {
  //   emitter.emit(COMMON.LOADING.SHOW)
  //
  //   const params = {}
  //   if (confirmValue !== null) {
  //     params.confirmYn = confirmValue
  //   }
  //
  //   const response = await axios.get(
  //     `${import.meta.env.VITE_API_SERVER}/api/v1/push/${pushId}/user/excel`,
  //     {
  //       params,
  //       headers: {
  //         Authorization: `Bearer ${JSON.parse(localStorage.getItem('auth'))?.accessToken}`,
  //       },
  //       responseType: 'blob',
  //     }
  //   )
  //
  //   const blob = new Blob([response.data], {
  //     type: response.headers['content-type'],
  //   })
  //
  //   const disposition = response.headers['content-disposition']
  //   let filename = 'push_user_list.csv'
  //   if (disposition && disposition.includes('filename=')) {
  //     const match = disposition.match(/filename\*=UTF-8''(.+)|filename="(.+)"/)
  //     if (match) {
  //       filename = decodeURIComponent(match[1] || match[2])
  //     }
  //   }
  //
  //   const url = window.URL.createObjectURL(blob)
  //   const link = document.createElement('a')
  //   link.href = url
  //   link.setAttribute('download', filename)
  //   document.body.appendChild(link)
  //   link.click()
  //   link.remove()
  //   window.URL.revokeObjectURL(url)
  // } catch (error) {
  //   console.error('푸시 사용자 엑셀 다운로드 중 오류 발생:', error)
  // } finally {
  //   emitter.emit(COMMON.LOADING.HIDE)
  // }
}

const onRequest = async (props) => {
  emitter.emit(COMMON.LOADING.SHOW)
  const { page, rowsPerPage } = props.pagination

  const tableRowResponse = await pushApi.getPushInfoDetailUser(route.query.id, {
    confirmYn: confirmYn.value.value,
    page: page - 1,
    size: rowsPerPage,
    maskingRemovalYn: authStore.isMasking()
  })

  tableModel.value.rows = TableUtils.renderRow(
    tableRowResponse.data.content,
    tableModel.value.header
  )
  tableModel.value.pagination.page = page
  tableModel.value.pagination.rowsNumber = tableRowResponse.data.totalElements

  emitter.emit(COMMON.LOADING.HIDE)
}

const passValidCheckRequired = () => {
  if(isPassValid.value) {
    return
  }
  if(authStore.isMasking()) return
  showPassModal.value = true
}

</script>
<style scoped>
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

.multiline-text {
  white-space: pre-line;
}
</style>
