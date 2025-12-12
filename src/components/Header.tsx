import { useEffect, useState } from 'react'
import { useTheme } from '@context/ThemeContext'

type HeaderProps = {
  onMenuClick: () => void
  onLogout: () => void
  userEmail?: string | null
}

export default function Header({ onMenuClick, onLogout }: HeaderProps) {
  const { theme, toggleTheme } = useTheme()
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [currentDateTime, setCurrentDateTime] = useState('')

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
      const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })
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
            aria-label="Alarm clock"
            className="flex  items-center justify-center"
          >
            <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth={1.8}>
              <circle cx="12" cy="13" r="7" />
              <path d="M12 9v4l2.5 2.5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M7 4l-1.5 1.5M17 4l1.5 1.5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M5.5 2.5h13" strokeLinecap="round" />
              <path d="M9 20h6" strokeLinecap="round" />
            </svg>
          </button>
          <h1 className="text-lg font-semibold text-slate-800 dark:text-white">{currentDateTime}</h1>
        </div>
      </div>
      <div className="flex items-center gap-4">
    
        <button
          type="button"
          aria-label="Toggle theme"
          className="group relative flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 via-amber-500 to-orange-500 text-white shadow-lg ring-1 ring-amber-300/50 transition hover:scale-105 active:scale-95 dark:from-slate-700 dark:via-slate-800 dark:to-slate-900"
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
          className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-500 to-purple-500 text-white shadow-lg ring-1 ring-blue-400/40 transition hover:scale-105 active:scale-95"
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
          aria-label="Open settings"
          className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700 text-white shadow-lg ring-1 ring-slate-700/50 transition hover:scale-105 active:scale-95"
          onClick={() => setSettingsOpen(true)}
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.8}>
            <path
              d="M12 15.5A3.5 3.5 0 1 0 12 8.5a3.5 3.5 0 0 0 0 7Z"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M19.4 15a1 1 0 0 0 .2 1.1l.1.1a2 2 0 0 1-1.4 3.4h-.2a1 1 0 0 0-1 .7 8 8 0 0 1-1.5 2.6 2 2 0 0 1-3.4-1.4 1 1 0 0 0-1-1h-.2a1 1 0 0 0-1 .7A8 8 0 0 1 8 22a2 2 0 0 1-3.4-1.4 1 1 0 0 0-1.1-.8h-.1A2 2 0 0 1 2 16.4l.1-.1a1 1 0 0 0 .2-1.1 8 8 0 0 1 0-2 1 1 0 0 0-.2-1.1l-.1-.1A2 2 0 0 1 3.4 8h.1a1 1 0 0 0 1.1-.8A8 8 0 0 1 6 4.6a2 2 0 0 1 3.4-1.4 1 1 0 0 0 1 .7h.2a1 1 0 0 0 1-.7A2 2 0 0 1 15.6 3a8 8 0 0 1 1.5 2.6 1 1 0 0 0 1 .7h.2a2 2 0 0 1 1.4 3.4l-.1.1a1 1 0 0 0-.2 1.1 8 8 0 0 1 0 2Z"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
    </header>
    {settingsOpen && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-sm">
        <div className="w-[90%] max-w-sm rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl ring-1 ring-slate-100 dark:border-slate-800 dark:bg-slate-900 dark:ring-slate-800">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">Settings</p>
              <p className="text-lg font-semibold text-slate-900 dark:text-white">Profile Controls</p>
            </div>
            <button
              type="button"
              aria-label="Close settings"
              className="flex h-9 w-9 items-center justify-center rounded-2xl border border-slate-200 text-slate-500 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
              onClick={() => setSettingsOpen(false)}
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.8}>
                <path d="m6 6 12 12M18 6 6 18" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-medium uppercase tracking-[0.2em] text-slate-500">Change Password</label>
              <input
                type="password"
                disabled
                placeholder="Coming soon"
                className="mt-2 w-full rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-500 outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400"
              />
            </div>
            <button
              type="button"
              className="flex w-full items-center justify-center rounded-2xl bg-gradient-to-r from-blue-600 via-blue-500 to-blue-400 px-4 py-3 text-sm font-semibold text-white shadow-lg ring-1 ring-blue-500/40 transition hover:translate-y-0.5"
              onClick={() => {
                onLogout()
                setSettingsOpen(false)
              }}
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    )}
    </>
  )
}
