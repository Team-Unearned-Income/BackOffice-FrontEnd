<template>
  <BasicConfirm
    v-model:show="showModal"
    :close-label="closeLabel"
    :style="style"
    :title="title"
    style="min-width: 50vw; max-width: 80vw"
    @hide="hideModal"
  >
    <template #content>
      <div class="form">
        <div class="row q-py-sm">
          <div class="col-1 form-th">팝업문구</div>
          <div class="col-11 form-td">
            <q-input
              v-model.trim="dataModel.lunarpassPlusNotice"
              ref="plusNoticeRef"
              type="textarea"
              class="col self-center"
              outlined
              dense
              counter
              maxlength="1000"
              @blur="
                dataModel.lunarpassPlusNotice =
                  dataModel.lunarpassPlusNotice.trim() || null
              "
              :rules="[(val) => !!val || '팝업문구를 입력해주세요.']"
            />
          </div>
        </div>
      </div>
    </template>
    <template #button>
      <q-btn :label="checkLabel" class="modal-btn-md" color="black" outline @click="onEdit" />
    </template>
  </BasicConfirm>
</template>

<script setup>
import { inject, onBeforeMount, ref } from 'vue'
import BasicConfirm from './BasicConfirm.vue'
import COMMON from '@/constants/commonConstatns.js'
import { cloneDeep } from 'lodash-es'

const emitter = inject('emitter')
const emit = defineEmits(['hide', 'modal-data-model', 'update:model-value'])
const props = defineProps({
  title: {
    type: String,
    default: () => ''
  },
  size: {
    type: String,
    default: () => 'sm'
  },
  style: {
    type: Object,
    default: () => {
    }
  },
  data: {
    type: Object,
    required: true,
    default: () => {
    }
  }
})

const showModal = defineModel('show', {
  type: Boolean,
  default: () => false,
  required: true
})

const originDataModel = ref({})
const dataModel = ref({})

const closeLabel = ref('취소')
const checkLabel = ref('수정')

const plusNoticeRef = ref(null)

onBeforeMount(async () => {
  emitter.emit(COMMON.LOADING.SHOW)

  originDataModel.value = props.data

  dataModel.value = cloneDeep(originDataModel.value)

  emitter.emit(COMMON.LOADING.HIDE)
})

const onEdit = async () => {
  if (!(await plusNoticeRef.value.validate())) return

  emitter.emit(COMMON.LOADING.SHOW)

  emit('update:model-value', dataModel.value)

  emitter.emit(COMMON.LOADING.HIDE)
  hide()
}

const hide = () => {
  showModal.value = false
}

const hideModal = () => {
  emit('hide')
}
</script>
