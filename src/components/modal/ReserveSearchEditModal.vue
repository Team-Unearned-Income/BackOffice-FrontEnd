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
      <div class="form">
        <div class="row">
          <div class="col-2 form-th">예약여부</div>
          <div class="col-10 form-td">
            <q-select
              v-model="dataModel.reservationYn"
              :options="filterOptionsModel.reservationTypeList"
              class="full-width"
              dense
              hide-bottom-space
              outlined
            />
          </div>
        </div>
        <div class="row">
          <div class="col-2 form-th">
            {{ props.type === 'attraction' ? '탑승여부' : '관람여부' }}
          </div>
          <div class="col-10 form-td">
            <q-select
              v-if="props.type === 'attraction'"
              v-model="dataModel.boardingYn"
              :options="filterOptionsModel.boardingTypeList"
              class="full-width"
              dense
              hide-bottom-space
              outlined
            />
            <q-select
              v-else
              v-model="dataModel.viewingYn"
              :options="filterOptionsModel.viewingTypeList"
              class="full-width"
              dense
              hide-bottom-space
              outlined
            />
          </div>
        </div>
        <div class="row">
          <div class="col-2 form-th">예약시간대</div>
          <div class="col-10 form-td">
            <q-select
              v-model="dataModel.reservationTimeRange"
              :options="filterOptionsModel.reservationTimeRangeList"
              class="full-width"
              dense
              hide-bottom-space
              outlined
            />
          </div>
        </div>
        <div class="row">
          <div class="col-2 form-th">예약일</div>
          <div class="col-10 form-td">
            <q-option-group
              v-model="reserveDate"
              :options="reserveDateOptions"
              color="primary"
              class="row"
              size="sm"
              @update:model-value="selectedReserveDt"
            />
          </div>
        </div>
        <div class="row">
          <div class="col-2 form-th">검색어</div>
          <div class="col-10 form-td">
            <q-select
              v-model="dataModel.searchCondition"
              :options="filterOptionsModel.searchKeywordList"
              class="full-width"
              dense
              hide-bottom-space
              outlined
            />
          </div>
        </div>
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
import { computed, inject, onBeforeUpdate, ref } from 'vue'
import BasicConfirm from './BasicConfirm.vue'
import { useLayoutStore } from '@/stores/layout.js'
import { cloneDeep } from 'lodash-es'
import COMMON from '@/constants/commonConstatns.js'
import RegistToast from '@/components/dialog/RegistToast.vue'

const showToast = ref(false)

const emitter = inject('emitter')
const emit = defineEmits(['hide', 'selected', 'refresh-data', 'update:model-value'])
const layoutStore = useLayoutStore()
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
    default: () => {}
  },
  reserveDayCode: {
    type: String,
    required: false,
    default: () => 'unSet'
  },
  type: {
    type: String,
    required: true,
    default: null
  }
})

const showModal = defineModel('show', {
  type: Boolean,
  default: () => false,
  required: true
})

const originDataModel = defineModel('dataModel', {
  type: Object,
  default: () => {},
  required: true
})

const optionsModel = defineModel('optionsModel', {
  type: Object,
  default: () => {},
  required: true
})

const reserveDate = defineModel('reserveDayCode', {
  type: String,
  default: () => 'unSet',
  required: false
})

const filterOptionsModel = computed(() => ({
  reservationTypeList: optionsModel.value?.reservationTypeList,
  boardingTypeList: optionsModel.value?.boardingTypeList,
  viewingTypeList: optionsModel.value?.viewingTypeList,
  reservationTimeRangeList: optionsModel.value?.reservationTimeRangeList,
  searchKeywordList: optionsModel.value?.searchKeywordList
}))

const dataModel = ref({})
// const reserveDate = ref('unSet')
const reserveDateOptions = ref([
  { label: '미설정', value: 'unSet' },
  { label: '당일~당일(1일)', value: 'today' },
  { label: '7일전~당일', value: 'week' },
  { label: '당월1일~당일', value: 'month' }
])

const closeLabel = ref('닫기')
const resetLabel = ref('초기화')
const reserveLabel = ref('설정')

onBeforeUpdate(async () => {
  dataModel.value = await cloneDeep(originDataModel.value)
})

const selectedReserveDt = (dateType) => {
  dataModel.value = { ...dataModel.value, reserveDt: { type: dateType } }
}

const onReset = async () => {
  dataModel.value = cloneDeep(originDataModel.value)
  reserveDate.value = props.reserveDayCode
}

const onEdit = async () => {
  emitter.emit(COMMON.LOADING.SHOW)

  dataModel.value.reserveDt.type = reserveDate.value

  await commonApi
    .regAdminSearchCondition({
      adminMenuSeq: layoutStore.selectedMenu.adminMenuSeq,
      searchCondition: JSON.stringify(dataModel.value)
    })
    .then(() => hide())
    .catch((err) => {
      console.log(err)
    })
  showToast.value = true
  emit('refresh-data')
  emitter.emit(COMMON.LOADING.HIDE)
}

const hide = () => {
  showModal.value = false
}

const hideModal = () => {
  emit('hide')
}
</script>
