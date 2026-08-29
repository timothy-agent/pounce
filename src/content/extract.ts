import { extractPage, extractSelection } from '../shared/extract'
import type { ContentExtractRequest, ContentExtractResponse, ExtractMode } from '../shared/messages'

declare global {
  interface Window {
    __pounceExtract?: (mode: ExtractMode) => ContentExtractResponse
  }
}

function handle(req: ContentExtractRequest): ContentExtractResponse {
  try {
    if (req.mode === 'selection') {
      const clip = extractSelection(document, location.href)
      if (!clip) {
        return {
          ok: false,
          error: 'No text selected. Select the passage you want, then clip the selection.',
        }
      }
      return { ok: true, data: clip }
    }
    return { ok: true, data: extractPage(document, location.href) }
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'Extraction failed' }
  }
}

window.__pounceExtract = (mode) => handle({ type: 'POUNCE_EXTRACT', mode })

chrome.runtime.onMessage.addListener((msg: ContentExtractRequest, _sender, sendResponse) => {
  if (msg?.type !== 'POUNCE_EXTRACT') return
  sendResponse(handle(msg))
})
