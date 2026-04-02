import './polyfills'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './i18n'
import './index.css'
import App from './App.tsx'
import { ToastProvider } from './components/ui/ToastProvider'
import { SolanaWalletProvider } from './wallet/SolanaWalletProvider'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <ToastProvider>
        <SolanaWalletProvider>
          <App />
        </SolanaWalletProvider>
      </ToastProvider>
    </BrowserRouter>
  </StrictMode>,
)
