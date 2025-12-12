import { useMemo, useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import {
  createTreatment,
  getTreatment,
  updateTreatment,
  type TreatmentPayload,
} from '@api/treatments'

type TreatmentFormState = {
  name: string
  description: string
  isOneTime: boolean
  minDuration: string
  maxDuration: string
  avgDuration: string
  regularVisitInterval: {
    interval: string
    unit: string
  }
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
  isOneTime: false,
  minDuration: '',
  maxDuration: '',
  avgDuration: '',
  regularVisitInterval: {
    interval: '',
    unit: '',
  },
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

export function useAddTreatment() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const isEditMode = !!id
  const [form, setForm] = useState<TreatmentFormState>(() => createBlankForm())
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(isEditMode)
  const [pendingImages, setPendingImages] = useState<File[]>([])
  const [_pendingImagePreviews, setPendingImagePreviews] = useState<string[]>([])

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
            isOneTime: treatment.isOneTime || false,
            minDuration: treatment.minDuration?.toString() || '',
            maxDuration: treatment.maxDuration?.toString() || '',
            avgDuration: treatment.avgDuration?.toString() || '',
            regularVisitInterval: {
              interval: treatment.regularVisitInterval?.interval?.toString() || '',
              unit: treatment.regularVisitInterval?.unit || '',
            },
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

  const handleRegularVisitIntervalChange = (field: 'interval' | 'unit', value: string) => {
    setForm((prev) => ({
      ...prev,
      regularVisitInterval: {
        ...prev.regularVisitInterval,
        [field]: value,
      },
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

  // const handleImageUpload = (event: ChangeEvent<HTMLInputElement>) => {
  //   const files = event.target.files
  //   if (!files?.length) return

  //   const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
  //   const maxFileSize = 5 * 1024 * 1024
  //   const validFiles: File[] = []

  //   for (const file of Array.from(files)) {
  //     if (!file.type.startsWith('image/')) {
  //       toast.error('Please select an image file')
  //       event.target.value = ''
  //       return
  //     }

  //     if (file.size > maxFileSize) {
  //       toast.error('File size must be less than 5MB')
  //       event.target.value = ''
  //       return
  //     }

  //     if (!allowedTypes.includes(file.type)) {
  //       toast.error('Only JPEG, PNG, and WebP images are allowed')
  //       event.target.value = ''
  //       return
  //     }

  //     validFiles.push(file)
  //   }

  //   setPendingImages((prev) => [...prev, ...validFiles])
  //   event.target.value = ''
  // }

  // const removePendingImage = (index: number) => {
  //   setPendingImages((prev) => prev.filter((_, i) => i !== index))
  // }

  const validateForm = (): boolean => {
    if (!form.name.trim()) {
      toast.error('Name is required.')
      return false
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
      return false
    }

    if (!form.isOneTime && form.regularVisitInterval.interval && Number.isNaN(Number(form.regularVisitInterval.interval))) {
      toast.error('Regular visit interval must be a valid number.')
      return false
    }

    return true
  }

  const performSubmit = async () => {
    setIsSubmitting(true)

    try {
      const payload: TreatmentPayload = {
        name: form.name.trim(),
        description: form.description.trim() || undefined,
        isOneTime: form.isOneTime,
        minDuration: form.isOneTime ? undefined : (form.minDuration ? Number(form.minDuration) : 0),
        maxDuration: form.isOneTime ? undefined : (form.maxDuration ? Number(form.maxDuration) : 0),
        avgDuration: form.isOneTime ? undefined : (form.avgDuration ? Number(form.avgDuration) : undefined),
        regularVisitInterval: form.isOneTime ? undefined : (form.regularVisitInterval.interval && form.regularVisitInterval.unit
          ? {
              interval: Number(form.regularVisitInterval.interval),
              unit: form.regularVisitInterval.unit,
            }
          : undefined),
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
        images: [],
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

  const submitForm = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!validateForm()) {
      return
    }
    await performSubmit()
  }

  const summaryData = useMemo(
    () => ({
      name: form.name || 'No name set',
      description: form.description || '',
      isOneTime: form.isOneTime,
      minDuration: form.minDuration,
      maxDuration: form.maxDuration,
      avgDuration: form.avgDuration,
      regularVisitInterval: form.regularVisitInterval,
      minFees: form.minFees,
      maxFees: form.maxFees,
      avgFees: form.avgFees,
      followUpRequired: form.followUpRequired,
      followUpAfterDays: form.followUpAfterDays,
      steps: form.steps,
      aftercare: form.aftercare,
      risks: form.risks,
      images: isEditMode ? form.images : undefined,
    }),
    [form, isEditMode]
  )

  return {
    form,
    isSubmitting,
    isLoading,
    isEditMode,
    summaryData,
    handleFieldChange,
    handleRegularVisitIntervalChange,
    addStep,
    addAftercare,
    addRisk,
    removeArrayEntry,
    clearField,
    submitForm,
    performSubmit,
    validateForm,
    setForm,
  }
}

