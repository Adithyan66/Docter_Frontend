import { useState, useEffect, useRef, useMemo, type ChangeEvent } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { createPatient, updatePatient, getPatientById, getClinicNames, type PatientPayload, type ClinicName } from '@api/patients'
import { CloudStorageService } from '@services/cloudStorageService'
import { useAppSelector } from '@hooks/store'

type PatientFormState = {
  firstName: string
  lastName: string
  fullName: string
  address: string
  profilePicUrl: string | null
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
  const authUser = useAppSelector((state) => state.auth.user) as
    | {
        id: string
        email: string
        role?: 'doctor' | 'staff'
        clinicId?: string
        clinicName?: string
        clinics?: Array<string | { id?: string; name?: string; clinicId?: string; clinicName?: string }>
      }
    | null
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const isEditMode = !!id
  const isStaff = authUser?.role === 'staff'
  const [form, setForm] = useState<PatientFormState>(() => createBlankForm())
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(isEditMode)
  const [isUploadingImage, setIsUploadingImage] = useState(false)
  const [pendingImage, setPendingImage] = useState<File | null>(null)
  const [pendingImagePreview, setPendingImagePreview] = useState<string | null>(null)
  const [showCamera, setShowCamera] = useState(false)
  const [availableClinics, setAvailableClinics] = useState<ClinicName[]>([])
  const [genderDropdownOpen, setGenderDropdownOpen] = useState(false)
  const [primaryClinicDropdownOpen, setPrimaryClinicDropdownOpen] = useState(false)
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const genderButtonRef = useRef<HTMLButtonElement>(null)
  const primaryClinicButtonRef = useRef<HTMLButtonElement>(null)

  const staffClinics = useMemo(() => {
    if (!isStaff) return []
    const clinics: ClinicName[] = []
    if (Array.isArray(authUser?.clinics)) {
      authUser?.clinics.forEach((item) => {
        if (typeof item === 'string') {
          clinics.push({ id: item, name: item })
          return
        }
        const id = item?.id || item?.clinicId
        const name = item?.name || item?.clinicName || id || ''
        if (id) clinics.push({ id, name })
      })
    } else if (authUser?.clinicId) {
      clinics.push({ id: authUser.clinicId, name: authUser.clinicName || authUser.clinicId })
    }
    return clinics
  }, [authUser, isStaff])

  useEffect(() => {
    if (isStaff) {
      setAvailableClinics(staffClinics)
      return
    }
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
  }, [isStaff, staffClinics])

  useEffect(() => {
    if (isEditMode && id) {
      const fetchPatient = async () => {
        try {
          setIsLoading(true)
          const patient = await getPatientById(id)
          
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

          const formatDateTime = (dateString?: string) => {
            if (!dateString) return ''
            try {
              const date = new Date(dateString)
              const year = date.getFullYear()
              const month = String(date.getMonth() + 1).padStart(2, '0')
              const day = String(date.getDate()).padStart(2, '0')
              const hours = String(date.getHours()).padStart(2, '0')
              const minutes = String(date.getMinutes()).padStart(2, '0')
              return `${year}-${month}-${day}T${hours}:${minutes}`
            } catch {
              return ''
            }
          }

          setForm({
            firstName: patient.firstName || '',
            lastName: patient.lastName || '',
            fullName: patient.fullName || '',
            address: patient.address || '',
            profilePicUrl: patient.profilePicUrl !== undefined ? patient.profilePicUrl : '',
            consultationType: patient.consultationType || 'one-time',
            primaryClinic: patient.primaryClinic || '',
            clinics: patient.clinics || [],
            dob: formatDate(patient.dob),
            lastVisitAt: formatDateTime(patient.lastVisitAt) || formatDateTime(),
            age: patient.age?.toString() || '',
            visitCount: patient.visitCount?.toString() || '0',
            gender: patient.gender || 'unknown',
            phone: patient.phone || '',
            email: patient.email || '',
            tags: patient.tags || [],
            currentTag: '',
            isActive: patient.isActive ?? true,
          })
        } catch (error: any) {
          const errorMessage =
            error?.response?.data?.error?.message ||
            error?.response?.data?.message ||
            error?.message ||
            'Unable to fetch patient details. Please try again.'
          toast.error(errorMessage)
          navigate('/patients')
        } finally {
          setIsLoading(false)
        }
      }
      fetchPatient()
    }
  }, [isEditMode, id, navigate])

  useEffect(() => {
    if (pendingImage) {
      const preview = URL.createObjectURL(pendingImage)
      setPendingImagePreview(preview)
      return () => URL.revokeObjectURL(preview)
    } else {
      setPendingImagePreview(null)
    }
  }, [pendingImage])

  useEffect(() => {
    if (isEditMode) return
    if (availableClinics.length === 1 && !form.primaryClinic) {
      setForm((prev) => ({ ...prev, primaryClinic: availableClinics[0].id }))
    }
  }, [availableClinics, form.primaryClinic, isEditMode])

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

  const removeProfilePhoto = () => {
    if (pendingImage || pendingImagePreview) {
      removePendingImage()
    } else if (form.profilePicUrl) {
      setForm((prev) => ({ ...prev, profilePicUrl: null }))
    }
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
  }

  const genderOptions: Array<{ value: string; label: string }> = [
    { value: 'unknown', label: 'Unknown' },
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' },
    { value: 'other', label: 'Other' },
  ]

  const consultationTypeOptions: Array<{ value: string; label: string }> = [
    { value: 'one-time', label: 'One-time' },
    { value: 'treatment-plan', label: 'Treatment Plan' },
  ]

  const primaryClinicOptions: Array<{ value: string; label: string }> = [
    { value: '', label: 'Select primary clinic' },
    ...availableClinics.map((clinic) => ({ value: clinic.id, label: clinic.name })),
  ]

  const handleFileInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    handleImageUpload(file || null)
    event.target.value = ''
  }

  const handleSaveClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
    setShowConfirmModal(true)
  }

  const handleConfirmSubmit = () => {
    setShowConfirmModal(false)
    performSubmit()
  }

  const performSubmit = async () => {
    if (!form.firstName.trim()) {
      toast.error('First name is required.')
      return
    }

    if (!form.primaryClinic.trim()) {
      toast.error('Primary clinic is required.')
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

    if (form.profilePicUrl && form.profilePicUrl.trim() && !validateUrl(form.profilePicUrl)) {
      toast.error('Please enter a valid profile picture URL.')
      return
    }

    setIsSubmitting(true)
    setIsUploadingImage(true)

    try {
      let profilePicUrl: string | null = form.profilePicUrl ? form.profilePicUrl.trim() : null

      if (pendingImage) {
        const { publicUrl } = await CloudStorageService.uploadImage('Patient-profile', pendingImage)
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
        profilePicUrl: profilePicUrl === null ? null : (profilePicUrl || undefined),
        consultationType: form.consultationType as 'one-time' | 'treatment-plan',
        primaryClinic: form.primaryClinic.trim(),
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

      if (isEditMode && id) {
        await updatePatient(id, payload)
        toast.success('Patient updated successfully.')
        setTimeout(() => navigate(`/patients/${id}`), 800)
      } else {
        const patient = await createPatient(payload)
        toast.success('Patient created successfully.')
        setTimeout(() => navigate(`/patients/${patient.id}`), 800)
      }
    } catch (error: any) {
      setIsUploadingImage(false)
      const errorMessage =
        error?.response?.data?.error?.message ||
        error?.response?.data?.message ||
        error?.message ||
        (isEditMode ? 'Unable to update patient. Please try again.' : 'Unable to create patient. Please try again.')

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
    isLoading,
    isEditMode,
    isUploadingImage,
    pendingImagePreview,
    showCamera,
    availableClinics,
    genderDropdownOpen,
    setGenderDropdownOpen,
    primaryClinicDropdownOpen,
    setPrimaryClinicDropdownOpen,
    showConfirmModal,
    setShowConfirmModal,
    genderButtonRef,
    primaryClinicButtonRef,
    genderOptions,
    consultationTypeOptions,
    primaryClinicOptions,
    isStaff,
    staffHasMultipleClinics: isStaff && availableClinics.length > 1,
    staffSingleClinic: isStaff && availableClinics.length === 1 ? availableClinics[0] : null,
    validateEmail,
    validatePhone,
    validateUrl,
    handleFieldChange,
    handleImageUpload,
    handleFileInputChange,
    handleCameraCapture,
    removePendingImage,
    removeProfilePhoto,
    addTag,
    removeTag,
    toggleClinic,
    submitForm,
    performSubmit,
    handleSaveClick,
    handleConfirmSubmit,
    setShowCamera,
  }
}

