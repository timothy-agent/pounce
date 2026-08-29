import { MAX_MARKDOWN_BYTES } from './constants'
import type { ClipDocument, ClipRequest, ClipResult, KbCollection } from './messages'
import { utf8Bytes } from './url'

export class ApiError extends Error {
  readonly status: number
  readonly code: string

  constructor(status: number, code: string, message: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
  }
}

type FetchLike = typeof fetch

export type TimothyClient = {
  listCollections: () => Promise<KbCollection[]>
  clip: (body: ClipRequest) => Promise<ClipResult>
}

function joinUrl(baseUrl: string, path: string): string {
  return `${baseUrl.replace(/\/+$/, '')}${path}`
}

async function readError(res: Response): Promise<ApiError> {
  const body = await res.text().catch(() => '')
  let code = 'http_error'
  let message = body || `request failed (${res.status})`
  try {
    const parsed = JSON.parse(body) as { error?: string; message?: string }
    if (parsed.error) code = parsed.error
    if (parsed.message) message = parsed.message
  } catch {
    // Non-JSON body: keep the raw text.
  }
  if (res.status === 401) {
    return new ApiError(401, code, 'Token rejected. Update it on the options page.')
  }
  if (res.status === 413) {
    return new ApiError(413, code, 'Clip is too large. Trim the markdown and retry.')
  }
  return new ApiError(res.status, code, message)
}

export function clipPayload(body: ClipRequest): ClipRequest {
  const payload: ClipRequest = {
    url: body.url,
    markdown: body.markdown,
    title: body.title ?? '',
  }
  const collectionId = body.collection_id?.trim()
  if (collectionId) payload.collection_id = collectionId
  return payload
}

export function assertMarkdownSize(markdown: string): void {
  if (!markdown.trim()) {
    throw new ApiError(400, 'bad_request', 'Markdown is empty. Select the text you want, or review the extraction.')
  }
  if (utf8Bytes(markdown) > MAX_MARKDOWN_BYTES) {
    throw new ApiError(
      413,
      'too_large',
      `Markdown is ${(utf8Bytes(markdown) / 1024).toFixed(1)} KiB; Timothy caps clips at 128 KiB. Trim it before sending.`,
    )
  }
}

export function createClient(opts: { baseUrl: string; token: string; fetch?: FetchLike }): TimothyClient {
  const fetchFn = opts.fetch ?? globalThis.fetch.bind(globalThis)
  const headers = {
    Authorization: `Bearer ${opts.token}`,
    Accept: 'application/json',
    'Content-Type': 'application/json',
  }

  async function request<T>(path: string, init?: RequestInit): Promise<{ data: T; status: number }> {
    let res: Response
    try {
      res = await fetchFn(joinUrl(opts.baseUrl, path), { ...init, headers: { ...headers, ...init?.headers } })
    } catch {
      throw new ApiError(
        0,
        'unreachable',
        'Timothy is unreachable. Check the base URL and that the instance is running.',
      )
    }
    if (!res.ok) {
      throw await readError(res)
    }
    if (res.status === 204) {
      return { data: undefined as T, status: res.status }
    }
    return { data: (await res.json()) as T, status: res.status }
  }

  return {
    async listCollections() {
      const { data } = await request<{ collections: KbCollection[] }>('/v1/admin/kb/collections')
      return data.collections ?? []
    },
    async clip(body) {
      assertMarkdownSize(body.markdown)
      const { data } = await request<ClipDocument>('/v1/admin/kb/documents/clip', {
        method: 'POST',
        body: JSON.stringify(clipPayload(body)),
      })
      return { document: data }
    },
  }
}
