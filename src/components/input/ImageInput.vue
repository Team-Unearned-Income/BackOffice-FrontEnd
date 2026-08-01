<template>
  <div>
    <div v-if="label" class="field-label">{{ label }}</div>
    <div class="image-input-box row items-center q-gutter-md">
      <div class="preview-frame flex flex-center">
        <img v-if="previewSrc" :src="previewSrc" alt="미리보기" class="preview-image" />
        <span v-else class="text-grey-6 text-caption">이미지 없음</span>
      </div>
      <div class="column q-gutter-sm">
        <q-btn
          :label="previewSrc ? '이미지 변경' : '이미지 선택'"
          outline
          color="dark"
          dense
          no-caps
          @click="triggerFilePicker"
        />
        <q-btn
          v-if="previewSrc"
          label="선택 취소"
          flat
          dense
          no-caps
          color="grey-7"
          @click="clearSelection"
        />
        <input
          ref="fileInputRef"
          type="file"
          accept="image/*"
          class="hidden-file-input"
          @change="handleFileChange"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  /** 기존(서버 저장된) 이미지 URL — 수정 화면 진입 시 프리필용 */
  previewUrl: {
    type: String,
    default: null
  },
  label: {
    type: String,
    default: ''
  }
})

const file = defineModel({ type: File, default: null })

const fileInputRef = ref(null)
const previewSrc = ref(props.previewUrl)

watch(
  () => props.previewUrl,
  (url) => {
    if (!file.value) previewSrc.value = url
  }
)

const triggerFilePicker = () => fileInputRef.value?.click()

const handleFileChange = (event) => {
  const selected = event.target.files?.[0]
  if (!selected) return

  if (previewSrc.value && previewSrc.value.startsWith('blob:')) URL.revokeObjectURL(previewSrc.value)
  previewSrc.value = URL.createObjectURL(selected)
  file.value = selected
}

const clearSelection = () => {
  if (previewSrc.value && previewSrc.value.startsWith('blob:')) URL.revokeObjectURL(previewSrc.value)
  file.value = null
  previewSrc.value = props.previewUrl
  if (fileInputRef.value) fileInputRef.value.value = ''
}
</script>

<style scoped>
.field-label {
  font-size: 0.82rem;
  font-weight: 600;
  color: #555;
  margin-bottom: 0.35rem;
}
.preview-frame {
  width: 96px;
  height: 96px;
  border: 1px solid #ddd;
  border-radius: 4px;
  overflow: hidden;
  background: #fafafa;
}
.preview-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.hidden-file-input {
  display: none;
}
</style>
