import httpClient from './httpClient'

type ApiResponse<T> = {
  success: boolean
  data: T
  message?: string
  timestamp?: string
}

export type StaffMember = {
  id: string
  username: string
  clinicId?: string
  clinicName?: string
  name?: string
  isActive?: boolean
}

export type GetStaffParams = {
  page?: number
  limit?: number
  search?: string
}

export type PaginatedStaffResponse = {
  staff: StaffMember[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export type CreateStaffPayload = {
  username: string
  password: string
  clinicId: string
  isActive?: boolean
}

export const getStaff = async (
  params: GetStaffParams = {}
): Promise<PaginatedStaffResponse> => {
  const { data } = await httpClient.get<ApiResponse<PaginatedStaffResponse>>('staff', {
    params,
  })
  return data.data
}

export const createStaff = async (payload: CreateStaffPayload): Promise<StaffMember> => {
  const { data } = await httpClient.post<ApiResponse<StaffMember>>('staff', payload)
  return data.data
}

export const getStaffById = async (id: string): Promise<StaffMember> => {
  const { data } = await httpClient.get<ApiResponse<StaffMember>>(`staff/${id}`)
  return data.data
}

export type UpdateStaffPayload = {
  username?: string
  password?: string
  clinicId?: string
  name?: string
  isActive?: boolean
}

export const updateStaff = async (id: string, payload: UpdateStaffPayload): Promise<StaffMember> => {
  const { data } = await httpClient.patch<ApiResponse<StaffMember>>(`staff/${id}`, payload)
  return data.data
}


