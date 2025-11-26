import httpClient from './httpClient'

type ApiResponse<T> = {
  success: boolean
  data: T
  message?: string
  timestamp?: string
}

export type ClinicName = {
  id: string
  name: string
}

export type PatientPayload = {
  firstName: string
  lastName?: string
  fullName?: string
  address?: string
  profilePicUrl?: string
  consultationType: 'one-time' | 'treatment-plan'
  primaryClinic?: string
  clinics?: string[]
  dob?: string
  lastVisitAt?: string
  age?: number
  visitCount?: number
  gender?: 'male' | 'female' | 'other' | 'unknown'
  phone?: string
  email?: string
  tags?: string[]
  isActive?: boolean
}

export type Patient = {
  id: string
  patientId: string
  doctorId: string
  firstName: string
  lastName?: string
  fullName: string
  address?: string
  profilePicUrl?: string
  consultationType: 'one-time' | 'treatment-plan'
  primaryClinic?: string
  clinics?: string[]
  dob?: string
  lastVisitAt?: string
  age?: number
  visitCount?: number
  gender?: 'male' | 'female' | 'other' | 'unknown'
  phone?: string
  email?: string
  tags?: string[]
  isActive?: boolean
  createdAt: string
  updatedAt: string
}

export const createPatient = async (payload: PatientPayload): Promise<Patient> => {
  const { data } = await httpClient.post<ApiResponse<Patient>>('patient/add', payload)
  return data.data
}

export const getClinicNames = async (): Promise<ClinicName[]> => {
  const { data } = await httpClient.get<ApiResponse<ClinicName[]>>('clinic/names')
  return data.data
}

export type PaginatedPatientsResponse = {
  patients: Patient[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export type GetPatientsParams = {
  page?: number
  limit?: number
  search?: string
  patientId?: string
  clinicId?: string
  gender?: 'male' | 'female' | 'other' | 'unknown'
  consultationType?: 'one-time' | 'treatment-plan'
  minAge?: number
  maxAge?: number
  sortBy?: 'createdAt' | 'fullName' | 'visitCount' | 'lastVisitAt'
  sortOrder?: 'asc' | 'desc'
}

export const getPatients = async (
  params: GetPatientsParams = {}
): Promise<PaginatedPatientsResponse> => {
  const { data } = await httpClient.get<ApiResponse<PaginatedPatientsResponse>>('patient/all', {
    params,
  })
  return data.data
}

