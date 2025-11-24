import { Route, Routes } from 'react-router-dom'
import ProtectedRoute from '@components/ProtectedRoute'
import MainLayout from '@layouts/MainLayout'
import Calendar from '@pages/Calendar'
import Dashboard from '@pages/Dashboard'
import Login from '@pages/Login'
import Patients from '@pages/Patients'

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/patients" element={<Patients />} />
          <Route path="/calendar" element={<Calendar />} />
        </Route>
      </Route>
    </Routes>
  )
}

