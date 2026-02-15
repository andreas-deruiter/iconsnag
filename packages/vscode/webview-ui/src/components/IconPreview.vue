<template>
  <div
    v-if="icon"
    class="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-3"
    style="background: rgba(0, 0, 0, 0.5)"
    @click.self="$emit('close')"
  >
    <div class="relative my-auto w-full max-w-sm rounded-lg p-4 shadow-xl" style="background: var(--bg-secondary)">
      <!-- Close button -->
      <button
        @click="$emit('close')"
        class="absolute right-3 top-3 rounded p-1"
        style="color: var(--text-secondary)"
      >
        <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      <!-- Header -->
      <div class="mb-3 flex items-center gap-2">
        <span v-if="icon.glyph" class="text-2xl">{{ icon.glyph }}</span>
        <div>
          <h2 class="text-sm font-semibold" style="color: var(--text-primary)">{{ icon.name }}</h2>
          <p class="text-xs" style="color: var(--text-secondary)">{{ icon.group }}</p>
        </div>
      </div>

      <!-- Tags -->
      <div v-if="icon.tags && icon.tags.length" class="mb-3 flex flex-wrap gap-1">
        <span
          v-for="tag in icon.tags"
          :key="tag"
          class="rounded px-2 py-0.5 text-xs"
          style="background: var(--badge-bg); color: var(--badge-fg)"
        >
          {{ tag }}
        </span>
      </div>

      <!-- Preview -->
      <div class="mb-4 flex items-center justify-center rounded-lg p-4" style="background: var(--bg-primary)">
        <img
          :src="previewUrl"
          :alt="icon.name"
          class="h-24 w-24 object-contain"
        />
      </div>

      <!-- Style selector -->
      <div v-if="icon.styles && icon.styles.length > 1" class="mb-3">
        <p class="mb-1 text-xs font-medium" style="color: var(--text-secondary)">Style</p>
        <StyleSelector v-model="selectedStyle" :styles="icon.styles" />
      </div>

      <!-- Skin tone selector -->
      <div class="mb-3">
        <SkinToneSelector
          v-model="selectedSkinTone"
          :available="icon.skinTones"
        />
      </div>

      <!-- Source attribution -->
      <div class="mb-3 rounded px-2 py-1.5" style="background: var(--bg-primary)">
        <p class="text-xs" style="color: var(--text-secondary)">
          {{ sourceInfo.name }} &middot; {{ sourceInfo.license }}
        </p>
      </div>

      <!-- Action result feedback -->
      <div v-if="lastActionResult" class="mb-2 rounded px-2 py-1.5 text-center text-xs"
        style="background: var(--vscode-notificationsInfoIcon-foreground, #75beff); color: var(--bg-primary)">
        {{ lastActionResult.message }}
      </div>

      <!-- Actions — VS Code specific -->
      <div class="grid grid-cols-2 gap-1.5">
        <button
          v-if="isSvg"
          @click="handleInsertSvg"
          :disabled="actionLoading"
          class="rounded py-1.5 text-xs font-medium transition-colors disabled:opacity-50"
          style="background: var(--button-bg); color: var(--button-fg)"
        >
          Insert SVG
        </button>
        <button
          v-if="isSvg"
          @click="handleInsertImg"
          :disabled="actionLoading"
          class="rounded py-1.5 text-xs font-medium transition-colors disabled:opacity-50"
          style="background: var(--button-secondary-bg); color: var(--button-secondary-fg)"
        >
          Insert &lt;img&gt;
        </button>
        <button
          v-if="isSvg"
          @click="handleCopySvg"
          :disabled="actionLoading"
          class="rounded py-1.5 text-xs font-medium transition-colors disabled:opacity-50"
          style="background: var(--button-secondary-bg); color: var(--button-secondary-fg)"
        >
          {{ copyLabel }}
        </button>
        <button
          v-if="isSvg"
          @click="handleSaveFile"
          :disabled="actionLoading"
          class="rounded py-1.5 text-xs font-medium transition-colors disabled:opacity-50"
          style="background: var(--button-secondary-bg); color: var(--button-secondary-fg)"
        >
          Save to project
        </button>
        <button
          v-if="icon.glyph"
          @click="handleCopyGlyph"
          class="rounded py-1.5 text-xs font-medium transition-colors"
          :class="{ 'col-span-2': !isSvg }"
          style="background: var(--button-secondary-bg); color: var(--button-secondary-fg)"
        >
          {{ glyphLabel }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { getSource } from '@iconsnag/shared/sources'
import { useVsCode } from '../composables/useVsCode.js'
import StyleSelector from './StyleSelector.vue'
import SkinToneSelector from './SkinToneSelector.vue'

const props = defineProps({
  icon: { type: Object, default: null },
})
defineEmits(['close'])

const { insertSvg, insertImg, copySvg, copyGlyph, saveFile, trackRecent, lastActionResult } = useVsCode()

const selectedStyle = ref('Color')
const selectedSkinTone = ref('Default')
const actionLoading = ref(false)
const copyLabel = ref('Copy SVG')
const glyphLabel = ref('Copy Emoji')

const sourceInfo = computed(() => {
  if (!props.icon) return { name: '', license: '' }
  return getSource(props.icon.source)
})

const isSvg = computed(() => {
  if (!props.icon) return true
  const source = getSource(props.icon.source)
  return source.getFileExtension(selectedStyle.value) === 'svg'
})

const previewUrl = computed(() => {
  if (!props.icon) return ''
  const source = getSource(props.icon.source)
  return source.getFileUrl(props.icon.baseUrl, props.icon, selectedStyle.value, selectedSkinTone.value)
})

watch(() => props.icon, (newIcon) => {
  if (newIcon) {
    selectedStyle.value = newIcon.styles?.[0] || 'Color'
  }
  selectedSkinTone.value = 'Default'
  copyLabel.value = 'Copy SVG'
  glyphLabel.value = 'Copy Emoji'
})

async function fetchSvgContent() {
  const source = getSource(props.icon.source)
  const url = source.getFileUrl(props.icon.baseUrl, props.icon, selectedStyle.value, selectedSkinTone.value)
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Failed to fetch SVG: ${res.status}`)
  return res.text()
}

function doTrackRecent() {
  trackRecent({
    id: props.icon.id,
    name: props.icon.name,
    source: props.icon.source,
    style: selectedStyle.value,
  })
}

async function handleInsertSvg() {
  actionLoading.value = true
  try {
    const svgContent = await fetchSvgContent()
    insertSvg(svgContent)
    doTrackRecent()
  } catch (e) {
    console.error('Insert SVG failed:', e)
  } finally {
    actionLoading.value = false
  }
}

async function handleInsertImg() {
  actionLoading.value = true
  try {
    const source = getSource(props.icon.source)
    const url = source.getFileUrl(props.icon.baseUrl, props.icon, selectedStyle.value, selectedSkinTone.value)
    insertImg(url, props.icon.name, 24)
    doTrackRecent()
  } finally {
    actionLoading.value = false
  }
}

async function handleCopySvg() {
  actionLoading.value = true
  try {
    const svgContent = await fetchSvgContent()
    copySvg(svgContent)
    doTrackRecent()
    copyLabel.value = 'Copied!'
    setTimeout(() => copyLabel.value = 'Copy SVG', 1500)
  } catch (e) {
    console.error('Copy SVG failed:', e)
  } finally {
    actionLoading.value = false
  }
}

async function handleSaveFile() {
  actionLoading.value = true
  try {
    const svgContent = await fetchSvgContent()
    const fileName = `${props.icon.id}_${selectedStyle.value.toLowerCase()}.svg`
    saveFile(svgContent, fileName)
    doTrackRecent()
  } catch (e) {
    console.error('Save file failed:', e)
  } finally {
    actionLoading.value = false
  }
}

function handleCopyGlyph() {
  if (props.icon.glyph) {
    copyGlyph(props.icon.glyph)
    doTrackRecent()
    glyphLabel.value = 'Copied!'
    setTimeout(() => glyphLabel.value = 'Copy Emoji', 1500)
  }
}
</script>
