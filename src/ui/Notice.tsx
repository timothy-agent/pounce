import type { ReactNode } from 'react'

export type NoticeKind = 'error' | 'warning' | 'success' | 'info'

const tone: Record<NoticeKind, string> = {
  error: 'border-l-destructive',
  warning: 'border-l-warning',
  success: 'border-l-good',
  info: 'border-l-info',
}

const iconClass: Record<NoticeKind, string> = {
  error: 'text-destructive',
  warning: 'text-warning',
  success: 'text-good',
  info: 'text-info',
}

function Icon({ kind }: { kind: NoticeKind }) {
  const common = `mt-0.5 size-4 shrink-0 ${iconClass[kind]}`
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
      className={`relative grid grid-cols-[16px_1fr] gap-x-3 rounded-md border border-border border-l-[3px] bg-card p-3 text-sm ${tone[kind]}`}
    >
      <Icon kind={kind} />
      <div className="min-w-0 leading-5">
        {title ? <p className="font-semibold">{title}</p> : null}
        {children ? <div className={title ? 'mt-0.5 text-muted-foreground' : ''}>{children}</div> : null}
      </div>
    </div>
  )
}
