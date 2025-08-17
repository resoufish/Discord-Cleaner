import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Toaster } from './components/ui/sonner.tsx'
import './styles/globals.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
    <Toaster
      position="top-right"
      toastOptions={{
        style: {
          background: 'rgba(30, 41, 59, 0.95)',
          border: '1px solid rgba(139, 92, 246, 0.3)',
          color: '#f1f5f9',
          backdropFilter: 'blur(12px)',
        },
        className: 'glass',
      }}
    />
  </StrictMode>,
)
