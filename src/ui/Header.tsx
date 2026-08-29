import { BrandMark } from '../shared/BrandMark'
import { connectionLabel, type ConnectionStatus } from '../shared/connection'

export function ConnectionDot({ status }: { status: ConnectionStatus }) {
  const color =
    status === 'online' ? 'bg-good' : status === 'offline' ? 'bg-destructive' : 'bg-muted-foreground/50'
  const ping = status === 'checking' ? 'animate-pulse' : status === 'online' ? '' : ''
  return (
    <span className="inline-flex items-center gap-1.5" title={connectionLabel(status)}>
      <span className="relative flex size-2.5">
        {status === 'online' ? (
          <span className="absolute inline-flex size-full animate-ping rounded-full bg-good opacity-40" />
        ) : null}
        <span className={`relative inline-flex size-2.5 rounded-full ${color} ${ping}`} />
      </span>
      <span className="sr-only">{connectionLabel(status)}</span>
    </span>
  )
}

export function AppHeader({
  status,
  options,
  subtitle,
}: {
  status: ConnectionStatus
  options?: boolean
  subtitle?: string
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex min-w-0 items-center gap-2.5">
        <BrandMark className="size-7 shrink-0" />
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold tracking-tight">Pounce</p>
            <ConnectionDot status={status} />
          </div>
          {subtitle ? <p className="text-xs text-muted-foreground">{subtitle}</p> : null}
        </div>
      </div>
      {options ? (
        <button
          type="button"
          className="shrink-0 rounded-md px-2 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          onClick={() => chrome.runtime.openOptionsPage()}
        >
          Options
        </button>
      ) : null}
    </div>
  )
}
