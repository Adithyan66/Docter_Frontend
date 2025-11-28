import { useEffect, useState } from 'react'

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

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      onClick={handleBackdropClick}
    >
      <div
        className="relative max-h-full max-w-4xl"
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
      </div>
    </div>
  )
}

