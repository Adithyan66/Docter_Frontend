import { useState } from 'react'
import ImageViewerModal from '@components/common/ImageViewerModal'

type TreatmentData = {
  name: string
  description?: string
  minDuration?: string | number
  maxDuration?: string | number
  avgDuration?: string | number
  minFees?: string | number
  maxFees?: string | number
  avgFees?: string | number
  steps: string[]
  aftercare: string[]
  followUpRequired: boolean
  followUpAfterDays?: string | number
  risks: string[]
  images: string[]
  pendingImages?: File[]
  pendingImagePreviews?: string[]
  isUploadingImages?: boolean
}

type TreatmentCardProps = {
  treatment: TreatmentData
  onRemoveStep?: (index: number) => void
  onRemoveAftercare?: (index: number) => void
  onRemoveRisk?: (index: number) => void
  onRemoveImage?: (index: number) => void
  onRemovePendingImage?: (index: number) => void
  onClearFollowUp?: () => void
  showEditActions?: boolean
  onEdit?: () => void
  onDelete?: () => void
  processEscapeSequences?: (text: string) => string
}

const defaultProcessEscapeSequences = (text: string): string => {
  return text
    .replace(/\\n/g, '\n')
    .replace(/\\t/g, '\t')
    .replace(/\\r/g, '\r')
    .replace(/\\\\/g, '\\')
    .replace(/\\'/g, "'")
    .replace(/\\"/g, '"')
}

export default function TreatmentCard({
  treatment,
  onRemoveStep,
  onRemoveAftercare,
  onRemoveRisk,
  onRemoveImage,
  onRemovePendingImage,
  onClearFollowUp,
  showEditActions = false,
  onEdit,
  onDelete,
  processEscapeSequences = defaultProcessEscapeSequences,
}: TreatmentCardProps) {
  const processText = processEscapeSequences
  const [viewerImage, setViewerImage] = useState<string | null>(null)
  const [isViewerOpen, setIsViewerOpen] = useState(false)

  const openLightbox = (src: string) => {
    setViewerImage(src)
    setIsViewerOpen(true)
  }

  const closeLightbox = () => {
    setIsViewerOpen(false)
    setViewerImage(null)
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-5 dark:border-slate-800 dark:bg-slate-900/50">
      {showEditActions && (onEdit || onDelete) && (
        <div className="mb-4 flex justify-end gap-2 border-b border-slate-200 pb-4 dark:border-slate-700">
          {onEdit && (
            <button
              type="button"
              onClick={onEdit}
              className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-medium text-white transition-all hover:bg-blue-500 dark:bg-blue-500 dark:hover:bg-blue-400"
            >
              Edit
            </button>
          )}
          {onDelete && (
            <button
              type="button"
              onClick={onDelete}
              className="rounded-lg bg-red-600 px-4 py-2 text-xs font-medium text-white transition-all hover:bg-red-500 dark:bg-red-500 dark:hover:bg-red-400"
            >
              Delete
            </button>
          )}
        </div>
      )}
      <div className="space-y-5">
        <div className="text-center">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
            {treatment.name || 'No name set'}
          </h2>
          {treatment.description && (
            <p className="mt-2 whitespace-pre-wrap text-sm text-slate-600 dark:text-slate-300">
              {processText(treatment.description)}
            </p>
          )}
        </div>
        <div className="text-sm text-slate-700 dark:text-slate-200">
          {treatment.minDuration || treatment.maxDuration || treatment.avgDuration
            ? `Min: ${treatment.minDuration || '-'} months / Max: ${treatment.maxDuration || '-'} months / Avg: ${treatment.avgDuration || '-'} months`
            : 'No duration set'}
        </div>
        <div className="text-sm text-slate-700 dark:text-slate-200">
          {treatment.minFees || treatment.maxFees || treatment.avgFees
            ? `Min: ${treatment.minFees || '-'} / Max: ${treatment.maxFees || '-'} / Avg: ${treatment.avgFees || '-'}`
            : 'No fees set'}
        </div>
        <div className="flex items-start gap-3">
          <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
            Follow up
          </span>
          <div className="flex-1 space-y-1">
            {treatment.followUpRequired ? (
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm text-slate-700 dark:text-slate-200">
                  {treatment.followUpAfterDays
                    ? `Yes - ${treatment.followUpAfterDays} days`
                    : 'Yes'}
                </span>
                {onClearFollowUp && (
                  <button
                    type="button"
                    className="text-slate-500 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400"
                    onClick={onClearFollowUp}
                  >
                    ×
                  </button>
                )}
              </div>
            ) : (
              <span className="text-sm text-slate-500 dark:text-slate-400">No</span>
            )}
          </div>
        </div>
        <div className="flex items-start gap-3">
          <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
            Procedure Steps
          </span>
          <div className="flex-1 space-y-1">
            {treatment.steps.length > 0 ? (
              treatment.steps.map((step, index) => (
                <div
                  key={`step-${index}`}
                  className="flex items-start justify-between gap-2"
                >
                  <span className="flex-1 text-sm text-slate-700 dark:text-slate-200">
                    {index + 1}. {step}
                  </span>
                  {onRemoveStep && (
                    <button
                      type="button"
                      className="text-slate-500 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400"
                      onClick={() => onRemoveStep(index)}
                    >
                      ×
                    </button>
                  )}
                </div>
              ))
            ) : (
              <span className="text-sm text-slate-500 dark:text-slate-400">None</span>
            )}
          </div>
        </div>
        <div className="flex items-start gap-3">
          <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
            Aftercare
          </span>
          <div className="flex-1 space-y-1">
            {treatment.aftercare.length > 0 ? (
              treatment.aftercare.map((entry, index) => (
                <div
                  key={`aftercare-${index}`}
                  className="flex items-start justify-between gap-2"
                >
                  <span className="flex-1 text-sm text-slate-700 dark:text-slate-200">
                    {entry}
                  </span>
                  {onRemoveAftercare && (
                    <button
                      type="button"
                      className="text-slate-500 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400"
                      onClick={() => onRemoveAftercare(index)}
                    >
                      ×
                    </button>
                  )}
                </div>
              ))
            ) : (
              <span className="text-sm text-slate-500 dark:text-slate-400">None</span>
            )}
          </div>
        </div>
        <div className="flex items-start gap-3">
          <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
            Risks
          </span>
          <div className="flex-1 space-y-1">
            {treatment.risks.length > 0 ? (
              treatment.risks.map((entry, index) => (
                <div
                  key={`risk-${index}`}
                  className="flex items-start justify-between gap-2"
                >
                  <span className="flex-1 text-sm text-slate-700 dark:text-slate-200">
                    {entry}
                  </span>
                  {onRemoveRisk && (
                    <button
                      type="button"
                      className="text-slate-500 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400"
                      onClick={() => onRemoveRisk(index)}
                    >
                      ×
                    </button>
                  )}
                </div>
              ))
            ) : (
              <span className="text-sm text-slate-500 dark:text-slate-400">None</span>
            )}
          </div>
        </div>
        <div className="flex items-start gap-3">
          <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
            Images
          </span>
          <div className="flex-1">
            {treatment.images.length > 0 ||
            (treatment.pendingImages && treatment.pendingImages.length > 0) ? (
              <div className="space-y-3">
                {treatment.images.length > 0 && (
                  <div className="grid grid-cols-3 gap-2">
                    {treatment.images.map((image, index) => (
                      <div
                        key={`image-${image}-${index}`}
                        className="group relative aspect-square overflow-hidden rounded-lg border border-slate-200 dark:border-slate-700"
                      >
                        <img
                          src={image}
                          alt=""
                          className="h-full w-full cursor-zoom-in object-cover"
                          onClick={() => openLightbox(image)}
                        />
                        {onRemoveImage && (
                          <button
                            type="button"
                            className="absolute right-1 top-1 rounded-full bg-white/90 px-1.5 py-0.5 text-xs font-semibold text-slate-700 opacity-0 transition group-hover:opacity-100 dark:bg-slate-900/80 dark:text-slate-200"
                            onClick={() => onRemoveImage(index)}
                          >
                            ×
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                {treatment.pendingImages &&
                  treatment.pendingImages.length > 0 &&
                  treatment.pendingImagePreviews && (
                    <div>
                      <div className="mb-2 flex items-center gap-2">
                        <span className="text-xs font-medium text-yellow-600 dark:text-yellow-400">
                          Pending upload ({treatment.pendingImages.length})
                        </span>
                        {treatment.isUploadingImages && (
                          <span className="h-3 w-3 animate-spin rounded-full border-2 border-yellow-500 border-t-transparent"></span>
                        )}
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        {treatment.pendingImagePreviews.map((preview, index) => (
                          <div
                            key={`pending-${index}`}
                            className="group relative aspect-square overflow-hidden rounded-lg border-2 border-dashed border-yellow-400 dark:border-yellow-500"
                          >
                            <img
                              src={preview}
                              alt=""
                              className="h-full w-full cursor-zoom-in object-cover opacity-60"
                              onClick={() => openLightbox(preview)}
                            />
                            <div className="absolute inset-0 flex items-center justify-center bg-slate-900/30">
                              <span className="rounded-full bg-yellow-500 px-2 py-0.5 text-xs font-semibold text-white">
                                Pending
                              </span>
                            </div>
                            {onRemovePendingImage && (
                              <button
                                type="button"
                                className="absolute right-1 top-1 rounded-full bg-white/90 px-1.5 py-0.5 text-xs font-semibold text-slate-700 opacity-0 transition group-hover:opacity-100 dark:bg-slate-900/80 dark:text-slate-200"
                                onClick={() => onRemovePendingImage(index)}
                              >
                                ×
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
              </div>
            ) : (
              <span className="text-sm text-slate-500 dark:text-slate-400">None</span>
            )}
          </div>
        </div>
      </div>
      <ImageViewerModal
        isOpen={isViewerOpen}
        imageUrl={viewerImage}
        onClose={closeLightbox}
        alt="Treatment reference"
      />
    </div>
  )
}

