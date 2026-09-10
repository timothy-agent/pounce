import { useEffect, useState, type FormEvent } from 'react'

import { callWorker } from '../shared/bridge'
import { connectionStatus, type ConnectionStatus } from '../shared/connection'
import { PRIVACY_POLICY_URL, TIMOTHY_GITHUB_URL } from '../shared/constants'
import type { KbCollection } from '../shared/messages'
import { requestHostAccess } from '../shared/permissions'
import { clearTimothySettings, isConfigured, loadSettings, saveSettings } from '../shared/settings'
import { normalizeBaseUrl, originPattern } from '../shared/url'
import { btnPrimary, btnSecondary, fieldClass } from '../ui/controls'
import { AppHeader } from '../ui/Header'
import { Notice } from '../ui/Notice'

export function Options() {
  const [baseUrl, setBaseUrl] = useState('')
  const [token, setToken] = useState('')
  const [tokenSaved, setTokenSaved] = useState(false)
  const [defaultCollectionId, setDefaultCollectionId] = useState('')
  const [collections, setCollections] = useState<KbCollection[]>([])
  const [status, setStatus] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [apiOk, setApiOk] = useState<boolean | null>(null)
  const [configured, setConfigured] = useState(false)
  const [ready, setReady] = useState(false)
  const [consent, setConsent] = useState(false)

  const connection: ConnectionStatus = ready
    ? connectionStatus({ configured, apiOk })
    : 'checking'

  useEffect(() => {
    void (async () => {
      const s = await loadSettings()
      setBaseUrl(s.baseUrl)
      setDefaultCollectionId(s.defaultCollectionId)
      setTokenSaved(s.token.length > 0)
      const hasCreds = isConfigured(s)
      setConfigured(hasCreds)
      if (!hasCreds) {
        setApiOk(false)
        setReady(true)
        return
      }
      try {
        const cols = await callWorker<KbCollection[]>({ type: 'LIST_COLLECTIONS' })
        setCollections(cols)
        setApiOk(true)
      } catch {
        setApiOk(false)
      } finally {
        setReady(true)
      }
    })()
  }, [])

  async function onSave(e: FormEvent) {
    e.preventDefault()
    if (!configured && !consent) return
    setError('')
    setStatus('')
    setBusy(true)
    try {
      const existing = await loadSettings()
      const nextToken = token.trim() || existing.token
      const normalized = normalizeBaseUrl(baseUrl)
      await requestHostAccess(normalized)
      await saveSettings({
        baseUrl: normalized,
        token: nextToken,
        defaultCollectionId,
      })
      setBaseUrl(normalized)
      setToken('')
      setTokenSaved(true)
      setConfigured(true)
      setStatus('Timothy connection saved on this device.')
      try {
        const cols = await callWorker<KbCollection[]>({ type: 'LIST_COLLECTIONS' })
        setCollections(cols)
        setApiOk(true)
      } catch {
        setApiOk(false)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed')
    } finally {
      setBusy(false)
    }
  }

  async function onTest() {
    setError('')
    setStatus('')
    setBusy(true)
    try {
      const { count } = await callWorker<{ count: number }>({ type: 'TEST_CONNECTION' })
      const cols = await callWorker<KbCollection[]>({ type: 'LIST_COLLECTIONS' })
      setCollections(cols)
      setConfigured(true)
      setApiOk(true)
      setStatus(`Connected. ${count} ${count === 1 ? 'collection' : 'collections'} available.`)
    } catch (err) {
      setApiOk(false)
      setError(err instanceof Error ? err.message : 'Connection failed')
    } finally {
      setBusy(false)
    }
  }

  async function onDisconnect() {
    setError('')
    setStatus('')
    setBusy(true)
    try {
      const existing = await loadSettings()
      if (existing.baseUrl) {
        try {
          await chrome.permissions.remove({ origins: [originPattern(existing.baseUrl)] })
        } catch {
          // Permission may already be gone.
        }
      }
      await clearTimothySettings()
      await chrome.storage.session.remove('collections')
      setBaseUrl('')
      setToken('')
      setTokenSaved(false)
      setDefaultCollectionId('')
      setCollections([])
      setConfigured(false)
      setApiOk(false)
      setConsent(false)
      setStatus('Timothy disconnected. Copy and save still work.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Disconnect failed')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="min-h-full bg-muted/40">
      <div className="mx-auto flex max-w-lg flex-col gap-5 p-8">
        <AppHeader
          status={connection}
          subtitle="Clip pages as markdown for LLMs. Timothy is optional."
        />

        <Notice kind="info" title="What Pounce stores and sends">
          Copy for LLM and Save as Markdown stay on this device. Timothy URL and API token, if you
          add them, also stay here. Nothing is sent off-device unless you click the Timothy icon.{' '}
          <a
            className="font-medium text-brand-text underline underline-offset-2"
            href={PRIVACY_POLICY_URL}
            target="_blank"
            rel="noreferrer"
          >
            Privacy policy
          </a>
        </Notice>

        {ready && configured && apiOk === false && !error ? (
          <Notice kind="warning" title="Timothy did not respond">
            Settings may still be saved. Check the URL and token, then test the connection.
          </Notice>
        ) : null}

        <form
          className="flex flex-col gap-4 border border-border bg-background p-5"
          onSubmit={(e) => void onSave(e)}
        >
          <div>
            <p className="text-sm font-semibold">Timothy</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Optional. Connect your instance to send clips from the popup icon.
            </p>
          </div>

          <label className="block text-sm font-medium">
            Base URL
            <input
              className={`${fieldClass} mt-1.5`}
              placeholder="https://timothy.example.com"
              value={baseUrl}
              onChange={(e) => setBaseUrl(e.target.value)}
              autoComplete="off"
              spellCheck={false}
            />
            <span className="mt-1.5 block text-xs font-normal text-muted-foreground">
              The URL you open Timothy in. HTTPS required except localhost.
            </span>
          </label>

          <label className="block text-sm font-medium">
            API token
            <input
              className={`${fieldClass} mt-1.5`}
              type="password"
              placeholder={tokenSaved ? '••••••••  (leave blank to keep)' : ''}
              value={token}
              onChange={(e) => setToken(e.target.value)}
              autoComplete="off"
            />
            <span className="mt-1.5 block text-xs font-normal text-muted-foreground">
              Stored only on this device. Never synced. Same bearer token as the Timothy admin API.
            </span>
          </label>

          <label className="block text-sm font-medium">
            Default collection
            <select
              className={`${fieldClass} mt-1.5`}
              value={defaultCollectionId}
              onChange={(e) => setDefaultCollectionId(e.target.value)}
            >
              <option value="">Auto-classify</option>
              {collections.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>

          {error ? (
            <Notice kind="error" title="Something went wrong">
              {error}
            </Notice>
          ) : null}
          {status ? (
            <Notice kind="success" title="All set">
              {status}
            </Notice>
          ) : null}

          {!configured ? (
            <label className="flex items-start gap-2 text-sm leading-5">
              <input
                type="checkbox"
                className="mt-0.5"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
              />
              <span>
                I agree. Pounce may store these settings on this device. When I click the Timothy
                icon, it may send that page only to this Timothy URL.
              </span>
            </label>
          ) : null}

          <div className="flex flex-wrap gap-2">
            <button type="submit" disabled={busy || (!configured && !consent)} className={btnPrimary}>
              {busy ? 'Working...' : 'Save'}
            </button>
            <button type="button" disabled={busy || !configured} className={btnSecondary} onClick={() => void onTest()}>
              Test connection
            </button>
            {configured ? (
              <button type="button" disabled={busy} className={btnSecondary} onClick={() => void onDisconnect()}>
                Disconnect
              </button>
            ) : null}
          </div>
        </form>

        <p className="text-center text-xs text-muted-foreground">
          <a
            className="font-medium underline underline-offset-2"
            href={TIMOTHY_GITHUB_URL}
            target="_blank"
            rel="noreferrer"
          >
            Timothy on GitHub
          </a>
        </p>
      </div>
    </div>
  )
}
