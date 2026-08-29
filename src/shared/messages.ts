export type ClipPayload = {
  title: string
  byline: string
  markdown: string
  url: string
  weak: boolean
  imageCount: number
}

export type KbCollection = {
  id: string
  name: string
  description: string
  doc_count: number
  chunk_count: number
  failed_count: number
  created_at: string
  updated_at: string
}

export type ClipDocument = {
  id: string
  collection_id: string
  title: string
  source_type: string
  source_ref: string
  status: string
  error: string
  chunk_count: number
  bytes: number
  ingested_at: string | null
  created_at: string
}

export type ClipRequest = {
  url: string
  markdown: string
  title?: string
  collection_id?: string
}

export type ClipResult = {
  document: ClipDocument
}

export type ExtractMode = 'page' | 'selection'

export type WorkerRequest =
  | { type: 'EXTRACT'; mode: ExtractMode }
  | { type: 'SEND_CLIP'; clip: ClipPayload; collectionId?: string }
  | { type: 'LIST_COLLECTIONS' }
  | { type: 'GET_SETTINGS_PUBLIC' }
  | { type: 'TEST_CONNECTION' }

export type SettingsPublic = {
  configured: boolean
  baseUrl: string
  defaultCollectionId: string
}

export type WorkerSuccess<T> = { ok: true; data: T }
export type WorkerFailure = { ok: false; error: string }
export type WorkerResponse<T> = WorkerSuccess<T> | WorkerFailure

export type ContentExtractRequest = { type: 'POUNCE_EXTRACT'; mode: ExtractMode }
export type ContentExtractResponse = WorkerResponse<ClipPayload>
