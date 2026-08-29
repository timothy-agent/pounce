import { describe, expect, it } from 'vitest'

import {
  isHttpPageUrl,
  mapChromeClipError,
  PAGE_UNREACHABLE_MESSAGE,
  RESTRICTED_TAB_SHORT,
} from './clip-errors'

describe('isHttpPageUrl', () => {
  it('accepts http and https only', () => {
    expect(isHttpPageUrl('https://example.com/a')).toBe(true)
    expect(isHttpPageUrl('http://localhost:8300/')).toBe(true)
    expect(isHttpPageUrl('chrome://extensions')).toBe(false)
    expect(isHttpPageUrl('chrome-extension://abc/popup.html')).toBe(false)
    expect(isHttpPageUrl('about:blank')).toBe(false)
    expect(isHttpPageUrl('')).toBe(false)
  })
})

describe('mapChromeClipError', () => {
  it('maps restricted-tab Chrome errors', () => {
    expect(mapChromeClipError('Cannot access contents of the page')).toBe(RESTRICTED_TAB_SHORT)
    expect(mapChromeClipError('The extensions gallery cannot be scripted')).toBe(RESTRICTED_TAB_SHORT)
    expect(mapChromeClipError('Cannot access chrome://settings')).toBe(RESTRICTED_TAB_SHORT)
    expect(mapChromeClipError('Cannot access about:blank')).toBe(RESTRICTED_TAB_SHORT)
  })

  it('maps a missing content-script receiver', () => {
    expect(mapChromeClipError('Could not establish connection. Receiving end does not exist.')).toBe(
      PAGE_UNREACHABLE_MESSAGE,
    )
  })

  it('leaves other messages unchanged', () => {
    expect(mapChromeClipError('Token rejected. Update it in Options.')).toBe(
      'Token rejected. Update it in Options.',
    )
  })
})
