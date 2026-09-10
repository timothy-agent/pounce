import { describe, expect, it } from 'vitest'

import { countMarkdownImages, formatClip, markdownFilename, tidyMarkdown } from './markdown'

describe('tidyMarkdown', () => {
  it('strips NULs, normalizes newlines, and collapses blank runs', () => {
    expect(tidyMarkdown('a\r\n\r\n\r\n\u0000b  \n\n\n\nc')).toBe('a\n\nb\n\nc')
  })
})

describe('countMarkdownImages', () => {
  it('counts markdown image references', () => {
    expect(countMarkdownImages('hi ![a](http://x/a.png) and ![b](http://x/b.png)')).toBe(2)
    expect(countMarkdownImages('no images [link](http://x)')).toBe(0)
  })
})

describe('formatClip', () => {
  it('prefixes title and source for LLM paste', () => {
    expect(
      formatClip({ title: 'Hello', url: 'https://ex.test/a', markdown: 'body' }),
    ).toBe('# Hello\n\nSource: https://ex.test/a\n\nbody\n')
  })

  it('omits the heading when title is blank', () => {
    expect(formatClip({ title: '  ', url: 'https://ex.test/a', markdown: 'body' })).toBe(
      'Source: https://ex.test/a\n\nbody\n',
    )
  })
})

describe('markdownFilename', () => {
  it('sanitizes path characters and falls back to clip.md', () => {
    expect(markdownFilename('Foo / Bar: baz')).toBe('Foo Bar baz.md')
    expect(markdownFilename('   ')).toBe('clip.md')
  })
})
