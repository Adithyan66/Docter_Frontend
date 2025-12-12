import { useState, useEffect, useRef, type ChangeEvent } from 'react'
import toast from 'react-hot-toast'
import { createVisit, updateVisit, type CreateVisitRequestDto, type CreateVisitMediaDto, type MediaType, type VisitResponseDto } from '@api/visits'
import { S3Service } from '@services/s3Service'
import { getClinicNames, type ClinicName } from '@api/clinics'
import { type Treatment } from '@api/treatments'

type CreateVisitModalProps = {
  isOpen: boolean
  onClose: () => void
  patientId: string
  courseId: string
  doctorId: string
  clinicId?: string
  primaryClinicId?: string
  onSuccess?: () => void
  visitId?: string
  visitData?: VisitResponseDto
  treatmentDetails?: Treatment | null
}

type PrescriptionItemForm = {
  medicineName: string
  form: string
  strength: string
  dosage: string
  frequency: string
  duration: string
  notes: string
}

type MediaFileForm = {
  file?: File
  preview: string
  type: MediaType
  notes: string
  isExisting?: boolean
  existingUrl?: string
}

type PaymentMethod = 'cash' | 'card' | 'upi' | 'bank' | 'insurance' | 'online'

export default function CreateVisitModal({
  isOpen,
  onClose,
  patientId,
  courseId,
  // doctorId,
  clinicId: initialClinicId,
  primaryClinicId,
  onSuccess,
  visitId,
  visitData: initialVisitData,
  treatmentDetails,
}: CreateVisitModalProps) {
  const isEditMode = !!visitId
  const [clinics, setClinics] = useState<ClinicName[]>([])
  const [isLoadingClinics, setIsLoadingClinics] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const formatDateTimeLocal = (date: Date): string => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    return `${year}-${month}-${day}T${hours}:${minutes}`
  }

  const calculateNextVisitDate = (visitDateStr: string): string | null => {
    if (!treatmentDetails || treatmentDetails.isOneTime) {
      return null
    }

    const regularInterval = treatmentDetails.regularVisitInterval
    if (!regularInterval || !regularInterval.interval || !regularInterval.unit) {
      return null
    }

    const visitDate = new Date(visitDateStr)
    if (isNaN(visitDate.getTime())) {
      return null
    }

    const nextDate = new Date(visitDate)
    const { interval, unit } = regularInterval

    switch (unit) {
      case 'days':
        nextDate.setDate(nextDate.getDate() + interval)
        break
      case 'weeks':
        nextDate.setDate(nextDate.getDate() + interval * 7)
        break
      case 'months':
        nextDate.setMonth(nextDate.getMonth() + interval)
        break
      case 'years':
        nextDate.setFullYear(nextDate.getFullYear() + interval)
        break
      default:
        return null
    }

    return formatDateTimeLocal(nextDate)
  }

  const [formData, setFormData] = useState({
    clinicId: initialClinicId || primaryClinicId || '',
    visitDate: formatDateTimeLocal(new Date()),
    nextVisitDate: '',
    notes: '',
    billedAmount: '',
    paymentMethod: 'cash' as PaymentMethod,
    paymentReference: '',
  })

  const [diagnosisItems, setDiagnosisItems] = useState<string[]>([])
  const [currentDiagnosis, setCurrentDiagnosis] = useState('')

  const [prescriptionItems, setPrescriptionItems] = useState<PrescriptionItemForm[]>([])
  const [currentPrescriptionItem, setCurrentPrescriptionItem] = useState<PrescriptionItemForm>({
    medicineName: '',
    form: '',
    strength: '',
    dosage: '',
    frequency: '',
    duration: '',
    notes: '',
  })

  const [mediaFiles, setMediaFiles] = useState<MediaFileForm[]>([])
  const [activeTab, setActiveTab] = useState<'details' | 'prescription' | 'media'>('details')
  const notesTextareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (isOpen) {
      fetchClinics()
      if (isEditMode && initialVisitData) {
        loadVisitData(initialVisitData)
        setActiveTab('details')
      } else {
        resetForm()
      }
    }
  }, [isOpen, initialClinicId, primaryClinicId, isEditMode, initialVisitData])

  useEffect(() => {
    if (isEditMode) {
      setActiveTab('details')
    }
  }, [isEditMode])

  useEffect(() => {
    if (!isEditMode) {
      const defaultClinicId = initialClinicId || primaryClinicId || ''
      setFormData((prev) => ({ ...prev, clinicId: defaultClinicId }))
    }
  }, [initialClinicId, primaryClinicId, isEditMode])

  useEffect(() => {
    if (formData.billedAmount && !formData.paymentMethod) {
      setFormData((prev) => ({ ...prev, paymentMethod: 'cash' }))
    }
  }, [formData.billedAmount])

  useEffect(() => {
    if (!isEditMode && !treatmentDetails?.isOneTime && formData.visitDate) {
      const calculatedNextVisitDate = calculateNextVisitDate(formData.visitDate)
      if (calculatedNextVisitDate) {
        setFormData((prev) => {
          if (prev.nextVisitDate !== calculatedNextVisitDate) {
            return { ...prev, nextVisitDate: calculatedNextVisitDate }
          }
          return prev
        })
      } else {
        setFormData((prev) => ({ ...prev, nextVisitDate: '' }))
      }
    }
  }, [formData.visitDate, treatmentDetails, isEditMode])

  const resetForm = () => {
    const initialVisitDate = formatDateTimeLocal(new Date())
    const initialNextVisitDate = calculateNextVisitDate(initialVisitDate) || ''
    setFormData({
      clinicId: initialClinicId || primaryClinicId || '',
      visitDate: initialVisitDate,
      nextVisitDate: initialNextVisitDate,
      notes: '',
      billedAmount: '',
      paymentMethod: 'cash',
      paymentReference: '',
    })
    setDiagnosisItems([])
    setCurrentDiagnosis('')
    setPrescriptionItems([])
    setCurrentPrescriptionItem({
      medicineName: '',
      form: '',
      strength: '',
      dosage: '',
      frequency: '',
      duration: '',
      notes: '',
    })
    setMediaFiles([])
    setActiveTab('details')
  }

  const loadVisitData = (visitData: VisitResponseDto) => {
    const visitDate = formatDateTimeLocal(new Date(visitData.visitDate))
    setFormData({
      clinicId: visitData.clinicId || initialClinicId || primaryClinicId || '',
      visitDate,
      nextVisitDate: '',
      notes: visitData.notes || '',
      billedAmount: visitData.billedAmount?.toString() || '',
      paymentMethod: 'cash',
      paymentReference: '',
    })

    if (visitData.prescription) {
      setDiagnosisItems(visitData.prescription.diagnosis || [])
      setPrescriptionItems(
        visitData.prescription.items.map((item) => ({
          medicineName: item.medicineName,
          form: item.form || '',
          strength: item.strength || '',
          dosage: item.dosage || '',
          frequency: item.frequency || '',
          duration: item.duration || '',
          notes: item.notes || '',
        }))
      )
    } else {
      setDiagnosisItems([])
      setPrescriptionItems([])
    }

    if (visitData.media && visitData.media.length > 0) {
      setMediaFiles(
        visitData.media.map((media) => ({
          preview: media.url,
          type: media.type,
          notes: media.notes || '',
          isExisting: true,
          existingUrl: media.url,
        }))
      )
    } else {
      setMediaFiles([])
    }

    setActiveTab('details')
  }

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

  const addDiagnosis = () => {
    if (!currentDiagnosis.trim()) return
    setDiagnosisItems((prev) => [...prev, currentDiagnosis.trim()])
    setCurrentDiagnosis('')
  }

  const removeDiagnosis = (index: number) => {
    setDiagnosisItems((prev) => prev.filter((_, i) => i !== index))
  }

  const addPrescriptionItem = () => {
    if (!currentPrescriptionItem.medicineName.trim()) {
      toast.error('Please enter medicine name')
      return
    }
    setPrescriptionItems((prev) => [...prev, { ...currentPrescriptionItem }])
    setCurrentPrescriptionItem({
      medicineName: '',
      form: '',
      strength: '',
      dosage: '',
      frequency: '',
      duration: '',
      notes: '',
    })
  }

  const removePrescriptionItem = (index: number) => {
    setPrescriptionItems((prev) => prev.filter((_, i) => i !== index))
  }

  const handleMediaFileSelect = (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files?.length) return

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    const maxFileSize = 10 * 1024 * 1024

    Array.from(files).forEach((file) => {
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file')
        return
      }

      if (file.size > maxFileSize) {
        toast.error('File size must be less than 10MB')
        return
      }

      if (!allowedTypes.includes(file.type)) {
        toast.error('Only JPEG, PNG, and WebP images are allowed')
        return
      }

      const preview = URL.createObjectURL(file)
      setMediaFiles((prev) => [
        ...prev,
        {
          file,
          preview,
          type: 'image',
          notes: '',
        },
      ])
    })

    event.target.value = ''
  }

  const removeMediaFile = (index: number) => {
    setMediaFiles((prev) => {
      const removed = prev[index]
      if (!removed.isExisting) {
        URL.revokeObjectURL(removed.preview)
      }
      return prev.filter((_, i) => i !== index)
    })
  }

  const updateMediaType = (index: number, type: MediaType) => {
    setMediaFiles((prev) => prev.map((item, i) => (i === index ? { ...item, type } : item)))
  }

  const updateMediaNotes = (index: number, notes: string) => {
    setMediaFiles((prev) => prev.map((item, i) => (i === index ? { ...item, notes } : item)))
  }

  const adjustTextareaHeight = (textarea: HTMLTextAreaElement) => {
    textarea.style.height = 'auto'
    textarea.style.height = `${textarea.scrollHeight}px`
  }

  const handleNotesChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, notes: e.target.value }))
    adjustTextareaHeight(e.target)
  }

  useEffect(() => {
    if (notesTextareaRef.current && activeTab === 'details') {
      adjustTextareaHeight(notesTextareaRef.current)
    }
  }, [formData.notes, activeTab])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.visitDate) {
      toast.error('Please select a visit date')
      return
    }

    setIsSubmitting(true)
    if (!isEditMode) {
      setIsUploading(true)
    }

    try {
      const mediaUploads: CreateVisitMediaDto[] = []

      if (!isEditMode) {
        for (const mediaFile of mediaFiles) {
          if (mediaFile.isExisting && mediaFile.existingUrl) {
            mediaUploads.push({
              url: mediaFile.existingUrl,
              filename: 'image',
              type: mediaFile.type,
              notes: mediaFile.notes.trim() || undefined,
            })
          } else if (mediaFile.file) {
            try {
              const { publicUrl } = await S3Service.uploadImage(
                'Patient-Media',
                mediaFile.file,
                undefined
              )
              mediaUploads.push({
                url: publicUrl,
                filename: mediaFile.file.name,
                mimeType: mediaFile.file.type,
                size: mediaFile.file.size,
                type: mediaFile.type,
                notes: mediaFile.notes.trim() || undefined,
              })
            } catch (error: any) {
              toast.error(`Failed to upload ${mediaFile.file.name}. Please try again.`)
              setIsUploading(false)
              setIsSubmitting(false)
              return
            }
          }
        }
      }

      const prescriptionPayload =
        !isEditMode && (prescriptionItems.length > 0 || diagnosisItems.length > 0)
          ? {
              clinicId: formData.clinicId || undefined,
              diagnosis: diagnosisItems.length > 0 ? diagnosisItems : undefined,
              items: prescriptionItems.map((item) => ({
                medicineName: item.medicineName,
                form: item.form.trim() || undefined,
                strength: item.strength.trim() || undefined,
                dosage: item.dosage.trim() || undefined,
                frequency: item.frequency.trim() || undefined,
                duration: item.duration.trim() || undefined,
                notes: item.notes.trim() || undefined,
              })),
              notes: formData.notes.trim() || undefined,
            }
          : undefined

      const payload: CreateVisitRequestDto & { paymentMethod?: PaymentMethod; paymentReference?: string } = {
        patientId,
        courseId,
        clinicId: formData.clinicId || undefined,
        visitDate: new Date(formData.visitDate).toISOString(),
        nextVisitDate: !isEditMode && formData.nextVisitDate ? new Date(formData.nextVisitDate).toISOString() : undefined,
        notes: formData.notes.trim() || undefined,
        billedAmount: formData.billedAmount ? Number(formData.billedAmount) : undefined,
        prescription: prescriptionPayload,
        media: !isEditMode && mediaUploads.length > 0 ? mediaUploads : undefined,
        paymentMethod: formData.billedAmount ? formData.paymentMethod : undefined,
        paymentReference: formData.billedAmount && formData.paymentMethod !== 'cash' && formData.paymentReference.trim() ? formData.paymentReference.trim() : undefined,
      }

      if (isEditMode && visitId) {
        await updateVisit(visitId, payload)
        toast.success('Visit updated successfully')
      } else {
        await createVisit(payload)
        toast.success('Visit created successfully')
      }
      onSuccess?.()
      onClose()
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.error?.message ||
        error?.response?.data?.message ||
        error?.message ||
        `Unable to ${isEditMode ? 'update' : 'create'} visit. Please try again.`
      toast.error(errorMessage)
    } finally {
      setIsUploading(false)
      setIsSubmitting(false)
    }
  }

  useEffect(() => {
    return () => {
      mediaFiles.forEach((item) => {
        if (!item.isExisting) {
          URL.revokeObjectURL(item.preview)
        }
      })
    }
  }, [mediaFiles])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-4xl max-h-[90vh] flex flex-col rounded-2xl bg-white shadow-xl dark:bg-slate-900 overflow-hidden">
        <div className="sticky top-0 z-10 border-b border-slate-200 bg-white px-6 py-4 dark:border-slate-700 dark:bg-slate-900">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
              {isEditMode ? 'Edit Visit' : 'Create New Visit'}
            </h2>
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

          {!isEditMode && (
            <div className="bg-slate-50 dark:bg-slate-800/50">
              <div className="flex gap-0 overflow-x-auto">
                <button
                  type="button"
                  onClick={() => setActiveTab('details')}
                  className={`relative whitespace-nowrap px-4 py-2.5 text-sm font-medium transition-all ${
                    activeTab === 'details'
                      ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                  } ${
                    activeTab === 'details'
                      ? 'rounded-tl-lg rounded-tr-lg'
                      : ''
                  }`}
                >
                  Visit Details
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('prescription')}
                  className={`relative whitespace-nowrap px-4 py-2.5 text-sm font-medium transition-all ${
                    activeTab === 'prescription'
                      ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                  } ${
                    activeTab === 'prescription'
                      ? 'rounded-tl-lg rounded-tr-lg'
                      : ''
                  }`}
                >
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 h-1/2 w-px bg-slate-200 dark:bg-slate-700"></div>
                  Diagnosis & Prescription
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('media')}
                  className={`relative whitespace-nowrap px-4 py-2.5 text-sm font-medium transition-all ${
                    activeTab === 'media'
                      ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                  } ${
                    activeTab === 'media'
                      ? 'rounded-tl-lg rounded-tr-lg'
                      : ''
                  }`}
                >
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 h-1/2 w-px bg-slate-200 dark:bg-slate-700"></div>
                  Media
                </button>
              </div>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="flex-1 overflow-y-auto scrollbar-tiny p-6">
            {activeTab === 'details' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Visit Date & Time <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="datetime-local"
                      value={formData.visitDate}
                      onChange={(e) => setFormData((prev) => ({ ...prev, visitDate: e.target.value }))}
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Clinic <span className="text-slate-400">(Optional)</span>
                    </label>
                    <select
                      value={formData.clinicId}
                      onChange={(e) => setFormData((prev) => ({ ...prev, clinicId: e.target.value }))}
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                      disabled={isLoadingClinics}
                    >
                      <option value="">Select a clinic</option>
                      {clinics.map((clinic) => (
                        <option key={clinic.id} value={clinic.id}>
                          {clinic.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Billed Amount <span className="text-slate-400">(Optional)</span>
                    </label>
                    <div className="flex gap-2 mb-2">
                      <button
                        type="button"
                        onClick={() => setFormData((prev) => ({ ...prev, billedAmount: '500', paymentMethod: 'cash', paymentReference: '' }))}
                        className={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                          formData.billedAmount === '500'
                            ? 'border-blue-500 bg-blue-50 text-blue-700 dark:border-blue-400 dark:bg-blue-900/30 dark:text-blue-400'
                            : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
                        }`}
                      >
                        ₹500
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData((prev) => ({ ...prev, billedAmount: '1000', paymentMethod: 'cash', paymentReference: '' }))}
                        className={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                          formData.billedAmount === '1000'
                            ? 'border-blue-500 bg-blue-50 text-blue-700 dark:border-blue-400 dark:bg-blue-900/30 dark:text-blue-400'
                            : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
                        }`}
                      >
                        ₹1000
                      </button>
                    </div>
                    <div className="flex gap-2 items-start">
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={formData.billedAmount}
                        onChange={(e) => {
                          const value = e.target.value
                          setFormData((prev) => ({ 
                            ...prev, 
                            billedAmount: value,
                            paymentMethod: value ? (prev.paymentMethod || 'cash') : prev.paymentMethod,
                            paymentReference: value ? prev.paymentReference : ''
                          }))
                        }}
                        className="flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                        placeholder="0.00"
                      />
                      {formData.billedAmount && (
                        <div className="flex flex-wrap gap-1.5">
                          {(['cash', 'card', 'upi', 'bank', 'insurance', 'online'] as PaymentMethod[]).map((method) => (
                            <button
                              key={method}
                              type="button"
                              onClick={() => setFormData((prev) => ({ ...prev, paymentMethod: method, paymentReference: method === 'cash' ? '' : prev.paymentReference }))}
                              className={`rounded-lg border px-2 py-1 text-xs font-medium transition-colors capitalize whitespace-nowrap ${
                                formData.paymentMethod === method
                                  ? 'border-blue-500 bg-blue-50 text-blue-700 dark:border-blue-400 dark:bg-blue-900/30 dark:text-blue-400'
                                  : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
                              }`}
                            >
                              {method === 'upi' ? 'UPI' : method}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {formData.billedAmount && formData.paymentMethod !== 'cash' && (
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Payment Reference <span className="text-slate-400">(Optional)</span>
                      </label>
                      <input
                        type="text"
                        value={formData.paymentReference}
                        onChange={(e) => setFormData((prev) => ({ ...prev, paymentReference: e.target.value }))}
                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                        placeholder="Transaction ID, Check No., etc."
                      />
                    </div>
                  )}

                  {!isEditMode && treatmentDetails && !treatmentDetails.isOneTime && treatmentDetails.regularVisitInterval?.interval && treatmentDetails.regularVisitInterval?.unit ? (
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Next Visit Date <span className="text-slate-400">(Optional)</span>
                      </label>
                      <input
                        type="datetime-local"
                        value={formData.nextVisitDate}
                        onChange={(e) => setFormData((prev) => ({ ...prev, nextVisitDate: e.target.value }))}
                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                      />
                    </div>
                  ) : null}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Notes <span className="text-slate-400">(Optional)</span>
                  </label>
                  <textarea
                    ref={notesTextareaRef}
                    value={formData.notes}
                    onChange={handleNotesChange}
                    rows={6}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 resize-none overflow-hidden"
                    placeholder="Enter visit notes..."
                  />
                </div>
              </div>
            )}

            {!isEditMode && activeTab === 'prescription' && (
              <div className="space-y-6">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/50">
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">
                    Diagnosis <span className="text-slate-400 font-normal">(Optional)</span>
                  </h3>
                  <div className="flex gap-2 mb-3">
                    <input
                      type="text"
                      value={currentDiagnosis}
                      onChange={(e) => setCurrentDiagnosis(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          addDiagnosis()
                        }
                      }}
                      className="flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                      placeholder="Enter diagnosis"
                    />
                    <button
                      type="button"
                      onClick={addDiagnosis}
                      className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-500 dark:bg-blue-500 dark:hover:bg-blue-400"
                    >
                      Add
                    </button>
                  </div>
                  {diagnosisItems.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {diagnosisItems.map((diagnosis, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center gap-2 rounded-lg bg-blue-100 px-3 py-1.5 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                        >
                          {diagnosis}
                          <button
                            type="button"
                            onClick={() => removeDiagnosis(index)}
                            className="text-blue-700 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                          >
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                              />
                            </svg>
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/50">
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">
                    Prescription Items <span className="text-slate-400 font-normal">(Optional)</span>
                  </h3>
                  <div className="space-y-4 mb-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                          Medicine Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={currentPrescriptionItem.medicineName}
                          onChange={(e) =>
                            setCurrentPrescriptionItem((prev) => ({ ...prev, medicineName: e.target.value }))
                          }
                          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                          placeholder="Enter medicine name"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                          Form
                        </label>
                        <input
                          type="text"
                          value={currentPrescriptionItem.form}
                          onChange={(e) =>
                            setCurrentPrescriptionItem((prev) => ({ ...prev, form: e.target.value }))
                          }
                          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                          placeholder="Tablet, Syrup, etc."
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                          Strength
                        </label>
                        <input
                          type="text"
                          value={currentPrescriptionItem.strength}
                          onChange={(e) =>
                            setCurrentPrescriptionItem((prev) => ({ ...prev, strength: e.target.value }))
                          }
                          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                          placeholder="500mg, 10ml, etc."
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                          Dosage
                        </label>
                        <input
                          type="text"
                          value={currentPrescriptionItem.dosage}
                          onChange={(e) =>
                            setCurrentPrescriptionItem((prev) => ({ ...prev, dosage: e.target.value }))
                          }
                          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                          placeholder="1 tablet, 5ml, etc."
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                          Frequency
                        </label>
                        <input
                          type="text"
                          value={currentPrescriptionItem.frequency}
                          onChange={(e) =>
                            setCurrentPrescriptionItem((prev) => ({ ...prev, frequency: e.target.value }))
                          }
                          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                          placeholder="Twice daily, Once daily, etc."
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                          Duration
                        </label>
                        <input
                          type="text"
                          value={currentPrescriptionItem.duration}
                          onChange={(e) =>
                            setCurrentPrescriptionItem((prev) => ({ ...prev, duration: e.target.value }))
                          }
                          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                          placeholder="5 days, 1 week, etc."
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                        Notes
                      </label>
                      <input
                        type="text"
                        value={currentPrescriptionItem.notes}
                        onChange={(e) =>
                          setCurrentPrescriptionItem((prev) => ({ ...prev, notes: e.target.value }))
                        }
                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                        placeholder="Take after meals, etc."
                      />
                    </div>
                    <button
                      type="button"
                      onClick={addPrescriptionItem}
                      className="w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-500 dark:bg-blue-500 dark:hover:bg-blue-400"
                    >
                      Add Prescription Item
                    </button>
                  </div>
                  {prescriptionItems.length > 0 && (
                    <div className="space-y-2">
                      {prescriptionItems.map((item, index) => (
                        <div
                          key={index}
                          className="flex items-start justify-between rounded-lg bg-white p-3 dark:bg-slate-700"
                        >
                          <div className="flex-1">
                            <p className="text-sm font-medium text-slate-900 dark:text-white">
                              {item.medicineName}
                            </p>
                            <div className="mt-1 flex flex-wrap gap-2 text-xs text-slate-600 dark:text-slate-400">
                              {item.form && <span>Form: {item.form}</span>}
                              {item.strength && <span>Strength: {item.strength}</span>}
                              {item.dosage && <span>Dosage: {item.dosage}</span>}
                              {item.frequency && <span>Frequency: {item.frequency}</span>}
                              {item.duration && <span>Duration: {item.duration}</span>}
                            </div>
                            {item.notes && (
                              <p className="mt-1 text-xs text-slate-500 dark:text-slate-500">{item.notes}</p>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={() => removePrescriptionItem(index)}
                            className="ml-3 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                          >
                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {!isEditMode && activeTab === 'media' && (
              <div className="space-y-6">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/50">
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">
                    Media Files <span className="text-slate-400 font-normal">(Optional)</span>
                  </h3>
                  <div className="mb-4">
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleMediaFileSelect}
                      className="hidden"
                      id="media-file-input"
                    />
                    <label
                      htmlFor="media-file-input"
                      className="inline-block cursor-pointer rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-500 dark:bg-blue-500 dark:hover:bg-blue-400"
                    >
                      Select Images
                    </label>
                  </div>
                  {mediaFiles.length > 0 && (
                    <div className="space-y-3">
                      {mediaFiles.map((mediaFile, index) => (
                        <div
                          key={index}
                          className="flex gap-3 rounded-lg bg-white p-3 dark:bg-slate-700"
                        >
                          <img
                            src={mediaFile.preview}
                            alt={`Preview ${index + 1}`}
                            className="h-20 w-20 rounded-lg object-cover border border-slate-200 dark:border-slate-600"
                          />
                          <div className="flex-1 space-y-2">
                            <div>
                              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                                Type
                              </label>
                              <select
                                value={mediaFile.type}
                                onChange={(e) => updateMediaType(index, e.target.value as MediaType)}
                                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                              >
                                <option value="image">Image</option>
                                <option value="xray">X-Ray</option>
                                <option value="report">Report</option>
                                <option value="other">Other</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                                Notes
                              </label>
                              <input
                                type="text"
                                value={mediaFile.notes}
                                onChange={(e) => updateMediaNotes(index, e.target.value)}
                                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                                placeholder="Optional notes"
                              />
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeMediaFile(index)}
                            className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                          >
                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="sticky bottom-0 border-t border-slate-200 bg-white px-6 py-4 dark:border-slate-700 dark:bg-slate-900">
            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting || isUploading}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-slate-100 to-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:cursor-pointer hover:from-slate-200 hover:to-slate-300 disabled:cursor-not-allowed disabled:opacity-60 dark:from-slate-800/30 dark:to-slate-700/30 dark:text-slate-200 dark:hover:from-slate-700/40 dark:hover:to-slate-600/40"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || isUploading}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-green-100 to-green-200 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:cursor-pointer hover:from-green-200 hover:to-green-300 disabled:cursor-not-allowed disabled:opacity-60 dark:from-green-800/30 dark:to-green-700/30 dark:text-slate-200 dark:hover:from-green-700/40 dark:hover:to-green-600/40"
              >
                {isUploading || isSubmitting ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-700 border-t-transparent dark:border-slate-200"></span>
                    {isUploading ? 'Uploading...' : isEditMode ? 'Updating...' : 'Creating...'}
                  </>
                ) : (
                  isEditMode ? 'Update Visit' : 'Create Visit'
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

