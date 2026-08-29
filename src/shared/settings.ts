import { normalizeBaseUrl } from './url'

export type Settings = {
  baseUrl: string
  token: string
  /** Empty string means auto-classify. */
  defaultCollectionId: string
}

const KEYS = ['baseUrl', 'token', 'defaultCollectionId'] as const

const empty: Settings = { baseUrl: '', token: '', defaultCollectionId: '' }

export function settingsFromUnknown(raw: Record<string, unknown>): Settings {
  return {
    baseUrl: typeof raw.baseUrl === 'string' ? raw.baseUrl : '',
    token: typeof raw.token === 'string' ? raw.token : '',
    defaultCollectionId: typeof raw.defaultCollectionId === 'string' ? raw.defaultCollectionId : '',
  }
}

export function isConfigured(s: Settings): boolean {
  return s.baseUrl !== '' && s.token !== ''
}

export async function loadSettings(): Promise<Settings> {
  const raw = await chrome.storage.local.get([...KEYS])
  return settingsFromUnknown(raw)
}

export async function saveSettings(next: Settings): Promise<Settings> {
  const baseUrl = normalizeBaseUrl(next.baseUrl)
  const token = next.token.trim()
  if (!token) {
    throw new Error('API token is required')
  }
  const settings: Settings = {
    baseUrl,
    token,
    defaultCollectionId: next.defaultCollectionId.trim(),
  }
  await chrome.storage.local.set(settings)
  return settings
}

export { empty as emptySettings }
