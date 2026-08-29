export type ConnectionStatus = 'checking' | 'online' | 'offline'

export function connectionStatus(opts: { configured: boolean; apiOk: boolean | null }): ConnectionStatus {
  if (!opts.configured) return 'offline'
  if (opts.apiOk === null) return 'checking'
  return opts.apiOk ? 'online' : 'offline'
}

export function connectionLabel(status: ConnectionStatus): string {
  switch (status) {
    case 'online':
      return 'Connected to Timothy'
    case 'offline':
      return 'Not connected to Timothy'
    case 'checking':
      return 'Checking Timothy connection'
  }
}
