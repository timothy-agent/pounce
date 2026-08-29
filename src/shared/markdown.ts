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
