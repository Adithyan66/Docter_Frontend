// import { useState, useEffect } from 'react'
// import toast from 'react-hot-toast'
// import { createCalendarEntry, type CreateCalendarEntryPayload } from '@api/calendarEntries'
// import { getClinicNames, type ClinicName } from '@api/clinics'
// import ConfirmationModal from '@components/common/ConfirmationModal'

// type ScheduleNewModalProps = {
//   isOpen: boolean
//   onClose: () => void
//   onSuccess?: () => void
//   selectedDate?: string | null
// }

// export default function ScheduleNewModal({
//   isOpen,
//   onClose,
//   onSuccess,
//   selectedDate,
// }: ScheduleNewModalProps) {
//   const [clinics, setClinics] = useState<ClinicName[]>([])
//   const [isLoadingClinics, setIsLoadingClinics] = useState(false)
//   const [isSubmitting, setIsSubmitting] = useState(false)
//   const [showConfirmModal, setShowConfirmModal] = useState(false)

//   const [formData, setFormData] = useState({
//     startTime: '09:00',
//     endTime: '17:00',
//     clinicId: '',
//     notes: '',
//   })

//   useEffect(() => {
//     if (isOpen) {
//       fetchClinics()
//       setFormData({
//         startTime: '09:00',
//         endTime: '17:00',
//         clinicId: '',
//         notes: '',
//       })
//       setShowConfirmModal(false)
//     }
//   }, [isOpen])

//   const fetchClinics = async () => {
//     try {
//       setIsLoadingClinics(true)
//       const clinicsData = await getClinicNames()
//       setClinics(clinicsData)
//     } catch (error: any) {
//       const errorMessage =
//         error?.response?.data?.error?.message ||
//         error?.response?.data?.message ||
//         error?.message ||
//         'Unable to fetch clinics. Please try again.'
//       toast.error(errorMessage)
//     } finally {
//       setIsLoadingClinics(false)
//     }
//   }

//   const handleSubmit = (e: React.FormEvent) => {
//     e.preventDefault()

//     if (!selectedDate) {
//       toast.error('Please select a date from the calendar')
//       return
//     }

//     if (!formData.startTime || !formData.endTime) {
//       toast.error('Please select start and end time')
//       return
//     }

//     if (!formData.clinicId) {
//       toast.error('Please select a clinic')
//       return
//     }

//     if (formData.endTime <= formData.startTime) {
//       toast.error('End time must be after start time')
//       return
//     }

//     setShowConfirmModal(true)
//   }

//   const handleConfirmSave = async () => {
//     if (!selectedDate) {
//       toast.error('Please select a date from the calendar')
//       return
//     }

//     setIsSubmitting(true)

//     try {
//       const payload: CreateCalendarEntryPayload = {
//         startDate: selectedDate,
//         endDate: selectedDate,
//         startTime: formData.startTime,
//         endTime: formData.endTime,
//         clinicId: formData.clinicId,
//         notes: formData.notes.trim() || undefined,
//       }

//       await createCalendarEntry(payload)
//       toast.success('Schedule created successfully')
//       onSuccess?.()
//       onClose()
//     } catch (error: any) {
//       const errorMessage =
//         error?.response?.data?.error?.message ||
//         error?.response?.data?.message ||
//         error?.message ||
//         'Unable to create schedule. Please try again.'
//       toast.error(errorMessage)
//     } finally {
//       setIsSubmitting(false)
//     }
//   }

//   if (!isOpen) return null

//   if (!selectedDate) {
//     return (
//       <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
//         <div className="w-full max-w-2xl rounded-2xl bg-white shadow-xl dark:bg-slate-900">
//           <div className="border-b border-slate-200 bg-white px-6 py-4 dark:border-slate-700 dark:bg-slate-900">
//             <div className="flex items-center justify-between">
//               <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
//                 Schedule New
//               </h2>
//               <button
//                 type="button"
//                 onClick={onClose}
//                 className="rounded-lg p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300"
//               >
//                 <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path
//                     strokeLinecap="round"
//                     strokeLinejoin="round"
//                     strokeWidth={2}
//                     d="M6 18L18 6M6 6l12 12"
//                   />
//                 </svg>
//               </button>
//             </div>
//           </div>
//           <div className="p-6">
//             <p className="text-slate-600 dark:text-slate-400">
//               Please select a date from the calendar first.
//             </p>
//           </div>
//         </div>
//       </div>
//     )
//   }

//   return (
//     <>
//       <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
//         <div className="w-full max-w-2xl rounded-2xl bg-white shadow-xl dark:bg-slate-900">
//           <div className="border-b border-slate-200 bg-white px-6 py-4 dark:border-slate-700 dark:bg-slate-900">
//             <div className="flex items-center justify-between">
//               <div>
//                 <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
//                   Schedule New
//                 </h2>
//                 <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
//                   Date: {new Date(selectedDate).toLocaleDateString('en-US', {
//                     weekday: 'long',
//                     year: 'numeric',
//                     month: 'long',
//                     day: 'numeric',
//                   })}
//                 </p>
//               </div>
//               <button
//                 type="button"
//                 onClick={onClose}
//                 disabled={isSubmitting}
//                 className="rounded-lg p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300 disabled:opacity-50"
//               >
//                 <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path
//                     strokeLinecap="round"
//                     strokeLinejoin="round"
//                     strokeWidth={2}
//                     d="M6 18L18 6M6 6l12 12"
//                   />
//                 </svg>
//               </button>
//             </div>
//           </div>

//           <form onSubmit={handleSubmit} className="p-6">
//             <div className="space-y-6">
//               <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
//                 <div>
//                   <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
//                     Start Time <span className="text-red-500">*</span>
//                   </label>
//                   <input
//                     type="time"
//                     value={formData.startTime}
//                     onChange={(e) =>
//                       setFormData((prev) => ({ ...prev, startTime: e.target.value }))
//                     }
//                     className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
//                     required
//                   />
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
//                     End Time <span className="text-red-500">*</span>
//                   </label>
//                   <input
//                     type="time"
//                     value={formData.endTime}
//                     onChange={(e) =>
//                       setFormData((prev) => ({ ...prev, endTime: e.target.value }))
//                     }
//                     className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
//                     required
//                   />
//                 </div>

//                 <div className="md:col-span-2">
//                   <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
//                     Clinic <span className="text-red-500">*</span>
//                   </label>
//                   <select
//                     value={formData.clinicId}
//                     onChange={(e) =>
//                       setFormData((prev) => ({ ...prev, clinicId: e.target.value }))
//                     }
//                     className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
//                     disabled={isLoadingClinics}
//                     required
//                   >
//                     <option value="">Select a clinic</option>
//                     {clinics.map((clinic) => (
//                       <option key={clinic.id} value={clinic.id}>
//                         {clinic.name}
//                       </option>
//                     ))}
//                   </select>
//                 </div>

//                 <div className="md:col-span-2">
//                   <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
//                     Notes <span className="text-slate-400">(Optional)</span>
//                   </label>
//                   <textarea
//                     value={formData.notes}
//                     onChange={(e) =>
//                       setFormData((prev) => ({ ...prev, notes: e.target.value }))
//                     }
//                     rows={4}
//                     className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 resize-none"
//                     placeholder="Enter notes..."
//                   />
//                 </div>
//               </div>
//             </div>

//           <div className="mt-6 flex items-center justify-end gap-3 border-t border-slate-200 pt-6 dark:border-slate-700">
//             <button
//               type="button"
//               onClick={onClose}
//               disabled={isSubmitting}
//               className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-all hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 disabled:opacity-50"
//             >
//               Cancel
//             </button>
//             <button
//               type="submit"
//               disabled={isSubmitting}
//               className="rounded-lg bg-gradient-to-r from-blue-600 to-blue-500 px-6 py-2 text-sm font-medium text-white shadow-md transition-all hover:from-blue-700 hover:to-blue-600 hover:shadow-lg disabled:opacity-50"
//             >
//               Save
//             </button>
//           </div>
//         </form>
//       </div>

//       <ConfirmationModal
//         isOpen={showConfirmModal}
//         onClose={() => setShowConfirmModal(false)}
//         onConfirm={handleConfirmSave}
//         title="Confirm Save"
//         message="Are you sure you want to save this schedule?"
//         confirmText="Yes, Save"
//         cancelText="Cancel"
//         confirmButtonClassName="bg-blue-600 hover:bg-blue-500 dark:bg-blue-500 dark:hover:bg-blue-400"
//       />
//     </>
// )
// }
















import { useState, useEffect, useCallback, useRef } from 'react'
import toast from 'react-hot-toast'
import { createCalendarEntry, type CreateCalendarEntryPayload } from '@api/calendarEntries'
import { getClinicNames, type ClinicName } from '@api/clinics'
import ConfirmationModal from '@components/common/ConfirmationModal'
import ClockTimePicker from '@components/common/ClockTimePicker'
import DropdownFilter from '@components/common/DropdownFilter'

const labelStyles = 'block text-xs font-medium text-slate-600 mb-1.5 dark:text-slate-300'
const inputStyles =
  'w-full bg-transparent border-0 border-b-2 border-slate-200 px-0 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-colors focus:border-blue-500 dark:border-slate-700 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-blue-400'
const textareaStyles =
  'w-full bg-transparent border-0 border-b-2 border-slate-200 px-0 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-colors focus:border-blue-500 resize-none dark:border-slate-700 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-blue-400'

type ScheduleNewModalProps = {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
  selectedDate?: string | null
}

export default function ScheduleNewModal({
  isOpen,
  onClose,
  onSuccess,
  selectedDate,
}: ScheduleNewModalProps) {
  const [clinics, setClinics] = useState<ClinicName[]>([])
  const [isLoadingClinics, setIsLoadingClinics] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [isClinicDropdownOpen, setIsClinicDropdownOpen] = useState(false)
  const clinicButtonRef = useRef<HTMLButtonElement>(null)

  const [formData, setFormData] = useState({
    startTime: '09:00',
    endTime: '17:00',
    clinicId: '',
    notes: '',
  })

  useEffect(() => {
    if (isOpen) {
      fetchClinics()
      setFormData({
        startTime: '09:00',
        endTime: '17:00',
        clinicId: '',
        notes: '',
      })
      setShowConfirmModal(false)
      setIsClinicDropdownOpen(false)
    }
  }, [isOpen])

  // ✅ Memoized for stability
  const fetchClinics = useCallback(async () => {
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
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // ✅ Prevent double submit
    if (isSubmitting) return

    if (!selectedDate) {
      toast.error('Please select a date from the calendar')
      return
    }

    if (!formData.startTime || !formData.endTime) {
      toast.error('Please select start and end time')
      return
    }

    if (!formData.clinicId) {
      toast.error('Please select a clinic')
      return
    }

    // ✅ Safer time comparison
    const start = new Date(`1970-01-01T${formData.startTime}:00`)
    const end = new Date(`1970-01-01T${formData.endTime}:00`)

    if (end <= start) {
      toast.error('End time must be after start time')
      return
    }

    setShowConfirmModal(true)
  }

  const handleConfirmSave = async () => {
    if (!selectedDate) {
      toast.error('Please select a date from the calendar')
      return
    }

    try {
      setIsSubmitting(true)

      const payload: CreateCalendarEntryPayload = {
        date: selectedDate,
        clinicId: formData.clinicId,
        startTime: formData.startTime,
        endTime: formData.endTime,
        notes: formData.notes.trim() || undefined,
      }

      await createCalendarEntry(payload)

      toast.success('Schedule created successfully')
      onSuccess?.()
      onClose()
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.error?.message ||
        error?.response?.data?.message ||
        error?.message ||
        'Unable to create schedule. Please try again.'
      toast.error(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  if (!selectedDate) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
        <div className="w-full max-w-2xl rounded-2xl bg-white shadow-xl dark:bg-slate-900">
          <div className="border-b border-slate-200 bg-white px-6 py-4 dark:border-slate-700 dark:bg-slate-900">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                Schedule New
              </h2>
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300"
              >
                ✕
              </button>
            </div>
          </div>

          <div className="p-6">
            <p className="text-slate-600 dark:text-slate-400">
              Please select a date from the calendar first.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
        <div className="w-full max-w-2xl rounded-2xl bg-white shadow-xl dark:bg-slate-900">
          {/* Header */}
          <div className="border-b border-slate-200 bg-white px-6 py-4 dark:border-slate-700 dark:bg-slate-900">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                  Schedule New
                </h2>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                  Date:{' '}
                  {new Date(selectedDate).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>

              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="rounded-lg p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300 disabled:opacity-50"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6">
            <div className="space-y-6">
              <div className="rounded-2xl bg-white/60 p-6 backdrop-blur-sm transition-shadow hover:shadow-md dark:bg-slate-900">
                <div className="flex flex-col gap-5">
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Schedule Details
                  </h3>
                  <div className="space-y-5">
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                      {/* Start Time */}
                      <div>
                        <label className={labelStyles}>Start Time*</label>
                        <div className="mt-2">
                          <ClockTimePicker
                            value={formData.startTime}
                            onChange={(time) =>
                              setFormData((prev) => ({ ...prev, startTime: time }))
                            }
                            required
                          />
                        </div>
                      </div>

                      {/* End Time */}
                      <div>
                        <label className={labelStyles}>End Time*</label>
                        <div className="mt-2">
                          <ClockTimePicker
                            value={formData.endTime}
                            onChange={(time) =>
                              setFormData((prev) => ({ ...prev, endTime: time }))
                            }
                            required
                          />
                        </div>
                      </div>
                    </div>

                    {/* Clinic */}
                    <div>
                      <label className={labelStyles}>Clinic*</label>
                      <div className="mt-2">
                        <DropdownFilter
                          label="Select a clinic"
                          value={formData.clinicId}
                          options={clinics.map((clinic) => ({
                            value: clinic.id,
                            label: clinic.name,
                          }))}
                          onChange={(value) =>
                            setFormData((prev) => ({ ...prev, clinicId: value }))
                          }
                          isOpen={isClinicDropdownOpen}
                          onToggle={() => setIsClinicDropdownOpen((prev) => !prev)}
                          onClose={() => setIsClinicDropdownOpen(false)}
                          buttonRef={clinicButtonRef}
                          disabled={isLoadingClinics}
                          buttonClassName="w-full"
                        />
                      </div>
                    </div>

                    {/* Notes */}
                    <div>
                      <label className={labelStyles}>Notes</label>
                      <textarea
                        rows={4}
                        value={formData.notes}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, notes: e.target.value }))
                        }
                        className={textareaStyles}
                        placeholder="Enter notes..."
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-6 flex items-center justify-end gap-3 border-t border-slate-200 pt-6 dark:border-slate-700">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-all hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-blue-100 to-blue-200 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:cursor-pointer hover:from-blue-200 hover:to-blue-300 disabled:cursor-not-allowed disabled:opacity-60 dark:from-blue-800/30 dark:to-blue-700/30 dark:text-slate-200 dark:hover:from-blue-700/40 dark:hover:to-blue-600/40"
              >
                {isSubmitting ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-700 border-t-transparent dark:border-slate-200"></span>
                    Saving...
                  </>
                ) : (
                  'Save Schedule'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={handleConfirmSave}
        title="Confirm Save"
        message="Are you sure you want to save this schedule?"
        confirmText="Yes, Save"
        cancelText="Cancel"
        confirmButtonClassName="bg-blue-600 hover:bg-blue-500"
      />
    </>
  )
}
