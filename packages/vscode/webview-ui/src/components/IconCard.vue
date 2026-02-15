<template>
  <button
    @click="$emit('select', icon)"
    class="group flex flex-col items-center gap-1 rounded p-2 transition-all"
    style="color: var(--text-secondary)"
    @mouseenter="$event.target.style.background = 'var(--bg-hover)'"
    @mouseleave="$event.target.style.background = 'transparent'"
  >
    <img
      :src="previewUrl"
      :alt="icon.name"
      class="h-8 w-8 object-contain transition-transform group-hover:scale-110"
      loading="lazy"
    />
    <span class="max-w-full truncate text-xs">
      {{ icon.name }}
    </span>
  </button>
</template>

<script setup>
import { computed } from 'vue'
import { getSource, getSourceColorType } from '@iconsnag/shared/sources'

const props = defineProps({
  icon: { type: Object, required: true },
  colorType: { type: String, default: '' },
})
defineEmits(['select'])

const defaultStyle = computed(() => {
  if (props.colorType === 'mono' && getSourceColorType(props.icon.source) === 'color' && props.icon.styles?.includes('High Contrast')) {
    return 'High Contrast'
  }
  return props.icon.styles?.[0] || 'Color'
})

const previewUrl = computed(() => {
  const source = getSource(props.icon.source)
  return source.getFileUrl(props.icon.baseUrl, props.icon, defaultStyle.value, 'Default')
})
</script>
