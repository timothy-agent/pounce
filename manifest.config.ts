import { defineManifest } from '@crxjs/vite-plugin'

export default defineManifest({
  manifest_version: 3,
  name: 'Pounce',
  version: '1.0.0',
  description: 'Clip the current page into your Timothy knowledgebase.',
  icons: {
    '16': 'assets/brand/timothy-mark-16.png',
    '32': 'assets/brand/timothy-mark-32.png',
    '48': 'assets/brand/timothy-mark-64.png',
    '128': 'assets/brand/timothy-mark-128.png',
  },
  action: {
    default_title: 'Clip to Timothy',
    default_popup: 'src/popup/popup.html',
    default_icon: {
      '16': 'assets/brand/timothy-mark-16.png',
      '32': 'assets/brand/timothy-mark-32.png',
      '48': 'assets/brand/timothy-mark-64.png',
      '128': 'assets/brand/timothy-mark-128.png',
    },
  },
  options_ui: {
    page: 'src/options/options.html',
    open_in_tab: true,
  },
  background: {
    service_worker: 'src/background/worker.ts',
    type: 'module',
  },
  permissions: ['activeTab', 'scripting', 'storage', 'contextMenus'],
  optional_host_permissions: ['http://*/*', 'https://*/*'],
  browser_specific_settings: {
    gecko: {
      id: 'pounce@timothy-agent',
      strict_min_version: '128.0',
    },
  },
})
