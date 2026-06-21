<template>
  <div class="q-pa-sm" style="background-color: #ffffff">
    <div class="row">
      <q-tabs
        v-model="tabRef"
        dense
        class="text-grey"
        active-color="black"
        indicator-color="black"
        narrow-indicator
      >
        <q-tab
          v-for="groupCode in groupCodeList"
          :name="groupCode.grpCd"
          :label="groupCode.grpCdNm"
        />
      </q-tabs>
    </div>
    <div class="form q-pb-sm">
      <q-tab-panels v-model="tabRef" animated>
        <q-tab-panel
          v-for="(data, index) in dataModel"
          :key="index"
          :name="groupCodeList[index].grpCd"
        >
          <div
            class="q-pa-md justify-between"
            style="display: flex; flex-direction: row; align-items: center"
          >
            <span class="text-h5 text-bold">{{ groupCodeList[index].grpCdNm }}</span>
            <q-btn label="+ 추가" unelevated outline @click="addRow(groupCodeList[index], index)" />
          </div>
          <q-table
            :columns="tableHeaders"
            :rows="data"
            :table-style="{
              maxHeight: '55vh'
            }"
            flat
            hide-no-data
            hide-pagination
            :rows-per-page-options="[0]"
            separator="cell"
          >
            <template v-slot:header="props">
              <q-tr>
                <q-th style="width: 4rem"> 번호 </q-th>
                <q-th>
                  {{ props.cols[0].label }}
                </q-th>
                <q-th style="width: 6rem"> {{ props.cols[1].label }} </q-th>
                <q-th style="width: 15rem" v-if="tabRef === 'operating_status'">
                  {{ props.cols[2].label }}
                </q-th>
                <q-th>
                  {{ props.cols[3].label }}
                </q-th>
              </q-tr>
            </template>
            <template v-slot:body="props">
              <q-tr>
                <q-td align="center">
                  {{ props.rowIndex + 1 }}
                </q-td>
                <!-- 첫 번째 컬럼 -->
                <q-td>
                  <div class="row justify-between">
                    <q-input
                      label="코드명"
                      v-model.trim="props.row['dtlCdNm']"
                      class="col-5"
                      dense
                      outlined
                      @update:model-value="onColumnChange(props.row, 'dtlCdNm', $event)"
                    />
                    <q-input
                      label="코드"
                      v-model.trim="props.row['dtlCd']"
                      class="col-5"
                      dense
                      outlined
                      @update:model-value="onColumnChange(props.row, 'dtlCd', $event)"
                      :disable="props.row.updateCode !== 'C'"
                    />
                  </div>
                </q-td>

                <!-- 두 번째 컬럼 -->
                <q-td>
                  <q-input
                    label="순서"
                    v-model.number="props.row['sn']"
                    type="number"
                    dense
                    outlined
                    @update:model-value="
                      () => {
                        if (props.row.sn < 1) props.row.sn = 1
                        onColumnChange(props.row, 'sn', $event)
                      }
                    "
                  />
                </q-td>
                <!-- 세 번째 컬럼 -->
                <q-td v-if="tabRef === 'operating_status'">
                  <q-radio
                    v-model="props.row.operateYn"
                    val="Y"
                    label="운영"
                    @update:model-value="onColumnChange(props.row, 'operateYn', $event)"
                  />
                  <q-radio
                    v-model="props.row.operateYn"
                    val="N"
                    label="미운영"
                    @update:model-value="onColumnChange(props.row, 'operateYn', $event)"
                  />
                </q-td>
                <!-- 네 번째 컬럼 -->
                <q-td>
                  <div class="row justify-between">
                    <div>
                      <q-radio
                        v-model="props.row.useYn"
                        val="Y"
                        label="사용"
                        @update:model-value="onColumnChange(props.row, 'useYn', $event)"
                      ></q-radio>
                      <q-radio
                        v-model="props.row.useYn"
                        val="N"
                        label="미사용"
                        @update:model-value="onColumnChange(props.row, 'useYn', $event)"
                      ></q-radio>
                      <q-radio
                        v-if="props.row.useYn === 'N'"
                        v-model="props.row.delYn"
                        val="Y"
                        label="삭제"
                        @update:model-value="onColumnChange(props.row, 'delYn', $event)"
                      ></q-radio>
                    </div>
                    <q-btn
                      v-if="props.row.updateCode === 'C'"
                      unelevated
                      style="padding: 10px"
                      @click="onCancelAdd(props.row, index)"
                      ><q-icon name="o_cancel"
                    /></q-btn>
                  </div>
                </q-td>
              </q-tr>
            </template>
          </q-table>
        </q-tab-panel>
      </q-tab-panels>
    </div>
    <div class="row justify-between q-pt-lg">
      <div>
        <span>※ 수정/추가 후 등록 버튼을 클릭하여야 정상 저장됩니다.</span>
      </div>
      <div>
        <q-btn label="등록" @click="onRegist" />
      </div>
    </div>
  </div>
  <RegistToast
    v-if="showToast"
    :message="'등록/수정이 완료되었습니다!'"
    :duration="3000"
    @hidden="
      () => {
        showToast = false
      }
    "
  />
</template>
<script setup>
import { ref, nextTick, onBeforeMount, onMounted, computed, inject } from 'vue'
import COMMON from '@/constants/commonConstatns.js'
import RegistToast from '@/components/dialog/RegistToast.vue'
import { cloneDeep } from 'lodash-es'

const tabRef = ref(null)
const tableRef = ref(null)
const emitter = inject('emitter')
const showToast = ref(false)

const dataModel = ref([])
const originDataModel = ref([])
const groupCodeList = ref([])

const tableHeaders = ref([
  {
    name: 'dtlCdNm',
    label: '구분값',
    field: 'dtlCdNm',
    align: 'center'
  },
  {
    name: 'sn',
    label: '순서',
    field: 'sn',
    align: 'center',
    style: 'width: 6rem'
  },
  {
    name: 'operateYn',
    label: '운영여부',
    field: 'operateYn',
    align: 'center'
  },
  {
    name: 'useYn',
    label: '사용여부',
    field: 'useYn',
    align: 'center'
  }
])

const modifiedRows = ref([])

onMounted(async () => {
  emitter.emit(COMMON.LOADING.SHOW)

  await groupSetting()
  await nextTick(async () => {
    await onRequest()
  })

  emitter.emit(COMMON.LOADING.HIDE)
})

const groupSetting = async () => {
  const groupResponse = await sitemanagementApi.getCodeMngListByCodeGrp().then((res) => res.data)
  groupCodeList.value = groupResponse

  tabRef.value = groupCodeList.value[0].grpCd
}

const onReset = async () => {
  modifiedRows.value = []
  dataModel.value = await cloneDeep(originDataModel.value)
}

const onRequest = async () => {
  emitter.emit(COMMON.LOADING.SHOW)
  originDataModel.value = []

  for (let i = 0; i < groupCodeList.value.length; i++) {
    const item = groupCodeList.value[i]
    originDataModel.value.push(
      await sitemanagementApi.getCodeMngList({ grpCd: item.grpCd }).then((res) => res.data)
    )
  }

  await onReset()

  emitter.emit(COMMON.LOADING.HIDE)
}

const addRow = (groupCode, index) => {
  const rowTemplate = {
    grpCd: groupCode.grpCd,
    dtlCd: null,
    dtlCdNm: null,
    sn: dataModel.value[index].length + 1,
    useYn: 'Y',
    operateYn: 'Y',
    delYn: 'N',
    updateCode: 'C',
    createdAt: new Date(),
    updateAt: null
  }
  dataModel.value[index].push(rowTemplate)
}

const onChangeUseYn = (row) => {
  row.useYn === 'Y' ? onChangeUseY(row) : onChangeUseN(row)
}

const onChangeUseY = (row) => {
  row.delYn = 'N'
  row.updateCode = 'U'
}

const onChangeUseN = (row) => {
  alert('선택한 구분값으로 등록된 데이터가 있는 경우,\n 미사용으로 변경되지 않을 수 있습니다.')
}

const onChangeDelYn = (row) => {
  row.updateCode = 'D'
  alert('해당 데이터는 삭제 후 복구가 불가능합니다.')
}

const onColumnChange = (row, field, newValue) => {
  row.createdAt = new Date(row.createdAt)
  row.updateCode = row.updateCode ?? 'U'

  if (field === 'useYn') onChangeUseYn(row)
  if (field === 'delYn' && newValue === 'Y') onChangeDelYn(row)

  if (!modifiedRows.value.includes(row)) {
    modifiedRows.value.push(row)
  }
}

const onRegist = async () => {
  let isOk = true
  if (modifiedRows.value.some((item) => item.updateCode === 'D'))
    isOk = confirm('선택한 항목을 삭제하시겠습니까? 삭제후 복구가 불가합니다.')

  sortModifiedData()

  if (isOk)
    await sitemanagementApi.updateCodeMng({ codeDtlList: modifiedRows.value }).catch((err) => {
      alert('순서 또는 코드를 다시 한 번 확인해주세요.')
      isOk = false
    })

  if (isOk) {
    showToast.value = true
    await onRequest()
  }
}

const sortModifiedData = () => {
  // Delete 로직부터 수행
  modifiedRows.value.sort((a, b) => {
    if (a.updateCode === 'D' && b.updateCode !== 'D') return -1 // a는 앞쪽으로
    if (a.updateCode !== 'D' && b.updateCode === 'D') return 1 // b는 앞쪽으로
    return 0
  })
}

const onCancelAdd = (row, index) => {
  dataModel.value[index] = dataModel.value[index].filter((item) => item !== row)
}
</script>
