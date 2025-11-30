import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { getPatientById, type PatientDetails } from '@api/patients'
import { getTreatmentCourseById, type TreatmentCourse } from '@api/treatmentCourses'
import { getTreatment, type Treatment } from '@api/treatments'
import { getVisits, type VisitResponseDto } from '@api/visits'
import { useDebounce } from '@hooks/utils/useDebounce'
import { useNavigate } from 'react-router-dom'

const DEFAULT_VISITS_LIMIT = 10

export function usePatientDetails(patientId: string | undefined) {
  const [patient, setPatient] = useState<PatientDetails | null>(null)
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
    limit: DEFAULT_VISITS_LIMIT,
    total: 0,
    totalPages: 0,
  })
  const [isLoadingVisits, setIsLoadingVisits] = useState(false)
  const [visitsSearch, setVisitsSearch] = useState('')
  const debouncedSearch = useDebounce(visitsSearch, 500)
  const navigate = useNavigate()
  useEffect(() => {
    setVisitsPagination((prev) => ({ ...prev, page: 1 }))
  }, [debouncedSearch])

  const fetchPatient = async () => {
    if (!patientId) return

    try {
      setIsLoading(true)
      const patientData = await getPatientById(patientId)
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
  }, [patientId])

  useEffect(() => {
    if (patient?.treatmentCourses && patient.treatmentCourses.length > 0 && !selectedCourseId) {
      setSelectedCourseId(patient.treatmentCourses[0].id)
    }
  }, [patient?.treatmentCourses])

  useEffect(() => {
    const fetchCourseDetails = async () => {
      if (!selectedCourseId) {
        setCourseDetails(null)
        setVisits([])
        setVisitsPagination({ page: 1, limit: DEFAULT_VISITS_LIMIT, total: 0, totalPages: 0 })
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
        setVisitsPagination({ page: 1, limit: DEFAULT_VISITS_LIMIT, total: 0, totalPages: 0 })
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

  const handleCourseSelect = (courseId: string) => {
    setSelectedCourseId(courseId)
  }

  const handleTreatmentDetailsClick = async () => {
    if (!courseDetails?.treatmentId) return

   navigate(`/treatment/${courseDetails.treatmentId}`)
  }

  const handleCloseTreatmentModal = () => {
    setIsTreatmentModalOpen(false)
    setTreatmentDetails(null)
  }

  const handleCreateTreatmentCourseSuccess = () => {
    setIsModalOpen(false)
    fetchPatient()
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

  const formatDateWithTime = (dateString?: string) => {
    if (!dateString) return '-'
    try {
      const date = new Date(dateString)
      const dateStr = date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
      const timeStr = date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      })
      return `${dateStr} ${timeStr}`
    } catch {
      return '-'
    }
  }

  return {
    patient,
    isLoading,
    isModalOpen,
    setIsModalOpen,
    selectedCourseId,
    courseDetails,
    isLoadingCourse,
    isTreatmentModalOpen,
    treatmentDetails,
    isLoadingTreatment,
    viewMode,
    isVisitModalOpen,
    setIsVisitModalOpen,
    visits,
    visitsPagination,
    isLoadingVisits,
    visitsSearch,
    setVisitsSearch,
    handleVisitsPageChange,
    handleVisitSuccess,
    handleProfileInfoClick,
    handleCourseSelect,
    handleTreatmentDetailsClick,
    handleCloseTreatmentModal,
    handleCreateTreatmentCourseSuccess,
    formatDate,
    formatDateTime,
    formatDateWithTime,
  }
}

