import { useState, useRef } from 'react'
import toast from 'react-hot-toast'
import ImageViewerModal from './ImageViewerModal'
import Pagination from './Pagination'
import { uploadClinicImages } from '@api/clinics'
import { uploadTreatmentImages } from '@api/treatments'
import { CloudStorageService } from '@services/cloudStorageService'
import RotatingSpinner from '@components/spinner/TeethRotating'

export type GalleryItem = {
  imageUrl: string
  alt?: string
  metadata?: { [key: string]: any }
}

type EntityType = 'clinic' | 'treatment'

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
  entityId?: string
  entityType?: EntityType
  onImagesUploaded?: () => void
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

const PlusIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 4v16m8-8H4" />
  </svg>
)

export default function Gallery({ items, onBack, pagination, isLoading, entityId, entityType, onImagesUploaded }: GalleryProps) {
  const [viewerImage, setViewerImage] = useState<string | null>(null)
  const [isViewerOpen, setIsViewerOpen] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImageClick = (imageUrl: string) => {
    setViewerImage(imageUrl)
    setIsViewerOpen(true)
  }

  const handleCloseViewer = () => {
    setIsViewerOpen(false)
    setViewerImage(null)
  }

  const handleAddImagesClick = () => {
    if (!entityId || !entityType) {
      toast.error('Entity ID and type are required to upload images')
      return
    }
    fileInputRef.current?.click()
  }

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files?.length || !entityId || !entityType) return

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    const maxFileSize = 5 * 1024 * 1024
    const validFiles: File[] = []

    for (const file of Array.from(files)) {
      if (!file.type.startsWith('image/')) {
        toast.error('Please select image files only')
        event.target.value = ''
        return
      }

      if (file.size > maxFileSize) {
        toast.error('File size must be less than 5MB')
        event.target.value = ''
        return
      }

      if (!allowedTypes.includes(file.type)) {
        toast.error('Only JPEG, PNG, and WebP images are allowed')
        event.target.value = ''
        return
      }

      validFiles.push(file)
    }

    if (validFiles.length === 0) return

    setIsUploading(true)
    setUploadProgress(0)

    try {
      const uploadedUrls: string[] = []
      const totalFiles = validFiles.length

      const s3ImageType = entityType === 'clinic' ? 'Clinic-Images' : 'Treatment-Images'

      for (let i = 0; i < validFiles.length; i++) {
        const file = validFiles[i]
        try {
          const { publicUrl } = await CloudStorageService.uploadImage(s3ImageType, file, (progress) => {
            const fileProgress = (i / totalFiles) * 100 + (progress / totalFiles)
            setUploadProgress(Math.min(fileProgress, 100))
          })

          if (publicUrl && publicUrl.trim().length > 0) {
            uploadedUrls.push(publicUrl)
          }
        } catch (error: any) {
          const errorMessage =
            error?.response?.data?.error?.message ||
            error?.response?.data?.message ||
            error?.message ||
            `Failed to upload ${file.name}`
          toast.error(errorMessage)
        }
      }

      if (uploadedUrls.length > 0) {
        if (entityType === 'clinic') {
          await uploadClinicImages(entityId, uploadedUrls)
        } else {
          await uploadTreatmentImages(entityId, uploadedUrls)
        }
        toast.success(`Successfully uploaded ${uploadedUrls.length} image${uploadedUrls.length > 1 ? 's' : ''}`)
        if (onImagesUploaded) {
          onImagesUploaded()
        }
      } else {
        toast.error('No images were uploaded successfully')
      }
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.error?.message ||
        error?.response?.data?.message ||
        error?.message ||
        'Failed to upload images. Please try again.'
      toast.error(errorMessage)
    } finally {
      setIsUploading(false)
      setUploadProgress(0)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
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
            <div className="flex items-center gap-3">
              {pagination && (
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {pagination.total} {pagination.total === 1 ? 'image' : 'images'}
                </p>
              )}
              {entityId && entityType && (
                <>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*"
                    capture="environment"
                    className="hidden"
                    onChange={handleFileChange}
                    disabled={isUploading}
                  />
                  <button
                    type="button"
                    onClick={handleAddImagesClick}
                    disabled={isUploading}
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-blue-100 to-blue-200 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:cursor-pointer hover:from-blue-200 hover:to-blue-300 disabled:cursor-not-allowed disabled:opacity-60 dark:from-blue-800/30 dark:to-blue-700/30 dark:text-slate-200 dark:hover:from-blue-700/40 dark:hover:to-blue-600/40"
                  >
                    {isUploading ? (
                      <>
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-700 border-t-transparent dark:border-slate-200"></span>
                        Uploading... {Math.round(uploadProgress)}%
                      </>
                    ) : (
                      <>
                        <PlusIcon className="h-4 w-4" />
                        Add Images
                      </>
                    )}
                  </button>
                </>
              )}
            </div>
          </div>

          {isLoading ? (
            <RotatingSpinner/>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
              <p className="text-lg font-semibold text-slate-600 dark:text-slate-400">
                No images
              </p>
              {entityId && entityType && (
                <>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*"
                    capture="environment"
                    className="hidden"
                    onChange={handleFileChange}
                    disabled={isUploading}
                  />
                  <button
                    type="button"
                    onClick={handleAddImagesClick}
                    disabled={isUploading}
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-blue-100 to-blue-200 px-6 py-3 text-sm font-medium text-slate-700 transition-colors hover:cursor-pointer hover:from-blue-200 hover:to-blue-300 disabled:cursor-not-allowed disabled:opacity-60 dark:from-blue-800/30 dark:to-blue-700/30 dark:text-slate-200 dark:hover:from-blue-700/40 dark:hover:to-blue-600/40"
                  >
                    {isUploading ? (
                      <>
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-700 border-t-transparent dark:border-slate-200"></span>
                        Uploading... {Math.round(uploadProgress)}%
                      </>
                    ) : (
                      <>
                        <PlusIcon className="h-5 w-5" />
                        Add Image
                      </>
                    )}
                  </button>
                </>
              )}
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
        entityId={entityId}
        entityType={entityType}
        imageIndex={pagination ? (pagination.currentPage - 1) * pagination.limit + items.findIndex((item) => item.imageUrl === viewerImage) : items.findIndex((item) => item.imageUrl === viewerImage)}
        onImageDeleted={() => {
          handleCloseViewer()
          if (onImagesUploaded) {
            onImagesUploaded()
          }
        }}
      />
    </>
  )
}
