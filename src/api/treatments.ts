import httpClient from './httpClient'

export type TreatmentPayload = {
  name: string
  description?: string
  minDuration: number
  maxDuration: number
  avgDuration?: number
  minFees: number
  maxFees: number
  avgFees?: number
  steps: string[]
  aftercare: string[]
  followUpRequired: boolean
  followUpAfterDays?: number
  risks: string[]
  images: string[]
}

export const createTreatment = async (payload: TreatmentPayload) => {
  const { data } = await httpClient.post('treatment/add', payload)
  return data
}

