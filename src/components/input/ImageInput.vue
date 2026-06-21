<template>
  <div class="row items-center" style="max-width: 40vw">
    <div class="row items-center">
      <div class="preview-container">
        <label v-if="!previewSrc" :for="props.usage">찾아보기</label>
        <button v-if="previewSrc" class="button file-cancel" @click="handleDelete">
          <q-tooltip anchor="top middle" self="top middle">삭제</q-tooltip>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            height="24px"
            viewBox="0 -960 960 960"
            width="24px"
            fill="#FFFFFF"
            style="background-color: #e04f5f; border-radius: 50%"
          >
            <path
              d="m256-200-56-56 224-224-224-224 56-56 224 224 224-224 56 56-224 224 224 224-56 56-224-224-224 224Z"
            />
          </svg>
        </button>
        <img v-if="previewSrc" :src="previewSrc" alt="Preview" class="preview-image" />
        <input
          :id="props.usage"
          :key="fileRef ? fileRef.name : Date.now()"
          type="file"
          accept="image/*"
          @change="handleFile"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import axios from 'axios'
import { ref, nextTick, onBeforeUpdate } from 'vue'

const emit = defineEmits(['update:model-value'])

const props = defineProps({
  usage: {
    type: String,
    required: false,
    default: () => 'file'
  },
  fileId: {
    type: String,
    required: false,
    default: () => null
  },
  fileGroupId: {
    type: String,
    required: false,
    default: () => null
  },
  fileUrl: {
    type: String,
    required: false,
    default: () => null
  },
  extension: {
    type: Array,
    required: false,
    default: () => []
  },
  width: {
    type: Number,
    required: false,
    default: () => null
  },
  height: {
    type: Number,
    required: false,
    default: () => null
  },
  aspectRatio: {
    type: Number,
    required: false,
    default: () => null
  }
})

const fileRef = ref(null)
const previewSrc = ref(null)
const isFirst = ref(true)

onBeforeUpdate(async () => {
  await nextTick(async () => {
    if (isFirst.value)  {
        if(props.fileUrl) {
          previewSrc.value = props.fileUrl
        } else if(props.fileGroupId && props.fileId) {
          getImageView();
        }
    }
  })
})

const getImageView = async () => {
  if (!props.fileGroupId || !props.fileId) return

  isFirst.value = false

  const imageRequest = {
    fileGroupId: props.fileGroupId,
    fileId: props.fileId
  }

  const imageResponse = await axios
    .get(`${import.meta.env.VITE_API_SERVER}/api/v1/file/view`, {
      params: imageRequest,
      headers: {
        Authorization: `Bearer ${localStorage.getItem('auth').split('"accessToken":"')[1].split('"')[0]}`
      },
      responseType: 'arraybuffer'
    })
    .then((res) => res.data)

  const base64String = arrayBufferToBase64(imageResponse)

  previewSrc.value = `data:image/png;base64,${base64String}`
}

const arrayBufferToBase64 = (buffer) => {
  let binary = ''
  const bytes = new Uint8Array(buffer)
  const length = bytes.length
  for (let i = 0; i < length; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return btoa(binary)
}

const handleFile = (event) => {
  const file = event.target.files[0]
  if (!file) {
    previewSrc.value = ''
    fileRef.value = null
    emit('update:model-value', null)
    return
  }

  if (!validateExtention(file.name)) {
    alert('허용되지 않은 확장자입니다!')
    return
  }

  const reader = new FileReader()
  reader.onload = (e) => {
    const img = new Image()
    img.src = e.target.result

    img.onload = () => {
      // const aspectRatio = img.width / img.height
      // if (props.aspectRatio && Math.abs(aspectRatio - props.aspectRatio) > 0.01) {
      if (
        props.width &&
        props.height &&
        (img.width !== props.width || img.height !== props.height)
      ) {
        alert('비율에 맞는 이미지를 업로드 해 주세요.')
        previewSrc.value = null // 파일 입력 초기화
      } else {
        previewSrc.value = e.target.result
        fileRef.value = file
        emit('update:model-value', file)
      }
    }
  }
  reader.readAsDataURL(file)
}

const handleDelete = () => {
  previewSrc.value = null
  fileRef.value = null

  emit('update:model-value', fileRef.value)
}

const validateExtention = (name) => {
  if (props.extension.length === 0) return true
  return props.extension.some((ext) => name.toLowerCase().endsWith(`.${ext}`))
}
</script>

<style scoped>
.preview-container {
  position: relative;
  display: grid;
  margin: 1rem;
  min-width: 12rem;
  min-height: 100px;
  border: 1px solid #ddd;
  border-radius: 4px;
}
.preview-image {
  width: 100%;
  height: auto;
  border-radius: 4px;
}
.button {
  cursor: pointer;
  background-color: transparent;
  border: 0;
  padding: 0;
}
.file-cancel {
  position: absolute;
  right: 5px;
  top: 5px;
}
.preview-container > label {
  position: absolute;
  cursor: pointer;
  background-color: white;
  box-shadow: 1px 1px 1px gray;
  border: 1px solid black;
  border-radius: 10px;
  text-align: center;
  padding: 0.3rem;
  justify-self: center;
  align-self: center;
}
input {
  display: none;
}
</style>
