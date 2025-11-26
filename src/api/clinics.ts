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

export type PaginatedClinicsResponse = {
  clinics: Clinic[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export type GetClinicsParams = {
  page?: number
  limit?: number
  sortBy?: 'name' | 'city' | 'createdAt'
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

export const getClinic = async (id: string): Promise<Clinic> => {
  const { data } = await httpClient.get<ApiResponse<Clinic>>(`clinic/${id}`)
  return data.data
}

export const updateClinic = async (id: string, payload: ClinicPayload) => {
  const { data } = await httpClient.patch<ApiResponse<Clinic>>(`clinic/${id}`, payload)
  return data.data
}

export const deleteClinic = async (id: string) => {
  const { data } = await httpClient.delete<ApiResponse<null>>(`clinic/${id}`)
  return data.data
}

