import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { downloadImage } from '@api/imageDownload'

type ImageViewerModalProps = {
  isOpen: boolean
  imageUrl: string | null
  onClose: () => void
  alt?: string
}

export default function ImageViewerModal({
  isOpen,
  imageUrl,
  onClose,
  alt = 'Image',
}: ImageViewerModalProps) {
  const [imageError, setImageError] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)

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
          <div className="rounded-lg bg-white px-6 py-4 text-center text-sm font-semibold text-red-600 dark:bg-slate-900 dark:text-red-400">
            Failed to load image.
          </div>
        ) : (
          <img
            src={imageUrl}
            alt={alt}
            className="max-h-[80vh] max-w-full rounded-lg object-contain"
            onError={() => setImageError(true)}
          />
        )}
        {!imageError && (
          <button
            type="button"
            onClick={handleDownload}
            disabled={isDownloading}
            className="mt-4 flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-blue-500 dark:hover:bg-blue-600"
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
        )}
      </div>
    </div>
  )
}

