export const RESTRICTED_TAB_MESSAGE =
  'Can only clip http(s) pages. This tab is restricted (chrome://, Web Store, PDF viewer, …).'

export const RESTRICTED_TAB_SHORT = 'Can only clip http(s) pages. This tab is restricted.'

export const PAGE_UNREACHABLE_MESSAGE = 'Could not reach this page. Reload the tab and try again.'

export function isHttpPageUrl(url: string): boolean {
  return /^https?:/i.test(url)
}

/** Map Chrome's raw scripting/messaging errors to operator-facing copy. */
export function mapChromeClipError(message: string): string {
  if (/Cannot access|The extensions gallery|chrome:\/\/|about:/.test(message)) {
    return RESTRICTED_TAB_SHORT
  }
  if (/Receiving end does not exist/.test(message)) {
    return PAGE_UNREACHABLE_MESSAGE
  }
  return message
}
