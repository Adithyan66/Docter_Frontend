import httpClient from './httpClient'

type ApiResponse<T> = {
  success: boolean
  data: T
  message?: string
  timestamp?: string
}

export type WorkingDay = {
  day: string
  startTime?: string
  endTime?: string
}

export type ClinicPayload = {
  name: string
  clinicId?: string
  address?: string
  city?: string
  state?: string
  pincode?: string
  phone?: string
  email?: string
  website?: string
  locationUrl?: string
  workingDays?: WorkingDay[]
  treatments?: string[]
  images?: string[]
  notes?: string
  isActive?: boolean
}

export type Clinic = {
  id: string
  name: string
  clinicId?: string
  address?: string
  city?: string
  state?: string
  pincode?: string
  phone?: string
  email?: string
  website?: string
  locationUrl?: string
  workingDays?: WorkingDay[]
  treatments?: string[] | Array<{ id: string; name?: string }>
  images?: string[]
  notes?: string
  isActive?: boolean
  createdAt: string
  updatedAt: string
}

export type ClinicList = {
  id: string
  name: string
  clinicId: string
  city: string
  numOfPatients: number
  onGoingTreatments: number
  completedTreatments: number
  isActive?: boolean
}

export type PaginatedClinicsResponse = {
  clinics: ClinicList[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export type GetClinicsParams = {
  page?: number
  limit?: number
  sortBy?:  'createdAt' | 'numOfPatients' | 'onGoingTreatments' | 'completedTreatments'
  sortOrder?: 'asc' | 'desc'
  search?: string
}

export const createClinic = async (payload: ClinicPayload) => {
  const { data } = await httpClient.post<ApiResponse<Clinic>>('clinic/add', payload)
  return data.data
}

export const getClinics = async (
  params: GetClinicsParams = {}
): Promise<PaginatedClinicsResponse> => {
  const { data } = await httpClient.get<ApiResponse<PaginatedClinicsResponse>>(
    'clinic/all',
    {
      params,
    }
  )
  return data.data
}

export type ClinicStatistics = {
  patients: {
    totalCount: number
    uniqueCount: number
  }
  treatmentCourses: {
    totalCount: number
    statusBreakdown: {
      active: number
      paused: number
      completed: number
      cancelled: number
    }
    medicallyCompleted: number
    paymentCompleted: number
  }
  revenue: {
    totalPaid: number
    totalCost: number
    outstanding: number
    averagePerCourse: {
      paid: number
      cost: number
    }
    byPaymentMethod: {
      cash: number
      card: number
      upi: number
      bank: number
      insurance: number
      online: number
    }
    refunds: {
      totalAmount: number
      count: number
    }
  }
  treatments: Array<{
    treatmentId: string
    treatmentName: string
    courseCount: number
    totalPaid: number
    totalCost: number
    outstanding: number
  }>
  visits: {
    totalCount: number
    averagePerCourse: number
    totalBilledAmount: number
    averageBilledAmount: number
  }
  timeMetrics: {
    earliestStartDate?: string
    latestStartDate?: string
    averageDuration?: number
  }
  completionRates: {
    treatment: number
    payment: number
    medical: number
    cancellation: number
  }
}

export type ClinicWithStatistics = Clinic & {
  doctorId: string
  statistics?: ClinicStatistics
}

export type GetClinicWithStatisticsParams = {
  includeStatistics?: boolean
  startDateFrom?: string
  startDateTo?: string
}

export const getClinic = async (id: string): Promise<Clinic> => {
  const { data } = await httpClient.get<ApiResponse<Clinic>>(`clinic/${id}?includeStatistics=true`)
  return data.data
}

export const getClinicWithStatistics = async (
  id: string,
  params?: GetClinicWithStatisticsParams
): Promise<ClinicWithStatistics> => {
  const { data } = await httpClient.get<ApiResponse<ClinicWithStatistics>>(`clinic/${id}`, {
    params,
  })
  return data.data
}

export const updateClinic = async (id: string, payload: Partial<ClinicPayload>) => {
  const { data } = await httpClient.patch<ApiResponse<Clinic>>(`clinic/${id}`, payload)
  return data.data
}

export const deleteClinic = async (id: string) => {
  const { data } = await httpClient.delete<ApiResponse<null>>(`clinic/${id}`)
  return data.data
}

export type ClinicName = {
  id: string
  name: string
}

export const getClinicNames = async (params?: { search?: string }): Promise<ClinicName[]> => {
  const { data } = await httpClient.get<ApiResponse<ClinicName[]>>('clinic/names', {
    params,
  })
  return data.data
}

