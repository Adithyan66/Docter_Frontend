import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { getPatientById, type Patient } from '@api/patients'
import { useAppSelector } from '@hooks/store'
import CreateTreatmentCourseModal from '@components/treatment/CreateTreatmentCourseModal'

export default function PatientDetails() {
  const { id } = useParams<{ id: string }>()
  const [patient, setPatient] = useState<Patient | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const doctorId = useAppSelector((state) => state.auth.user?.id || '')

  useEffect(() => {
    const fetchPatient = async () => {
      if (!id) return

      try {
        setIsLoading(true)
        const patientData = await getPatientById(id)
        setPatient(patientData)
      } catch (error: any) {
        const errorMessage =
          error?.response?.data?.error?.message ||
          error?.response?.data?.message ||
          error?.message ||
          'Unable to fetch patient details. Please try again.'
        toast.error(errorMessage)
      } finally {
        setIsLoading(false)
      }
    }

    fetchPatient()
  }, [id])

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-'
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    } catch {
      return '-'
    }
  }

  const formatDateTime = (dateString?: string) => {
    if (!dateString) return '-'
    try {
      return new Date(dateString).toLocaleString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    } catch {
      return '-'
    }
  }

  if (isLoading) {
    return (
      <section className="space-y-4">
        <div className="flex items-center justify-center rounded-2xl bg-white/60 p-12 backdrop-blur-sm dark:bg-slate-900/60">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
        </div>
      </section>
    )
  }

  if (!patient) {
    return (
      <section className="space-y-4">
        <div className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-600 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
          Patient not found.
        </div>
      </section>
    )
  }

  return (
    <section className="space-y-6">
      <div className="rounded-2xl bg-white/60 p-6 backdrop-blur-sm dark:bg-slate-900/60">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Patient Details</h1>
            <p className="text-slate-600 dark:text-slate-300">View comprehensive patient information</p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-blue-500 dark:bg-blue-500 dark:hover:bg-blue-400"
          >
            Create Treatment Course
          </button>
        </div>
      </div>

      <CreateTreatmentCourseModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        patientId={patient.id}
        doctorId={doctorId}
        onSuccess={() => {
          setIsModalOpen(false)
        }}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <div className="rounded-2xl border border-slate-200 bg-white/60 p-6 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/60">
            <div className="flex flex-col items-center space-y-4">
              {patient.profilePicUrl ? (
                <img
                  src={patient.profilePicUrl}
                  alt={patient.fullName}
                  className="h-32 w-32 rounded-full object-cover border-4 border-slate-200 dark:border-slate-700"
                />
              ) : (
                <div className="flex h-32 w-32 items-center justify-center rounded-full bg-blue-100 text-4xl font-semibold text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-4 border-slate-200 dark:border-slate-700">
                  {patient.fullName?.charAt(0).toUpperCase() || '?'}
                </div>
              )}
              <div className="text-center">
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                  {patient.fullName || '-'}
                </h2>
                {patient.patientId && (
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                    ID: {patient.patientId}
                  </p>
                )}
                <div className="mt-3">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-medium ${
                      patient.isActive
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                    }`}
                  >
                    {patient.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white/60 p-6 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/60">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
              Personal Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                  First Name
                </span>
                <p className="text-sm text-slate-900 dark:text-white mt-1">
                  {patient.firstName || '-'}
                </p>
              </div>
              <div>
                <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                  Last Name
                </span>
                <p className="text-sm text-slate-900 dark:text-white mt-1">
                  {patient.lastName || '-'}
                </p>
              </div>
              <div>
                <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                  Date of Birth
                </span>
                <p className="text-sm text-slate-900 dark:text-white mt-1">
                  {formatDate(patient.dob)}
                </p>
              </div>
              <div>
                <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Age</span>
                <p className="text-sm text-slate-900 dark:text-white mt-1">
                  {patient.age !== undefined ? `${patient.age} years` : '-'}
                </p>
              </div>
              <div>
                <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                  Gender
                </span>
                <p className="text-sm text-slate-900 dark:text-white mt-1 capitalize">
                  {patient.gender || '-'}
                </p>
              </div>
              <div>
                <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                  Phone
                </span>
                <p className="text-sm text-slate-900 dark:text-white mt-1">
                  {patient.phone || '-'}
                </p>
              </div>
              <div className="md:col-span-2">
                <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                  Email
                </span>
                <p className="text-sm text-slate-900 dark:text-white mt-1">
                  {patient.email || '-'}
                </p>
              </div>
              <div className="md:col-span-2">
                <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                  Address
                </span>
                <p className="text-sm text-slate-900 dark:text-white mt-1 whitespace-pre-line">
                  {patient.address || '-'}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white/60 p-6 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/60">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
              Medical Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                  Consultation Type
                </span>
                <p className="text-sm text-slate-900 dark:text-white mt-1 capitalize">
                  {patient.consultationType?.replace('-', ' ') || '-'}
                </p>
              </div>
              <div>
                <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                  Visit Count
                </span>
                <p className="text-sm text-slate-900 dark:text-white mt-1">
                  {patient.visitCount !== undefined ? patient.visitCount : '-'}
                </p>
              </div>
            </div>
          </div>

          {patient.tags && patient.tags.length > 0 && (
            <div className="rounded-2xl border border-slate-200 bg-white/60 p-6 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/60">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {patient.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-block rounded-lg bg-blue-100 px-3 py-1.5 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="rounded-2xl border border-slate-200 bg-white/60 p-6 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/60">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
              System Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                  Patient ID
                </span>
                <p className="text-sm text-slate-900 dark:text-white mt-1 font-mono">
                  {patient.id}
                </p>
              </div>
              <div>
                <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                  Doctor ID
                </span>
                <p className="text-sm text-slate-900 dark:text-white mt-1 font-mono">
                  {patient.doctorId}
                </p>
              </div>
              <div>
                <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                  Primary Clinic ID
                </span>
                <p className="text-sm text-slate-900 dark:text-white mt-1 font-mono">
                  {patient.primaryClinic || '-'}
                </p>
              </div>
              {patient.clinics && patient.clinics.length > 0 && (
                <div>
                  <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                    Clinics ({patient.clinics.length})
                  </span>
                  <div className="mt-1 space-y-1">
                    {patient.clinics.map((clinicId, index) => (
                      <p key={index} className="text-sm text-slate-900 dark:text-white font-mono">
                        {clinicId}
                      </p>
                    ))}
                  </div>
                </div>
              )}
              <div>
                <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                  Created At
                </span>
                <p className="text-sm text-slate-900 dark:text-white mt-1">
                  {formatDateTime(patient.createdAt)}
                </p>
              </div>
              <div>
                <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                  Updated At
                </span>
                <p className="text-sm text-slate-900 dark:text-white mt-1">
                  {formatDateTime(patient.updatedAt)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

