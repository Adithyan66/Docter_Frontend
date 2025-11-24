import { useState } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import Header from '@components/Header'
import Sidebar from '@components/Sidebar'
import { useAppDispatch, useAppSelector } from '@hooks/store'
import { logout } from '@redux/slices/authSlice'

export default function MainLayout() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(false)
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const userEmail = useAppSelector((state) => state.auth.user?.email ?? null)

  const handleLogout = () => {
    dispatch(logout())
    navigate('/login', { replace: true })
  }

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 text-slate-900 transition dark:bg-slate-950 dark:text-white">
      <Sidebar 
        mobileOpen={mobileOpen} 
        onClose={() => setMobileOpen(false)}
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed(!collapsed)}
      />
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}
      <div className={`flex flex-1 flex-col overflow-hidden transition-all duration-300 ${collapsed ? 'md:ml-20' : 'md:ml-64'}`}>
        <Header
          onMenuClick={() => setMobileOpen(true)}
          onLogout={handleLogout}
          userEmail={userEmail}
        />
        <main className="flex-1 overflow-y-auto bg-slate-50 p-4 dark:bg-slate-950 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

