<template>
  <div class="form">
    <div class="row">
      <div class="col-1 form-th required">게시여부</div>
      <div class="col-auto form-td justify-between">
        <q-radio v-model="detailDataModel.postYn" val="N" label="미게시" disable></q-radio>
        <q-radio v-model="detailDataModel.postYn" val="Y" label="게시" disable></q-radio>
      </div>
      <div class="col-auto form-td">
        <q-checkbox v-model="enablePostDate" label="게시기간" disable />
      </div>
      <div class="col-3 form-td">
        <DoubleDateInput
          v-model="detailDataModel.postDateRange"
          :disable="!enablePostDate"
          :readonly="true"
        />
      </div>
    </div>
    <div class="row">
      <div class="col-1 form-th">구분</div>
      <div class="col-2 form-td">{{ detailDataModel.type }}</div>
      <div class="col-auto form-td">
        <q-checkbox v-model="memberDiscountStoreYnComputed" label="연간 이용권 할인 매장" disable />
      </div>
    </div>
    <div class="row">
      <div class="col-1 form-th">시설명</div>
      <div class="col-11 form-td">{{ detailDataModel.facilityNm }}</div>
    </div>
    <div class="row">
      <div class="col-1 form-th">지역</div>
      <div class="col-11 form-td">{{ detailDataModel.zone }}</div>
    </div>
    <div class="row">
      <div class="col-1 form-th">운영여부</div>
      <div class="col-11 form-td">{{ detailDataModel.cmsOperateYn }}</div>
    </div>
    <div class="row">
      <div class="col-1 form-th">운영시간</div>
      <div class="col-11 form-td">{{ detailDataModel.operatingTime }}</div>
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
                mapDataModel = value
                detailDataModel.latitude = mapDataModel.latitude
                detailDataModel.longitude = mapDataModel.longitude
              }
            "
        />
      </div>
    </div>
  </div>
  <div class="row q-py-md justify-between">
    <q-btn label="목록" @click="goList" />
    <q-btn label="등록" @click="onRegist" />
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
import { computed, inject, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import COMMON from '@/constants/commonConstatns.js'
import DoubleDateInput from '@/components/input/DoubleDateInput.vue'
import MapView from '@/components/input/MapView.vue'
import RegistToast from '@/components/dialog/RegistToast.vue'
import { previousQueryUrl } from '@/router'

const route = useRoute()
const router = useRouter()
const emitter = inject('emitter')
const enablePostDate = ref(false)
const isReady = ref(false)
const showToast = ref(false)
const toastMessage = ref('수정이 완료되었습니다!')
const toastStatus = ref('success')

const memberDiscountStoreYnComputed = computed({
  get() {
    return detailDataModel.value.memberDiscountStoreYn === 'Y'
  },
  set(value) {
    detailDataModel.value.memberDiscountStoreYn = value ? 'Y' : 'N'
  }
})

const detailDataModel = ref({
  postYn: '',
  postDateRange: {
    from: '',
    to: ''
  },
  type: '',
  memberDiscountStoreYn: 'N',
  facilityNm: '',
  zone: '',
  left: 0,
  top: 0,
  latitude: null,
  longitude: null,
  cmsOperateYn: '',
  operatingTime : ''
})

const detailSetting = async () => {
  const detailInfo = await facilitiesApi
    .getFoodShoppingInfoGet(route.query.idx)
    .then((res) => res.data)
  detailDataModel.value = {
    postYn: detailInfo.postYn === null ? 'N' : detailInfo.postYn,
    'postDateRange.from': detailInfo.postStartDate,
    'postDateRange.to': detailInfo.postEndDate,
    type: detailInfo.type,
    memberDiscountStoreYn: detailInfo.memberDiscountStoreYn,
    facilityNm: detailInfo.facilityNm,
    zone: detailInfo.zone,
    left: detailInfo.left,
    top: detailInfo.top,
    latitude: detailInfo.latitude,
    longitude: detailInfo.longitude,
    cmsOperateYn: detailInfo.cmsOperateYn === "Y" ? "운영" : "미운영",
    operatingTime : detailInfo.operatingTime === "" ? "-" : detailInfo.operatingTime
  }
  isReady.value = true
  if (detailInfo.postStartDate !== '' && detailInfo.postEndDate !== '') {
    enablePostDate.value = true
  }
}

const goList = () => {
  router.push(previousQueryUrl.value ?? { name: 'FacilitiesStoresList' })
}

const onRegist = async () => {
  if (!checkValidEdit()) return
  try {
    await facilitiesApi.updateFoodShoppingInfo(route.query.idx, {
      latitude: detailDataModel.value.latitude,
      longitude: detailDataModel.value.longitude
    })
    toastStatus.value = 'success'
    toastMessage.value = '수정이 완료되었습니다!'
    showToast.value = true
  } catch (err) {
    toastMessage.value = '수정에 실패했습니다'
    toastStatus.value = 'failed'
    showToast.value = true
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
