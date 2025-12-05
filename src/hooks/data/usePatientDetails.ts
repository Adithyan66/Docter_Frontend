import { useState, useEffect, useCallback } from 'react'
import toast from 'react-hot-toast'
import { getPatientById, updatePatientDefaultCourse, deletePatient, updatePatient, type PatientDetails, type PatientPayload } from '@api/patients'
import { getTreatmentCourseById, updateTreatmentCourse, deleteTreatmentCourse, type TreatmentCourse, type TreatmentCourseStatus } from '@api/treatmentCourses'
import { getTreatment, type Treatment } from '@api/treatments'
import { getVisits, deleteVisit, type VisitResponseDto } from '@api/visits'
import { useDebounce } from '@hooks/utils/useDebounce'
import { useNavigate } from 'react-router-dom'

const DEFAULT_VISITS_LIMIT = 5

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
  const [isSettingDefault, setIsSettingDefault] = useState(false)
  const [viewerImage, setViewerImage] = useState<string | null>(null)
  const [isViewerOpen, setIsViewerOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isTogglingStatus, setIsTogglingStatus] = useState(false)
  const [isEditCourseModalOpen, setIsEditCourseModalOpen] = useState(false)
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false)
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)
  const [isDeleteCourseModalOpen, setIsDeleteCourseModalOpen] = useState(false)
  const [isDeletingCourse, setIsDeletingCourse] = useState(false)
  const [editingVisit, setEditingVisit] = useState<VisitResponseDto | null>(null)
  const [isEditVisitModalOpen, setIsEditVisitModalOpen] = useState(false)
  const [deletingVisit, setDeletingVisit] = useState<VisitResponseDto | null>(null)
  const [isDeleteVisitModalOpen, setIsDeleteVisitModalOpen] = useState(false)
  const [isDeletingVisit, setIsDeletingVisit] = useState(false)
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

  useEffect(() => {
    fetchCourseDetails()
  }, [selectedCourseId])

  const fetchVisits = useCallback(async () => {
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
  }, [selectedCourseId, patient?.id, visitsPagination.page, visitsPagination.limit, debouncedSearch])

  useEffect(() => {
    fetchVisits()
  }, [fetchVisits])

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

  const handleSetDefaultCourse = async (courseId: string) => {
    if (!patient?.id || isSettingDefault) return

    try {
      setIsSettingDefault(true)
      await updatePatientDefaultCourse(patient.id, courseId)
      toast.success('Default treatment course updated successfully')
      await fetchPatient()
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.error?.message ||
        error?.response?.data?.message ||
        error?.message ||
        'Unable to set default treatment course. Please try again.'
      toast.error(errorMessage)
    } finally {
      setIsSettingDefault(false)
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

  const refetchAllData = async () => {
    await Promise.all([
      fetchPatient(),
      selectedCourseId ? fetchCourseDetails() : Promise.resolve(),
      selectedCourseId ? fetchVisits() : Promise.resolve(),
    ])
  }

  const handleDeletePatient = async () => {
    if (!patientId || isDeleting) return

    try {
      setIsDeleting(true)
      await deletePatient(patientId)
      toast.success('Patient deleted successfully.')
      setTimeout(() => navigate('/patients'), 800)
    } catch (error: any) {
      setIsDeleting(false)
      const errorMessage =
        error?.response?.data?.error?.message ||
        error?.response?.data?.message ||
        error?.message ||
        'Unable to delete patient. Please try again.'
      toast.error(errorMessage)
    }
  }

  const handleToggleStatus = async () => {
    if (!patient || !patientId || isTogglingStatus) return

    try {
      setIsTogglingStatus(true)
      const payload: PatientPayload = {
        firstName: patient.firstName || '',
        lastName: patient.lastName,
        fullName: patient.fullName,
        address: patient.address,
        profilePicUrl: patient.profilePicUrl,
        consultationType: patient.consultationType,
        primaryClinic: patient.primaryClinic,
        clinics: patient.clinics,
        dob: patient.dob,
        lastVisitAt: patient.lastVisitAt,
        age: patient.age,
        visitCount: patient.visitCount,
        gender: patient.gender,
        phone: patient.phone,
        email: patient.email,
        tags: patient.tags,
        isActive: !patient.isActive,
      }
      await updatePatient(patientId, payload)
      toast.success(`Patient marked as ${!patient.isActive ? 'active' : 'inactive'} successfully.`)
      await fetchPatient()
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.error?.message ||
        error?.response?.data?.message ||
        error?.message ||
        'Unable to update patient status. Please try again.'
      toast.error(errorMessage)
    } finally {
      setIsTogglingStatus(false)
    }
  }

  const handleStatusChange = async (status: TreatmentCourseStatus) => {
    if (!courseDetails) return

    try {
      setIsUpdatingStatus(true)
      await updateTreatmentCourse(courseDetails.id, { status })
      toast.success(`Status updated to ${status.charAt(0).toUpperCase() + status.slice(1)} successfully.`)
      setIsStatusModalOpen(false)
      await fetchCourseDetails()
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.error?.message ||
        error?.response?.data?.message ||
        error?.message ||
        'Unable to update status. Please try again.'
      toast.error(errorMessage)
    } finally {
      setIsUpdatingStatus(false)
    }
  }

  const handleDeleteCourse = async () => {
    if (!courseDetails || !selectedCourseId || isDeletingCourse) return

    try {
      setIsDeletingCourse(true)
      await deleteTreatmentCourse(courseDetails.id)
      toast.success('Treatment course deleted successfully.')
      setIsDeleteCourseModalOpen(false)
      await fetchPatient()
    } catch (error: any) {
      setIsDeletingCourse(false)
      const errorMessage =
        error?.response?.data?.error?.message ||
        error?.response?.data?.message ||
        error?.message ||
        'Unable to delete treatment course. Please try again.'
      toast.error(errorMessage)
    }
  }

  const handleEditVisit = (visit: VisitResponseDto) => {
    setEditingVisit(visit)
    setIsEditVisitModalOpen(true)
  }

  const handleDeleteVisitClick = (visit: VisitResponseDto) => {
    setIsDeletingVisit(false)
    setDeletingVisit(visit)
    setIsDeleteVisitModalOpen(true)
  }

  const handleDeleteVisit = async () => {
    const visitToDelete = deletingVisit
    if (!visitToDelete || isDeletingVisit) return

    try {
      setIsDeletingVisit(true)
      await deleteVisit(visitToDelete.id)
      toast.success('Visit deleted successfully.')
      setIsDeletingVisit(false)
      setIsDeleteVisitModalOpen(false)
      setDeletingVisit(null)
      await refetchAllData()
    } catch (error: any) {
      setIsDeletingVisit(false)
      const errorMessage =
        error?.response?.data?.error?.message ||
        error?.response?.data?.message ||
        error?.message ||
        'Unable to delete visit. Please try again.'
      toast.error(errorMessage)
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
    viewerImage,
    isViewerOpen,
    isDeleteModalOpen,
    isDeleting,
    isTogglingStatus,
    isEditCourseModalOpen,
    isStatusModalOpen,
    isUpdatingStatus,
    isDeleteCourseModalOpen,
    isDeletingCourse,
    editingVisit,
    isEditVisitModalOpen,
    deletingVisit,
    isDeleteVisitModalOpen,
    isDeletingVisit,
    handleVisitsPageChange,
    handleVisitSuccess,
    handleProfileInfoClick,
    handleCourseSelect,
    handleTreatmentDetailsClick,
    handleCloseTreatmentModal,
    handleCreateTreatmentCourseSuccess,
    handleSetDefaultCourse,
    isSettingDefault,
    fetchPatient,
    fetchCourseDetails,
    fetchVisits,
    refetchAllData,
    formatDate,
    formatDateTime,
    formatDateWithTime,
    handleDeletePatient,
    handleToggleStatus,
    handleStatusChange,
    handleDeleteCourse,
    handleEditVisit,
    handleDeleteVisitClick,
    handleDeleteVisit,
    setViewerImage,
    setIsViewerOpen,
    setIsDeleteModalOpen,
    setIsEditCourseModalOpen,
    setIsStatusModalOpen,
    setIsDeleteCourseModalOpen,
    setEditingVisit,
    setIsEditVisitModalOpen,
    setDeletingVisit,
    setIsDeleteVisitModalOpen,
    setIsDeletingVisit,
    navigate,
  }
}

