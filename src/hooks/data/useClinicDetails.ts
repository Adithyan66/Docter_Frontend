import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { getClinicWithStatistics, type ClinicWithStatistics, type GetClinicWithStatisticsParams } from '@api/clinics'

export function useClinicDetails(clinicId: string | undefined) {
  const [clinic, setClinic] = useState<ClinicWithStatistics | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [dateFilters, setDateFilters] = useState<{
    startDateFrom?: string
    startDateTo?: string
  }>({})

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

  return {
    clinic,
    isLoading,
    dateFilters,
    handleDateFilterChange,
    formatDate,
    formatDateTime,
  }
}

