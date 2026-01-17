import httpClient from './httpClient'

type ApiResponse<T> = {
  success: boolean
  data: T
  message?: string
  timestamp?: string
}

export type CalendarDay = {
  date: string
  clinics: string[]
}

export type MonthlyCalendarResponse = {
  month: number
  monthName: string
  year: number
  days: CalendarDay[]
}

export type GetMonthlyCalendarParams = {
  month: number
  year: number
}

export const getMonthlyCalendar = async (
  params: GetMonthlyCalendarParams
): Promise<MonthlyCalendarResponse> => {
  const { data } = await httpClient.get<ApiResponse<MonthlyCalendarResponse>>(
    'calendar-entry/monthly',
    {
      params,
    }
  )
  return data.data
}

export type Clinic = {
  id: string
  name: string
}

export type Patient = {
  id: string
  fullName: string
  mobile: string
}

export type Treatment = {
  id: string
  name: string
}

export type Appointment = {
  patientId: string
  patient: Patient
  treatmentId: string
  treatment: Treatment
  startTime: string
  endTime: string
  notes: string
  completed: boolean
}

export type CalendarEntry = {
  id: string
  clinic: Clinic
  startTime: string
  endTime: string
  notes: string
  appointments: Appointment[]
}

export type DateCalendarResponse = {
  date: string
  entries: CalendarEntry[]
}

export const getDateCalendar = async (date: string): Promise<DateCalendarResponse> => {
  const { data } = await httpClient.get<ApiResponse<DateCalendarResponse>>(
    'calendar-entry/by-date',
    {
      params: { date },
    }
  )
  return data.data
}

export type CreateCalendarEntryPayload = {
  date: string
  clinicId: string
  startTime: string
  endTime: string
  notes?: string
}

export type CreateCalendarEntryResponse = {
  id: string
  clinic: Clinic
  startTime: string
  endTime: string
  notes: string
  appointments: Appointment[]
}

export const createCalendarEntry = async (
  payload: CreateCalendarEntryPayload
): Promise<CreateCalendarEntryResponse> => {
  const { data } = await httpClient.post<ApiResponse<CreateCalendarEntryResponse>>(
    'calendar-entry',
    payload
  )
  return data.data
}

export type UpdateCalendarEntryPayload = {
  startTime: string
  endTime: string
  notes?: string
}

export const updateCalendarEntry = async (
  id: string,
  payload: UpdateCalendarEntryPayload
): Promise<CreateCalendarEntryResponse> => {
  const { data } = await httpClient.patch<ApiResponse<CreateCalendarEntryResponse>>(
    `calendar-entry/${id}`,
    payload
  )
  return data.data
}

export const deleteCalendarEntry = async (id: string): Promise<void> => {
  await httpClient.delete<ApiResponse<void>>(`calendar-entry/${id}`)
}

export type AddAppointmentPayload = {
  patientId: string
  treatmentId?: string
  startTime?: string
  endTime?: string
  notes?: string
}

export type AppointmentResponse = {
  id: string
  patientId: string
  patient: Patient
  treatmentId: string
  treatment: Treatment
  startTime: string
  endTime: string
  notes: string
  completed: boolean
}

export const addAppointment = async (
  entryId: string,
  payload: AddAppointmentPayload
): Promise<AppointmentResponse> => {
  const { data } = await httpClient.post<ApiResponse<AppointmentResponse>>(
    `calendar-entry/${entryId}/appointments`,
    payload
  )
  return data.data
}

