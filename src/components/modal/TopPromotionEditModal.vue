<template>
  <BasicConfirm
    v-model:show="showModal"
    :close-label="closeLabel"
    :style="style"
    :title="title"
    style="min-width: 55vw"
    @hide="hideModal"
  >
    <template #content>
      <div class="form">
        <q-table
          v-model:pagination="pagination"
          :rows="dataModel"
          :table-style="{ maxHeight: '45vh' }"
          flat
          hide-no-data
          hide-pagination
          virtual-scroll
          separator="cell"
        >
          <template v-slot:header="props">
            <q-tr align="center">
              <q-th style="width: 4rem"> 번호</q-th>
              <q-th style="width: 5rem"> 타입</q-th>
              <q-th> 제목</q-th>
              <q-th style="width: 4rem"> 순서</q-th>
              <q-th style="width: 4rem"> 삭제</q-th>
            </q-tr>
          </template>
          <template v-slot:body="props">
            <q-tr align="center">
              <q-td>
                {{ props.rowIndex + 1 }}
              </q-td>
              <q-td>
                {{ getSaleType(props.row) }}
              </q-td>
              <q-td @click="goDetail($event, props.row)" style="cursor: pointer">
                {{ props.row['title'] }}
                <q-tooltip anchor="bottom middle" self="bottom middle">
                  {{ props.row['title'] }}
                </q-tooltip>
              </q-td>
              <q-td
                class="cursor-pointer"
                draggable="true"
                @dragstart="onDragStart($event, props)"
                @dragend="onDragEnd($event, props)"
                @dragover="onDragOver($event)"
                @drop="onDrop($event, props.rowIndex)"
              >
                <q-icon name="swap_vert" size="xs" />
              </q-td>
              <q-td style="text-overflow: clip">
                <q-btn unelevated style="width: 100%; height: 100%" @click="onDeleteRow(props.row)"
                >
                  <q-icon name="o_cancel"
                  />
                </q-btn>
              </q-td>
            </q-tr>
          </template>
        </q-table>
      </div>
    </template>
    <template #button>
      <q-btn :label="resetLabel" class="modal-btn-md" color="black" outline @click="onReset" />
      <q-btn :label="reserveLabel" class="modal-btn-md" color="black" outline @click="onEdit" />
    </template>
  </BasicConfirm>
  <RegistToast
    v-if="showToast"
    message="수정이 완료되었습니다!"
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
import { inject, onBeforeUpdate, ref } from 'vue'
import BasicConfirm from './BasicConfirm.vue'
import { cloneDeep } from 'lodash-es'
import COMMON from '@/constants/commonConstatns.js'
import RegistToast from '@/components/dialog/RegistToast.vue'

const showToast = ref(false)

const router = useRouter()
const emitter = inject('emitter')
const emit = defineEmits(['hide', 'update:model-value'])

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
  }
})

const showModal = defineModel('show', {
  type: Boolean,
  default: () => false,
  required: true
})

const originDataModel = defineModel('dataModel', {
  type: Object,
  default: () => [],
  required: true
})

const dataModel = ref([])

const pagination = ref({
  rowsNumber: 0
})

const closeLabel = ref('닫기')
const resetLabel = ref('초기화')
const reserveLabel = ref('확인')

onBeforeUpdate(async () => {
  dataModel.value = await cloneDeep(originDataModel.value)
  snSetting()
})

const snSetting = () => {
  dataModel.value.forEach((item, idx) => {
    item.sn = idx + 1
  })
}

const getSaleType = (row) => {
  return row.saleIdx ? '일반' : '앱 전용'
}

const onReset = async () => {
  dataModel.value = await cloneDeep(originDataModel.value)
  snSetting()
}

// const hasDuplicateSN = (dataArray) => {
//   const snSet = new Set()
//   for (const obj of dataArray) {
//     if (snSet.has(Number(obj.sn))) {
//       return true // 중복 발견
//     }
//     if (obj.sn !== undefined) {
//       snSet.add(obj.sn)
//     }
//   }
//   return false // 중복 없음
// }

const onEdit = async () => {
  emitter.emit(COMMON.LOADING.SHOW)

  // if (hasDuplicateSN(dataModel.value)) {
  //   alert('중복된 순서가 있습니다. 순서를 다시 확인해주세요.')
  // } else {
  showToast.value = true
  emit('update:model-value', dataModel.value)
  hide()
  // }

  emitter.emit(COMMON.LOADING.HIDE)
}

const hide = () => {
  showModal.value = false
}

const hideModal = () => {
  emit('hide')
}

const onDeleteRow = (row) => {
  const idx = dataModel.value.findIndex((item) => item.promotionSeq === row.promotionSeq)
  dataModel.value.splice(idx, 1)
  snSetting()
}

const goDetail = (event, target) => {
  router.push({
    name: 'PromotionDetail',
    state: {
      data: {
        cmsYn: target.cmsYn,
        idx: target.cmsYn === 'Y' ? target.saleIdx : target.promotionSeq
      }
    }
  })
}

// 드래그

let dragStartIndex = null

const onDragStart = (event, slotProps) => {
  dragStartIndex = slotProps.rowIndex
  event.dataTransfer.effectAllowed = 'move'
  event.dataTransfer.setData('text/plain', slotProps.row.index)
}

const onDragOver = (event) => {
  event.preventDefault() // 기본 동작을 방지하여 drop이 가능하게 만듦
}

const onDrop = (event, rowIndex) => {
  event.preventDefault()
  const dragEndIndex = rowIndex
  if (dragStartIndex !== null && dragStartIndex !== dragEndIndex) {
    const movedRow = dataModel.value.splice(dragStartIndex, 1)[0]
    dataModel.value.splice(dragEndIndex, 0, movedRow)

    dataModel.value.forEach((item, index) => {
      dataModel.value[index].sn = index + 1
    })
  }
  dragStartIndex = null
}

const onDragEnd = (slotProps) => {
  // 드래그 종료 후 이벤트 처리
  dragStartIndex = null
}
</script>
