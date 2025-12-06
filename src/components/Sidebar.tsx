import type { JSX } from 'react'
import { NavLink } from 'react-router-dom'
import icon from '@assets/icon.png'
import './Sidebar.css'

type SidebarProps = {
  mobileOpen: boolean
  onClose: () => void
  collapsed: boolean
  onToggleCollapse: () => void
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

const ClinicsIcon = ({ className }: IconProps) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.8}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
)

const AppointmentsIcon = ({ className }: IconProps) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.8}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M6 2v4" />
    <path d="M18 2v4" />
    <path d="M3 8h18" />
    <path d="M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" />
    <circle cx="8" cy="14" r="1" />
    <circle cx="12" cy="14" r="1" />
    <circle cx="16" cy="14" r="1" />
    <path d="M8 18h8" />
  </svg>
)

const links: SidebarLink[] = [
  { label: 'Dashboard', to: '/', icon: DashboardIcon },
  { label: 'Patients', to: '/patients', icon: PatientsIcon },
  { label: 'Addpatients', to: '/patient/add', icon: AddPatientsIcon },
  { label: 'Treatments', to: '/treatments', icon: TreatmentsIcon },
  { label: 'Clinics', to: '/clinics', icon: ClinicsIcon },
  { label: 'Calendar', to: '/calendar', icon: CalendarIcon },
  { label: 'Appointments', to: '/appointments', icon: AppointmentsIcon },
]

export default function Sidebar({ mobileOpen, onClose, collapsed, onToggleCollapse }: SidebarProps) {
  const baseClasses =
    'fixed inset-y-0 left-0 z-40 flex h-screen flex-col border-r border-slate-100 bg-white/95 shadow-lg transition-all duration-300 ease-in-out backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900 md:fixed md:flex md:shadow-none'
  const widthClasses = collapsed ? 'md:w-20' : 'md:w-64'
  const translateClasses = mobileOpen
    ? 'translate-x-0 w-64 md:translate-x-0'
    : '-translate-x-full w-64 md:translate-x-0'
  const linkBaseClasses =
    'group relative flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium tracking-tight transition-transform duration-300 ease-out hover:translate-x-1'
  const collapsedLinkClasses = collapsed ? 'md:justify-center md:px-3' : ''
  const activeLinkClasses =
    'bg-gradient-to-r from-blue-600 via-blue-500 to-blue-100 text-white shadow-sm ring-1 ring-blue-500/30 transition-colors sidebar-link-active'
  const inactiveLinkClasses =
    'text-slate-700 hover:text-blue-600 transition-colors dark:text-slate-300 dark:hover:text-blue-400'

  return (
    <aside className={`${baseClasses} ${widthClasses} ${translateClasses}`}>
      <div className="flex flex-shrink-0 items-center justify-between border-b border-slate-200/70 px-4 py-4 dark:border-slate-800">
        <div className={`flex items-center gap-3 ${collapsed ? 'md:justify-center' : ''}`}>
          <button
            type="button"
            onClick={onToggleCollapse}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className="flex h-10 w-10 items-center hover:cursor-pointer justify-center rounded-xl bg-blue-600 p-0 transition-transform duration-300 ease-in-out overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            <img
              src={icon}
              alt="icon"
              className={`h-10 w-10 flex-shrink-0 object-cover transition-transform duration-300 ease-in-out ${
                collapsed ? 'scale-90' : 'scale-100'
              }`}
            />
          </button>
          <div className={`transition-opacity duration-300 ${collapsed ? 'md:hidden' : ''}`}>
            <p className="text-[11px] font-medium uppercase tracking-[0.3em] text-slate-500">
              Doctor
            </p>
            <p className="text-lg font-semibold text-slate-900 dark:text-white">
              Ameen
            </p>
          </div>
        </div>
      </div>
      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-2 pb-6 pt-3">
        {links.map((link) => {
          const Icon = link.icon
          return (
            <NavLink
              key={link.to}
              to={link.to}
              aria-label={link.label}
              className={({ isActive }) =>
                [linkBaseClasses, collapsedLinkClasses, isActive ? activeLinkClasses : inactiveLinkClasses].join(' ')
              }
              onClick={onClose}
              title={collapsed ? link.label : undefined}
            >
              <Icon className="h-5 w-5 flex-shrink-0" />
              <span
                className={`whitespace-nowrap transition-opacity duration-300 ${collapsed ? 'md:hidden' : ''}`}
              >
                {link.label}
              </span>
            </NavLink>
          )
        })}
      </nav>
    </aside>
  )
}

