import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './i18n'
import './index.css'
import App from './App.tsx'
import { SolanaWalletProvider } from './wallet/SolanaWalletProvider'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <SolanaWalletProvider>
        <App />
      </SolanaWalletProvider>
    </BrowserRouter>
  </StrictMode>,
)
