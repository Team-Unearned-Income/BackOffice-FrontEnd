<template>
  <div class="row full-width" style="display: flex; gap: 0.5rem; justify-content: space-between">
    <div class="row" style="gap: 0.5rem">
      <div>
        <q-file
          v-model="files"
          label="찾아보기"
          outlined
          dense
          :clearable="!props.multiple"
          :use-chips="props.multiple"
          counter
          :multiple="props.multiple"
          :max-file-size="1024 * 1024 * 25"
          style="max-width: 300px"
          @update:model-value="onChangeFiles"
          @rejected="onRejected"
        />
      </div>
      <div class="row">
        <div
          v-for="(originalFile, index) in originalFiles"
          :key="index"
          class="file-chip"
          style="display: flex; flex-direction: column"
        >
          <div style="display: flex; flex-direction: row; gap: 0.5rem; align-items: center">
            <span style="cursor: pointer" @click="downloadFile(index)">{{
                originalFile.realNm
              }}</span>
            <button class="icon-button" @click="onDelete(index)">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                height="20px"
                viewBox="0 -960 960 960"
                width="20px"
                fill="#FFFFFF"
              >
                <path
                  d="m256-200-56-56 224-224-224-224 56-56 224 224 224-224 56 56-224 224 224 224-56 56-224-224-224 224Z"
                />
              </svg>
            </button>
          </div>
          <span>{{ formatBytes(originalFile.size) }}</span>
        </div>
      </div>
    </div>
    <div><span>* 최대 25MB까지 등록가능합니다</span></div>
  </div>
</template>
<script setup>
import { inject, onBeforeMount, ref } from 'vue'
import COMMON from '@/constants/commonConstatns.js'
import axios from 'axios'

const emit = defineEmits(['update:model-value'])
const emitter = inject('emitter')

const props = defineProps({
  fileGroupId: {
    type: String,
    required: false,
    default: () => null
  },
  multiple: {
    type: Boolean,
    required: false,
    default: () => false
  },
  fileInfo: {
    type: Object,
    default: () => null
  }
})

const files = ref(null)
const originalFiles = ref(null)

onBeforeMount(async () => {
  await originalFilesSetting()
})

const originalFilesSetting = async () => {
  if (props.fileInfo != null && Object.keys(props.fileInfo).length > 0) {
    originalFiles.value = [props.fileInfo]
  }
}

const fileChangeSetting = (updatedFileInfo) => {
  originalFiles.value = [updatedFileInfo]
}

const onChangeFiles = () => {
  originalFiles.value = []
  emit('update:model-value', files.value)
}

const onRejected = () => {
  alert('최대 25MB까지만 업로드 가능합니다!')
}

const downloadFile = async (index) => {
  try {
    emitter.emit(COMMON.LOADING.SHOW)

    const blob = await axios
      .get(`${import.meta.env.VITE_API_SERVER}/api/v1/file`, {
        params: {
          fileGroupId: props.fileGroupId,
          fileId: originalFiles.value[index].fileId
        },
        headers: {
          Authorization: `Bearer ${localStorage.getItem('auth').split('"accessToken":"')[1].split('"')[0]}`
        },
        responseType: 'blob'
      })
      .then((res) => res.data)

    const url = window.URL.createObjectURL(blob)

    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', originalFiles.value[index].realNm)
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(url)

    emitter.emit(COMMON.LOADING.HIDE)
  } catch (error) {
    console.error('파일 다운로드 중 오류 발생: ', error)
  }
}

const onDelete = async (index) => {
  originalFiles.value.splice(index, 1)
  emit('update:model-value', files.value)
  // const deleteOk = confirm('삭제하시겠습니까?')
  // if (deleteOk) {
  //   await fileApi.deleteSingleFile({ fileId: originalFiles.value[index].fileId })
  //   originalFiles.value.splice(index, 1)

  //   emit('update:model-value', files.value)
  // }
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
const clearFileInput = () => {
  files.value = null
}

defineExpose({
  fileChangeSetting,
  originalFilesSetting,
  clearFileInput
})
</script>
<style lang="scss" scoped>
.file-chip {
  background-color: #e6e6e6;
  padding: 0.5rem;
  border-radius: 5px;
  align-items: flex-end;
  justify-content: space-between;
  margin: 0 0.5rem 0.5rem 0;
  // > div > span {
  //   max-width: 1rem;
  //   height: 1rem;
  //   text-overflow: ellipsis;
  // }
}

.icon-button {
  cursor: pointer;
  background-color: #e04f5f;
  border: 0;
  border-radius: 50%;
  width: 1rem;
  height: 1rem;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0;
}
</style>
