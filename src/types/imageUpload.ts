export type ImageUploadType = 'Treatment-Images' | 'Clinic-Images'

export type ImageUploadPayload = {
  fileExtension: string
}

export type ImageUploadResponse = {
  uploadUrl?: string
  imageKey?: string
  publicUrl?: string
  key?: string
  url?: string
}

export const allowedExtensions = ['jpg', 'jpeg', 'png', 'webp'] as const

export type AllowedExtension = (typeof allowedExtensions)[number]

