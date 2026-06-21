<template>
  <div class="form">
    <div class="row">
      <div class="col-1 form-th required">게시여부</div>
      <div class="col-auto form-td justify-between">
        <q-radio v-model="detailDataModel.postYn" val="N" label="미게시" disable />
        <q-radio v-model="detailDataModel.postYn" val="Y" label="게시" disable />
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
    <div class="row q-py-md">
      <div class="col-1 form-th required">구분</div>
      <q-select
        v-model="detailDataModel.type"
        :options="filterOptions.amenitiesTypeList"
        class="col-2 self-center"
        dense
        hide-bottom-space
        outlined
        readonly
      />
      <q-input
        v-show="enableUrlInput"
        placeholder="※예약 사이트 URL을 입력해주세요"
        class="col self-center q-ml-md"
        outlined
        dense
      />
    </div>
    <div class="row q-py-md">
      <div class="col-1 form-th required">시설명</div>
      <q-input
        v-model="detailDataModel.facilityNm"
        class="col-10 self-center"
        outlined
        dense
        readonly
      />
    </div>
    <div class="row q-py-md">
      <div class="col-1 form-th required">지역</div>
      <q-select
        v-model="detailDataModel.zone"
        :options="filterOptions.locationCodeList"
        class="col-2 self-center"
        dense
        hide-bottom-space
        outlined
        readonly
      />
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
    <div class="row">
      <div class="col-1 form-th">정렬순서</div>
      <div class="col-2 form-td">
        <q-input
          v-model="detailDataModel.orderSeq"
          type="number"
          outlined
          dense
          hide-bottom-space
          :rules="[(val) => val > 0 || '1 이상의 숫자만 입력 가능합니다.']"
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
import { facilitiesApi } from '@/service/api'
import COMMON from '@/constants/commonConstatns.js'
import DoubleDateInput from '@/components/input/DoubleDateInput.vue'
import FilterUtils from '@/utils/FilterUtils.js'
import MapView from '@/components/input/MapView.vue'
import RegistToast from '@/components/dialog/RegistToast.vue'
import { previousQueryUrl } from '@/router'

const route = useRoute()
const router = useRouter()
const emitter = inject('emitter')
const enablePostDate = ref(false)
const isReady = ref(false)
const showToast = ref(false)
const toastStatus = ref('success')
const toastMessage = ref('수정이 완료되었습니다!')

const enableUrlInput = computed({
  get() {
    if (detailDataModel.value.type === undefined || detailDataModel.value.type === null) {
      return false
    } else {
      return detailDataModel.value.type.value === 'SHELTER' ? true : false
    }
  }
})

const filterOptions = ref({
  amenitiesTypeList: [],
  locationCodeList: []
})

const detailDataModel = ref({
  postYn: '',
  postDateRange: {
    from: '',
    to: ''
  },
  type: '',
  url: '',
  facilityNm: '',
  zone: '',
  left: 0,
  top: 0,
  latitude: null,
  longitude: null,
  orderSeq: null
})

const filterSetting = async () => {
  const filterList = await facilitiesApi.amenitiesListCodeGet().then((res) => res.data)
  filterOptions.value = await FilterUtils.parseFilterArray(filterList)
  detailDataModel.value = {
    type: filterOptions.value.amenitiesTypeList[0],
    zone: filterOptions.value.locationCodeList[0]
  }
}

const detailSetting = async () => {
  const detailInfo = await facilitiesApi.getAmenityInfoGet(route.query.idx).then((res) => res.data)
  detailDataModel.value = {
    postYn: detailInfo.postYn === null ? 'N' : detailInfo.postYn,
    'postDateRange.from': detailInfo.postStartDate,
    'postDateRange.to': detailInfo.postEndDate,
    type:
      detailInfo.type !== null
        ? filterOptions.value.amenitiesTypeList.find((item) => item.label === detailInfo.type)
        : filterOptions.value.amenitiesTypeList[0],
    url: detailInfo.url,
    facilityNm: detailInfo.facilityNm,
    zone: detailInfo.zone === null ? filterOptions.value.locationCodeList[0] : detailInfo.zone,
    left: detailInfo.left,
    top: detailInfo.top,
    latitude: detailInfo.latitude,
    longitude: detailInfo.longitude,
    orderSeq: detailInfo.orderSeq
  }
  isReady.value = true
  if (detailInfo.postStartDate !== '' && detailInfo.postEndDate !== '') {
    enablePostDate.value = true
  }
  if (detailDataModel.value.type === undefined) {
    detailDataModel.value.type = filterOptions.value.amenitiesTypeList[0]
  }
}

const goList = () => {
  router.push(previousQueryUrl.value ?? { name: 'FacilitiesAmenitiesList' })
}

const onRegist = async () => {
  if (!checkValidEdit()) return
  try {
    await facilitiesApi.updateAmenityInfo(route.query.idx, {
      url: detailDataModel.value.url,
      latitude: detailDataModel.value.latitude,
      longitude: detailDataModel.value.longitude,
      orderSeq: detailDataModel.value.orderSeq
    })
    toastMessage.value = '수정이 완료되었습니다!'
    toastStatus.value = 'success'
    showToast.value = true
  } catch (err) {
    toastMessage.value = err.message ?? '수정에 실패했습니다'
    toastStatus.value = 'failed'
    showToast.value = true
  }
}

const disableEvents = (event) => {
  event.preventDefault()
  event.stopPropagation()
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
  await filterSetting()
  await detailSetting()
  emitter.emit(COMMON.LOADING.HIDE)
})
</script>
<style lang="scss" scoped>
p {
  color: gray;
}
</style>
