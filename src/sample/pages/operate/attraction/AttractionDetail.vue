<template>
  <div class="q-pa-md">
    <q-form ref="attractionRef">
      <div class="row justify-end q-pa-md" style="gap: 0.5rem">
        <q-btn label="목록" @click="goList" />
        <q-btn label="등록" @click="onRegist" />
      </div>
      <div class="form">
        <div class="row">
          <div class="col-1 form-th required">운영상태</div>
          <div class="col-11 form-td" style="justify-content: space-between">
            <div style="flex-direction: row; display: flex">
              <q-select
                v-model="computeOperating"
                :options="filterOptions.operatingStatusList"
                style="min-width: 130px; margin-right: 1rem"
                label="운영여부"
                dense
                hide-bottom-space
                outlined
              />
              <q-select
                v-model="computeWaiting"
                :options="filterOptions.waitingStatusList"
                style="min-width: 130px"
                label="대기상태"
                dense
                hide-bottom-space
                outlined
                :disable="attrDataModel.experienceFacilityYn === 'Y'"
              />
            </div>
            <div>
              <p style="margin: 0; color: gray; font-weight: bold">
                * 체험시설인 경우, 대기상태가 노출되지 않습니다.
              </p>
              <p style="margin: 0; color: gray; font-weight: bold">
                * 어트랙션 운영하지 않는 경우 루나패스 상태도 미운영으로 변경해야 합니다.
              </p>
            </div>
          </div>
        </div>
        <div class="row">
          <div class="col-1 form-th required">루나패스</div>
          <div class="col-3 form-td" style="justify-content: space-between">
            <div style="flex-direction: row; display: flex">
              <q-select
                v-model="computeBooking"
                :options="filterOptions.bookingStatusList"
                style="min-width: 130px; margin-right: 1rem"
                label="루나패스"
                dense
                hide-bottom-space
                outlined
                :disable="
                  attrDataModel.experienceFacilityYn === 'Y' ||
                  attrDataModel.operatingStatus === 'OFF_INSPECTION' ||
                  attrDataModel.operatingStatus === 'OFF_WINTER'
                "
              />
              <q-btn
                label="루나패스 관리"
                :disable="
                  attrDataModel.experienceFacilityYn === 'Y' ||
                  attrDataModel.operatingStatus === 'OFF_INSPECTION' ||
                  attrDataModel.operatingStatus === 'OFF_WINTER' ||
                  attrDataModel.bookingStatus !== 'OPERATING'
                "
                @click="showLunaPassModal = true"
              />
            </div>
          </div>
          <div class="col form-td">
            <div class="form-th required">유료패스</div>
            <q-radio
              v-model="attrDataModel.lunarpassPlusYn"
              val="N"
              label="미사용"
            ></q-radio>
            <q-radio
              v-model="attrDataModel.lunarpassPlusYn"
              val="Y"
              label="사용"
              style="margin-right: 1rem"
            ></q-radio>
            <q-btn
              v-if="attrDataModel.lunarpassPlusYn === 'Y'"
              label="루나패스 + 관리"
              @click="showLunaPassPlusModal = true"
            />
          </div>
          <div>
            <p style="margin: 0; color: gray; font-weight: bold">
              * 운영 상태가 아닌 경우 예약 관리 팝업 내 설정된 예약 스케줄은 노출되지 않습니다.
            </p>
            <p style="margin: 0; color: gray; font-weight: bold">
              * 운영 시간이 없는 경우 예약 관리 팝업 내 예약 스케줄 설정이 불가능합니다.
            </p>
          </div>
        </div>
        <div class="row">
          <div class="col-1 form-th">어트랙션명</div>
          <div class="col-11 form-td">{{ attrDataModel.nameKor }}</div>
        </div>
        <div class="row">
          <div class="col-1 form-th">지역</div>
          <div class="col-11 form-td">{{ attrDataModel.zone }}</div>
        </div>
        <div class="row">
          <div class="col-1 form-th required">운영시간</div>
          <div class="col-4 form-td">
            <DoubleTimeInput
              v-if="isReady"
              :start-time="attrDataModel.operatingStartTime"
              :end-time="attrDataModel.operatingEndTime"
              :disable="attrDataModel.experienceFacilityYn === 'Y'"
              @update:model-value="
                (value) => {
                  attrDataModel.operatingStartTime = value.startTime
                  attrDataModel.operatingEndTime = value.endTime
                }
              "
            />
          </div>
        </div>
        <div class="row">
          <div class="col-1 form-th required">위치</div>
          <div class="col-11 form-td" style="justify-content: space-between">
            <div style="flex-direction: row; display: flex">
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
                <q-input v-model="attrDataModel.longitude" disable outlined center dense />
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
                <q-input v-model="attrDataModel.latitude" disable outlined center dense />
              </div>
            </div>
            <p>* 숫자만 입력해주세요.</p>
          </div>
        </div>
        <div class="row">
          <div class="col-1 form-th"></div>
          <div class="col-11 form-td">
            <MapView
              v-if="isReady"
              :latitude="attrDataModel.latitude"
              :longitude="attrDataModel.longitude"
              @update:model-value="
                (value) => {
                  mapDataModel = value
                  attrDataModel.latitude = mapDataModel.latitude
                  attrDataModel.longitude = mapDataModel.longitude
                }
              "
            />
          </div>
        </div>
        <div class="row">
          <div class="col-1 form-th required">이용제한</div>
          <div class="col-11 form-td" style="display: flex; gap: 0.5rem; flex-direction: column">
            <div
              style="
                display: flex;
                flex-direction: row;
                width: 100%;
                justify-content: space-between;
              "
            >
              <div style="display: flex; flex-direction: row">
                <div style="width: 120px">
                  <q-checkbox v-model="isEveryoneChecked" label="전체이용" size="sm" disable />
                </div>
                <div>
                  <q-checkbox v-model="computeExpFacilities" label="체험시설" size="sm" />
                </div>
              </div>
              <p>* '전체이용'은 수정 불가능한 필드입니다.</p>
            </div>
            <div
              style="
                display: flex;
                flex-direction: row;
                width: 100%;
                justify-content: space-between;
              "
            >
              <div style="display: flex; flex-direction: row">
                <q-checkbox
                  v-model="isHeightLimited"
                  label="키제한"
                  size="sm"
                  style="max-width: 120px"
                  disable
                />
                <q-input v-model="formattedMinHeight" outlined disable readonly center dense />
                <span
                  style="margin: 0rem 1rem; font-size: 1.5rem; align-items: center; display: flex"
                >
                  ~
                </span>
                <q-input v-model="formattedMaxHeight" outlined disable readonly center dense />
              </div>
              <p>* 수정 불가능한 필드입니다.</p>
            </div>
            <div
              class="row"
              style="
                display: flex;
                flex-direction: row;
                width: 100%;
                justify-content: space-between;
              "
            >
              <div class="full-width" style="display: flex; flex-direction: row">
                <q-checkbox
                  v-model="isRuleWithParent"
                  style="max-width: 200px"
                  label="보호자 동승(이용 조건)"
                  size="sm"
                />
                <q-input
                  v-model.trim="attrDataModel.useRuleWithParent"
                  placeholder="보호자 동승 시 이용조건을 입력해주세요."
                  class="full-width"
                  dense
                  outlined
                  center
                  counter
                  maxlength="40"
                />
              </div>
            </div>
          </div>
        </div>
        <div class="row">
          <div class="col-1 form-th">후기</div>
          <div class="col-3 form-td">
            <q-radio v-model="attrDataModel.reviewPostYn" val="Y" label="노출" />
            <q-radio v-model="attrDataModel.reviewPostYn" val="N" label="비노출" />
          </div>
          <div class="col-6 form-td">
            <q-btn label="후기 관리" @click="showReviewModal = true" />
          </div>
        </div>
        <!-- <div class="row q-py-sm">
          <div class="col-1 form-th">루나패스 유의사항(상단)</div>
          <div class="col-11 form-td">
            <q-input
              v-model="attrDataModel.lunarpassCaution"
              type="textarea"
              class="col self-center"
              outlined
            />
          </div>
        </div> -->
        <div class="row q-py-sm">
          <div class="col-1 form-th">루나패스 유의사항</div>
          <div class="col-11 form-td">
            <q-input
              v-model="attrDataModel.lunarpassCautionBottom"
              type="textarea"
              class="col self-center"
              outlined
              dense
              counter
              maxlength="1000"
              @blur="
                attrDataModel.lunarpassCautionBottom =
                  attrDataModel.lunarpassCautionBottom.trim() || null
              "
            />
          </div>
        </div>
        <div class="row">
          <div class="col-1 form-th">정렬순서</div>
          <div class="col-2 form-td">
            <q-input
              v-model="attrDataModel.orderSeq"
              type="number"
              outlined
              dense
              :rules="[(val) => val > 0 || '1 이상의 숫자만 입력 가능합니다.']"
            />
          </div>
        </div>
        <!-- 게시여부 블록 (이동 및 편집 토글 추가) -->
        <div class="row items-center">
          <div class="col-1 form-th required">게시여부</div>
          <div class="col-11 form-td flex justify-between items-center">
            <div>
              <q-radio
                v-model="attrDataModel.postYn"
                val="N"
                label="미게시"
                :disable="!isPostEditEnabled"
              ></q-radio>
              <q-radio
                v-model="attrDataModel.postYn"
                val="Y"
                label="게시"
                :disable="!isPostEditEnabled"
              ></q-radio>
            </div>

            <!-- 편집 토글 버튼 -->
            <q-btn
              dense
              :label="isPostEditEnabled ? '편집 비활성화' : '편집 활성화'"
              @click="isPostEditEnabled = !isPostEditEnabled"
            />
          </div>
        </div>
      </div>
      <!-- 상세 하단 버튼 -->
      <div class="row justify-between q-pt-lg">
        <div>
          <q-btn label="목록" @click="goList" />
        </div>
        <div>
          <q-btn label="등록" @click="onRegist" />
        </div>
      </div>
    </q-form>
  </div>
  <LunaPassEditModal
    v-if="isReady"
    ref="lunapassRef"
    v-model:show="showLunaPassModal"
    :title="'루나패스 관리'"
    :type="'attraction'"
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
    v-model:data-model="attrDataModel.reviewList"
    :title="'후기 항목 관리'"
    @update:model-value="
      async (value) => {
        await onReviewRegist(value)
      }
    "
  />
  <LunaPassPlusModal
    v-if="isReady && showLunaPassPlusModal"
    ref="lunapassPlusRef"
    v-model:show="showLunaPassPlusModal"
    :title="'루나패스 + 관리'"
    :data="attrDataModel"
    @update:model-value="
      async (value) => {
        await onAtrractionEdit(value)
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
import { useRoute, useRouter } from 'vue-router'
import { computed, nextTick, onBeforeMount, onMounted, ref } from 'vue'
import FilterUtils from '@/utils/FilterUtils.js'
import DoubleTimeInput from '@/components/input/DoubleTimeInput.vue'
import LunaPassEditModal from '@/components/modal/LunaPassEditModal.vue'
import ReviewManageModal from '@/components/modal/ReviewManageModal.vue'
import MapView from '@/components/input/MapView.vue'
import RegistToast from '@/components/dialog/RegistToast.vue'
import { previousQueryUrl } from '@/router'
import LunaPassPlusModal from '@/components/modal/LunaPassPlusModal.vue'

const router = useRouter()
const route = useRoute()

const attractionRef = ref(null)
const attrIdx = ref()

const showLunaPassModal = ref(false)
const showLunaPassPlusModal = ref(false)
const lunapassRef = ref(null)
const lunapassPlusRef = ref(null)
const showReviewModal = ref(false)
const showToast = ref(false)
const toastMessage = ref(null)
const toastStatus = ref('success')
const modalDataModel = ref({})
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
    label: '예약타임',
    value: 'bookingRound'
  }
])

const mapDataModel = ref({})
const isReady = ref(false)

const filterOptions = ref({
  operatingStatusList: [],
  bookingStatusList: [],
  waitingStatusList: [],
  imoticonTypeList: []
})

const attrDataModel = ref({})

const updateDataModel = ref({
  postYn: null,
  operatingStatus: null,
  waitingStatus: null,
  bookingStatus: null,
  operatingStartTime: null,
  operatingEndTime: null,
  latitude: null,
  longitude: null,
  useRuleWithParentYn: null,
  useRuleWithParent: null,
  reviewPostYn: null,
  reviewList: [],
  // lunarpassCaution: null,
  lunarpassCautionBottom: null,
  orderSeq: null,
  experienceFacilityYn: 'N',
  lunarpassPlusYn: attrDataModel.lunarpassPlusYn,
  lunarpassPlusNotice: attrDataModel.lunarpassPlusNotice || ''
})

const isEveryoneChecked = computed({
  get: () => attrDataModel.value.everyoneYn === 'Y'
})

const isHeightLimited = computed({
  get: () => attrDataModel.value.heightLimitYn === 'Y'
})

const isRuleWithParent = computed({
  get: () => attrDataModel.value.useRuleWithParentYn === 'Y',
  set: (value) => {
    attrDataModel.value.useRuleWithParentYn = value ? 'Y' : 'N'
  }
})

const formattedMinHeight = computed({
  get: () =>
    attrDataModel.value.minHeight
      ? `키 ${attrDataModel.value.minHeight}cm 이상`
      : attrDataModel.value.minHeight
})

const formattedMaxHeight = computed({
  get: () =>
    attrDataModel.value.maxHeight
      ? `키 ${attrDataModel.value.maxHeight}cm 이하`
      : attrDataModel.value.maxHeight
})

const computeExpFacilities = computed({
  get: () => (attrDataModel.value.experienceFacilityYn === 'Y' ? true : false),
  set: (value) => {
    toastMessage.value = '루나패스와 운영시간을 확인해 주세요'
    toastStatus.value = 'warning'
    showToast.value = true
    if (value) {
      attrDataModel.value.experienceFacilityYn = 'Y'

      // 루나패스 관리 변경
      attrDataModel.value.bookingStatus = 'NOT_OPERATING'
      attrDataModel.value.bookingStatusNm = '미운영'

      // 운영시간 변경
      attrDataModel.value.operatingStartTime = null
      attrDataModel.value.operatingEndTime = null
    } else {
      attrDataModel.value.experienceFacilityYn = 'N'
    }
  }
})

// status computed
const computeOperating = computed({
  get: () => attrDataModel.value.operatingStatusNm,
  set: (value) => {
    if (value.value === 'OFF_INSPECTION' || value.value === 'OFF_WINTER') {
      toastMessage.value = '루나패스와 운영시간을 확인해 주세요'
      toastStatus.value = 'warning'
      showToast.value = true

      // 루나패스 관리 변경
      attrDataModel.value.bookingStatus = 'NOT_OPERATING'
      attrDataModel.value.bookingStatusNm = '미운영'

      // 운영시간 변경
      attrDataModel.value.operatingStartTime = null
      attrDataModel.value.operatingEndTime = null
    } else if (attrDataModel.value.operatingStatus === 'OPERATING') {
      toastMessage.value = '어트랙션 운영하지 않는 경우 루나패스 상태도 미운영으로 변경해야 합니다.'
      toastStatus.value = 'warning'
      showToast.value = true
    }
    attrDataModel.value.operatingStatus = value.value
    attrDataModel.value.operatingStatusNm = value.label
  }
})
const computeBooking = computed({
  get: () => attrDataModel.value.bookingStatusNm,
  set: (value) => {
    attrDataModel.value.bookingStatus = value.value
    attrDataModel.value.bookingStatusNm = value.label
  }
})
const computeWaiting = computed({
  get: () => attrDataModel.value.waitingStatusNm,
  set: (value) => {
    attrDataModel.value.waitingStatus = value.value
    attrDataModel.value.waitingStatusNm = value.label
  }
})

onBeforeMount(async () => {
  attrIdx.value = new URLSearchParams(window.location.search).get('attrIdx')
})

onMounted(async () => {
  await filterSetting()
  await nextTick(async () => {
    await onRequestAttrInfo()
  })
})

const lunarpassInfo = async () => {
  modalDataModel.value = await operatingApi
    .attractionLunarpassInfoGet(attrIdx.value)
    .then((res) => res.data)
}

const filterSetting = async () => {
  const filterList = await operatingApi.getAttractionCode().then((res) => res.data)
  filterOptions.value = FilterUtils.parseFilterArray(filterList)

  Object.keys(filterOptions.value).forEach((key) => {
    if (key !== 'imoticonTypeList') {
      filterOptions.value[key].shift() // 첫 번째 요소 제거
    }
  })
}

const onRequestAttrInfo = async () => {
  await lunarpassInfo()

  const attrResponse = await operatingApi
    .getAttractionInfoGet(attrIdx.value)
    .then((res) => res.data)

  attrDataModel.value = JSON.parse(JSON.stringify(attrResponse))
  attrDataModel.value.reviewList.filterOptions = filterOptions.value.imoticonTypeList

  isReady.value = true
}

const onRegist = async () => {
  if (!(await attractionRef.value.validate())) return

  if (attrDataModel.value.lunarpassPlusYn === 'Y'
    && (!attrDataModel.value.lunarpassPlusNotice)) {
    toastMessage.value = '유료패스를 사용하는경우 팝업 문구를 입력해주세요.'
    toastStatus.value = 'failed'
    showToast.value = true
    return
  }

  Object.keys(updateDataModel.value).forEach((key) => {
    if (attrDataModel.value.hasOwnProperty(key)) {
      updateDataModel.value[key] = attrDataModel.value[key]
    }
  })

  if (updateDataModel.value.useRuleWithParentYn === 'N')
    updateDataModel.value.useRuleWithParent = null

  if (
    updateDataModel.value.useRuleWithParentYn === 'Y' &&
    !updateDataModel.value.useRuleWithParent
  ) {
    alert('보호자 동승 시 이용조건을 입력해주세요.')
    return
  }

  await onLunarpassRegist()

  await onAtrractionEdit(updateDataModel.value)
}

const onLunarpassRegist = async () => {
  await operatingApi
    .updateAttractionLunarpassInfo(attrIdx.value, modalDataModel.value)
    .then(async (res) => {
      if (res.success) {
        toastMessage.value = '수정이 완료되었습니다!'
        toastStatus.value = 'success'
        showToast.value = true
      }
    })
    .catch((err) => {
      toastMessage.value = err.message
      toastStatus.value = 'failed'
      showToast.value = true
    })
}

const onAtrractionEdit = async (data) => {
  await operatingApi
    .updateAttractionInfo(attrIdx.value, data)
    .then(async (res) => {
      if (res.success) {
        toastMessage.value = '수정이 완료되었습니다!'
        toastStatus.value = 'success'
        showToast.value = true
      }
      await onRequestAttrInfo()

      lunapassRef.value.onReset()
    })
    .catch((err) => {
      toastMessage.value = err.message
      toastStatus.value = 'failed'
      showToast.value = true
    })
}

const onReviewRegist = async (data) => {
  await operatingApi
    .updateAttractionReviewInfo(attrIdx.value, data)
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

const goList = () => {
  router.push(previousQueryUrl.value ?? { name: 'AttractionList' })
}

const isPostEditEnabled = ref(false)
</script>
<style lang="scss" scoped>
p {
  color: gray;
}
</style>
