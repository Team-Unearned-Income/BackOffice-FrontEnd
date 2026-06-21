<template>
  <BasicConfirm
    v-model:show="showModal"
    :close-label="closeLabel"
    :title="title"
    style="min-width: 80vw"
    @hide="hideModal"
  >
    <template #content>
      <div class="row">
        <div class="col-10 form-td"></div>
        <div class="col-2 form-td justify-end">
          <q-btn label="추가" @click="addRow" />
        </div>
      </div>
      <br />
      <q-table
        ref="tableRef"
        :columns="tableModel.header"
        :rows="tableModel.rows"
        :table-style="{
          maxHeight: '45vh'
        }"
        flat
        hide-no-data
        hide-pagination
        virtual-scroll
        separator="cell"
        :pagination="tableModel.pagination"
      >
        <template v-slot:body="props">
          <q-tr>
            <q-td>
              <q-input
                v-model.trim="props.row['reviewType']"
                style="display: flex; justify-content: center; align-items: center"
                dense
                outlined
                :disable="!props.row['isNew']"
              >
                <template #append>
                  <q-icon
                    v-if="props.row['isNew']"
                    name="o_cancel"
                    style="cursor: pointer"
                    @click="onCancelAdd(props.row)"
                  />
                </template>
              </q-input>
            </q-td>
            <q-td>
              <q-input v-model.trim="props.row['reviewTypeNm']" dense outlined />
            </q-td>
            <q-td>
              <q-select
                v-model="props.row['imoticonTypeNm']"
                :options="tableModel.filterOptions"
                option-label="label"
                option-value="value"
                emit-value
                map-options
                dense
                outlined
                @update:model-value="(selectValue) => selectImoticonType(props.row, selectValue)"
              />
            </q-td>
            <q-td>
              <q-input v-model.trim="props.row['count']" dense outlined disable />
            </q-td>
            <q-td>
              <q-radio v-model="props.row['useYn']" val="Y" label="사용" />
              <q-radio v-model="props.row['useYn']" val="N" label="미사용" />
              <!-- <q-radio
                v-if="props.row['useYn'] === 'N'"
                v-model="props.row.delYn"
                val="Y"
                label="삭제"
              /> -->
            </q-td>
          </q-tr>
        </template>
      </q-table>
    </template>
    <template #button>
      <q-btn :label="resetLabel" class="modal-btn-md" color="black" outline @click="onReset" />
      <q-btn :label="reserveLabel" class="modal-btn-md" color="black" outline @click="onEdit" />
    </template>
  </BasicConfirm>
</template>

<script setup>
import { inject, onBeforeMount, ref, nextTick } from 'vue'
import BasicConfirm from './BasicConfirm.vue'
import COMMON from '@/constants/commonConstatns.js'
import { cloneDeep } from 'lodash-es'

const emitter = inject('emitter')
const emit = defineEmits(['hide', 'modal-data-model', 'update:model-value'])
const props = defineProps({
  title: {
    type: String,
    default: () => ''
  }
})

const showModal = defineModel('show', {
  type: Boolean,
  default: () => false,
  required: true
})

const originDataModel = defineModel('data-model', {
  type: Object,
  default: () => null,
  required: true
})

const closeLabel = ref('취소')
const resetLabel = ref('초기화')
const reserveLabel = ref('확인')

const tableRef = ref(null)
const tableModel = ref({
  header: [
    {
      name: 'reviewType',
      label: '후기 코드',
      field: 'reviewType',
      align: 'center',
      headerStyle: 'max-width: 3rem'
    },
    {
      name: 'reviewTypeNm',
      label: '후기 이름',
      field: 'reviewTypeNm',
      align: 'center',
      headerStyle: 'max-width: 3rem'
    },
    {
      name: 'imoticonTypeNm',
      label: '이모티콘 코드',
      field: 'imoticonTypeNm',
      align: 'center',
      headerStyle: 'max-width: 4rem'
    },
    {
      name: 'count',
      label: '후기 수',
      field: 'count',
      align: 'center',
      headerStyle: 'max-width: 2rem'
    },
    {
      name: 'useYn',
      label: '사용 여부',
      field: 'useYn',
      align: 'center'
    }
  ],
  rows: [],
  filterOptions: [
    {
      imoticonType: null,
      imoticonTypeNm: null
    }
  ],
  pagination: {
    rowsNumber: 0
  }
})

onBeforeMount(async () => {
  emitter.emit(COMMON.LOADING.SHOW)
  await onReset()

  emitter.emit(COMMON.LOADING.HIDE)
})

const onReset = async () => {
  tableModel.value.rows = cloneDeep(originDataModel.value)
  await nextTick()
  tableModel.value.filterOptions = cloneDeep(originDataModel.value['filterOptions'])
}

const onEdit = async () => {
  emitter.emit(COMMON.LOADING.SHOW)

  // 잘못된 항목 있나 검증
  for (let i = 0; i < tableModel.value.rows.length; i++) {
    if (
      !tableModel.value.rows[i].reviewType ||
      !tableModel.value.rows[i].reviewTypeNm ||
      !tableModel.value.rows[i].imoticonType ||
      !tableModel.value.rows[i].imoticonTypeNm
    ) {
      alert('올바르지 않은 항목이 있습니다. 다시 확인해주세요.')
      emitter.emit(COMMON.LOADING.HIDE)
      return
    }
  }

  tableModel.value.rows.forEach((row) => {
    delete row.isNew
  })

  emit('update:model-value', tableModel.value.rows)

  originDataModel.value = cloneDeep(tableModel.value.rows)
  await nextTick()
  originDataModel.value['filterOptions'] = cloneDeep(tableModel.value.filterOptions)

  emitter.emit(COMMON.LOADING.HIDE)
  hide()
}

const hide = () => {
  showModal.value = false
}

const hideModal = () => {
  tableModel.value.rows = cloneDeep(originDataModel.value)
  tableModel.value.filterOptions = cloneDeep(originDataModel.value['filterOptions'])
  emit('hide')
}

const addRow = () => {
  const newData = {
    reviewType: null,
    reviewTypeNm: null,
    imoticonType: null,
    imoticonTypeNm: null,
    count: 0,
    useYn: 'Y',
    isNew: true
  }

  tableModel.value.rows.push(newData)
}

const onCancelAdd = (row) => {
  tableModel.value.rows = tableModel.value.rows.filter((item) => item !== row)
}

const selectImoticonType = (row, selectedValue) => {
  const selectedOption = tableModel.value.filterOptions.find(
    (option) => option.value === selectedValue
  )
  if (selectedOption) {
    row.imoticonType = selectedOption.value
    row.imoticonTypeNm = selectedOption.label
  }
}
</script>
