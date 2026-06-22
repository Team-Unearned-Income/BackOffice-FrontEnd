<template>
  <div class="q-pa-md">
    <q-form ref="promotionRef">
      <div class="form">
        <div class="row" v-if="dataModel.cmsYn === 'Y'">
          <div class="col-1 form-th required">게시여부</div>
          <div class="col-11 form-td">
            <q-radio v-model="dataModel.postYn" val="N" label="미게시" disable></q-radio>
            <q-radio v-model="dataModel.postYn" val="Y" label="게시" disable></q-radio>
            <q-checkbox
              label="게시기간"
              size="sm"
              style="max-width: 120px; justify-self: flex-end"
              v-model="computeSetDateYn"
              disable
            />
            <DoubleDateInput v-model="postDate" disable />
          </div>
        </div>
        <div class="row" v-if="dataModel.type.match(/promotion/i)">
          <div class="col-1 form-th required">앱 노출 여부</div>
          <div class="col-11 form-td">
            <q-radio v-model="dataModel.appPostYn" val="N" label="미노출"></q-radio>
            <q-radio v-model="dataModel.appPostYn" val="Y" label="노출"></q-radio>
            <q-checkbox
              v-model="computeAppPostPeriodYn"
              label="노출기간"
              size="sm"
              style="max-width: 120px; justify-self: flex-end"
            />
            <DateInput
              v-model="appPostDate.from"
              style="margin-right: 0.5rem"
              :disable="!computeAppPostPeriodYn"
            />
            ~
            <DateInput
              v-model="appPostDate.to"
              style="margin-left: 0.3rem;margin-right: 0.5rem"
              :disable="!computeAppPostPeriodYn"
            />
            <div style="width: 300px;">
              <DoubleTimeInput
                v-model="postTime"
                :start-time="dataModel.appPostStartTime"
                :end-time="dataModel.appPostEndTime"
                :disable="!computeAppPostPeriodYn"
              />
            </div>
          </div>
        </div>
        <div class="row">
          <div class="col-1 form-th required">구분</div>
          <div class="col-6 form-td" style="gap: 0.5rem">
            <q-select
              v-model="computeType"
              :options="filterOptions.ticketReservationTypeList"
              class="full-width"
              dense
              hide-bottom-space
              outlined
              disable
            /><!-- 프로모션만 등록하기 때문에 disable 처리 -->
            <q-select
              v-if="dataModel.type.match(/promotion/i)"
              v-model="computedetailType"
              :options="filterOptions.promotionBenefitList"
              class="full-width"
              dense
              hide-bottom-space
              outlined
              :disable="dataModel.cmsYn === 'Y'"
              :rules="[(val) => !!val || '카드사를 선택해주세요.']"
            />
            <q-select
              v-else
              v-model="computedetailType"
              :options="filterOptions.affiliateCardTypeList"
              class="full-width"
              dense
              hide-bottom-space
              outlined
              :disable="dataModel.cmsYn === 'Y'"
              :rules="[(val) => !!val || '혜택을 선택해주세요.']"
            />
          </div>
          <div class="col-5 form-td">
            <q-checkbox
              label="상단 고정"
              size="sm"
              class="justify-end"
              v-model="computeTopYn"
              :disable="dataModel.type !== 'promotion'"
            />
          </div>
        </div>
        <div class="row">
          <div class="col-1 form-th">예매방식</div>
          <div class="form-td">
            <q-checkbox
              label="온라인예매"
              size="sm"
              v-model="computeOnlineYn"
              :disable="dataModel.cmsYn === 'Y'"
            />
            <q-checkbox
              label="현장발권"
              size="sm"
              v-model="computeDirectYn"
              :disable="dataModel.cmsYn === 'Y'"
            />
          </div>
        </div>
        <div class="row">
          <div class="col-1 form-th required">할인적용기간</div>
          <div class="col-11 form-td">
            <DoubleDateInput
              v-model="saleDate"
              :disable="dataModel.cmsYn === 'Y'"
              :rules="[(val) => !!val || '할인적용기간을 선택해주세요.']"
            />
          </div>
        </div>
        <div class="row">
          <div class="col-1 form-th required">제목</div>
          <div class="col-11 form-td">
            <q-input
              class="full-width"
              v-model="dataModel.title"
              outlined
              center
              dense
              hide-bottom-space
              :disable="dataModel.cmsYn === 'Y'"
              :rules="[(val) => !!val || '제목을 입력해주세요.']"
            />
          </div>
        </div>
        <div class="row">
          <div class="col-1 form-th required">링크</div>
          <div class="col-2 form-td">
            <q-select
              v-model="computeLinkUseYn"
              :options="filterOptions.linkUseYnList"
              class="full-width"
              label="링크 사용여부"
              dense
              hide-bottom-space
              outlined
              :readonly="dataModel.cmsYn === 'Y'"
            />
          </div>
          <div class="col-2 form-td">
            <q-select
              v-model="computeLinkType"
              :options="filterOptions.linkTypeList"
              class="full-width"
              label="링크 종류"
              dense
              hide-bottom-space
              outlined
              readonly
            />
          </div>
          <!--<div class="col-2 form-td" v-if="dataModel.linkType === 'SCREEN'">
            <q-select
              v-model="computeScreenName"
              :options="filterOptions.screenNameList"
              class="full-width"
              label="내부 화면"
              dense
              hide-bottom-space
              outlined
            />
          </div>
          <div class="col-4 form-td" v-if="dataModel.linkType === 'SCREEN'" style="gap: 0.5rem">
            <q-btn
              class="col-1"
              label="찾아보기"
              @click="showModal = true"
              unelevated
              outline
              :disable="!dataModel.screenName"
            >
              <q-tooltip v-if="!dataModel.screenName" anchor="top middle" self="top middle">
                내부화면 종류 선택 후 사용 가능합니다.
              </q-tooltip>
            </q-btn>
            <q-input
              class="full-width"
              v-model="dataModel.screenTitle"
              label="제목"
              outlined
              center
              dense
              disable
            />
          </div>-->
          <div class="col-4 form-td">
            <q-input
              class="full-width"
              v-model="dataModel.linkUrl"
              placeholder="url을 입력해주세요."
              outlined
              center
              dense
              :disable="dataModel.linkUseYn !== 'Y'"
              :readonly="dataModel.cmsYn === 'Y'"
            />
          </div>
        </div>
        <div v-if="dataModel.cmsYn === 'N'" class="row">
          <div class="col-1 form-th required">프로모션 목록 노출</div>
          <div>
            <q-radio
              v-model="dataModel.appLinkPostYn"
              val="N"
              label="노출"
            ></q-radio>
            <q-radio
              v-model="dataModel.appLinkPostYn"
              val="Y"
              label="노출안함"
            ></q-radio>
          </div>
          <div>
            <p>* 푸시,배너의 링크로만 접근 가능한 앱 게시물들에 대한 노출 여부(일반 프로모션x, 앱 전용 프로모션 전용)</p>
          </div>
        </div>
        <div class="row" v-show="dataModel.type.match(/promotion/i)">
          <div class="col-1 form-th required">메인이미지<br />(1200x400)</div>
          <div class="col-11 form-td">
            <q-img
              v-if="dataModel.cmsYn === 'Y'"
              width="50%"
              :src="'https://seoulland.co.kr' + dataModel.mainFilePath + dataModel.mainFileName"
            />
            <div class="row" v-else>
              <ImageInput
                :file-url="dataModel.mainFileUrl"
                :usage="'main'"
                :width="1200"
                :height="400"
                @update:model-value="
                  (image) => {
                    handleMainFileUpdate(image)
                  }
                "
              />
              <div
                style="
                  display: flex;
                  flex-direction: column;
                  gap: 0.5rem;
                  justify-content: space-between;
                "
              >
                <div style="visibility: hidden"></div>
                <div>
                  <div>
                    <span class="text-bold">{{ dataModel.mainFileName }}</span>
                  </div>
                  <span>{{ formatBytes(dataModel.mainFileSize) }}</span>
                </div>
                <p>* 규격에 맞는 이미지를 사용해주세요</p>
              </div>
            </div>
          </div>
        </div>
        <div class="row" v-show="dataModel.type.match(/promotion/i)">
          <div class="col-1 form-th required">목록이미지<br />(480x300)</div>
          <div class="col-11 form-td">
            <q-img
              v-if="dataModel.cmsYn === 'Y'"
              width="50%"
              :src="'https://seoulland.co.kr' + dataModel.listFilePath + dataModel.listFileName"
            />
            <div class="row" v-else>
              <ImageInput
                :file-url="dataModel.listFileUrl"
                :usage="'list'"
                :width="480"
                :height="300"
                @update:model-value="
                  (image) => {
                    handleListFileUpdate(image)
                  }
                "
              />
              <div
                style="
                  display: flex;
                  flex-direction: column;
                  gap: 0.5rem;
                  justify-content: space-between;
                "
              >
                <div style="visibility: hidden"></div>
                <div>
                  <div>
                    <span class="text-bold">{{ dataModel.listFileName }}</span>
                  </div>
                  <span>{{ formatBytes(dataModel.listFileSize) }}</span>
                </div>
                <p>* 규격에 맞는 이미지를 사용해주세요</p>
              </div>
            </div>
          </div>
        </div>
        <div class="row" v-show="dataModel.type.match(/promotion/i)">
          <div class="col-1 form-th required">홈 프로모션 썸네일<br />(480x300)</div>
          <div class="col-11 form-td">
            <div class="row">
              <ImageInput
                :file-url="dataModel.thumbnailFileUrl"
                :extension="['png','jpeg','jpg']"
                :usage="'thumbnail'"
                :width="480"
                :height="300"
                @update:model-value="
                  (image) => {
                    handleThumbnailFileUpdate(image)
                  }
                "
              />
              <div
                style="
                  display: flex;
                  flex-direction: column;
                  gap: 0.5rem;
                  justify-content: space-between;
                "
              >
                <div style="visibility: hidden"></div>
                <div>
                  <div>
                    <span class="text-bold">{{ dataModel.thumbnailFileName }}</span>
                  </div>
                  <span>{{ formatBytes(dataModel.thumbnailFileSize) }}</span>
                </div>
                <p>
                  * 규격에 맞는 이미지를 사용해주세요<br />* png, jpeg, jpg형식의 이미지만 업로드 할 수
                  있습니다
                </p>
              </div>
            </div>
          </div>
        </div>
        <div class="row" v-if="dataModel.cmsYn === 'N'">
          <HtmlEditor
            v-model="dataModel.content"
            :file-group-id="dataModel.fileGroupId"
            file-feature="promotion"
            @update:file-group-id="dataModel.fileGroupId = $event"
          />
        </div>
      </div>
      <!-- 상세 하단 버튼 -->
      <div class="row justify-between q-pt-lg">
        <div style="display: flex; gap: 1rem">
          <q-btn label="목록" @click="router.push(previousQueryUrl ?? { name: 'PromotionList' })" />
          <q-btn
            v-if="dataModel.type !== 'card'"
            label="삭제"
            @click="onDelete"
            :disable="state.cmsYn !== 'N'"
          />
        </div>
        <div>
          <q-btn
            v-if="dataModel.type !== 'card'"
            style="background-color: #169bd5; color: white"
            label="등록"
            @click="onRegist"
          />
          <p v-else>* 제휴 카드의 경우 수정이 불가능합니다.</p>
        </div>
      </div>
    </q-form>
  </div>
  <RegistToast
    v-if="showToast"
    :message="toastMessage"
    :status="toastStatus"
    :duration="3000"
    @hidden="
      () => {
        showToast = false
      }
    "
  />
</template>

<script setup>
import { useRouter } from 'vue-router'
import { computed, inject, nextTick, onMounted, ref } from 'vue'
import COMMON from '@/constants/commonConstatns.js'
import FilterUtils from '@/utils/FilterUtils.js'
import HtmlEditor from '@/components/input/HtmlEditor.vue'
import DoubleDateInput from '@/components/input/DoubleDateInput.vue'
import DateInput from '@/components/input/DateInput.vue'
import ImageInput from '@/components/input/ImageInput.vue'
import RegistToast from '@/components/dialog/RegistToast.vue'
import { previousQueryUrl } from '@/router'
import DoubleTimeInput from '@/components/input/DoubleTimeInput.vue'

const router = useRouter()

const showToast = ref(false)
const toastStatus = ref('success')
const toastMessage = ref('')
const isReady = ref(false)

const isSubmitting = ref(false)

const state = ref({})

const emitter = inject('emitter')

const filterOptions = ref({
  ticketReservationTypeList: [],
  promotionBenefitList: [],
  affiliateCardTypeList: [],
  linkUseYnList: [],
  linkTypeList: []
})

const dataModel = ref({
  promotionSeq: null,
  idx: null,
  cmsYn: 'N',
  appLinkPostYn: 'N',
  postYn: null,
  postYnName: null,
  setDateYn: null,
  postStartDate: null,
  postEndDate: null,
  appPostStartTime: null,
  appPpostEndTime: null,
  type: 'promotion',
  typeName: '프로모션',
  resvOnlineYn: null,
  resvDirectYn: null,
  detailType: null,
  detailTypeName: null,
  saleStartDate: null,
  saleEndDate: null,
  topYn: 'N',
  title: null,
  content: '',
  fileGroupId: '',
  listFileId: null,
  listFileName: null,
  listFileSize: null,
  thumbnailFileId: null,
  thumbnailFileName: null,
  thumbnailFileSize: null,
  mainFilePath: null,
  mainFileId: null,
  mainFileSize: null,
  appPostYn: 'Y',
  appPostPeriodYn: 'N',
  appPostStartDate: null,
  appPostEndDate: null,
  linkUseYn: null,
  linkType: null
})

const postDate = ref({
  from: null,
  to: null
})

const appPostDate = ref({
  from: null,
  to: null
})
const postTime = ref({})

const saleDate = ref({
  from: null,
  to: null
})

const promotionRef = ref(null)
const mainFileRef = ref(null)
const listFileRef = ref(null)
const thumbnailFileRef = ref(null)

const computeSetDateYn = computed({
  get: () => (dataModel.value.setDateYn === 'Y' ? true : false),
  set: (value) => {
    dataModel.value.setDateYn = value ? 'Y' : 'N'
  }
})

const computeAppPostPeriodYn = computed({
  get: () => (dataModel.value.appPostPeriodYn === 'Y' ? true : false),
  set: (value) => {
    dataModel.value.appPostPeriodYn = value ? 'Y' : 'N'
    appPostDate.value = {
      from: null,
      to: null
    }
  }
})

const computeTopYn = computed({
  get: () => (dataModel.value.topYn === 'Y' ? true : false),
  set: (value) => {
    dataModel.value.topYn = value ? 'Y' : 'N'
  }
})

const computeOnlineYn = computed({
  get: () => (dataModel.value.resvOnlineYn === 'Y' ? true : false),
  set: (value) => {
    dataModel.value.resvOnlineYn = value ? 'Y' : 'N'
  }
})

const computeDirectYn = computed({
  get: () => (dataModel.value.resvDirectYn === 'Y' ? true : false),
  set: (value) => {
    dataModel.value.resvDirectYn = value ? 'Y' : 'N'
  }
})

const computeLinkUseYn = computed({
  get: () =>
    dataModel.value.linkUseYn !== null
      ? dataModel.value.linkUseYn === 'Y'
        ? '사용'
        : '미사용'
      : null,
  set: (value) => {
    dataModel.value.linkUseYn = value.value
    dataModel.value.linkType = 'LINK'
    // dataModel.value.screenName = null
    dataModel.value.linkUrl = null
    // dataModel.value.screenTitle = null
  }
})

const computeLinkType = computed({
  get: () =>
    dataModel.value.linkType === 'LINK' ? '외부링크' : '외부링크',
  set: (value) => {
    dataModel.value.linkType = value.value
    // dataModel.value.screenName = null
    dataModel.value.linkUrl = null
    // dataModel.value.screenTitle = null
  }
})

const computeType = computed({
  get: () => dataModel.value.typeName,
  set: (option) => {
    dataModel.value.type = option.value
    dataModel.value.typeName = option.label
  }
})

const computedetailType = computed({
  get: () => dataModel.value.detailTypeName,
  set: (option) => {
    dataModel.value.detailType = option.value
    dataModel.value.detailTypeName = option.label
  }
})

onMounted(async () => {
  await filterSetting()
  await nextTick(async () => {
    await onRequest()
  })
})

const filterSetting = async () => {
  const filterList = await ticketApi.getPromotionDetailCode().then((res) => res.data)
  filterOptions.value = FilterUtils.parseFilterArray(filterList)

  filterOptions.value.promotionBenefitList.shift()
}

const handleThumbnailFileUpdate = (image) => {
  if (!image) {
    dataModel.value.thumbnailFileName = null
    dataModel.value.thumbnailFileSize = null
    dataModel.value.thumbnailFileId = null
    dataModel.value.thumbnailFileUrl = null
    thumbnailFileRef.value = null
    return
  }

  dataModel.value.thumbnailFileName = image.name
  dataModel.value.thumbnailFileSize = image.size

  thumbnailFileRef.value = image
}

const handleListFileUpdate = (image) => {
  if (!image) {
    dataModel.value.listFileName = null
    dataModel.value.listFileSize = null
    dataModel.value.listFileId = null
    dataModel.value.listFileUrl = null
    listFileRef.value = null
    return
  }

  dataModel.value.listFileName = image.name
  dataModel.value.listFileSize = image.size

  listFileRef.value = image
}

const handleMainFileUpdate = (image) => {
  if (!image) {
    dataModel.value.mainFileName = null
    dataModel.value.mainFileSize = null
    dataModel.value.mainFileId = null
    dataModel.value.mainFileUrl = null
    mainFileRef.value = null
    return
  }

  dataModel.value.mainFileName = image.name
  dataModel.value.mainFileSize = image.size

  mainFileRef.value = image
}

const onRequest = async () => {
  if (!router.options.history.state.data) {
    isReady.value = true
    return
  }

  state.value = router.options.history.state.data

  const promotionResponse = await ticketApi
    .getPromotionDetailInfo(state.value.idx, { CmsYn: state.value.cmsYn })
    .then((res) => res.data)

  dataModel.value = JSON.parse(JSON.stringify(promotionResponse))

  postDate.value.from = dataModel.value.postStartDate
  postDate.value.to = dataModel.value.postEndDate

  appPostDate.value.from = dataModel.value.appPostStartDate
  appPostDate.value.to = dataModel.value.appPostEndDate
  postTime.value.startTime = dataModel.value.appPostStartTime
  postTime.value.endTime = dataModel.value.appPostEndTime

  saleDate.value.from = dataModel.value.saleStartDate
  saleDate.value.to = dataModel.value.saleEndDate

  isReady.value = true
}

const canRegist = () => {
  return (
    // dataModel.value.postYn &&
    dataModel.value.title && dataModel.value.title !== '' && saleDate.value
    // mainFileRef.value || (dataModel.value.listFileGroupId && dataModel.value.listFileId)
  )
}

const onRegist = async () => {
  if (isSubmitting.value) return
  if (!(await promotionRef.value.validate())) {
    alert('필수 입력값을 입력해주세요.')
    return
  }

  const dateFrom = new Date(appPostDate.value.from)
  const dateTo = new Date(appPostDate.value.to)
  if (appPostDate.value.from && appPostDate.value.to && dateFrom > dateTo) {
    alert('노출기간 종료일이 시작일보다 큽니다.')
    return
  }

  isSubmitting.value = true

  if (dataModel.value.cmsYn === 'Y') {
    dataModel.value.sdate = postDate.value.from
    dataModel.value.edate = postDate.value.to
  }

  dataModel.value.appPostStartDate = appPostDate.value.from
  dataModel.value.appPostEndDate = appPostDate.value.to
  dataModel.value.appPostStartTime = postTime.value.startTime
  dataModel.value.appPostEndTime = postTime.value.endTime

  dataModel.value.saleStartDate = saleDate.value.from
  dataModel.value.saleEndDate = saleDate.value.to

  if (Object.keys(state.value).length) {
    // case : update
    if (dataModel.value.cmsYn === 'Y') {
      if (!canRegist()) {
        alert('필수 입력값을 입력해주세요.')
        return
      }

      // 일반 프로모션의 경우
      const formData = new FormData()
      formData.append(
        'request',
        new Blob([JSON.stringify(dataModel.value)], { type: 'application/json' })
      )
      formData.append('thumbnailFile', thumbnailFileRef.value ?? new Blob(['']))

      // if (!(thumbnailFileRef.value || dataModel.value.thumbnailFileId)) {
      //   alert('이미지가 없습니다. 이미지 업로드 후 다시 시도해주세요.')
      //   return
      // }

      await ticketApi
        .updatePromotionDetailInfo(state.value.idx, state.value.cmsYn, formData)
        .then(() => {
          toastMessage.value = '수정이 완료되었습니다!'
          toastStatus.value = 'success'
          isSubmitting.value = false
        })
        .catch((err) => {
          toastMessage.value = err.message
          toastStatus.value = 'failed'
          isSubmitting.value = false
          emitter.emit(COMMON.LOADING.HIDE)
        })
    } else {
      /** 앱 전용 프로모션의 경우 */
      const formData = new FormData()
      formData.append(
        'request',
        new Blob([JSON.stringify(dataModel.value)], { type: 'application/json' })
      )
      formData.append('mainFile', mainFileRef.value ?? new Blob(['']))
      formData.append('listFile', listFileRef.value ?? new Blob(['']))
      formData.append('thumbnailFile', thumbnailFileRef.value ?? new Blob(['']))

      if (
        !(mainFileRef.value || dataModel.value.mainFileId) ||
        !(listFileRef.value || dataModel.value.listFileId) ||
        !(thumbnailFileRef.value || dataModel.value.thumbnailFileId)
      ) {
        alert('이미지가 없습니다. 이미지 업로드 후 다시 시도해주세요.')
        return
      }

      await ticketApi
        .updatePromotionDetailInfo(state.value.idx, state.value.cmsYn, formData)
        .then(() => {
          toastMessage.value = '수정이 완료되었습니다!'
          toastStatus.value = 'success'
        })
        .catch((err) => {
          toastMessage.value = err.message
          toastStatus.value = 'failed'
        })
    }
  } else {
    // case : create
    const formData = new FormData()
    formData.append(
      'request',
      new Blob([JSON.stringify(dataModel.value)], { type: 'application/json' })
    )

    formData.append('mainFile', mainFileRef.value)
    formData.append('listFile', listFileRef.value)
    formData.append('thumbnailFile', thumbnailFileRef.value)

    if (!mainFileRef.value || !listFileRef.value || !thumbnailFileRef.value) {
      alert('이미지가 없습니다. 이미지 업로드 후 다시 시도해주세요.')
      return
    }

    await ticketApi
      .createPromotion(formData)
      .then(() => {
        toastMessage.value = '등록이 완료되었습니다!'
        toastStatus.value = 'success'
      })
      .catch((err) => {
        toastMessage.value = err.message
        toastStatus.value = 'failed'
      })
  }

  showToast.value = true

  if (toastStatus.value === 'success') {
    setTimeout(() => {
      router.replace(previousQueryUrl.value ?? { name: 'PromotionList' })
      isSubmitting.value = false
    }, 1000)
  } else {
    isSubmitting.value = false
  }
}

const onDelete = async () => {
  const isDelete = confirm('정말 삭제하시겠습니까?')
  // 삭제 로직
  if (isDelete) {
    await ticketApi.deletePromotion(state.value.idx, state.value.cmsYn)
    alert('성공적으로 삭제되었습니다.')
    router.replace(previousQueryUrl.value ?? { name: 'PromotionList' })
  }
}

const formatBytes = (bytes) => {
  if (!bytes) return

  if (bytes < 0) return 'Invalid input'

  const units = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  let unitIndex = 0

  while (bytes >= 1024 && unitIndex < units.length - 1) {
    bytes /= 1024
    unitIndex++
  }

  return `${bytes.toFixed(2)} ${units[unitIndex]}`
}
</script>
<style lang="scss" scoped>
p {
  color: gray;
}

.button {
  cursor: pointer;
  background-color: transparent;
  border: 0;
  padding: 0;
  border-radius: 50%;
  background-color: #e04f5f;
  width: 24px;
  height: 24px;
}
</style>
