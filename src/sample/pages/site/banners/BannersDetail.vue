<template>
  <div class="q-pa-md">
    <div class="form">
      <div class="row">
        <div class="col-1 form-th required">게시여부</div>
        <div class="col-11 form-td">
          <q-radio v-model="dataModel.postYn" val="N" label="미게시"></q-radio>
          <q-radio v-model="dataModel.postYn" val="Y" label="게시"></q-radio>
          <q-checkbox
            v-model="computeSetDataYn"
            label="게시기간"
            size="sm"
            style="max-width: 100px; justify-self: flex-end"
          />
          <DateInput
            v-model="postDate.from"
            style="margin-right: 0.5rem"
            :disable="!computeSetDataYn"
          />
          ~
          <DateInput
            v-model="postDate.to"
            style="margin-left: 0.3rem;margin-right: 0.5rem"
            :disable="!computeSetDataYn"
          />
          <div style="width: 300px;">
            <DoubleTimeInput
              v-model="postTime"
              :start-time="dataModel.postStartTime"
              :end-time="dataModel.postEndTime"
              :disable="!computeSetDataYn"
            />
          </div>
        </div>
      </div>
      <div class="row">
        <div class="col-1 form-th required">위치</div>
        <div class="col-4 form-td">
          <q-select
            v-model="computeLocationType"
            :options="filterOptions.locationTypeList"
            class="full-width"
            dense
            hide-bottom-space
            outlined
          />
        </div>
      </div>
      <div class="row">
        <div class="col-1 form-th required">제목</div>
        <div class="col-8 form-td">
          <q-input
            class="full-width"
            v-model="dataModel.title"
            type="textarea"
            autogrow
            outlined
            center
            dense
            @blur="dataModel.title = dataModel.title.trim()"
          />
        </div>
        <div class="col-2 form-td justify-end">
          <q-checkbox label="제목노출" size="sm" v-model="computeTitleViewYn" />
        </div>
      </div>
      <div class="row">
        <div class="col-1 form-th required">배너이미지<br />(1200x390)</div>
        <div class="col-11 form-td">
          <ImageInput
            :file-url="dataModel.fileUrl"
            :width="1200"
            :height="390"
            @update:model-value="(image) => handleImageUpdate(image)"
          />
          <div
            style="
              height: 100%;
              display: flex;
              flex-direction: column;
              gap: 0.5rem;
              justify-content: space-between;
            "
          >
            <div style="visibility: hidden"></div>
            <div>
              <div>
                <span>{{ dataModel.fileName }}</span>
              </div>
              <span>{{ formatBytes(dataModel.fileSize) }}</span>
            </div>
            <p>* 규격에 맞는 이미지를 사용해주세요</p>
          </div>
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
            :disable="dataModel.linkUseYn !== 'Y'"
          />
        </div>
        <div class="col-2 form-td" v-if="dataModel.linkType === 'SCREEN'">
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
        </div>
        <div class="col-4 form-td" v-else>
          <q-input
            class="full-width"
            v-model="dataModel.linkUrl"
            placeholder="url을 입력해주세요."
            outlined
            center
            dense
          />
        </div>
      </div>
    </div>
    <!-- 상세 하단 버튼 -->
    <div class="row justify-between q-pt-lg">
      <div style="display: flex; gap: 1rem">
        <q-btn label="목록" @click="router.push(previousQueryUrl ?? { name: 'BannersList' })" />
        <q-btn label="삭제" @click="onDelete" :disable="bannerSeq === null" />
      </div>
      <div>
        <q-btn style="background-color: #169bd5; color: white" label="등록" @click="onRegist" />
      </div>
    </div>
  </div>
  <RegistToast
    v-if="showToast"
    :message="bannerSeq ? '수정이 완료되었습니다!' : '등록이 완료되었습니다!'"
    :duration="1000"
    @hidden="
      () => {
        showToast = false
      }
    "
  />
  <LinkSearchModal
    v-if="showModal"
    v-model:show="showModal"
    title="링크 검색"
    :type="dataModel.screenName"
    :options="filterOptions.screenNameList"
    style="min-width: 80vw"
    @update:model-value="
      (value) => {
        dataModel.linkUrl = value.seq
        dataModel.screenTitle = value.title
      }
    "
  />
</template>

<script setup>
import { useRouter } from 'vue-router'
import { computed, nextTick, onBeforeMount, onMounted, ref } from 'vue'
import FilterUtils from '@/utils/FilterUtils.js'
import DateInput from '@/components/input/DateInput.vue'
import ImageInput from '@/components/input/ImageInput.vue'
import RegistToast from '@/components/dialog/RegistToast.vue'
import LinkSearchModal from '@/components/modal/LinkSearchModal.vue'
import { previousQueryUrl } from '@/router'
import DoubleTimeInput from '@/components/input/DoubleTimeInput.vue'

const router = useRouter()

const bannerSeq = ref(null)
const showToast = ref(false)
const showModal = ref(false)
const isReady = ref(false)

const isSubmitting = ref(false)

const filterOptions = ref({
  postYnList: [],
  linkUseYnList: [],
  locationTypeList: [],
  linkTypeList: [],
  screenNameList: []
})

const dataModel = ref({
  postYn: null,
  setDateYn: 'N',
  postStartDate: null,
  postEndDate: null,
  postStartTime: null,
  postEndTime: null,
  locationType: null,
  title: null,
  fileId: null,
  fileGroupId: null,
  fileName: null,
  fileSize: null,
  linkUseYn: null,
  linkType: null,
  linkUrl: null,
  screenTitle: null,
  screenName: null,
  titleViewYn: 'N',
  order: null
})

const postDate = ref({
  from: null,
  to: null
})

const postTime = ref({})

const imageRef = ref(null)

const computeSetDataYn = computed({
  get: () => (dataModel.value.setDateYn === 'Y' ? true : false),
  set: (value) => {
    dataModel.value.setDateYn = value ? 'Y' : 'N'
  }
})

const computeTitleViewYn = computed({
  get: () => (dataModel.value.titleViewYn === 'Y' ? true : false),
  set: (value) => {
    dataModel.value.titleViewYn = value ? 'Y' : 'N'
  }
})

const computeLocationType = computed({
  get: () => {
    return dataModel.value.locationType !== null
      ? filterOptions.value.locationTypeList.find(
        (item) => item.value === dataModel.value.locationType
      )
      : null
  },
  set: (value) => {
    dataModel.value.locationType = value.value
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
    dataModel.value.linkType = null
    dataModel.value.screenName = null
    dataModel.value.linkUrl = null
    dataModel.value.screenTitle = null
  }
})

const computeLinkType = computed({
  get: () =>
    dataModel.value.linkType !== null
      ? dataModel.value.linkType === 'SCREEN'
        ? '내부화면'
        : '외부링크'
      : null,
  set: (value) => {
    dataModel.value.linkType = value.value
    dataModel.value.screenName = null
    dataModel.value.linkUrl = null
    dataModel.value.screenTitle = null
  }
})

const computeScreenName = computed({
  get: () => {
    const match = filterOptions.value.screenNameList.find(
      (item) => item.value === dataModel.value.screenName
    )
    return match ? match.label : dataModel.value.screenName
  },
  set: (value) => {
    dataModel.value.screenName = value.value
    dataModel.value.linkUrl = null
    dataModel.value.screenTitle = null
  }
})

onBeforeMount(async () => {
  bannerSeq.value = new URLSearchParams(window.location.search).get('bannerSeq')
})

onMounted(async () => {
  await filterSetting()
  await nextTick(async () => {
    await onRequest()
  })
})

const filterSetting = async () => {
  const filterList = await sitemanagementApi.getBannerCodeList().then((res) => res.data)
  filterOptions.value = FilterUtils.parseFilterArray(filterList)
}

const handleImageUpdate = (image) => {
  if (!image) {
    dataModel.value.fileName = null
    dataModel.value.fileSize = null
    dataModel.value.fileId = null
    dataModel.value.fileUrl = null
    imageRef.value = null

    return
  }

  dataModel.value.fileName = image.name
  dataModel.value.fileSize = image.size

  imageRef.value = image
}

const onRequest = async () => {
  if (!bannerSeq.value) {
    isReady.value = true
    return
  }

  const mainVisualResponse = await sitemanagementApi
    .getBannerInfoGet(bannerSeq.value)
    .then((res) => res.data)

  dataModel.value = JSON.parse(JSON.stringify(mainVisualResponse))

  postDate.value.from = dataModel.value.postStartDate
  postDate.value.to = dataModel.value.postEndDate
  postTime.value.startTime = dataModel.value.postStartTime
  postTime.value.endTime = dataModel.value.postEndTime

  isReady.value = true
}
const canRegist = () => {
  return (
    dataModel.value.postYn &&
    dataModel.value.title &&
    dataModel.value.title !== '' &&
    (dataModel.value.linkUseYn === 'Y'
      ? dataModel.value.linkUrl && dataModel.value.linkUrl !== '' && dataModel.value.linkType
      : dataModel.value.linkUseYn)
  )
}

const onRegist = async () => {
  if ((!imageRef.value && !bannerSeq.value) || !dataModel.value.fileName) {
    alert('이미지가 없습니다. 이미지 업로드 후 다시 시도해주세요.')
    return
  }

  const dateFrom = new Date(postDate.value.from)
  const dateTo = new Date(postDate.value.to)
  if (postDate.value.from && postDate.value.to && dateFrom > dateTo) {
    alert('게시기간 종료일이 시작일보다 큽니다.')
    return
  }

  if (isSubmitting.value) return
  isSubmitting.value = true

  try {
    if (!canRegist()) {
      alert('필수 입력값을 입력해주세요.')
      isSubmitting.value = false // 실패 시 플래그 초기화
      return
    }

    if (dataModel.value.setDateYn === 'N') {
      dataModel.value.postStartDate = null
      dataModel.value.postEndDate = null
      dataModel.value.postStartTime = null
      dataModel.value.postEndTime = null
    } else {
      dataModel.value.postStartDate = postDate.value.from
      dataModel.value.postEndDate = postDate.value.to
      dataModel.value.postStartTime = postTime.value.startTime
      dataModel.value.postEndTime = postTime.value.endTime
    }

    const formData = new FormData()
    formData.append(
      'request',
      new Blob([JSON.stringify(dataModel.value)], { type: 'application/json' })
    )
    formData.append('file', imageRef.value ?? new Blob(['']))

    let regResponse
    if (bannerSeq.value)
      regResponse = await sitemanagementApi
        .updateBanner(bannerSeq.value, formData)
        .then((res) => res.data)
    else regResponse = await sitemanagementApi.regBanner(formData).then((res) => res.data)

    showToast.value = true

    setTimeout(() => {
      router.replace(previousQueryUrl.value ?? { name: 'BannersList' })
      isSubmitting.value = false
    }, 1000)
  } catch (error) {
    console.error('등록 중 오류 발생:', error)
    isSubmitting.value = false
  }
}

const onDelete = async () => {
  const isDelete = confirm('정말 삭제하시겠습니까?')
  if (!isDelete) {
    return
  }
  try {
    await sitemanagementApi.deleteBanner(bannerSeq.value)
    alert('삭제되었습니다!')
    router.push(previousQueryUrl.value ?? { name: 'BannersList' })
  } catch (error) {
    alert('삭제에 실패하였습니다.')
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
