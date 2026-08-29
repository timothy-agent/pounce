/// <reference types="vite/client" />
/// <reference types="chrome" />

declare module '*?script' {
  const path: string
  export default path
}

declare module '*?script&module' {
  const path: string
  export default path
}

declare module 'turndown-plugin-gfm' {
  import type { Plugin } from 'turndown'
  export const gfm: Plugin
  export const tables: Plugin
  export const strikethrough: Plugin
  export const taskListItems: Plugin
  export const highlightedCodeBlock: Plugin
}
