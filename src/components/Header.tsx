import { useTheme } from '@context/ThemeContext'

type HeaderProps = {
  onMenuClick: () => void
  onLogout: () => void
  userEmail?: string | null
}

export default function Header({ onMenuClick, onLogout, userEmail }: HeaderProps) {
  const { theme, toggleTheme } = useTheme()

  return (
    <header className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center gap-3">
        <button
          type="button"
          className="rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-600 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800 md:hidden"
          onClick={onMenuClick}
        >
          Menu
        </button>
        <h1 className="text-lg font-semibold text-slate-800 dark:text-white">Doctor Hub</h1>
      </div>
      <div className="flex items-center gap-3">
        <button
          type="button"
          className="rounded-full border border-slate-200 px-3 py-2 text-sm text-slate-600 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
          onClick={toggleTheme}
        >
          {theme === 'light' ? 'Dark' : 'Light'}
        </button>
        {userEmail && (
          <span className="hidden text-sm font-medium text-slate-600 dark:text-slate-200 sm:inline">
            {userEmail}
          </span>
        )}
        <button
          type="button"
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
          onClick={onLogout}
        >
          Logout
        </button>
      </div>
    </header>
  )
}

