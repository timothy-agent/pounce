export function tidyMarkdown(md: string): string {
  return md
    .replace(/\r\n/g, '\n')
    .replaceAll('\0', '')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

export function countMarkdownImages(md: string): number {
  const matches = md.match(/!\[[^\]]*]\([^)]+\)/g)
  return matches?.length ?? 0
}

/** Title + source + body, ready to paste into an LLM or save as a file. */
export function formatClip(clip: { title: string; url: string; markdown: string }): string {
  const title = clip.title.trim()
  const parts: string[] = []
  if (title) parts.push(`# ${title}`, '')
  parts.push(`Source: ${clip.url}`, '', clip.markdown.trim())
  return `${parts.join('\n')}\n`
}

export function markdownFilename(title: string): string {
  const cleaned = [...title.trim()]
    .filter((ch) => {
      const code = ch.codePointAt(0) ?? 0
      if (code < 32) return false
      return !'<>:"/\\|?*'.includes(ch)
    })
    .join('')
    .replace(/\s+/g, ' ')
    .replace(/[. ]+$/g, '')
    .slice(0, 80)
  return `${cleaned || 'clip'}.md`
}
