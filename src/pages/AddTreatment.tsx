import { useMemo, useState, useEffect, type ChangeEvent, type ReactNode } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import {
  createTreatment,
  getTreatment,
  updateTreatment,
  type TreatmentPayload,
} from '@api/treatments'
import { S3Service } from '@services/s3Service'
import TreatmentCard from '@components/treatment/TreatmentCard'

type TreatmentFormState = {
  name: string
  description: string
  minDuration: string
  maxDuration: string
  avgDuration: string
  minFees: string
  maxFees: string
  avgFees: string
  followUpRequired: boolean
  followUpAfterDays: string
  steps: string[]
  currentStep: string
  aftercare: string[]
  currentAftercare: string
  risks: string[]
  currentRisk: string
  images: string[]
}

const createBlankForm = (): TreatmentFormState => ({
  name: '',
  description: '',
  minDuration: '',
  maxDuration: '',
  avgDuration: '',
  minFees: '',
  maxFees: '',
  avgFees: '',
  followUpRequired: false,
  followUpAfterDays: '',
  steps: [],
  currentStep: '',
  aftercare: [],
  currentAftercare: '',
  risks: [],
  currentRisk: '',
  images: [],
})

const SectionCard = ({ title, children }: { title: string; children: ReactNode }) => (
  <div className="flex flex-col gap-5 rounded-2xl bg-white/60 p-6 backdrop-blur-sm transition-shadow hover:shadow-md dark:bg-slate-900/60">
    <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
      {title}
    </h3>
    {children}
  </div>
)

const labelStyles = 'block text-xs font-medium text-slate-600 mb-1.5 dark:text-slate-300'
const inputStyles =
  'w-full bg-transparent border-0 border-b-2 border-slate-200 px-0 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-colors focus:border-blue-500 dark:border-slate-700 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-blue-400'
const textareaStyles =
  'w-full bg-transparent border-0 border-b-2 border-slate-200 px-0 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-colors focus:border-blue-500 resize-none dark:border-slate-700 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-blue-400'

const processEscapeSequences = (text: string): string => {
  return text
    .replace(/\\n/g, '\n')
    .replace(/\\t/g, '\t')
    .replace(/\\r/g, '\r')
    .replace(/\\\\/g, '\\')
    .replace(/\\'/g, "'")
    .replace(/\\"/g, '"')
}

export default function AddTreatment() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const isEditMode = !!id
  const [form, setForm] = useState<TreatmentFormState>(() => createBlankForm())
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(isEditMode)
  const [isUploadingImages, setIsUploadingImages] = useState(false)
  const [pendingImages, setPendingImages] = useState<File[]>([])
  const [pendingImagePreviews, setPendingImagePreviews] = useState<string[]>([])

  useEffect(() => {
    const previews = pendingImages.map((file) => URL.createObjectURL(file))
    setPendingImagePreviews(previews)

    return () => {
      previews.forEach((url) => URL.revokeObjectURL(url))
    }
  }, [pendingImages])

  useEffect(() => {
    if (isEditMode && id) {
      const fetchTreatment = async () => {
        try {
          setIsLoading(true)
          const treatment = await getTreatment(id)
          setForm({
            name: treatment.name || '',
            description: treatment.description || '',
            minDuration: treatment.minDuration?.toString() || '',
            maxDuration: treatment.maxDuration?.toString() || '',
            avgDuration: treatment.avgDuration?.toString() || '',
            minFees: treatment.minFees?.toString() || '',
            maxFees: treatment.maxFees?.toString() || '',
            avgFees: treatment.avgFees?.toString() || '',
            followUpRequired: treatment.followUpRequired || false,
            followUpAfterDays: treatment.followUpAfterDays?.toString() || '',
            steps: treatment.steps || [],
            currentStep: '',
            aftercare: treatment.aftercare || [],
            currentAftercare: '',
            risks: treatment.risks || [],
            currentRisk: '',
            images: treatment.images || [],
          })
        } catch (error: any) {
          const errorMessage =
            error?.response?.data?.error?.message ||
            error?.response?.data?.message ||
            error?.message ||
            'Unable to load treatment. Please try again.'
          toast.error(errorMessage)
          navigate('/treatments')
        } finally {
          setIsLoading(false)
        }
      }
      fetchTreatment()
    }
  }, [isEditMode, id, navigate])

  const handleFieldChange = (field: keyof TreatmentFormState, value: string | boolean) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const addStep = () => {
    if (!form.currentStep.trim()) return
    setForm((prev) => ({
      ...prev,
      steps: [...prev.steps, prev.currentStep.trim()],
      currentStep: '',
    }))
  }

  const addAftercare = () => {
    if (!form.currentAftercare.trim()) return
    setForm((prev) => ({
      ...prev,
      aftercare: [...prev.aftercare, prev.currentAftercare.trim()],
      currentAftercare: '',
    }))
  }

  const addRisk = () => {
    if (!form.currentRisk.trim()) return
    setForm((prev) => ({
      ...prev,
      risks: [...prev.risks, prev.currentRisk.trim()],
      currentRisk: '',
    }))
  }

  const removeArrayEntry = (field: 'steps' | 'aftercare' | 'risks', index: number) => {
    setForm((prev) => ({
      ...prev,
      [field]: prev[field].filter((_, entryIndex) => entryIndex !== index),
    }))
  }

  const clearField = (field: keyof TreatmentFormState) => {
    handleFieldChange(field, typeof form[field] === 'boolean' ? false : '')
  }

  const handleImageUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files?.length) return

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    const maxFileSize = 5 * 1024 * 1024
    const validFiles: File[] = []

    for (const file of Array.from(files)) {
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file')
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

    setPendingImages((prev) => [...prev, ...validFiles])
    event.target.value = ''
  }

  const removePendingImage = (index: number) => {
    setPendingImages((prev) => prev.filter((_, i) => i !== index))
  }

  const submitForm = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!form.name.trim()) {
      toast.error('Name is required.')
      return
    }

    const numericFieldNames: Array<
      'minDuration' | 'maxDuration' | 'avgDuration' | 'minFees' | 'maxFees' | 'avgFees' | 'followUpAfterDays'
    > = [
      'minDuration',
      'maxDuration',
      'avgDuration',
      'minFees',
      'maxFees',
      'avgFees',
      'followUpAfterDays',
    ]

    const numericErrors = numericFieldNames.some((field) => {
      const value = form[field]
      if (!value) return false
      return Number.isNaN(Number(value))
    })

    if (numericErrors) {
      toast.error('Numeric fields must contain valid numbers.')
      return
    }

    setIsSubmitting(true)
    setIsUploadingImages(true)

    try {
      const uploadedUrls: string[] = [...form.images]

      if (pendingImages.length > 0) {
        for (const file of pendingImages) {
          const { publicUrl } = await S3Service.uploadImage(
            'Treatment-Images',
            file
          )
          if (publicUrl) {
            uploadedUrls.push(publicUrl)
          }
        }
      }

      setIsUploadingImages(false)

      const payload: TreatmentPayload = {
        name: form.name.trim(),
        description: form.description.trim() || undefined,
        minDuration: form.minDuration ? Number(form.minDuration) : 0,
        maxDuration: form.maxDuration ? Number(form.maxDuration) : 0,
        avgDuration: form.avgDuration ? Number(form.avgDuration) : undefined,
        minFees: form.minFees ? Number(form.minFees) : 0,
        maxFees: form.maxFees ? Number(form.maxFees) : 0,
        avgFees: form.avgFees ? Number(form.avgFees) : undefined,
        steps: form.steps,
        aftercare: form.aftercare,
        followUpRequired: form.followUpRequired,
        followUpAfterDays:
          form.followUpRequired && form.followUpAfterDays
            ? Number(form.followUpAfterDays)
            : undefined,
        risks: form.risks,
        images: uploadedUrls,
      }

      if (isEditMode && id) {
        await updateTreatment(id, payload)
        toast.success('Treatment updated successfully.')
      } else {
        await createTreatment(payload)
        toast.success('Treatment created successfully.')
        setForm(createBlankForm())
        setPendingImages([])
      }
      setTimeout(() => navigate('/treatments'), 800)
    } catch (error: any) {
      setIsUploadingImages(false)
      const errorMessage =
        error?.response?.data?.error?.message ||
        error?.response?.data?.message ||
        error?.message ||
        'Unable to save treatment. Please try again.'
      toast.error(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  const summaryData = useMemo(
    () => ({
      name: form.name || 'No name set',
      description: form.description || '',
      minDuration: form.minDuration,
      maxDuration: form.maxDuration,
      avgDuration: form.avgDuration,
      minFees: form.minFees,
      maxFees: form.maxFees,
      avgFees: form.avgFees,
      followUpRequired: form.followUpRequired,
      followUpAfterDays: form.followUpAfterDays,
      steps: form.steps,
      aftercare: form.aftercare,
      risks: form.risks,
      images: form.images,
      pendingImages,
    }),
    [form, pendingImages]
  )

  if (isLoading) {
    return (
      <section className="flex items-center justify-center space-y-6">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
      </section>
    )
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 rounded-2xl bg-white/60 p-6 backdrop-blur-sm dark:bg-slate-900/60 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            {isEditMode ? 'Edit Treatment' : 'Add Treatment'}
          </h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            {isEditMode
              ? 'Update treatment template details.'
              : 'Build standardized treatment templates for your care team.'}
          </p>
        </div>
        <button
          type="submit"
          form="add-treatment-form"
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-md shadow-blue-600/20 transition-all hover:bg-blue-500 hover:shadow-lg hover:shadow-blue-600/30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-blue-500 dark:hover:bg-blue-400"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
              {isEditMode ? 'Updating...' : 'Saving...'}
            </>
          ) : (
            isEditMode ? 'Update Treatment' : 'Save Treatment'
          )}
        </button>
      </div>
      <form id="add-treatment-form" onSubmit={submitForm} className="space-y-8">
        <div className="flex flex-col gap-8 xl:flex-row">
          <div className="flex flex-1 flex-col gap-6">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 2xl:grid-cols-3">
              <SectionCard title="Core Details">
                <div className="space-y-5">
                  <div>
                    <label className={labelStyles}>Name*</label>
                    <input
                      type="text"
                      className={inputStyles}
                      value={form.name}
                      onChange={(event) => handleFieldChange('name', event.target.value)}
                      placeholder="Enter treatment name"
                      required
                    />
                  </div>
                  <div>
                    <label className={labelStyles}>Description</label>
                    <textarea
                      className={`${textareaStyles} min-h-[100px]`}
                      value={form.description}
                      onChange={(event) => handleFieldChange('description', event.target.value)}
                      placeholder="Describe the treatment..."
                    />
                  </div>
                </div>
              </SectionCard>
              <SectionCard title="Duration (months)">
                <div className="space-y-5">
                  <div>
                    <label className={labelStyles}>Minimum</label>
                    <input
                      type="number"
                      min="0"
                      step="0.1"
                      className={inputStyles}
                      value={form.minDuration}
                      onChange={(event) => handleFieldChange('minDuration', event.target.value)}
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className={labelStyles}>Maximum</label>
                    <input
                      type="number"
                      min="0"
                      step="0.1"
                      className={inputStyles}
                      value={form.maxDuration}
                      onChange={(event) => handleFieldChange('maxDuration', event.target.value)}
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className={labelStyles}>Average</label>
                    <input
                      type="number"
                      min="0"
                      step="0.1"
                      className={inputStyles}
                      value={form.avgDuration}
                      onChange={(event) => handleFieldChange('avgDuration', event.target.value)}
                      placeholder="Optional"
                    />
                  </div>
                </div>
              </SectionCard>
              <SectionCard title="Fees">
                <div className="space-y-5">
                  <div>
                    <label className={labelStyles}>Minimum</label>
                    <input
                      type="number"
                      min="0"
                      className={inputStyles}
                      value={form.minFees}
                      onChange={(event) => handleFieldChange('minFees', event.target.value)}
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className={labelStyles}>Maximum</label>
                    <input
                      type="number"
                      min="0"
                      className={inputStyles}
                      value={form.maxFees}
                      onChange={(event) => handleFieldChange('maxFees', event.target.value)}
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className={labelStyles}>Average</label>
                    <input
                      type="number"
                      min="0"
                      className={inputStyles}
                      value={form.avgFees}
                      onChange={(event) => handleFieldChange('avgFees', event.target.value)}
                      placeholder="Optional"
                    />
                  </div>
                </div>
              </SectionCard>
              <SectionCard title="Procedure Steps">
                <div className="space-y-4">
                  <div className="flex gap-3">
                    <textarea
                      className={`${textareaStyles} min-h-[80px] flex-1`}
                      placeholder="Enter a step..."
                      value={form.currentStep}
                      onChange={(event) => handleFieldChange('currentStep', event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) {
                          event.preventDefault()
                          addStep()
                        }
                      }}
                    />
                    <button
                      type="button"
                      className="mt-1 h-fit rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition-all hover:bg-blue-500 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50 dark:bg-blue-500 dark:hover:bg-blue-400"
                      onClick={addStep}
                      disabled={!form.currentStep.trim()}
                    >
                      Add
                    </button>
                  </div>
                </div>
              </SectionCard>
              <SectionCard title="Aftercare & Follow Up">
                <div className="space-y-5">
                  <div className="flex gap-3">
                    <textarea
                      className={`${textareaStyles} min-h-[80px] flex-1`}
                      placeholder="Enter aftercare instruction..."
                      value={form.currentAftercare}
                      onChange={(event) => handleFieldChange('currentAftercare', event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) {
                          event.preventDefault()
                          addAftercare()
                        }
                      }}
                    />
                    <button
                      type="button"
                      className="mt-1 h-fit rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition-all hover:bg-blue-500 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50 dark:bg-blue-500 dark:hover:bg-blue-400"
                      onClick={addAftercare}
                      disabled={!form.currentAftercare.trim()}
                    >
                      Add
                    </button>
                  </div>
                  <div className="space-y-3 pt-2">
                    <label className="flex items-center gap-3 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={form.followUpRequired}
                        onChange={(event) => handleFieldChange('followUpRequired', event.target.checked)}
                        className="h-4 w-4 rounded border-2 border-slate-300 text-blue-600 transition-colors focus:ring-2 focus:ring-blue-500 focus:ring-offset-0 group-hover:border-blue-400 dark:border-slate-600"
                      />
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                        Follow-up required
                      </span>
                    </label>
                    {form.followUpRequired && (
                      <div>
                        <label className={labelStyles}>Follow-up after days</label>
                        <input
                          type="number"
                          min="0"
                          className={inputStyles}
                          value={form.followUpAfterDays}
                          onChange={(event) =>
                            handleFieldChange('followUpAfterDays', event.target.value)
                          }
                          placeholder="Enter days"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </SectionCard>
              <SectionCard title="Risks">
                <div className="space-y-4">
                  <div className="flex gap-3">
                    <textarea
                      className={`${textareaStyles} min-h-[80px] flex-1`}
                      placeholder="Enter a risk..."
                      value={form.currentRisk}
                      onChange={(event) => handleFieldChange('currentRisk', event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) {
                          event.preventDefault()
                          addRisk()
                        }
                      }}
                    />
                    <button
                      type="button"
                      className="mt-1 h-fit rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition-all hover:bg-blue-500 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50 dark:bg-blue-500 dark:hover:bg-blue-400"
                      onClick={addRisk}
                      disabled={!form.currentRisk.trim()}
                    >
                      Add
                    </button>
                  </div>
                </div>
              </SectionCard>
              <SectionCard title="Reference Images">
                <div className="space-y-4">
                  <label
                    htmlFor="treatment-images"
                    className="flex cursor-pointer items-center justify-between rounded-lg border-2 border-dashed border-slate-300 bg-slate-50/50 px-5 py-4 text-sm font-medium text-slate-600 transition-all hover:border-blue-400 hover:bg-blue-50/50 dark:border-slate-700 dark:bg-slate-800/30 dark:text-slate-300 dark:hover:border-blue-500 dark:hover:bg-blue-900/20"
                  >
                    <span className="flex items-center gap-2">
                      <svg
                        className="h-5 w-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 4v16m8-8H4"
                        />
                      </svg>
                      Select reference images
                    </span>
                    <input
                      id="treatment-images"
                      type="file"
                      multiple
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageUpload}
                      disabled={isSubmitting}
                    />
                    {(form.images.length > 0 || pendingImages.length > 0) && (
                      <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-900/40 dark:text-blue-200">
                        {form.images.length + pendingImages.length} selected
                      </span>
                    )}
                  </label>
                  {(form.images.length > 0 || pendingImages.length > 0) && (
                    <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                      {form.images.map((image, index) => (
                        <div
                          key={image}
                          className="group relative aspect-square overflow-hidden rounded-lg bg-slate-100 dark:bg-slate-800"
                        >
                          <img
                            src={image}
                            alt={`Treatment reference ${index + 1}`}
                            className="h-full w-full object-cover"
                          />
                          <button
                            type="button"
                            className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-white/95 text-xs font-semibold text-slate-700 opacity-0 shadow-md transition-all group-hover:opacity-100 hover:bg-red-50 hover:text-red-600 dark:bg-slate-900/95 dark:text-slate-200 dark:hover:bg-red-900/30 dark:hover:text-red-400"
                            onClick={() => {
                              setForm((prev) => ({
                                ...prev,
                                images: prev.images.filter((_, i) => i !== index),
                              }))
                            }}
                          >
                            ×
                          </button>
                        </div>
                      ))}
                      {pendingImages.map((_, index) => (
                        <div
                          key={`pending-${index}`}
                          className="group relative aspect-square overflow-hidden rounded-lg bg-slate-100 dark:bg-slate-800"
                        >
                          <img
                            src={pendingImagePreviews[index]}
                            alt={`Pending upload ${index + 1}`}
                            className="h-full w-full object-cover opacity-75"
                          />
                          <div className="absolute inset-0 flex items-center justify-center bg-slate-900/40">
                            <span className="rounded-full bg-yellow-500 px-2 py-1 text-xs font-semibold text-white">
                              Pending
                            </span>
                          </div>
                          <button
                            type="button"
                            className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-white/95 text-xs font-semibold text-slate-700 opacity-0 shadow-md transition-all group-hover:opacity-100 hover:bg-red-50 hover:text-red-600 dark:bg-slate-900/95 dark:text-slate-200 dark:hover:bg-red-900/30 dark:hover:text-red-400"
                            onClick={() => removePendingImage(index)}
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </SectionCard>
            </div>
          </div>
          <aside className="xl:sticky xl:top-6 xl:h-fit xl:w-96">
            <TreatmentCard
              treatment={{
                name: summaryData.name,
                description: summaryData.description,
                minDuration: summaryData.minDuration,
                maxDuration: summaryData.maxDuration,
                avgDuration: summaryData.avgDuration,
                minFees: summaryData.minFees,
                maxFees: summaryData.maxFees,
                avgFees: summaryData.avgFees,
                followUpRequired: summaryData.followUpRequired,
                followUpAfterDays: summaryData.followUpAfterDays,
                steps: summaryData.steps,
                aftercare: summaryData.aftercare,
                risks: summaryData.risks,
                images: summaryData.images,
                pendingImages: summaryData.pendingImages,
                pendingImagePreviews,
                isUploadingImages,
              }}
              onRemoveStep={(index) => removeArrayEntry('steps', index)}
              onRemoveAftercare={(index) => removeArrayEntry('aftercare', index)}
              onRemoveRisk={(index) => removeArrayEntry('risks', index)}
              onRemoveImage={(index) => {
                setForm((prev) => ({
                  ...prev,
                  images: prev.images.filter((_, i) => i !== index),
                }))
              }}
              onRemovePendingImage={removePendingImage}
              onClearFollowUp={() => {
                clearField('followUpRequired')
                clearField('followUpAfterDays')
              }}
              processEscapeSequences={processEscapeSequences}
            />
          </aside>
        </div>
      </form>
    </section>
  )
}
