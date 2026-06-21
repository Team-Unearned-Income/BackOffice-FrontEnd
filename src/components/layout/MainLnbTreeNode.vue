<template>
  <q-expansion-item
    v-model="nodeItem.expand"
    :class="clazz"
    :hide-expand-icon="!nodeItem.childrenList"
  >
    <template #header>
      <slot v-bind="{ nodeItem }">
        <div
          class="col items-center row"
          :style="nodeHeaderStyle"
          :class="nodeHeaderClass"
          @click="
            () => {
              onClick(nodeItem)
            }
          "
        >
          <q-icon
            :name="nodeItem.icon"
            :color="isSelected ? 'primary' : 'white'"
            class="q-mr-sm"
            size="20px"
          />
          <span class="col">
            {{ nodeItem.menuName }}
          </span>
        </div>
      </slot>
    </template>

    <template
      v-for="(child, index) in nodeItem.childrenList ?? []"
      :key="`node_${props.depth}_${index}`"
    >
      <MainLnbTreeNode :node="child" :depth="props.depth + 1" @select="onSelectChild" />
    </template>
  </q-expansion-item>
  <q-separator v-if="props.depth === 0" color="grey" />
</template>

<script setup>
/**
 * Lnb Tree를 위해 Recursive 하게 구성한 TreeNode
 */
import { computed, onBeforeMount, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const props = defineProps({
  node: {
    type: Object,
    required: true
  },
  depth: {
    type: Number,
    default: 0
  }
})

const emit = defineEmits(['select'])

const route = useRoute()
const router = useRouter()
const nodeItem = ref({})

onBeforeMount(() => {
  // setPermission(props.node)
})

/**
 * Leaf Node 여부.
 * route 가 있으면 Leaf Node
 */
const isLeaf = computed(() => !!nodeItem.value.url)

/**
 * 현재 선택 여부.
 */
const isSelected = computed(
  () => isLeaf.value && route.matched.some((_r) => _r.path === nodeItem.value.url)
)

/**
 * dynamic class.
 * depth 에 따라 변경.
 */
const clazz = computed(() => `lnb-tree__depth${props.depth}`)

/**
 * node header pannel dynamic class.
 * depth 와 select 여부에 따라 변경
 */
const nodeHeaderClass = computed(() => ({
  'text-bold': props.depth === 0,
  'text-bold text-primary': isSelected.value,
  'text-white': !isSelected.value
}))

/**
 * node header pannel dynamic style.
 * depth 에 따라 변경
 */
const nodeHeaderStyle = computed(() => ({
  'padding-left': `${props.depth * 10}px`
}))

/**
 * parent node 에 select 되었음을 emit.
 *
 * @param nodeItems 현재 node
 */
const propagate = (nodeItems) => {
  emit('select', [nodeItem.value, ...(nodeItems ?? [])])
}

const onClick = (nodeItem) => {
  if (!isLeaf.value) {
    return
  }
  router.push(nodeItem.url)
}

/**
 * child node 선택 event handler.
 *
 * @param nodeItems 선택된 child node 부터 propagate 된 parent node 목록
 */
const onSelectChild = (nodeItems) => {
  nodeItem.value.expand = true
  propagate(nodeItems)
}

/**
 * props 의 node 변경 handler.
 * nodeItem 으로 옮겨 저장
 *
 * @param v
 */
const onChangeNode = (v) => {
  nodeItem.value = v
  nodeItem.value.expand = v.expand ?? false
}

/**
 * 화면 route 변경 event handler.
 */
const onChangeRoute = () => {
  if (isSelected.value) {
    propagate()
  }
}

watch(() => props.node, onChangeNode, { immediate: true })
watch(() => route.matched, onChangeRoute, { immediate: true })
</script>
