import { useEffect, useMemo, useState } from 'react'
import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

import { callWorker } from '../shared/bridge'
import { connectionStatus } from '../shared/connection'
import { MAX_MARKDOWN_BYTES } from '../shared/constants'
import type { ClipPayload, ClipResult, KbCollection, SettingsPublic } from '../shared/messages'
import { documentUiUrl, utf8Bytes } from '../shared/url'
import { btnPrimary, fieldClass } from '../ui/controls'
import { AppHeader } from '../ui/Header'
import { Notice } from '../ui/Notice'

export function Popup() {
  const [settings, setSettings] = useState<SettingsPublic | null>(null)
  const [apiOk, setApiOk] = useState<boolean | null>(null)
  const [clip, setClip] = useState<ClipPayload | null>(null)
  const [collections, setCollections] = useState<KbCollection[]>([])
  const [collectionId, setCollectionId] = useState('')
  const [tab, setTab] = useState<'edit' | 'preview'>('edit')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(true)
  const [sending, setSending] = useState(false)
  const [result, setResult] = useState<ClipResult | null>(null)

  const status =
    settings === null
      ? 'checking'
      : connectionStatus({ configured: settings.configured, apiOk })

  useEffect(() => {
    void (async () => {
      try {
        const pub = await callWorker<SettingsPublic>({ type: 'GET_SETTINGS_PUBLIC' })
        setSettings(pub)
        if (!pub.configured) {
          setApiOk(false)
          setBusy(false)
          return
        }
        setCollectionId(pub.defaultCollectionId)
        const [extracted, listed] = await Promise.allSettled([
          callWorker<ClipPayload>({ type: 'EXTRACT', mode: 'page' }),
          callWorker<KbCollection[]>({ type: 'LIST_COLLECTIONS' }),
        ])
        if (listed.status === 'fulfilled') {
          setCollections(listed.value)
          setApiOk(true)
        } else {
          setApiOk(false)
        }
        if (extracted.status === 'fulfilled') {
          setClip(extracted.value)
        } else {
          setError(extracted.reason instanceof Error ? extracted.reason.message : 'Could not extract this page')
        }
      } catch (err) {
        setApiOk(false)
        setError(err instanceof Error ? err.message : 'Could not extract this page')
      } finally {
        setBusy(false)
      }
    })()
  }, [])

  const size = clip ? utf8Bytes(clip.markdown) : 0
  const oversize = size > MAX_MARKDOWN_BYTES
  const preview = useMemo(
    () => (
      <Markdown remarkPlugins={[remarkGfm]}>{clip?.markdown ?? ''}</Markdown>
    ),
    [clip?.markdown],
  )

  return (
    <div className="flex flex-col">
      <div className="border-b border-border px-4 py-3">
        <AppHeader status={status} options />
      </div>

      <div className="flex flex-col gap-3 px-4 py-3">
        {busy ? (
        <div className="flex flex-col items-center gap-2 py-10 text-sm text-muted-foreground">
          <span className="size-5 animate-spin rounded-full border-2 border-border border-t-brand" aria-hidden="true" />
          Extracting this tab on this device…
        </div>
      ) : !settings?.configured ? (
        <>
          <Notice kind="info" title="Timothy is not configured">
            Add the base URL and API token to start clipping.
          </Notice>
          <button type="button" className={`${btnPrimary} w-full`} onClick={() => chrome.runtime.openOptionsPage()}>
            Open options
          </button>
        </>
      ) : result ? (
        <>
          <Notice kind="success" title="Queued in Timothy">
            Ingestion is running. The document will show up in the knowledgebase shortly.
          </Notice>
          <a
            className={`${btnPrimary} w-full`}
            href={documentUiUrl(settings.baseUrl, result.document.collection_id)}
            target="_blank"
            rel="noreferrer"
          >
            Open in knowledgebase
          </a>
        </>
      ) : (
        <>
          {status === 'offline' ? (
            <Notice kind="error" title="Cannot reach Timothy">
              Check the base URL and token in Options, then try again.
            </Notice>
          ) : null}
          {error && !clip ? (
            <Notice kind="error" title="Could not clip this page">
              {error}
            </Notice>
          ) : null}
          {clip ? (
            <>
              {clip.weak ? (
                <Notice kind="warning" title="Extraction looks weak">
                  Review the markdown before sending, or select the text you want and use “Clip
                  selection to Timothy”.
                </Notice>
              ) : null}
              <label className="block text-xs font-medium text-muted-foreground">
                Title
                <input
                  className={`${fieldClass} mt-1.5`}
                  value={clip.title}
                  onChange={(e) => setClip({ ...clip, title: e.target.value })}
                  placeholder="Optional"
                />
              </label>
              <label className="block text-xs font-medium text-muted-foreground">
                Collection
                <select
                  className={`${fieldClass} mt-1.5`}
                  value={collectionId}
                  onChange={(e) => setCollectionId(e.target.value)}
                >
                  <option value="">Auto-classify</option>
                  {collections.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </label>
              <p className="text-xs text-muted-foreground">
                {clip.imageCount} {clip.imageCount === 1 ? 'image' : 'images'}, kept as links
                {' · '}
                {(size / 1024).toFixed(1)} KiB
              </p>
              <div className="flex rounded-lg bg-muted p-0.5 text-xs font-medium">
                <button
                  type="button"
                  className={`flex-1 rounded-md px-2 py-1.5 ${tab === 'edit' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground'}`}
                  onClick={() => setTab('edit')}
                >
                  Markdown
                </button>
                <button
                  type="button"
                  className={`flex-1 rounded-md px-2 py-1.5 ${tab === 'preview' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground'}`}
                  onClick={() => setTab('preview')}
                >
                  Preview
                </button>
              </div>
              {tab === 'edit' ? (
                <textarea
                  className={`${fieldClass} min-h-48 resize-y font-mono text-xs leading-5`}
                  value={clip.markdown}
                  onChange={(e) => setClip({ ...clip, markdown: e.target.value })}
                />
              ) : (
                <div className="prose-clip min-h-48 max-h-64 overflow-auto rounded-lg border border-border bg-background px-3 py-2 text-sm">
                  {preview}
                </div>
              )}
              {oversize ? (
                <Notice kind="error" title="Clip is too large">
                  Over the 128 KiB cap. Trim the markdown before sending.
                </Notice>
              ) : null}
              {error && clip ? (
                <Notice kind="error" title="Send failed">
                  {error}
                </Notice>
              ) : null}
              <Notice kind="info" title="Nothing leaves this device until Send">
                Send transmits this tab’s URL, title, and markdown to {settings.baseUrl}.
                Pounce does not bypass logins or paywalls; it only reads the page you opened.
              </Notice>
              <button
                type="button"
                disabled={sending || oversize || !clip.markdown.trim() || status === 'offline'}
                className={`${btnPrimary} w-full`}
                onClick={() => {
                  void (async () => {
                    setSending(true)
                    setError('')
                    try {
                      const saved = await callWorker<ClipResult>({
                        type: 'SEND_CLIP',
                        clip,
                        collectionId,
                      })
                      setResult(saved)
                    } catch (err) {
                      setError(err instanceof Error ? err.message : 'Send failed')
                    } finally {
                      setSending(false)
                    }
                  })()
                }}
              >
                {sending ? 'Sending…' : 'Send to Timothy'}
              </button>
            </>
          ) : null}
        </>
      )}
      </div>
    </div>
  )
}
