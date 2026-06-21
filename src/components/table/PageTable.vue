f
<template>
  <div :class="`${col} bg-white`">
    <div class="filter-container">
      <slot name="filter-section"></slot>
    </div>
    <div :class="`${contentAreaClass}`">
      <q-table
        ref="tableRef"
        v-model:pagination="model.pagination"
        v-model:selected="model.selected"
        :columns="model.header"
        :filter="model.filterAndSearchData"
        :row-key="rowKey"
        :rows="model.rows"
        :selection="selectionProp"
        :table-style="tableStyleProp"
        :loading="loadingProp"
        :virtual-scroll="virtualScrollProp"
        :table-colspan="virtualIdx ? model.header.length + 1 : model.header.length"
        flat
        hide-no-data
        hide-pagination
        hide-selected-banner
        separator="cell"
        title="total"
        @request="onRequest"
      >
        <template #header="slotProps">
          <!-- 커스텀 header 영역 -->
          <template v-if="!isEmpty(customHeader)">
            <q-tr v-for="(tableRow, idx) in customHeaderProp" :key="idx + '-tr'" :props="slotProps">
              <!-- single or multiple인 인 경우 th 생성 -->
              <q-th
                v-if="idx === 0 && selectionProp !== 'none' && showSelection"
                :rowspan="2"
                auto-width
              >
                <template v-if="selectionProp !== 'single'">
                  <q-checkbox v-model.trim="checkSelection" :disable="!model.rows" />
                </template>
                <template v-else>
                  <!-- single 인 경우 check box공백 체우기 위함-->
                  <div style="width: 25px">선택</div>
                </template>
              </q-th>
              <q-th
                v-for="tableHeader in tableRow"
                :key="!!tableHeader.name ? tableHeader.name : undefined"
                :props="!!tableHeader.name ? slotProps : undefined"
                :rowspan="tableHeader.rowspan ? tableHeader.rowspan : 1"
                :colspan="tableHeader.colspan ? tableHeader.colspan : 1"
                :style="{ borderRight: '1px' }"
              >
                <!--                <HtmlConvert :html='tableHeader.label' />-->
              </q-th>
            </q-tr>
          </template>
          <!-- 일반 header 영역 -->
          <template v-else>
            <q-tr :props="slotProps">
              <q-th v-if="selectionProp !== 'none' && showSelection" auto-width>
                <span v-if="type === 'topFix'">상단고정</span>
                <q-checkbox
                  v-else-if="selectionProp !== 'single'"
                  v-model.trim="checkSelection"
                  :disable="!model.rows"
                />
                <span v-else auto-width>선택</span>
              </q-th>
              <q-th v-if="virtualIdx" style="min-width: 5rem">번호</q-th>
              <q-th v-for="cl in slotProps.cols" :key="cl.name" :props="slotProps">
                {{ cl.label }}
              </q-th>
            </q-tr>
          </template>
        </template>
        <template #body="slotProps">
          <q-tr>
            <q-td v-if="selectionProp !== 'none'" auto-width>
              <q-checkbox
                v-if="showSelection(slotProps.row)"
                v-model="slotProps.selected"
                class="justify-center"
                :disable="type === 'topFix' && !slotProps.row.type?.match(/promotion/i)"
              />
            </q-td>
            <q-td v-if="virtualIdx" class="text-center" auto-width>
              {{ props.type === 'scroll' ? slotProps.pageIndex + 1 : slotProps.rowIndex + 1 }}
            </q-td>
            <q-td
              v-for="(cl, iIdx) in slotProps.cols"
              :key="cl.name"
              :props="slotProps"
              :style="customTdStyle"
              :class="cl.swap ? 'cursor-pointer' : ''"
              :draggable="hasSwap(slotProps.cols)"
              @click="($event.stopPropagation(), onRowClick($event, slotProps.row, cl))"
              @dragstart="onDragStart($event, slotProps)"
              @dragend="onDragEnd($event, slotProps)"
              @dragover="onDragOver($event, cl.swap)"
              @drop="onDrop($event, slotProps.rowIndex)"
            >
              <!-- 커스텀 cell 영역 -->
              <v-runtime-template
                v-if="cl.format"
                :template="cl.format(slotProps.row[cl.name], slotProps.row, cl, iIdx)"
              />
              <!-- 일반 cell 영역 -->
              <div v-else>
                <!-- slot -->
                <template v-if="!isEmpty(cl.slot)">
                  <div @click="$event.stopPropagation()">
                    <slot :name="cl.slot" v-bind="{ slotProps, cl }" />
                  </div>
                </template>
                <!-- date -->
                <template v-else-if="['date', 'datetime'].includes(cl.type?.toLowerCase())">
                  <div class="ellipsis">
                    {{
                      convertDateFormat(
                        slotProps.row[cl.name],
                        cl.type?.toLowerCase(),
                        cl.dateFormat
                      )
                    }}
                  </div>
                </template>
                <!-- year -->
                <template v-else-if="cl.type === 'year'">
                  <div class="ellipsis">{{ slotProps.row[cl.name] }}년</div>
                </template>
                <template v-else-if="cl.swap">
                  <q-icon name="swap_vert" size="xs" />
                </template>
                <template v-else-if="cl.type === 'button' || cl.type === 'pushButton'">
                  <!-- TODO: 개선사항으로 sendStatus 스케줄링 추후 제거 필요-->
                  <div v-if="slotProps.row['showButton'] === true">
                    <q-btn
                      :label="cl.btnLabel"
                      style="max-width: 100%"
                      @click="
                        ($event.stopPropagation(), onRowBtnClick($event, slotProps.row, cl, iIdx))
                      "
                    />
                  </div>
                  <div v-else-if="cl.type !== 'pushButton'">
                    <q-btn
                      :label="cl.btnLabel"
                      style="max-width: 100%"
                      @click="
                        ($event.stopPropagation(), onRowBtnClick($event, slotProps.row, cl, iIdx))
                      "
                    />
                  </div>
                </template>
                <template v-else-if="cl.type === 'checkbox'">
                  <q-checkbox
                    class="justify-center"
                    :model-value="slotProps.row[cl.name] === 'Y'"
                    @update:model-value="
                      (val) => {
                        slotProps.row[cl.name] = val ? 'Y' : 'N'
                        emit('updateCheckbox', slotProps.row, cl.name)
                      }
                    "
                  />
                </template>
                <!-- default -->
                <template v-else>
                  <div class="ellipsis">
                    <template v-if="cl.parsing">
                      {{ concatValueParsing(slotProps.row[cl.name], cl.parsing) }}
                    </template>
                    <template v-else>
                      {{ slotProps.row[cl.name] }}
                    </template>
                  </div>
                </template>
              </div>
              <q-tooltip
                v-if="
                  !(cl.tooltip === false) &&
                  (cl.tooltipValue
                    ? tableFieldValid(slotProps.row[cl.tooltipValue])
                    : tableFieldValid(slotProps.row[cl.name]))
                "
                :class="`.my-parent-${iIdx}`"
                :offset="[-10, 0]"
                anchor="bottom middle"
                self="center middle"
              >
                <template v-if="cl.tooltipValue">
                  {{ slotProps.row[cl.tooltipValue] }}
                </template>
                <template v-else-if="['date', 'datetime'].includes(cl.type?.toLowerCase())">
                  {{
                    convertDateFormat(slotProps.row[cl.name], cl.type?.toLowerCase(), cl.dateFormat)
                  }}
                </template>
                <template v-else-if="cl.type === 'year'"> {{ slotProps.row[cl.name] }}년</template>

                <template v-else>
                  {{
                    cl.format
                      ? /<[^>]+>/.test(cl.format(slotProps.row[cl.name], slotProps.row, cl, iIdx))
                        ? slotProps.row[cl.name]
                        : cl.format(slotProps.row[cl.name], slotProps.row, cl, iIdx)
                      : slotProps.row[cl.name]
                  }}
                </template>
              </q-tooltip>
            </q-td>
          </q-tr>
          <InfiniteLoading
            v-if="
              model.type === 'scroll' &&
              slotProps.pageIndex === model.pagination.rowsPerPage * model.pagination.page - 2
            "
            @infinite="onScrollEnd"
          />
        </template>
        <template #top-left>
          <div class="row items-center">
            <div v-if="onTopOptions" class="col text-bold q-mr-md">
              총, {{ model.pagination.rowsNumber }}건
            </div>

            <slot name="top-left"></slot>
          </div>
        </template>
        <template #top-right>
          <slot name="top-right"></slot>
          <div v-if="onTopOptions && onTopPaginationOptions" class="col-auto">
            <q-select
              v-model.trim="model.pagination.rowsPerPage"
              :display-value="`${model.pagination.rowsPerPage}건씩 보기`"
              :options="[15, 20, 30, 50, 100]"
              dense
              @update:model-value="() => requestServerInteraction()"
            >
              <template #option="{ itemProps, opt }">
                <q-item v-bind="itemProps">
                  <q-item-section> {{ opt }}건씩 보기</q-item-section>
                </q-item>
              </template>
            </q-select>
          </div>
        </template>
      </q-table>
    </div>

    <slot name="bottom"></slot>
    <div class="row justify-center q-py-md">
      <q-pagination
        v-if="onCustomPagination"
        v-model.trim="model.pagination.page"
        :max="pagesNumber"
        :max-pages="10"
        boundary-links
        color="grey-8"
        direction-links
        size="md"
        @update:model-value="updatePagination"
      />
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import VRuntimeTemplate from 'vue3-runtime-template'
import dayjs from 'dayjs'
import { findIndex, forEach, intersectionBy, isEmpty, isUndefined } from 'lodash-es'
import InfiniteLoading from 'v3-infinite-loading'

const emit = defineEmits([
  'request',
  'rowClick',
  'update-pagination',
  'rowBtnClick',
  'updateCheckbox',
  'update-order'
])
const props = defineProps({
  /**
   * table key
   * */
  rowKey: {
    type: String,
    required: false,
    default: 'id'
  },
  type: {
    type: String,
    required: false,
    default: null
  },
  virtualIdx: {
    type: Boolean,
    required: false,
    default: false
  },
  /*
   * merged table header 구성
   * ex)
   * [
   *   { name: 'bplcNm', label: '사업장' },
   *   // children 입력시 'name' key 입력 x, 입력시 props undefined로 인한 충돌
   *   {
   *     label: '장비',
   *     children: [
   *       { name: 'typeNm', label: '장비/설비 종류' },
   *       { name: 'nm', label: '장비/설비명' },
   *     ],
   *   },
   *   { name: 'statusNm', label: '상태' },
   *   { name: 'modelNm', label: '모델명' },
   * ]
   */
  customHeader: {
    type: Array,
    default: () => []
  },
  /**
   * table checkBox selection 활성 여부
   * single, multiple, none
   * (single, multiple인 경우 rowKey prop 필수)
   * */
  selection: {
    type: String,
    required: false,
    default: 'none'
  },
  /**
   * row의 checkBox 활성화 조건
   * */
  showSelection: {
    type: Function,
    required: false,
    default() {
      return true
    }
  },
  /**
   * GroupMngTree가 존재할 경우 col-10
   * */
  col: {
    type: String,
    required: false,
    default: 'col'
  },
  /**
   * tab이 없는 경우 height: '70vh'(default)
   * tab이 있는 경우 height: '65vh'
   * */
  tableStyle: {
    type: Object,
    required: false,
    default: () => {
      return {
        height: '70vh'
      }
    }
  },
  contentAreaClass: {
    type: String,
    required: false,
    default: 'q-pb-sm'
  },
  onCustomPagination: {
    type: Boolean,
    required: false,
    default: () => true
  },
  onTopOptions: {
    type: Boolean,
    required: false,
    default: () => true
  },
  onTopPaginationOptions: {
    type: Boolean,
    required: false,
    default: () => true
  },
  loading: {
    type: Boolean,
    required: false,
    default: false
  },
  virtualScroll: {
    type: Boolean,
    required: false,
    default: false
  }
})

const tableRef = ref(null)
const model = defineModel()
const selectionProp = computed(() => props.selection)
const tableStyleProp = computed(() => props.tableStyle)
const loadingProp = computed(() => props.loading)
const virtualScrollProp = computed(() => props.virtualScroll)
const filteredRows = computed(() => model.value.rows.filter(props.showSelection))
const checkSelection = computed({
  get: () => {
    return (filteredRows.value.length || -1) === findSeletedInRows().length
  },
  set: (checkVal) => {
    if (checkVal) {
      allSelectInRows()
    } else {
      spliceSelectInRows()
    }
  }
})
const rowsFilterdByShowSelection = computed(() => {
  return model.value.rows.filter(props.showSelection)
})
const pagesNumber = computed(() =>
  Math.ceil(model.value.pagination.rowsNumber / model.value.pagination.rowsPerPage)
)

const customTdStyle = computed(() => {
  return { 'text-overflow': 'ellipsis' }
})

// custom header Arrau 재구성
const customHeaderProp = computed(() => {
  let firstRow = []
  let secondRow = []
  forEach(props.customHeader, (header) => {
    if (header.name) {
      // 자식이 없으면 row set
      header.rowspan = 2
    } else {
      // 자식이 있으면 col set
      header.colspan = header.children.length
      if (header.children) {
        header.children.forEach((child) => {
          secondRow.push(child)
        })
      }
    }
    firstRow.push(header)
  })
  return [firstRow, secondRow]
})

const allSelectInRows = () => {
  rowsFilterdByShowSelection.value
    .filter((row) => findIndex(model.value.selected, [props.rowKey, row[props.rowKey]]) === -1)
    .forEach((row) => model.value.selected.push(row))
}

const spliceSelectInRows = () => {
  // rowsFilterdByShowSelection.value.forEach((row) => {
  //   const index = findIndex(model.value.selected, ['id', row.id])
  //   if (index !== -1) {
  //     model.value.selected.splice(index, 1)
  //   }
  // })
  model.value.selected.splice(0, model.value.selected.length)
}

const findSeletedInRows = () => {
  return intersectionBy(model.value.rows, model.value.selected, props.rowKey)
}

const convertDateFormat = (date, type, dataFormat) => {
  if (isUndefined(dataFormat)) {
    dataFormat = type === 'datetime' ? 'YYYY-MM-DD HH:mm' : 'YYYY-MM-DD'
  }

  if (date === null || date === undefined || typeof date !== 'string' || date === '-') {
    return '-'
  } else {
    return dayjs(date).format(dataFormat)
  }
}

const concatValueParsing = (v, separators) => {
  const vToArray = v.split(separators)
  let firstValue = vToArray.splice(0, 1).join()
  if (vToArray.length > 0) {
    firstValue += ` + ${vToArray.length}`
  }
  return firstValue
}

const tableFieldValid = (v) => {
  return !(v === null || v === undefined || typeof v !== 'string' || v === '-' || v === '')
}

// 테이블 하단 페이지 번호 변경시
const updatePagination = async (v) => {
  requestServerInteraction()
  emit('update-pagination', v)
}

const onRequest = async (props) => {
  emit('request', props)
}

const onRowClick = async (evt, row, col) => {
  emit('rowClick', evt, row, col)
}

const onRowBtnClick = (evt, row, col) => {
  emit('rowBtnClick', evt, row, col)
}

let dragStartIndex = null

const hasSwap = (cols) => {
  return !!cols.some((cl) => cl.swap) // cols 내에 하나라도 cl.swap이 있으면 true 반환
}

const onDragStart = (event, slotProps) => {
  dragStartIndex =
    slotProps.rowIndex - model.value.pagination.rowsPerPage * (model.value.pagination.page - 1)
  event.dataTransfer.effectAllowed = 'move'
  event.dataTransfer.setData('text/plain', slotProps.row.index)
}

const onDragOver = (event, swap) => {
  if (!swap) return
  event.preventDefault() // 기본 동작을 방지하여 drop이 가능하게 만듦
}

const onDrop = (event, rowIndex) => {
  event.preventDefault()
  const dragEndIndex =
    rowIndex - model.value.pagination.rowsPerPage * (model.value.pagination.page - 1)
  if (dragStartIndex !== dragEndIndex) {
    const movedRow = model.value.rows[dragStartIndex]

    // 끼워넣는 로직
    model.value.rows.splice(dragStartIndex, 1)
    model.value.rows.splice(dragEndIndex, 0, movedRow)

    emit('update-order')
  }
  dragStartIndex = null
}

const onDragEnd = (slotProps) => {
  // 드래그 종료 후 이벤트 처리
  dragStartIndex = null
}

const requestServerInteraction = () => {
  tableRef.value.requestServerInteraction()
}

defineExpose({
  requestServerInteraction
})

const onScrollEnd = async () => {
  model.value.pagination.page += 1
  emit('update-pagination', model.value.pagination.page)
  requestServerInteraction()
}

const handleCheckbox = computed({
  get: (row) => {
    return row
  },
  set: (row) => {
    return row
  }
})
</script>
