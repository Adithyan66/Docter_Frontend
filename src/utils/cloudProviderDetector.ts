export type CloudProvider = 's3' | 'gcs' | 'unknown'

export function detectCloudProvider(url: string): CloudProvider {
  if (!url || typeof url !== 'string') {
    return 'unknown'
  }

  const lowerUrl = url.toLowerCase()

  if (lowerUrl.includes('storage.googleapis.com')) {
    return 'gcs'
  }

  if (lowerUrl.includes('s3') && lowerUrl.includes('amazonaws.com')) {
    return 's3'
  }

  return 'unknown'
}

