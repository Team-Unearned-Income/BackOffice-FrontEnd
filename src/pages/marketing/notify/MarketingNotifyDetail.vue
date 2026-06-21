<template>
  <div class="form">
    <div class="row">
      <div class="col-2 form-th required">게시여부</div>
      <div class="col-auto form-td justify-between">
        <q-radio
          v-model="detailDataModel.postYn"
          val="N"
          label="미게시"
          :disable="route.query.cmsYn === 'Y'"
        ></q-radio>
        <q-radio
          v-model="detailDataModel.postYn"
          val="Y"
          label="게시"
          :disable="route.query.cmsYn === 'Y'"
        ></q-radio>
      </div>
      <div class="col-auto form-td">
        <q-checkbox
          v-model="enablePostDate"
          size="sm"
          label="게시기간"
          :disable="route.query.cmsYn === 'Y'"
        />
      </div>
      <div class="col-5 form-td">
        <DateInput
          v-model="detailDataModel.postDateRange.from"
          style="margin-right: 0.5rem"
          :disable="!enablePostDate || route.query.cmsYn === 'Y'"
        />
        ~
        <DateInput
          v-model="detailDataModel.postDateRange.to"
          style="margin-left: 0.3rem;margin-right: 0.5rem"
          :disable="!enablePostDate || route.query.cmsYn === 'Y'"
        />
      </div>
      <div style="width: 300px;">
        <DoubleTimeInput
          v-model="postTime"
          :start-time="detailDataModel.postStartTime"
          :end-time="detailDataModel.postEndTime"
          :disable="!enablePostDate || route.query.cmsYn === 'Y'"
        />
      </div>
    </div>
    <div v-if="route.query.cmsYn === 'Y'" class="row">
      <div class="col-2 form-th required">앱 노출 여부</div>
      <div class="col-auto form-td justify-between">
        <q-radio v-model="detailDataModel.appPostYn" val="N" label="미게시"></q-radio>
        <q-radio v-model="detailDataModel.appPostYn" val="Y" label="게시"></q-radio>
      </div>
      <div class="col-auto form-td">
        <q-checkbox v-model="enableAppPostDate" size="sm" label="게시기간" />
      </div>
      <div class="col-4 form-td">
        <DoubleDateInput v-model="detailDataModel.appPostDateRange" :disable="!enableAppPostDate" />
      </div>
      <div class="col-auto form-td">
        <p style="margin: 0">* 게시기간 체크박스가 활성화 된 경우에만 게시기간이 적용됩니다.</p>
      </div>
    </div>
    <div class="row">
      <div class="col-2 form-th required">제목</div>
      <div class="col-9 form-td">
        <q-input
          v-model="detailDataModel.title"
          class="full-width"
          outlined
          dense
          hide-bottom-space
          :disable="route.query.cmsYn === 'Y'"
          :rules="[(val) => !!val || '제목을 입력해주세요.']"
        />
      </div>
    </div>
    <div class="row">
      <div class="col-2 form-th">공지지정</div>
      <div class="col-auto form-td">
        <q-checkbox v-model="enableNoticeDate" size="sm" label="공지글로 지정" />
      </div>
      <div class="col-3 form-td">
        <DateInput
          v-model="detailDataModel.noticeDateRange.from"
          style="margin-right: 0.5rem"
          :disable="!enableNoticeDate"
        />
        ~
        <DateInput
          v-model="detailDataModel.noticeDateRange.to"
          style="margin-left: 0.3rem;margin-right: 0.5rem"
          :disable="!enableNoticeDate"
        />
      </div>
      <div class="col-3 form-td">
        <DoubleTimeInput
          v-model="noticeTime"
          :start-time="detailDataModel.noticeStartTime"
          :end-time="detailDataModel.noticeEndTime"
          :disable="!enableNoticeDate"
        />
      </div>
      <div class="col-2 form-td">
        <span>* 공지기간이 종료된 경우 체크박스가 활성화 되어있어도 공지글에서 제외됩니다.</span>
      </div>
    </div>
    <div v-if="!route.query.cmsYn || route.query.cmsYn === 'N' " class="row">
      <div class="col-2 form-th required">공지 목록 노출</div>
      <div class="col-auto form-td justify-between">
        <q-radio
          v-model="detailDataModel.appLinkPostYn"
          val="N"
          label="노출"
        ></q-radio>
        <q-radio
          v-model="detailDataModel.appLinkPostYn"
          val="Y"
          label="노출안함"
        ></q-radio>
      </div>
    </div>

    <div v-if="route.query.cmsYn !== 'Y'" class="row">
      <div class="col-2 form-th">첨부파일</div>
      <div class="col">
        <FileInput
          v-if="isShown"
          ref="fileInputRef"
          v-model="files"
          :file-group-id="detailDataModel.fileGroupId"
          :file-info="fileInfo"
        />
      </div>
    </div>
    <div v-if="route.query.cmsYn === 'Y'" class="row">
      <div v-html="detailDataModel.content"></div>
    </div>
    <div v-else class="row">
      <HtmlEditor
        v-model="detailDataModel.content"
        :file-group-id="detailDataModel.fileGroupId"
        file-feature="notice"
        @update:file-group-id="detailDataModel.fileGroupId = $event"
      />
    </div>
  </div>
  <div class="row q-py-md justify-between">
    <div class="q-gutter-md">
      <q-btn label="목록" @click="goList" />
      <q-btn
        v-if="enableDeletion"
        label="삭제"
        :disable="route.query.cmsYn === 'Y'"
        @click="onDelete"
      />
    </div>
    <q-btn @click="onRegist">{{ submitLabel }}</q-btn>
  </div>
  <RegistToast
    v-if="showToast"
    :message="toastMessage"
    :duration="3000"
    @hidden="
      () => {
        showToast = false
      }
    "
  />
</template>

<script setup>
import { computed, inject, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { marketingApi } from '@/service/api'
import DoubleDateInput from '@/components/input/DoubleDateInput.vue'
import DateInput from '@/components/input/DateInput.vue'
import COMMON from '@/constants/commonConstatns.js'
import HtmlEditor from '@/components/input/HtmlEditor.vue'
import FileInput from '@/components/input/FileInput.vue'
import RegistToast from '@/components/dialog/RegistToast.vue'
import { previousQueryUrl } from '@/router'
import DoubleTimeInput from '@/components/input/DoubleTimeInput.vue'

const showLinkModal = ref(false)
const route = useRoute()
const router = useRouter()
const emitter = inject('emitter')

const enablePostDate = computed({
  get() {
    return detailDataModel.value.postPeriodYn === 'Y' ? true : false
  },
  set(value) {
    detailDataModel.value.postPeriodYn = value ? 'Y' : 'N'
    detailDataModel.value.postDateRange = { from: '', to: '' }
  }
})

const enableAppPostDate = computed({
  get() {
    return detailDataModel.value.appPostPeriodYn === 'Y' ? true : false
  },
  set(value) {
    detailDataModel.value.appPostPeriodYn = value ? 'Y' : 'N'
    detailDataModel.value.appPostDateRange = { from: '', to: '' }
  }
})

const enableNoticeDate = computed({
  get() {
    return detailDataModel.value.noticeYn === 'Y' ? true : false
  },
  set(value) {
    detailDataModel.value.noticeYn = value ? 'Y' : 'N'
    detailDataModel.value.noticeDateRange = { from: '', to: '' }
  }
})

const submitLabel = computed({
  get() {
    return detailDataModel.value.noticeSeq === -1 ? '등록' : '수정'
  }
})

const enableDeletion = computed({
  get() {
    return detailDataModel.value.noticeSeq === -1 ? false : true
  }
})

const fileInfo = computed(() => {
  const { fileId, realNm, size } = detailDataModel.value || {}
  return fileId && realNm && size ? { fileId, realNm, size } : null
})

const files = ref('')
const fileInputRef = ref(null)
const isShown = ref(false)
const showToast = ref(false)
const toastMessage = ref('수정이 완료되었습니다!')

const detailDataModel = ref({
  noticeSeq: -1,
  postYn: 'N',
  noticeYn: 'N',
  postPeriodYn: 'N',
  appLinkPostYn: 'N',
  title: '',
  content: '',
  fileGroupId: '',
  postDateRange: { from: '', to: '' },
  appPostDateRange: { from: '', to: '' },
  noticeDateRange: { from: '', to: '' },
  postStartTime: null,
  postEndTime: null,
  noticeStartTime: null,
  noticeEndTime: null,
  linkUseYn: '',
  linkType: { label: '', value: '' },
  screenName: '',
  linkUrl: ''
})

const postTime = ref({})
const noticeTime = ref({})

const detailSetting = async () => {
  const detailInfo = await marketingApi
    .getNoticeDetail(route.query.idx, route.query.cmsYn)
    .then((res) => res.data)

  if (route.query.cmsYn === 'Y') {
    detailInfo.appPostYn = detailInfo.appPostYn ?? 'N'
    detailInfo.appPostPeriodYn = detailInfo.appPostPeriodYn ?? 'N'
    detailInfo.noticeYn = detailInfo.noticeYn ?? 'N'
  }

  detailDataModel.value = detailInfo

  detailDataModel.value.postDateRange = {
    from: detailInfo.postStartDt,
    to: detailInfo.postEndDt
  }
  detailDataModel.value.appPostDateRange = {
    from: detailInfo.appPostStartDt,
    to: detailInfo.appPostEndDt
  }
  detailDataModel.value.noticeDateRange = {
    from: detailInfo.noticeStartDt,
    to: detailInfo.noticeEndDt
  }
  detailDataModel.value.postStartTime = detailInfo.postStartTime
  detailDataModel.value.postEndTime = detailInfo.postEndTime
  detailDataModel.value.noticeStartTime = detailInfo.noticeStartTime
  detailDataModel.value.noticeEndTime = detailInfo.noticeEndTime
}

const goList = () => {
  router.push(previousQueryUrl.value ?? { name: 'NotifyList' })
}

const onRegist = async () => {
  if (!checkValidEdit()) return
  const dateFrom = new Date(detailDataModel.value.postDateRange.from)
  const dateTo = new Date(detailDataModel.value.postDateRange.to)
  if (detailDataModel.value.postDateRange.from && detailDataModel.value.postDateRange.to && dateFrom > dateTo) {
    alert('게시기간 종료일이 시작일보다 큽니다.')
    return
  }

  const noticeDateFrom = new Date(detailDataModel.value.noticeDateRange.from)
  const noticeDateTo = new Date(detailDataModel.value.noticeDateRange.to)
  if (detailDataModel.value.noticeDateRange.from && detailDataModel.value.noticeDateRange.to && noticeDateFrom > noticeDateTo) {
    alert('공지지정 종료일이 시작일보다 큽니다.')
    return
  }

  if (!route.query || Object.keys(route.query).length === 0) {
    await marketingApi
      .regNotice({
        cmsYn: 'N',
        postYn: detailDataModel.value.postYn,
        postPeriodYn: detailDataModel.value.postPeriodYn,
        postStartDt: detailDataModel.value.postDateRange.from,
        postEndDt: detailDataModel.value.postDateRange.to,
        postStartTime: postTime.value.startTime,
        postEndTime: postTime.value.endTime,
        appLinkPostYn: detailDataModel.value.appLinkPostYn,
        title: detailDataModel.value.title,
        noticeYn:
          detailDataModel.value.noticeYn === '' || detailDataModel.value.noticeYn === null
            ? 'N'
            : detailDataModel.value.noticeYn,
        noticeStartDt: detailDataModel.value.noticeDateRange.from,
        noticeEndDt: detailDataModel.value.noticeDateRange.to,
        noticeStartTime: noticeTime.value.startTime,
        noticeEndTime: noticeTime.value.endTime,
        content: detailDataModel.value.content,
        fileGroupId:
          detailDataModel.value.fileGroupId === '' ? null : detailDataModel.value.fileGroupId
      })
      .then(async (res) => {
        detailDataModel.value.noticeSeq = res.data.noticeSeq
        detailDataModel.value.fileGroupId = res.data.fileGroupId
      })
    if (files.value) {
      await marketingApi.uploadNoticeFile({
        noticeSeq: detailDataModel.value.noticeSeq,
        uploadFile: files.value
      })
    }
    alert('등록이 완료되었습니다!')
    router.push(previousQueryUrl.value ?? { name: 'NotifyList' })
    toastMessage.value = '등록이 완료되었습니다!'
    showToast.value = true
    submitLabel.value = '수정'
  } else {
    if (route.query.cmsYn === 'Y') {
      await marketingApi.updateNoticeDetail(route.query.idx, 'Y', {
        cmsYn: 'Y',
        postYn: detailDataModel.value.appPostYn,
        postPeriodYn: detailDataModel.value.appPostPeriodYn,
        postStartDt: detailDataModel.value.appPostDateRange.from,
        postEndDt: detailDataModel.value.appPostDateRange.to,
        bbsIdx: route.query.idx,
        title: detailDataModel.value.title,
        noticeYn: detailDataModel.value.noticeYn,
        noticeStartDt: detailDataModel.value.noticeDateRange.from,
        noticeEndDt: detailDataModel.value.noticeDateRange.to,
        noticeStartTime: noticeTime.value.startTime,
        noticeEndTime: noticeTime.value.endTime,
        content: ''
      })
    } else {
      await marketingApi.updateNoticeDetail(detailDataModel.value.noticeSeq, 'N', {
        cmsYn: 'N',
        postYn: detailDataModel.value.postYn,
        postPeriodYn: detailDataModel.value.postPeriodYn,
        postStartDt: detailDataModel.value.postDateRange.from,
        postEndDt: detailDataModel.value.postDateRange.to,
        postStartTime: postTime.value.startTime ?? detailDataModel.value.postStartTime,
        postEndTime: postTime.value.endTime ?? detailDataModel.value.postEndTime,
        title: detailDataModel.value.title,
        noticeYn: detailDataModel.value.noticeYn,
        appLinkPostYn: detailDataModel.value.appLinkPostYn,
        noticeStartDt: detailDataModel.value.noticeDateRange.from,
        noticeEndDt: detailDataModel.value.noticeDateRange.to,
        noticeStartTime: noticeTime.value.startTime,
        noticeEndTime: noticeTime.value.endTime,
        content: detailDataModel.value.content,
        fileGroupId: detailDataModel.value.fileGroupId
      })

      if (files.value) {
        // 파일 새로 올리는 경우
        await marketingApi.uploadNoticeFile({
          noticeSeq: detailDataModel.value.noticeSeq,
          deleteFileId: detailDataModel.value.fileId ?? null,
          uploadFile: files.value
        })
      } else {
        // X버튼을 눌렀을 때, 삭제 API가 필요
        if (files.value === null && detailDataModel.value.fileId !== null) {
          await marketingApi.uploadNoticeFile({
            noticeSeq: detailDataModel.value.noticeSeq,
            deleteFileId: detailDataModel.value.fileId,
            uploadFile: new Blob([''])
          })
        }
      }
    }
    await detailSetting()

    try {
      alert('수정이 완료되었습니다!')
      await router.push(previousQueryUrl.value ?? { name: 'NotifyList' })
    } catch {
      toastMessage.value = '수정에 실패하였습니다!'
      showToast.value = true
    }
  }
}

const onDelete = async () => {
  const isDelete = confirm('정말 삭제하시겠습니까?')
  if (!isDelete) {
    return
  }
  try {
    await marketingApi.deleteNotice(route.query.idx)
    alert('삭제되었습니다!')
    router.push(previousQueryUrl.value ?? { name: 'NotifyList' })
  } catch (error) {
    alert('삭제에 실패하였습니다.')
  }
}

const checkValidEdit = () => {
  if (detailDataModel.value.title === '' || detailDataModel.value.title === null) {
    alert('제목을 입력해주세요')
    return false
  }

  return true
}

onMounted(async () => {
  if (route.query.idx !== undefined) {
    emitter.emit(COMMON.LOADING.SHOW)
    await detailSetting()
    emitter.emit(COMMON.LOADING.HIDE)
  }
  isShown.value = true
})
</script>
