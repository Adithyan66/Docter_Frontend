import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { getPatients, getClinicNames, type Patient, type GetPatientsParams, type ClinicName } from '@api/patients'
import { useDebounce } from '@hooks/utils/useDebounce'
import { useAppDispatch, useAppSelector } from '@hooks/store'
import { setSearch, setFilters, setCurrentPage } from '@redux/slices/patientsSlice'

const DEFAULT_LIMIT = 10

export function usePatientsData() {
  const dispatch = useAppDispatch()
  const { search, filters, currentPage } = useAppSelector((state) => state.patients)
  
  const [patients, setPatients] = useState<Patient[]>([])
  const [clinics, setClinics] = useState<ClinicName[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false)

  const debouncedSearch = useDebounce(search, 500)

  useEffect(() => {
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
  }, [])

  useEffect(() => {
    dispatch(setCurrentPage(1))
  }, [debouncedSearch, dispatch])

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

  const getActiveFilterCount = () => {
    let count = 0
    if (filters.minAge !== undefined) count++
    if (filters.maxAge !== undefined) count++
    return count
  }

  const activeFilterCount = getActiveFilterCount()

  return {
    patients,
    clinics,
    isLoading,
    currentPage,
    totalPages,
    total,
    limit: DEFAULT_LIMIT,
    filters,
    filterDrawerOpen,
    search,
    activeFilterCount,
    setCurrentPage: (page: number) => dispatch(setCurrentPage(page)),
    setFilterDrawerOpen,
    setSearch: (value: string) => dispatch(setSearch(value)),
    handleFiltersChange,
  }
}

