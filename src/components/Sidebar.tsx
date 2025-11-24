import type { JSX } from 'react'
import { NavLink } from 'react-router-dom'

type SidebarProps = {
  mobileOpen: boolean
  onClose: () => void
}

type SidebarLink = {
  label: string
  to: string
  icon: (props: IconProps) => JSX.Element
}

type IconProps = {
  className?: string
}

const DashboardIcon = ({ className }: IconProps) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.8}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M4 4h7v7H4z" />
    <path d="M13 4h7v4h-7z" />
    <path d="M13 10h7v10h-7z" />
    <path d="M4 13h7v7H4z" />
  </svg>
)

const PatientsIcon = ({ className }: IconProps) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.8}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z" />
    <path d="M4 20a6 6 0 0 1 16 0" />
  </svg>
)

const AddPatientsIcon = ({ className }: IconProps) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.8}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M15 3v6" />
    <path d="M12 6h6" />
    <path d="M5 21a5 5 0 0 1 10 0" />
    <path d="M10 8a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
  </svg>
)

const CalendarIcon = ({ className }: IconProps) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.8}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M7 3v4" />
    <path d="M17 3v4" />
    <path d="M3 9h18" />
    <path d="M5 5h14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z" />
    <path d="M8 13h2v2H8z" />
    <path d="M12 13h2v2h-2z" />
    <path d="M16 13h2v2h-2z" />
  </svg>
)

const TreatmentsIcon = ({ className }: IconProps) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.8}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M18 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z" />
    <path d="M9 2v4" />
    <path d="M15 2v4" />
    <path d="M7 10h10" />
    <path d="M9 14h2v4H9z" />
    <path d="M13 14h2v4h-2z" />
  </svg>
)

const links: SidebarLink[] = [
  { label: 'Dashboard', to: '/', icon: DashboardIcon },
  { label: 'Patients', to: '/patients', icon: PatientsIcon },
  { label: 'Addpatients', to: '/patient/add', icon: AddPatientsIcon },
  { label: 'Treatments', to: '/treatments', icon: TreatmentsIcon },
  { label: 'Calendar', to: '/calendar', icon: CalendarIcon },
]

export default function Sidebar({ mobileOpen, onClose }: SidebarProps) {
  const baseClasses =
    'fixed inset-y-0 left-0 z-40 flex flex-col border-r border-slate-200 bg-white shadow-lg transition-all duration-300 dark:border-slate-800 dark:bg-slate-900 md:static md:flex md:shadow-none'
  const widthClasses = 'md:w-64'
  const translateClasses = mobileOpen
    ? 'translate-x-0 w-64 md:translate-x-0'
    : '-translate-x-full w-64 md:translate-x-0'

  return (
    <aside className={`${baseClasses} ${widthClasses} ${translateClasses}`}>
      <div className="flex items-center justify-between px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-sm font-semibold uppercase text-white">
            CP
          </div>
          <span className="text-base font-semibold text-slate-800 dark:text-white">Care Panel</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="rounded-md border border-slate-200 px-2 py-1 text-sm text-slate-600 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800 md:hidden"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
      <nav className="flex flex-1 flex-col gap-1 px-2 pb-6">
        {links.map((link) => {
          const Icon = link.icon
          return (
            <NavLink
              key={link.to}
              to={link.to}
              aria-label={link.label}
              className={({ isActive }) =>
                [
                  'flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition',
                  isActive
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800',
                ].join(' ')
              }
              onClick={onClose}
            >
              <Icon className="h-5 w-5 flex-shrink-0" />
              <span className="whitespace-nowrap">{link.label}</span>
            </NavLink>
          )
        })}
      </nav>
    </aside>
  )
}

