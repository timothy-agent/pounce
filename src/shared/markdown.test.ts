import { describe, expect, it } from 'vitest'

import { countMarkdownImages, tidyMarkdown } from './markdown'

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
