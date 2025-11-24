import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Provider } from 'react-redux'
import { Toaster } from 'react-hot-toast'
import App from './App'
import { ThemeProvider, useTheme } from '@context/ThemeContext'
import { store } from '@redux/store'
import { logout } from '@redux/slices/authSlice'
import { setLogoutCallback } from '@api/httpClient'
import './index.css'

setLogoutCallback(() => {
  store.dispatch(logout())
})

function ToastContainer() {
  const { theme } = useTheme()
  
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 4000,
        style: {
          background: theme === 'dark' ? '#1e293b' : '#ffffff',
          color: theme === 'dark' ? '#e2e8f0' : '#0f172a',
          border: theme === 'dark' ? '1px solid #334155' : '1px solid #e2e8f0',
          borderRadius: '0.5rem',
          boxShadow: theme === 'dark' 
            ? '0 10px 15px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -2px rgba(0, 0, 0, 0.2)'
            : '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        },
        success: {
          iconTheme: {
            primary: '#10b981',
            secondary: theme === 'dark' ? '#1e293b' : '#ffffff',
          },
        },
        error: {
          iconTheme: {
            primary: '#ef4444',
            secondary: theme === 'dark' ? '#1e293b' : '#ffffff',
          },
        },
      }}
    />
  )
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <ThemeProvider>
          <ToastContainer />
          <App />
        </ThemeProvider>
      </BrowserRouter>
    </Provider>
  </StrictMode>,
)
