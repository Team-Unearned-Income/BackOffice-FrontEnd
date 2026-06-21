<template>
  <div class="form">
    <div class="row">
          <div class="col-1 form-th">기존 제목</div>
          <div class="col-11 form-td">{{ detailDataModel.titleWithMapping }}</div>
        </div>
        <div class="row">
          <div class="col-1 form-th">기존 내용</div>
          <div class="col-11 form-td">{{ detailDataModel.contentWithMapping }}</div>
        </div>
    <div class="row">
      <div class="col-2 form-th required">제목</div>
      <div class="col-10 form-td">
        <q-input v-model="detailDataModel.titleWithMapping" class="full-width" outlined dense />
      </div>
    </div>
    <div class="row">
      <div class="col-2 form-th required">내용</div>
      <div class="col-10 form-td">
        <q-input
          v-model="detailDataModel.contentWithMapping"
          class="full-width"
          type="textarea"
          outlined
          dense
        />
      </div>
    </div>
    <div class="row">
      <div class="col-2 form-th required">발송시간</div>
      <div class="col-10 form-td">
        <q-input v-model="detailDataModel.sendTime" type="number" outlined dense style="min-width: 100px; margin-right: 0.5rem; text-align: right;" />분
        <div class="col-11 form-td">
            <q-radio v-model="detailDataModel.textSendTime" val="PRE" label="전"></q-radio>
            <q-radio v-model="detailDataModel.textSendTime" val="AFT" label="후"></q-radio>
          </div>
      </div>
    </div>
  </div>
  <div class="row q-py-md justify-between">
    <div class="q-gutter-x-md">
      <q-btn label="목록" @click="router.push({ name: 'AutoNotifyList' })" />
    </div>
    <q-btn label="수정" @click="onRegist" />
  </div>
</template>
<script setup>
import { inject, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import COMMON from '@/constants/commonConstatns.js'
import { pushApi } from '@/service/api'
import { previousQueryUrl } from '@/router'

const router = useRouter()
const route = useRoute()
const emitter = inject('emitter')

const toastMessage = ref('수정이 완료되었습니다!')
const toastStatus = ref('success')

const detailDataModel = ref({
  titleWithoutMapping: '',
  contentWithoutMapping: '',
  sendTime: '',
  textSendTime : 'PRE',
  titleWithMapping : '',
  contentWithMapping : ''
})

const onRegist = async () => {
  const setTime = detailDataModel.value.textSendTime ==='AFT' ? '-' : ''
  const data = {
    pushTemplateSeq: route.query.id,
    titleWithMapping: detailDataModel.value.titleWithMapping,
    contentWithMapping: detailDataModel.value.contentWithMapping,
    sendTime : detailDataModel.value.sendTime = setTime + detailDataModel.value.sendTime
  }
  try {
      await pushApi.updatePushTemplate(route.query.id, data)
      toastStatus.value = 'success'
      toastMessage.value = '수정이 완료되었습니다!'
      alert('수정이 완료되었습니다!')
      router.replace({ name: 'AutoNotifyList' })
    } catch (error) {
      toastStatus.value = 'failed'
      toastMessage.value = '수정에 실패했습니다'
      alert('수정에 실패했습니다')
    }
}

const detailSetting = async () => {
  if (route.query.id === undefined) {
    return
  }
  await pushApi.getPushTemplateDetail(route.query.id).then((res) => {
    if (res.data.titleWithMapping) detailDataModel.value.titleWithMapping = res.data.titleWithMapping
    if (res.data.contentWithMapping) detailDataModel.value.contentWithMapping = res.data.contentWithMapping
      detailDataModel.value.sendTime =  res.data.sendTime === 0 ?  res.data.sendTime :  Math.abs(res.data.sendTime)
      detailDataModel.value.textSendTime = res.data.sendTime > 0 ? 'PRE' : 'AFT'
      if (res.data.titleWithMapping) detailDataModel.value.titleWithMapping = res.data.titleWithMapping
      if (res.data.contentWithMapping) detailDataModel.value.contentWithMapping = res.data.contentWithMapping
  })
}

onMounted(async () => {
  emitter.emit(COMMON.LOADING.SHOW)
  await detailSetting()
  emitter.emit(COMMON.LOADING.HIDE)
})
</script>
