import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { getClinics, deleteClinic, type Clinic, type GetClinicsParams } from '@api/clinics'
import { useDebounce } from '@hooks/utils/useDebounce'

const DEFAULT_LIMIT = 10

export function useClinics() {
  const [clinics, setClinics] = useState<Clinic[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState<'name' | 'city' | 'createdAt' | ''>('')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [clinicToDelete, setClinicToDelete] = useState<Clinic | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const debouncedSearch = useDebounce(search, 500)

  useEffect(() => {
    setCurrentPage(1)
  }, [debouncedSearch, sortBy, sortOrder])

  useEffect(() => {
    const fetchClinics = async () => {
      try {
        setIsLoading(true)
        const params: GetClinicsParams = {
          page: currentPage,
          limit: DEFAULT_LIMIT,
        }

        if (debouncedSearch.trim()) {
          params.search = debouncedSearch.trim()
        }

        if (sortBy) {
          params.sortBy = sortBy
          params.sortOrder = sortOrder
        }

        const response = await getClinics(params)
        setClinics(response.clinics)
        setTotalPages(response.totalPages)
        setTotal(response.total)
      } catch (error: any) {
        const errorMessage =
          error?.response?.data?.error?.message ||
          error?.response?.data?.message ||
          error?.message ||
          'Unable to fetch clinics. Please try again.'
        toast.error(errorMessage)
      } finally {
        setIsLoading(false)
      }
    }

    fetchClinics()
  }, [currentPage, debouncedSearch, sortBy, sortOrder])

  const handleDelete = (clinic: Clinic) => {
    setClinicToDelete(clinic)
    setDeleteModalOpen(true)
  }

  const confirmDelete = async () => {
    if (!clinicToDelete) return

    try {
      setIsDeleting(true)
      await deleteClinic(clinicToDelete.id)
      toast.success('Clinic deleted successfully.')
      setDeleteModalOpen(false)
      setClinicToDelete(null)

      if (clinics.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1)
      } else {
        const params: GetClinicsParams = {
          page: currentPage,
          limit: DEFAULT_LIMIT,
        }

        if (debouncedSearch.trim()) {
          params.search = debouncedSearch.trim()
        }

        if (sortBy) {
          params.sortBy = sortBy
          params.sortOrder = sortOrder
        }

        const response = await getClinics(params)
        setClinics(response.clinics)
        setTotalPages(response.totalPages)
        setTotal(response.total)
      }
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.error?.message ||
        error?.response?.data?.message ||
        error?.message ||
        'Unable to delete clinic. Please try again.'
      toast.error(errorMessage)
    } finally {
      setIsDeleting(false)
    }
  }

  const closeDeleteModal = () => {
    setDeleteModalOpen(false)
    setClinicToDelete(null)
  }

  return {
    clinics,
    isLoading,
    currentPage,
    totalPages,
    total,
    limit: DEFAULT_LIMIT,
    search,
    sortBy,
    sortOrder,
    deleteModalOpen,
    clinicToDelete,
    isDeleting,
    setCurrentPage,
    setSearch,
    setSortBy,
    setSortOrder,
    handleDelete,
    confirmDelete,
    closeDeleteModal,
  }
}

