export const RESTRICTED_TAB_MESSAGE =
  'You can only clip http or https pages. This tab is restricted.'

export const RESTRICTED_TAB_SHORT = RESTRICTED_TAB_MESSAGE

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
