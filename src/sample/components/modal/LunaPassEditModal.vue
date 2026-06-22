<template>
  <BasicConfirm
    v-model:show="showModal"
    :close-label="closeLabel"
    :style="style"
    :title="title"
    style="min-width: 80vw; max-width: 80vw"
    @hide="hideModal"
  >
    <template #content>
      <div class="form">
        <div class="row">
          <div class="col-1 form-th required">
            회차별정원<br />{{ modalType === 'attraction' ? `(팀/30')` : `(명/30')` }}
          </div>
          <div class="col-5 form-td">
            <q-input
              v-if="modalType === 'attraction'"
              v-model.trim="dataModel.maxTeam"
              dense
              outlined
              maxlength="3"
            />
            <q-input v-else v-model.trim="dataModel.maxPeople" dense outlined maxlength="3" />
          </div>
          <div class="col-1 form-th required">최대예약인원<br />(1인당)</div>
          <div class="col-5 form-td">
            <q-input
              v-model.trim="dataModel.maxBookingPeoplePerPerson"
              dense
              outlined
              maxlength="2"
            />
          </div>
        </div>
        <div class="row" v-if="modalType === 'attraction'">
          <div class="col-1 form-th required">예약타임 노출</div>
          <div class="col-11 form-td space-between">
            <div class="col">
              <q-radio v-model="dataModel.bookingTargetTimeOpenYn" val="N" label="전체 타임 노출" />
              <q-radio
                v-model="dataModel.bookingTargetTimeOpenYn"
                val="Y"
                label="대상 타임만 노출"
              />
            </div>
            <div class="col-4" v-if="dataModel.bookingTargetTimeOpenYn === 'Y'">
              <div class="row">
                <div class="col-3">
                  <!-- <span>1타임</span> -->
                  <q-input
                    v-model.trim="dataModel.bookingRoundOneOpenTime"
                    label="1타임"
                    dense
                    outlined
                    maxlength="3"
                  />
                </div>
                <span style="margin: 0 0.3rem; align-self: center">&#47;</span>
                <div class="col-3">
                  <!-- <span>2타임</span> -->
                  <q-input
                    v-model.trim="dataModel.bookingRoundTwoOpenTime"
                    label="2타임"
                    dense
                    outlined
                    maxlength="3"
                  />
                </div>
                <span style="margin: 0 0.3rem; align-self: center">&#47;</span>
                <div class="col-3">
                  <!-- <span>3타임</span> -->
                  <q-input
                    v-model.trim="dataModel.bookingRoundThreeOpenTime"
                    label="3타임"
                    dense
                    outlined
                    maxlength="3"
                  />
                </div>
                <span style="width: 5rem; text-align: end; align-self: center">분전 예약오픈</span>
              </div>
            </div>
            <div class="col-4" v-else>
              <div class="row">
                <q-input v-model.trim="dataModel.bookingEntireOpenTime" dense outlined />
                <span style="width: 5rem; text-align: end; align-self: center">분전 예약오픈</span>
              </div>
            </div>
          </div>
        </div>
        <div class="row">
          <div class="col-1 form-th required">직원확인 방법</div>
          <div class="col-11 form-td">
            <div style="display: flex; gap: 1rem; margin-right: 0.5rem">
              <q-radio
                v-model="dataModel.adminCheckWay"
                val="NONE"
                label="없음"
                @focus="dataModel.adminCheckPassword = null"
              />
              <q-radio
                v-model="dataModel.adminCheckWay"
                val="QR_CHECK"
                label="QR체크"
                @focus="dataModel.adminCheckPassword = null"
              />
              <q-radio v-model="dataModel.adminCheckWay" val="PASSWORD" label="비밀번호" />
            </div>
            <q-input
              v-if="dataModel.adminCheckWay === 'PASSWORD'"
              v-model.trim="dataModel.adminCheckPassword"
              placeholder="비밀번호"
              dense
              outlined
              maxlength="4"
            />
          </div>
        </div>
        <div class="row justify-end">
          <p style="color: gray">* 숫자만 입력해주세요</p>
        </div>
      </div>
      <q-table
        ref="tableRef"
        v-model:pagination="pagination"
        :columns="tableHeaders"
        :rows="
          props.type === 'showEvent'
            ? dataModel.reservationTimeList
            : dataModel.reservationTimeByRoundList
        "
        :table-style="{
          height: '50vh'
        }"
        flat
        hide-no-data
        hide-pagination
        separator="cell"
      >
        <template v-slot:header="props">
          <q-tr>
            <q-th v-for="header in props.cols" :key="header.value" align="center">
              <div style="display: flex; flex-direction: column">
                <div>{{ header.label }}</div>
                <div
                  v-if="header.value === 'bookingRound'"
                  class="full-width"
                  style="display: flex; justify-content: space-evenly"
                >
                  <q-radio
                    v-model="selectedRoundHeader"
                    :val="0"
                    label="미운영"
                    @update:model-value="onRoundHeaderClick"
                  />
                  <q-radio
                    v-model="selectedRoundHeader"
                    :val="1"
                    label="1타임"
                    @update:model-value="onRoundHeaderClick"
                  />
                  <q-radio
                    v-model="selectedRoundHeader"
                    :val="2"
                    label="2타임"
                    @update:model-value="onRoundHeaderClick"
                  />
                  <q-radio
                    v-model="selectedRoundHeader"
                    :val="3"
                    label="3타임"
                    @update:model-value="onRoundHeaderClick"
                  />
                  <q-radio
                    v-model="selectedRoundHeader"
                    :val="9"
                    label="마감"
                    @update:model-value="onRoundHeaderClick"
                  />
                </div>
              </div>
            </q-th>
          </q-tr>
        </template>
        <template v-slot:body="props">
          <q-tr align="center">
            <q-td style="width: 3rem">
              {{ props.row['round'] }}
            </q-td>
            <q-td style="min-width: 8rem">
              {{ props.row['bookingStartTimeNm'] }}
            </q-td>
            <q-td class="full-width" v-if="modalType === 'attraction'">
              <div class="full-width" style="display: flex; justify-content: space-evenly">
                <q-radio
                  v-model="props.row['bookingRound']"
                  :val="0"
                  label="미운영"
                  @update:model-value="onRoundRowClick"
                />
                <q-radio
                  v-model="props.row['bookingRound']"
                  :val="1"
                  label="1타임"
                  @update:model-value="onRoundRowClick"
                />
                <q-radio
                  v-model="props.row['bookingRound']"
                  :val="2"
                  label="2타임"
                  @update:model-value="onRoundRowClick"
                />
                <q-radio
                  v-model="props.row['bookingRound']"
                  :val="3"
                  label="3타임"
                  @update:model-value="onRoundRowClick"
                />
                <q-radio
                  v-model="props.row['bookingRound']"
                  :val="9"
                  label="마감"
                  @update:model-value="onRoundRowClick"
                />
              </div>
            </q-td>
            <q-td class="full-width" v-else-if="modalType === 'showEvent'">
              <div class="full-width" style="display: flex; justify-content: center">
                <q-option-group
                  v-model="props.row.selectedStatus"
                  :options="[
    { label: '미운영', value: '미운영' },
    { label: '운영', value: '운영' },
    { label: '마감', value: '마감' }
  ]"
                  type="radio"
                  inline
                  @update:model-value="val => onSelect(val, props.row)"
                />
              </div>
            </q-td>
            <q-td class="full-width" v-else>
              <div class="full-width" style="display: flex; justify-content: space-evenly"></div>
            </q-td>
          </q-tr>
        </template>
      </q-table>
    </template>
    <template #button>
      <q-btn :label="resetLabel" class="modal-btn-md" color="black" outline @click="onReset" />
      <q-btn :label="checkLabel" class="modal-btn-md" color="black" outline @click="onEdit" />
    </template>
  </BasicConfirm>
</template>

<script setup>
import {inject, onBeforeMount, ref, computed, watch} from 'vue'
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
    default: () => {}
  },
  type: {
    type: String,
    required: true,
    default: () => ''
  },
  data: {
    type: Object,
    required: true,
    default: () => {}
  },
  headers: {
    type: Object,
    required: true,
    default: () => {}
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
const resetLabel = ref('초기화')
const checkLabel = ref('확인')

const tableRef = ref(null)
const tableHeaders = ref([])

const modalType = ref('')

const pagination = ref({
  rowsNumber: 0
})

const selectedRoundHeader = ref(null)

onBeforeMount(async () => {
  emitter.emit(COMMON.LOADING.SHOW)

  originDataModel.value = props.data
  tableHeaders.value = props.headers
  modalType.value = props.type

  dataModel.value = cloneDeep(originDataModel.value)

  if (modalType.value === 'showEvent') {
    dataModel.value.reservationTimeList.forEach(row => {
      row.selectedStatus = getSelected(row)

      watch(
        () => row.selectedStatus,
        (val) => {
          if (val === '미운영') {
            row.bookingYn = 'N'
            row.closedYn = 'N'
          } else if (val === '운영') {
            row.bookingYn = 'Y'
            row.closedYn = 'N'
          } else if (val === '마감') {
            row.bookingYn = 'N'
            row.closedYn = 'Y'
          }
        },
        { immediate: true } // 처음에도 적용
      )
    })
  }
  emitter.emit(COMMON.LOADING.HIDE)
})

const onReset = async () => {
  originDataModel.value = props.data
  dataModel.value = cloneDeep(originDataModel.value)
  selectedRoundHeader.value = null
}

const onEdit = async () => {
  if (
    dataModel.value.adminCheckWay === 'PASSWORD' &&
    (!dataModel.value.adminCheckPassword ||
      dataModel.value.adminCheckPassword.length < 2 ||
      dataModel.value.adminCheckPassword.length > 4)
  ) {
    alert('비밀번호는 2~4자리를 입력해주세요.')
    return
  }

  emitter.emit(COMMON.LOADING.SHOW)

  emit('update:model-value', dataModel.value)

  originDataModel.value = cloneDeep(dataModel.value)

  emitter.emit(COMMON.LOADING.HIDE)
  hide()
}

const hide = () => {
  showModal.value = false
}

const hideModal = () => {
  dataModel.value = cloneDeep(originDataModel.value)
  emit('hide')
}

const onRoundHeaderClick = (val) => {
  tableRef.value.rows.forEach((item) => {
    item.bookingRound = val
  })
}

const onRoundRowClick = () => {
  selectedRoundHeader.value = -1
}

function getSelected(row) {
  console.log(dataModel.value)
  const closedYn = String(row.closedYn || '').trim().toUpperCase()
  const bookingYn = String(row.bookingYn || '').trim().toUpperCase()

  if (closedYn === 'Y') return '마감'
  if (bookingYn === 'Y') return '운영'
  return '미운영'
}


function onSelect(label, row) {
  if (!row) return

  row.selectedStatus = label
  if (label === '미운영') {
    row.bookingYn = 'N'
    row.closedYn = 'N'
  } else if (label === '운영') {
    row.bookingYn = 'Y'
    row.closedYn = 'N'
  } else if (label === '마감') {
    row.bookingYn = 'N'
    row.closedYn = 'Y'
  }
}


defineExpose({
  onReset
})
</script>
