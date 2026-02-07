import { useEffect, useState } from 'react'
import { useTheme } from '@context/ThemeContext'
import ConfirmationModal from '@components/common/ConfirmationModal'

type HeaderProps = {
  onMenuClick: () => void
  onLogout: () => void
  userEmail?: string | null
}

export default function Header({ onMenuClick, onLogout }: HeaderProps) {
  const { theme, toggleTheme } = useTheme()
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [currentDateTime, setCurrentDateTime] = useState('')
  const [logoutModalOpen, setLogoutModalOpen] = useState(false)

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement))
    }
    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange)
  }, [])

  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date()
      const dateStr = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
      const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
      setCurrentDateTime(`${dateStr} · ${timeStr}`)
    }
    updateDateTime()
    const interval = setInterval(updateDateTime, 1000)
    return () => clearInterval(interval)
  }, [])

  const toggleFullscreen = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen?.()
    } else {
      document.documentElement.requestFullscreen?.()
    }
  }

  return (
    <>
    <header className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center gap-3">
        <button
          type="button"
          className="rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-600 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800 md:hidden"
          onClick={onMenuClick}
        >
          Menu
        </button>
        <div className="flex items-center gap-3">
          <button
            type="button"
            aria-label="Date and time"
            className="flex items-center justify-center text-slate-500 dark:text-slate-400"
          >
            <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="9" />
              <path d="M12 6v6l4 2" />
            </svg>
          </button>
          <h1 className="text-lg font-semibold text-slate-800 dark:text-white">{currentDateTime}</h1>
        </div>
      </div>
      <div className="flex items-center gap-4">
    
        <button
          type="button"
          aria-label="Toggle theme"
          className="group relative flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 text-amber-600 transition-colors hover:bg-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:hover:bg-amber-900/50"
          onClick={toggleTheme}
        >
          <span
            className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ${
              theme === 'light' ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-45 scale-75'
            }`}
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5">
              <path
                d="M12 6V3m0 18v-3m6-6h3M3 12h3m12.364 6.364 2.122 2.122M5.514 5.514l2.122 2.122m10.606 0 2.122-2.122M5.514 18.486l2.122-2.122"
                stroke="currentColor"
                strokeWidth={1.8}
                strokeLinecap="round"
              />
              <circle cx="12" cy="12" r="3" fill="currentColor" />
            </svg>
          </span>
          <span
            className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ${
              theme === 'dark' ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 rotate-45 scale-75'
            }`}
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5">
              <path
                d="M21 14.5A8.5 8.5 0 0 1 9.5 3 8.5 8.5 0 1 0 21 14.5Z"
                stroke="currentColor"
                strokeWidth={1.8}
                fill="currentColor"
              />
            </svg>
          </span>
        </button>
        <button
          type="button"
          aria-label="Toggle fullscreen"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600 transition-colors hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50"
          onClick={toggleFullscreen}
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.8}>
            {isFullscreen ? (
              <>
                <path d="M9 3H5a2 2 0 0 0-2 2v4M15 3h4a2 2 0 0 1 2 2v4" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M3 15v4a2 2 0 0 0 2 2h4M21 15v4a2 2 0 0 1-2 2h-4" strokeLinecap="round" strokeLinejoin="round" />
              </>
            ) : (
              <>
                <path d="M9 3H5a2 2 0 0 0-2 2v4M15 3h4a2 2 0 0 1 2 2v4" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M3 15v4a2 2 0 0 0 2 2h4M21 15v4a2 2 0 0 1-2 2h-4" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M9 3v6H3M15 3v6h6M9 21v-6H3M15 21v-6h6" strokeLinecap="round" strokeLinejoin="round" />
              </>
            )}
          </svg>
        </button>
        <button
          type="button"
          aria-label="Logout"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition-colors hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"
          onClick={() => setLogoutModalOpen(true)}
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.8}>
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M16 17l5-5-5-5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M21 12H9" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
    </header>
    <ConfirmationModal
      isOpen={logoutModalOpen}
      onClose={() => setLogoutModalOpen(false)}
      onConfirm={onLogout}
      title="Logout"
      message="Are you sure you want to logout?"
      confirmText="Logout"
    />
  </>
  )
}
