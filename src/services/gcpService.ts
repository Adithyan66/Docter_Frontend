import axios from 'axios'
import httpClient from '@api/httpClient'
import type { ImageUploadType } from '@models/imageUpload'

export interface UploadResponse {
  data: UploadResponse | PromiseLike<UploadResponse>
  uploadUrl: string
  imageKey: string
  publicUrl: string
}

export class GCPService {

  static async generateUploadUrl(
    type: ImageUploadType,
    fileExtension: string
  ): Promise<UploadResponse> {
    const response = await httpClient.post<UploadResponse>(
      `image-upload/${type}`,
      {
        fileExtension,
      }
    )
    return response.data.data
  }

  static async uploadToGCS(
    uploadUrl: string,
    file: File,
    onProgress?: (progress: number) => void
  ): Promise<void> {
    await axios.put(uploadUrl, file, {
      headers: {
        'Content-Type': file.type,
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          ) 
          onProgress(progress)
        }
      },
    })
  }

  static async uploadImage(
    type: ImageUploadType,
    file: File,
    onProgress?: (progress: number) => void
  ): Promise<{ publicUrl: string; imageKey: string }> {
    const fileExtension = file.name.split('.').pop()?.toLowerCase() || 'jpg'

    const { uploadUrl, imageKey, publicUrl } = await this.generateUploadUrl(
      type,
      fileExtension
    )

    await this.uploadToGCS(uploadUrl, file, onProgress)

    return { publicUrl, imageKey }
  }
}

