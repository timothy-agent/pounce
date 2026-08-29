import { describe, expect, it } from 'vitest'

import {
  documentUiUrl,
  isLocalHost,
  normalizeBaseUrl,
  normalizeClipUrl,
  originPattern,
  siteFromUrl,
} from './url'

describe('normalizeClipUrl', () => {
  it('drops fragment and tracking params', () => {
    expect(
      normalizeClipUrl('https://ex.com/a?utm_source=x&fbclid=1&keep=yes#top'),
    ).toBe('https://ex.com/a?keep=yes')
    expect(normalizeClipUrl('https://ex.com/a?gclid=abc&mc_cid=1&mc_eid=2')).toBe('https://ex.com/a')
  })
})

describe('normalizeBaseUrl', () => {
  it('accepts localhost http and strips a trailing slash', () => {
    expect(normalizeBaseUrl('http://localhost:8300/')).toBe('http://localhost:8300')
    expect(normalizeBaseUrl('http://127.0.0.1:8300/')).toBe('http://127.0.0.1:8300')
    expect(normalizeBaseUrl('http://[::1]:8300/')).toBe('http://[::1]:8300')
  })

  it('rejects empty, non-http, and non-localhost http', () => {
    expect(() => normalizeBaseUrl('')).toThrow(/required/)
    expect(() => normalizeBaseUrl('not a url')).toThrow(/full http/)
    expect(() => normalizeBaseUrl('ftp://example.com')).toThrow(/http:\/\/ or https/)
    expect(() => normalizeBaseUrl('http://brain.example.com')).toThrow(/HTTPS/)
  })

  it('accepts https remote URLs', () => {
    expect(normalizeBaseUrl('https://timothy.example.com/')).toBe('https://timothy.example.com')
  })
})

describe('originPattern', () => {
  it('covers the host for optional_host_permissions', () => {
    expect(originPattern('http://localhost:8300')).toBe('http://localhost:8300/*')
  })
})

describe('helpers', () => {
  it('derives site, UI URL, and localhost check', () => {
    expect(siteFromUrl('https://ex.com/a')).toBe('ex.com')
    expect(siteFromUrl('not a url')).toBe('')
    expect(documentUiUrl('https://t.example/', 'abc')).toBe('https://t.example/knowledge/abc')
    expect(isLocalHost('127.0.0.1')).toBe(true)
    expect(isLocalHost('[::1]')).toBe(true)
    expect(isLocalHost('example.com')).toBe(false)
  })
})
