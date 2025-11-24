import httpClient from './httpClient'

export type TreatmentMaterial = {
  name: string
  quantityUnit: string
}

export type TreatmentPayload = {
  name: string
  description?: string
  minDuration: number
  maxDuration: number
  avgDuration?: number
  minFees: number
  maxFees: number
  avgFees?: number
  materialsUsed: TreatmentMaterial[]
  steps: string[]
  aftercare: string[]
  followUpRequired: boolean
  followUpAfterDays?: number
  risks: string[]
  images: string[]
}

export const createTreatment = async (payload: TreatmentPayload) => {
  const { data } = await httpClient.post('api/treatment/add', payload)
  return data
}

type ImageUploadResponse = {
  uploadUrl: string
  imageKey: string
  publicUrl: string
}

export const requestTreatmentImageUpload = async () => {
  const { data } = await httpClient.get<{
    success: boolean
    data: ImageUploadResponse
  }>('api/images/treatment')

  return data.data
}


