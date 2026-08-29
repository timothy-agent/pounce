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

function clipFromHtml(
  doc: Document,
  html: string,
  pageUrl: string,
  meta: { title: string; byline: string; weak: boolean },
): ClipPayload {
  const url = normalizeClipUrl(pageUrl)
  const markdown = htmlToMarkdown(doc, html, url)
  return {
    title: meta.title.trim(),
    byline: meta.byline.trim(),
    markdown,
    url,
    weak: meta.weak || markdown.length < 80,
    imageCount: countMarkdownImages(markdown),
  }
}

export function extractPage(doc: Document, pageUrl: string): ClipPayload {
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
