import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { getClinicWithStatistics, deleteClinic, updateClinic, type ClinicWithStatistics, type GetClinicWithStatisticsParams } from '@api/clinics'

const INITIAL_IMAGES_TO_SHOW = 6
const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

export function useClinicDetails(clinicId: string | undefined) {
  const navigate = useNavigate()
  const [clinic, setClinic] = useState<ClinicWithStatistics | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [dateFilters, setDateFilters] = useState<{
    startDateFrom?: string
    startDateTo?: string
  }>({})
  const [viewerImage, setViewerImage] = useState<string | null>(null)
  const [isViewerOpen, setIsViewerOpen] = useState(false)
  const [showAllImages, setShowAllImages] = useState(false)
  const [startDateFrom, setStartDateFrom] = useState('')
  const [startDateTo, setStartDateTo] = useState('')
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [statusModalOpen, setStatusModalOpen] = useState(false)
  const [isTogglingStatus, setIsTogglingStatus] = useState(false)

  const fetchClinic = async (params?: GetClinicWithStatisticsParams) => {
    if (!clinicId) return

    try {
      setIsLoading(true)
      const clinicData = await getClinicWithStatistics(clinicId, {
        includeStatistics: true,
        ...params,
      })
      setClinic(clinicData)
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.error?.message ||
        error?.response?.data?.message ||
        error?.message ||
        'Unable to fetch clinic details. Please try again.'
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchClinic(dateFilters)
  }, [clinicId, dateFilters.startDateFrom, dateFilters.startDateTo])

  const handleDateFilterChange = (startDateFrom?: string, startDateTo?: string) => {
    setDateFilters({
      startDateFrom: startDateFrom || undefined,
      startDateTo: startDateTo || undefined,
    })
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

  const formatTime = (time?: string) => {
    if (!time) return '-'
    return time
  }

  const getWorkingDaysMap = useMemo(() => {
    if (!clinic?.workingDays || clinic.workingDays.length === 0) {
      return new Map()
    }
    return new Map(
      clinic.workingDays.map((wd) => [wd.day, { start: wd.startTime, end: wd.endTime }])
    )
  }, [clinic?.workingDays])

  const getPaymentMethodColor = (method: string) => {
    const colors: Record<string, string> = {
      cash: 'bg-green-500',
      card: 'bg-blue-500',
      upi: 'bg-purple-500',
      bank: 'bg-indigo-500',
      insurance: 'bg-yellow-500',
      online: 'bg-pink-500',
    }
    return colors[method] || 'bg-slate-500'
  }

  const getPaymentMethodLabel = (method: string) => {
    const labels: Record<string, string> = {
      cash: 'Cash',
      card: 'Card',
      upi: 'UPI',
      bank: 'Bank',
      insurance: 'Insurance',
      online: 'Online',
    }
    return labels[method] || method
  }

  const displayedImages = useMemo(() => {
    if (!clinic?.images) return []
    return showAllImages ? clinic.images : clinic.images.slice(0, INITIAL_IMAGES_TO_SHOW)
  }, [clinic?.images, showAllImages])

  const hasMoreImages = useMemo(() => {
    return clinic?.images && clinic.images.length > INITIAL_IMAGES_TO_SHOW
  }, [clinic?.images])

  const maxRevenue = useMemo(() => {
    const statistics = clinic?.statistics
    if (!statistics?.revenue) return 0
    return Math.max(...Object.values(statistics.revenue.byPaymentMethod))
  }, [clinic?.statistics])

  const handleApplyDateFilter = () => {
    handleDateFilterChange(startDateFrom || undefined, startDateTo || undefined)
  }

  const handleClearDateFilter = () => {
    setStartDateFrom('')
    setStartDateTo('')
    handleDateFilterChange(undefined, undefined)
  }

  const handleDelete = () => {
    setDeleteModalOpen(true)
  }

  const confirmDelete = async () => {
    if (!clinicId || isDeleting) return

    try {
      setIsDeleting(true)
      await deleteClinic(clinicId)
      toast.success('Clinic deleted successfully.')
      setTimeout(() => navigate('/clinics'), 800)
    } catch (error: any) {
      setIsDeleting(false)
      const errorMessage =
        error?.response?.data?.error?.message ||
        error?.response?.data?.message ||
        error?.message ||
        'Unable to delete clinic. Please try again.'
      toast.error(errorMessage)
    }
  }

  const closeDeleteModal = () => {
    setDeleteModalOpen(false)
  }

  const handleToggleStatus = () => {
    setStatusModalOpen(true)
  }

  const confirmToggleStatus = async () => {
    if (!clinicId || !clinic || isTogglingStatus) return

    try {
      setIsTogglingStatus(true)
      await updateClinic(clinicId, {
        isActive: !clinic.isActive,
      })
      toast.success(`Clinic marked as ${!clinic.isActive ? 'active' : 'inactive'} successfully.`)
      setStatusModalOpen(false)
      await fetchClinic(dateFilters)
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.error?.message ||
        error?.response?.data?.message ||
        error?.message ||
        'Unable to update clinic status. Please try again.'
      toast.error(errorMessage)
    } finally {
      setIsTogglingStatus(false)
    }
  }

  const closeStatusModal = () => {
    setStatusModalOpen(false)
  }

  return {
    clinic,
    isLoading,
    dateFilters,
    viewerImage,
    isViewerOpen,
    showAllImages,
    startDateFrom,
    startDateTo,
    deleteModalOpen,
    isDeleting,
    statusModalOpen,
    isTogglingStatus,
    displayedImages,
    hasMoreImages,
    workingDaysMap: getWorkingDaysMap,
    maxRevenue,
    daysOfWeek,
    handleDateFilterChange,
    formatDate,
    formatDateTime,
    formatTime,
    fetchClinic,
    handleApplyDateFilter,
    handleClearDateFilter,
    setStartDateFrom,
    setStartDateTo,
    setViewerImage,
    setIsViewerOpen,
    setShowAllImages,
    handleDelete,
    confirmDelete,
    closeDeleteModal,
    handleToggleStatus,
    confirmToggleStatus,
    closeStatusModal,
    getPaymentMethodColor,
    getPaymentMethodLabel,
    navigate,
  }
}

