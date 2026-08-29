import { JSDOM } from 'jsdom'
import { describe, expect, it } from 'vitest'

import { extractPage, extractSelection, markdownFromHtml } from './extract'

const PARA =
  'The deployment pipeline now waits for the canary to report a healthy error budget before promoting. ' +
  'That change alone removed the Friday-afternoon rollback theatre that used to follow every release. ' +
  'Operators still watch the first ten minutes, but the system no longer depends on someone staring at a dashboard.'

function load(html: string, url: string) {
  return new JSDOM(html, { url, pretendToBeVisual: true, contentType: 'text/html' }).window.document
}

describe('extractPage', () => {
  it('pulls the article, resolves relative links, and keeps images as markdown', () => {
    const url = 'https://medium.com/p/abc?utm_source=rss#section'
    const doc = load(
      `<!doctype html><html><head><title>Shipping without the drama</title></head><body>
        <nav><a href="/home">Home</a><a href="/login">Login</a></nav>
        <article>
          <h1>Shipping without the drama</h1>
          <p class="byline">Ava Chen</p>
          <p>${PARA}</p>
          <p>${PARA}</p>
          <p>See the <a href="/follow-up">follow-up</a> and this <img src="/chart.png" alt="error budget chart"></p>
        </article>
        <aside>Subscribe to our newsletter for more posts like this one.</aside>
      </body></html>`,
      url,
    )
    const clip = extractPage(doc, url)
    expect(clip.title).toMatch(/Shipping without the drama/i)
    expect(clip.url).toBe('https://medium.com/p/abc')
    expect(clip.weak).toBe(false)
    expect(clip.markdown).toContain('canary')
    expect(clip.markdown).toContain('https://medium.com/follow-up')
    expect(clip.markdown).toContain('![error budget chart](https://medium.com/chart.png)')
    expect(clip.imageCount).toBe(1)
    expect(clip.markdown).not.toContain('Subscribe to our newsletter')
  })

  it('keeps GFM tables', () => {
    const url = 'https://docs.example.com/ref'
    const doc = load(
      `<!doctype html><html><head><title>Limits</title></head><body>
        <article>
          <h1>Limits</h1>
          <p>${PARA}</p>
          <table>
            <thead><tr><th>Tier</th><th>Cap</th></tr></thead>
            <tbody><tr><td>Hobby</td><td>128 KiB</td></tr></tbody>
          </table>
          <p>${PARA}</p>
        </article>
      </body></html>`,
      url,
    )
    const md = extractPage(doc, url).markdown
    expect(md).toMatch(/Tier/)
    expect(md).toMatch(/128 KiB/)
    expect(md).toMatch(/\|/)
  })

  it('flags pages Readability rejects', () => {
    const url = 'https://app.example.com/empty'
    const doc = load(
      `<!doctype html><html><head><title>Dashboard</title></head><body>
        <nav><a href="/">Home</a><a href="/settings">Settings</a></nav>
        <div id="root"></div>
      </body></html>`,
      url,
    )
    const clip = extractPage(doc, url)
    expect(clip.weak).toBe(true)
  })

  it('still captures a feed-post-like DOM as body fallback or article', () => {
    const url = 'https://www.linkedin.com/feed/update/urn:li:activity:1'
    const doc = load(
      `<!doctype html><html><head><title>Feed | LinkedIn</title></head><body>
        <header>LinkedIn nav search messaging</header>
        <aside>People you may know. Grow your network with suggested connections.</aside>
        <div class="feed">
          <div class="post">
            <h2>Ava Chen</h2>
            <p>${PARA}</p>
            <p>${PARA}</p>
          </div>
        </div>
        <footer>LinkedIn Corporation</footer>
      </body></html>`,
      url,
    )
    const clip = extractPage(doc, url)
    expect(clip.markdown).toContain('canary')
    expect(clip.url).toContain('linkedin.com')
  })
})

describe('extractSelection', () => {
  it('returns null when nothing is selected', () => {
    const url = 'https://example.com/post'
    const doc = load(
      `<!doctype html><html><head><title>Post</title></head><body><p>${PARA}</p></body></html>`,
      url,
    )
    expect(extractSelection(doc, url)).toBeNull()
  })

  it('clips the selected range and keeps the page URL', () => {
    const url = 'https://example.com/post?utm_source=x#h'
    const { window } = new JSDOM(
      `<!doctype html><html><head><title>Post title</title></head><body>
        <p id="keep">${PARA}</p>
        <p>Ignore this other paragraph about newsletters.</p>
      </body></html>`,
      { url, pretendToBeVisual: true, contentType: 'text/html' },
    )
    const doc = window.document
    const keep = doc.getElementById('keep')
    if (!keep) throw new Error('missing #keep')
    const range = doc.createRange()
    range.selectNodeContents(keep)
    const sel = window.getSelection()
    sel?.removeAllRanges()
    sel?.addRange(range)
    const clip = extractSelection(doc, url)
    expect(clip).not.toBeNull()
    expect(clip?.title).toBe('Post title')
    expect(clip?.url).toBe('https://example.com/post')
    expect(clip?.markdown).toContain('canary')
    expect(clip?.markdown).not.toContain('newsletters')
    expect(clip?.weak).toBe(false)
  })
})

describe('markdownFromHtml', () => {
  it('absolutizes href and src against the page URL', () => {
    const url = 'https://example.com/blog/post'
    const doc = load('<!doctype html><html><body></body></html>', url)
    const md = markdownFromHtml(
      doc,
      '<p>See <a href="../other">other</a></p><p><img src="pic.jpg" alt="pic"></p>',
      url,
    )
    expect(md).toContain('https://example.com/other')
    expect(md).toContain('![pic](https://example.com/blog/pic.jpg)')
  })

  it('leaves javascript and data URLs unresolved', () => {
    const url = 'https://example.com/blog/post'
    const doc = load('<!doctype html><html><body></body></html>', url)
    const md = markdownFromHtml(
      doc,
      '<p><a href="javascript:alert(1)">js</a> <a href="mailto:a@b.c">mail</a> <img src="data:image/gif;base64,AAAA" alt="x"></p>',
      url,
    )
    expect(md).not.toMatch(/https:\/\/example\.com\/blog\/javascript:/)
    expect(md).not.toMatch(/https:\/\/example\.com\/blog\/data:/)
    expect(md).toContain('mailto:a@b.c')
  })
})
