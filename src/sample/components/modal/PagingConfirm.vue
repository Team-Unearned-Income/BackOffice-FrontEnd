<template>
  <q-dialog
    v-model.trim="showModal"
    no-backdrop-dismiss
    no-shake
    @show="emit('show')"
    @before-hide="beforeHideDialog"
    @before-show="beforeShowDialog"
    :style="props.style"
  >
    <div :class="['custom-modal', size && `modal-size-${size}`, 'no-scroll']" :style="dialogStyle">
      <!-- 헤더 영역 -->
      <div
        v-touch-pan.mouse="onPan"
        class="modal-header row items-center q-pa-md"
        :style="headerStyle"
        style="gap: 1rem"
      >
        <div class="col-auto text-h6 text-bold">{{ title }}</div>
        <div class="col">
          <slot name="sub-title" />
        </div>
        <q-space />
        <q-btn
          v-close-popup
          dense
          flat
          icon="close"
          round
          @touchstart.stop
          @mousedown.stop
        />
      </div>

      <!-- 콘텐츠 영역 -->
      <div>
        <slot name="content" />
      </div>
    </div>
  </q-dialog>
</template>

<script setup>
import { computed, ref } from 'vue'

const emit = defineEmits(['hide', 'show'])
const props = defineProps({
  title: {
    type: String,
    default: () => '타이틀',
    required: true
  },
  size: {
    type: String,
    default: () => ''
  },
  // 닫기 버튼 사용 여부
  showCloseBtn: {
    type: Boolean,
    default: () => true
  },
  // 닫기 라벨
  closeLabel: {
    type: String,
    default: () => '취소'
  },
  style: {
    type: Object,
    default: () => {
    }
  },
  // 드래그 기능 사용 여부
  draggable: {
    type: Boolean,
    default: () => true
  },
  /** 페이징 테이블 사용 여부*/
  pageTable: {
    type: Boolean,
    default: () => false
  }
})

const showModal = defineModel('show', {
  type: Boolean,
  default: () => false,
  required: true
})

// 모달의 position
const dialogPos = ref({
  x: 0,
  y: 0
})

// prop style + position style computed
const dialogStyle = computed(() => {
  let style = props.style
  if (props.draggable) {
    style = {
      transform: `translate(${dialogPos.value.x}px, ${dialogPos.value.y}px)`,
      ...props.style
    }
  }
  return style
})

// 드래그 사용하는 경우 커서 아이콘 변경
const headerStyle = computed(() => {
  let style = {}
  if (props.draggable) {
    style = { cursor: 'move' }
  }
  return style
})

// 모달의 위치 변경
const onPan = (evt) => {
  if (props.draggable) {
    dialogPos.value = {
      x: dialogPos.value.x + evt.delta.x,
      y: dialogPos.value.y + evt.delta.y
    }
  }
}

const beforeHideDialog = () => {
  emit('hide')
}

const beforeShowDialog = () => {
  // 모달 활성화시 position 초기화
  if (props.draggable) {
    dialogPos.value = {
      x: 0,
      y: 0
    }
  }
}
</script>
<style scoped>
.custom-modal {
  background: white;
  border-radius: 8px;
  max-width: 90vw;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

</style>
