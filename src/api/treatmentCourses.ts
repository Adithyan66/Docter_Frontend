import httpClient from './httpClient'

type ApiResponse<T> = {
  success: boolean
  data: T
  message?: string
  timestamp?: string
}

export type TreatmentCourseStatus = 'active' | 'paused' | 'completed' | 'cancelled'

export type TreatmentCoursePayload = {
  doctorId: string
  patientId: string
  clinicId?: string
  treatmentId: string
  startDate: string
  expectedEndDate?: string
  totalCost: number
  totalPaid?: number
  isPaymentCompleted?: boolean
  isMedicallyCompleted?: boolean
  status?: TreatmentCourseStatus
  notes?: string
}

export type TreatmentCourse = {
  id: string
  doctorId: string
  patientId: string
  clinicId?: string
  treatmentId: string
  startDate: string
  expectedEndDate?: string
  totalCost: number
  totalPaid: number
  isPaymentCompleted: boolean
  isMedicallyCompleted: boolean
  status: TreatmentCourseStatus
  lastVisitDate: string
  nextVisitDate: string
  notes?: string
  visits: string[]
  payments: string[]
  isDeleted: boolean
  createdAt: string
  updatedAt: string
}

export const createTreatmentCourse = async (
  payload: TreatmentCoursePayload
): Promise<TreatmentCourse> => {
  const { data } = await httpClient.post<ApiResponse<TreatmentCourse>>(
    'treatment-course/add',
    payload
  )
  return data.data
}

export const getTreatmentCourseById = async (id: string): Promise<TreatmentCourse> => {
  const { data } = await httpClient.get<ApiResponse<TreatmentCourse>>(`treatment-course/${id}`)
  return data.data
}

export type UpdateTreatmentCoursePayload = {
  totalCost?: number
  expectedEndDate?: string
  notes?: string
  status?: TreatmentCourseStatus
}

export const updateTreatmentCourse = async (
  courseId: string,
  payload: UpdateTreatmentCoursePayload
): Promise<TreatmentCourse> => {
  const { data } = await httpClient.patch<ApiResponse<TreatmentCourse>>(
    `treatment-course/${courseId}`,
    payload
  )
  return data.data
}

export const deleteTreatmentCourse = async (courseId: string): Promise<void> => {
  await httpClient.delete<ApiResponse<void>>(`treatment-course/${courseId}`)
}

