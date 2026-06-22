<template>
  <BasicConfirm
    v-model:show="showModal"
    :close-label="closeLabel"
    :style="style"
    :title="title"
    style="width: 200vh"
    @hide="hideModal"
  >
    <template #content>
      <div style="color: gray">
        <p>* 게시상태가 게시인 게시물만 표시됩니다.</p>
      </div>
      <q-tabs
        v-if="props.type === 'BANNER'"
        v-model="tabRef"
        dense
        class="text-grey"
        active-color="black"
        indicator-color="black"
        narrow-indicator
      >
        <q-tab v-for="(tab, idx) in props.tab" :name="tab.value" :label="tab.label" />
      </q-tabs>
      <div class="form">
        <q-table
          v-model:pagination="pagination"
          :rows="filterData"
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
              <q-th> 제목</q-th>
              <q-th style="width: 6rem"> 순서</q-th>
            </q-tr>
          </template>
          <template v-slot:body="slotProps">
            <q-tr align="center">
              <q-td>
                {{ slotProps.pageIndex + 1 }}
              </q-td>
              <q-td @click="goDetail($event, slotProps.row)" style="cursor: pointer">
                {{ slotProps.row['title'] }}
                <q-tooltip anchor="bottom middle" self="bottom middle">
                  {{ slotProps.row['title'] }}
                </q-tooltip>
              </q-td>
              <q-td
                class="cursor-pointer"
                draggable="true"
                @dragstart="onDragStart($event, slotProps)"
                @dragend="onDragEnd($event, slotProps)"
                @dragover="onDragOver($event)"
                @drop="
                  props.type === 'BANNER'
                    ? onBannerDrop($event, slotProps)
                    : onNormalDrop($event, slotProps.rowIndex)
                "
              >
                <q-icon name="swap_vert" size="xs" />
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
import { computed, inject, nextTick, onMounted, ref, watch } from 'vue'
import BasicConfirm from './BasicConfirm.vue'
import { cloneDeep } from 'lodash-es'
import COMMON from '@/constants/commonConstatns.js'
import RegistToast from '@/components/dialog/RegistToast.vue'

const showToast = ref(false)

const router = useRouter()
const emitter = inject('emitter')
const emit = defineEmits(['hide', 'update:show'])

const tabRef = ref(null)

const props = defineProps({
  title: {
    type: String,
    default: () => ''
  },
  type: {
    type: String,
    required: true,
    default: null
  },
  tab: {
    type: Array,
    required: false,
    default: null
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

const originDataModel = ref([])

const dataModel = ref([])

const pagination = ref({
  rowsNumber: 0
})

const closeLabel = ref('닫기')
const resetLabel = ref('초기화')
const reserveLabel = ref('확인')

const filterData = computed(() => {
  if (props.type === 'BANNER') {
    return dataModel.value.filter((item) => item.locationType === tabRef.value)
  } else {
    return dataModel.value
  }
})

watch(
  () => props.tab,
  async (newTab) => {
    if (newTab && newTab.length > 0) {
      tabRef.value = newTab[0].value
      orderSetting()
    }
  },
  { immediate: true } // 초기 실행 보장
)

onMounted(async () => {
  await nextTick(async () => {
    await onRequest()
  })
})

const orderSetting = () => {
  if (props.type !== 'BANNER') {
    // 광고배너가 아닌 경우
    dataModel.value.forEach((item, index) => {
      item.order = item.order ?? index + 1
    })
  } else {
    // 광고배너의 경우
    props.tab.forEach((tab) => {
      const filteredRows = dataModel.value.filter((item) => item.locationType === tab.value)
      filteredRows.forEach((item, index) => {
        item.order = item.order ?? index + 1
      })
    })
  }
}

const onReset = async () => {
  dataModel.value = await cloneDeep(originDataModel.value)
}

const onRequest = async () => {
  originDataModel.value = await sitemanagementApi
    .orderInfoGet({ type: props.type })
    .then((res) => res.data)

  dataModel.value = await cloneDeep(originDataModel.value)
}
const onEdit = async () => {
  emitter.emit(COMMON.LOADING.SHOW)

  showToast.value = true
  await sitemanagementApi.updateOrderInfo({ type: props.type }, dataModel.value)
  await onRequest()
  emit('update:show')
  hide()

  emitter.emit(COMMON.LOADING.HIDE)
}

const hide = () => {
  showModal.value = false
}

const hideModal = () => {
  emit('hide')
}

const goDetail = (event, target) => {
  if (props.type === 'MAIN_VISUAL') {
    router.push(`./main-visuals/detail?bannerSeq=${target.seq}`)
  } else if (props.type === 'BANNER') {
    router.push(`./banners/detail?bannerSeq=${target.seq}`)
  } else {
    router.push(`./popups/detail?popupSeq=${target.seq}`)
  }
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

const onNormalDrop = (event, rowIndex) => {
  // case : 광고배너가 아닌 경우
  event.preventDefault()
  const dragEndIndex = rowIndex
  if (dragStartIndex !== null && dragStartIndex !== dragEndIndex) {
    const movedRow = dataModel.value.splice(dragStartIndex, 1)[0]
    dataModel.value.splice(dragEndIndex, 0, movedRow)

    dataModel.value.forEach((item, index) => {
      dataModel.value[index].order = index + 1
    })
  }
  dragStartIndex = null
}

const onBannerDrop = (event, slotProps) => {
  // case: 광고배너인 경우
  event.preventDefault()
  const dragEndIndex = slotProps.rowIndex

  if (dragStartIndex !== null && dragStartIndex !== dragEndIndex) {
    // 현재 탭(locationType)과 일치하는 데이터만 필터링
    const filteredRows = dataModel.value.filter((item) => item.locationType === tabRef.value)

    const movedRow = filteredRows.splice(dragStartIndex, 1)[0]
    filteredRows.splice(dragEndIndex, 0, movedRow)

    filteredRows.forEach((item, index) => {
      item.order = index + 1
    })

    dataModel.value.sort((a, b) => a.order - b.order)
  }

  dragStartIndex = null
}

const onDragEnd = (slotProps) => {
  // 드래그 종료 후 이벤트 처리
  dragStartIndex = null
}
</script>
