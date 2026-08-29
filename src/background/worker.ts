import extractScript from '../content/extract?script'
import { createClient } from '../shared/api'
import {
  isHttpPageUrl,
  mapChromeClipError,
  PAGE_UNREACHABLE_MESSAGE,
  RESTRICTED_TAB_MESSAGE,
} from '../shared/clip-errors'
import { COLLECTIONS_TTL_MS, CONTEXT_MENU_SELECTION } from '../shared/constants'
import type {
  ClipPayload,
  ContentExtractResponse,
  ExtractMode,
  KbCollection,
  SettingsPublic,
  WorkerRequest,
  WorkerResponse,
} from '../shared/messages'
import { isConfigured, loadSettings } from '../shared/settings'

const SESSION_SELECTION = 'pendingSelection'
const PENDING_MAX_AGE_MS = 60_000

type CollectionsCache = { at: number; collections: KbCollection[] }

async function fail<T>(error: string): Promise<WorkerResponse<T>> {
  return { ok: false, error }
}

async function ok<T>(data: T): Promise<WorkerResponse<T>> {
  return { ok: true, data }
}

async function activeTab(): Promise<chrome.tabs.Tab> {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
  if (!tab?.id) throw new Error('No active tab')
  return tab
}

function assertHttpTab(tab: chrome.tabs.Tab): void {
  if (!isHttpPageUrl(tab.url ?? '')) {
    throw new Error(RESTRICTED_TAB_MESSAGE)
  }
}

async function inject(tabId: number): Promise<void> {
  await chrome.scripting.executeScript({
    target: { tabId },
    files: [extractScript],
  })
}

/** Serialized into the tab. Must not close over worker imports. */
function runExtractorInPage(mode: ExtractMode): ContentExtractResponse {
  const fn = (
    globalThis as unknown as {
      __pounceExtract?: (m: ExtractMode) => ContentExtractResponse
    }
  ).__pounceExtract
  if (typeof fn !== 'function') {
    return { ok: false, error: 'EXTRACTOR_NOT_READY' }
  }
  return fn(mode)
}

async function extractInTab(tabId: number, mode: ExtractMode): Promise<ContentExtractResponse> {
  await inject(tabId)
  const deadline = Date.now() + 4000
  while (Date.now() < deadline) {
    const [shot] = await chrome.scripting.executeScript({
      target: { tabId },
      func: runExtractorInPage,
      args: [mode],
    })
    const res = shot?.result
    if (res && !res.ok && res.error === 'EXTRACTOR_NOT_READY') {
      await new Promise((r) => setTimeout(r, 25))
      continue
    }
    if (res) return res
    await new Promise((r) => setTimeout(r, 25))
  }
  return { ok: false, error: PAGE_UNREACHABLE_MESSAGE }
}

async function extractTab(mode: ExtractMode): Promise<ClipPayload> {
  const tab = await activeTab()
  assertHttpTab(tab)
  const tabId = tab.id
  if (tabId === undefined) throw new Error('No active tab')
  const res = await extractInTab(tabId, mode)
  if (!res.ok) throw new Error(res.error)
  return res.data
}

async function clientFromSettings() {
  const settings = await loadSettings()
  if (!isConfigured(settings)) {
    throw new Error('Set the Timothy base URL and API token on the options page first.')
  }
  return { settings, client: createClient({ baseUrl: settings.baseUrl, token: settings.token }) }
}

async function listCollectionsCached(): Promise<KbCollection[]> {
  const cached = (await chrome.storage.session.get('collections')) as { collections?: CollectionsCache }
  if (cached.collections && Date.now() - cached.collections.at < COLLECTIONS_TTL_MS) {
    return cached.collections.collections
  }
  const { client } = await clientFromSettings()
  const collections = await client.listCollections()
  await chrome.storage.session.set({ collections: { at: Date.now(), collections } })
  return collections
}

async function onMessage(msg: WorkerRequest): Promise<WorkerResponse<unknown>> {
  try {
    switch (msg.type) {
      case 'EXTRACT': {
        const pending = await chrome.storage.session.get(SESSION_SELECTION)
        const stored = pending[SESSION_SELECTION] as { clip: ClipPayload; at: number } | undefined
        if (stored?.clip && Date.now() - stored.at < PENDING_MAX_AGE_MS) {
          await chrome.storage.session.remove(SESSION_SELECTION)
          return ok(stored.clip)
        }
        return ok(await extractTab(msg.mode))
      }
      case 'SEND_CLIP': {
        const { client } = await clientFromSettings()
        const result = await client.clip({
          url: msg.clip.url,
          title: msg.clip.title,
          markdown: msg.clip.markdown,
          collection_id: msg.collectionId,
        })
        return ok(result)
      }
      case 'LIST_COLLECTIONS':
        return ok(await listCollectionsCached())
      case 'GET_SETTINGS_PUBLIC': {
        const s = await loadSettings()
        const pub: SettingsPublic = {
          configured: isConfigured(s),
          baseUrl: s.baseUrl,
          defaultCollectionId: s.defaultCollectionId,
        }
        return ok(pub)
      }
      case 'TEST_CONNECTION': {
        await chrome.storage.session.remove('collections')
        const collections = await listCollectionsCached()
        return ok({ count: collections.length })
      }
      default:
        return fail('Unknown message')
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unexpected error'
    return fail(mapChromeClipError(message))
  }
}

chrome.runtime.onMessage.addListener((msg: WorkerRequest, _sender, sendResponse) => {
  void onMessage(msg).then(sendResponse)
  return true
})

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.removeAll(() => {
    chrome.contextMenus.create({
      id: CONTEXT_MENU_SELECTION,
      title: 'Clip selection to Timothy',
      contexts: ['selection'],
    })
  })
})

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId !== CONTEXT_MENU_SELECTION || !tab?.id) return
  void (async () => {
    try {
      assertHttpTab(tab)
      const tabId = tab.id
      if (tabId === undefined) return
      const res = await extractInTab(tabId, 'selection')
      if (!res.ok) return
      await chrome.storage.session.set({ [SESSION_SELECTION]: { clip: res.data, at: Date.now() } })
      try {
        await chrome.action.openPopup()
      } catch {
        // Popup will pick up the stored selection the next time it opens.
      }
    } catch {
      // Restricted page or no selection: nothing to surface from a context-menu handler.
    }
  })()
})
