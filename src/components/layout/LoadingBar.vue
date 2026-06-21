<template>
  <q-inner-loading :showing='showing' class='fullscreen' style='z-index: 10000'>
    <q-spinner-facebook color='purple-5' size='5em'>
      <div class='text-grey-8'>진행중입니다</div>
    </q-spinner-facebook>
  </q-inner-loading>
</template>

<script setup>
const showing = defineModel('showing', {
  type: Boolean,
  default: false,
  required: true
});
</script>
