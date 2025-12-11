import { useState, useEffect, useMemo, useRef } from 'react'
import toast from 'react-hot-toast'
import { getPatients, getClinicNames, type Patient, type GetPatientsParams, type ClinicName } from '@api/patients'
import { useDebounce } from '@hooks/utils/useDebounce'
import { useAppDispatch, useAppSelector } from '@hooks/store'
import { setSearch, setFilters, setCurrentPage, clearAllFilters } from '@redux/slices/patientsSlice'

const DEFAULT_LIMIT = 10

export function usePatientsData() {
  const dispatch = useAppDispatch()
  const { search, filters, currentPage } = useAppSelector((state) => state.patients)
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
  
  const [patients, setPatients] = useState<Patient[]>([])
  const [clinics, setClinics] = useState<ClinicName[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false)
  const [pendingFilters, setPendingFilters] = useState<{
    clinicId?: string
    gender?: GetPatientsParams['gender']
    consultationType?: GetPatientsParams['consultationType']
  }>({
    clinicId: filters.clinicId,
    gender: filters.gender,
    consultationType: filters.consultationType,
  })
  const [pendingModalFilters, setPendingModalFilters] = useState<GetPatientsParams>(filters)
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)

  const debouncedSearch = useDebounce(search, 500)

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
    if (isStaff) {
      setClinics(staffClinics)
      return
    }
    const fetchClinics = async () => {
      try {
        const clinicList = await getClinicNames()
        setClinics(clinicList)
      } catch (error: any) {
        const errorMessage =
          error?.response?.data?.error?.message ||
          error?.response?.data?.message ||
          error?.message ||
          'Unable to fetch clinics. Please try again.'
        toast.error(errorMessage)
      }
    }

    fetchClinics()
  }, [isStaff, staffClinics])

  useEffect(() => {
    if (!isStaff) return
    setClinics(staffClinics)
  }, [isStaff, staffClinics])

  const hasAppliedStaffDefault = useRef(false)

  useEffect(() => {
    if (!isStaff || hasAppliedStaffDefault.current) return
    if (staffClinics.length === 1) {
      const singleClinicId = staffClinics[0].id
      if (filters.clinicId !== singleClinicId) {
        dispatch(setFilters({ ...filters, clinicId: singleClinicId }))
      }
      setPendingFilters((prev) => ({ ...prev, clinicId: singleClinicId }))
      setPendingModalFilters((prev) => ({ ...prev, clinicId: singleClinicId }))
      hasAppliedStaffDefault.current = true
    } else {
      hasAppliedStaffDefault.current = true
    }
  }, [dispatch, filters, isStaff, staffClinics])

  useEffect(() => {
    dispatch(setCurrentPage(1))
  }, [debouncedSearch, dispatch])

  useEffect(() => {
    setPendingFilters({
      clinicId: filters.clinicId,
      gender: filters.gender,
      consultationType: filters.consultationType,
    })
    setPendingModalFilters({
      ...filters,
      minAge: filters.minAge,
      maxAge: filters.maxAge,
      sortBy: filters.sortBy || 'createdAt',
      sortOrder: filters.sortOrder || 'desc',
    })
  }, [filters])

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        setIsLoading(true)
        const params: GetPatientsParams = {
          ...filters,
          page: currentPage,
          limit: DEFAULT_LIMIT,
        }

        if (debouncedSearch.trim()) {
          params.search = debouncedSearch.trim()
        }

        const response = await getPatients(params)
        setPatients(response.patients)
        setTotalPages(response.totalPages)
        setTotal(response.total)
      } catch (error: any) {
        const errorMessage =
          error?.response?.data?.error?.message ||
          error?.response?.data?.message ||
          error?.message ||
          'Unable to fetch patients. Please try again.'
        toast.error(errorMessage)
      } finally {
        setIsLoading(false)
      }
    }

    fetchPatients()
  }, [currentPage, debouncedSearch, filters])

  const handleFiltersChange = (newFilters: GetPatientsParams) => {
    dispatch(setFilters(newFilters))
    dispatch(setCurrentPage(1))
    setFilterDrawerOpen(false)
  }

  const handleApplyFilters = () => {
    handleFiltersChange({
      ...filters,
      clinicId: pendingFilters.clinicId || undefined,
      gender: pendingFilters.gender || undefined,
      consultationType: pendingFilters.consultationType || undefined,
      minAge: pendingModalFilters.minAge,
      maxAge: pendingModalFilters.maxAge,
      sortBy: pendingModalFilters.sortBy || 'createdAt',
      sortOrder: pendingModalFilters.sortOrder || 'desc',
    })
  }

  const handleClearAllFilters = () => {
    dispatch(clearAllFilters())
    setPendingFilters({
      clinicId: undefined,
      gender: undefined,
      consultationType: undefined,
    })
    setPendingModalFilters({
      page: 1,
      limit: 10,
      sortBy: 'createdAt',
      sortOrder: 'desc',
    })
  }

  const getActiveFilterCount = () => {
    let count = 0
    if (filters.minAge !== undefined) count++
    if (filters.maxAge !== undefined) count++
    return count
  }

  const activeFilterCount = getActiveFilterCount()

  const clinicOptions: Array<{ value: string; label: string }> = useMemo(
    () => [
      { value: '', label: 'All Clinics' },
      ...clinics.map((clinic) => ({ value: clinic.id, label: clinic.name })),
    ],
    [clinics]
  )

  const genderOptions: Array<{ value: string; label: string }> = useMemo(
    () => [
      { value: '', label: 'All Genders' },
      { value: 'male', label: 'Male' },
      { value: 'female', label: 'Female' },
      { value: 'other', label: 'Other' },
      { value: 'unknown', label: 'Unknown' },
    ],
    []
  )

  const consultationTypeOptions: Array<{ value: string; label: string }> = useMemo(
    () => [
      { value: '', label: 'All Types' },
      { value: 'one-time', label: 'One-time' },
      { value: 'treatment-plan', label: 'Treatment Plan' },
    ],
    []
  )

  const hasPendingChanges = useMemo(
    () =>
      pendingFilters.clinicId !== filters.clinicId ||
      pendingFilters.gender !== filters.gender ||
      pendingFilters.consultationType !== filters.consultationType ||
      pendingModalFilters.minAge !== filters.minAge ||
      pendingModalFilters.maxAge !== filters.maxAge ||
      pendingModalFilters.sortBy !== (filters.sortBy || 'createdAt') ||
      pendingModalFilters.sortOrder !== (filters.sortOrder || 'desc'),
    [pendingFilters, pendingModalFilters, filters]
  )

  return {
    patients,
    clinics,
    isStaff,
    staffHasMultipleClinics: isStaff && clinics.length > 1,
    staffSingleClinic: isStaff && clinics.length === 1 ? clinics[0] : null,
    isLoading,
    currentPage,
    totalPages,
    total,
    limit: DEFAULT_LIMIT,
    filters,
    filterDrawerOpen,
    search,
    activeFilterCount,
    pendingFilters,
    pendingModalFilters,
    openDropdown,
    clinicOptions,
    genderOptions,
    consultationTypeOptions,
    hasPendingChanges,
    setCurrentPage: (page: number) => dispatch(setCurrentPage(page)),
    setFilterDrawerOpen,
    setSearch: (value: string) => dispatch(setSearch(value)),
    setPendingFilters,
    setPendingModalFilters,
    setOpenDropdown,
    handleFiltersChange,
    handleApplyFilters,
    handleClearAllFilters,
  }
}

