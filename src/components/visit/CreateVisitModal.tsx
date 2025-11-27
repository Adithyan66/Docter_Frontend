import { useState, useEffect, type ChangeEvent } from 'react'
import toast from 'react-hot-toast'
import { createVisit, type CreateVisitRequestDto, type PrescriptionItemDto, type CreateVisitMediaDto, type MediaType } from '@api/visits'
import { S3Service } from '@services/s3Service'
import { getClinicNames, type ClinicName } from '@api/clinics'

type CreateVisitModalProps = {
  isOpen: boolean
  onClose: () => void
  patientId: string
  courseId: string
  doctorId: string
  clinicId?: string
  onSuccess?: () => void
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
  file: File
  preview: string
  type: MediaType
  notes: string
}

export default function CreateVisitModal({
  isOpen,
  onClose,
  patientId,
  courseId,
  doctorId,
  clinicId: initialClinicId,
  onSuccess,
}: CreateVisitModalProps) {
  const [clinics, setClinics] = useState<ClinicName[]>([])
  const [isLoadingClinics, setIsLoadingClinics] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isUploading, setIsUploading] = useState(false)

  const [formData, setFormData] = useState({
    clinicId: initialClinicId || '',
    visitDate: new Date().toISOString().split('T')[0],
    notes: '',
    billedAmount: '',
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

  useEffect(() => {
    if (isOpen) {
      fetchClinics()
      resetForm()
    }
  }, [isOpen, initialClinicId])

  useEffect(() => {
    if (initialClinicId) {
      setFormData((prev) => ({ ...prev, clinicId: initialClinicId }))
    }
  }, [initialClinicId])

  const resetForm = () => {
    setFormData({
      clinicId: initialClinicId || '',
      visitDate: new Date().toISOString().split('T')[0],
      notes: '',
      billedAmount: '',
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
      URL.revokeObjectURL(removed.preview)
      return prev.filter((_, i) => i !== index)
    })
  }

  const updateMediaType = (index: number, type: MediaType) => {
    setMediaFiles((prev) => prev.map((item, i) => (i === index ? { ...item, type } : item)))
  }

  const updateMediaNotes = (index: number, notes: string) => {
    setMediaFiles((prev) => prev.map((item, i) => (i === index ? { ...item, notes } : item)))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.visitDate) {
      toast.error('Please select a visit date')
      return
    }

    setIsSubmitting(true)
    setIsUploading(true)

    try {
      const mediaUploads: CreateVisitMediaDto[] = []

      for (const mediaFile of mediaFiles) {
        try {
          const { publicUrl, imageKey } = await S3Service.uploadImage(
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

      const prescriptionPayload =
        prescriptionItems.length > 0 || diagnosisItems.length > 0
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

      const payload: CreateVisitRequestDto = {
        patientId,
        courseId,
        clinicId: formData.clinicId || undefined,
        visitDate: new Date(formData.visitDate).toISOString(),
        notes: formData.notes.trim() || undefined,
        billedAmount: formData.billedAmount ? Number(formData.billedAmount) : undefined,
        prescription: prescriptionPayload,
        media: mediaUploads.length > 0 ? mediaUploads : undefined,
      }

      await createVisit(payload)
      toast.success('Visit created successfully')
      onSuccess?.()
      onClose()
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.error?.message ||
        error?.response?.data?.message ||
        error?.message ||
        'Unable to create visit. Please try again.'
      toast.error(errorMessage)
    } finally {
      setIsUploading(false)
      setIsSubmitting(false)
    }
  }

  useEffect(() => {
    return () => {
      mediaFiles.forEach((item) => URL.revokeObjectURL(item.preview))
    }
  }, [mediaFiles])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-xl dark:bg-slate-900">
        <div className="sticky top-0 border-b border-slate-200 bg-white px-6 py-4 dark:border-slate-700 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Create New Visit</h2>
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

        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Visit Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
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
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.billedAmount}
                  onChange={(e) => setFormData((prev) => ({ ...prev, billedAmount: e.target.value }))}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                  placeholder="0.00"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Notes <span className="text-slate-400">(Optional)</span>
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
                rows={3}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 resize-none"
                placeholder="Enter visit notes..."
              />
            </div>

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

          <div className="mt-6 flex items-center justify-end gap-3 border-t border-slate-200 pt-6 dark:border-slate-700">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || isUploading}
              className="rounded-lg bg-blue-600 px-6 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-blue-500 dark:hover:bg-blue-400"
            >
              {isUploading ? 'Uploading...' : isSubmitting ? 'Creating...' : 'Create Visit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

