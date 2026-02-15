<template>
  <button
    @click="$emit('select', icon)"
    class="group flex flex-col items-center gap-1.5 rounded-xl p-3 transition-all hover:bg-indigo-50 hover:shadow-sm"
  >
    <img
      :src="previewUrl"
      :alt="icon.name"
      class="h-10 w-10 object-contain transition-transform group-hover:scale-110"
      loading="lazy"
    />
    <span class="max-w-full truncate text-xs text-gray-500 group-hover:text-indigo-600">
      {{ icon.name }}
    </span>
  </button>
</template>

<script setup>
import { computed } from 'vue'
import { useDownload } from '../composables/useDownload.js'
import { getSourceColorType } from '../api/sources.js'

const props = defineProps({
  icon: { type: Object, required: true },
  colorType: { type: String, default: '' },
})
defineEmits(['select'])

const { getPreviewUrl } = useDownload()

const defaultStyle = computed(() => {
  if (props.colorType === 'mono' && getSourceColorType(props.icon.source) === 'color' && props.icon.styles?.includes('High Contrast')) {
    return 'High Contrast'
  }
  return props.icon.styles?.[0] || 'Color'
})

const previewUrl = computed(() =>
  getPreviewUrl(props.icon, defaultStyle.value, 'Default')
)
</script>
