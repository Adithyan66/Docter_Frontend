import { useMemo, useState, type ChangeEvent, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  createTreatment,
  requestTreatmentImageUpload,
  type TreatmentPayload,
} from '@api/treatments'

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

export default function AddTreatment() {
  const navigate = useNavigate()
  const [form, setForm] = useState<TreatmentFormState>(() => createBlankForm())
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isUploadingImages, setIsUploadingImages] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

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

  const handleImageUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files?.length) return

    setIsUploadingImages(true)
    setErrorMessage('')

    try {
      const uploadedUrls: string[] = []
      for (const file of Array.from(files)) {
        const { uploadUrl, publicUrl } = await requestTreatmentImageUpload()
        await fetch(uploadUrl, {
          method: 'PUT',
          body: file,
          headers: {
            'Content-Type': file.type || 'application/octet-stream',
          },
        })
        uploadedUrls.push(publicUrl)
      }

      setForm((prev) => ({
        ...prev,
        images: [...prev.images, ...uploadedUrls],
      }))
    } catch (error) {
      setErrorMessage('Image upload failed. Please try again.')
    } finally {
      setIsUploadingImages(false)
      event.target.value = ''
    }
  }

  const submitForm = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setErrorMessage('')
    setSuccessMessage('')

    const requiredFields: Array<keyof TreatmentFormState> = [
      'name',
      'minDuration',
      'maxDuration',
      'minFees',
      'maxFees',
    ]

    const missing = requiredFields.filter((field) => !`${form[field]}`.trim())
    if (missing.length) {
      setErrorMessage('Please fill all required fields.')
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
      setErrorMessage('Numeric fields must contain valid numbers.')
      return
    }

    const payload: TreatmentPayload = {
      name: form.name.trim(),
      description: form.description.trim() || undefined,
      minDuration: Number(form.minDuration),
      maxDuration: Number(form.maxDuration),
      avgDuration: form.avgDuration ? Number(form.avgDuration) : undefined,
      minFees: Number(form.minFees),
      maxFees: Number(form.maxFees),
      avgFees: form.avgFees ? Number(form.avgFees) : undefined,
      materialsUsed: [],
      steps: form.steps,
      aftercare: form.aftercare,
      followUpRequired: form.followUpRequired,
      followUpAfterDays:
        form.followUpRequired && form.followUpAfterDays
          ? Number(form.followUpAfterDays)
          : undefined,
      risks: form.risks,
      images: form.images,
    }

    setIsSubmitting(true)
    try {
      await createTreatment(payload)
      setSuccessMessage('Treatment created successfully.')
      setForm(createBlankForm())
      setTimeout(() => navigate('/treatments'), 800)
    } catch (error) {
      setErrorMessage('Unable to save treatment. Please try again.')
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
    }),
    [form]
  )

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 rounded-2xl bg-white/60 p-6 backdrop-blur-sm dark:bg-slate-900/60 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Add Treatment</h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Build standardized treatment templates for your care team.
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
              Saving...
            </>
          ) : (
            'Save Treatment'
          )}
        </button>
      </div>
      {(errorMessage || successMessage) && (
        <div
          className={`rounded-lg border-l-4 px-4 py-3 text-sm ${errorMessage ? 'border-red-500 bg-red-50/80 text-red-700 dark:border-red-400 dark:bg-red-900/20 dark:text-red-300' : 'border-green-500 bg-green-50/80 text-green-700 dark:border-green-400 dark:bg-green-900/20 dark:text-green-300'}`}
        >
          {errorMessage || successMessage}
        </div>
      )}
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
                    <label className={labelStyles}>Minimum*</label>
                    <input
                      type="number"
                      min="0"
                      step="0.1"
                      className={inputStyles}
                      value={form.minDuration}
                      onChange={(event) => handleFieldChange('minDuration', event.target.value)}
                      placeholder="0"
                      required
                    />
                  </div>
                  <div>
                    <label className={labelStyles}>Maximum*</label>
                    <input
                      type="number"
                      min="0"
                      step="0.1"
                      className={inputStyles}
                      value={form.maxDuration}
                      onChange={(event) => handleFieldChange('maxDuration', event.target.value)}
                      placeholder="0"
                      required
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
                    <label className={labelStyles}>Minimum*</label>
                    <input
                      type="number"
                      min="0"
                      className={inputStyles}
                      value={form.minFees}
                      onChange={(event) => handleFieldChange('minFees', event.target.value)}
                      placeholder="0"
                      required
                    />
                  </div>
                  <div>
                    <label className={labelStyles}>Maximum*</label>
                    <input
                      type="number"
                      min="0"
                      className={inputStyles}
                      value={form.maxFees}
                      onChange={(event) => handleFieldChange('maxFees', event.target.value)}
                      placeholder="0"
                      required
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
                      {isUploadingImages ? (
                        <>
                          <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-400 border-t-transparent"></span>
                          Uploading...
                        </>
                      ) : (
                        <>
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
                          Upload reference images
                        </>
                      )}
                    </span>
                    <input
                      id="treatment-images"
                      type="file"
                      multiple
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageUpload}
                      disabled={isUploadingImages}
                    />
                    {form.images.length > 0 && (
                      <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-900/40 dark:text-blue-200">
                        {form.images.length} added
                      </span>
                    )}
                  </label>
                  {!!form.images.length && (
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
                    </div>
                  )}
                </div>
              </SectionCard>
            </div>
          </div>
          <aside className="xl:sticky xl:top-6 xl:h-fit xl:w-96">
            <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-5 dark:border-slate-800 dark:bg-slate-900/50">
              <div className="space-y-5">
                <div className="text-center">
                  <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                    {summaryData.name}
                  </h2>
                  {summaryData.description && (
                    <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                      {summaryData.description}
                    </p>
                  )}
                </div>
                <div className="text-sm text-slate-700 dark:text-slate-200">
                  {summaryData.minDuration || summaryData.maxDuration || summaryData.avgDuration
                    ? `Min: ${summaryData.minDuration || '-'} months / Max: ${summaryData.maxDuration || '-'} months / Avg: ${summaryData.avgDuration || '-'} months`
                    : 'No duration set'}
                </div>
                <div className="text-sm text-slate-700 dark:text-slate-200">
                  {summaryData.minFees || summaryData.maxFees || summaryData.avgFees
                    ? `Min: ${summaryData.minFees || '-'} / Max: ${summaryData.maxFees || '-'} / Avg: ${summaryData.avgFees || '-'}`
                    : 'No fees set'}
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                    Follow up
                  </span>
                  <div className="flex-1 space-y-1">
                    {summaryData.followUpRequired ? (
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm text-slate-700 dark:text-slate-200">
                          {summaryData.followUpAfterDays
                            ? `Yes - ${summaryData.followUpAfterDays} days`
                            : 'Yes'}
                        </span>
                        <button
                          type="button"
                          className="text-slate-500 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400"
                          onClick={() => {
                            clearField('followUpRequired')
                            clearField('followUpAfterDays')
                          }}
                        >
                          ×
                        </button>
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
                    {summaryData.steps.length > 0 ? (
                      summaryData.steps.map((step, index) => (
                        <div
                          key={`summary-step-${index}`}
                          className="flex items-start justify-between gap-2"
                        >
                          <span className="flex-1 text-sm text-slate-700 dark:text-slate-200">
                            {index + 1}. {step}
                          </span>
                          <button
                            type="button"
                            className="text-slate-500 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400"
                            onClick={() => removeArrayEntry('steps', index)}
                          >
                            ×
                          </button>
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
                    {summaryData.aftercare.length > 0 ? (
                      summaryData.aftercare.map((entry, index) => (
                        <div
                          key={`summary-aftercare-${index}`}
                          className="flex items-start justify-between gap-2"
                        >
                          <span className="flex-1 text-sm text-slate-700 dark:text-slate-200">
                            {entry}
                          </span>
                          <button
                            type="button"
                            className="text-slate-500 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400"
                            onClick={() => removeArrayEntry('aftercare', index)}
                          >
                            ×
                          </button>
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
                    {summaryData.risks.length > 0 ? (
                      summaryData.risks.map((entry, index) => (
                        <div
                          key={`summary-risk-${index}`}
                          className="flex items-start justify-between gap-2"
                        >
                          <span className="flex-1 text-sm text-slate-700 dark:text-slate-200">
                            {entry}
                          </span>
                          <button
                            type="button"
                            className="text-slate-500 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400"
                            onClick={() => removeArrayEntry('risks', index)}
                          >
                            ×
                          </button>
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
                    {summaryData.images.length > 0 ? (
                      <div className="grid grid-cols-3 gap-2">
                        {summaryData.images.map((image, index) => (
                          <div
                            key={`summary-image-${image}`}
                            className="group relative aspect-square overflow-hidden rounded-lg border border-slate-200 dark:border-slate-700"
                          >
                            <img src={image} alt="" className="h-full w-full object-cover" />
                            <button
                              type="button"
                              className="absolute right-1 top-1 rounded-full bg-white/90 px-1.5 py-0.5 text-xs font-semibold text-slate-700 opacity-0 transition group-hover:opacity-100 dark:bg-slate-900/80 dark:text-slate-200"
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
                      </div>
                    ) : (
                      <span className="text-sm text-slate-500 dark:text-slate-400">None</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </form>
    </section>
  )
}
