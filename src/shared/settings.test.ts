import { describe, expect, it } from 'vitest'

import { isConfigured, settingsFromUnknown } from './settings'

describe('settingsFromUnknown', () => {
  it('fills defaults for missing keys', () => {
    expect(settingsFromUnknown({})).toEqual({ baseUrl: '', token: '', defaultCollectionId: '' })
    expect(settingsFromUnknown({ baseUrl: 1, token: true, defaultCollectionId: null })).toEqual({
      baseUrl: '',
      token: '',
      defaultCollectionId: '',
    })
    expect(isConfigured(settingsFromUnknown({ baseUrl: 'https://t.example', token: 'x' }))).toBe(true)
    expect(isConfigured(settingsFromUnknown({ baseUrl: 'https://t.example', token: '' }))).toBe(false)
    expect(isConfigured(settingsFromUnknown({ baseUrl: '', token: 'x' }))).toBe(false)
  })
})
