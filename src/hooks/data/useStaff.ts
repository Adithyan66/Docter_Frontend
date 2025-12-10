import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { getStaff, type GetStaffParams, type StaffMember } from '@api/staff'
import { useDebounce } from '@hooks/utils/useDebounce'

const DEFAULT_LIMIT = 10

export function useStaff() {
  const [staff, setStaff] = useState<StaffMember[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [search, setSearch] = useState('')

  const debouncedSearch = useDebounce(search, 500)

  useEffect(() => {
    setCurrentPage(1)
  }, [debouncedSearch])

  useEffect(() => {
    const fetchStaff = async () => {
      try {
        setIsLoading(true)
        const params: GetStaffParams = {
          page: currentPage,
          limit: DEFAULT_LIMIT,
        }

        if (debouncedSearch.trim()) {
          params.search = debouncedSearch.trim()
        }

        const response = await getStaff(params)
        setStaff(response.staff)
        setTotalPages(response.totalPages)
        setTotal(response.total)
      } catch (error: any) {
        const errorMessage =
          error?.response?.data?.error?.message ||
          error?.response?.data?.message ||
          error?.message ||
          'Unable to fetch staff. Please try again.'
        toast.error(errorMessage)
      } finally {
        setIsLoading(false)
      }
    }

    fetchStaff()
  }, [currentPage, debouncedSearch])

  return {
    staff,
    isLoading,
    currentPage,
    totalPages,
    total,
    limit: DEFAULT_LIMIT,
    search,
    setCurrentPage,
    setSearch,
  }
}


