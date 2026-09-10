import { describe, expect, it } from 'vitest'

import { connectionLabel, connectionStatus } from './connection'

describe('connectionStatus', () => {
  it('is idle until Timothy settings exist', () => {
    expect(connectionStatus({ configured: false, apiOk: null })).toBe('idle')
    expect(connectionStatus({ configured: false, apiOk: true })).toBe('idle')
  })

  it('is checking while the API probe is in flight', () => {
    expect(connectionStatus({ configured: true, apiOk: null })).toBe('checking')
  })

  it('is online only when configured and the API answered', () => {
    expect(connectionStatus({ configured: true, apiOk: true })).toBe('online')
    expect(connectionStatus({ configured: true, apiOk: false })).toBe('offline')
  })
})

describe('connectionLabel', () => {
  it('names each state for assistive text', () => {
    expect(connectionLabel('online')).toMatch(/Connected/)
    expect(connectionLabel('offline')).toMatch(/Not connected/)
    expect(connectionLabel('checking')).toMatch(/Checking/)
    expect(connectionLabel('idle')).toMatch(/not configured/)
  })
})
