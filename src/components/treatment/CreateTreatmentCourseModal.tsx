import { useState, useEffect, useRef } from 'react'
import toast from 'react-hot-toast'
import { getClinicNames, type ClinicName } from '@api/clinics'
import { getTreatmentNames, getTreatment, type Treatment } from '@api/treatments'
import {
  createTreatmentCourse,
  updateTreatmentCourse,
  getTreatmentCourseById,
  type TreatmentCoursePayload,
  type TreatmentCourse,
  type UpdateTreatmentCoursePayload,
} from '@api/treatmentCourses'
import DropdownFilter from '@components/common/DropdownFilter'
import ConfirmationModal from '@components/common/ConfirmationModal'

type CreateTreatmentCourseModalProps = {
  isOpen: boolean
  onClose: () => void
  patientId: string
  doctorId: string
  primaryClinicId?: string
  onSuccess?: () => void
  courseId?: string
  courseData?: TreatmentCourse
}

export default function CreateTreatmentCourseModal({
  isOpen,
  onClose,
  patientId,
  doctorId,
  primaryClinicId,
  onSuccess,
  courseId,
  courseData: initialCourseData,
}: CreateTreatmentCourseModalProps) {
  const isEditMode = !!courseId
  const [clinics, setClinics] = useState<ClinicName[]>([])
  const [treatments, setTreatments] = useState<Array<{ id: string; name: string }>>([])
  const [selectedTreatmentId, setSelectedTreatmentId] = useState<string>('')
  const [treatmentDetails, setTreatmentDetails] = useState<Treatment | null>(null)
  const [isLoadingClinics, setIsLoadingClinics] = useState(false)
  const [isLoadingTreatments, setIsLoadingTreatments] = useState(false)
  const [isLoadingTreatmentDetails, setIsLoadingTreatmentDetails] = useState(false)
  const [isLoadingCourse, setIsLoadingCourse] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedFeeType, setSelectedFeeType] = useState<'min' | 'max' | 'avg' | 'custom'>('avg')
  const [selectedDurationType, setSelectedDurationType] = useState<'min' | 'max' | 'avg' | 'custom'>('avg')
  const [showAllImages, setShowAllImages] = useState(false)
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [clinicDropdownOpen, setClinicDropdownOpen] = useState(false)
  const [treatmentDropdownOpen, setTreatmentDropdownOpen] = useState(false)
  const [courseData, setCourseData] = useState<TreatmentCourse | null>(initialCourseData || null)
  const clinicButtonRef = useRef<HTMLButtonElement>(null)
  const treatmentButtonRef = useRef<HTMLButtonElement>(null)
  const notesTextareaRef = useRef<HTMLTextAreaElement>(null)

  const [formData, setFormData] = useState({
    clinicId: '',
    treatmentId: '',
    startDate: new Date().toISOString().split('T')[0],
    expectedEndDate: '',
    totalCost: '',
    notes: '',
  })

  useEffect(() => {
    if (isOpen) {
      if (isEditMode && courseId) {
        fetchCourseData()
      } else {
        fetchClinics()
        fetchTreatments()
        setFormData({
          clinicId: primaryClinicId || '',
          treatmentId: '',
          startDate: new Date().toISOString().split('T')[0],
          expectedEndDate: '',
          totalCost: '',
          notes: '',
        })
        setSelectedTreatmentId('')
        setTreatmentDetails(null)
        setSelectedFeeType('avg')
        setSelectedDurationType('avg')
        setShowAllImages(false)
        setClinicDropdownOpen(false)
        setTreatmentDropdownOpen(false)
      }
    } else {
      setCourseData(null)
      setShowConfirmModal(false)
    }
  }, [isOpen, primaryClinicId, courseId, isEditMode])

  useEffect(() => {
    if (isEditMode && courseData) {
      const formatDate = (dateString?: string) => {
        if (!dateString) return ''
        try {
          const date = new Date(dateString)
          const year = date.getFullYear()
          const month = String(date.getMonth() + 1).padStart(2, '0')
          const day = String(date.getDate()).padStart(2, '0')
          return `${year}-${month}-${day}`
        } catch {
          return ''
        }
      }

      setFormData({
        clinicId: courseData.clinicId || '',
        treatmentId: courseData.treatmentId,
        startDate: formatDate(courseData.startDate),
        expectedEndDate: formatDate(courseData.expectedEndDate),
        totalCost: courseData.totalCost?.toString() || '',
        notes: courseData.notes || '',
      })
      setSelectedTreatmentId(courseData.treatmentId)
    }
  }, [courseData, isEditMode])

  const fetchCourseData = async () => {
    if (!courseId) return

    try {
      setIsLoadingCourse(true)
      const course = initialCourseData || await getTreatmentCourseById(courseId)
      setCourseData(course)
      if (course.treatmentId) {
        await fetchTreatmentDetails(course.treatmentId)
      }
      await fetchClinics()
      await fetchTreatments()
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.error?.message ||
        error?.response?.data?.message ||
        error?.message ||
        'Unable to fetch course details. Please try again.'
      toast.error(errorMessage)
      onClose()
    } finally {
      setIsLoadingCourse(false)
    }
  }

  useEffect(() => {
    if (selectedTreatmentId && selectedTreatmentId !== treatmentDetails?.id) {
      fetchTreatmentDetails(selectedTreatmentId)
    }
  }, [selectedTreatmentId, treatmentDetails?.id])

  useEffect(() => {
    if (treatmentDetails && selectedTreatmentId && !isEditMode) {
      setFormData((prev) => {
        const updates: any = {
          treatmentId: selectedTreatmentId,
        }

        if (!treatmentDetails.isOneTime) {
          const avgFees = treatmentDetails.avgFees || treatmentDetails.minFees || 0
          const avgDuration = treatmentDetails.avgDuration || treatmentDetails.minDuration || 0

          updates.totalCost = avgFees.toString()

          if (avgDuration > 0 && prev.startDate) {
            const start = new Date(prev.startDate)
            const end = new Date(start)
            end.setDate(end.getDate() + avgDuration)
            updates.expectedEndDate = end.toISOString().split('T')[0]
          }

          setSelectedFeeType('avg')
          setSelectedDurationType('avg')
        } else {
          updates.totalCost = ''
          updates.expectedEndDate = ''
          setSelectedFeeType('avg')
          setSelectedDurationType('avg')
        }

        return { ...prev, ...updates }
      })
    }
  }, [treatmentDetails, selectedTreatmentId, isEditMode])

  useEffect(() => {
    if (notesTextareaRef.current) {
      notesTextareaRef.current.style.height = 'auto'
      notesTextareaRef.current.style.height = `${notesTextareaRef.current.scrollHeight}px`
    }
  }, [formData.notes])

  const fetchClinics = async () => {
    try {
      setIsLoadingClinics(true)
      const clinicList = await getClinicNames()
      setClinics(clinicList)
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

  const fetchTreatments = async () => {
    try {
      setIsLoadingTreatments(true)
      const treatmentList = await getTreatmentNames()
      setTreatments(treatmentList)
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

  const fetchTreatmentDetails = async (treatmentId: string) => {
    try {
      setIsLoadingTreatmentDetails(true)
      const treatment = await getTreatment(treatmentId)
      setTreatmentDetails(treatment)
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.error?.message ||
        error?.response?.data?.message ||
        error?.message ||
        'Unable to fetch treatment details. Please try again.'
      toast.error(errorMessage)
      setSelectedTreatmentId('')
      setTreatmentDetails(null)
    } finally {
      setIsLoadingTreatmentDetails(false)
    }
  }

  const handleTreatmentChange = (treatmentId: string) => {
    setTreatmentDropdownOpen(false)
    if (treatmentId) {
      setSelectedTreatmentId(treatmentId)
    } else {
      setSelectedTreatmentId('')
      setTreatmentDetails(null)
      setFormData((prev) => ({ ...prev, treatmentId: '', totalCost: '', expectedEndDate: '' }))
      setSelectedFeeType('avg')
      setSelectedDurationType('avg')
    }
  }

  const handleStartDateChange = (date: string) => {
    setFormData((prev) => {
      const updates: any = { startDate: date }

      if (treatmentDetails && selectedDurationType !== 'custom') {
        const duration = getDurationValue(selectedDurationType)
        if (duration > 0 && date) {
          const start = new Date(date)
          const end = new Date(start)
          end.setDate(end.getDate() + duration)
          updates.expectedEndDate = end.toISOString().split('T')[0]
        }
      } else if (prev.expectedEndDate && date && new Date(prev.expectedEndDate) < new Date(date)) {
        updates.expectedEndDate = ''
      }

      return { ...prev, ...updates }
    })
  }

  const getDurationValue = (type: 'min' | 'max' | 'avg' | 'custom'): number => {
    if (!treatmentDetails) return 0
    switch (type) {
      case 'min':
        return treatmentDetails.minDuration || 0
      case 'max':
        return treatmentDetails.maxDuration || 0
      case 'avg':
        return treatmentDetails.avgDuration || treatmentDetails.minDuration || 0
      default:
        return 0
    }
  }

  const getFeeValue = (type: 'min' | 'max' | 'avg' | 'custom'): number => {
    if (!treatmentDetails) return 0
    switch (type) {
      case 'min':
        return treatmentDetails.minFees || 0
      case 'max':
        return treatmentDetails.maxFees || 0
      case 'avg':
        return treatmentDetails.avgFees || treatmentDetails.minFees || 0
      default:
        return 0
    }
  }

  const handleFeeTypeSelect = (type: 'min' | 'max' | 'avg' | 'custom') => {
    setSelectedFeeType(type)
    if (type !== 'custom' && treatmentDetails) {
      const feeValue = getFeeValue(type)
      if (feeValue > 0) {
        setFormData((prev) => ({
          ...prev,
          totalCost: feeValue.toString(),
        }))
      }
    }
  }

  const handleDurationTypeSelect = (type: 'min' | 'max' | 'avg' | 'custom') => {
    setSelectedDurationType(type)
    if (type !== 'custom' && treatmentDetails) {
      setFormData((prev) => {
        if (!prev.startDate) return prev
        const duration = getDurationValue(type)
        if (duration > 0) {
          const start = new Date(prev.startDate)
          const end = new Date(start)
          end.setDate(end.getDate() + duration)
          return {
            ...prev,
            expectedEndDate: end.toISOString().split('T')[0],
          }
        }
        return prev
      })
    } else if (type === 'custom') {
      setFormData((prev) => ({
        ...prev,
        expectedEndDate: prev.expectedEndDate || '',
      }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (isEditMode) {
      setShowConfirmModal(true)
      return
    }

    if (!formData.clinicId) {
      toast.error('Please select a clinic')
      return
    }

    if (!formData.treatmentId) {
      toast.error('Please select a treatment')
      return
    }

    if (!formData.startDate) {
      toast.error('Please select a start date')
      return
    }

    if (formData.totalCost && (isNaN(Number(formData.totalCost)) || Number(formData.totalCost) < 0)) {
      toast.error('Please enter a valid total cost')
      return
    }

    setIsSubmitting(true)

    try {
      const payload: TreatmentCoursePayload = {
        doctorId,
        patientId,
        treatmentId: formData.treatmentId,
        startDate: new Date(formData.startDate).toISOString(),
        totalCost: formData.totalCost ? Number(formData.totalCost) : 0,
        clinicId: formData.clinicId,
        expectedEndDate: formData.expectedEndDate
          ? new Date(formData.expectedEndDate).toISOString()
          : undefined,
        notes: formData.notes.trim() || undefined,
      }

      await createTreatmentCourse(payload)
      toast.success('Treatment course created successfully')
      onSuccess?.()
      onClose()
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.error?.message ||
        error?.response?.data?.message ||
        error?.message ||
        'Unable to create treatment course. Please try again.'
      toast.error(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  const performUpdate = async () => {
    if (!courseId) return

    if (formData.totalCost && (isNaN(Number(formData.totalCost)) || Number(formData.totalCost) < 0)) {
      toast.error('Please enter a valid total cost')
      return
    }

    setIsSubmitting(true)

    try {
      const payload: UpdateTreatmentCoursePayload = {
        totalCost: formData.totalCost ? Number(formData.totalCost) : undefined,
        expectedEndDate: formData.expectedEndDate
          ? new Date(formData.expectedEndDate).toISOString()
          : undefined,
        notes: formData.notes.trim() || undefined,
      }

      await updateTreatmentCourse(courseId, payload)
      toast.success('Treatment course updated successfully')
      onSuccess?.()
      onClose()
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.error?.message ||
        error?.response?.data?.message ||
        error?.message ||
        'Unable to update treatment course. Please try again.'
      toast.error(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleConfirmUpdate = () => {
    setShowConfirmModal(false)
    performUpdate()
  }

  if (!isOpen) return null

  if (isLoadingCourse) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
        <div className="rounded-2xl bg-white p-6 dark:bg-slate-900">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto scrollbar-tiny rounded-2xl bg-white shadow-xl dark:bg-slate-900">
        <div className="sticky top-0 border-b border-slate-200 bg-white px-6 py-4 dark:border-slate-700 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
              {isEditMode ? 'Edit Treatment Course' : 'Create New Treatment Course'}
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
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

        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Clinic <span className="text-red-500">*</span>
                </label>
                <DropdownFilter
                  label="Select a clinic"
                  value={formData.clinicId}
                  options={clinics.map((clinic) => ({ value: clinic.id, label: clinic.name }))}
                  onChange={(value) => setFormData((prev) => ({ ...prev, clinicId: value }))}
                  isOpen={clinicDropdownOpen}
                  onToggle={() => setClinicDropdownOpen(!clinicDropdownOpen)}
                  onClose={() => setClinicDropdownOpen(false)}
                  buttonRef={clinicButtonRef}
                  disabled={isEditMode}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Treatment <span className="text-red-500">*</span>
                </label>
                <DropdownFilter
                  label="Select a treatment"
                  value={selectedTreatmentId}
                  options={treatments.map((treatment) => ({ value: treatment.id, label: treatment.name }))}
                  onChange={(value) => handleTreatmentChange(value)}
                  isOpen={treatmentDropdownOpen}
                  onToggle={() => setTreatmentDropdownOpen(!treatmentDropdownOpen)}
                  onClose={() => setTreatmentDropdownOpen(false)}
                  buttonRef={treatmentButtonRef}
                  disabled={isEditMode}
                />
              </div>
            </div>

            {isLoadingTreatmentDetails && (
              <div className="flex items-center justify-center py-4">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-600 border-t-transparent"></div>
              </div>
            )}

            {treatmentDetails && (
              <div className="space-y-6 rounded-xl border border-slate-200 bg-slate-50 p-6 dark:border-slate-700 dark:bg-slate-800/50">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                    {treatmentDetails.name}
                  </h3>
                  {treatmentDetails.description && (
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {treatmentDetails.description}
                    </p>
                  )}
                </div>

                {treatmentDetails.followUpRequired && (
                  <div className="rounded-lg bg-blue-50 border border-blue-200 p-4 dark:bg-blue-900/20 dark:border-blue-800">
                    <div className="flex items-center gap-2">
                      <svg
                        className="h-5 w-5 text-blue-600 dark:text-blue-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <div>
                        <p className="text-sm font-medium text-blue-900 dark:text-blue-200">
                          Follow-up Required
                        </p>
                        {treatmentDetails.followUpAfterDays && (
                          <p className="text-xs text-blue-700 dark:text-blue-300">
                            After {treatmentDetails.followUpAfterDays} days
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {treatmentDetails.images && treatmentDetails.images.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Images
                    </h4>
                    <div className="flex gap-2 flex-wrap">
                      {treatmentDetails.images.slice(0, 3).map((image, idx) => (
                        <img
                          key={idx}
                          src={image}
                          alt={`Treatment ${idx + 1}`}
                          className="h-24 w-24 rounded-lg object-cover border border-slate-200 dark:border-slate-700 cursor-pointer hover:opacity-80 transition-opacity"
                          onClick={() => setShowAllImages(true)}
                        />
                      ))}
                      {treatmentDetails.images.length > 3 && (
                        <button
                          type="button"
                          onClick={() => setShowAllImages(true)}
                          className="h-24 w-24 rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-600 flex items-center justify-center text-xs text-slate-600 dark:text-slate-400 hover:border-blue-500 hover:text-blue-600 dark:hover:border-blue-400 dark:hover:text-blue-400 transition-colors"
                        >
                          +{treatmentDetails.images.length - 3} More
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {treatmentDetails.steps && treatmentDetails.steps.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Treatment Steps
                    </h4>
                    <ol className="list-decimal list-inside space-y-1 text-sm text-slate-900 dark:text-slate-100">
                      {treatmentDetails.steps.map((step, idx) => (
                        <li key={idx}>{step}</li>
                      ))}
                    </ol>
                  </div>
                )}

                {treatmentDetails.aftercare && treatmentDetails.aftercare.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Aftercare Instructions
                    </h4>
                    <ul className="list-disc list-inside space-y-1 text-sm text-slate-900 dark:text-slate-100">
                      {treatmentDetails.aftercare.map((item, idx) => (
                        <li key={idx}>{item}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {treatmentDetails.risks && treatmentDetails.risks.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Risks & Considerations
                    </h4>
                    <ul className="list-disc list-inside space-y-1 text-sm text-slate-900 dark:text-slate-100">
                      {treatmentDetails.risks.map((risk, idx) => (
                        <li key={idx}>{risk}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {showAllImages && treatmentDetails?.images && (
              <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/75 p-4">
                <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto scrollbar-tiny rounded-2xl bg-white dark:bg-slate-900 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                      Treatment Images
                    </h3>
                    <button
                      type="button"
                      onClick={() => setShowAllImages(false)}
                      className="rounded-lg p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300"
                    >
                      <svg
                        className="h-6 w-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {treatmentDetails.images.map((image, idx) => (
                      <img
                        key={idx}
                        src={image}
                        alt={`Treatment image ${idx + 1}`}
                        className="w-full h-48 rounded-lg object-cover border border-slate-200 dark:border-slate-700"
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Start Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => handleStartDateChange(e.target.value)}
                  disabled={isEditMode}
                  className={`w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 ${
                    isEditMode ? 'cursor-not-allowed opacity-60' : ''
                  }`}
                  required
                />
              </div>

              {!treatmentDetails?.isOneTime && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                    Expected End Date <span className="text-slate-400">(Optional)</span>
                  </label>
                  {treatmentDetails && !isEditMode && (
                    <div className="flex flex-wrap gap-2 mb-3">
                      {treatmentDetails.minDuration && (
                        <button
                          type="button"
                          onClick={() => handleDurationTypeSelect('min')}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                            selectedDurationType === 'min'
                              ? 'bg-blue-600 text-white dark:bg-blue-500'
                              : 'bg-slate-200 text-slate-700 hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600'
                          }`}
                        >
                          Min ({treatmentDetails.minDuration} days)
                        </button>
                      )}
                      {treatmentDetails.avgDuration && (
                        <button
                          type="button"
                          onClick={() => handleDurationTypeSelect('avg')}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                            selectedDurationType === 'avg'
                              ? 'bg-blue-600 text-white dark:bg-blue-500'
                              : 'bg-slate-200 text-slate-700 hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600'
                          }`}
                        >
                          Avg ({treatmentDetails.avgDuration} days)
                        </button>
                      )}
                      {treatmentDetails.maxDuration && (
                        <button
                          type="button"
                          onClick={() => handleDurationTypeSelect('max')}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                            selectedDurationType === 'max'
                              ? 'bg-blue-600 text-white dark:bg-blue-500'
                              : 'bg-slate-200 text-slate-700 hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600'
                          }`}
                        >
                          Max ({treatmentDetails.maxDuration} days)
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleDurationTypeSelect('custom')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                          selectedDurationType === 'custom'
                            ? 'bg-blue-600 text-white dark:bg-blue-500'
                            : 'bg-slate-200 text-slate-700 hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600'
                        }`}
                      >
                        Custom
                      </button>
                    </div>
                  )}
                  <input
                    type="date"
                    value={formData.expectedEndDate}
                    onChange={(e) => {
                      setFormData((prev) => ({ ...prev, expectedEndDate: e.target.value }))
                      if (e.target.value) {
                        setSelectedDurationType('custom')
                      }
                    }}
                    min={formData.startDate}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                  />
                </div>
              )}
            </div>

            {(isEditMode || !treatmentDetails?.isOneTime) && (
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                  Total Cost (₹) <span className="text-slate-400">(Optional)</span>
                </label>
                {treatmentDetails && !isEditMode && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {treatmentDetails.minFees && (
                      <button
                        type="button"
                        onClick={() => handleFeeTypeSelect('min')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                          selectedFeeType === 'min'
                            ? 'bg-blue-600 text-white dark:bg-blue-500'
                            : 'bg-slate-200 text-slate-700 hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600'
                        }`}
                      >
                        Min: ₹{treatmentDetails.minFees.toLocaleString()}
                      </button>
                    )}
                    {treatmentDetails.avgFees && (
                      <button
                        type="button"
                        onClick={() => handleFeeTypeSelect('avg')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                          selectedFeeType === 'avg'
                            ? 'bg-blue-600 text-white dark:bg-blue-500'
                            : 'bg-slate-200 text-slate-700 hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600'
                        }`}
                      >
                        Avg: ₹{treatmentDetails.avgFees.toLocaleString()}
                      </button>
                    )}
                    {treatmentDetails.maxFees && (
                      <button
                        type="button"
                        onClick={() => handleFeeTypeSelect('max')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                          selectedFeeType === 'max'
                            ? 'bg-blue-600 text-white dark:bg-blue-500'
                            : 'bg-slate-200 text-slate-700 hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600'
                        }`}
                      >
                        Max: ₹{treatmentDetails.maxFees.toLocaleString()}
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleFeeTypeSelect('custom')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                        selectedFeeType === 'custom'
                          ? 'bg-blue-600 text-white dark:bg-blue-500'
                          : 'bg-slate-200 text-slate-700 hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600'
                      }`}
                    >
                      Custom
                    </button>
                  </div>
                )}
                <input
                  type="number"
                  value={formData.totalCost}
                  onChange={(e) => {
                    setFormData((prev) => ({ ...prev, totalCost: e.target.value }))
                    if (e.target.value) {
                      setSelectedFeeType('custom')
                    }
                  }}
                  min="0"
                  step="0.01"
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Notes <span className="text-slate-400">(Optional)</span>
              </label>
              <textarea
                ref={notesTextareaRef}
                value={formData.notes}
                onChange={(e) => {
                  setFormData((prev) => ({ ...prev, notes: e.target.value }))
                  if (e.target) {
                    e.target.style.height = 'auto'
                    e.target.style.height = `${e.target.scrollHeight}px`
                  }
                }}
                style={{ minHeight: '80px', maxHeight: '300px', overflowY: 'auto' }}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 resize-none"
                placeholder="Add any additional notes..."
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-3 border-t border-slate-200 pt-6 dark:border-slate-700">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-slate-100 to-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:cursor-pointer hover:from-slate-200 hover:to-slate-300 disabled:cursor-not-allowed disabled:opacity-60 dark:from-slate-800/30 dark:to-slate-700/30 dark:text-slate-200 dark:hover:from-slate-700/40 dark:hover:to-slate-600/40"
              disabled={isSubmitting || isLoadingTreatmentDetails || isLoadingCourse}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-blue-100 to-blue-200 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:cursor-pointer hover:from-blue-200 hover:to-blue-300 disabled:cursor-not-allowed disabled:opacity-60 dark:from-blue-800/30 dark:to-blue-700/30 dark:text-slate-200 dark:hover:from-blue-700/40 dark:hover:to-blue-600/40"
              disabled={isSubmitting || isLoadingTreatmentDetails || isLoadingCourse}
            >
              {isSubmitting ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-700 border-t-transparent dark:border-slate-200"></span>
                  {isEditMode ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                isEditMode ? 'Update Treatment Course' : 'Create Treatment Course'
              )}
            </button>
          </div>
        </form>
      </div>

      {isEditMode && (
        <ConfirmationModal
          isOpen={showConfirmModal}
          onClose={() => setShowConfirmModal(false)}
          onConfirm={handleConfirmUpdate}
          title="Update Treatment Course"
          message="Are you sure you want to update this treatment course? Please review all changes before confirming."
          confirmText="Update Course"
          cancelText="Cancel"
          confirmButtonClassName="bg-blue-600 hover:bg-blue-500 dark:bg-blue-500 dark:hover:bg-blue-400"
        />
      )}
    </div>
  )
}

