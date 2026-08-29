const TRACKING_PARAMS = new Set(['fbclid', 'gclid', 'mc_cid', 'mc_eid'])

export function utf8Bytes(s: string): number {
  return new TextEncoder().encode(s).length
}

export function siteFromUrl(url: string): string {
  try {
    return new URL(url).hostname
  } catch {
    return ''
  }
}

/** Strip fragment and common tracking params. Timothy also dedups; this keeps the payload clean. */
export function normalizeClipUrl(raw: string): string {
  const u = new URL(raw)
  u.hash = ''
  const keys = Array.from(u.searchParams.keys())
  for (const key of keys) {
    if (key.startsWith('utm_') || TRACKING_PARAMS.has(key.toLowerCase())) {
      u.searchParams.delete(key)
    }
  }
  return u.toString()
}

export function originPattern(baseUrl: string): string {
  const u = new URL(baseUrl)
  return `${u.protocol}//${u.host}/*`
}

export function isLocalHost(hostname: string): boolean {
  return hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '[::1]'
}

export function normalizeBaseUrl(input: string): string {
  const trimmed = input.trim().replace(/\/+$/, '')
  if (!trimmed) {
    throw new Error('Base URL is required')
  }
  let u: URL
  try {
    u = new URL(trimmed)
  } catch {
    throw new Error('Base URL must be a full http:// or https:// URL')
  }
  if (u.protocol !== 'http:' && u.protocol !== 'https:') {
    throw new Error('Base URL must be http:// or https://')
  }
  if (!isLocalHost(u.hostname) && u.protocol !== 'https:') {
    throw new Error('Non-localhost URLs must use HTTPS')
  }
  u.hash = ''
  u.search = ''
  return u.toString().replace(/\/+$/, '')
}

export function documentUiUrl(baseUrl: string, collectionId: string): string {
  return `${baseUrl.replace(/\/+$/, '')}/knowledge/${collectionId}`
}
