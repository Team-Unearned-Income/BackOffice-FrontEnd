<template>
  <div class="form">
    <div class="row">
      <div class="col-2 form-th required">발송상태</div>
      <div class="col-auto form-td">
        {{ showSendStatus }}
      </div>
    </div>
    <div class="row">
      <div class="col-2 form-th required">마케팅 광고 여부</div>
      <div class="col-9 form-td">
        <q-checkbox
          v-model="checkMarketingYn"
          size="sm"
          style="max-width: 120px; justify-self: flex-end"
        />
        <span class="q-mr-sm">게시기간</span>
        <DoubleDateInput v-model="marketingPostDate" :disable="!checkMarketingYn" />
      </div>
    </div>
    <div class="row">
      <div class="col-2 form-th required">수신대상자</div>
      <div class="col-2 form-td">
        <q-select
          v-model="detailDataModel.recipientType"
          :options="filterOptions.recipientTypeList"
          class="full-width"
          dense
          hide-bottom-space
          outlined
          :disable="isDetailDisable"
        />
      </div>
      <div v-show="enableUserSearch" class="col-auto form-td q-gutter-x-md">
        <q-btn label="회원선택" :disable="isDetailDisable" @click="showUsersModal = true" />
        <q-file
          ref="fileRef"
          v-model="excel"
          label="EXCEL 업로드"
          outlined
          dense
          use-chips
          accept=".xlsx,.xls,.csv"
          @update:model-value="readXlsx"
          :disable="isDetailDisable"
        />
        <q-btn
          label="지정회원 조회"
          @click="
            () => {
              openTargetUserCheckModal()
            }
          "
        />
        <div class="col form-td q-pa-sm">{{ detailDataModel.targetCnt }}명</div>
      </div>
    </div>
    <div class="row">
      <div class="col-2 form-th required">직원 제외 여부</div>
      <div class="col-9 form-td">
        <q-checkbox
          v-model="checkStaffExceptionYn"
          size="sm"
          style="max-width: 120px; justify-self: flex-end"
        />
      </div>
    </div>
    <div class="row">
      <div class="col-2 form-th required">발송일시</div>
      <div class="col-10 form-td" style="justify-content: space-between">
        <div style="flex-direction: row; display: flex">
          <q-select
            v-model="detailDataModel.sendCycleType"
            :options="filterOptions.sendCycleTypeList"
            style="min-width: 120px; margin-right: 0.5rem"
            dense
            hide-bottom-space
            outlined
            :disable="isSendStatusComplete"
          />
          <DateInput
            v-show="showSendDate"
            v-model="detailDataModel.sendScheduleDate"
            style="margin-right: 0.5rem"
            :before-today-disable="detailDataModel.sendStatus !== 'COMPLETE'"
            :disable="isSendStatusComplete"
          />
          <TimeInput
            v-model="detailDataModel.sendScheduleTime"
            :placeholder="'HH:mm'"
            :readonly="false"
            :disable="isSendStatusComplete"
          />
        </div>
        <div v-if="detailDataModel.sendCycleType.value !== 'APPOINT'">
          <p>* 당일 푸시/알람 발송건이 완료된경우, 수정사항은 익일부터 적용됩니다.</p>
        </div>
      </div>
    </div>
    <div class="row">
      <div class="col-2 form-th required">제목</div>
      <div class="col-10 form-td">
        <q-input class="full-width" v-model="detailDataModel.title" outlined dense />
      </div>
    </div>
    <div class="row">
      <div class="col-2 form-th required">내용</div>
      <div class="col-10 form-td">
        <q-input
          class="full-width"
          v-model="detailDataModel.content"
          type="textarea"
          outlined
          dense
        />
      </div>
    </div>
    <div class="row">
      <div class="col-2 form-th required">링크</div>
      <div class="col-10 form-td" style="gap: 0.5rem">
        <q-select
          v-model="detailDataModel.linkUseYn"
          :options="filterOptions.linkUseYnList"
          style="min-width: 120px"
          label="링크 사용여부"
          dense
          hide-bottom-space
          outlined
        />
        <q-select
          v-model="detailDataModel.linkType"
          :options="filterOptions.linkTypeList"
          style="min-width: 120px"
          label="링크 종류"
          dense
          hide-bottom-space
          outlined
          :disable="detailDataModel.linkUseYn.value !== 'Y'"
        />
        <q-select
          v-if="enableScreenName"
          v-model="detailDataModel.screenName"
          :options="filterOptions.screenNameList"
          style="min-width: 120px"
          label="내부 화면"
          dense
          hide-bottom-space
          outlined
          @update:model-value="
            () => {
              detailDataModel.linkUrl = null
              detailDataModel.screenTitle = null
            }
          "
          :disable="detailDataModel.linkUseYn.value !== 'Y'"
        />
        <q-btn
          v-if="detailDataModel.linkType.value === 'SCREEN'"
          style="min-width: 120px"
          label="찾아보기"
          @click="showLinkModal = true"
          unelevated
          outline
          :disable="detailDataModel.linkUseYn.value !== 'Y'"
        />
        <q-input
          v-if="detailDataModel.linkType.value === 'SCREEN'"
          v-model="detailDataModel.screenTitle"
          class="full-width"
          label="제목"
          outlined
          center
          dense
          disable
        />
        <q-input
          v-else
          v-model="detailDataModel.linkUrl"
          class="full-width"
          :placeholder="linkPlaceHolder"
          :disable="!showLinkInput"
          outlined
          dense
        />
      </div>
    </div>
  </div>
  <div class="row q-py-md justify-between">
    <div class="q-gutter-x-md">
      <q-btn label="목록" @click="router.push(previousQueryUrl ?? { name: 'AlarmList' })" />
      <q-btn v-if="isEdit" label="삭제" @click="deletePush" />
      <q-btn v-if="enableCancel" label="취소" @click="cancelPush" />
    </div>
    <q-btn @click="onRegist">
      {{ submitLabel }}
    </q-btn>
  </div>
  <RegistToast
    v-if="showToast"
    v-model:show="showToast"
    :message="toastMessage"
    :duration="3000"
    :status="toastStatus"
    @hidden="
      () => {
        showToast = false
      }
    "
  />
  <UserSearchModal
    v-if="showUsersModal"
    v-model:show="showUsersModal"
    :selected="detailDataModel.recipientIdList"
    @update:selected="handleSelectedUpdate"
  />
  <TargetUserCheckModal
    v-if="showTargetUsersModal"
    v-model:show="showTargetUsersModal"
    :table-model="targetUserList"
  />
  <LinkSearchModal
    v-if="showLinkModal"
    v-model:show="showLinkModal"
    title="링크 검색"
    :type="detailDataModel.screenName.value"
    :options="filterOptions.screenNameList"
    style="min-width: 80vw"
    @update:model-value="
      (value) => {
        detailDataModel.linkUrl = value.seq
        detailDataModel.screenTitle = value.title
      }
    "
  />
</template>
<script setup>
import { computed, inject, nextTick, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import COMMON from '@/constants/commonConstatns.js'
import DateInput from '@/components/input/DateInput.vue'
import FilterUtils from '@/utils/FilterUtils.js'
import RegistToast from '@/components/dialog/RegistToast.vue'
import UserSearchModal from '@/components/modal/UserSearchModal.vue'
import TimeInput from '@/components/input/TimeInput.vue'
import LinkSearchModal from '@/components/modal/LinkSearchModal.vue'
import DoubleDateInput from '@/components/input/DoubleDateInput.vue'
import { previousQueryUrl } from '@/router'
import { read, utils } from 'xlsx'
import TargetUserCheckModal from '@/components/modal/TargetUserCheckModal.vue'
import { useAuthStore } from '@/stores/auth.js'

const router = useRouter()
const route = useRoute()
const emitter = inject('emitter')

/** masking */
const authStore = useAuthStore()

const showUsersModal = ref(false)
const showTargetUsersModal = ref(false)
const showLinkModal = ref(false)
const toastMessage = ref('등록이 완료되었습니다!')
const isEdit = ref(false)
const showToast = ref(false)
const toastStatus = ref('success')

const fileRef = ref(null)
const excel = ref(null)

const targetUserList = ref([])

const filterOptions = ref({
  pushTypeList: [],
  recipientTypeList: [],
  sendStatusList: [],
  linkUseYnList: [],
  linkTypeList: [],
  screenNameList: [],
  sendCycleTypeList: []
})

const isDetailDisable = ref(false)
const isSendStatusComplete = ref(false)

const enableScreenName = computed(() => {
  return detailDataModel.value.linkType.value === 'SCREEN'
})

const linkPlaceHolder = computed(() => {
  return detailDataModel.value.linkType.value === 'SCREEN'
    ? 'ID를 입력해주세요.'
    : 'URL을 입력해주세요.'
})

const enableUserSearch = computed(() => {
  return detailDataModel.value.recipientType.value === 'SPECIFY'
})

const submitLabel = computed({
  get() {
    if (detailDataModel.value.sendStatus === 'CANCEL') {
      return '재등록'
    }
    return detailDataModel.value.pushInfoSeq === -1 ? '등록' : '수정'
  }
})

const showSendDate = computed(() => {
  return detailDataModel.value.sendCycleType.value === 'APPOINT'
})

const showLinkInput = computed(() => {
  return detailDataModel.value.linkUseYn.value === 'Y'
})

const checkMarketingYn = computed({
  get() {
    return detailDataModel.value.marketingYn === 'Y'
  },
  set(value) {
    detailDataModel.value.marketingYn = value ? 'Y' : 'N'
    marketingPostDate.value.from = null
    marketingPostDate.value.to = null
  }
})

const checkStaffExceptionYn = computed({
  get() {
    return detailDataModel.value.staffExceptionYn === 'Y'
  },
  set(value) {
    detailDataModel.value.staffExceptionYn = value ? 'Y' : 'N'
  }
})

const enableCancel = computed(() => {
  return (
    detailDataModel.value.pushInfoSeq !== -1 &&
    detailDataModel.value.sendStatus !== 'CANCEL' &&
    detailDataModel.value.sendStatus !== 'COMPLETE'
  )
})

const showSendStatus = computed(() => {
  return (
    filterOptions.value.sendStatusList.find(
      (item) => item.value === detailDataModel.value.sendStatus
    )?.label || detailDataModel.value.sendStatus
  )
})

const detailDataModel = ref({
  pushInfoSeq: -1,
  sendStatus: 'WAITING',
  marketingYn: 'N',
  sendCycleType: {},
  recipientType: {},
  sendType: '',
  sendScheduleDate: '',
  sendScheduleTime: '',
  title: '',
  content: '',
  linkUseYn: '',
  linkType: { label: '', value: '' },
  screenName: '',
  linkUrl: '',
  recipientIdList: [],
  targetCnt: 0,
  staffExceptionYn: 'N'
})

const marketingPostDate = ref({
  from: null,
  to: null
})

const detailSetting = async () => {
  if (route.query.id === undefined) {
    return
  }
  await pushApi.getPushInfoEdit(route.query.id).then((res) => {
    detailDataModel.value.pushInfoSeq = res.data.pushInfoSeq
    if (res.data.sendStatus) detailDataModel.value.sendStatus = res.data.sendStatus
    if (res.data.marketingYn) detailDataModel.value.marketingYn = res.data.marketingYn
    if (res.data.sendType)
      detailDataModel.value.sendType = filterOptions.value.sendStatusList.find(
        (element) => element.value === res.data.sendType
      )
    if (res.data.recipientType)
      detailDataModel.value.recipientType = filterOptions.value.recipientTypeList.find(
        (element) => element.value === res.data.recipientType
      )
    if (res.data.staffExceptionYn) detailDataModel.value.staffExceptionYn = res.data.staffExceptionYn
    if (res.data.linkUseYn)
      detailDataModel.value.linkUseYn = filterOptions.value.linkUseYnList.find(
        (element) => element.value === res.data.linkUseYn
      )
    if (res.data.linkType)
      detailDataModel.value.linkType = filterOptions.value.linkTypeList.find(
        (element) => element.value === res.data.linkType
      )
    if (res.data.screenName)
      detailDataModel.value.screenName = filterOptions.value.screenNameList.find(
        (element) => element.value === res.data.screenName
      )
    if (res.data.screenTitle) detailDataModel.value.screenTitle = res.data.screenTitle
    if (res.data.sendCycleType)
      detailDataModel.value.sendCycleType = filterOptions.value.sendCycleTypeList.find(
        (element) => element.value === res.data.sendCycleType
      )
    if (res.data.sendScheduleDate)
      detailDataModel.value.sendScheduleDate = res.data.sendScheduleDate
    if (res.data.sendScheduleTime)
      detailDataModel.value.sendScheduleTime = res.data.sendScheduleTime
    if (res.data.title) detailDataModel.value.title = res.data.title
    if (res.data.content) detailDataModel.value.content = res.data.content
    if (res.data.linkUrl) detailDataModel.value.linkUrl = res.data.linkUrl

    if (res.data.recipientIdList) {
      detailDataModel.value.recipientIdList = [...res.data.recipientIdList]
    }
    if (res.data.sendStatus === null || res.data.sendStatus === '') {
      detailDataModel.value.sendStatus = 'WAITING'
    } else {
      detailDataModel.value.sendStatus = res.data.sendStatus
    }
    if (!res.data.sendCycleType) {
      detailDataModel.value.sendCycleType = filterOptions.value.sendCycleTypeList[0]
    }
    if (!res.data.recipientType) {
      detailDataModel.value.recipientType = filterOptions.value.recipientTypeList[0]
    }
    detailDataModel.value.targetCnt = res.data.targetCnt ?? 0
    marketingPostDate.value.from = res.data.marketingPostStartDate
    marketingPostDate.value.to = res.data.marketingPostEndDate
    isSendStatusComplete.value = res.data.sendStatus === 'COMPLETE'
  })
  isEdit.value = true

  isDetailDisable.value = true
}

const filterSetting = async () => {
  const filterList = await pushApi.getPushInfoEditCode().then((res) => res.data)
  filterOptions.value = await FilterUtils.parseFilterArray(filterList)

  filterOptions.value.recipientTypeList.unshift({ label: '선택하세요', value: null })

  detailDataModel.value.recipientType = filterOptions.value.recipientTypeList[0]
  detailDataModel.value.linkUseYn = filterOptions.value.linkUseYnList[0]
  detailDataModel.value.linkType = filterOptions.value.linkTypeList[0]
  detailDataModel.value.screenName = filterOptions.value.screenNameList[0]
  detailDataModel.value.sendCycleType = filterOptions.value.sendCycleTypeList[0]
}

const targetUserListSetting = async () => {
  targetUserList.value = await pushApi.getSpecifyMemberList(
    route.query.id,
    {
      maskingRemovalYn: authStore.isMasking()
    }
  )
    .then((res) => res.data)
    .catch((err) => {
      router.push({ name: 'AlarmList' })
    })
}

const handleSelectedUpdate = (selected) => {
  addToTargetList(selected)

  detailDataModel.value.recipientIdList = targetUserList.value.map((item) => item.userId)
  detailDataModel.value.recipientType = filterOptions.value.recipientTypeList.find(
    (element) => element.value === 'SPECIFY'
  )
}

const addToTargetList = (selected) => {
  const existingUserIds = new Set(targetUserList.value.map((user) => user.userId))
  const uniqueUsers = selected.filter((user) => !existingUserIds.has(user.userId))
  targetUserList.value = [...targetUserList.value, ...uniqueUsers]

  detailDataModel.value.targetCnt = targetUserList.value.length
}

const deletePush = async () => {
  const isDelete = confirm('정말 삭제하시겠습니까?')
  if (!isDelete) {
    return
  }
  try {
    await pushApi.deletePushInfo(route.query.id)
    alert('삭제되었습니다!')
    router.replace(previousQueryUrl.value ?? { name: 'AlarmList' })
  } catch (error) {
    alert('삭제에 실패하였습니다.')
  }
}

const cancelPush = async () => {
  const isCancel = confirm('정말 취소하시겠습니까?')
  if (!isCancel) {
    return
  }
  try {
    await pushApi.cancelPushInfo(route.query.id)
    detailDataModel.value.sendStatus = 'CANCEL'
    alert('취소되었습니다!')
  } catch (error) {
    alert('취소에 실패하였습니다.')
    await detailSetting()
  }
}

const onRegist = async () => {
  if (!checkValidEdit()) {
    return
  }
  const data = {
    marketingYn: detailDataModel.value.marketingYn,
    recipientType: detailDataModel.value.recipientType.value,
    sendType: 'TIME',
    sendStatus: detailDataModel.value.sendStatus ?? '',
    sendCycleType: detailDataModel.value.sendCycleType.value,
    sendScheduleDate: detailDataModel.value.sendScheduleDate,
    sendScheduleTime: detailDataModel.value.sendScheduleTime,
    marketingPostStartDate: marketingPostDate.value.from,
    marketingPostEndDate: marketingPostDate.value.to,
    title: detailDataModel.value.title,
    content: detailDataModel.value.content,
    linkUseYn: detailDataModel.value.linkUseYn.value,
    linkType: detailDataModel.value.linkUseYn.value === 'Y' ? detailDataModel.value.linkType.value : null,
    screenName: detailDataModel.value.linkUseYn.value === 'Y' ? detailDataModel.value.screenName.value !== 'AFFILIATE_CARD' ? detailDataModel.value.screenName.value : 'AFFILIATE-CARD' : null,
    screenTitle: detailDataModel.value.linkUseYn.value === 'Y' ? detailDataModel.value.screenTitle : null,
    linkUrl: detailDataModel.value.linkUseYn.value === 'Y' ? detailDataModel.value.linkUrl : null,
    recipientIdList: detailDataModel.value.recipientIdList,
    staffExceptionYn: detailDataModel.value.staffExceptionYn
  }
  if (data.sendCycleType !== 'APPOINT') {
    data.sendScheduleDate = null
  }
  if (detailDataModel.value.pushInfoSeq === -1) {
    try {
      await pushApi.registerPushInfo(data)
      toastStatus.value = 'success'
      toastMessage.value = '등록이 완료되었습니다!'
      alert('등록이 완료되었습니다!')
      router.replace(previousQueryUrl.value ?? { name: 'AlarmList' })
    } catch (error) {
      toastStatus.value = 'failed'
      toastMessage.value = '등록에 실패했습니다.'
      alert('등록에 실패했습니다.')
    }
  } else {
    try {
      (data.sendStatus = detailDataModel.value.sendStatus),
        (data.pushInfoSeq = detailDataModel.value.pushInfoSeq)
      await pushApi.updatePushInfo(data)
      toastStatus.value = 'success'
      toastMessage.value =
        detailDataModel.value.sendStatus === 'CANCEL'
          ? '재등록이 완료되었습니다!'
          : '수정이 완료되었습니다!'
    } catch (error) {
      toastStatus.value = 'failed'
      toastMessage.value = error.data[0].message
    }
  }
  showToast.value = true
  await detailSetting()
}

const checkValidEdit = () => {
  const {
    recipientType,
    sendCycleType,
    sendScheduleDate,
    sendScheduleTime,
    title,
    content,
    linkUseYn,
    linkUrl
  } = detailDataModel.value

  if (!recipientType.value?.trim()) {
    alert('수신대상을 선택해주세요.')
    return false
  }

  if (!sendCycleType) {
    alert('발송일시를 선택해주세요.')
    return false
  }

  if (sendCycleType?.value === 'APPOINT' && !sendScheduleDate) {
    alert('발송일자를 선택해주세요.')
    return false
  }

  if (!sendScheduleTime) {
    alert('발송시간을 선택해주세요.')
    return false
  }

  if (!title?.trim()) {
    alert('제목을 입력해주세요.')
    return false
  }

  if (!content?.trim()) {
    alert('내용을 입력해주세요.')
    return false
  }

  if (linkUseYn?.value === 'Y' && !linkUrl.toString()?.trim()) {
    alert('링크를 입력해주세요.')
    return false
  }

  if (sendScheduleDate && sendScheduleTime) {
    const sendDateTime = new Date(`${sendScheduleDate} ${sendScheduleTime}`)
    if (sendDateTime < new Date() && detailDataModel.value.sendStatus !== 'COMPLETE') {
      alert('발송일시는 현재 시간 이후로 설정해주세요.')
      return false
    }
  }

  return true
}

const readXlsx = () => {
  if (!excel.value) {
    targetUserList.value = []
    detailDataModel.value.recipientIdList = []
    return
  }
  const reader = new FileReader()

  reader.onload = () => {
    const fileData = reader.result
    const wb = read(fileData, { type: 'array' })

    const rows = utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { header: 1 })
    const dataRows = rows.slice(1)
    /** Excel의 행과 정확히 일치해야함 */
    const newTarget = dataRows.map((row) => ({
      userId: row[0],
      joinDate: row[1],
      marketingAgreeYn: row[2],
      visitDate: row[3],
      birthDate: row[4],
      gender: row[5],
      recentVisitDate: row[6],
      phoneNumber: row[7]
    }))

    const dedupedRows = [...new Map(newTarget.map(item => [item.userId, item])).values()]

    addToTargetList(dedupedRows)

    detailDataModel.value.recipientIdList = targetUserList.value.map((item) => item.userId)
  }
  reader.readAsArrayBuffer(excel.value)
}

const openTargetUserCheckModal = () => {
  emitter.emit(COMMON.LOADING.SHOW)
  showTargetUsersModal.value = true
  emitter.emit(COMMON.LOADING.HIDE)
}

onMounted(async () => {
  emitter.emit(COMMON.LOADING.SHOW)
  await filterSetting()
  await detailSetting()
  await nextTick()
  // if (route.query.id && detailDataModel.value.recipientType.value === 'SPECIFY') {
  //   await targetUserListSetting()
  // }
  emitter.emit(COMMON.LOADING.HIDE)
})
</script>
