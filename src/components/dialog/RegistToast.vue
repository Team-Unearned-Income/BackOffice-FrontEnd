<template>
  <div v-if="visible" class="toast">
    <div class="toast-content">{{ props.message }}</div>
    <div v-if="props.status === 'success'" class="toast-icon">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        height="24px"
        viewBox="0 -960 960 960"
        width="24px"
        fill="#FFFFFF"
      >
        <path
          d="m424-296 282-282-56-56-226 226-114-114-56 56 170 170Zm56 216q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z"
        />
      </svg>
    </div>
    <div v-else-if="props.status === 'failed'" class="toast-failed-icon">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        height="24px"
        viewBox="0 -960 960 960"
        width="24px"
        fill="#5f6368"
      >
        <path
          d="m336-280 144-144 144 144 56-56-144-144 144-144-56-56-144 144-144-144-56 56 144 144-144 144 56 56ZM480-80q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z"
        />
      </svg>
    </div>
    <div v-else-if="props.status === 'warning'" class="toast-warning-icon">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        height="24px"
        viewBox="0 0 24 24"
        width="24px"
        fill="#5f6368"
      >
        <path
          d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 15c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm1-4h-2V7h2v6z"
        />
      </svg>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

// Props to customize toast
const props = defineProps({
  message: {
    type: String,
    default: '등록되었습니다.'
  },
  duration: {
    type: Number,
    default: 3000 // Default duration is 3 seconds
  },
  status: {
    type: String,
    default: 'success'
  }
})

// Internal state for visibility
const visible = ref(false)

// Show toast when mounted
const showToast = () => {
  visible.value = true
  setTimeout(() => {
    visible.value = false
  }, props.duration * 2)
}

// Emit an event to notify when toast is hidden
const emit = defineEmits(['hidden'])

// Watch visibility to emit event when hidden
watch(visible, (newVal) => {
  if (!newVal) emit('hidden')
})

// Show toast immediately when component is used
showToast()
</script>

<style lang="scss" scoped>
.toast {
  position: fixed;
  bottom: -50px; // Initial position for animation
  left: 50%;
  transform: translateX(-50%);
  background-color: #333;
  color: #fff;
  padding: 10px;
  border-radius: 50px;
  box-shadow: 0px 2px 5px rgba(0, 0, 0, 0.2);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  opacity: 0; // Hidden by default

  animation:
    slide-in 0.5s ease-out forwards,
    slide-out 0.5s ease-in forwards;
  animation-delay: 0s, 3s; // Delayed exit after 3 seconds
}

.toast-icon {
  display: flex;
  align-items: center;
  svg {
    width: 24px;
    height: 24px;
    fill: greenyellow;
  }
}

.toast-failed-icon {
  display: flex;
  align-items: center;
  svg {
    width: 24px;
    height: 24px;
    fill: red;
  }
}

.toast-warning-icon {
  display: flex;
  align-items: center;
  svg {
    width: 24px;
    height: 24px;
    fill: orange;
  }
}

@keyframes slide-in {
  0% {
    bottom: -50px;
    opacity: 0;
  }
  100% {
    bottom: 20px;
    opacity: 1;
  }
}

@keyframes slide-out {
  0% {
    bottom: 20px;
    opacity: 1;
  }
  100% {
    bottom: -50px;
    opacity: 0;
  }
}
</style>
