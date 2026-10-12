import { Readability } from '@mozilla/readability'
import TurndownService from 'turndown'
import { gfm } from 'turndown-plugin-gfm'

import { tidyMarkdown, countMarkdownImages } from './markdown'
import type { ClipPayload } from './messages'
import { normalizeClipUrl } from './url'

const turndown = new TurndownService({
  headingStyle: 'atx',
  hr: '---',
  bulletListMarker: '-',
  codeBlockStyle: 'fenced',
  emDelimiter: '*',
})
turndown.use(gfm)

const WEAK_MIN_CHARS = 120
const NOISE_MARKERS = [
  'people you may know',
  'grow your network',
  'see who viewed your profile',
  'linkedin corporation',
  'linkedin nav',
  'news feed',
]

function hostFromUrl(pageUrl: string): string {
  try {
    return new URL(pageUrl).hostname.toLowerCase()
  } catch {
    return ''
  }
}

function stripDocSuffix(title: string): string {
  return title.replace(/\s*-\s*google docs\s*$/i, '').trim()
}

function isLinkedInHost(host: string): boolean {
  return host === 'linkedin.com' || host.endsWith('.linkedin.com')
}

function resolveAttr(el: Element, attr: string, baseUrl: string): void {
  const v = el.getAttribute(attr)
  if (!v || v.startsWith('#') || /^(mailto:|javascript:|data:)/i.test(v)) return
  try {
    el.setAttribute(attr, new URL(v, baseUrl).href)
  } catch {
    // leave unresolved
  }
}

function absolutize(root: ParentNode, baseUrl: string): void {
  for (const el of root.querySelectorAll('[href]')) resolveAttr(el, 'href', baseUrl)
  for (const el of root.querySelectorAll('[src]')) resolveAttr(el, 'src', baseUrl)
}

function htmlToMarkdown(doc: Document, html: string, baseUrl: string): string {
  const wrap = doc.createElement('div')
  wrap.innerHTML = html
  absolutize(wrap, baseUrl)
  return tidyMarkdown(turndown.turndown(wrap.innerHTML))
}

function wordCount(markdown: string): number {
  const plain = markdown
    .replace(/!\[[^\]]*]\([^)]+\)/g, ' ')
    .replace(/\[[^\]]+]\([^)]+\)/g, ' ')
    .replace(/[`#>*_|-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
  if (!plain) return 0
  return plain.split(' ').filter(Boolean).length
}

function looksWeak(markdown: string): boolean {
  const lower = markdown.toLowerCase()
  const chars = markdown.trim().length
  if (chars < WEAK_MIN_CHARS) return true
  const words = wordCount(markdown)
  if (words < 30) return true
  const noiseHits = NOISE_MARKERS.reduce((n, marker) => n + (lower.includes(marker) ? 1 : 0), 0)
  if (noiseHits >= 2 && chars < 1400) return true
  return false
}

function clipFromHtml(
  doc: Document,
  html: string,
  pageUrl: string,
  meta: { title: string; byline: string; weak: boolean },
): ClipPayload {
  const url = normalizeClipUrl(pageUrl)
  const markdown = htmlToMarkdown(doc, html, url)
  const weakByHeuristic = looksWeak(markdown)
  return {
    title: meta.title.trim(),
    byline: meta.byline.trim(),
    markdown,
    url,
    weak: meta.weak || weakByHeuristic,
    imageCount: countMarkdownImages(markdown),
  }
}

function removeNodes(root: ParentNode, selectors: string[]): void {
  for (const selector of selectors) {
    for (const node of root.querySelectorAll(selector)) {
      node.remove()
    }
  }
}

function readabilityExtract(doc: Document, pageUrl: string): ClipPayload {
  const clone = doc.cloneNode(true) as Document
  const article = new Readability(clone, { charThreshold: 120 }).parse()
  if (article?.content) {
    return clipFromHtml(doc, article.content, pageUrl, {
      title: article.title || doc.title || '',
      byline: article.byline || '',
      weak: false,
    })
  }
  return clipFromHtml(doc, doc.body?.innerHTML ?? '', pageUrl, {
    title: doc.title || '',
    byline: '',
    weak: true,
  })
}

function readabilityAfterCleanup(doc: Document, pageUrl: string): ClipPayload {
  const clone = doc.cloneNode(true) as Document
  removeNodes(clone, [
    'script',
    'style',
    'noscript',
    'header',
    'footer',
    'nav',
    'aside',
    '[role="navigation"]',
    '[role="banner"]',
    '[role="complementary"]',
    '[aria-label*="navigation" i]',
    '.global-nav',
    '.scaffold-layout__sidebar',
    '.feed-identity-module',
    '.ad-banner-container',
  ])
  const article = new Readability(clone, { charThreshold: 80 }).parse()
  if (article?.content) {
    return clipFromHtml(doc, article.content, pageUrl, {
      title: article.title || doc.title || '',
      byline: article.byline || '',
      weak: false,
    })
  }
  return clipFromHtml(doc, clone.body?.innerHTML ?? '', pageUrl, {
    title: doc.title || '',
    byline: '',
    weak: true,
  })
}

function bestByTextLength(nodes: Element[]): Element | null {
  let best: Element | null = null
  let bestScore = 0
  for (const node of nodes) {
    const text = node.textContent?.replace(/\s+/g, ' ').trim() ?? ''
    const score = text.length
    if (score > bestScore) {
      bestScore = score
      best = node
    }
  }
  return best
}

function extractLinkedInFocused(doc: Document, pageUrl: string): ClipPayload | null {
  const selectors = [
    'main [data-urn*="activity"]',
    'main .feed-shared-update-v2',
    'main .occludable-update',
    'main article',
    'main [data-id^="urn:li:activity:"]',
  ]
  const candidates: Element[] = []
  for (const selector of selectors) {
    candidates.push(...Array.from(doc.querySelectorAll(selector)))
    if (candidates.length > 0) break
  }
  const best = bestByTextLength(candidates)
  if (!best) return null
  const holder = doc.createElement('div')
  holder.appendChild(best.cloneNode(true))
  removeNodes(holder, [
    'header',
    'footer',
    'nav',
    'aside',
    '[role="navigation"]',
    '[aria-label*="reactions" i]',
    '[aria-label*="comments" i]',
    '.social-details-social-counts',
    '.update-components-social-activity',
    '.comments-comment-box',
  ])
  const title = doc.title.replace(/\s*\|\s*linkedin\s*$/i, '').trim() || doc.title
  return clipFromHtml(doc, holder.innerHTML, pageUrl, {
    title,
    byline: '',
    weak: false,
  })
}

function lineFromGoogleDocNode(node: Element): string {
  const raw = node.textContent?.replace(/\s+/g, ' ').trim() ?? ''
  if (!raw) return ''
  const cls = node.className.toString().toLowerCase()
  if (/\bkix-heading|\bheading\b/.test(cls)) return `## ${raw}`
  if (/^[•●◦▪]\s*/.test(raw)) return `- ${raw.replace(/^[•●◦▪]\s*/, '')}`
  if (/^\d+[.)]\s+/.test(raw)) return raw
  return raw
}

function extractGoogleDocs(doc: Document, pageUrl: string): ClipPayload | null {
  const title = stripDocSuffix(doc.title || 'Google Doc')
  const paragraphSelectors = [
    '.kix-paragraphrenderer',
    '.doc-paragraph',
    '[role="paragraph"]',
    '.kix-lineview',
  ]
  const lines: string[] = []
  for (const selector of paragraphSelectors) {
    const nodes = Array.from(doc.querySelectorAll(selector))
    if (!nodes.length) continue
    for (const node of nodes) {
      const line = lineFromGoogleDocNode(node)
      if (!line) continue
      const last = lines[lines.length - 1]
      if (last !== line) lines.push(line)
    }
    if (lines.length >= 3) break
  }
  if (!lines.length) return null
  const markdown = tidyMarkdown(lines.join('\n\n'))
  return {
    title,
    byline: '',
    markdown,
    url: normalizeClipUrl(pageUrl),
    weak: looksWeak(markdown),
    imageCount: countMarkdownImages(markdown),
  }
}

function genericFocused(doc: Document, pageUrl: string): ClipPayload | null {
  const candidates = Array.from(
    doc.querySelectorAll('main article, article, main [role="main"], [data-testid*="post"]'),
  )
  const best = bestByTextLength(candidates)
  if (!best) return null
  return clipFromHtml(doc, best.outerHTML, pageUrl, {
    title: doc.title || '',
    byline: '',
    weak: false,
  })
}

export function extractFocused(doc: Document, pageUrl: string): ClipPayload {
  const host = hostFromUrl(pageUrl)
  const focused = isLinkedInHost(host)
    ? extractLinkedInFocused(doc, pageUrl)
    : genericFocused(doc, pageUrl)
  if (focused && !focused.weak) return focused
  const fallback = extractPage(doc, pageUrl)
  return fallback
}

export function extractPage(doc: Document, pageUrl: string): ClipPayload {
  const host = hostFromUrl(pageUrl)
  if (host === 'docs.google.com') {
    const googleDocClip = extractGoogleDocs(doc, pageUrl)
    if (googleDocClip && !googleDocClip.weak) return googleDocClip
  }
  if (isLinkedInHost(host)) {
    const focused = extractLinkedInFocused(doc, pageUrl)
    if (focused && !focused.weak) return focused
  }
  const primary = readabilityExtract(doc, pageUrl)
  if (!primary.weak) return primary
  const cleaned = readabilityAfterCleanup(doc, pageUrl)
  if (!cleaned.weak || cleaned.markdown.length > primary.markdown.length) return cleaned
  return primary
}

export function extractSelection(doc: Document, pageUrl: string): ClipPayload | null {
  const sel = doc.defaultView?.getSelection()
  if (!sel || sel.isCollapsed || sel.rangeCount === 0) return null
  const holder = doc.createElement('div')
  for (let i = 0; i < sel.rangeCount; i++) {
    holder.appendChild(sel.getRangeAt(i).cloneContents())
  }
  if (!holder.textContent?.trim()) return null
  return clipFromHtml(doc, holder.innerHTML, pageUrl, {
    title: doc.title || '',
    byline: '',
    weak: false,
  })
}

/** Test helper: convert an HTML fragment the same way the content script does. */
export function markdownFromHtml(doc: Document, html: string, baseUrl: string): string {
  return htmlToMarkdown(doc, html, baseUrl)
}
