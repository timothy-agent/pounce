import { useEffect, useMemo, useState } from 'react'
import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

import { callWorker } from '../shared/bridge'
import { connectionStatus } from '../shared/connection'
import { MAX_MARKDOWN_BYTES } from '../shared/constants'
import { formatClip, markdownFilename } from '../shared/markdown'
import type { ClipPayload, ClipResult, KbCollection, SettingsPublic } from '../shared/messages'
import { TimothyGlyph } from '../shared/TimothyGlyph'
import { documentUiUrl, utf8Bytes } from '../shared/url'
import { btnIcon, btnPrimary, btnSecondary, fieldClass } from '../ui/controls'
import { AppHeader } from '../ui/Header'
import { Notice } from '../ui/Notice'

async function saveMarkdownFile(clip: ClipPayload): Promise<void> {
  const blob = new Blob([formatClip(clip)], { type: 'text/markdown;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  await chrome.downloads.download({
    url,
    filename: markdownFilename(clip.title),
    saveAs: true,
  })
  window.setTimeout(() => URL.revokeObjectURL(url), 60_000)
}

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
  const [flash, setFlash] = useState<'copied' | 'saved' | ''>('')

  const configured = settings?.configured === true
  const status = settings === null ? 'idle' : connectionStatus({ configured, apiOk })

  useEffect(() => {
    void (async () => {
      try {
        const pub = await callWorker<SettingsPublic>({ type: 'GET_SETTINGS_PUBLIC' })
        setSettings(pub)
        setCollectionId(pub.defaultCollectionId)
        const jobs: Array<Promise<unknown>> = [callWorker<ClipPayload>({ type: 'EXTRACT', mode: 'page' })]
        if (pub.configured) {
          jobs.push(callWorker<KbCollection[]>({ type: 'LIST_COLLECTIONS' }))
        }
        const settled = await Promise.allSettled(jobs)
        const page = settled[0]
        if (page.status === 'fulfilled') {
          setClip(page.value as ClipPayload)
        } else {
          setError(page.reason instanceof Error ? page.reason.message : 'Could not extract this page')
        }
        if (pub.configured) {
          const listed = settled[1]
          if (listed?.status === 'fulfilled') {
            setCollections(listed.value as KbCollection[])
            setApiOk(true)
          } else {
            setApiOk(false)
          }
        } else {
          setApiOk(false)
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
  const canAct = Boolean(clip?.markdown.trim())
  const preview = useMemo(
    () => <Markdown remarkPlugins={[remarkGfm]}>{clip?.markdown ?? ''}</Markdown>,
    [clip?.markdown],
  )

  function flashOk(kind: 'copied' | 'saved') {
    setFlash(kind)
    setError('')
  }

  useEffect(() => {
    if (!flash) return
    const t = window.setTimeout(() => setFlash(''), 2500)
    return () => window.clearTimeout(t)
  }, [flash])

  return (
    <div className="flex flex-col">
      <div className="border-b border-border px-4 py-3">
        <AppHeader status={status} options />
      </div>

      <div className="flex flex-col gap-3 px-4 py-3">
        {busy ? (
          <div className="flex flex-col items-center gap-2 py-10 text-sm text-muted-foreground">
            <span
              className="motion-keep size-5 animate-spin rounded-full border-2 border-border border-t-brand"
              aria-hidden="true"
            />
            Extracting this tab...
          </div>
        ) : (
          <>
            {error && !clip ? (
              <Notice kind="error" title="Could not clip this page">
                {error}
              </Notice>
            ) : null}
            {clip ? (
              <>
                {result ? (
                  <Notice kind="success" title="Queued in Timothy">
                    Ingestion is running.{' '}
                    <a
                      className="font-medium text-brand-text underline underline-offset-2"
                      href={documentUiUrl(settings?.baseUrl ?? '', result.document.collection_id)}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Open in knowledgebase
                    </a>
                  </Notice>
                ) : null}
                {flash === 'copied' ? <Notice kind="success" title="Copied for LLM" /> : null}
                {flash === 'saved' ? <Notice kind="success" title="Saved as Markdown" /> : null}
                {clip.weak ? (
                  <Notice kind="warning" title="Extraction looks weak">
                    Review the markdown before you copy or save. Or select text and use
                    &quot;Clip selection with Pounce&quot;.
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
                {configured ? (
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
                ) : null}
                <p className="text-xs text-muted-foreground">
                  {clip.imageCount} {clip.imageCount === 1 ? 'image' : 'images'}, kept as links
                  {' · '}
                  {(size / 1024).toFixed(1)} KiB
                </p>
                <div className="flex rounded-md border border-input bg-card p-0.5 text-xs font-medium">
                  <button
                    type="button"
                    className={`flex-1 px-2 py-1.5 ${tab === 'edit' ? 'bg-foreground font-medium text-background' : 'text-muted-foreground'}`}
                    onClick={() => setTab('edit')}
                  >
                    Markdown
                  </button>
                  <button
                    type="button"
                    className={`flex-1 px-2 py-1.5 ${tab === 'preview' ? 'bg-foreground font-medium text-background' : 'text-muted-foreground'}`}
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
                  <div className="prose-clip min-h-48 max-h-64 overflow-auto border border-border bg-background px-3 py-2 text-sm">
                    {preview}
                  </div>
                )}
                {configured && oversize ? (
                  <Notice kind="error" title="Clip is too large for Timothy">
                    Over the 128 KiB cap. Trim the markdown before sending. Copy and save still work.
                  </Notice>
                ) : null}
                {error && clip ? (
                  <Notice kind="error" title="Action failed">
                    {error}
                  </Notice>
                ) : null}
                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={!canAct}
                    className={`${btnPrimary} min-w-0 flex-1`}
                    onClick={() => {
                      void (async () => {
                        try {
                          await navigator.clipboard.writeText(formatClip(clip))
                          flashOk('copied')
                        } catch (err) {
                          setError(err instanceof Error ? err.message : 'Copy failed')
                        }
                      })()
                    }}
                  >
                    Copy for LLM
                  </button>
                  <button
                    type="button"
                    disabled={!canAct}
                    className={`${btnSecondary} min-w-0 flex-1`}
                    onClick={() => {
                      void (async () => {
                        try {
                          await saveMarkdownFile(clip)
                          flashOk('saved')
                        } catch (err) {
                          setError(err instanceof Error ? err.message : 'Save failed')
                        }
                      })()
                    }}
                  >
                    Save as Markdown
                  </button>
                  {configured ? (
                    <button
                      type="button"
                      disabled={sending || oversize || !canAct || status === 'offline'}
                      className={btnIcon}
                      title="Send to Timothy"
                      aria-label={sending ? 'Sending to Timothy' : 'Send to Timothy'}
                      onClick={() => {
                        void (async () => {
                          setSending(true)
                          setError('')
                          setFlash('')
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
                      {sending ? (
                        <span
                          className="motion-keep size-4 animate-spin rounded-full border-2 border-border border-t-brand"
                          aria-hidden="true"
                        />
                      ) : (
                        <TimothyGlyph className="size-5" />
                      )}
                    </button>
                  ) : null}
                </div>
                <p className="text-[11px] leading-4 text-muted-foreground">
                  Copy and save stay on this device.
                  {configured
                    ? ` The Timothy icon sends URL, title, and markdown to ${settings?.baseUrl}.`
                    : ' Connect Timothy in Options if you want to send clips there.'}
                </p>
              </>
            ) : null}
          </>
        )}
      </div>
    </div>
  )
}
