import '@fontsource-variable/plus-jakarta-sans'
import '@fontsource/instrument-serif/400.css'
import '@fontsource/instrument-serif/400-italic.css'
import './index.css'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'

const container = document.getElementById('root')
if (!container) throw new Error('Élément #root introuvable dans index.html')

createRoot(container).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
