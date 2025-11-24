import { Route, Routes } from 'react-router-dom'
import ProtectedRoute from '@components/ProtectedRoute'
import MainLayout from '@layouts/MainLayout'
import Calendar from '@pages/Calendar'
import AddPatients from '@pages/AddPatients'
import Dashboard from '@pages/Dashboard'
import Login from '@pages/Login'
import Patients from '@pages/Patients'
import Treatments from '@pages/Treatments'

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/patients" element={<Patients />} />
          <Route path="/patient/add" element={<AddPatients />} />
          <Route path="/treatments" element={<Treatments />} />
          <Route path="/calendar" element={<Calendar />} />
        </Route>
      </Route>
    </Routes>
  )
}

