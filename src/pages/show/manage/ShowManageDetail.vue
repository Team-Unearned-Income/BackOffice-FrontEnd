<template>
  <div class="form">
    <div class="row">
      <div class="col-1 form-th required">게시여부</div>
      <div class="col-auto form-td">
        <q-radio v-model="detailDataModel.postYn" val="N" label="미게시" disable></q-radio>
        <q-radio v-model="detailDataModel.postYn" val="Y" label="게시" disable></q-radio>
      </div>
      <div class="col-auto form-td">
        <q-checkbox v-model="enablePostDate" label="게시기간" size="sm" disable />
      </div>
      <div class="col-5 form-td">
        <DoubleDateInput v-model="postDate" disable />
      </div>
    </div>
    <div class="row">
      <div class="col-1 form-th required">공연예약</div>
      <div class="col-3 form-td">
        <q-select
          v-model="computeBooking"
          :options="filterOptions.bookingStatusList"
          class="full-width"
          dense
          hide-bottom-space
          outlined
        />
      </div>
      <div class="col-auto form-td">
        <q-btn
          label="공연예약 관리"
          :disable="detailDataModel.bookingStatus !== 'OPERATING'"
          @click="showLunaPassModal = true"
        />
      </div>
      <div class="col-4 text-grey">
        <!--        <p style="margin: 0; color: gray; font-weight: bold">-->
        <!--          * 운영 상태가 아닌 경우 예약 관리 팝업 내 설정된 예약 스케줄은 노출되지 않습니다.-->
        <!--        </p>-->
      </div>
    </div>
    <div class="row">
      <div class="col-1 form-th required">공연명</div>
      <div class="col-10 form-td">{{ detailDataModel.titleKor }}</div>
    </div>
    <div class="row">
      <div class="col-1 form-th required">지역</div>
      <div class="col-10 form-td">{{ detailDataModel.zone || '-' }}</div>
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
              <q-input
                v-model="longitudeComputed"
                outlined
                center
                dense
                maxlength="12"
              />
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
              <q-input
                v-model="latitudeComputed"
                outlined
                dense
                maxlength="11"
              />
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
          :latitude="latitudeComputed"
          :longitude="longitudeComputed"
          @update:model-value="(value) => {
            detailDataModel.latitude = value.latitude
            detailDataModel.longitude = value.longitude
          }"
        />
      </div>
    </div>
    <div class="row">
      <div class="col-1 form-th">러닝타임</div>
      <div class="col-1">
        <q-input
          v-model="detailDataModel.runningTime"
          class="self-center"
          type="number"
          outlined
          dense
          @update:model-value="
            (value) => {
              detailDataModel.runningTime = value < 0 ? null : value
            }
          "
        />
      </div>
      <div class="self-center">분</div>
      <div class="text-grey">* 숫자만 입력해주세요.</div>
    </div>
    <div class="row">
      <div class="col-1 form-th">입장순서</div>
      <div class="col-3 form-td">
        <q-radio v-model="detailDataModel.bookingOrderRankPostYn" val="Y" label="사용" />
        <q-radio v-model="detailDataModel.bookingOrderRankPostYn" val="N" label="미사용" />
      </div>
    </div>
    <div class="row">
      <div class="col-1 form-th">후기</div>
      <div class="col-3 form-td">
        <q-radio v-model="detailDataModel.reviewPostYn" val="Y" label="노출" />
        <q-radio v-model="detailDataModel.reviewPostYn" val="N" label="비노출" />
      </div>
      <div class="col-6 form-td">
        <q-btn label="후기 항목 관리" @click="showReviewModal = true" />
      </div>
    </div>
    <div class="row q-py-sm">
      <div class="col-1 form-th">예약 유의사항</div>
      <div class="col-11 form-td">
        <q-input
          v-model="detailDataModel.reservationCaution"
          type="textarea"
          class="col self-center"
          outlined
          dense
          counter
          maxlength="1000"
          @blur="
            detailDataModel.reservationCaution = detailDataModel.reservationCaution?.trim() || null
          "
        />
      </div>
    </div>
  </div>
  <div class="row q-py-md justify-between">
    <q-btn label="목록" @click="router.push(previousQueryUrl ?? { name: 'ShowManageList' })" />
    <q-btn label="등록" @click="onRegist" />
  </div>
  <LunaPassEditModal
    v-if="showLunaPassModal"
    v-model:show="showLunaPassModal"
    :title="'공연 예약 관리'"
    :type="'showEvent'"
    :data="modalDataModel"
    :headers="modalHeaders"
    @update:model-value="
      async (value) => {
        modalDataModel = value
        await onLunarpassRegist()
      }
    "
  />
  <ReviewManageModal
    v-if="isReady"
    v-model:show="showReviewModal"
    v-model:data-model="detailDataModel.reviewList"
    :title="'후기 항목 관리'"
    @update:model-value="
      async (value) => {
        await onReviewRegist(value)
      }
    "
  />
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
import { showeventApi } from '@/service/api'
import DoubleDateInput from '@/components/input/DoubleDateInput.vue'
import FilterUtils from '@/utils/FilterUtils.js'
import COMMON from '@/constants/commonConstatns.js'
import LunaPassEditModal from '@/components/modal/LunaPassEditModal.vue'
import ReviewManageModal from '@/components/modal/ReviewManageModal.vue'
import RegistToast from '@/components/dialog/RegistToast.vue'
import { previousQueryUrl } from '@/router'
import MapView from '@/components/input/MapView.vue'

const emitter = inject('emitter')
const router = useRouter()
const route = useRoute()

const showLunaPassModal = ref(false)
const showReviewModal = ref(false)
const showToast = ref(false)
const toastMessage = ref('수정이 완료되었습니다!')
const toastStatus = ref('success')
const Idx = ref(route.query.idx)
const modalDataModel = ref({})

const enablePostDate = computed({
  get() {
    return detailDataModel.value.setDateYn === 'Y' ? true : false
  },
  set(value) {
    detailDataModel.value.setDateYn = value ? 'Y' : 'N'
  }
})

const isReady = ref(false)

const modalHeaders = ref([
  {
    label: '회차',
    value: 'round'
  },
  {
    label: '운영시간',
    value: 'bookingStartTimeNm'
  },
  {
    label: '예약가능여부',
    value: 'bookingYn'
  }
])

const filterOptions = ref({
  bookingStatusList: [],
  imoticonTypeList: []
})

const detailDataModel = ref({
  idx: null,
  postYn: null,
  minorType: null,
  setDateYn: null,
  postStartDate: null,
  postEndDate: null,
  bookingStatus: null,
  bookingStatusNm: null,
  titleKor: null,
  zone: null,
  etcLocationName: null,
  runningTime: null,
  reservationCaution: null,
  reviewPostYn: null,
  bookingOrderRankPostYn: null,
  reviewList: []
})

const postDate = ref({
  from: detailDataModel.value.postStartDate,
  to: detailDataModel.value.postEndDate
})

const reviewDataModel = ref({
  reviewPostYn: null,
  reviewList: []
})

const latitudeComputed = computed({
  get: () => detailDataModel.value.latitude,
  set: (value) => {
    detailDataModel.value.latitude = Number(value)
  }
})

const longitudeComputed = computed({
  get: () => detailDataModel.value.longitude,
  set: (value) => {
    detailDataModel.value.longitude = Number(value)
  }
})

const computeBooking = computed({
  get: () => detailDataModel.value.bookingStatusNm ?? '선택하세요',
  set: (value) => {
    detailDataModel.value.bookingStatus = value.value
    detailDataModel.value.bookingStatusNm = value.label
  }
})

const filterSetting = async () => {
  const filterList = await showeventApi.getShowEventCode().then((res) => res.data)
  filterOptions.value = FilterUtils.parseFilterArray(filterList)
  filterOptions.value.bookingStatusList.forEach((element) => {
    if (element.value === 'ALL') {
      element.label = '선택하세요'
    }
  })
  detailDataModel.value.lunarpass = filterOptions.value.bookingStatusList[0]
}

const detailSetting = async () => {
  const detailInfo = await showeventApi.getShowEventInfoGet(route.query.idx).then((res) => res.data)
  detailDataModel.value = JSON.parse(JSON.stringify(detailInfo))

  reviewDataModel.value = {
    reviewPostYn: detailDataModel.value.reviewPostYn,
    reviewList: detailDataModel.value.reviewList
  }
  detailDataModel.value.reviewList.filterOptions = filterOptions.value.imoticonTypeList

  postDate.value = {
    from: detailDataModel.value.postStartDate,
    to: detailDataModel.value.postEndDate
  }

  isReady.value = true
}

const onLunarpassRegist = async () => {
  await showeventApi.updateShowEventLunarpassInfo(Idx.value, modalDataModel.value)
    .then(async (res) => {
      if (res.success) {
        toastMessage.value = '수정이 완료되었습니다!'
        toastStatus.value = 'success'
        showToast.value = true
      }
    }).catch((err) => {
      toastMessage.value = '수정에 실패했습니다'
      toastStatus.value = 'failed'
      showToast.value = true
    })
}

const onRegist = async () => {
  if (!checkValidEdit()) return
  try {
    await showeventApi.updateShowEventInfo(route.query.idx, {
      postYn: detailDataModel.value.postYn,
      bookingStatus: detailDataModel.value.bookingStatus,
      runningTime: detailDataModel.value.runningTime,
      reviewPostYn: detailDataModel.value.reviewPostYn,
      bookingOrderRankPostYn: detailDataModel.value.bookingOrderRankPostYn,
      reservationCaution: detailDataModel.value.reservationCaution,
      minorType: detailDataModel.value.minorType,
      latitude: detailDataModel.value.latitude,
      longitude: detailDataModel.value.longitude
    })
    toastMessage.value = '수정이 완료되었습니다!'
    toastStatus.value = 'success'
    showToast.value = true
  } catch (err) {
    toastMessage.value = '수정에 실패했습니다'
    toastStatus.value = 'failed'
    showToast.value = true
  }
}

const lunarpassInfo = async () => {
  modalDataModel.value = await showeventApi
    .showEventLunarpassInfoGet(Idx.value)
    .then((res) => res.data)
}

const checkValidEdit = () => {
  if (detailDataModel.value.postYn === null) {
    alert('게시여부를 선택해주세요.')
    return false
  }
  if (detailDataModel.value.bookingStatus === null) {
    alert('예약 운영여부를 선택해주세요.')
    return false
  }

  return true
}

onMounted(async () => {
  emitter.emit(COMMON.LOADING.SHOW)
  await filterSetting()
  await lunarpassInfo()
  await detailSetting()
  emitter.emit(COMMON.LOADING.HIDE)
})

const onReviewRegist = async (data) => {
  await showeventApi
    .updateShowEventReviewInfo(route.query.idx, data)
    .then(async (res) => {
      if (res.success) {
        toastMessage.value = '수정이 완료되었습니다!'
        toastStatus.value = 'success'
        showToast.value = true
      }
    })
    .catch((err) => {
      toastMessage.value = '후기 수정에 실패했습니다'
      toastStatus.value = 'failed'
      showToast.value = true
    })
}
</script>
