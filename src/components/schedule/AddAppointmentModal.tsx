import { useState, useEffect, useCallback, useRef } from 'react'
import toast from 'react-hot-toast'
import { addAppointment, updateAppointment, type Patient as AppointmentPatient } from '@api/calendarEntries'
import { getPatients, type Patient } from '@api/patients'
import { getTreatmentNames, type TreatmentName } from '@api/treatments'
import ConfirmationModal from '@components/common/ConfirmationModal'
import Pagination from '@components/common/Pagination'
import ClockTimePicker from '@components/common/ClockTimePicker'
import DropdownFilter from '@components/common/DropdownFilter'
import noprofile from '@assets/noprofile.png'

type AddAppointmentModalProps = {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
  entryId: string
  clinicId: string
  clinicName: string
  startTime: string
  endTime: string
  isEditMode?: boolean
  appointmentIndex?: number
  editData?: {
    patient: AppointmentPatient
    treatmentId?: string
    startTime?: string
    endTime?: string
    notes?: string
  }
}

export default function AddAppointmentModal({
  isOpen,
  onClose,
  onSuccess,
  entryId,
  clinicId,
  clinicName,
  startTime,
  endTime,
  isEditMode = false,
  appointmentIndex,
  editData,
}: AddAppointmentModalProps) {
  const [patients, setPatients] = useState<Patient[]>([])
  const [treatments, setTreatments] = useState<TreatmentName[]>([])
  const [isLoadingPatients, setIsLoadingPatients] = useState(false)
  const [isLoadingTreatments, setIsLoadingTreatments] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const limit = 10

  const [formData, setFormData] = useState({
    patientId: '',
    treatmentId: '',
    startTime: '09:00',
    endTime: '10:00',
    notes: '',
  })

  const [selectedPatient, setSelectedPatient] = useState<Patient | AppointmentPatient | null>(null)
  const [isTreatmentDropdownOpen, setIsTreatmentDropdownOpen] = useState(false)
  const [currentStep, setCurrentStep] = useState<1 | 2>(isEditMode ? 2 : 1)
  const treatmentButtonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (isOpen) {
      fetchTreatments()
      if (!isEditMode) {
        fetchPatients(1)
      }
      if (isEditMode && editData) {
        setFormData({
          patientId: editData.patient.id,
          treatmentId: editData.treatmentId || '',
          startTime: editData.startTime || '09:00',
          endTime: editData.endTime || '10:00',
          notes: editData.notes || '',
        })
        setSelectedPatient(editData.patient as Patient)
        setCurrentStep(2)
      } else {
        setFormData({
          patientId: '',
          treatmentId: '',
          startTime: '09:00',
          endTime: '10:00',
          notes: '',
        })
        setSelectedPatient(null)
        setCurrentStep(1)
      }
      setSearchQuery('')
      setCurrentPage(1)
      setShowConfirmModal(false)
    }
  }, [isOpen, clinicId, isEditMode, editData])

  const fetchPatients = useCallback(
    async (page: number) => {
      try {
        setIsLoadingPatients(true)
        const response = await getPatients({
          page,
          limit,
          clinicId,
          search: searchQuery || undefined,
          sortBy: 'createdAt',
          sortOrder: 'desc',
        })
        setPatients(response.patients)
        setTotalPages(response.totalPages)
        setTotal(response.total)
        setCurrentPage(response.page)
      } catch (error: any) {
        const errorMessage =
          error?.response?.data?.error?.message ||
          error?.response?.data?.message ||
          error?.message ||
          'Unable to fetch patients. Please try again.'
        toast.error(errorMessage)
      } finally {
        setIsLoadingPatients(false)
      }
    },
    [clinicId, searchQuery]
  )

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        fetchPatients(1)
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [searchQuery, isOpen, fetchPatients])

  const fetchTreatments = async () => {
    try {
      setIsLoadingTreatments(true)
      const treatmentsData = await getTreatmentNames()
      setTreatments(treatmentsData)
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.error?.message ||
        error?.response?.data?.message ||
        error?.message ||
        'Unable to fetch treatments. Please try again.'
      toast.error(errorMessage)
    } finally {
      setIsLoadingTreatments(false)
    }
  }

  const handlePatientSelect = (patient: Patient) => {
    setSelectedPatient(patient)
    setFormData((prev) => ({ ...prev, patientId: patient.id }))
  }

  const handleNext = (e?: React.MouseEvent<HTMLButtonElement>) => {
    e?.preventDefault()
    e?.stopPropagation()
    if (selectedPatient) {
      setCurrentStep(2)
    }
  }

  const handleBack = () => {
    setCurrentStep(1)
  }

  const handleDurationClick = (minutes: number) => {
    const [startHours, startMinutes] = formData.startTime.split(':').map(Number)
    const startDate = new Date()
    startDate.setHours(startHours, startMinutes, 0, 0)
    const endDate = new Date(startDate.getTime() + minutes * 60000)
    const endTime = `${String(endDate.getHours()).padStart(2, '0')}:${String(endDate.getMinutes()).padStart(2, '0')}`
    setFormData((prev) => ({ ...prev, endTime }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Only allow submission on step 2
    if (currentStep !== 2) {
      return
    }

    if (!formData.patientId) {
      toast.error('Please select a patient')
      return
    }

    if (formData.endTime && formData.startTime && formData.endTime <= formData.startTime) {
      toast.error('End time must be after start time')
      return
    }

    setShowConfirmModal(true)
  }

  const handleConfirmSave = async () => {
    setIsSubmitting(true)

    try {
      if (isEditMode && appointmentIndex !== undefined) {
        await updateAppointment(entryId, appointmentIndex, {
          treatmentId: formData.treatmentId || undefined,
          startTime: formData.startTime || undefined,
          endTime: formData.endTime || undefined,
          notes: formData.notes.trim() || undefined,
        })
        toast.success('Appointment updated successfully')
      } else {
        await addAppointment(entryId, {
          patientId: formData.patientId,
          treatmentId: formData.treatmentId || undefined,
          startTime: formData.startTime || undefined,
          endTime: formData.endTime || undefined,
          notes: formData.notes.trim() || undefined,
        })
        toast.success('Appointment added successfully')
      }
      onSuccess?.()
      onClose()
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.error?.message ||
        error?.response?.data?.message ||
        error?.message ||
        (isEditMode ? 'Unable to update appointment. Please try again.' : 'Unable to add appointment. Please try again.')
      toast.error(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
        <div className="w-full max-w-5xl max-h-[90vh] flex flex-col rounded-2xl bg-gradient-to-br from-white to-slate-50 shadow-2xl dark:from-slate-900 dark:to-slate-800 overflow-hidden border border-slate-200 dark:border-slate-700">
          <div className="border-b border-slate-200 bg-gradient-to-r from-blue-50 to-purple-50 px-6 py-5 dark:border-slate-700 dark:from-slate-800 dark:to-slate-900">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                  {isEditMode ? 'Update Appointment' : 'Add Appointment'}
                </h2>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                  <span className="font-semibold text-blue-600 dark:text-blue-400">{clinicName}</span>
                  {' '}•{' '}
                  <span className="font-semibold text-purple-600 dark:text-purple-400">
                    {startTime} - {endTime}
                  </span>
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="rounded-lg p-2 text-slate-400 hover:bg-white/50 hover:text-slate-600 dark:hover:bg-slate-700 dark:hover:text-slate-300 disabled:opacity-50 transition-colors"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden bg-white dark:bg-slate-900">
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {currentStep === 1 ? (
                // Step 1: Patient Selection
                <div className="rounded-xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-6 dark:border-slate-700 dark:from-slate-800/50 dark:to-slate-900/50">
                  <div className="mb-4 flex items-center justify-between gap-4">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                      Select Patient <span className="text-red-500">*</span>
                    </label>
                    <div className="w-64">
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search patients..."
                        className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                      />
                    </div>
                  </div>

                  <div className="rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm min-h-[400px] flex flex-col">
                    {isLoadingPatients ? (
                      <div className="flex items-center justify-center flex-1 min-h-[400px]">
                        <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-600 border-t-transparent"></div>
                      </div>
                    ) : patients.length === 0 ? (
                      <div className="flex items-center justify-center flex-1 min-h-[400px]">
                        <div className="text-center">
                          <svg
                            className="mx-auto h-12 w-12 text-slate-400 dark:text-slate-500"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          <p className="mt-4 text-sm font-medium text-slate-900 dark:text-slate-100">
                            No patients found
                          </p>
                          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                            {searchQuery
                              ? 'Try adjusting your search criteria'
                              : 'No patients available for this clinic'}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="overflow-x-auto">
                          <table className="w-full">
                            <thead className="bg-slate-50 dark:bg-slate-800">
                              <tr>
                                <th className="px-4 py-2 text-left text-xs font-medium text-slate-600 dark:text-slate-400">
                                  Photo
                                </th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-slate-600 dark:text-slate-400">
                                  Patient ID
                                </th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-slate-600 dark:text-slate-400">
                                  Name
                                </th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 dark:divide-slate-700 bg-white dark:bg-slate-900">
                              {patients.map((patient) => (
                                <tr
                                  key={patient.id}
                                  onClick={() => handlePatientSelect(patient)}
                                  className={`relative cursor-pointer transition-colors ${
                                    selectedPatient?.id === patient.id
                                      ? 'bg-blue-50 dark:bg-blue-900/20'
                                      : 'hover:bg-slate-50 dark:hover:bg-slate-800'
                                  }`}
                                >
                                  <td className="relative px-4 py-3">
                                    {patient.isActive ? (
                                      <div className="absolute left-0 top-0 h-full w-1 bg-green-500 rounded-r"></div>
                                    ) : (
                                      <div className="absolute left-0 top-0 h-full w-1 bg-red-500 rounded-r"></div>
                                    )}
                                    <img
                                      src={patient.profilePicUrl || noprofile}
                                      alt={patient.fullName}
                                      className="h-10 w-10 rounded-full object-cover ml-2"
                                    />
                                  </td>
                                  <td className="px-4 py-3 text-sm text-slate-900 dark:text-white">
                                    {patient.patientId}
                                  </td>
                                  <td className="px-4 py-3 text-sm text-slate-900 dark:text-white">
                                    {patient.fullName}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                        {totalPages > 1 && (
                          <div className="border-t border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800">
                            <Pagination
                              currentPage={currentPage}
                              totalPages={totalPages}
                              onPageChange={(page) => fetchPatients(page)}
                              maxVisiblePages={10}
                            />
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              ) : (
                // Step 2: Time, Treatment, Notes
                <>
                  {/* Selected Patient Info */}
                  {selectedPatient && (
                    <div className="rounded-xl border-2 border-blue-500 bg-gradient-to-r from-blue-50 to-blue-100 p-4 dark:border-blue-400 dark:from-blue-900/30 dark:to-blue-800/30 shadow-md">
                      <div className="flex items-center gap-3">
                        <img
                          src={(selectedPatient as any).profilePic || (selectedPatient as any).profilePicUrl || noprofile}
                          alt={selectedPatient.fullName}
                          className="h-12 w-12 rounded-full object-cover border-2 border-blue-500 dark:border-blue-400"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement
                            target.src = noprofile
                          }}
                        />
                        <div>
                          <p className="font-semibold text-slate-900 dark:text-white">
                            {selectedPatient.fullName}
                          </p>
                          <p className="text-sm font-medium text-blue-600 dark:text-blue-400">
                            {(selectedPatient as any).patientId || (selectedPatient as Patient).patientId}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="rounded-xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-6 dark:border-slate-700 dark:from-slate-800/50 dark:to-slate-900/50">
                    <div className="space-y-4">
                      <div className="flex items-end gap-4 flex-wrap">
                        <div className="flex-1 min-w-[200px]">
                          <ClockTimePicker
                            value={formData.startTime}
                            onChange={(time) =>
                              setFormData((prev) => ({ ...prev, startTime: time }))
                            }
                            label="Start Time"
                          />
                        </div>
                        <div className="flex gap-2 flex-wrap">
                          <button
                            type="button"
                            onClick={() => handleDurationClick(10)}
                            className="px-4 py-2 rounded-lg text-sm font-medium transition-all bg-gradient-to-r from-purple-100 to-purple-200 text-purple-700 hover:from-purple-200 hover:to-purple-300 dark:from-purple-800/30 dark:to-purple-700/30 dark:text-purple-300 dark:hover:from-purple-700/40 dark:hover:to-purple-600/40"
                          >
                            10 mins
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDurationClick(20)}
                            className="px-4 py-2 rounded-lg text-sm font-medium transition-all bg-gradient-to-r from-blue-100 to-blue-200 text-blue-700 hover:from-blue-200 hover:to-blue-300 dark:from-blue-800/30 dark:to-blue-700/30 dark:text-blue-300 dark:hover:from-blue-700/40 dark:hover:to-blue-600/40"
                          >
                            20 mins
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDurationClick(30)}
                            className="px-4 py-2 rounded-lg text-sm font-medium transition-all bg-gradient-to-r from-green-100 to-green-200 text-green-700 hover:from-green-200 hover:to-green-300 dark:from-green-800/30 dark:to-green-700/30 dark:text-green-300 dark:hover:from-green-700/40 dark:hover:to-green-600/40"
                          >
                            30 mins
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDurationClick(60)}
                            className="px-4 py-2 rounded-lg text-sm font-medium transition-all bg-gradient-to-r from-orange-100 to-orange-200 text-orange-700 hover:from-orange-200 hover:to-orange-300 dark:from-orange-800/30 dark:to-orange-700/30 dark:text-orange-300 dark:hover:from-orange-700/40 dark:hover:to-orange-600/40"
                          >
                            1 hr
                          </button>
                        </div>
                        <div className="flex-1 min-w-[200px]">
                          <ClockTimePicker
                            value={formData.endTime}
                            onChange={(time) =>
                              setFormData((prev) => ({ ...prev, endTime: time }))
                            }
                            label="End Time"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    <div className="rounded-xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-6 dark:border-slate-700 dark:from-slate-800/50 dark:to-slate-900/50">
                      <label className="mb-3 block text-sm font-semibold text-slate-700 dark:text-slate-300">
                        Treatment <span className="text-slate-400 font-normal">(Optional)</span>
                      </label>
                      <DropdownFilter
                        label="Select a treatment"
                        value={formData.treatmentId}
                        options={treatments.map((treatment) => ({
                          value: treatment.id,
                          label: treatment.name,
                        }))}
                        onChange={(value) =>
                          setFormData((prev) => ({ ...prev, treatmentId: value }))
                        }
                        isOpen={isTreatmentDropdownOpen}
                        onToggle={() => setIsTreatmentDropdownOpen((prev) => !prev)}
                        onClose={() => setIsTreatmentDropdownOpen(false)}
                        buttonRef={treatmentButtonRef}
                        disabled={isLoadingTreatments}
                        buttonClassName="w-full"
                      />
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-6 dark:border-slate-700 dark:from-slate-800/50 dark:to-slate-900/50">
                      <label className="mb-3 block text-sm font-semibold text-slate-700 dark:text-slate-300">
                        Notes <span className="text-slate-400 font-normal">(Optional)</span>
                      </label>
                      <textarea
                        rows={6}
                        value={formData.notes}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, notes: e.target.value }))
                        }
                        className="w-full resize-none rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                        placeholder="Enter appointment notes..."
                      />
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="border-t border-slate-200 bg-gradient-to-r from-slate-50 to-white px-6 py-4 dark:border-slate-700 dark:from-slate-800 dark:to-slate-900">
              <div className="flex justify-between gap-3">
                {currentStep === 2 && !isEditMode && (
                  <button
                    type="button"
                    onClick={handleBack}
                    disabled={isSubmitting}
                    className="rounded-lg border border-slate-300 bg-white px-6 py-2.5 text-sm font-medium text-slate-700 transition-all hover:bg-slate-50 disabled:opacity-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                  >
                    Back
                  </button>
                )}
                <div className="flex justify-end gap-3 ml-auto">
                  <button
                    type="button"
                    onClick={onClose}
                    disabled={isSubmitting}
                    className="rounded-lg border border-slate-300 bg-white px-6 py-2.5 text-sm font-medium text-slate-700 transition-all hover:bg-slate-50 disabled:opacity-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                  >
                    Cancel
                  </button>

                  {currentStep === 1 ? (
                    <button
                      type="button"
                      onClick={handleNext}
                      disabled={!selectedPatient}
                      className="rounded-lg bg-gradient-to-r from-blue-600 to-blue-500 px-6 py-2.5 text-sm font-medium text-white shadow-md transition-all hover:from-blue-700 hover:to-blue-600 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="rounded-lg bg-gradient-to-r from-blue-600 to-blue-500 px-6 py-2.5 text-sm font-medium text-white shadow-md transition-all hover:from-blue-700 hover:to-blue-600 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? (
                        <span className="flex items-center gap-2">
                          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                          {isEditMode ? 'Updating...' : 'Adding...'}
                        </span>
                      ) : (
                        isEditMode ? 'Update Appointment' : 'Add Appointment'
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>

      <ConfirmationModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={handleConfirmSave}
        title={isEditMode ? "Confirm Update Appointment" : "Confirm Add Appointment"}
        message={isEditMode ? "Are you sure you want to update this appointment?" : "Are you sure you want to add this appointment?"}
        confirmText={isEditMode ? "Yes, Update" : "Yes, Add"}
        cancelText="Cancel"
        confirmButtonClassName="bg-blue-600 hover:bg-blue-500"
      />
    </>
  )
}

