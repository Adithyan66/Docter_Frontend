import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { createPatient, getClinicNames, type PatientPayload, type ClinicName } from '@api/patients'
import { S3Service } from '@services/s3Service'

type PatientFormState = {
  firstName: string
  lastName: string
  fullName: string
  address: string
  profilePicUrl: string
  consultationType: 'one-time' | 'treatment-plan' | ''
  primaryClinic: string
  clinics: string[]
  dob: string
  lastVisitAt: string
  age: string
  visitCount: string
  gender: 'male' | 'female' | 'other' | 'unknown'
  phone: string
  email: string
  tags: string[]
  currentTag: string
  isActive: boolean
}

const createBlankForm = (): PatientFormState => {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  const hours = String(now.getHours()).padStart(2, '0')
  const minutes = String(now.getMinutes()).padStart(2, '0')
  const lastVisitAt = `${year}-${month}-${day}T${hours}:${minutes}`

  return {
    firstName: '',
    lastName: '',
    fullName: '',
    address: '',
    profilePicUrl: '',
    consultationType: 'one-time',
    primaryClinic: '',
    clinics: [],
    dob: '',
    lastVisitAt,
    age: '',
    visitCount: '0',
    gender: 'unknown',
    phone: '',
    email: '',
    tags: [],
    currentTag: '',
    isActive: true,
  }
}

export function useAddPatient() {
  const navigate = useNavigate()
  const [form, setForm] = useState<PatientFormState>(() => createBlankForm())
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isUploadingImage, setIsUploadingImage] = useState(false)
  const [pendingImage, setPendingImage] = useState<File | null>(null)
  const [pendingImagePreview, setPendingImagePreview] = useState<string | null>(null)
  const [showCamera, setShowCamera] = useState(false)
  const [availableClinics, setAvailableClinics] = useState<ClinicName[]>([])

  useEffect(() => {
    const fetchClinics = async () => {
      try {
        const clinics = await getClinicNames()
        setAvailableClinics(clinics)
      } catch (error) {
        console.error('Failed to fetch clinics:', error)
        toast.error('Failed to load clinics')
      }
    }
    fetchClinics()
  }, [])

  useEffect(() => {
    if (pendingImage) {
      const preview = URL.createObjectURL(pendingImage)
      setPendingImagePreview(preview)
      return () => URL.revokeObjectURL(preview)
    } else {
      setPendingImagePreview(null)
    }
  }, [pendingImage])

  const validateEmail = (email: string): boolean => {
    if (!email.trim()) return true
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const validatePhone = (phone: string): boolean => {
    if (!phone.trim()) return true
    const phoneRegex = /^\+?[0-9]{7,15}$/
    return phoneRegex.test(phone.replace(/\s/g, ''))
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

  const calculateAge = (dob: string): string => {
    if (!dob) return ''
    const birthDate = new Date(dob)
    const today = new Date()
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    return age >= 0 ? String(age) : ''
  }

  const handleFieldChange = (field: keyof PatientFormState, value: any) => {
    if (field === 'phone') {
      const numericValue = value.replace(/\D/g, '')
      setForm((prev) => ({ ...prev, [field]: numericValue }))
      return
    }
    if (field === 'age' || field === 'visitCount') {
      const numericValue = value.replace(/\D/g, '')
      setForm((prev) => ({ ...prev, [field]: numericValue }))
      return
    }
    if (field === 'dob') {
      const calculatedAge = value ? calculateAge(value) : ''
      setForm((prev) => ({ ...prev, dob: value, age: calculatedAge }))
      return
    }
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleImageUpload = (file: File | null) => {
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file')
      return
    }

    const maxFileSize = 5 * 1024 * 1024
    if (file.size > maxFileSize) {
      toast.error('File size must be less than 5MB')
      return
    }

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      toast.error('Only JPEG, PNG, and WebP images are allowed')
      return
    }

    setPendingImage(file)
  }

  const handleCameraCapture = (file: File) => {
    setPendingImage(file)
  }

  const removePendingImage = () => {
    setPendingImage(null)
    setPendingImagePreview(null)
  }

  const addTag = () => {
    if (!form.currentTag.trim()) return
    const trimmedTag = form.currentTag.trim()
    if (form.tags.includes(trimmedTag)) {
      toast.error('Tag already exists')
      return
    }
    setForm((prev) => ({
      ...prev,
      tags: [...prev.tags, trimmedTag],
      currentTag: '',
    }))
  }

  const removeTag = (index: number) => {
    setForm((prev) => ({
      ...prev,
      tags: prev.tags.filter((_, i) => i !== index),
    }))
  }

  const toggleClinic = (clinicId: string) => {
    setForm((prev) => ({
      ...prev,
      clinics: prev.clinics.includes(clinicId)
        ? prev.clinics.filter((id) => id !== clinicId)
        : [...prev.clinics, clinicId],
    }))
  }

  const submitForm = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!form.firstName.trim()) {
      toast.error('First name is required.')
      return
    }

    if (!form.consultationType) {
      toast.error('Consultation type is required.')
      return
    }

    if (form.email.trim() && !validateEmail(form.email)) {
      toast.error('Please enter a valid email address.')
      return
    }

    if (form.phone.trim() && !validatePhone(form.phone)) {
      toast.error('Please enter a valid phone number (7-15 digits, optional + prefix).')
      return
    }

    if (form.profilePicUrl.trim() && !validateUrl(form.profilePicUrl)) {
      toast.error('Please enter a valid profile picture URL.')
      return
    }

    setIsSubmitting(true)
    setIsUploadingImage(true)

    try {
      let profilePicUrl = form.profilePicUrl.trim()

      if (pendingImage) {
        const { publicUrl } = await S3Service.uploadImage('Patient-profile', pendingImage)
        if (publicUrl && publicUrl.trim().length > 0) {
          profilePicUrl = publicUrl
        }
      }

      setIsUploadingImage(false)

      const payload: PatientPayload = {
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim() || undefined,
        fullName: form.fullName.trim() || undefined,
        address: form.address.trim() || undefined,
        profilePicUrl: profilePicUrl || undefined,
        consultationType: form.consultationType as 'one-time' | 'treatment-plan',
        primaryClinic: form.primaryClinic.trim() || undefined,
        clinics: form.clinics.length > 0 ? form.clinics : undefined,
        dob: form.dob ? new Date(form.dob).toISOString() : undefined,
        lastVisitAt: form.lastVisitAt ? new Date(form.lastVisitAt).toISOString() : undefined,
        age: form.age ? Number(form.age) : undefined,
        visitCount: form.visitCount ? Number(form.visitCount) : undefined,
        gender: form.gender !== 'unknown' ? form.gender : undefined,
        phone: form.phone.trim() || undefined,
        email: form.email.trim().toLowerCase() || undefined,
        tags: form.tags.length > 0 ? form.tags : undefined,
        isActive: form.isActive,
      }

      const patient = await createPatient(payload)
      toast.success('Patient created successfully.')
      setTimeout(() => navigate(`/patients/${patient.id}`), 800)
    } catch (error: any) {
      setIsUploadingImage(false)
      const errorMessage =
        error?.response?.data?.error?.message ||
        error?.response?.data?.message ||
        error?.message ||
        'Unable to create patient. Please try again.'

      if (error?.response?.status === 409) {
        toast.error('Patient ID already exists.')
      } else {
        toast.error(errorMessage)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return {
    form,
    isSubmitting,
    isUploadingImage,
    pendingImagePreview,
    showCamera,
    availableClinics,
    validateEmail,
    validatePhone,
    validateUrl,
    handleFieldChange,
    handleImageUpload,
    handleCameraCapture,
    removePendingImage,
    addTag,
    removeTag,
    toggleClinic,
    submitForm,
    setShowCamera,
  }
}

