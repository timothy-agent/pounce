import type { ReactNode } from 'react'

export type NoticeKind = 'error' | 'warning' | 'success' | 'info'

const styles: Record<NoticeKind, string> = {
  error:
    'border-destructive/25 bg-destructive-soft text-destructive-soft-foreground',
  warning: 'border-warning/30 bg-warning-soft text-warning-soft-foreground',
  success: 'border-good/30 bg-good-soft text-good',
  info: 'border-border bg-muted text-foreground',
}

const accent: Record<NoticeKind, string> = {
  error: 'bg-destructive',
  warning: 'bg-warning',
  success: 'bg-good',
  info: 'bg-muted-foreground/40',
}

function Icon({ kind }: { kind: NoticeKind }) {
  const common = 'mt-0.5 size-4 shrink-0 opacity-90'
  if (kind === 'success') {
    return (
      <svg viewBox="0 0 16 16" fill="none" className={common} aria-hidden="true">
        <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" />
        <path d="M5 8.2 7 10.2 11 5.8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    )
  }
  if (kind === 'error') {
    return (
      <svg viewBox="0 0 16 16" fill="none" className={common} aria-hidden="true">
        <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" />
        <path d="M8 5v3.5M8 11h.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    )
  }
  if (kind === 'warning') {
    return (
      <svg viewBox="0 0 16 16" fill="none" className={common} aria-hidden="true">
        <path d="M8 2.5 14.5 13.5H1.5L8 2.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M8 7v3M8 12h.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    )
  }
  return (
    <svg viewBox="0 0 16 16" fill="none" className={common} aria-hidden="true">
      <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" />
      <path d="M8 7.2v4M8 5h.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

export function Notice({
  kind,
  title,
  children,
}: {
  kind: NoticeKind
  title?: string
  children?: ReactNode
}) {
  return (
    <div
      role={kind === 'error' ? 'alert' : 'status'}
      className={`relative overflow-hidden rounded-lg border ${styles[kind]}`}
    >
      <div className={`absolute inset-y-0 left-0 w-1 ${accent[kind]}`} />
      <div className="flex gap-2.5 px-3 py-2.5 pl-3.5">
        <Icon kind={kind} />
        <div className="min-w-0 text-sm leading-5">
          {title ? <p className="font-medium">{title}</p> : null}
          {children ? <div className={title ? 'mt-0.5 opacity-90' : ''}>{children}</div> : null}
        </div>
      </div>
    </div>
  )
}
