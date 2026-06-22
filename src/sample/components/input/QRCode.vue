<template>
  <div class="qrcode-container">
    <vue-qrcode :width="props.width" :margin="props.margin" :scale="props.scale" :value="props.value" :type="props.type" :color="props.color"/>
  </div>
</template>

<script setup>
import VueQrcode from 'vue-qrcode'

const props = defineProps({
  value: {
    type: String,
    default: '',
  },
  type: {
    type: String,
    default: 'image/png',
    required: false,
  },
  color: {
    type: Object,
    default: () => ({ dark: '#000000ff', light: '#ffffffff' }),
    required: false,
  },
  margin: {
    type: Number,
    default: 1,
    required: false,
  },
  scale:{
    type: Number,
    default: 1,
    required: false,
  },
  width: {
    type: Number,
    default: 100,
    required: false,
  }
})

</script>

<style scoped>
.qrcode-container {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
