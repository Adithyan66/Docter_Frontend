import { useState, useEffect, useRef, useMemo } from 'react'
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
import { useAppSelector } from '@hooks/store'

const DEFAULT_LIMIT = 10
const DEFAULT_DAYS_BEFORE = 5
const DEFAULT_DAYS_AFTER = 5

export function useReminders() {
  const navigate = useNavigate()
  const authUser = useAppSelector((state) => state.auth.user) as
    | {
        id: string
        email: string
        role?: 'doctor' | 'staff'
        clinicId?: string
        clinicName?: string
        clinics?: Array<string | { id?: string; name?: string; clinicId?: string; clinicName?: string }>
      }
    | null
  const isStaff = authUser?.role === 'staff'
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

  const [pendingModalFilters, setPendingModalFilters] = useState<{
    daysBefore?: number
    daysAfter?: number
  }>({
    daysBefore: DEFAULT_DAYS_BEFORE,
    daysAfter: DEFAULT_DAYS_AFTER,
  })

  const [activeDelayedFilter, setActiveDelayedFilter] = useState<'5-30' | '30-60' | '60+' | null>(null)

  const treatmentButtonRef = useRef<HTMLButtonElement>(null)
  const clinicButtonRef = useRef<HTMLButtonElement>(null)
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  const hasAppliedStaffDefault = useRef(false)

  const staffClinics = useMemo(() => {
    if (!isStaff) return []
    const list: ClinicName[] = []
    if (Array.isArray(authUser?.clinics)) {
      authUser?.clinics.forEach((entry) => {
        if (typeof entry === 'string') {
          list.push({ id: entry, name: entry })
          return
        }
        const id = entry?.id || entry?.clinicId
        const name = entry?.name || entry?.clinicName || id || ''
        if (id) list.push({ id, name })
      })
    } else if (authUser?.clinicId) {
      list.push({ id: authUser.clinicId, name: authUser.clinicName || authUser.clinicId })
    }
    return list
  }, [authUser, isStaff])

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        setIsLoadingOptions(true)
        if (isStaff) {
          setClinicOptions(staffClinics)
          try {
            const treatments = await getTreatmentNames()
            setTreatmentOptions(treatments)
          } catch (error: any) {
            const errorMessage =
              error?.response?.data?.error?.message ||
              error?.response?.data?.message ||
              error?.message ||
              'Unable to fetch treatments. Please try again.'
            toast.error(errorMessage)
          }
        } else {
          const [treatments, clinics] = await Promise.all([
            getTreatmentNames(),
            getClinicNames(),
          ])
          setTreatmentOptions(treatments)
          setClinicOptions(clinics)
        }
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
  }, [isStaff, staffClinics])

  useEffect(() => {
    if (!isStaff || hasAppliedStaffDefault.current) return
    if (staffClinics.length === 1) {
      const singleClinicId = staffClinics[0].id
      if (filters.clinicIds.length === 0 || filters.clinicIds[0] !== singleClinicId) {
        setFilters((prev) => ({ ...prev, clinicIds: [singleClinicId] }))
      }
      setPendingFilters((prev) => ({ ...prev, clinicIds: [singleClinicId] }))
      hasAppliedStaffDefault.current = true
    } else {
      hasAppliedStaffDefault.current = true
    }
  }, [isStaff, staffClinics, filters.clinicIds])

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
    const newFilters = {
      ...pendingFilters,
      daysBefore: pendingModalFilters.daysBefore,
      daysAfter: pendingModalFilters.daysAfter,
    }
    setFilters(newFilters)
    setPendingFilters(newFilters)
  }

  const handleClearAllFilters = () => {
    const clearedFilters = {
      daysBefore: DEFAULT_DAYS_BEFORE,
      daysAfter: DEFAULT_DAYS_AFTER,
      treatmentIds: [],
      clinicIds: [],
    }
    setPendingFilters(clearedFilters)
    setPendingModalFilters({
      daysBefore: DEFAULT_DAYS_BEFORE,
      daysAfter: DEFAULT_DAYS_AFTER,
    })
    setFilters(clearedFilters)
    setActiveDelayedFilter(null)
  }

  const handleDelayedFilter = (range: '5-30' | '30-60' | '60+') => {
    if (activeDelayedFilter === range) {
      setActiveDelayedFilter(null)
      const clearedFilters = {
        ...pendingFilters,
        daysBefore: DEFAULT_DAYS_BEFORE,
        daysAfter: DEFAULT_DAYS_AFTER,
      }
      setPendingFilters(clearedFilters)
      setPendingModalFilters({
        daysBefore: DEFAULT_DAYS_BEFORE,
        daysAfter: DEFAULT_DAYS_AFTER,
      })
      setFilters(clearedFilters)
    } else {
      setActiveDelayedFilter(range)
      let daysBefore: number
      let daysAfter: number | undefined

      if (range === '5-30') {
        daysBefore = -5
        daysAfter = -30
      } else if (range === '30-60') {
        daysBefore = -30
        daysAfter = -60
      } else {
        daysBefore = -60
        daysAfter = -3650
      }

      const newFilters = {
        ...pendingFilters,
        daysBefore,
        daysAfter,
      }
      setPendingFilters(newFilters)
      setPendingModalFilters({
        daysBefore,
        daysAfter,
      })
      setFilters(newFilters)
    }
  }

  const hasPendingChanges =
    pendingFilters.daysBefore !== filters.daysBefore ||
    pendingFilters.daysAfter !== filters.daysAfter ||
    JSON.stringify(pendingFilters.treatmentIds.sort()) !== JSON.stringify(filters.treatmentIds.sort()) ||
    JSON.stringify(pendingFilters.clinicIds.sort()) !== JSON.stringify(filters.clinicIds.sort()) ||
    pendingModalFilters.daysBefore !== filters.daysBefore ||
    pendingModalFilters.daysAfter !== filters.daysAfter

  const activeFilterCount =
    (pendingFilters.treatmentIds.length > 0 ? 1 : 0) +
    (pendingFilters.clinicIds.length > 0 ? 1 : 0) +
    (pendingModalFilters.daysBefore !== DEFAULT_DAYS_BEFORE ? 1 : 0) +
    (pendingModalFilters.daysAfter !== DEFAULT_DAYS_AFTER ? 1 : 0) +
    (activeDelayedFilter !== null ? 1 : 0)

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

  const isStaffWithSingleClinic = isStaff && staffClinics.length === 1
  const staffSingleClinic = isStaffWithSingleClinic ? staffClinics[0] : null

  return {
    reminders,
    isLoading,
    currentPage,
    totalPages,
    total,
    limit: DEFAULT_LIMIT,
    filters: pendingFilters,
    pendingModalFilters,
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
    setPendingModalFilters,
    handleApplyFilters,
    handleClearAllFilters,
    handleDelayedFilter,
    activeDelayedFilter,
    handleRowClick,
    formatDate,
    isStaffWithSingleClinic,
    staffSingleClinic,
  }
}

