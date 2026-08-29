import { describe, expect, it, vi } from 'vitest'

import { ApiError, assertMarkdownSize, clipPayload, createClient } from './api'
import { MAX_MARKDOWN_BYTES } from './constants'

const doc = {
  id: 'd1',
  collection_id: 'c1',
  title: 'T',
  source_type: 'clip',
  source_ref: 'https://ex.com/a',
  status: 'pending',
  error: '',
  chunk_count: 0,
  bytes: 12,
  ingested_at: null,
  created_at: '2026-08-29T10:00:00Z',
}

describe('createClient', () => {
  it('sends the bearer token and posts the clip body', async () => {
    const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      expect(String(input)).toBe('https://t.example/v1/admin/kb/documents/clip')
      expect(init?.method).toBe('POST')
      const headers = new Headers(init?.headers)
      expect(headers.get('Authorization')).toBe('Bearer secret-token')
      const body = JSON.parse(String(init?.body)) as { url: string; markdown: string; collection_id?: string }
      expect(body.url).toBe('https://ex.com/a')
      expect(body.markdown).toContain('hello')
      expect(body).not.toHaveProperty('collection_id')
      expect(body).not.toHaveProperty('site')
      expect(body).not.toHaveProperty('captured_at')
      return new Response(JSON.stringify(doc), { status: 202, headers: { 'Content-Type': 'application/json' } })
    })
    const client = createClient({ baseUrl: 'https://t.example/', token: 'secret-token', fetch: fetchMock })
    const result = await client.clip({
      url: 'https://ex.com/a',
      title: 'T',
      markdown: 'hello',
    })
    expect(result.document.id).toBe('d1')
    expect(result.document.status).toBe('pending')
  })

  it('maps 401 and network failure', async () => {
    const unauthorized = createClient({
      baseUrl: 'https://t.example',
      token: 'bad',
      fetch: async () =>
        new Response(JSON.stringify({ error: 'unauthorized', message: 'nope' }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        }),
    })
    await expect(unauthorized.listCollections()).rejects.toMatchObject({
      status: 401,
      message: expect.stringContaining('Token rejected'),
    })

    const down = createClient({
      baseUrl: 'https://t.example',
      token: 't',
      fetch: async () => {
        throw new TypeError('Failed to fetch')
      },
    })
    await expect(down.listCollections()).rejects.toBeInstanceOf(ApiError)
  })

  it('reads collections from the wrapped list payload', async () => {
    let collectionsUrl = ''
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      collectionsUrl = String(input)
      return new Response(JSON.stringify({ collections: [{ id: 'c1', name: 'Notes' }] }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    })
    const client = createClient({ baseUrl: 'https://t.example', token: 't', fetch: fetchMock })
    const rows = await client.listCollections()
    expect(rows).toEqual([{ id: 'c1', name: 'Notes' }])
    expect(collectionsUrl).toBe('https://t.example/v1/admin/kb/collections')
  })

  it('treats a missing collections array as empty', async () => {
    const client = createClient({
      baseUrl: 'https://t.example',
      token: 't',
      fetch: async () =>
        new Response(JSON.stringify({}), { status: 200, headers: { 'Content-Type': 'application/json' } }),
    })
    await expect(client.listCollections()).resolves.toEqual([])
  })

  it('maps 413 and a JSON 500', async () => {
    const tooBig = createClient({
      baseUrl: 'https://t.example',
      token: 't',
      fetch: async () =>
        new Response(JSON.stringify({ error: 'too_large', message: 'payload too large' }), {
          status: 413,
          headers: { 'Content-Type': 'application/json' },
        }),
    })
    await expect(tooBig.listCollections()).rejects.toMatchObject({
      status: 413,
      message: 'Clip is too large. Trim the markdown and retry.',
    })

    const boom = createClient({
      baseUrl: 'https://t.example',
      token: 't',
      fetch: async () =>
        new Response(JSON.stringify({ error: 'internal', message: 'brain down' }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }),
    })
    await expect(boom.listCollections()).rejects.toMatchObject({ status: 500, code: 'internal', message: 'brain down' })
  })
})

describe('clipPayload', () => {
  const base = {
    url: 'https://ex.com/a',
    markdown: 'hello',
  }

  it('omits collection_id when absent or blank so Timothy can auto-classify', () => {
    expect(clipPayload(base)).not.toHaveProperty('collection_id')
    expect(clipPayload({ ...base, collection_id: '' })).not.toHaveProperty('collection_id')
    expect(clipPayload({ ...base, collection_id: '  ' })).not.toHaveProperty('collection_id')
  })

  it('keeps a real collection_id', () => {
    expect(clipPayload({ ...base, collection_id: 'c1' }).collection_id).toBe('c1')
  })

  it('sends title even when empty and never sends site or captured_at', () => {
    expect(clipPayload(base)).toEqual({ url: base.url, markdown: base.markdown, title: '' })
    expect(clipPayload({ ...base, title: '' })).toEqual({ url: base.url, markdown: base.markdown, title: '' })
    expect(clipPayload({ ...base, title: 'Hello' }).title).toBe('Hello')
    expect(clipPayload({ ...base, title: 'Hello' })).not.toHaveProperty('site')
    expect(clipPayload({ ...base, title: 'Hello' })).not.toHaveProperty('captured_at')
  })
})

describe('assertMarkdownSize', () => {
  it('rejects empty and oversized markdown', () => {
    expect(() => assertMarkdownSize('  ')).toThrow(/empty/)
    expect(() => assertMarkdownSize('ok')).not.toThrow()
    expect(() => assertMarkdownSize('x'.repeat(MAX_MARKDOWN_BYTES + 1))).toThrow(/128 KiB/)
  })
})
