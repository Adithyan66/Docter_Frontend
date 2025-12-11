import { useState } from 'react'
import ImageViewerModal from './ImageViewerModal'
import Pagination from './Pagination'

export type GalleryItem = {
  imageUrl: string
  alt?: string
  metadata?: { [key: string]: any }
}

type GalleryProps = {
  items: GalleryItem[]
  onBack: () => void
  pagination?: {
    currentPage: number
    totalPages: number
    total: number
    limit: number
    onPageChange: (page: number) => void
  }
  isLoading?: boolean
}

const ArrowLeftIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M19 12H5" />
    <path d="M12 19l-7-7 7-7" />
  </svg>
)

export default function Gallery({ items, onBack, pagination, isLoading }: GalleryProps) {
  const [viewerImage, setViewerImage] = useState<string | null>(null)
  const [isViewerOpen, setIsViewerOpen] = useState(false)

  const handleImageClick = (imageUrl: string) => {
    setViewerImage(imageUrl)
    setIsViewerOpen(true)
  }

  const handleCloseViewer = () => {
    setIsViewerOpen(false)
    setViewerImage(null)
  }

  return (
    <>
      <div className="rounded-2xl border border-slate-200 bg-white/60 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900 overflow-hidden">
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onBack}
                className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-slate-50 p-2 text-slate-700 transition-colors hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                aria-label="Go back"
              >
                <ArrowLeftIcon className="h-5 w-5" />
              </button>
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                Gallery
              </h2>
            </div>
            {pagination && (
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {pagination.total} {pagination.total === 1 ? 'image' : 'images'}
              </p>
            )}
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                Loading images...
              </p>
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                No images
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-3 gap-4">
                {items.map((item, index) => (
                  <div
                    key={index}
                    className="group relative rounded-lg border border-slate-200 bg-white overflow-hidden shadow-sm transition-shadow hover:shadow-md dark:border-slate-700 dark:bg-slate-800"
                  >
                    <div className="relative aspect-square">
                      <img
                        src={item.imageUrl}
                        alt={item.alt || `Gallery image ${index + 1}`}
                        className="h-full w-full object-cover cursor-pointer transition-opacity hover:opacity-80"
                        onClick={() => handleImageClick(item.imageUrl)}
                      />
                    </div>
                    {item.metadata && Object.keys(item.metadata).length > 0 && (
                      <div className="p-3 space-y-1">
                        {Object.entries(item.metadata).map(([key, value]) => (
                          <div key={key} className="text-xs">
                            <span className="font-medium text-slate-600 dark:text-slate-400">
                              {key}:
                            </span>{' '}
                            <span className="text-slate-900 dark:text-slate-100">
                              {String(value)}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
              {pagination && pagination.totalPages > 1 && (
                <div className="flex justify-center pt-4">
                  <Pagination
                    currentPage={pagination.currentPage}
                    totalPages={pagination.totalPages}
                    onPageChange={pagination.onPageChange}
                  />
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <ImageViewerModal
        isOpen={isViewerOpen}
        imageUrl={viewerImage}
        onClose={handleCloseViewer}
        alt={items.find((item) => item.imageUrl === viewerImage)?.alt || 'Gallery image'}
      />
    </>
  )
}
