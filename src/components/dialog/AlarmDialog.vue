<template>
  <q-dialog ref="dialogRef" v-model="isOpen" no-backdrop-dismiss @hide="onDialogHide">
    <div class="bg-white q-px-xl q-py-lg">
      <div class="row items-center justify-center" style="gap: 0.5rem">
        <q-icon name="o_info" class="text-primary text-subtitle1 text-bold" />
        <span class="text-primary text-subtitle1 text-bold">
          {{ props.title }}
        </span>
      </div>
      <div class="q-pt-sm">
        <span class="text-black">{{ props.message }}</span>
      </div>
      <div class="column">
        <q-btn color="primary q-mt-sm" @click="onClickConfirm">
          <span class="text-white"> {{ props.confirmLabel }} </span>
        </q-btn>
        <template v-if="props.cancel">
          <q-btn color="white q-mt-sm" @click="onClickCancel">
            <span class="text-black">{{ props.cancelLabel }}</span>
          </q-btn>
        </template>
      </div>
    </div>
  </q-dialog>
</template>

<script setup>
import { computed } from 'vue'
import { useDialogPluginComponent } from 'quasar'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: undefined
  },
  title: {
    type: String,
    default: '알림'
  },
  message: {
    type: String,
    default: ''
  },
  confirmLabel: {
    type: String,
    default: '확인'
  },
  cancelLabel: {
    type: String,
    default: '취소'
  },
  cancel: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue', ...useDialogPluginComponent.emits])

const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } = useDialogPluginComponent()

const isOpen = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v)
})

const onClickConfirm = () => {
  onDialogOK()
}

const onClickCancel = () => {
  onDialogCancel()
}
</script>
