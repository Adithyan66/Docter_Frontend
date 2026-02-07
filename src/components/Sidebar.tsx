import type { JSX } from 'react'
import { NavLink } from 'react-router-dom'
import icon from '@assets/icon.png'
import './Sidebar.css'
import { useAppSelector } from '@hooks/store'

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

const iconProps = { strokeWidth: 2, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const }

const DashboardIcon = ({ className }: IconProps) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" {...iconProps}>
    <path d="M4 5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5z" />
    <path d="M14 5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1h-4a1 1 0 0 1-1-1V5z" />
    <path d="M4 15a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-4z" />
    <path d="M14 15a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1h-4a1 1 0 0 1-1-1v-4z" />
  </svg>
)

const PatientsIcon = ({ className }: IconProps) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" {...iconProps}>
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
)

const AddPatientsIcon = ({ className }: IconProps) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" {...iconProps}>
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M19 8v6M22 11h-6" />
  </svg>
)

const SchedulesIcon = ({ className }: IconProps) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" {...iconProps}>
    <path d="M8 2v4M16 2v4M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" />
    <path d="M8 14h8M8 18h5" />
  </svg>
)

const CalendarIcon = ({ className }: IconProps) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" {...iconProps}>
    <path d="M7 3v4M17 3v4M3 9h18M5 5h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2z" />
  </svg>
)

const TreatmentsIcon = ({ className }: IconProps) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" {...iconProps}>
    <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
  </svg>
)

const ClinicsIcon = ({ className }: IconProps) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" {...iconProps}>
    <path d="M3 21h18M5 21V7l7-4 7 4v14M9 21v-6h6v6M9 9h6" />
  </svg>
)

const StaffIcon = ({ className }: IconProps) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" {...iconProps}>
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
)

const AppointmentsIcon = ({ className }: IconProps) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" {...iconProps}>
    <path d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
  </svg>
)

export default function Sidebar({ mobileOpen, onClose, collapsed, onToggleCollapse }: SidebarProps) {
  const authUser = useAppSelector((state) => state.auth.user) as
    | ({ id: string; email: string; role?: 'doctor' | 'staff'; clinicId?: string })
    | null
  const isStaff = authUser?.role === 'staff'
  const clinicLink = isStaff && authUser?.clinicId ? `/clinics/${authUser.clinicId}` : '/clinics'
  const clinicLabel = isStaff ? 'Clinic' : 'Clinics'
  const links: SidebarLink[] = [
    { label: 'Schedules', to: '/schedules', icon: SchedulesIcon },
    { label: 'Patients', to: '/patients', icon: PatientsIcon },
    { label: 'Addpatients', to: '/patient/add', icon: AddPatientsIcon },
    { label: 'Treatments', to: '/treatments', icon: TreatmentsIcon },
    { label: clinicLabel, to: clinicLink, icon: ClinicsIcon },
    { label: 'Clinic Staffs', to: '/staff', icon: StaffIcon },
    { label: 'Calendar', to: '/calendar', icon: CalendarIcon },
    { label: 'Appointments', to: '/appointments', icon: AppointmentsIcon },
    { label: 'Dashboard', to: '/', icon: DashboardIcon },
  ]
  const visibleLinks = isStaff
    ? links.filter((link) => !['/', '/treatments', '/staff'].includes(link.to))
    : links

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
        {visibleLinks.map((link) => {
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

