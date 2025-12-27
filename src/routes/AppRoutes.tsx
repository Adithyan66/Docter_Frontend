import { Route, Routes } from 'react-router-dom'
import ProtectedRoute from '@components/ProtectedRoute'
import MainLayout from '@layouts/MainLayout'
import Calendar from '@pages/Calendar'
import AddPatients from '@pages/AddPatients'
import Dashboard from '@pages/Dashboard'
import Login from '@pages/Login'
import Patients from '@pages/Patients'
import PatientDetails from '@pages/PatientDetails'
import Treatments from '@pages/Treatments'
import TreatmentDetails from '@pages/TreatmentDetails'
import AddTreatment from '@pages/AddTreatment'
import Clinics from '@pages/Clinics'
import AddClinic from '@pages/AddClinic'
import ClinicDetails from '@pages/ClinicDetails'
import Appointments from '@pages/Appointments'
import NotFound from '@pages/NotFound'
import Staff from '@pages/Staff'
import StaffDetails from '@pages/StaffDetails'
import AddStaff from '@pages/AddStaff'

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/patients" element={<Patients />} />
          <Route path="/patients/:id" element={<PatientDetails />} />
          <Route path="/patient/add" element={<AddPatients />} />
          <Route path="/patients/:id/edit" element={<AddPatients />} />
          <Route path="/treatments" element={<Treatments />} />
          <Route path="/treatments/add" element={<AddTreatment />} />
          <Route path="/treatments/edit/:id" element={<AddTreatment />} />
          <Route path="/clinics" element={<Clinics />} />
          <Route path="/clinics/add" element={<AddClinic />} />
          <Route path="/clinics/edit/:id" element={<AddClinic />} />
          <Route path="/clinics/:id" element={<ClinicDetails />} />
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/appointments" element={<Appointments />} />
          <Route path="/treatments/:id" element={<TreatmentDetails />} />
          <Route path="/staff" element={<Staff />} />
          <Route path="/staff/add" element={<AddStaff />} />
          <Route path="/staff/edit/:id" element={<AddStaff />} />
          <Route path="/staff/:id" element={<StaffDetails />} />
          <Route path="/*" element={<NotFound />} />
        </Route>
      </Route> 
    </Routes>
  )
}

