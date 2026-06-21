<template>
  <div class="q-pa-md">
    <div class="form">
      <div v-for="(guide, index) in guidemapSeq" :key="index" class="row">
        <div class="col-1 form-th required">{{ guide }}</div>
        <div class="col-11 form-td">
          <FileInput
            v-if="isReady"
            :ref="
              (el) => {
                fileInputRef[index] = el
                return fileInputRef[index]
              }
            "
            :file-group-id="dataModel[index].fileGroupId"
            :file-info="{
              fileId: dataModel[index].fileId,
              realNm: dataModel[index].realNm,
              size: dataModel[index].size
            }"
            @update:model-value="
              (value) => {
                filesRef[index].fileId = dataModel[index].fileId
                filesRef[index].file = value
              }
            "
          />
        </div>
      </div>
    </div>
    <!-- 상세 하단 버튼 -->
    <div class="row justify-between q-pt-lg">
      <span>
        ※ 수정/추가 후 아래 등록 버튼을 클릭하여야 정상 저장됩니다.
        <br />
        ※ X 버튼을 누를 경우, 기존파일이 삭제됩니다.
      </span>
      <div>
        <q-btn style="background-color: #169bd5; color: white" label="등록" @click="onRegist" />
      </div>
    </div>
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
import { ref, onBeforeMount, inject, nextTick } from 'vue'
import { guidemapApi } from '@/service/api'
import FileInput from '@/components/input/FileInput.vue'
import COMMON from '@/constants/commonConstatns.js'
import RegistToast from '@/components/dialog/RegistToast.vue'

const router = useRouter()

const isReady = ref(false)
const emitter = inject('emitter')

const dataModel = ref(null)
const guidemapSeq = ref(['국문', '영문', '중문'])
const filesRef = ref([{}, {}, {}])
const fileInputRef = ref([])
const showToast = ref(false)
const toastMessage = ref('추가/수정이 완료되었습니다!')
const toastStatus = ref('success')

onBeforeMount(async () => {
  await guideMapSetting()
})

const guideMapSetting = async () => {
  const guidemapResponse = await guidemapApi.getGuideMapList().then((res) => res.data)

  dataModel.value = guidemapResponse

  isReady.value = true
}

const onRegist = async () => {
  emitter.emit(COMMON.LOADING.SHOW)

  for (let i = 1; i <= 3; i++) {
    if (filesRef.value[i - 1].file) {
      const request = {
        guideMapSeq: i,
        deleteFileId: filesRef.value[i - 1].fileId ?? '',
        uploadFile: filesRef.value[i - 1].file
      }

      const response = await guidemapApi.uploadGuideMapFile(request).catch((err) => err)

      if (response.success) {
        fileInputRef.value[i - 1].clearFileInput()
        fileInputRef.value[i - 1].fileChangeSetting({
          fileId: filesRef.value[i - 1].fileId,
          realNm: filesRef.value[i - 1].file.name,
          size: filesRef.value[i - 1].file.size
        })
        toastMessage.value = '추가/수정이 완료되었습니다!'
        toastStatus.value = 'success'
        showToast.value = true
      } else {
        filesRef.value[i - 1].fileId = null
        i--
        toastMessage.value = response.message
        toastStatus.value = 'failed'
        showToast.value = true
      }
    }
  }
  emitter.emit(COMMON.LOADING.HIDE)
}
</script>
