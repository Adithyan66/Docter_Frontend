import { type ReactNode, useRef, useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import CameraCapture from '@components/common/CameraCapture'
import ConfirmationModal from '@components/common/ConfirmationModal'
import PageHeader from '@components/common/PageHeader'
import { useAddPatient } from '@hooks/data/useAddPatient'
import { PlusIcon } from '@assets/Icons'
import addPatient from '@assets/addPatient.png'
import noprofile from '@assets/noprofile.png'
import { useClickOutside } from '@hooks/utils/useClickOutside'
import RotatingSpinner from '@components/spinner/TeethRotating'
const SectionCard = ({ title, children }: { title: string; children: ReactNode }) => (
  <div className="flex flex-col gap-5 rounded-md bg-white/60 p-6 backdrop-blur-sm transition-shadow hover:shadow-md dark:bg-slate-900">
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

type FormDropdownProps = {
  label: string
  value: string
  options: Array<{ value: string; label: string }>
  onChange: (value: string) => void
  isOpen: boolean
  onToggle: () => void
  onClose: () => void
  buttonRef: React.RefObject<HTMLButtonElement | null>
  showLabel?: boolean
  disabled?: boolean
}

function FormDropdown({
  label,
  value,
  options,
  onChange,
  isOpen,
  onToggle,
  onClose,
  buttonRef,
  showLabel = true,
  disabled = false,
}: FormDropdownProps) {
  const dropdownRef = useRef<HTMLDivElement>(null)
  const [position, setPosition] = useState({ top: 0, left: 0, width: 0 })

  useClickOutside({
    isEnabled: isOpen,
    refs: [dropdownRef, buttonRef],
    handler: onClose,
  })

  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect()
      setPosition({
        top: rect.bottom + window.scrollY + 4,
        left: rect.left + window.scrollX,
        width: rect.width,
      })
    }
  }, [isOpen, buttonRef])

  const selectedOption = options.find((opt) => opt.value === value)
  const displayText = selectedOption ? selectedOption.label : options[0]?.label || label

  const dropdownContent = isOpen ? (
    <div
      ref={dropdownRef}
      className="fixed z-[100] w-48 rounded-lg border border-slate-300 bg-white shadow-lg dark:border-slate-700 dark:bg-slate-800"
      style={{ top: position.top, left: position.left }}
    >
      <div className="max-h-60 overflow-y-auto p-1">
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => {
              onChange(option.value)
              onClose()
            }}
            className={`w-full rounded-md px-3 py-2 text-left text-sm transition-colors ${
              value === option.value
                ? 'bg-blue-100 text-blue-900 dark:bg-blue-900/30 dark:text-blue-200'
                : 'text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  ) : null

  return (
    <div>
      {showLabel && <label className={labelStyles}>{label}</label>}
      <div className="relative">
        <button
          ref={buttonRef}
          type="button"
          onClick={onToggle}
          disabled={disabled}
          className={`w-full flex items-center justify-between gap-2 bg-transparent border-0 border-b-2 border-slate-200 px-0 py-2.5 text-sm text-slate-900 outline-none transition-colors focus:border-blue-500 dark:border-slate-700 dark:text-slate-100 dark:focus:border-blue-400 ${
            value ? 'border-blue-500 dark:border-blue-400' : ''
          } ${disabled ? 'cursor-not-allowed opacity-60' : ''}`}
        >
          <span className="text-left truncate">{displayText}</span>
          <svg
            className={`h-4 w-4 flex-shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {typeof document !== 'undefined' && createPortal(dropdownContent, document.body)}
      </div>
    </div>
  )
}

export default function AddPatients() {
  const navigate = useNavigate()
  const {
    form,
    isSubmitting,
    isLoading,
    isEditMode,
    pendingImagePreview,
    showCamera,
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
    staffHasMultipleClinics,
    staffSingleClinic,
    validateEmail,
    validatePhone,
    handleFieldChange,
    handleFileInputChange,
    handleCameraCapture,
    removeProfilePhoto,
    addTag,
    removeTag,
    handleSaveClick,
    handleConfirmSubmit,
    setShowCamera,
  } = useAddPatient()

  const headerActionButtons = isStaff
    ? [
        {
          label: 'Add Treatment',
          onClick: () => undefined,
          icon: <PlusIcon />,
          className:
            'pointer-events-none invisible inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-purple-100 to-purple-200 px-4 py-2 text-sm font-medium text-slate-700 dark:from-purple-800/30 dark:to-purple-700/30',
          disabled: true,
        },
        {
          label: 'Add Clinic',
          onClick: () => undefined,
          icon: <PlusIcon />,
          className:
            'pointer-events-none invisible inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-orange-100 to-orange-200 px-4 py-2 text-sm font-medium text-slate-700 dark:from-orange-800/30 dark:to-orange-700/30',
          disabled: true,
        },
      ]
    : [
        {
          label: 'Add Treatment',
          onClick: () => navigate('/treatments/add'),
          icon: <PlusIcon />,
          className:
            'inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-purple-100 to-purple-200 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:cursor-pointer hover:from-purple-200 hover:to-purple-300 dark:from-purple-800/30 dark:to-purple-700/30 dark:text-slate-200 dark:hover:from-purple-700/40 dark:hover:to-purple-600/40',
        },
        {
          label: 'Add Clinic',
          onClick: () => navigate('/clinics/add'),
          icon: <PlusIcon />,
          className:
            'inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-orange-100 to-orange-200 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:cursor-pointer hover:from-orange-200 hover:to-orange-300 dark:from-orange-800/30 dark:to-orange-700/30 dark:text-slate-200 dark:hover:from-orange-700/40 dark:hover:to-orange-600/40',
        },
      ]

  if (isLoading) {
    return <RotatingSpinner/>
  }

  return (
    <section className="space-y-6">
      {showCamera && (
        <CameraCapture
          onCapture={handleCameraCapture}
          onClose={() => setShowCamera(false)}
        />
      )}
      <PageHeader
        title={isEditMode ? 'Edit Patient' : 'Add Patient'}
        description={
          isEditMode
            ? 'Update patient information and consultation details.'
            : 'Add a new patient with their personal information and consultation details.'
        }
        image={{
          src: addPatient,
          alt: 'teeth',
          className: 'w-[120px] h-[120px]',
        }}
        actionButtons={headerActionButtons}
      />
      <form
        id="add-patient-form"
        onSubmit={(e) => {
          e.preventDefault()
          handleSaveClick(e as any)
        }}
        className="space-y-8"
      >
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <SectionCard title="Profile Picture & Basic Information">
            <div className="space-y-6">
              <div className="flex flex-col gap-4 md:flex-row md:items-start">
                <div className="flex-shrink-0">
                  <div className="relative aspect-square w-full max-w-[200px] overflow-hidden rounded-lg bg-slate-100 dark:bg-slate-800">
                    {pendingImagePreview || (form.profilePicUrl && form.profilePicUrl !== null) ? (
                      <>
                        <img
                          src={pendingImagePreview || (form.profilePicUrl ?? '')}
                          alt="Profile preview"
                          className="h-full w-full object-cover"
                        />
                        {pendingImagePreview && (
                          <div className="absolute inset-0 flex items-center justify-center bg-slate-900/40">
                            <span className="rounded-full bg-yellow-500 px-2 py-1 text-xs font-semibold text-white">
                              Pending
                            </span>
                          </div>
                        )}
                        <button
                          type="button"
                          className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-white/95 text-xs font-semibold text-slate-700 shadow-md transition-all hover:bg-red-50 hover:text-red-600 dark:bg-slate-900/95 dark:text-slate-200 dark:hover:bg-red-900/30 dark:hover:text-red-400"
                          onClick={removeProfilePhoto}
                        >
                          ×
                        </button>
                      </>
                    ) : (
                      <img
                        src={noprofile}
                        alt="No profile"
                        className="h-full w-full object-cover"
                      />
                    )}
                  </div>
                </div>
                <div className="flex-1 flex flex-col gap-3">
                  <label
                    htmlFor="profile-image"
                    className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border-2 border-dashed border-slate-300 bg-slate-50/50 px-4 py-3 text-sm font-medium text-slate-600 transition-all hover:border-blue-400 hover:bg-blue-50/50 dark:border-slate-700 dark:bg-slate-800/30 dark:text-slate-300 dark:hover:border-blue-500 dark:hover:bg-blue-900/20"
                  >
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
                    Upload Image
                  </label>
                  <input
                    id="profile-image"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileInputChange}
                    disabled={isSubmitting}
                  />
                  <button
                    type="button"
                    onClick={() => setShowCamera(true)}
                    className="flex items-center justify-center gap-2 rounded-lg border-2 border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-600 transition-all hover:border-blue-400 hover:bg-blue-50/50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-blue-500 dark:hover:bg-blue-900/20"
                  >
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
                        d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    Capture from Camera
                  </button>
                </div>
              </div>
              <div className="space-y-5 border-t border-slate-200 pt-5 dark:border-slate-700">
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                  <div>
                    <label className={labelStyles}>
                      First Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      className={inputStyles}
                      value={form.firstName}
                      onChange={(event) => handleFieldChange('firstName', event.target.value)}
                      placeholder="Enter first name"
                      required
                    />
                  </div>
                  <div>
                    <label className={labelStyles}>Last Name</label>
                    <input
                      type="text"
                      className={inputStyles}
                      value={form.lastName}
                      onChange={(event) => handleFieldChange('lastName', event.target.value)}
                      placeholder="Enter last name"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                  <div>
                    <label className={labelStyles}>Address</label>
                    <textarea
                      className={`${textareaStyles} min-h-[80px]`}
                      value={form.address}
                      onChange={(event) => handleFieldChange('address', event.target.value)}
                      placeholder="Enter address"
                    />
                  </div>
                  <FormDropdown
                    label="Gender"
                    value={form.gender}
                    options={genderOptions}
                    onChange={(value) => handleFieldChange('gender', value)}
                    isOpen={genderDropdownOpen}
                    onToggle={() => setGenderDropdownOpen(!genderDropdownOpen)}
                    onClose={() => setGenderDropdownOpen(false)}
                    buttonRef={genderButtonRef}
                  />
                </div>
              </div>
              <div className="space-y-5 border-t border-slate-200 pt-5 dark:border-slate-700">
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                  <div>
                    <label className={labelStyles}>Date of Birth</label>
                    <input
                      type="date"
                      className={inputStyles}
                      value={form.dob}
                      onChange={(event) => handleFieldChange('dob', event.target.value)}
                      max={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                  <div>
                    <label className={labelStyles}>Age</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      className={`${inputStyles} ${form.dob ? 'cursor-not-allowed opacity-60' : ''}`}
                      value={form.age}
                      onChange={(event) => handleFieldChange('age', event.target.value)}
                      placeholder="Auto-calculated if DOB provided"
                      disabled={!!form.dob}
                      readOnly={!!form.dob}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                  <div>
                    <label className={labelStyles}>Phone</label>
                    <input
                      type="tel"
                      className={`${inputStyles} ${
                        form.phone.trim() && !validatePhone(form.phone)
                          ? 'border-red-500 focus:border-red-500 dark:border-red-500'
                          : ''
                      }`}
                      value={form.phone}
                      onChange={(event) => handleFieldChange('phone', event.target.value)}
                      placeholder="+1234567890 (7-15 digits)"
                    />
                    {form.phone.trim() && !validatePhone(form.phone) && (
                      <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                        Phone must be 7-15 digits (optional + prefix)
                      </p>
                    )}
                  </div>
                  <div>
                    <label className={labelStyles}>Email</label>
                    <input
                      type="email"
                      className={`${inputStyles} ${
                        form.email.trim() && !validateEmail(form.email)
                          ? 'border-red-500 focus:border-red-500 dark:border-red-500'
                          : ''
                      }`}
                      value={form.email}
                      onChange={(event) => handleFieldChange('email', event.target.value)}
                      placeholder="email@example.com"
                    />
                    {form.email.trim() && !validateEmail(form.email) && (
                      <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                        Please enter a valid email address
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </SectionCard>

          <SectionCard title="Consultation Details">
            <div className="space-y-6">
              <div className="space-y-5">
                <div>
                  <label className={labelStyles}>Consultation Type*</label>
                  <div className="flex flex-wrap gap-3 pt-2">
                    {consultationTypeOptions.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => handleFieldChange('consultationType', option.value)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                          form.consultationType === option.value
                            ? 'bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                  <div>
                    <label className={labelStyles}>
                      Primary Clinic <span className="text-red-500">*</span>
                    </label>
                    {isStaff && !staffHasMultipleClinics && staffSingleClinic ? (
                      <div className={`${inputStyles} cursor-not-allowed opacity-70`}>
                        {staffSingleClinic.name}
                      </div>
                    ) : (
                      <FormDropdown
                        label="Select primary clinic"
                        value={form.primaryClinic}
                        options={primaryClinicOptions}
                        onChange={(value) => handleFieldChange('primaryClinic', value)}
                        isOpen={primaryClinicDropdownOpen}
                        onToggle={() => setPrimaryClinicDropdownOpen(!primaryClinicDropdownOpen)}
                        onClose={() => setPrimaryClinicDropdownOpen(false)}
                        buttonRef={primaryClinicButtonRef}
                        showLabel={false}
                        disabled={isEditMode}
                      />
                    )}
                  </div>
                  <div>
                    <label className={labelStyles}>Last Visit Date</label>
                    <input
                      type="datetime-local"
                      className={inputStyles}
                      value={form.lastVisitAt}
                      onChange={(event) => handleFieldChange('lastVisitAt', event.target.value)}
                    />
                  </div>
                </div>
              </div>
              <div className="space-y-4 border-t border-slate-200 pt-5 dark:border-slate-700">
                <div className="flex gap-3">
                  <input
                    type="text"
                    className={`${inputStyles} flex-1`}
                    placeholder="Enter a tag..."
                    value={form.currentTag}
                    onChange={(event) => handleFieldChange('currentTag', event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') {
                        event.preventDefault()
                        addTag()
                      }
                    }}
                  />
                  <button
                    type="button"
                    className="mt-1 h-fit rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition-all hover:bg-blue-500 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50 dark:bg-blue-500 dark:hover:bg-blue-400"
                    onClick={addTag}
                    disabled={!form.currentTag.trim()}
                  >
                    Add
                  </button>
                </div>
                {form.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-2">
                    {form.tags.map((tag, index) => (
                      <span
                        key={`${tag}-${index}`}
                        className="group flex items-center gap-2 rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700 dark:bg-blue-900/40 dark:text-blue-200"
                      >
                        {tag}
                        <button
                          type="button"
                          className="text-blue-700 opacity-0 transition-opacity hover:text-blue-900 group-hover:opacity-100 dark:text-blue-200 dark:hover:text-blue-100"
                          onClick={() => removeTag(index)}
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex justify-end border-t border-slate-200 pt-5 dark:border-slate-700">
                <button
                  type="button"
                  onClick={handleSaveClick}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-green-100 to-green-200 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:cursor-pointer hover:from-green-200 hover:to-green-300 disabled:cursor-not-allowed disabled:opacity-60 dark:from-green-800/30 dark:to-green-700/30 dark:text-slate-200 dark:hover:from-green-700/40 dark:hover:to-green-600/40"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-700 border-t-transparent dark:border-slate-200"></span>
                      {isEditMode ? 'Updating...' : 'Saving...'}
                    </>
                  ) : (
                    <>
                      <PlusIcon />
                      {isEditMode ? 'Update Patient' : 'Save Patient'}
                    </>
                  )}
                </button>
              </div>
            </div>
          </SectionCard>
        </div>
      </form>

      <ConfirmationModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={handleConfirmSubmit}
        title={isEditMode ? 'Confirm Patient Update' : 'Confirm Patient Creation'}
        message={isEditMode 
          ? 'Are you sure you want to update this patient? Please review all changes before confirming.'
          : 'Are you sure you want to save this patient? Please review all information before confirming.'}
        confirmText={isEditMode ? 'Update Patient' : 'Save Patient'}
        cancelText="Cancel"
        confirmButtonClassName="bg-green-600 hover:bg-green-500 dark:bg-green-500 dark:hover:bg-green-400"
      />
    </section>
  )
}
