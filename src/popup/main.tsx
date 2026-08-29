import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import '../styles.css'
import { Popup } from './Popup'

const root = document.getElementById('root')
if (!root) throw new Error('#root missing')

root.style.width = '400px'
root.style.minHeight = '280px'

createRoot(root).render(
  <StrictMode>
    <Popup />
  </StrictMode>,
)
