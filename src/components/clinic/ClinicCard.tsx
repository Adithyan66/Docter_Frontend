import { useState } from 'react'

type ClinicData = {
  name: string
  clinicId?: string
  address?: string
  city?: string
  state?: string
  pincode?: string
  phone?: string
  email?: string
  website?: string
  locationUrl?: string
  workingDays?: Array<{
    day: string
    startTime?: string
    endTime?: string
  }>
  treatments?: string[] | Array<{ id: string; name: string }>
  images?: string[]
  pendingImages?: File[]
  pendingImagePreviews?: string[]
  notes?: string
  isActive?: boolean
}

type ClinicCardProps = {
  clinic: ClinicData
  showEditActions?: boolean
  onEdit?: () => void
  onDelete?: () => void
}

export default function ClinicCard({
  clinic,
  showEditActions = false,
  onEdit,
  onDelete,
}: ClinicCardProps) {
  const [lightboxImage, setLightboxImage] = useState<string | null>(null)

  const openLightbox = (src: string) => {
    setLightboxImage(src)
  }

  const closeLightbox = () => {
    setLightboxImage(null)
  }

  const formatTime = (time?: string) => {
    if (!time) return '-'
    return time
  }

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

  const getWorkingDaysDisplay = () => {
    if (!clinic.workingDays || clinic.workingDays.length === 0) {
      return 'No working days set'
    }

    const workingDaysMap = new Map(
      clinic.workingDays.map((wd) => [wd.day, { start: wd.startTime, end: wd.endTime }])
    )

    return daysOfWeek
      .filter((day) => workingDaysMap.has(day))
      .map((day) => {
        const times = workingDaysMap.get(day)!
        const timeStr = times.start || times.end ? `${formatTime(times.start)} - ${formatTime(times.end)}` : 'Closed'
        return `${day.substring(0, 3)}: ${timeStr}`
      })
      .join(', ')
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-5 dark:border-slate-800 dark:bg-slate-900/50">
      {showEditActions && (onEdit || onDelete) && (
        <div className="mb-4 flex items-center justify-between border-b border-slate-200 pb-4 dark:border-slate-700">
          <div className="flex items-center gap-2">
            {clinic.isActive !== undefined && (
              <span
                className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                  clinic.isActive
                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                    : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                }`}
              >
                {clinic.isActive ? 'Active' : 'Inactive'}
              </span>
            )}
          </div>
          <div className="flex gap-2">
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
        </div>
      )}
      <div className="space-y-4">
        <div className="text-center">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
            {clinic.name || 'Name: -'}
          </h2>
          {clinic.clinicId && (
            <p className="mt-1 text-sm font-medium text-slate-600 dark:text-slate-400">
              ID: {clinic.clinicId}
            </p>
          )}
        </div>

        <div className="flex items-start gap-3">
          <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
            Address
          </span>
          <div className="flex-1 text-sm text-slate-700 dark:text-slate-200">
            {[clinic.address, clinic.city, clinic.state, clinic.pincode]
              .filter(Boolean)
              .join(', ') || '-'}
          </div>
        </div>

        <div className="flex items-start gap-3">
          <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Phone</span>
          <div className="flex-1 text-sm text-slate-700 dark:text-slate-200">
            {clinic.phone || '-'}
          </div>
        </div>

        <div className="flex items-start gap-3">
          <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Email</span>
          <div className="flex-1 text-sm text-slate-700 dark:text-slate-200">
            {clinic.email || '-'}
          </div>
        </div>

        <div className="flex items-start gap-3">
          <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Website</span>
          <div className="flex-1">
            {clinic.website ? (
              <a
                href={clinic.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:underline dark:text-blue-400"
              >
                {clinic.website}
              </a>
            ) : (
              <span className="text-sm text-slate-500 dark:text-slate-400">-</span>
            )}
          </div>
        </div>

        <div className="flex items-start gap-3">
          <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
            Location URL
          </span>
          <div className="flex-1">
            {clinic.locationUrl ? (
              <a
                href={clinic.locationUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:underline dark:text-blue-400"
              >
                {clinic.locationUrl}
              </a>
            ) : (
              <span className="text-sm text-slate-500 dark:text-slate-400">-</span>
            )}
          </div>
        </div>

        <div className="flex items-start gap-3">
          <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
            Working Days
          </span>
          <div className="flex-1 text-sm text-slate-700 dark:text-slate-200">
            {getWorkingDaysDisplay()}
          </div>
        </div>

        <div className="flex items-start gap-3">
          <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Treatments</span>
          <div className="flex-1">
            {clinic.treatments && clinic.treatments.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {clinic.treatments.map((treatment, index) => {
                  const treatmentName =
                    typeof treatment === 'object' && treatment !== null && 'name' in treatment
                      ? treatment.name
                      : typeof treatment === 'string'
                        ? treatment
                        : 'Unknown'
                  return (
                    <span
                      key={typeof treatment === 'object' && treatment !== null && 'id' in treatment ? treatment.id : index}
                      className="inline-block rounded-lg bg-blue-100 px-2.5 py-1 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                    >
                      {treatmentName}
                    </span>
                  )
                })}
              </div>
            ) : (
              <span className="text-sm text-slate-500 dark:text-slate-400">-</span>
            )}
          </div>
        </div>

        <div className="flex items-start gap-3">
          <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Notes</span>
          <div className="flex-1 whitespace-pre-wrap text-sm text-slate-700 dark:text-slate-200">
            {clinic.notes || '-'}
          </div>
        </div>

        <div className="flex items-start gap-3">
          <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Images</span>
          <div className="flex-1">
            {(clinic.images && clinic.images.length > 0) ||
            (clinic.pendingImages && clinic.pendingImages.length > 0) ? (
              <div className="space-y-3">
                {clinic.images && clinic.images.length > 0 && (
                  <div className="grid grid-cols-3 gap-2">
                    {clinic.images.map((image, index) => (
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
                      </div>
                    ))}
                  </div>
                )}
                {clinic.pendingImages &&
                  clinic.pendingImages.length > 0 &&
                  clinic.pendingImagePreviews && (
                    <div>
                      <div className="mb-2 flex items-center gap-2">
                        <span className="text-xs font-medium text-yellow-600 dark:text-yellow-400">
                          Pending upload ({clinic.pendingImages.length})
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        {clinic.pendingImagePreviews.map((preview, index) => (
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
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
              </div>
            ) : (
              <span className="text-sm text-slate-500 dark:text-slate-400">-</span>
            )}
          </div>
        </div>
      </div>

      {lightboxImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          onClick={closeLightbox}
        >
          <div
            className="relative max-h-full max-w-4xl"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={closeLightbox}
              className="absolute right-2 top-2 rounded-full bg-black/70 px-2 py-1 text-lg text-white hover:bg-black/80"
            >
              ×
            </button>
            <img
              src={lightboxImage}
              alt="Clinic"
              className="max-h-[80vh] max-w-full rounded-lg object-contain"
            />
          </div>
        </div>
      )}
    </div>
  )
}

