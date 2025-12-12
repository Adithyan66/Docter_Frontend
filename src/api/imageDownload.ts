import httpClient from './httpClient'

type ApiResponse<T> = {
  success: boolean
  data: T
  message?: string
  timestamp?: string
}

export type ImageDownloadResponse = {
  downloadUrl: string
  expiresIn: number
}

export type DownloadImageResult = {
  blob: Blob
  filename: string
  contentType: string
}

const mimeToExt: { [key: string]: string } = {
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg',
  'image/png': 'png',
  'image/gif': 'gif',
  'image/webp': 'webp',
  'image/svg+xml': 'svg',
}

const detectContentTypeFromUrl = (url: string): string => {
  const urlLower = url.toLowerCase()
  if (urlLower.includes('.png')) {
    return 'image/png'
  } else if (urlLower.includes('.gif')) {
    return 'image/gif'
  } else if (urlLower.includes('.webp')) {
    return 'image/webp'
  } else if (urlLower.includes('.svg')) {
    return 'image/svg+xml'
  }
  return 'image/jpeg'
}

export const getImageDownloadUrl = async (imageUrl: string): Promise<string> => {
  const response = await httpClient.get<ApiResponse<ImageDownloadResponse>>('image-download', {
    params: { url: imageUrl },
  })
  return response.data.data.downloadUrl
}

export const downloadImage = async (
  imageUrl: string,
  alt: string = 'image'
): Promise<DownloadImageResult> => {
  const downloadUrl = await getImageDownloadUrl(imageUrl)

  const imageResponse = await fetch(downloadUrl)
  if (!imageResponse.ok) {
    throw new Error('Failed to fetch image')
  }

  let contentType = imageResponse.headers.get('content-type')

  if (!contentType || contentType === 'application/octet-stream' || !contentType.startsWith('image/')) {
    contentType = detectContentTypeFromUrl(imageUrl)
  }

  const arrayBuffer = await imageResponse.arrayBuffer()
  const blob = new Blob([arrayBuffer], { type: contentType })

  const extension = mimeToExt[contentType] || 'jpg'
  const filename = `${alt}.${extension}`

  return {
    blob,
    filename,
    contentType,
  }
}
