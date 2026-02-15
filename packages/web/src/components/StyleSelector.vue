<template>
  <div class="flex flex-wrap gap-2">
    <button
      v-for="style in styles"
      :key="style"
      @click="$emit('update:modelValue', style)"
      :class="[
        'rounded-lg px-3 py-1.5 text-sm font-medium transition-colors',
        modelValue === style
          ? 'bg-indigo-500 text-white'
          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
      ]"
    >
      {{ style }}
    </button>
  </div>
</template>

<script setup>
defineProps({
  styles: { type: Array, default: () => ['Color', 'Flat', '3D', 'High Contrast'] },
  modelValue: { type: String, default: 'Color' },
})
defineEmits(['update:modelValue'])
</script>
