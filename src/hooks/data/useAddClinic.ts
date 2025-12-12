import { useMemo, useState, useEffect, type ChangeEvent } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import {
  createClinic,
  getClinic,
  updateClinic,
  type ClinicPayload,
} from '@api/clinics'
import { getTreatmentNames, type TreatmentName } from '@api/treatments'
import { S3Service } from '@services/s3Service'
import { useDebounce } from '@hooks/utils/useDebounce'

export type WorkingDayForm = {
  day: string
  startTime: string
  endTime: string
}

export type ClinicFormState = {
  name: string
  clinicId: string
  address: string
  city: string
  state: string
  pincode: string
  phone: string
  email: string
  website: string
  locationUrl: string
  workingDays: WorkingDayForm[]
  currentWorkingDay: WorkingDayForm
  treatments: string[]
  images: string[]
  notes: string
  isActive: boolean
}

const createBlankForm = (): ClinicFormState => ({
  name: '',
  clinicId: '',
  address: '',
  city: '',
  state: '',
  pincode: '',
  phone: '',
  email: '',
  website: '',
  locationUrl: '',
  workingDays: [],
  currentWorkingDay: {
    day: '',
    startTime: '09:00',
    endTime: '18:00',
  },
  treatments: [],
  images: [],
  notes: '',
  isActive: true,
})

export const daysOfWeek = [
  { value: 'Monday', label: 'Monday' },
  { value: 'Tuesday', label: 'Tuesday' },
  { value: 'Wednesday', label: 'Wednesday' },
  { value: 'Thursday', label: 'Thursday' },
  { value: 'Friday', label: 'Friday' },
  { value: 'Saturday', label: 'Saturday' },
  { value: 'Sunday', label: 'Sunday' },
]

export function useAddClinic() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const isEditMode = !!id
  const [form, setForm] = useState<ClinicFormState>(() => createBlankForm())
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(isEditMode)
  const [isUploadingImages, setIsUploadingImages] = useState(false)
  const [pendingImages, setPendingImages] = useState<File[]>([])
  const [pendingImagePreviews, setPendingImagePreviews] = useState<string[]>([])
  const [availableTreatments, setAvailableTreatments] = useState<TreatmentName[]>([])
  const [treatmentSearch, setTreatmentSearch] = useState('')
  const debouncedTreatmentSearch = useDebounce(treatmentSearch, 500)

  useEffect(() => {
    const previews = pendingImages.map((file) => URL.createObjectURL(file))
    setPendingImagePreviews(previews)

    return () => {
      previews.forEach((url) => URL.revokeObjectURL(url))
    }
  }, [pendingImages])

  useEffect(() => {
    const fetchTreatments = async () => {
      try {
        const params: { search?: string } = {}
        if (debouncedTreatmentSearch.trim()) {
          params.search = debouncedTreatmentSearch.trim()
        }
        const treatments = await getTreatmentNames(params)
        setAvailableTreatments(treatments)
      } catch (error) {
        console.error('Failed to fetch treatments:', error)
      }
    }
    fetchTreatments()
  }, [debouncedTreatmentSearch])

  useEffect(() => {
    if (isEditMode && id) {
      const fetchClinic = async () => {
        try {
          setIsLoading(true)
          const clinic = await getClinic(id)
          const treatmentIds =
            clinic.treatments?.map((t) => (typeof t === 'string' ? t : t.id)) || []

          setForm({
            name: clinic.name || '',
            clinicId: clinic.clinicId || '',
            address: clinic.address || '',
            city: clinic.city || '',
            state: clinic.state || '',
            pincode: clinic.pincode || '',
            phone: clinic.phone || '',
            email: clinic.email || '',
            website: clinic.website || '',
            locationUrl: clinic.locationUrl || '',
            workingDays:
              clinic.workingDays?.map((wd) => ({
                day: wd.day || '',
                startTime: wd.startTime || '',
                endTime: wd.endTime || '',
              })) || [],
            currentWorkingDay: {
              day: '',
              startTime: '09:00',
              endTime: '18:00',
            },
            treatments: treatmentIds,
            images: clinic.images || [],
            notes: clinic.notes || '',
            isActive: clinic.isActive ?? true,
          })
        } catch (error: any) {
          const errorMessage =
            error?.response?.data?.error?.message ||
            error?.response?.data?.message ||
            error?.message ||
            'Unable to fetch clinic. Please try again.'
          toast.error(errorMessage)
          navigate('/clinics')
        } finally {
          setIsLoading(false)
        }
      }
      fetchClinic()
    }
  }, [isEditMode, id, navigate])

  const validateEmail = (email: string): boolean => {
    if (!email.trim()) return true
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const validateUrl = (url: string): boolean => {
    if (!url.trim()) return true
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }

  const validateClinicId = (clinicId: string): boolean => {
    if (!clinicId.trim()) return false
    return /^[A-Z]{3}$/.test(clinicId)
  }

  const handleFieldChange = (field: keyof ClinicFormState, value: any) => {
    if (field === 'phone') {
      const numericValue = value.replace(/\D/g, '')
      setForm((prev) => ({ ...prev, [field]: numericValue }))
      return
    }
    if (field === 'clinicId') {
      const uppercaseValue = value.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 3)
      setForm((prev) => ({ ...prev, [field]: uppercaseValue }))
      return
    }
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleWorkingDayFieldChange = (field: keyof WorkingDayForm, value: string) => {
    setForm((prev) => {
      const updatedWorkingDay = { ...prev.currentWorkingDay, [field]: value }
      if (field === 'day' && value && !prev.currentWorkingDay.startTime && !prev.currentWorkingDay.endTime) {
        updatedWorkingDay.startTime = '09:00'
        updatedWorkingDay.endTime = '18:00'
      }
      return {
        ...prev,
        currentWorkingDay: updatedWorkingDay,
      }
    })
  }

  const addWorkingDay = () => {
    if (!form.currentWorkingDay.day) {
      toast.error('Please select a day.')
      return
    }
    const dayExists = form.workingDays.some(
      (wd) => wd.day === form.currentWorkingDay.day
    )
    if (dayExists) {
      toast.error('This day has already been added.')
      return
    }
    setForm((prev) => ({
      ...prev,
      workingDays: [...prev.workingDays, prev.currentWorkingDay],
      currentWorkingDay: {
        day: '',
        startTime: '09:00',
        endTime: '18:00',
      },
    }))
  }

  const removeWorkingDay = (index: number) => {
    setForm((prev) => ({
      ...prev,
      workingDays: prev.workingDays.filter((_, i) => i !== index),
    }))
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

  const removeImage = (index: number) => {
    setForm((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }))
  }

  const validateForm = (): boolean => {
    if (!form.name.trim()) {
      toast.error('Name is required.')
      return false
    }

    if (!isEditMode && !form.clinicId.trim()) {
      toast.error('Clinic ID is required.')
      return false
    }

    if (!isEditMode && !validateClinicId(form.clinicId)) {
      toast.error('Clinic ID must be exactly 3 uppercase letters (e.g., ABC).')
      return false
    }

    if (form.email.trim() && !validateEmail(form.email)) {
      toast.error('Please enter a valid email address.')
      return false
    }

    if (form.website.trim() && !validateUrl(form.website)) {
      toast.error('Please enter a valid website URL.')
      return false
    }

    if (form.locationUrl.trim() && !validateUrl(form.locationUrl)) {
      toast.error('Please enter a valid location URL.')
      return false
    }

    return true
  }

  const performSubmit = async () => {
    setIsSubmitting(true)

    try {
      const payload: ClinicPayload = {
        name: form.name.trim(),
        address: form.address.trim() || undefined,
        city: form.city.trim() || undefined,
        state: form.state.trim() || undefined,
        pincode: form.pincode.trim() || undefined,
        phone: form.phone.trim() || undefined,
        email: form.email.trim() || undefined,
        website: form.website.trim() || undefined,
        locationUrl: form.locationUrl.trim() || undefined,
        workingDays:
          form.workingDays.length > 0
            ? form.workingDays.map((wd) => ({
                day: wd.day,
                startTime: wd.startTime.trim() || undefined,
                endTime: wd.endTime.trim() || undefined,
              }))
            : undefined,
        treatments: form.treatments.length > 0 ? form.treatments : undefined,
        notes: form.notes.trim() || undefined,
        isActive: form.isActive,
      }

      if (isEditMode && id) {
        await updateClinic(id, payload)
        toast.success('Clinic updated successfully.')
      } else {
        payload.clinicId = form.clinicId.trim().toUpperCase()
        await createClinic(payload)
        toast.success('Clinic created successfully.')
        setForm(createBlankForm())
        setPendingImages([])
      }
      setTimeout(() => navigate('/clinics'), 800)
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.error?.message ||
        error?.response?.data?.message ||
        error?.message ||
        'Unable to save clinic. Please try again.'
      toast.error(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  const submitForm = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (validateForm()) {
      await performSubmit()
    }
  }

  const summaryData = useMemo(
    () => {
      const treatmentMap = new Map(availableTreatments.map((t) => [t.id, t.name]))
      const treatmentsWithNames = form.treatments
        .map((id) => {
          const name = treatmentMap.get(id)
          return name ? { id, name } : null
        })
        .filter((t): t is { id: string; name: string } => t !== null)

      return {
        name: form.name,
        clinicId: form.clinicId,
        address: form.address,
        city: form.city,
        state: form.state,
        pincode: form.pincode,
        phone: form.phone,
        email: form.email,
        website: form.website,
        locationUrl: form.locationUrl,
        workingDays: form.workingDays.map((wd) => ({
          day: wd.day,
          startTime: wd.startTime,
          endTime: wd.endTime,
        })),
        treatments: treatmentsWithNames,
        images: isEditMode ? form.images : undefined,
        notes: form.notes,
        isActive: form.isActive,
      }
    },
    [form, availableTreatments]
  )

  const toggleTreatment = (treatmentId: string) => {
    setForm((prev) => ({
      ...prev,
      treatments: prev.treatments.includes(treatmentId)
        ? prev.treatments.filter((id) => id !== treatmentId)
        : [...prev.treatments, treatmentId],
    }))
  }

  const clearField = (field: keyof ClinicFormState) => {
    setForm((prev) => ({ ...prev, [field]: field === 'isActive' ? true : '' }))
  }

  return {
    form,
    isSubmitting,
    isLoading,
    isUploadingImages,
    pendingImages,
    pendingImagePreviews,
    isEditMode,
    summaryData,
    availableTreatments,
    treatmentSearch,
    setTreatmentSearch,
    handleFieldChange,
    handleWorkingDayFieldChange,
    addWorkingDay,
    removeWorkingDay,
    handleImageUpload,
    removePendingImage,
    removeImage,
    submitForm,
    performSubmit,
    validateForm,
    toggleTreatment,
    clearField,
    setForm,
    validateEmail,
    validateUrl,
    validateClinicId,
  }
}

