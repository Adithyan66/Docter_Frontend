import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import {
  getVisitReminders,
  type VisitReminderResponseDto,
  type GetVisitRemindersQueryDto,
} from '@api/reminders'
import { getTreatmentNames, type TreatmentName } from '@api/treatments'
import { getClinicNames, type ClinicName } from '@api/clinics'
import { getTreatmentCourseById } from '@api/treatmentCourses'

const DEFAULT_LIMIT = 10
const DEFAULT_DAYS_BEFORE = 5
const DEFAULT_DAYS_AFTER = 5

export function useReminders() {
  const navigate = useNavigate()
  const [reminders, setReminders] = useState<VisitReminderResponseDto[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [treatmentOptions, setTreatmentOptions] = useState<TreatmentName[]>([])
  const [clinicOptions, setClinicOptions] = useState<ClinicName[]>([])
  const [isLoadingOptions, setIsLoadingOptions] = useState(true)

  const [filters, setFilters] = useState<{
    daysBefore?: number
    daysAfter?: number
    treatmentIds: string[]
    clinicIds: string[]
  }>({
    daysBefore: DEFAULT_DAYS_BEFORE,
    daysAfter: DEFAULT_DAYS_AFTER,
    treatmentIds: [],
    clinicIds: [],
  })

  const [pendingFilters, setPendingFilters] = useState<{
    daysBefore?: number
    daysAfter?: number
    treatmentIds: string[]
    clinicIds: string[]
  }>({
    daysBefore: DEFAULT_DAYS_BEFORE,
    daysAfter: DEFAULT_DAYS_AFTER,
    treatmentIds: [],
    clinicIds: [],
  })

  const treatmentButtonRef = useRef<HTMLButtonElement>(null)
  const clinicButtonRef = useRef<HTMLButtonElement>(null)
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        setIsLoadingOptions(true)
        const [treatments, clinics] = await Promise.all([
          getTreatmentNames(),
          getClinicNames(),
        ])
        setTreatmentOptions(treatments)
        setClinicOptions(clinics)
      } catch (error: any) {
        const errorMessage =
          error?.response?.data?.error?.message ||
          error?.response?.data?.message ||
          error?.message ||
          'Unable to fetch options. Please try again.'
        toast.error(errorMessage)
      } finally {
        setIsLoadingOptions(false)
      }
    }

    fetchOptions()
  }, [])

  useEffect(() => {
    setCurrentPage(1)
  }, [filters])

  useEffect(() => {
    const fetchReminders = async () => {
      try {
        setIsLoading(true)
        const params: GetVisitRemindersQueryDto = {
          page: currentPage,
          limit: DEFAULT_LIMIT,
          daysBefore: filters.daysBefore,
          daysAfter: filters.daysAfter,
        }

        if (filters.treatmentIds.length > 0) {
          params.treatmentId = filters.treatmentIds.join(',')
        }

        if (filters.clinicIds.length > 0) {
          params.clinicId = filters.clinicIds.join(',')
        }

        const response = await getVisitReminders(params)
        setReminders(response.reminders || [])
        setTotalPages(response.totalPages || 1)
        setTotal(response.total || 0)
      } catch (error: any) {
        const errorMessage =
          error?.response?.data?.error?.message ||
          error?.response?.data?.message ||
          error?.message ||
          'Unable to fetch reminders. Please try again.'
        toast.error(errorMessage)
      } finally {
        setIsLoading(false)
      }
    }

    fetchReminders()
  }, [currentPage, filters])

  const handleApplyFilters = () => {
    setFilters({ ...pendingFilters })
  }

  const handleClearAllFilters = () => {
    const clearedFilters = {
      daysBefore: DEFAULT_DAYS_BEFORE,
      daysAfter: DEFAULT_DAYS_AFTER,
      treatmentIds: [],
      clinicIds: [],
    }
    setPendingFilters(clearedFilters)
    setFilters(clearedFilters)
  }

  const hasPendingChanges =
    pendingFilters.daysBefore !== filters.daysBefore ||
    pendingFilters.daysAfter !== filters.daysAfter ||
    JSON.stringify(pendingFilters.treatmentIds.sort()) !== JSON.stringify(filters.treatmentIds.sort()) ||
    JSON.stringify(pendingFilters.clinicIds.sort()) !== JSON.stringify(filters.clinicIds.sort())

  const activeFilterCount =
    (pendingFilters.treatmentIds.length > 0 ? 1 : 0) +
    (pendingFilters.clinicIds.length > 0 ? 1 : 0) +
    (pendingFilters.daysBefore !== DEFAULT_DAYS_BEFORE ? 1 : 0) +
    (pendingFilters.daysAfter !== DEFAULT_DAYS_AFTER ? 1 : 0)

  const handleRowClick = async (reminder: VisitReminderResponseDto) => {
    try {
      const treatmentCourse = await getTreatmentCourseById(reminder.treatmentCourseId)
      navigate(`/patients/${treatmentCourse.patientId}`)
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.error?.message ||
        error?.response?.data?.message ||
        error?.message ||
        'Unable to fetch patient information. Please try again.'
      toast.error(errorMessage)
    }
  }

  const formatDate = (date: Date | string) => {
    const d = typeof date === 'string' ? new Date(date) : date
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const treatmentDropdownOptions = treatmentOptions.map((t) => ({
    value: t.id,
    label: t.name,
  }))

  const clinicDropdownOptions = clinicOptions.map((c) => ({
    value: c.id,
    label: c.name,
  }))

  return {
    reminders,
    isLoading,
    currentPage,
    totalPages,
    total,
    limit: DEFAULT_LIMIT,
    filters: pendingFilters,
    treatmentOptions: treatmentDropdownOptions,
    clinicOptions: clinicDropdownOptions,
    isLoadingOptions,
    activeFilterCount,
    hasPendingChanges,
    treatmentButtonRef,
    clinicButtonRef,
    openDropdown,
    setOpenDropdown,
    setCurrentPage,
    setPendingFilters,
    handleApplyFilters,
    handleClearAllFilters,
    handleRowClick,
    formatDate,
  }
}

