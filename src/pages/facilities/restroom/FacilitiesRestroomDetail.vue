<template>
  <div class="form">
    <div class="row">
      <div class="col-1 form-th required">앱 노출 여부</div>
      <div class="col-auto form-td justify-between">
        <q-radio v-model="detailDataModel.postYn" val="N" label="미노출"></q-radio>
        <q-radio v-model="detailDataModel.postYn" val="Y" label="노출"></q-radio>
      </div>
    </div>
    <div class="row">
      <div class="col-1 form-th required">시설명</div>
      <div class="col-11 form-td">
        <q-input
          v-model="detailDataModel.name"
          class="full-width"
          outlined
          hide-bottom-space
          center
          dense
          readonly
        />
      </div>
    </div>
    <div class="row q-py-sm">
      <div class="col-1 form-th">내용</div>
      <div class="col-11 form-td">
        <q-input
          v-model="detailDataModel.content"
          type="textarea"
          class="col self-center"
          outlined
          dense
          counter
          maxlength="250"
          @blur="
                detailDataModel.content =
                  detailDataModel.content.trim() || null
              "
        />
      </div>
    </div>
    <div class="row">
      <div class="col-1 form-th required">위치</div>
      <div class="col-11 form-td" style="justify-content: space-between">
        <div class="full-width form-td" style="justify-content: space-between">
          <div class="row">
            <div
              style="
                flex-direction: row;
                display: flex;
                align-items: center;
                gap: 1rem;
                margin-right: 2rem;
              "
            >
              <span class="text-bold">X</span>
              <q-input v-model="detailDataModel.longitude" disable outlined center dense />
            </div>
            <div
              style="
                flex-direction: row;
                display: flex;
                align-items: center;
                gap: 1rem;
                margin-right: 2rem;
              "
            >
              <span class="text-bold">Y</span>
              <q-input v-model="detailDataModel.latitude" disable outlined center dense />
            </div>
          </div>
          <div>
            <p style="margin: 0">* 지도에서 클릭하여 좌표를 지정할 수 있습니다.</p>
            <p style="margin: 0">* 좌표 값 미입력시 사용자 앱에서 정보를 확인할 수 없습니다.</p>
          </div>
        </div>
      </div>
    </div>
    <div class="row">
      <div class="col-1 form-th"></div>
      <div class="col-11 form-td">
        <MapView
          v-if="isReady"
          :latitude="detailDataModel.latitude"
          :longitude="detailDataModel.longitude"
          @update:model-value="
              (value) => {
                detailDataModel.latitude = value.latitude
                detailDataModel.longitude = value.longitude
              }
            "
        />
      </div>
    </div>
  </div>
  <div class="row justify-between q-pt-lg">
    <div style="display: flex; gap: 1rem">
      <q-btn label="목록" @click="goList" />
      <q-btn label="삭제" @click="onDelete" :disable="route.query.idx === null" />
    </div>
    <div>
      <q-btn style="background-color: #169bd5; color: white" label="등록" @click="onRegist" />
    </div>
  </div>
  <RegistToast
    v-if="showToast"
    :message="toastMessage"
    :duration="3000"
    :status="toastStatus"
    @hidden="
      () => {
        showToast = false
      }
    "
  />
</template>
<script setup>
import { inject, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { facilitiesApi } from '@/service/api'
import COMMON from '@/constants/commonConstatns.js'
import MapView from '@/components/input/MapView.vue'
import RegistToast from '@/components/dialog/RegistToast.vue'
import { previousQueryUrl } from '@/router'

const route = useRoute()
const router = useRouter()
const emitter = inject('emitter')
const isReady = ref(false)
const showToast = ref(false)
const toastMessage = ref('수정이 완료되었습니다!')
const toastStatus = ref('success')

const detailDataModel = ref({
  name: '',
  content: '',
  postYn: 'N',
  orderSeq: '',
  latitude: null,
  longitude: null
})

const detailSetting = async () => {
  if (!route.query.idx) {
    isReady.value = true
    return
  }

  const detailInfo = await facilitiesApi.restroomDetail(route.query.idx ?? null)
    .then((res) => res.data)

  detailDataModel.value = {
    name: '화장실',
    content: detailInfo.content,
    postYn: detailInfo.postYn === null ? 'N' : detailInfo.postYn,
    orderSeq: detailInfo.orderSeq,
    latitude: detailInfo.latitude,
    longitude: detailInfo.longitude
  }

  isReady.value = true
}


const onRegist = async () => {
  if (!checkValidEdit()) return

  if (route.query.idx) {
    /** 화장실 수정 */
    await facilitiesApi.restroomModify(route.query.idx, {
      name: detailDataModel.value.name,
      content: detailDataModel.value.content ?? '',
      postYn: detailDataModel.value.postYn,
      orderSeq: detailDataModel.value.orderSeq,
      latitude: detailDataModel.value.latitude,
      longitude: detailDataModel.value.longitude,
      delYn: 'N'
    })
      .then((res) => {
        toastStatus.value = 'success'
        toastMessage.value = '수정이 완료되었습니다!'
        showToast.value = true
      })
      .catch((err) => {
        toastMessage.value = '수정에 실패했습니다'
        toastStatus.value = 'failed'
        showToast.value = true
      })
  } else {
    /** 화장실 신규 등록 */
    await facilitiesApi.restroomCreate({
      name: detailDataModel.value.name,
      content: detailDataModel.value.content ?? '',
      postYn: detailDataModel.value.postYn,
      latitude: detailDataModel.value.latitude,
      longitude: detailDataModel.value.longitude
    })
      .then((res) => {
        toastStatus.value = 'success'
        toastMessage.value = '등록이 완료되었습니다!'
        showToast.value = true
        goList()
      })
      .catch((err) => {
        toastMessage.value = '등록에 실패했습니다'
        toastStatus.value = 'failed'
        showToast.value = true
      })
  }
}

const checkValidEdit = () => {
  if (!detailDataModel.value.latitude || !detailDataModel.value.longitude) {
    alert('좌표를 지정해주세요')
    toastMessage.value = '좌표를 지정해주세요'
    toastStatus.value = 'failed'
    showToast.value = true
    return false
  }
  return true
}

const goList = () => {
  router.push(previousQueryUrl.value ?? { name: 'FacilitiesRestroomList' })
}

const onDelete = async () => {
  const isDelete = confirm('정말 삭제하시겠습니까?')
  if (isDelete) {
    await facilitiesApi.restroomDelete(route.query.idx)
    alert('성공적으로 삭제되었습니다.')
    router.replace(previousQueryUrl.value ?? { name: 'FacilitiesRestroomList' })
  }
}

onMounted(async () => {
  emitter.emit(COMMON.LOADING.SHOW)
  await detailSetting()
  emitter.emit(COMMON.LOADING.HIDE)
})
</script>
<style lang="scss" scoped>
p {
  color: gray;
}
</style>
