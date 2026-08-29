import { originPattern } from './url'

export async function requestHostAccess(baseUrl: string): Promise<void> {
  const origin = originPattern(baseUrl)
  const already = await chrome.permissions.contains({ origins: [origin] })
  if (already) return
  const granted = await chrome.permissions.request({ origins: [origin] })
  if (!granted) {
    throw new Error('Host permission was not granted. Pounce cannot reach Timothy without it.')
  }
}
