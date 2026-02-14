<template>
  <div
    v-if="icon"
    class="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/40 p-4"
    @click.self="$emit('close')"
  >
    <div class="relative my-auto w-full max-w-md rounded-2xl bg-white p-4 shadow-xl sm:p-6">
      <!-- Close button -->
      <button
        @click="$emit('close')"
        class="absolute right-4 top-4 rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
      >
        <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      <!-- Header -->
      <div class="mb-4 flex items-center gap-3">
        <span v-if="icon.glyph" class="text-3xl">{{ icon.glyph }}</span>
        <div>
          <h2 class="text-lg font-semibold text-gray-800">{{ icon.name }}</h2>
          <p class="text-sm text-gray-400">{{ icon.group }}</p>
        </div>
      </div>

      <!-- Tags -->
      <div v-if="icon.tags && icon.tags.length" class="mb-4 flex flex-wrap gap-1.5">
        <span
          v-for="tag in icon.tags"
          :key="tag"
          class="rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-medium text-indigo-600"
        >
          {{ tag }}
        </span>
      </div>

      <!-- Preview -->
      <div class="mb-5 flex items-center justify-center rounded-xl bg-gray-50 p-6">
        <img
          :src="previewUrl"
          :alt="icon.name"
          class="h-32 w-32 object-contain"
        />
      </div>

      <!-- Style selector (only if more than one style) -->
      <div v-if="icon.styles && icon.styles.length > 1" class="mb-4">
        <p class="mb-1.5 text-sm font-medium text-gray-600">Style</p>
        <StyleSelector v-model="selectedStyle" :styles="icon.styles" />
      </div>

      <!-- Skin tone selector -->
      <div class="mb-4">
        <SkinToneSelector
          v-model="selectedSkinTone"
          :available="icon.skinTones"
        />
      </div>

      <!-- Size selector (for PNG) -->
      <div class="mb-5">
        <p class="mb-1.5 text-sm font-medium text-gray-600">PNG Size</p>
        <div class="flex gap-2">
          <button
            v-for="s in sizes"
            :key="s"
            @click="selectedSize = s"
            :class="[
              'rounded-lg px-3 py-1.5 text-sm font-medium transition-colors',
              selectedSize === s
                ? 'bg-indigo-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            ]"
          >
            {{ s }}
          </button>
        </div>
      </div>

      <!-- Source attribution -->
      <div class="mb-4 rounded-lg bg-gray-50 px-3 py-2">
        <p class="text-xs text-gray-500">
          Source:
          <a
            :href="sourceInfo.repoUrl"
            target="_blank"
            rel="noopener noreferrer"
            class="font-medium text-indigo-500 hover:text-indigo-600 hover:underline"
          >
            {{ sourceInfo.name }}
          </a>
          <span class="ml-1 text-gray-400">— License: {{ sourceInfo.license }}</span>
        </p>
      </div>

      <!-- Actions -->
      <div class="grid grid-cols-2 gap-2">
        <button
          v-if="isSvg"
          @click="handleDownloadSvg"
          :disabled="downloading"
          class="rounded-lg bg-indigo-500 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-600 disabled:opacity-50"
        >
          {{ downloadLabel('SVG') }}
        </button>
        <button
          @click="handleDownloadPng"
          :disabled="downloading"
          :class="[
            'rounded-lg py-2 text-sm font-medium text-white transition-colors disabled:opacity-50',
            isSvg ? 'bg-gray-700 hover:bg-gray-800' : 'col-span-2 bg-indigo-500 hover:bg-indigo-600'
          ]"
        >
          {{ downloadLabel('PNG') }}
        </button>
        <button
          v-if="isSvg"
          @click="handleCopySvg"
          class="rounded-lg border border-gray-200 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50"
        >
          {{ copyLabel }}
        </button>
        <button
          v-if="icon.glyph"
          @click="handleCopyGlyph"
          class="rounded-lg border border-gray-200 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50"
        >
          {{ glyphLabel }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useDownload } from '../composables/useDownload.js'
import { getSource } from '../api/sources.js'
import StyleSelector from './StyleSelector.vue'
import SkinToneSelector from './SkinToneSelector.vue'

const props = defineProps({
  icon: { type: Object, default: null },
})
defineEmits(['close'])

const { getPreviewUrl, downloadSvg, downloadPng, copySvg, copyGlyph } = useDownload()

const selectedStyle = ref('Color')
const selectedSkinTone = ref('Default')
const selectedSize = ref(256)
const downloading = ref(false)
const copyLabel = ref('Copy SVG')
const glyphLabel = ref('Copy Emoji')
const sizes = [32, 64, 128, 256, 512]

const sourceInfo = computed(() => {
  if (!props.icon) return { name: '', repoUrl: '', license: '' }
  return getSource(props.icon.source)
})

const isSvg = computed(() => {
  if (!props.icon) return true
  const source = getSource(props.icon.source)
  return source.getFileExtension(selectedStyle.value) === 'svg'
})

const previewUrl = computed(() => {
  if (!props.icon) return ''
  return getPreviewUrl(props.icon, selectedStyle.value, selectedSkinTone.value)
})

// Reset selections when icon changes
watch(() => props.icon, (newIcon) => {
  if (newIcon) {
    selectedStyle.value = newIcon.styles?.[0] || 'Color'
  }
  selectedSkinTone.value = 'Default'
  copyLabel.value = 'Copy SVG'
  glyphLabel.value = 'Copy Emoji'
})

function downloadLabel(type) {
  return downloading.value ? 'Downloading...' : `Download ${type}`
}

async function handleDownloadSvg() {
  downloading.value = true
  try {
    await downloadSvg(props.icon, selectedStyle.value, selectedSkinTone.value)
  } finally {
    downloading.value = false
  }
}

async function handleDownloadPng() {
  downloading.value = true
  try {
    await downloadPng(props.icon, selectedSize.value, selectedStyle.value, selectedSkinTone.value)
  } finally {
    downloading.value = false
  }
}

async function handleCopySvg() {
  await copySvg(props.icon, selectedStyle.value, selectedSkinTone.value)
  copyLabel.value = 'Copied!'
  setTimeout(() => copyLabel.value = 'Copy SVG', 1500)
}

async function handleCopyGlyph() {
  await copyGlyph(props.icon)
  glyphLabel.value = 'Copied!'
  setTimeout(() => glyphLabel.value = 'Copy Emoji', 1500)
}
</script>
