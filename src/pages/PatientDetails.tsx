import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { getPatientById, type Patient } from '@api/patients'
import { useAppSelector } from '@hooks/store'
import CreateTreatmentCourseModal from '@components/treatment/CreateTreatmentCourseModal'
import { getTreatmentCourseById, type TreatmentCourse } from '@api/treatmentCourses'
import { getTreatment, type Treatment } from '@api/treatments'
import CreateVisitModal from '@components/visit/CreateVisitModal'
import { getVisits, type VisitResponseDto } from '@api/visits'
import Pagination from '@components/common/Pagination'
import { useDebounce } from '@hooks/utils/useDebounce'

export default function PatientDetails() {
  const { id } = useParams<{ id: string }>()
  const [patient, setPatient] = useState<Patient | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null)
  const [courseDetails, setCourseDetails] = useState<TreatmentCourse | null>(null)
  const [isLoadingCourse, setIsLoadingCourse] = useState(false)
  const [isTreatmentModalOpen, setIsTreatmentModalOpen] = useState(false)
  const [treatmentDetails, setTreatmentDetails] = useState<Treatment | null>(null)
  const [isLoadingTreatment, setIsLoadingTreatment] = useState(false)
  const [viewMode, setViewMode] = useState<'profile' | 'course'>('profile')
  const [isVisitModalOpen, setIsVisitModalOpen] = useState(false)
  const [visits, setVisits] = useState<VisitResponseDto[]>([])
  const [visitsPagination, setVisitsPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  })
  const [isLoadingVisits, setIsLoadingVisits] = useState(false)
  const [visitsSearch, setVisitsSearch] = useState('')
  const debouncedSearch = useDebounce(visitsSearch, 500)

  useEffect(() => {
    setVisitsPagination((prev) => ({ ...prev, page: 1 }))
  }, [debouncedSearch])
  const doctorId = useAppSelector((state) => state.auth.user?.id || '')

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

  useEffect(() => {
    fetchPatient()
  }, [id])

  useEffect(() => {
    const fetchCourseDetails = async () => {
      if (!selectedCourseId) {
        setCourseDetails(null)
        setVisits([])
        setVisitsPagination({ page: 1, limit: 10, total: 0, totalPages: 0 })
        return
      }

      try {
        setIsLoadingCourse(true)
        const courseData = await getTreatmentCourseById(selectedCourseId)
        setCourseDetails(courseData)
        setViewMode('course')
      } catch (error: any) {
        const errorMessage =
          error?.response?.data?.error?.message ||
          error?.response?.data?.message ||
          error?.message ||
          'Unable to fetch course details. Please try again.'
        toast.error(errorMessage)
        setSelectedCourseId(null)
      } finally {
        setIsLoadingCourse(false)
      }
    }

    fetchCourseDetails()
  }, [selectedCourseId])

  useEffect(() => {
    const fetchVisits = async () => {
      if (!selectedCourseId || !patient?.id) {
        setVisits([])
        setVisitsPagination({ page: 1, limit: 10, total: 0, totalPages: 0 })
        return
      }

      try {
        setIsLoadingVisits(true)
        const response = await getVisits({
          page: visitsPagination.page,
          limit: visitsPagination.limit,
          courseId: selectedCourseId,
          patientId: patient.id,
          notes: debouncedSearch || undefined,
          sortBy: 'visitDate',
          sortOrder: 'desc',
          include: 'prescription,media',
        })
        setVisits(response.visits)
        setVisitsPagination({
          page: response.page,
          limit: response.limit,
          total: response.total,
          totalPages: response.totalPages,
        })
      } catch (error: any) {
        const errorMessage =
          error?.response?.data?.error?.message ||
          error?.response?.data?.message ||
          error?.message ||
          'Unable to fetch visits. Please try again.'
        toast.error(errorMessage)
      } finally {
        setIsLoadingVisits(false)
      }
    }

    fetchVisits()
  }, [selectedCourseId, patient?.id, visitsPagination.page, debouncedSearch])

  const handleVisitsPageChange = (page: number) => {
    setVisitsPagination((prev) => ({ ...prev, page }))
  }

  const handleVisitSuccess = () => {
    setVisitsPagination((prev) => ({ ...prev, page: 1 }))
    setVisitsSearch('')
  }

  const handleProfileInfoClick = () => {
    setSelectedCourseId(null)
    setViewMode('profile')
    setCourseDetails(null)
  }

  const handleTreatmentDetailsClick = async () => {
    if (!courseDetails?.treatmentId) return

    try {
      setIsLoadingTreatment(true)
      setIsTreatmentModalOpen(true)
      const treatmentData = await getTreatment(courseDetails.treatmentId)
      setTreatmentDetails(treatmentData)
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.error?.message ||
        error?.response?.data?.message ||
        error?.message ||
        'Unable to fetch treatment details. Please try again.'
      toast.error(errorMessage)
      setIsTreatmentModalOpen(false)
    } finally {
      setIsLoadingTreatment(false)
    }
  }

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
          fetchPatient()
        }}
      />

      {courseDetails && (
        <CreateVisitModal
          isOpen={isVisitModalOpen}
          onClose={() => setIsVisitModalOpen(false)}
          patientId={patient.id}
          courseId={courseDetails.id}
          doctorId={doctorId}
          clinicId={courseDetails.clinicId}
          onSuccess={() => {
            setIsVisitModalOpen(false)
            handleVisitSuccess()
          }}
        />
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1 space-y-4">
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

          <div className="rounded-2xl border border-slate-200 bg-white/60 p-4 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/60">
            <button
              onClick={handleProfileInfoClick}
              className={`w-full rounded-lg px-4 py-2.5 text-sm font-medium transition-all ${
                viewMode === 'profile'
                  ? 'bg-blue-600 text-white hover:bg-blue-500 dark:bg-blue-500 dark:hover:bg-blue-400'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
              }`}
            >
              Profile Information
            </button>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white/60 p-4 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/60">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">
              Treatment Courses
            </h3>
            {patient.treatmentCourses && patient.treatmentCourses.length > 0 ? (
              <div className="space-y-2">
                {patient.treatmentCourses.map((course) => (
                  <button
                    key={course.id}
                    onClick={() => setSelectedCourseId(course.id)}
                    className={`w-full rounded-lg px-4 py-2.5 text-left text-sm font-medium transition-all ${
                      selectedCourseId === course.id
                        ? 'bg-blue-600 text-white hover:bg-blue-500 dark:bg-blue-500 dark:hover:bg-blue-400'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
                    }`}
                  >
                    {course.treatmentName}
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-600 dark:text-slate-400">
                No treatment courses yet
              </p>
            )}
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          {viewMode === 'profile' ? (
            <>
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
            </>
          ) : (
            <>
              {isLoadingCourse ? (
                <div className="flex items-center justify-center rounded-2xl bg-white/60 p-12 backdrop-blur-sm dark:bg-slate-900/60">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
                </div>
              ) : courseDetails ? (
                <>
                  <div className="rounded-2xl border border-slate-200 bg-white/60 p-6 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/60">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                        Course Details
                      </h3>
                      <div className="flex gap-2">
                        {courseDetails.treatmentId && (
                          <button
                            onClick={handleTreatmentDetailsClick}
                            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-blue-500 dark:bg-blue-500 dark:hover:bg-blue-400"
                          >
                            View Treatment Details
                          </button>
                        )}
                        <button
                          onClick={() => setIsVisitModalOpen(true)}
                          className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-green-500 dark:bg-green-500 dark:hover:bg-green-400"
                        >
                          Add Visit
                        </button>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                          Course ID
                        </span>
                        <p className="text-sm text-slate-900 dark:text-white mt-1 font-mono">
                          {courseDetails.id}
                        </p>
                      </div>
                      <div>
                        <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                          Treatment ID
                        </span>
                        <p className="text-sm text-slate-900 dark:text-white mt-1 font-mono">
                          {courseDetails.treatmentId}
                        </p>
                      </div>
                      <div>
                        <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                          Doctor ID
                        </span>
                        <p className="text-sm text-slate-900 dark:text-white mt-1 font-mono">
                          {courseDetails.doctorId}
                        </p>
                      </div>
                      <div>
                        <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                          Patient ID
                        </span>
                        <p className="text-sm text-slate-900 dark:text-white mt-1 font-mono">
                          {courseDetails.patientId}
                        </p>
                      </div>
                      {courseDetails.clinicId && (
                        <div>
                          <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                            Clinic ID
                          </span>
                          <p className="text-sm text-slate-900 dark:text-white mt-1 font-mono">
                            {courseDetails.clinicId}
                          </p>
                        </div>
                      )}
                      <div>
                        <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                          Status
                        </span>
                        <p className="text-sm text-slate-900 dark:text-white mt-1 capitalize">
                          {courseDetails.status}
                        </p>
                      </div>
                      <div>
                        <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                          Start Date
                        </span>
                        <p className="text-sm text-slate-900 dark:text-white mt-1">
                          {formatDate(courseDetails.startDate)}
                        </p>
                      </div>
                      {courseDetails.expectedEndDate && (
                        <div>
                          <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                            Expected End Date
                          </span>
                          <p className="text-sm text-slate-900 dark:text-white mt-1">
                            {formatDate(courseDetails.expectedEndDate)}
                          </p>
                        </div>
                      )}
                      <div>
                        <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                          Total Cost
                        </span>
                        <p className="text-sm text-slate-900 dark:text-white mt-1">
                          ₹{courseDetails.totalCost.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                          Total Paid
                        </span>
                        <p className="text-sm text-slate-900 dark:text-white mt-1">
                          ₹{courseDetails.totalPaid.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                          Remaining
                        </span>
                        <p className="text-sm text-slate-900 dark:text-white mt-1">
                          ₹{(courseDetails.totalCost - courseDetails.totalPaid).toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                          Payment Completed
                        </span>
                        <p className="text-sm text-slate-900 dark:text-white mt-1">
                          {courseDetails.isPaymentCompleted ? 'Yes' : 'No'}
                        </p>
                      </div>
                      <div>
                        <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                          Medically Completed
                        </span>
                        <p className="text-sm text-slate-900 dark:text-white mt-1">
                          {courseDetails.isMedicallyCompleted ? 'Yes' : 'No'}
                        </p>
                      </div>
                      {courseDetails.notes && (
                        <div className="md:col-span-2">
                          <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                            Notes
                          </span>
                          <p className="text-sm text-slate-900 dark:text-white mt-1 whitespace-pre-line">
                            {courseDetails.notes}
                          </p>
                        </div>
                      )}
                      <div>
                        <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                          Visits Count
                        </span>
                        <p className="text-sm text-slate-900 dark:text-white mt-1">
                          {courseDetails.visits?.length || 0}
                        </p>
                      </div>
                      <div>
                        <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                          Payments Count
                        </span>
                        <p className="text-sm text-slate-900 dark:text-white mt-1">
                          {courseDetails.payments?.length || 0}
                        </p>
                      </div>
                      <div>
                        <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                          Created At
                        </span>
                        <p className="text-sm text-slate-900 dark:text-white mt-1">
                          {formatDateTime(courseDetails.createdAt)}
                        </p>
                      </div>
                      <div>
                        <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                          Updated At
                        </span>
                        <p className="text-sm text-slate-900 dark:text-white mt-1">
                          {formatDateTime(courseDetails.updatedAt)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-white/60 p-6 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/60">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                        Visits ({visitsPagination.total})
                      </h3>
                      <div className="w-64">
                        <input
                          type="text"
                          value={visitsSearch}
                          onChange={(e) => setVisitsSearch(e.target.value)}
                          placeholder="Search by notes..."
                          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                        />
                      </div>
                    </div>

                    {isLoadingVisits ? (
                      <div className="flex items-center justify-center py-12">
                        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
                      </div>
                    ) : visits.length > 0 ? (
                      <>
                        <div className="space-y-4 mb-6">
                          {visits.map((visit) => (
                            <div
                              key={visit.id}
                              className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800"
                            >
                              <div className="flex items-start justify-between mb-3">
                                <div>
                                  <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
                                    Visit on {formatDate(visit.visitDate)}
                                  </h4>
                                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                    {formatDateTime(visit.createdAt)}
                                  </p>
                                </div>
                                {visit.billedAmount && (
                                  <span className="rounded-lg bg-green-100 px-3 py-1 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">
                                    ₹{visit.billedAmount.toLocaleString()}
                                  </span>
                                )}
                              </div>

                              {visit.notes && (
                                <p className="text-sm text-slate-700 dark:text-slate-300 mb-3 whitespace-pre-line">
                                  {visit.notes}
                                </p>
                              )}

                              {visit.prescription && (
                                <div className="mb-3 rounded-lg bg-blue-50 p-3 dark:bg-blue-900/20">
                                  <h5 className="text-xs font-semibold text-blue-900 dark:text-blue-200 mb-2">
                                    Prescription
                                  </h5>
                                  {visit.prescription.diagnosis && visit.prescription.diagnosis.length > 0 && (
                                    <div className="mb-2">
                                      <span className="text-xs font-medium text-blue-700 dark:text-blue-300">
                                        Diagnosis:{' '}
                                      </span>
                                      <span className="text-xs text-blue-600 dark:text-blue-400">
                                        {visit.prescription.diagnosis.join(', ')}
                                      </span>
                                    </div>
                                  )}
                                  {visit.prescription.items && visit.prescription.items.length > 0 && (
                                    <div className="space-y-1">
                                      {visit.prescription.items.map((item, idx) => (
                                        <div key={idx} className="text-xs text-blue-700 dark:text-blue-300">
                                          <span className="font-medium">{item.medicineName}</span>
                                          {item.dosage && <span> - {item.dosage}</span>}
                                          {item.frequency && <span>, {item.frequency}</span>}
                                          {item.duration && <span> ({item.duration})</span>}
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              )}

                              {visit.media && visit.media.length > 0 && (
                                <div className="grid grid-cols-3 gap-2">
                                  {visit.media.map((media, idx) => (
                                    <div key={media.id || idx} className="relative group">
                                      <img
                                        src={media.url}
                                        alt={media.notes || `Media ${idx + 1}`}
                                        className="h-24 w-full rounded-lg object-cover border border-slate-200 dark:border-slate-700 cursor-pointer hover:opacity-80 transition-opacity"
                                        onClick={() => window.open(media.url, '_blank')}
                                      />
                                      <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs p-1 rounded-b-lg opacity-0 group-hover:opacity-100 transition-opacity">
                                        <p className="truncate">{media.type}</p>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>

                        {visitsPagination.totalPages > 1 && (
                          <Pagination
                            currentPage={visitsPagination.page}
                            totalPages={visitsPagination.totalPages}
                            onPageChange={handleVisitsPageChange}
                          />
                        )}
                      </>
                    ) : (
                      <div className="text-center py-12 text-sm text-slate-600 dark:text-slate-400">
                        No visits found
                      </div>
                    )}
                  </div>
                </>
              ) : null}
            </>
          )}
        </div>
      </div>

      {isTreatmentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
            <div className="sticky top-0 flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4 dark:border-slate-800 dark:bg-slate-900">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                Treatment Details
              </h2>
              <button
                onClick={() => {
                  setIsTreatmentModalOpen(false)
                  setTreatmentDetails(null)
                }}
                className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
              >
                <svg
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <div className="p-6">
              {isLoadingTreatment ? (
                <div className="flex items-center justify-center p-12">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
                </div>
              ) : treatmentDetails ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                        Treatment ID
                      </span>
                      <p className="text-sm text-slate-900 dark:text-white mt-1 font-mono">
                        {treatmentDetails.id}
                      </p>
                    </div>
                    <div>
                      <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                        Name
                      </span>
                      <p className="text-sm text-slate-900 dark:text-white mt-1">
                        {treatmentDetails.name}
                      </p>
                    </div>
                    {treatmentDetails.description && (
                      <div className="md:col-span-2">
                        <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                          Description
                        </span>
                        <p className="text-sm text-slate-900 dark:text-white mt-1 whitespace-pre-line">
                          {treatmentDetails.description}
                        </p>
                      </div>
                    )}
                    {treatmentDetails.minDuration !== undefined && (
                      <div>
                        <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                          Min Duration (days)
                        </span>
                        <p className="text-sm text-slate-900 dark:text-white mt-1">
                          {treatmentDetails.minDuration}
                        </p>
                      </div>
                    )}
                    {treatmentDetails.maxDuration !== undefined && (
                      <div>
                        <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                          Max Duration (days)
                        </span>
                        <p className="text-sm text-slate-900 dark:text-white mt-1">
                          {treatmentDetails.maxDuration}
                        </p>
                      </div>
                    )}
                    {treatmentDetails.avgDuration !== undefined && (
                      <div>
                        <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                          Avg Duration (days)
                        </span>
                        <p className="text-sm text-slate-900 dark:text-white mt-1">
                          {treatmentDetails.avgDuration}
                        </p>
                      </div>
                    )}
                    {treatmentDetails.minFees !== undefined && (
                      <div>
                        <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                          Min Fees
                        </span>
                        <p className="text-sm text-slate-900 dark:text-white mt-1">
                          ₹{treatmentDetails.minFees.toLocaleString()}
                        </p>
                      </div>
                    )}
                    {treatmentDetails.maxFees !== undefined && (
                      <div>
                        <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                          Max Fees
                        </span>
                        <p className="text-sm text-slate-900 dark:text-white mt-1">
                          ₹{treatmentDetails.maxFees.toLocaleString()}
                        </p>
                      </div>
                    )}
                    {treatmentDetails.avgFees !== undefined && (
                      <div>
                        <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                          Avg Fees
                        </span>
                        <p className="text-sm text-slate-900 dark:text-white mt-1">
                          ₹{treatmentDetails.avgFees.toLocaleString()}
                        </p>
                      </div>
                    )}
                    <div>
                      <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                        Follow Up Required
                      </span>
                      <p className="text-sm text-slate-900 dark:text-white mt-1">
                        {treatmentDetails.followUpRequired ? 'Yes' : 'No'}
                      </p>
                    </div>
                    {treatmentDetails.followUpAfterDays !== undefined && (
                      <div>
                        <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                          Follow Up After (days)
                        </span>
                        <p className="text-sm text-slate-900 dark:text-white mt-1">
                          {treatmentDetails.followUpAfterDays}
                        </p>
                      </div>
                    )}
                    <div>
                      <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                        Created At
                      </span>
                      <p className="text-sm text-slate-900 dark:text-white mt-1">
                        {formatDateTime(treatmentDetails.createdAt)}
                      </p>
                    </div>
                    <div>
                      <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                        Updated At
                      </span>
                      <p className="text-sm text-slate-900 dark:text-white mt-1">
                        {formatDateTime(treatmentDetails.updatedAt)}
                      </p>
                    </div>
                  </div>

                  {treatmentDetails.steps && treatmentDetails.steps.length > 0 && (
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/50">
                      <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">
                        Steps
                      </h3>
                      <ol className="list-decimal list-inside space-y-2">
                        {treatmentDetails.steps.map((step, index) => (
                          <li
                            key={index}
                            className="text-sm text-slate-700 dark:text-slate-300"
                          >
                            {step}
                          </li>
                        ))}
                      </ol>
                    </div>
                  )}

                  {treatmentDetails.aftercare && treatmentDetails.aftercare.length > 0 && (
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/50">
                      <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">
                        Aftercare
                      </h3>
                      <ul className="list-disc list-inside space-y-2">
                        {treatmentDetails.aftercare.map((item, index) => (
                          <li
                            key={index}
                            className="text-sm text-slate-700 dark:text-slate-300"
                          >
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {treatmentDetails.risks && treatmentDetails.risks.length > 0 && (
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/50">
                      <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">
                        Risks
                      </h3>
                      <ul className="list-disc list-inside space-y-2">
                        {treatmentDetails.risks.map((risk, index) => (
                          <li
                            key={index}
                            className="text-sm text-slate-700 dark:text-slate-300"
                          >
                            {risk}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {treatmentDetails.images && treatmentDetails.images.length > 0 && (
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/50">
                      <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">
                        Images
                      </h3>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {treatmentDetails.images.map((imageUrl, index) => (
                          <img
                            key={index}
                            src={imageUrl}
                            alt={`Treatment ${index + 1}`}
                            className="h-32 w-full rounded-lg object-cover border border-slate-200 dark:border-slate-700"
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </section>
  )
}

