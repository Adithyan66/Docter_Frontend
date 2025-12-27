import type { ImageUploadType } from '@models/imageUpload'
import { S3Service } from './s3Service'
import { GCPService } from './gcpService'
import { detectCloudProvider } from '@utils/cloudProviderDetector'

export class CloudStorageService {

  static async uploadImage(
    type: ImageUploadType,
    file: File,
    onProgress?: (progress: number) => void
  ): Promise<{ publicUrl: string; imageKey: string }> {
    const fileExtension = file.name.split('.').pop()?.toLowerCase() || 'jpg'

    const s3Response = await S3Service.generateUploadUrl(type, fileExtension)
    const { uploadUrl, imageKey, publicUrl } = s3Response

    const provider = detectCloudProvider(uploadUrl)

    if (provider === 'gcs') {
      await GCPService.uploadToGCS(uploadUrl, file, onProgress)
    } else if (provider === 's3') {
      await S3Service.uploadToS3(uploadUrl, file, onProgress)
    } else {
      throw new Error(`Unknown cloud provider detected from URL: ${uploadUrl}`)
    }

    return { publicUrl, imageKey }
  }
}

