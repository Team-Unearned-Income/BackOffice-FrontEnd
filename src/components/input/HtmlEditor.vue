<template>
  <div id="q-app">
    <q-editor
      :model-value="props.modelValue"
      :toolbar="toolbar"
      :definitions="definitions"
      @update:model-value="updateContent"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useQuasar } from 'quasar'

const qDefault = useQuasar()
const emit = defineEmits(['update:model-value', 'update:file-group-id'])

const props = defineProps({
  modelValue: {
    type: String,
    default: '내용을 입력하세요.'
  },
  fileGroupId: {
    type: String,
    default: () => '',
  },
  fileFeature: {
    type: String,
    default: () => '',
  }
})

const toolbar = ref([
  ['viewsource'],
  ['undo', 'redo'],

  ['bold', 'italic', 'strike', 'underline', 'subscript', 'superscript', 'removeFormat'],
  [
    {
      label: qDefault.lang.editor.formatting,
      icon: qDefault.iconSet.editor.formatting,
      list: 'no-icons',
      options: ['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'code']
    },
    {
      label: qDefault.lang.editor.fontSize,
      icon: qDefault.iconSet.editor.fontSize,
      fixedLabel: true,
      fixedIcon: true,
      list: 'no-icons',
      options: ['size-1', 'size-2', 'size-3', 'size-4', 'size-5', 'size-6', 'size-7']
    }
  ],
  [
    {
      label: qDefault.lang.editor.align,
      icon: qDefault.iconSet.editor.align,
      fixedLabel: true,
      options: ['left', 'center', 'right', 'justify']
    }
  ],
  ['quote', 'unordered', 'ordered'],
  ['token', 'hr', 'link', 'custom_btn'],
  ['print', 'fullscreen'],
  ['insert_img']
])

const definitions = ref({
  insert_img: {
    tip: '사진 첨부',
    label: '사진넣기',
    icon: 'photo',
    handler: () => {
      const input = document.createElement('input')
      input.type = 'file'
      input.accept = '.png, .jpg'
      let file
      input.onchange = async () => {
        const files = Array.from(input.files)
        file = files[0]

        let fileUrl = null;
        if(props.fileFeature === 'notice') {
          const {data} = await marketingApi.uploadNoticeEditorFile({
            fileGroupId: props.fileGroupId,
            uploadFile: file
          })
          emit('update:file-group-id', data.fileGroupId)
          fileUrl = data.fileUrl
        } else if(props.fileFeature === 'promotion') {
          const {data} = await ticketApi.uploadPromotionEditorFile({
            fileGroupId: props.fileGroupId,
            uploadFile: file
          })
          emit('update:file-group-id', data.fileGroupId)
          fileUrl = data.fileUrl
        } else {
          throw new Error('파일 경로가 유효하지 않습니다.')
        }

        const currentContent = props.modelValue || ''
        const updatedContent =
          currentContent + `<div><img style="max-width: 100%;" src="${fileUrl}" /></div>`
        updateContent(updatedContent)
      }
      input.click()
    }
  }
})

const updateContent = (newValue) => {
  emit('update:model-value', newValue)
}
</script>

<style scoped></style>
