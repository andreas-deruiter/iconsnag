<template>
  <div v-if="available" class="flex items-center gap-2">
    <span class="text-xs" style="color: var(--text-secondary)">Skin tone:</span>
    <div class="flex gap-1">
      <button
        v-for="tone in tones"
        :key="tone.value"
        @click="$emit('update:modelValue', tone.value)"
        :title="tone.label"
        :class="[
          'h-6 w-6 rounded-full border-2 text-xs transition-transform hover:scale-110',
          modelValue === tone.value ? 'scale-110' : ''
        ]"
        :style="{
          backgroundColor: tone.color,
          borderColor: modelValue === tone.value ? 'var(--accent)' : 'transparent',
        }"
      />
    </div>
  </div>
</template>

<script setup>
defineProps({
  available: { type: Boolean, default: false },
  modelValue: { type: String, default: 'Default' },
})
defineEmits(['update:modelValue'])

const tones = [
  { value: 'Default', label: 'Default', color: '#ffc83d' },
  { value: 'Light', label: 'Light', color: '#f7d7c4' },
  { value: 'Medium-Light', label: 'Medium Light', color: '#d8b094' },
  { value: 'Medium', label: 'Medium', color: '#bb9167' },
  { value: 'Medium-Dark', label: 'Medium Dark', color: '#8e562e' },
  { value: 'Dark', label: 'Dark', color: '#613d30' },
]
</script>
