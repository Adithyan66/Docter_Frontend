import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { downloadImage } from '@api/imageDownload'
import { deleteClinicImage } from '@api/clinics'
import { deleteTreatmentImage } from '@api/treatments'

type ImageViewerModalProps = {
  isOpen: boolean
  imageUrl: string | null
  onClose: () => void
  alt?: string
  entityId?: string
  entityType?: 'clinic' | 'treatment' | 'patient'
  imageIndex?: number
  onImageDeleted?: () => void
}

export default function ImageViewerModal({
  isOpen,
  imageUrl,
  onClose,
  alt = 'Image',
  entityId,
  entityType,
  imageIndex,
  onImageDeleted,
}: ImageViewerModalProps) {
  const [imageError, setImageError] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    if (isOpen && imageUrl) {
      setImageError(false)
    }
  }, [isOpen, imageUrl])

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  if (!isOpen || !imageUrl) {
    return null
  }

  const handleBackdropClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      onClose()
    }
  }

  const handleDownload = async () => {
    if (!imageUrl || isDownloading) return

    setIsDownloading(true)
    try {
      const { blob, filename } = await downloadImage(imageUrl, alt || 'image')

      const blobUrl = URL.createObjectURL(blob)

      const link = document.createElement('a')
      link.href = blobUrl
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      setTimeout(() => {
        URL.revokeObjectURL(blobUrl)
      }, 100)

      toast.success('Image downloaded successfully')
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || error.message || 'Failed to download image'
      toast.error(errorMessage)
    } finally {
      setIsDownloading(false)
    }
  }

  const handleDelete = async () => {
    if (!imageUrl || !entityId || !entityType || isDeleting) return

    if (entityType === 'patient') {
      toast.error('Patient image deletion will be implemented soon')
      return
    }

    if (imageIndex === undefined) {
      toast.error('Missing image index information')
      return
    }

    setIsDeleting(true)
    try {
      if (entityType === 'clinic') {
        await deleteClinicImage(entityId, imageIndex, imageUrl)
      } else if (entityType === 'treatment') {
        await deleteTreatmentImage(entityId, imageIndex, imageUrl)
      }

      toast.success('Image deleted successfully')
      if (onImageDeleted) {
        onImageDeleted()
      }
      onClose()
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || error.message || 'Failed to delete image'
      toast.error(errorMessage)
    } finally {
      setIsDeleting(false)
    }
  }

  const canDelete = entityId && entityType && entityType !== 'patient' && imageIndex !== undefined
  const showDeleteButton = !!entityType

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      onClick={handleBackdropClick}
    >
      <div
        className="relative max-h-full max-w-4xl flex flex-col items-center"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-2 top-2 z-10 rounded-full bg-black/70 px-3 py-1.5 text-xl font-semibold text-white transition-colors hover:bg-black/90 focus:outline-none focus:ring-2 focus:ring-white/50"
          aria-label="Close image viewer"
        >
          ×
        </button>
        {imageError ? (
          <>
            <div className="rounded-lg bg-white px-6 py-4 text-center text-sm font-semibold text-red-600 dark:bg-slate-900 dark:text-red-400">
              Failed to load image.
            </div>
            {showDeleteButton && (
              <div className="mt-4 flex items-center justify-center">
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={isDeleting || !canDelete}
                  className="flex items-center gap-2 rounded-lg bg-red-600 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-red-500 dark:hover:bg-red-600"
                >
                  {isDeleting ? (
                    <>
                      <svg
                        className="h-4 w-4 animate-spin"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      <span>Deleting...</span>
                    </>
                  ) : (
                    <>
                      <svg
                        className="h-4 w-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                      <span>Delete Image</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </>
        ) : (
          <>
            <img
              src={imageUrl}
              alt={alt}
              className="max-h-[80vh] max-w-full rounded-lg object-contain"
              onError={() => setImageError(true)}
            />
            <div className="mt-4 flex items-center gap-3">
              <button
                type="button"
                onClick={handleDownload}
                disabled={isDownloading}
                className="flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-blue-500 dark:hover:bg-blue-600"
              >
                {isDownloading ? (
                  <>
                    <svg
                      className="h-4 w-4 animate-spin"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    <span>Downloading...</span>
                  </>
                ) : (
                  <>
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                      />
                    </svg>
                    <span>Download Image</span>
                  </>
                )}
              </button>
              {showDeleteButton && (
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={isDeleting || !canDelete}
                  className="flex items-center gap-2 rounded-lg bg-red-600 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-red-500 dark:hover:bg-red-600"
                >
                  {isDeleting ? (
                    <>
                      <svg
                        className="h-4 w-4 animate-spin"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      <span>Deleting...</span>
                    </>
                  ) : (
                    <>
                      <svg
                        className="h-4 w-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                      <span>Delete Image</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

