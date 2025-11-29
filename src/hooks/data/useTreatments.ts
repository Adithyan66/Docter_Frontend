import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { getTreatments, deleteTreatment, type TreatmentList, type GetTreatmentsParams } from '@api/treatments'
import { useDebounce } from '@hooks/utils/useDebounce'

const DEFAULT_LIMIT = 10

export function useTreatments() {
  const [treatments, setTreatments] = useState<TreatmentList[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState<GetTreatmentsParams['sortBy']>(undefined)
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [treatmentToDelete, setTreatmentToDelete] = useState<TreatmentList | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const debouncedSearch = useDebounce(search, 500)

  useEffect(() => {
    setCurrentPage(1)
  }, [debouncedSearch, sortBy, sortOrder])

  useEffect(() => {
    const fetchTreatments = async () => {
      try {
        setIsLoading(true)
        const params: GetTreatmentsParams = {
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

        const response = await getTreatments(params)
        setTreatments(response.treatments)
        setTotalPages(response.totalPages)
        setTotal(response.total)
      } catch (error: any) {
        const errorMessage =
          error?.response?.data?.error?.message ||
          error?.response?.data?.message ||
          error?.message ||
          'Unable to fetch treatments. Please try again.'
        toast.error(errorMessage)
      } finally {
        setIsLoading(false)
      }
    }

    fetchTreatments()
  }, [currentPage, debouncedSearch, sortBy, sortOrder])

  const handleDelete = (treatment: TreatmentList) => {
    setTreatmentToDelete(treatment)
    setDeleteModalOpen(true)
  }

  const confirmDelete = async () => {
    if (!treatmentToDelete) return

    try {
      setIsDeleting(true)
      await deleteTreatment(treatmentToDelete.id)
      toast.success('Treatment deleted successfully.')
      setDeleteModalOpen(false)
      setTreatmentToDelete(null)

      const params: GetTreatmentsParams = {
        page: treatments.length === 1 && currentPage > 1 ? currentPage - 1 : currentPage,
        limit: DEFAULT_LIMIT,
      }

      if (debouncedSearch.trim()) {
        params.search = debouncedSearch.trim()
      }

      if (sortBy) {
        params.sortBy = sortBy
        params.sortOrder = sortOrder
      }

      const response = await getTreatments(params)
      setTreatments(response.treatments)
      setTotalPages(response.totalPages)
      setTotal(response.total)
      
      if (treatments.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1)
      }
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.error?.message ||
        error?.response?.data?.message ||
        error?.message ||
        'Unable to delete treatment. Please try again.'
      toast.error(errorMessage)
    } finally {
      setIsDeleting(false)
    }
  }

  const closeDeleteModal = () => {
    setDeleteModalOpen(false)
    setTreatmentToDelete(null)
  }

  return {
    treatments,
    isLoading,
    currentPage,
    totalPages,
    total,
    limit: DEFAULT_LIMIT,
    search,
    sortBy,
    sortOrder,
    deleteModalOpen,
    treatmentToDelete,
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

