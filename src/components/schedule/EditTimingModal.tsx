import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { updateCalendarEntry, type CalendarEntry } from '@api/calendarEntries'
import { getClinicNames, type ClinicName } from '@api/clinics'
import ConfirmationModal from '@components/common/ConfirmationModal'
import ClockTimePicker from '@components/common/ClockTimePicker'

type EditTimingModalProps = {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
  entryId: string
  clinicId: string
  initialData?: CalendarEntry
}

export default function EditTimingModal({
  isOpen,
  onClose,
  onSuccess,
  entryId,
  clinicId,
  initialData,
}: EditTimingModalProps) {
  const [clinics, setClinics] = useState<ClinicName[]>([])
  const [isLoadingClinics, setIsLoadingClinics] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showConfirmModal, setShowConfirmModal] = useState(false)

  const [formData, setFormData] = useState({
    startTime: '09:00',
    endTime: '17:00',
    notes: '',
  })

  useEffect(() => {
    if (isOpen) {
      fetchClinics()
      if (initialData) {
        setFormData({
          startTime: initialData.startTime,
          endTime: initialData.endTime,
          notes: initialData.notes || '',
        })
      }
      setShowConfirmModal(false)
    }
  }, [isOpen, initialData])

  const fetchClinics = async () => {
    try {
      setIsLoadingClinics(true)
      const clinicsData = await getClinicNames()
      setClinics(clinicsData)
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.error?.message ||
        error?.response?.data?.message ||
        error?.message ||
        'Unable to fetch clinics. Please try again.'
      toast.error(errorMessage)
    } finally {
      setIsLoadingClinics(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.startTime || !formData.endTime) {
      toast.error('Please select start and end time')
      return
    }

    if (formData.endTime <= formData.startTime) {
      toast.error('End time must be after start time')
      return
    }

    setShowConfirmModal(true)
  }

  const handleConfirmSave = async () => {
    setIsSubmitting(true)

    try {
      await updateCalendarEntry(entryId, {
        startTime: formData.startTime,
        endTime: formData.endTime,
        notes: formData.notes.trim() || undefined,
      })

      toast.success('Schedule updated successfully')
      onSuccess?.()
      onClose()
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.error?.message ||
        error?.response?.data?.message ||
        error?.message ||
        'Unable to update schedule. Please try again.'
      toast.error(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  const selectedClinic = clinics.find((c) => c.id === clinicId)

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
        <div className="w-full max-w-2xl rounded-2xl bg-white shadow-xl dark:bg-slate-900">
          <div className="border-b border-slate-200 bg-white px-6 py-4 dark:border-slate-700 dark:bg-slate-900">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                  Edit Timing
                </h2>
                {selectedClinic && (
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                    Clinic: {selectedClinic.name}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50"
              >
                ✕
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-6">
            <div className="space-y-6">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <ClockTimePicker
                    value={formData.startTime}
                    onChange={(time) =>
                      setFormData((prev) => ({ ...prev, startTime: time }))
                    }
                    label="Start Time"
                    required
                  />
                </div>

                <div>
                  <ClockTimePicker
                    value={formData.endTime}
                    onChange={(time) =>
                      setFormData((prev) => ({ ...prev, endTime: time }))
                    }
                    label="End Time"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                    Clinic
                  </label>
                  <input
                    type="text"
                    value={selectedClinic?.name || ''}
                    disabled
                    className="w-full rounded-lg border border-slate-300 bg-slate-100 px-3 py-2 text-sm text-slate-600 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-400"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                    Notes (Optional)
                  </label>
                  <textarea
                    rows={4}
                    value={formData.notes}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, notes: e.target.value }))
                    }
                    className="w-full resize-none rounded-lg border px-3 py-2 text-sm dark:bg-slate-800"
                    placeholder="Enter notes..."
                  />
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3 border-t pt-6">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="rounded-lg border px-4 py-2 text-sm disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="rounded-lg bg-blue-600 px-6 py-2 text-sm text-white disabled:opacity-50"
              >
                Save
              </button>
            </div>
          </form>
        </div>
      </div>

      <ConfirmationModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={handleConfirmSave}
        title="Confirm Update"
        message="Are you sure you want to update this schedule?"
        confirmText="Yes, Update"
        cancelText="Cancel"
        confirmButtonClassName="bg-blue-600 hover:bg-blue-500"
      />
    </>
  )
}

