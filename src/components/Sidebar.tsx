import { NavLink } from 'react-router-dom'

type SidebarProps = {
  collapsed: boolean
  mobileOpen: boolean
  onClose: () => void
  onToggleCollapse: () => void
}

const links = [
  { label: 'Dashboard', to: '/' },
  { label: 'Patients', to: '/patients' },
  { label: 'Calendar', to: '/calendar' },
]

export default function Sidebar({
  collapsed,
  mobileOpen,
  onClose,
  onToggleCollapse,
}: SidebarProps) {
  const baseClasses =
    'fixed inset-y-0 left-0 z-40 flex flex-col border-r border-slate-200 bg-white shadow-lg transition-all duration-300 dark:border-slate-800 dark:bg-slate-900 md:static md:flex md:shadow-none'
  const widthClasses = collapsed ? 'md:w-20' : 'md:w-64'
  const translateClasses = mobileOpen
    ? 'translate-x-0 w-64 md:translate-x-0'
    : '-translate-x-full w-64 md:translate-x-0'

  return (
    <aside className={`${baseClasses} ${widthClasses} ${translateClasses}`}>
      <div className="flex items-center justify-between px-4 py-4">
        <span className="text-base font-semibold text-slate-800 dark:text-white">
          Care Panel
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="rounded-md border border-slate-200 px-2 py-1 text-sm text-slate-600 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800 md:hidden"
            onClick={onClose}
          >
            Close
          </button>
          <button
            type="button"
            className="hidden rounded-md border border-slate-200 px-2 py-1 text-sm text-slate-600 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800 md:block"
            onClick={onToggleCollapse}
          >
            {collapsed ? 'Expand' : 'Collapse'}
          </button>
        </div>
      </div>
      <nav className="flex flex-1 flex-col gap-1 px-2 pb-6">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              [
                'flex items-center rounded-lg px-4 py-3 text-sm font-medium transition',
                collapsed ? 'justify-center' : 'justify-start',
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800',
              ].join(' ')
            }
            onClick={onClose}
          >
            {link.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}

