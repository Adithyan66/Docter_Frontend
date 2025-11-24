import httpClient from './httpClient'
import type { ImageUploadType, ImageUploadPayload, ImageUploadResponse, AllowedExtension } from '@models/imageUpload'
import { allowedExtensions } from '@models/imageUpload'

export function validateFileExtension(extension: string): extension is AllowedExtension {
  return allowedExtensions.includes(extension.toLowerCase() as AllowedExtension)
}

export function getFileExtension(filename: string): string {
  const parts = filename.split('.')
  return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : ''
}

export async function requestImageUploadKey(
  type: ImageUploadType,
  fileExtension: string
): Promise<ImageUploadResponse> {
  if (!validateFileExtension(fileExtension)) {
    throw new Error(
      `Invalid file extension. Allowed extensions: ${allowedExtensions.join(', ')}`
    )
  }

  const payload: ImageUploadPayload = {
    fileExtension: fileExtension.toLowerCase(),
  }

  const { data } = await httpClient.post<ImageUploadResponse>(
    `image-upload/${type}`,
    payload
  )

  return data
}

