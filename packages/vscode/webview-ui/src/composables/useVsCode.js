import { ref } from 'vue'

// Acquire the VS Code API (can only be called once)
const vscode = typeof acquireVsCodeApi === 'function' ? acquireVsCodeApi() : null

const lastActionResult = ref(null)

// Listen for messages from the extension host
window.addEventListener('message', (event) => {
  const message = event.data
  if (message.type === 'actionResult') {
    lastActionResult.value = message
    setTimeout(() => { lastActionResult.value = null }, 2000)
  }
})

export function useVsCode() {
  function postMessage(message) {
    if (vscode) {
      vscode.postMessage(message)
    } else {
      console.log('[useVsCode] postMessage:', message)
    }
  }

  function insertSvg(svgContent) {
    postMessage({ type: 'insertSvg', svgContent })
  }

  function insertImg(url, alt, size = 24) {
    postMessage({ type: 'insertImg', url, alt, size })
  }

  function copySvg(svgContent) {
    postMessage({ type: 'copySvg', svgContent })
  }

  function copyGlyph(glyph) {
    postMessage({ type: 'copyGlyph', glyph })
  }

  function saveFile(svgContent, fileName) {
    postMessage({ type: 'saveFile', svgContent, fileName })
  }

  function trackRecent(icon) {
    postMessage({ type: 'trackRecent', icon })
  }

  function getDataUri(fileName) {
    postMessage({ type: 'getDataUri', fileName })
  }

  return {
    postMessage,
    insertSvg,
    insertImg,
    copySvg,
    copyGlyph,
    saveFile,
    trackRecent,
    getDataUri,
    lastActionResult,
    isVsCode: !!vscode,
  }
}
